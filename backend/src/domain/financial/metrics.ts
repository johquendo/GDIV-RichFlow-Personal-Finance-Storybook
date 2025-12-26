/**
 * Financial Metrics Calculation Functions
 * 
 * Pure functions for calculating financial health metrics,
 * Wealth Velocity, Freedom Gap, and snapshot generation.
 * No database interactions - only calculations.
 */

import { FinancialState } from './reducers.js';
import { createEmptyQuadrantTotals, determineIncomeQuadrant } from '../../utils/incomeQuadrant.utils.js';

/**
 * Financial health metrics structure
 */
export interface FinancialHealth {
    runway: number;
    freedomDate: string | null;
    assetEfficiency: number;
    trends: {
        netWorth: number;
        cashflow: number;
    };
}

/**
 * Calculate financial health metrics
 * 
 * Computes:
 * - Runway: months of expenses covered by cash
 * - Asset Efficiency: passive income as percentage of assets
 * - Trends: month-over-month changes in net worth and cashflow
 * - Freedom Date: projected date when passive income covers expenses
 */
export function calculateFinancialHealth(
    currentState: FinancialState,
    prevMonthState: FinancialState | null,
    sixMonthAgoState: FinancialState | null
): FinancialHealth {
    // Calculate totals for current state
    const currentTotalAssets = Array.from(currentState.assets.values()).reduce((sum, a) => sum + a.value, 0);
    const currentTotalLiabilities = Array.from(currentState.liabilities.values()).reduce((sum, l) => sum + l.value, 0);
    const currentCash = currentState.cashSavings;
    const currentNetWorth = currentTotalAssets - currentTotalLiabilities + currentCash;

    const currentIncomeLines = Array.from(currentState.incomeLines.values());
    const currentPassiveIncome = currentIncomeLines
        .filter(i => i.type.toUpperCase() === 'PASSIVE')
        .reduce((sum, i) => sum + i.amount, 0);
    const currentPortfolioIncome = currentIncomeLines
        .filter(i => i.type.toUpperCase() === 'PORTFOLIO')
        .reduce((sum, i) => sum + i.amount, 0);
    const currentTotalIncome = currentIncomeLines.reduce((sum, i) => sum + i.amount, 0);

    const currentExpenses = Array.from(currentState.expenses.values()).reduce((sum, e) => sum + e.amount, 0);
    const currentNetCashflow = currentTotalIncome - currentExpenses;

    // 1. Runway: (Cash + Liquid Assets) / Monthly Expenses
    const runway = currentExpenses > 0 ? currentCash / currentExpenses : (currentCash > 0 ? 999 : 0);

    // 2. Asset Efficiency: (Passive + Portfolio) / (Total Assets - Cash)
    // Note: In our state model, totalAssets excludes cash.
    const assetEfficiency = currentTotalAssets > 0
        ? ((currentPassiveIncome + currentPortfolioIncome) / currentTotalAssets) * 100
        : 0;

    // 3. Trends
    let netWorthTrend = 0;
    let cashflowTrend = 0;

    if (prevMonthState) {
        const prevAssets = Array.from(prevMonthState.assets.values()).reduce((sum, a) => sum + a.value, 0);
        const prevLiabilities = Array.from(prevMonthState.liabilities.values()).reduce((sum, l) => sum + l.value, 0);
        const prevCash = prevMonthState.cashSavings;
        const prevNetWorth = prevAssets - prevLiabilities + prevCash;

        const prevIncome = Array.from(prevMonthState.incomeLines.values()).reduce((sum, i) => sum + i.amount, 0);
        const prevExpenses = Array.from(prevMonthState.expenses.values()).reduce((sum, e) => sum + e.amount, 0);
        const prevNetCashflow = prevIncome - prevExpenses;

        if (prevNetWorth !== 0) {
            netWorthTrend = ((currentNetWorth - prevNetWorth) / Math.abs(prevNetWorth)) * 100;
        } else if (currentNetWorth !== 0) {
            netWorthTrend = currentNetWorth > 0 ? 100 : -100;
        }

        if (prevNetCashflow !== 0) {
            cashflowTrend = ((currentNetCashflow - prevNetCashflow) / Math.abs(prevNetCashflow)) * 100;
        } else if (currentNetCashflow !== 0) {
            cashflowTrend = currentNetCashflow > 0 ? 100 : -100;
        }
    }

    // 4. Freedom Date
    // Note: Combined passive + portfolio income is used for financial freedom calculations
    // since portfolio income (from investments) also generates money without active work
    const currentCombinedPassiveIncome = currentPassiveIncome + currentPortfolioIncome;
    let freedomDate: string | null = null;

    if (currentCombinedPassiveIncome >= currentExpenses) {
        freedomDate = "Achieved";
    } else if (currentCombinedPassiveIncome > 0) {
        // We have some passive/portfolio income, let's try to project
        if (sixMonthAgoState) {
            const sixMonthPassive = Array.from(sixMonthAgoState.incomeLines.values())
                .filter(i => i.type.toUpperCase() === 'PASSIVE')
                .reduce((sum, i) => sum + i.amount, 0);
            const sixMonthPortfolio = Array.from(sixMonthAgoState.incomeLines.values())
                .filter(i => i.type.toUpperCase() === 'PORTFOLIO')
                .reduce((sum, i) => sum + i.amount, 0);
            const sixMonthCombinedPassive = sixMonthPassive + sixMonthPortfolio;

            // Case 1: Growth from non-zero base (Compound Growth)
            if (sixMonthCombinedPassive > 0) {
                if (currentCombinedPassiveIncome > sixMonthCombinedPassive) {
                    // Calculate monthly growth rate (CAGR over 6 months)
                    const growthFactor = Math.pow(currentCombinedPassiveIncome / sixMonthCombinedPassive, 1 / 6);
                    const r = growthFactor - 1;

                    if (r > 0) {
                        const monthsToFreedom = Math.log(currentExpenses / currentCombinedPassiveIncome) / Math.log(1 + r);

                        if (monthsToFreedom > 0 && monthsToFreedom < 600) { // Cap at 50 years
                            const freedom = new Date();
                            freedom.setMonth(freedom.getMonth() + Math.round(monthsToFreedom));
                            freedomDate = freedom.toISOString().substring(0, 10);
                        } else {
                            freedomDate = "> 50 Years";
                        }
                    }
                } else {
                    freedomDate = "Stagnant/Declining";
                }
            }
            // Case 2: Growth from zero base (Linear Projection)
            else {
                // Assume linear growth over the last 6 months
                // Average monthly addition = current / 6
                const monthlyGrowthAmount = currentCombinedPassiveIncome / 6;
                const gapToCover = currentExpenses - currentCombinedPassiveIncome;

                if (monthlyGrowthAmount > 0) {
                    const monthsToFreedom = gapToCover / monthlyGrowthAmount;

                    if (monthsToFreedom > 0 && monthsToFreedom < 600) {
                        const freedom = new Date();
                        freedom.setMonth(freedom.getMonth() + Math.round(monthsToFreedom));
                        freedomDate = freedom.toISOString().substring(0, 10);
                    } else {
                        freedomDate = "> 50 Years";
                    }
                }
            }
        } else {
            freedomDate = "Insufficient Data";
        }
    } else {
        freedomDate = "No Passive Income";
    }

    return {
        runway: Number(runway.toFixed(1)),
        freedomDate,
        assetEfficiency: Number(assetEfficiency.toFixed(2)),
        trends: {
            netWorth: Number(netWorthTrend.toFixed(2)),
            cashflow: Number(cashflowTrend.toFixed(2))
        }
    };
}

