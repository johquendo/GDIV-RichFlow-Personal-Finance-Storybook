import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn, userEvent, within, expect } from '@storybook/test';
import IncomeSection from './IncomeSection';
import { CurrencyProvider } from '../../context/CurrencyContext';
import { AuthContext } from '../../context/AuthContext';
import { setAccessToken } from '../../utils/api';
import React, { useMemo, useState, useLayoutEffect } from 'react';

// Mock authenticated user state
const mockAuthValue = {
  user: {
    id: 1,
    name: 'Storybook User',
    email: 'user@example.com',
    createdAt: new Date().toISOString(),
    isAdmin: false
  },
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
const useMockFetch = (initialData?: any) => {
  const db = React.useRef<any[]>([]); 
  const initialized = React.useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize DB
  useLayoutEffect(() => {
    if (initialData && !initialized.current) {
      const flatList = [
        ...(initialData.earned || []),
        ...(initialData.portfolio || []),
        ...(initialData.passive || []),
        ...(initialData.all || [])
      ].filter(item => item && item.id);
      
      const uniqueItems = Array.from(new Map(flatList.map(item => [item.id, item])).values());
      
      db.current = uniqueItems;
      initialized.current = true;
    }
  }, [initialData]);

  useLayoutEffect(() => {
    setAccessToken('mock-storybook-token');
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';
      
      // Income API
      if (url.includes('/income')) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (method === 'GET') {
          return new Response(JSON.stringify(db.current), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (method === 'POST') {
          const body = JSON.parse(init?.body as string || '{}');
          const newItem = {
            id: Math.floor(Math.random() * 10000) + 100,
            name: body.source || body.name || 'New Income',
            amount: Number(body.amount) || 0,
            type: body.type || 'Earned',
            quadrant: body.quadrant || 'EMPLOYEE',
            description: body.description || ''
          };
          db.current.push(newItem);
          
          return new Response(JSON.stringify(newItem), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (method === 'PUT') {
          const id = Number(url.split('/').pop());
          const body = JSON.parse(init?.body as string || '{}');
          const index = db.current.findIndex(i => i.id === id);
          
          if (index !== -1) {
            db.current[index] = { ...db.current[index], ...body };
            return new Response(JSON.stringify(db.current[index]), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        if (method === 'DELETE') {
          const id = Number(url.split('/').pop());
          db.current = db.current.filter(i => i.id !== id);
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({}), { status: 200 });
      }

      // Currency API
      if (url.includes('/currency') || url.includes('/currency/user')) {
         return new Response(JSON.stringify({ id: 1, cur_name: 'US Dollar', cur_symbol: '$' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
         });
      }
      
      return originalFetch(input, init);
    };

    setIsReady(true);

    return () => {
      window.fetch = originalFetch;
      setAccessToken(null);
      setIsReady(false);
    };
  }, []);

  return isReady;
};

// Wrapper with required providers
const IncomeSectionWrapper: React.FC<{ data?: any }> = ({ data }) => {
  const isMockReady = useMockFetch(data);

  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          staleTime: 0,
        },
      },
    });

    return client;
  }, [data]);

  if (!isMockReady) {
    return <div style={{ padding: '2rem', color: 'white' }}>Initializing...</div>;
  }

  return (
    <AuthContext.Provider value={mockAuthValue}>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <div style={{ minHeight: '600px', backgroundColor: 'var(--color-dark-bg)', padding: '1rem' }}>
            <IncomeSection />
          </div>
        </CurrencyProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

const meta: Meta<typeof IncomeSectionWrapper> = {
  title: 'Components/IncomeSection/IncomeSection',
  component: IncomeSectionWrapper,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state: empty dataset
export const Default: Story = {
  args: {
    data: {
      earned: [],
      portfolio: [],
      passive: [],
      all: []
    }
  },
};

// Interaction: Add earned income
export const AddEarnedIncome: Story = {
  args: {
    data: {
      earned: [],
      portfolio: [],
      passive: [],
      all: []
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Find input fields
    const sourceInputs = await canvas.findAllByPlaceholderText('Source name');
    const amountInputs = await canvas.findAllByPlaceholderText('Amount');
    
    if (!sourceInputs.length || !amountInputs.length) {
      throw new Error("Could not find input fields.");
    }

    const salaryInput = sourceInputs[0];
    const amountInput = amountInputs[0];
    
    // Type in fields
    await userEvent.type(salaryInput, 'New Job Offer', { delay: 100 });
    await userEvent.type(amountInput, '8500', { delay: 100 });
    
    // Click Add
    const addButton = await canvas.findByRole('button', { name: /\+ Add Earned Income/i });
    await userEvent.click(addButton);

    // Verify item and format
    const newItem = await canvas.findByText('New Job Offer', {}, { timeout: 2000 });
    await expect(newItem).toBeInTheDocument();
    
    const formattedAmount = await canvas.findByText(/\$8,500/i);
    await expect(formattedAmount).toBeInTheDocument();
  }
};

// Interaction: Delete earned income
export const DeleteEarnedIncome: Story = {
  args: {
    data: {
      earned: [
        { id: 101, name: 'Job to Delete', amount: 5000, type: 'Earned', quadrant: 'EMPLOYEE' }
      ],
      portfolio: [],
      passive: [],
      all: []
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify initial item exists
    const itemToDelete = await canvas.findByText('Job to Delete', {}, { timeout: 3000 });
    await expect(itemToDelete).toBeInTheDocument();

    // Visual pause
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Click Delete
    const deleteButton = await canvas.getByText('✕');
    await userEvent.click(deleteButton);

    // Verify removal
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const deletedItem = canvas.queryByText('Job to Delete');
    await expect(deletedItem).not.toBeInTheDocument();
    
    // Check empty state
    const emptyState = await canvas.findByText(/No earned income added yet/i);
    await expect(emptyState).toBeInTheDocument();
  }
};

// Interaction: Add portfolio income
export const AddPortfolioIncome: Story = {
  args: {
    data: {
      earned: [],
      portfolio: [],
      passive: [],
      all: []
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Find Portfolio inputs (index 1)
    const sourceInputs = await canvas.findAllByPlaceholderText('Source name');
    const amountInputs = await canvas.findAllByPlaceholderText('Amount');
    
    if (sourceInputs.length < 2 || amountInputs.length < 2) {
      throw new Error("Could not find Portfolio input fields. Ensure the component renders all three sections.");
    }

    const portfolioInput = sourceInputs[1];
    const amountInput = amountInputs[1];
    
    // Type in fields
    await userEvent.type(portfolioInput, 'Stock Dividends', { delay: 100 });
    await userEvent.type(amountInput, '1200', { delay: 100 });
    
    // Click Add
    const addButton = await canvas.findByRole('button', { name: /\+ Add Portfolio Income/i });
    await userEvent.click(addButton);

    // Verify item and format
    const newItem = await canvas.findByText('Stock Dividends', {}, { timeout: 2000 });
    await expect(newItem).toBeInTheDocument();
    
    const formattedAmount = await canvas.findByText(/\$1,200/i);
    await expect(formattedAmount).toBeInTheDocument();
  }
};

// Interaction: Add passive income
export const AddPassiveIncome: Story = {
  args: {
    data: {
      earned: [],
      portfolio: [],
      passive: [],
      all: []
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Find Passive inputs (index 2)
    const sourceInputs = await canvas.findAllByPlaceholderText('Source name');
    const amountInputs = await canvas.findAllByPlaceholderText('Amount');
    
    if (sourceInputs.length < 3 || amountInputs.length < 3) {
      throw new Error("Could not find Passive input fields. Ensure the component renders all three sections.");
    }

    const passiveInput = sourceInputs[2];
    const amountInput = amountInputs[2];
    
    // Type in fields
    await userEvent.type(passiveInput, 'Rental Property', { delay: 100 });
    await userEvent.type(amountInput, '3500', { delay: 100 });
    
    // Click Add
    const addButton = await canvas.findByRole('button', { name: /\+ Add Passive Income/i });
    await userEvent.click(addButton);

    // Verify item and format
    const newItem = await canvas.findByText('Rental Property', {}, { timeout: 2000 });
    await expect(newItem).toBeInTheDocument();
    
    const formattedAmount = await canvas.findByText(/\$3,500/i);
    await expect(formattedAmount).toBeInTheDocument();
  }
};

