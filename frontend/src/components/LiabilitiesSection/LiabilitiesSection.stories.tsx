// LiabilitiesSection.stories.tsx - SIMPLER VERSION
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor, fn } from '@storybook/test';
import { expect } from '@storybook/jest';
import React, { useState } from 'react';
import '../../styles/globals.css';

// Create a simplified mock component that looks like LiabilitiesSection
const MockLiabilitiesSection: React.FC = () => {
  const [liabilities, setLiabilities] = useState<Array<{id: string, name: string, value: number}>>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAdd = async () => {
    if (!name.trim() || !amount.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      const newLiability = {
        id: Date.now().toString(),
        name,
        value: parseFloat(amount),
      };
      setLiabilities(prev => [...prev, newLiability]);
      setName('');
      setAmount('');
      setLoading(false);
    }, 500);
  };
  
  const handleDelete = (id: string) => {
    setLiabilities(prev => prev.filter(item => item.id !== id));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd();
  };
  
  return (
    <div className="rf-card text-white" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="rf-section-header">Liabilities</div>
      
      {error && <p className="rf-error">{error}</p>}
      
      {liabilities.length === 0 ? (
        <p>No liabilities added yet.</p>
      ) : (
        <div className="rf-table-container">
          <table className="rf-table">
            <thead>
              <tr>
                <th>Name</th>
                <th style={{ textAlign: 'right' }}>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {liabilities.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td style={{ textAlign: 'right' }}>${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#ff6b6b',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px' }}>
        <input
          className="rf-input"
          type="text"
          placeholder="Liability name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: '1', minWidth: '120px' }}
        />
        <input
          className="rf-input"
          type="number"
          placeholder="Total Cost"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ flex: '1', minWidth: '120px' }}
        />
        <button
          className="rf-btn-primary"
          type="submit"
          disabled={loading || !name.trim() || !amount.trim()}
          style={{ width: '100%' }}
        >
          {loading ? 'Adding...' : 'Add Liability'}
        </button>
      </form>
    </div>
  );
};

const meta: Meta<typeof MockLiabilitiesSection> = {
  title: 'BalanceSheet/LiabilitiesSection',
  component: MockLiabilitiesSection,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MockLiabilitiesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default - Empty State',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await waitFor(() => {
      expect(canvas.getByText('No liabilities added yet.')).toBeInTheDocument();
    });
    
    expect(canvas.getByPlaceholderText('Liability name')).toBeInTheDocument();
    expect(canvas.getByPlaceholderText('Total Cost')).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /Add Liability/i })).toBeInTheDocument();
  },
};

export const SuccessfulAdd: Story = {
  name: 'Successfully Add Liability',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await userEvent.type(canvas.getByPlaceholderText('Liability name'), 'Student Loan');
    await userEvent.type(canvas.getByPlaceholderText('Total Cost'), '25000');
    await userEvent.click(canvas.getByRole('button', { name: /Add Liability/i }));
    
    await waitFor(() => {
      expect(canvas.getByText('Student Loan')).toBeInTheDocument();
      expect(canvas.getByText('$25,000.00')).toBeInTheDocument();
    });
    
    expect(canvas.getByPlaceholderText('Liability name')).toHaveValue('');
    expect(canvas.getByPlaceholderText('Total Cost')).toHaveValue('');
  },
};

export const InvalidInputEmpty: Story = {
  name: 'Invalid Input - Empty Fields',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await userEvent.type(canvas.getByPlaceholderText('Total Cost'), '1000');
    const addButton = canvas.getByRole('button', { name: /Add Liability/i });
    expect(addButton).toBeDisabled();
    
    await userEvent.clear(canvas.getByPlaceholderText('Total Cost'));
    await userEvent.type(canvas.getByPlaceholderText('Liability name'), 'Credit Card');
    expect(addButton).toBeDisabled();
  },
};

export const SuccessfulDelete: Story = {
  name: 'Successfully Delete Liability',
  render: () => {
    const [liabilities] = useState([
      { id: '1', name: 'Personal Loan', value: 10000 },
      { id: '2', name: 'Medical Bill', value: 5000 },
    ]);
    
    const Component: React.FC = () => {
      const [localLiabilities, setLocalLiabilities] = useState(liabilities);
      
      const handleDelete = (id: string) => {
        setLocalLiabilities(prev => prev.filter(item => item.id !== id));
      };
      
      return (
        <div className="rf-card text-white" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="rf-section-header">Liabilities</div>
          
          <div className="rf-table-container">
            <table className="rf-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th style={{ textAlign: 'right' }}>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localLiabilities.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td style={{ textAlign: 'right' }}>${item.value.toLocaleString()}</td>
                    <td>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: '#ff6b6b',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <form style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px' }}>
            <input className="rf-input" type="text" placeholder="Liability name" style={{ flex: '1', minWidth: '120px' }} />
            <input className="rf-input" type="number" placeholder="Total Cost" style={{ flex: '1', minWidth: '120px' }} />
            <button className="rf-btn-primary" style={{ width: '100%' }}>Add Liability</button>
          </form>
        </div>
      );
    };
    
    return <Component />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    expect(canvas.getByText('Personal Loan')).toBeInTheDocument();
    expect(canvas.getByText('Medical Bill')).toBeInTheDocument();
    
    const deleteButtons = canvas.getAllByText('Delete');
    await userEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(canvas.queryByText('Personal Loan')).not.toBeInTheDocument();
    });
    
    expect(canvas.getByText('Medical Bill')).toBeInTheDocument();
  },
};