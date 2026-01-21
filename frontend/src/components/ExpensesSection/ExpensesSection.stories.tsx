import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn, userEvent, within, expect, waitFor } from '@storybook/test';
import ExpensesSection from './ExpensesSection';
import { CurrencyProvider } from '../../context/CurrencyContext';
import { AuthContext } from '../../context/AuthContext';
import { setAccessToken } from '../../utils/api';
import React, { useMemo, useState, useLayoutEffect } from 'react';

// Mock authenticated user state
const mockAuthValue = {
  user: { id: 1, name: 'Storybook User', email: 'user@example.com', createdAt: new Date().toISOString(), isAdmin: false },
  loading: false,
  isAuthenticated: true,
  isAdmin: false,
  login: fn(),
  logout: fn(),
  updateUsername: fn(),
  updateEmail: fn(),
  changePassword: fn(),
};

// Mock backend hook using in-memory reference
const useMockFetch = (initialData: any[]) => {
  const db = React.useRef<any[]>([]); 
  const initialized = React.useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize DB
  useLayoutEffect(() => {
    if (initialData && !initialized.current) {
      db.current = [...initialData];
      initialized.current = true;
    }
    setIsReady(true);
  }, [initialData]);

  useLayoutEffect(() => {
    setAccessToken('mock-expense-token');
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';
      
      // Expenses API
      if (url.includes('/expenses')) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (method === 'GET') {
          return new Response(JSON.stringify(db.current), {
            status: 200, headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (method === 'PUT') {
            await new Promise(resolve => setTimeout(resolve, 500));
            const parts = url.split('/');
            const id = Number(parts[parts.length - 1]);
            const body = JSON.parse(init?.body as string || '{}');

            const index = db.current.findIndex(i => i.id === id);
            if (index > -1) {
                db.current[index] = {...db.current[index], ...body };
                return new Response(JSON.stringify(db.current[index]), {
                    status: 200, headers: { 'Content-Type': 'application/json' }
                });
            }
            return new Response(JSON.stringify({}), { status: 200 });
        }

    
        if (method === 'POST') {
          const body = JSON.parse(init?.body as string || '{}');
          const newItem = {
            id: Math.floor(Math.random() * 10000) + 100,
            name: body.name || 'New Expense',
            amount: Number(body.amount) || 0,
            date: new Date().toISOString()
          };
          db.current.push(newItem);
          return new Response(JSON.stringify(newItem), {
            status: 200, headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (method === 'DELETE') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const parts = url.split('/');
          const id = Number(parts[parts.length - 1]);
          db.current = db.current.filter(i => i.id !== id);
          return new Response(JSON.stringify({ success: true, id }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({}), { status: 200 });
      }

      // Currency API
      if (url.includes('/currency') || url.includes('/currency/user')) {
         return new Response(JSON.stringify({ id: 1, cur_name: 'US Dollar', cur_symbol: '$' }), {
              status: 200, headers: { 'Content-Type': 'application/json' }
         });
      }
      
      console.warn('Unhandled fetch in story:', url);
      return new Response(JSON.stringify({}), { status: 404 });
    };

    return () => {
      window.fetch = originalFetch;
      setAccessToken(null);
    };
  }, []);

  return isReady; // Return readiness
};

// Wrapper with required providers
const ExpensesSectionWrapper: React.FC<{ initialData?: any[] }> = ({ initialData = [] }) => {
  const isMockReady = useMockFetch(initialData);

  const queryClient = useMemo(() => new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 0, refetchOnWindowFocus: false } },
  }), []);

  if (!isMockReady) return <div className="p-4 text-white">Initializing Test Environment...</div>;

  return (
    <AuthContext.Provider value={mockAuthValue}>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <div style={{ minHeight: '500px', backgroundColor: '#1a1a1a', padding: '2rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <ExpensesSection />
            </div>
          </div>
        </CurrencyProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

const meta: Meta<typeof ExpensesSectionWrapper> = {
  title: 'Components/ExpensesSection/ExpensesSection',
  component: ExpensesSectionWrapper,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state: empty dataset
export const Default: Story = {
  name: 'Default',
  args: { initialData: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(/No expenses added yet/i)).toBeInTheDocument();
  },
};

// Interaction: Add an expense
export const AddExpense: Story = {
  name: 'Add an Expense',
  args: { initialData: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Confirm initial state
    await expect(await canvas.findByText(/No expenses added yet/i)).toBeInTheDocument();

    // Fill in inputs
    const nameInput = canvas.getByPlaceholderText('Expense name'); 
    const amountInput = canvas.getByPlaceholderText('Amount');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Netflix Subscription');
    
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '15');

    // Click Add
    const addButton = canvas.getByRole('button', { name: /\+ Add Expense/i });
    await userEvent.click(addButton);

    // Verify Success
    await waitFor(async () => {
         expect(await canvas.findByText('Netflix Subscription')).toBeInTheDocument();
    }, { timeout: 3000 });
  }
};

// Interaction: Delete an expense
export const DeleteExpense: Story = {
  name: 'Delete an Expense',
  args: {
    initialData: [
      { id: 500, name: 'Old Mortgage', amount: 1200 },
      { id: 501, name: 'Groceries', amount: 400 }
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Confirm initial state
    await expect(await canvas.findByText('Old Mortgage')).toBeInTheDocument();

    // Find and click Delete
    const deleteButtons = await canvas.findAllByText('✕'); 
    
    if (deleteButtons.length > 0) {
        // Wait 3 seconds before deleting to show the item first
        await new Promise(r => setTimeout(r, 3000));
        
        await userEvent.click(deleteButtons[0]);
        
        // Verify Success
        await waitFor(async () => {
            expect(canvas.queryByText('Old Mortgage')).not.toBeInTheDocument();
        }, { timeout: 3000 });
        
        // Verify other item remains
        expect(canvas.getByText('Groceries')).toBeInTheDocument();
    }
  }
};

// Interaction: Edit an expense
export const EditExpense: Story = {
    name: 'Edit an Expense',
    args: {
        initialData: [
            { id: 1, name: 'House in Boracay', amount: 5000 },
            { id: 2, name: 'Birthday Party', amount: 300 }
        ]
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Confirm initial state
        await expect (await canvas.findByText('House in Boracay')).toBeInTheDocument();
        
        // Find and click Edit
        const editButtons = await canvas.findAllByText("Edit");

        if (editButtons.length > 0) {
            await userEvent.click(editButtons[0]);
        }

        // Modify Inputs
        const nameInput = canvas.getByDisplayValue('House in Boracay');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Boat in Boracay');

        const amountInput = canvas.getByDisplayValue('5000');
        await userEvent.clear(amountInput);
        await userEvent.type(amountInput, '2500');

        // Save Changes
        const saveButton = await canvas.findByText('Save');
        await userEvent.click(saveButton)

        // Verify Success
        await waitFor(() => {
            expect(canvas.queryByText('House in Boracay')).not.toBeInTheDocument()
            expect(canvas.queryByText('Boat in Boracay')).toBeInTheDocument()
            expect(canvas.queryByText(/5000/)).not.toBeInTheDocument()
            expect(canvas.queryByText('$2,500')).toBeInTheDocument()

        })


    }
}