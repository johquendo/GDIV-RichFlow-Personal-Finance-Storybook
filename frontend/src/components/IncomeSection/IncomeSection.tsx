import React, { useState, useEffect } from "react";
import { incomeAPI } from "../../utils/api";
import "./IncomeSection.css";

interface IncomeItem {
  id: number;
  name: string;
  amount: number;
  type: 'Earned' | 'Portfolio' | 'Passive';
}

const IncomeSection: React.FC = () => {
  const [earnedIncome, setEarnedIncome] = useState<IncomeItem[]>([]);
  const [portfolioIncome, setPortfolioIncome] = useState<IncomeItem[]>([]);
  const [passiveIncome, setPassiveIncome] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch income data on component mount
  useEffect(() => {
    fetchIncomeData();
  }, []);

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await incomeAPI.getIncomeLines();
      
      // Ensure response is an array
      const incomeLines = Array.isArray(response) ? response : [];
      
      // Group income by type
      const earned = incomeLines.filter(item => item.type === 'Earned');
      const portfolio = incomeLines.filter(item => item.type === 'Portfolio');
      const passive = incomeLines.filter(item => item.type === 'Passive');
      
      setEarnedIncome(earned);
      setPortfolioIncome(portfolio);
      setPassiveIncome(passive);
    } catch (err: any) {
      console.error('Error fetching income:', err);
      setError('Failed to load income data');
    } finally {
      setLoading(false);
    }
  };

  // handle add income
  const handleAddIncome = async (
    section: "earned" | "portfolio" | "passive",
    name: string,
    amount: string
  ) => {
    if (!name.trim() || !amount.trim()) return;
    
    try {
      setError(null);
      const type = section.charAt(0).toUpperCase() + section.slice(1) as 'Earned' | 'Portfolio' | 'Passive';
      const response = await incomeAPI.addIncomeLine(name, parseFloat(amount), type);
      
      const newItem: IncomeItem = {
        ...response,
        type
      };

      if (section === "earned") setEarnedIncome([...earnedIncome, newItem]);
      if (section === "portfolio") setPortfolioIncome([...portfolioIncome, newItem]);
      if (section === "passive") setPassiveIncome([...passiveIncome, newItem]);
    } catch (err: any) {
      console.error('Error adding income:', err);
      setError('Failed to add income');
    }
  };

  // handle delete income
  const handleDelete = async (section: "earned" | "portfolio" | "passive", id: number) => {
    try {
      setError(null);
      await incomeAPI.deleteIncomeLine(id);
      
      if (section === "earned") setEarnedIncome(earnedIncome.filter((i) => i.id !== id));
      if (section === "portfolio") setPortfolioIncome(portfolioIncome.filter((i) => i.id !== id));
      if (section === "passive") setPassiveIncome(passiveIncome.filter((i) => i.id !== id));
    } catch (err: any) {
      console.error('Error deleting income:', err);
      setError('Failed to delete income');
    }
  };

  // reusable income card
  const IncomeCard = ({
    title,
    items,
    section,
  }: {
    title: string;
    items: IncomeItem[];
    section: "earned" | "portfolio" | "passive";
  }) => {
    const [source, setSource] = useState("");
    const [amount, setAmount] = useState("");

    return (
      <div className="income-card">
        <div className="income-card-header">{title}</div>

        {items.length === 0 ? (
          <p className="income-empty">No {title.toLowerCase()} added yet.</p>
        ) : (
          <div className="income-list">
            {items.map((item) => (
              <div key={item.id} className="income-item">
                <span>{item.name}</span>
                <span>${item.amount}</span>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(section, item.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="income-inputs">
          <input
            type="text"
            placeholder="Source name"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button
          className="add-btn"
          onClick={() => {
            handleAddIncome(section, source, amount);
            setSource("");
            setAmount("");
          }}
        >
          + Add {title}
        </button>
      </div>
    );
  };

  return (
    <div className="income-container">
      <div className="income-header">Income</div>

      <div className="income-sections">
        <IncomeCard title="Earned Income" items={earnedIncome} section="earned" />
        <IncomeCard title="Portfolio Income" items={portfolioIncome} section="portfolio" />
        <IncomeCard title="Passive Income" items={passiveIncome} section="passive" />
      </div>
    </div>
  );
};

export default IncomeSection;
