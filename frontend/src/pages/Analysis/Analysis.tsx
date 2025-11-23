import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import { analysisAPI } from '../../utils/api';
import { formatCurrency as formatCurrencyValue } from '../../utils/currency.utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

type SnapshotData = {
  date: string;
  balanceSheet: {
    totalCashBalance: number;
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  };
  cashflow: {
    earnedIncome: number;
    passiveIncome: number;
    portfolioIncome: number;
    totalIncome: number;
    totalExpenses: number;
    netCashflow: number;
    direction: string;
  };
  ratios: {
    passiveCoverageRatio: string;
    savingsRate: string;
  };
  incomeQuadrant: {
    EMPLOYEE: number;
    SELF_EMPLOYED: number;
    BUSINESS_OWNER: number;
    INVESTOR: number;
  };
  financialHealth: {
    runway: number;
    freedomDate: string | null;
    assetEfficiency: number;
    trends: {
      netWorth: number;
      cashflow: number;
    };
  };
  currency: { symbol: string; name: string };
};

type SavedSnapshot = {
  id: string;
  date: string;
  data: SnapshotData;
};


const QUADRANT_COLORS = {
  EMPLOYEE: '#60a5fa', // Blue
  SELF_EMPLOYED: '#c084fc', // Purple
  BUSINESS_OWNER: '#fbbf24', // Gold
  INVESTOR: '#4ade80' // Green
};

const StatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  trend?: number;
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  accentColor?: 'gold' | 'purple' | 'default';
}> = ({ title, value, subValue, trend, className = '', icon, children, accentColor = 'default' }) => {
  const borderColor = accentColor === 'gold' ? 'group-hover:border-[#FFD700]/30' : 
                      accentColor === 'purple' ? 'group-hover:border-[#800080]/30' : 
                      'group-hover:border-white/10';
  
  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/5 p-6 transition-all duration-300 hover:bg-zinc-900/70 ${borderColor} ${className}`}>
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
          {icon && <div className="text-zinc-500 group-hover:text-white transition-colors">{icon}</div>}
        </div>
        
        <div className="mt-auto">
          <div className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {value}
            {trend !== undefined && trend !== null && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subValue && <div className="mt-1 text-sm text-zinc-500">{subValue}</div>}
        </div>
        {children}
      </div>
    </div>
  );
};

const Analysis: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [snapshotData, setSnapshotData] = useState<SnapshotData | null>(null);

  // Historical currency formatter
  const formatHistorical = React.useCallback(
    (value: number, currency: { symbol: string; name: string }) => {
      return formatCurrencyValue(value, {
        cur_symbol: currency.symbol,
        cur_name: currency.name
      } as any);
    },
    []
  );

  const fetchSnapshot = async (date?: string) => {
    try {
      setLoading(true);
      const data = await analysisAPI.getFinancialSnapshot(date);
      setSnapshotData(data);
      if (!date) setSelectedDate('');
    } catch (error) {
      console.error('Failed to fetch snapshot:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSnapshot(selectedDate);
    }
  }, [selectedDate]);

  const quadrantData = useMemo(() => {
    if (!snapshotData) return [];
    const { incomeQuadrant } = snapshotData;
    return [
      { name: 'Employee', value: incomeQuadrant.EMPLOYEE, color: QUADRANT_COLORS.EMPLOYEE },
      { name: 'Self-Employed', value: incomeQuadrant.SELF_EMPLOYED, color: QUADRANT_COLORS.SELF_EMPLOYED },
      { name: 'Business Owner', value: incomeQuadrant.BUSINESS_OWNER, color: QUADRANT_COLORS.BUSINESS_OWNER },
      { name: 'Investor', value: incomeQuadrant.INVESTOR, color: QUADRANT_COLORS.INVESTOR },
    ].filter(item => item.value > 0);
  }, [snapshotData]);

  const timelineController = (
    <div className="flex items-center gap-3 bg-zinc-900/80 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
      <span className="text-zinc-400 text-xs uppercase tracking-wider font-medium">Time Machine</span>
      <div className="h-4 w-px bg-white/10" />
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        max={new Date().toISOString().split('T')[0]}
        className="bg-transparent border-none text-white text-sm focus:ring-0 p-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
      />
      {selectedDate && (
        <button
          onClick={() => { setSelectedDate(''); fetchSnapshot(); }}
          className="ml-2 text-xs text-[#FFD700] hover:text-[#FFD700]/80 transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );

  if (loading && !snapshotData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="animate-pulse text-[#FFD700]">Loading Financial Data...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans selection:bg-[#FFD700]/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#800080]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#FFD700]/10 rounded-full blur-[120px] pointer-events-none" />

        <Header title="Analysis" hideActions rightContent={timelineController} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {snapshotData && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
              
              {/* Hero: Net Worth */}
              <StatCard
                title="Net Worth"
                value={formatHistorical(snapshotData.balanceSheet.netWorth, snapshotData.currency)}
                trend={snapshotData.financialHealth.trends.netWorth}
                className="col-span-1 md:col-span-2 lg:col-span-2 min-h-[180px]"
                accentColor="gold"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                }
              >
                <div className="mt-4 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-[#FFD700] to-[#800080]" 
                    style={{ width: `${Math.min(Math.max((snapshotData.balanceSheet.netWorth / (snapshotData.balanceSheet.totalAssets || 1)) * 100, 5), 100)}%` }} 
                  />
                </div>
                <div className="mt-2 text-xs text-zinc-500 flex justify-between">
                  <span>Assets: {formatHistorical(snapshotData.balanceSheet.totalAssets, snapshotData.currency)}</span>
                  <span>Liabilities: {formatHistorical(snapshotData.balanceSheet.totalLiabilities, snapshotData.currency)}</span>
                </div>
              </StatCard>

              {/* Hero: Freedom Date */}
              <StatCard
                title="Financial Freedom"
                value={
                  snapshotData.financialHealth.freedomDate === 'Achieved' ? 
                  <span className="text-[#FFD700]">ACHIEVED</span> : 
                  (snapshotData.financialHealth.freedomDate || 'Not Projected')
                }
                subValue={
                  snapshotData.financialHealth.freedomDate !== 'Achieved' && snapshotData.financialHealth.freedomDate ? 
                  "Estimated date based on current trajectory" : "Keep building your assets"
                }
                className="col-span-1 md:col-span-2 lg:col-span-2 min-h-[180px]"
                accentColor="purple"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                }
              >
                 {/* Progress Bar / Gauge for "On Track" */}
                 <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${snapshotData.financialHealth.freedomDate ? 'bg-green-500' : 'bg-zinc-700'}`}
                        style={{ width: `${Math.min(parseFloat(snapshotData.ratios.passiveCoverageRatio), 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${snapshotData.financialHealth.freedomDate ? 'text-green-400' : 'text-zinc-600'}`}>
                      {snapshotData.financialHealth.freedomDate ? 'ON TRACK' : 'NEEDS DATA'}
                    </span>
                 </div>
              </StatCard>

              {/* Cashflow Section */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 grid grid-cols-2 gap-4">
                <StatCard
                  title="Total Income"
                  value={formatHistorical(snapshotData.cashflow.totalIncome, snapshotData.currency)}
                  className="col-span-2 md:col-span-1"
                />
                <StatCard
                  title="Total Expenses"
                  value={formatHistorical(snapshotData.cashflow.totalExpenses, snapshotData.currency)}
                  className="col-span-2 md:col-span-1"
                />
                <StatCard
                  title="Net Cashflow"
                  value={formatHistorical(snapshotData.cashflow.netCashflow, snapshotData.currency)}
                  trend={snapshotData.financialHealth.trends.cashflow}
                  className="col-span-2 bg-zinc-900/80"
                  accentColor={snapshotData.cashflow.netCashflow >= 0 ? 'gold' : 'default'}
                >
                   <div className="mt-2 text-xs text-zinc-500">
                      Savings Rate: <span className="text-white font-bold">{snapshotData.ratios.savingsRate}%</span>
                   </div>
                </StatCard>
              </div>

              {/* Income Quadrant Chart */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col">
                <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">Income Quadrant</h3>
                <div className="flex-1 min-h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={quadrantData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {quadrantData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => formatHistorical(value, snapshotData.currency)}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-xs text-zinc-500">Total</div>
                      <div className="text-sm font-bold text-white">
                        {formatHistorical(snapshotData.cashflow.totalIncome, snapshotData.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Health Metrics */}
              <StatCard
                title="Runway"
                value={`${snapshotData.financialHealth.runway >= 999 ? '∞' : snapshotData.financialHealth.runway} Months`}
                className="col-span-1"
              />
              <StatCard
                title="Asset Efficiency"
                value={`${snapshotData.financialHealth.assetEfficiency}%`}
                className="col-span-1"
              />
              <StatCard
                title="Passive Coverage"
                value={`${snapshotData.ratios.passiveCoverageRatio}%`}
                className="col-span-1"
              />
              <StatCard
                title="Passive Income"
                value={formatHistorical(snapshotData.cashflow.passiveIncome, snapshotData.currency)}
                className="col-span-1"
                accentColor="purple"
              />

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Analysis;

