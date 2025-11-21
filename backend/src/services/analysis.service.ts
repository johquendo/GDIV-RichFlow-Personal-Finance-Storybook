import prisma from '../config/database.config';

export const getFinancialSnapshot = async (userId: number, date?: string) => {
  const targetDate = date ? new Date(date) : new Date();
  
  // Get balance sheet data (current state)
  const balanceSheet = await prisma.balanceSheet.findFirst({
    where: { userId },
    include: {
      Asset: true,
      Liability: true
    }
  });

  // Get cash savings (current state)
  const cashSavings = await prisma.cashSavings.findFirst({
    where: { userId }
  });

  // Get income statement data (current state)
  const incomeStatement = await prisma.incomeStatement.findFirst({
    where: { userId },
    include: {
      Expense: true,
      IncomeLine: true
    }
  });

  // Calculate balance sheet totals
  const totalAssets = balanceSheet?.Asset.reduce((sum, asset) => sum + Number(asset.value), 0) || 0;
  const totalLiabilities = balanceSheet?.Liability.reduce((sum, liability) => sum + Number(liability.value), 0) || 0;
  const totalCashBalance = Number(cashSavings?.amount) || 0;
  const netWorth = totalAssets - totalLiabilities + totalCashBalance;

  // Income by type (case-insensitive matching)
  const earnedIncome = incomeStatement?.IncomeLine.filter(i => i.type.toUpperCase() === 'EARNED').reduce((sum, i) => sum + Number(i.amount), 0) || 0;
  const passiveIncome = incomeStatement?.IncomeLine.filter(i => i.type.toUpperCase() === 'PASSIVE').reduce((sum, i) => sum + Number(i.amount), 0) || 0;
  const portfolioIncome = incomeStatement?.IncomeLine.filter(i => i.type.toUpperCase() === 'PORTFOLIO').reduce((sum, i) => sum + Number(i.amount), 0) || 0;
  const totalIncome = earnedIncome + passiveIncome + portfolioIncome;

  const totalExpenses = incomeStatement?.Expense.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
  const netCashflow = totalIncome - totalExpenses;

  // Calculate ratios
  const passiveCoverageRatio = totalExpenses > 0 ? (passiveIncome / totalExpenses) * 100 : 0;
  const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;

  // Income quadrant distribution
  const incomeQuadrant = {
    EMPLOYEE: earnedIncome,
    SELF_EMPLOYED: 0, // Can be extended based on categorization
    BUSINESS_OWNER: portfolioIncome,
    INVESTOR: passiveIncome
  };

  return {
    date: targetDate.toISOString().substring(0, 10),
    balanceSheet: {
      totalCashBalance: Number(totalCashBalance),
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
    incomeQuadrant
  };
};