/**
 * Calculate financial snapshot from reconstructed state
 * 
 * Generates a complete snapshot including:
 * - Balance sheet totals
 * - Cashflow breakdown by income type
 * - Financial ratios
 * - RichFlow metrics (Wealth Velocity, Solvency, Freedom Gap)
 * - Income quadrant distribution
 */
export function calculateSnapshotFromState(
    state: FinancialState,
    targetDate: Date,
    financialHealth: FinancialHealth,
    prevMonthState: FinancialState | null
) {
    // Calculate balance sheet totals
    const totalAssets = Array.from(state.assets.values()).reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = Array.from(state.liabilities.values()).reduce((sum, liability) => sum + liability.value, 0);
    const totalCashBalance = state.cashSavings;
    const netWorth = totalAssets - totalLiabilities + totalCashBalance;

    // Calculate income by type
    const incomeLines = Array.from(state.incomeLines.values());
    const earnedIncome = incomeLines
        .filter(i => i.type.toUpperCase() === 'EARNED')
        .reduce((sum, i) => sum + i.amount, 0);
    const passiveIncome = incomeLines
        .filter(i => i.type.toUpperCase() === 'PASSIVE')
        .reduce((sum, i) => sum + i.amount, 0);
    const portfolioIncome = incomeLines
        .filter(i => i.type.toUpperCase() === 'PORTFOLIO')
        .reduce((sum, i) => sum + i.amount, 0);
    const totalIncome = earnedIncome + passiveIncome + portfolioIncome;

    // Calculate expenses
    const totalExpenses = Array.from(state.expenses.values()).reduce((sum, expense) => sum + expense.amount, 0);
    const netCashflow = totalIncome - totalExpenses;

    // Combined passive income (passive + portfolio) for freedom calculations
    // Portfolio income from investments also generates money without active work
    const combinedPassiveIncome = passiveIncome + portfolioIncome;

    // Calculate ratios
    // Passive coverage now includes portfolio income since it also contributes to financial freedom
    const passiveCoverageRatio = totalExpenses > 0 ? (combinedPassiveIncome / totalExpenses) * 100 : 0;
    const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;

    // --- RichFlow Metrics ---

    // 1. Wealth Velocity (Net Worth Change vs Previous Month)
    let wealthVelocity = 0;
    let wealthVelocityPct = 0;

    if (prevMonthState) {
        const prevAssets = Array.from(prevMonthState.assets.values()).reduce((sum, a) => sum + a.value, 0);
        const prevLiabilities = Array.from(prevMonthState.liabilities.values()).reduce((sum, l) => sum + l.value, 0);
        const prevCash = prevMonthState.cashSavings;
        const prevNetWorth = prevAssets - prevLiabilities + prevCash;

        wealthVelocity = netWorth - prevNetWorth;
        if (prevNetWorth !== 0) {
            wealthVelocityPct = (wealthVelocity / Math.abs(prevNetWorth)) * 100;
        } else if (netWorth !== 0) {
            wealthVelocityPct = netWorth > 0 ? 100 : -100;
        }
    }

    // 2. Solvency Ratio (Liabilities / Assets)
    // Note: totalAssets in our state excludes cash, but for solvency we should include liquid assets (cash)
    const totalAssetsWithCash = totalAssets + totalCashBalance;
    const solvencyRatio = totalAssetsWithCash > 0 ? (totalLiabilities / totalAssetsWithCash) * 100 : 0;

    // 3. Freedom Gap (Expenses - Combined Passive Income)
    // Portfolio income is included since it also generates income without active work
    const freedomGap = totalExpenses - combinedPassiveIncome;

    // Income quadrant distribution
    const quadrantTotals = createEmptyQuadrantTotals();
    incomeLines.forEach(line => {
        const bucket = determineIncomeQuadrant(line.type, line.quadrant);
        quadrantTotals[bucket] += line.amount;
    });

    const qEmployee = Number(quadrantTotals.EMPLOYEE);
    const qSelf = Number(quadrantTotals.SELF_EMPLOYED);
    const qBus = Number(quadrantTotals.BUSINESS_OWNER);
    const qInv = Number(quadrantTotals.INVESTOR);

    const incomeQuadrantData = {
        EMPLOYEE: { amount: qEmployee, pct: totalIncome > 0 ? (qEmployee / totalIncome) * 100 : 0 },
        SELF_EMPLOYED: { amount: qSelf, pct: totalIncome > 0 ? (qSelf / totalIncome) * 100 : 0 },
        BUSINESS_OWNER: { amount: qBus, pct: totalIncome > 0 ? (qBus / totalIncome) * 100 : 0 },
        INVESTOR: { amount: qInv, pct: totalIncome > 0 ? (qInv / totalIncome) * 100 : 0 },
        total: totalIncome
    };

    return {
        date: targetDate.toISOString().substring(0, 10),
        currency: state.currency,
        balanceSheet: {
            totalCashBalance: Number(totalCashBalance),
            // Expose liquid cash separately for solvency analysis
            totalCash: Number(totalCashBalance),
            // Invested / illiquid assets (excludes cash)
            totalInvestedAssets: Number(totalAssets),
            totalAssets: Number(totalAssets),
            totalLiabilities: Number(totalLiabilities),
            netWorth: Number(netWorth)
        },
        cashflow: {
            earnedIncome: Number(earnedIncome),
            passiveIncome: Number(passiveIncome),
            portfolioIncome: Number(portfolioIncome),
            totalIncome: Number(totalIncome),
            totalExpenses: Number(totalExpenses),
            netCashflow: Number(netCashflow),
            direction: netCashflow >= 0 ? 'positive' : 'negative'
        },
        ratios: {
            passiveCoverageRatio: passiveCoverageRatio.toFixed(2),
            savingsRate: savingsRate.toFixed(2)
        },
        richFlowMetrics: {
            wealthVelocity: Number(wealthVelocity),
            wealthVelocityPct: Number(wealthVelocityPct.toFixed(2)),
            solvencyRatio: Number(solvencyRatio.toFixed(2)),
            freedomGap: Number(freedomGap)
        },
        // Income quadrant with amounts and percentage contribution
        incomeQuadrant: incomeQuadrantData,
        financialHealth
    };
}
