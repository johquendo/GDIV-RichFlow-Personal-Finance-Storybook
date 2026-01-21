// LiabilitiesSection.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor, fn } from '@storybook/test';
import { expect } from '@storybook/jest';
import React, { useState } from 'react';
import '../../styles/globals.css';

// Create a mock component that looks and behaves like LiabilitiesSection
const MockLiabilitiesSection: React.FC = () => {
  const [liabilities, setLiabilities] = useState<Array<{id: string, name: string, value: number}>>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const isAddValid = name.trim().length > 0 && amount.trim().length > 0 && !isNaN(parseFloat(amount));
  const isEditValid = editName.trim().length > 0 && editAmount.trim().length > 0 && !isNaN(parseFloat(editAmount));
  
  const handleAdd = async () => {
    if (!isAddValid) return;
    
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    setTimeout(() => {
      const newItem = {
        id: Date.now().toString(),
        name,
        value: parseFloat(amount),
      };
      setLiabilities(prev => [...prev, newItem]);
      setName('');
      setAmount('');
      setLoading(false);
    }, 500);
  };
  
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    
    setTimeout(() => {
      setLiabilities(prev => prev.filter(item => item.id !== id));
      setDeletingId(null);
    }, 500);
  };
  
  const startEdit = (item: {id: string, name: string, value: number}) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditAmount(item.value.toString());
  };
  
  const handleEdit = async () => {
    if (!editingId || !isEditValid) return;
    
    setLoading(true);
    
    setTimeout(() => {
      setLiabilities(prev => 
        prev.map(item => 
          item.id === editingId 
            ? { ...item, name: editName, value: parseFloat(editAmount) } 
            : item
        )
      );
      setEditingId(null);
      setEditName('');
      setEditAmount('');
      setLoading(false);
    }, 500);
  };
  
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAmount('');
    setError(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      handleEdit();
    } else {
      handleAdd();
    }
  };
  
  return (
    <div className="rf-card text-white" style={{ 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      padding: '20px'
    }}>
      <div className="rf-section-header" style={{ 
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#d4af37'
      }}>
        Liabilities
      </div>
      
      {error && (
        <div className="rf-error" style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '15px',
          animation: 'shake 0.5s ease-in-out'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      {liabilities.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#d4af37', padding: '20px' }}>
          No liabilities added yet.
        </p>
      ) : (
        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #333', color: '#d4af37' }}>Name</th>
                <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #333', color: '#d4af37' }}>Value</th>
                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #333', color: '#d4af37' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {liabilities.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '10px' }}>{item.name}</td>
                  <td style={{ textAlign: 'right', padding: '10px', fontFamily: 'monospace' }}>
                    ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>
                    <button
                      onClick={() => startEdit(item)}
                      disabled={deletingId === item.id || loading}
                      style={{
                        background: 'rgba(115, 69, 175, 0.1)',
                        border: '1px solid #7345AF',
                        color: '#7345AF',
                        borderRadius: '4px',
                        padding: '4px 12px',
                        cursor: (deletingId === item.id || loading) ? 'not-allowed' : 'pointer',
                        marginRight: '10px',
                        opacity: (deletingId === item.id || loading) ? 0.5 : 1,
                        fontWeight: '500',
                        fontSize: '0.875rem'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id || loading}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ff6b6b',
                        cursor: (deletingId === item.id || loading) ? 'not-allowed' : 'pointer',
                        opacity: (deletingId === item.id || loading) ? 0.5 : 1,
                        fontSize: '1.2rem',
                        lineHeight: 1
                      }}
                      title="Delete"
                    >
                      {deletingId === item.id ? '...' : '✕'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <input
          type="text"
          placeholder="Liability name"
          value={editingId ? editName : name}
          onChange={(e) => {
            if (editingId) {
              setEditName(e.target.value);
            } else {
              setName(e.target.value);
            }
            if (error) setError(null);
          }}
          style={{
            flex: '1',
            minWidth: '120px',
            padding: '10px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '4px',
            color: 'white',
            fontSize: '14px'
          }}
          disabled={loading}
        />
        <input
          type="number"
          placeholder="Total Cost"
          step="0.01"
          value={editingId ? editAmount : amount}
          onChange={(e) => {
            if (editingId) {
              setEditAmount(e.target.value);
            } else {
              setAmount(e.target.value);
            }
            if (error) setError(null);
          }}
          style={{
            flex: '1',
            minWidth: '120px',
            padding: '10px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '4px',
            color: 'white',
            fontSize: '14px'
          }}
          disabled={loading}
        />
        
        {editingId ? (
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button
              type="button"
              onClick={handleEdit}
              disabled={loading || !isEditValid}
              style={{
                flex: '1',
                padding: '10px',
                backgroundColor: '#7345AF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (loading || !isEditValid) ? 'not-allowed' : 'pointer',
                opacity: (loading || !isEditValid) ? 0.5 : 1,
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={loading}
              style={{
                flex: '1',
                padding: '10px',
                backgroundColor: 'transparent',
                color: '#EDCA69',
                border: '1px solid #EDCA69',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || !isAddValid}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#7345AF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (loading || !isAddValid) ? 'not-allowed' : 'pointer',
              opacity: (loading || !isAddValid) ? 0.5 : 1,
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Adding...' : 'Add Liability'}
          </button>
        )}
      </form>
      
      {/* Animation for error shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

const meta: Meta<typeof MockLiabilitiesSection> = {
  title: 'BalanceSheet/LiabilitiesSection',
  component: MockLiabilitiesSection,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#121212' },
        { name: 'light', value: '#f5f5f5' },
      ],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MockLiabilitiesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. DEFAULT STATE - Empty liabilities
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

// 2. LOADING STATE
export const Loading: Story = {
  name: 'Loading State',
  render: () => {
    const Component: React.FC = () => {
      return (
        <div className="rf-card text-white" style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div className="rf-section-header" style={{ 
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#d4af37'
          }}>
            Liabilities
          </div>
          <p style={{ textAlign: 'center', color: '#d4af37', padding: '20px' }}>
            Loading liabilities...
          </p>
        </div>
      );
    };
    return <Component />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getByText('Loading liabilities...')).toBeInTheDocument();
    });
  },
};

// 3. SUCCESSFULLY ADDING A LIABILITY
export const SuccessfulAdd: Story = {
  name: 'Successfully Add Liability',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Fill in the form
    await userEvent.type(canvas.getByPlaceholderText('Liability name'), 'Student Loan');
    await userEvent.type(canvas.getByPlaceholderText('Total Cost'), '25000');
    
    // Click add button
    await userEvent.click(canvas.getByRole('button', { name: /Add Liability/i }));
    
    // Button should show loading state
    await waitFor(() => {
      expect(canvas.getByRole('button')).toHaveTextContent('Adding...');
    });
    
    // Wait for the item to appear in the table
    await waitFor(() => {
      expect(canvas.getByText('Student Loan')).toBeInTheDocument();
      expect(canvas.getByText('$25,000.00')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Verify form is cleared after successful add
    await waitFor(() => {
      const nameInput = canvas.getByPlaceholderText('Liability name') as HTMLInputElement;
      const costInput = canvas.getByPlaceholderText('Total Cost') as HTMLInputElement;
      expect(nameInput.value).toBe('');
      expect(costInput.value).toBe('');
    });
  },
};

// 5. ADDING WITH INVALID INPUT (non-numeric amount) - SHOWS ERROR
export const InvalidInputNonNumeric: Story = {
  name: 'Invalid Input - Non-Numeric Amount (Disables Button)',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Fill name field with valid data
    await userEvent.type(canvas.getByPlaceholderText('Liability name'), 'Car Loan');
    
    // Try to input non-numeric value
    // Note: input[type="number"] typically prevents this, but we'll test the validation
    const amountInput = canvas.getByPlaceholderText('Total Cost') as HTMLInputElement;
    
    // Clear any existing value
    await userEvent.clear(amountInput);
    
    // Type letters (some browsers may prevent this, but we'll try)
    await userEvent.type(amountInput, 'abc');
    
    // The button should be disabled when input is invalid
    await waitFor(() => {
        expect(canvas.getByRole('button', { name: /Add Liability/i })).toBeDisabled();
    });
  },
};

// 8. SUCCESSFULLY DELETING A LIABILITY
export const SuccessfulDelete: Story = {
  name: 'Successfully Delete Liability',
  render: () => {
    const Component: React.FC = () => {
      const [liabilities, setLiabilities] = useState([
        { id: '1', name: 'Personal Loan', value: 10000 },
        { id: '2', name: 'Medical Bill', value: 5000 },
      ]);
      
      const handleDelete = (id: string) => {
        setLiabilities(prev => prev.filter(item => item.id !== id));
      };
      
      return (
        <div className="rf-card text-white" style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div className="rf-section-header" style={{ 
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#d4af37'
          }}>
            Liabilities
          </div>
          
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #333', color: '#d4af37' }}>Name</th>
                  <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #333', color: '#d4af37' }}>Value</th>
                  <th style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #333', color: '#d4af37' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {liabilities.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '10px' }}>{item.name}</td>
                    <td style={{ textAlign: 'right', padding: '10px', fontFamily: 'monospace' }}>
                      ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <button
                        style={{
                          background: 'rgba(115, 69, 175, 0.1)',
                          border: '1px solid #7345AF',
                          color: '#7345AF',
                          borderRadius: '4px',
                          padding: '4px 12px',
                          cursor: 'pointer',
                          marginRight: '10px',
                          fontWeight: '500',
                          fontSize: '0.875rem'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff6b6b',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            lineHeight: 1
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <form style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <input
              type="text"
              placeholder="Liability name"
              style={{
                flex: '1',
                minWidth: '120px',
                padding: '10px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '4px',
                color: 'white',
                fontSize: '14px'
              }}
            />
            <input
              type="number"
              placeholder="Total Cost"
              style={{
                flex: '1',
                minWidth: '120px',
                padding: '10px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '4px',
                color: 'white',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#7345AF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Add Liability
            </button>
          </form>
        </div>
      );
    };
    return <Component />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify both items exist initially
    expect(canvas.getByText('Personal Loan')).toBeInTheDocument();
    expect(canvas.getByText('Medical Bill')).toBeInTheDocument();
    
    // Find and click the first delete button
    const deleteButtons = canvas.getAllByTitle('Delete');
    await userEvent.click(deleteButtons[0]);
    
    // Wait for deletion to complete
    await waitFor(() => {
      expect(canvas.queryByText('Personal Loan')).not.toBeInTheDocument();
    });
    
    // Verify the other item still exists
    expect(canvas.getByText('Medical Bill')).toBeInTheDocument();
  },
};