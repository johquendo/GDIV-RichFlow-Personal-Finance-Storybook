// LiabilitiesSection.stories.tsx
// This story uses the REAL LiabilitiesSectionView component from LiabilitiesSection.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor, fn, expect } from '@storybook/test';
import { useState } from 'react';
import '../../styles/globals.css';
import { LiabilitiesSectionView, LiabilitiesSectionViewProps } from './LiabilitiesSection';

// Type for liability items (matches the real component)
type LiabilityItem = { id: number; name: string; value: number };

// Mock currency objects for stories
const USD_CURRENCY = { id: 1, cur_symbol: '$', cur_name: 'USD' };
const EUR_CURRENCY = { id: 2, cur_symbol: '€', cur_name: 'EUR' };

/**
 * Stateful wrapper that provides interactive state management for the REAL View component.
 * This allows us to test the actual UI code while simulating API behavior.
 */
const StatefulLiabilitiesSection = (props: Partial<LiabilitiesSectionViewProps>) => {
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>(
    props.liabilities ?? [
      { id: 1, name: 'Personal Loan', value: 10000 },
      { id: 2, name: 'Medical Bill', value: 5000 },
    ]
  );
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleAdd = async (item: { name: string; value: number }) => {
    setIsAdding(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setLiabilities(prev => [
      ...prev,
      { id: Date.now(), name: item.name, value: item.value }
    ]);
    setIsAdding(false);
  };

  const handleUpdate = async (item: { id: number; name: string; value: number }) => {
    setUpdatingId(item.id);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setLiabilities(prev => prev.map(l => l.id === item.id ? { ...l, ...item } : l));
    setUpdatingId(null);
  };

  const handleDelete = async (item: LiabilityItem) => {
    setDeletingId(item.id);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLiabilities(prev => prev.filter(l => l.id !== item.id));
    setDeletingId(null);
  };

  // Use the REAL LiabilitiesSectionView component
  return (
    <LiabilitiesSectionView
      liabilities={liabilities}
      isLoading={props.isLoading ?? false}
      error={props.error ?? null}
      currency={props.currency ?? USD_CURRENCY}
      isAdding={props.isAdding ?? isAdding}
      isUpdating={props.isUpdating ?? (updatingId !== null)}
      isDeletingId={props.isDeletingId ?? deletingId}
      onAdd={props.onAdd ?? handleAdd}
      onUpdate={props.onUpdate ?? handleUpdate}
      onDelete={props.onDelete ?? handleDelete}
    />
  );
};

const meta: Meta<typeof LiabilitiesSectionView> = {
  title: 'BalanceSheet/LiabilitiesSection',
  component: LiabilitiesSectionView,
  // Use the stateful wrapper for interactive stories
  render: (args) => <StatefulLiabilitiesSection {...args} />,
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
  args: {
    currency: USD_CURRENCY,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LiabilitiesSectionView>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// STORIES - Testing the REAL LiabilitiesSectionView component
// ============================================================================

// 1. DEFAULT STATE - Empty liabilities
export const Default: Story = {
  name: 'Default - Empty State',
  args: {
    liabilities: [],
  },
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
  args: {
    isLoading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getByText('Loading liabilities...')).toBeInTheDocument();
    });
  },
};

// 3. WITH EXISTING LIABILITIES
export const WithExistingLiabilities: Story = {
  name: 'With Existing Liabilities',
  args: {
    liabilities: [
      { id: 1, name: 'Mortgage', value: 350000 },
      { id: 2, name: 'Auto Loan', value: 25000 },
      { id: 3, name: 'Credit Card', value: 5000 },
      { id: 4, name: 'Student Loan', value: 45000 },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify all liabilities are displayed
    await waitFor(() => {
      expect(canvas.getByText('Mortgage')).toBeInTheDocument();
      expect(canvas.getByText('Auto Loan')).toBeInTheDocument();
      expect(canvas.getByText('Credit Card')).toBeInTheDocument();
      expect(canvas.getByText('Student Loan')).toBeInTheDocument();
    });
    
    // Verify formatted currency values (using flexible matching)
    expect(canvas.getByText(/\$350,000/)).toBeInTheDocument();
    expect(canvas.getByText(/\$25,000/)).toBeInTheDocument();
    expect(canvas.getByText(/\$5,000/)).toBeInTheDocument();
    expect(canvas.getByText(/\$45,000/)).toBeInTheDocument();
  },
};

// 4. SUCCESSFULLY ADDING A LIABILITY
export const SuccessfulAdd: Story = {
  name: 'Successfully Add Liability',
  args: {
    liabilities: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify empty state first
    await waitFor(() => {
      expect(canvas.getByText('No liabilities added yet.')).toBeInTheDocument();
    });
    
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
      expect(canvas.getByText(/\$25,000/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify form is cleared after successful add
    await waitFor(() => {
      const nameInput = canvas.getByPlaceholderText('Liability name') as HTMLInputElement;
      const costInput = canvas.getByPlaceholderText('Total Cost') as HTMLInputElement;
      expect(nameInput.value).toBe('');
      expect(costInput.value).toBe('');
    });
  },
};

// 5. BUTTON VALIDATION - Tests that button is properly disabled/enabled based on form state
export const ButtonValidation: Story = {
  name: 'Button Validation Behavior',
  args: {
    liabilities: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Small delay helper
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Button should be disabled initially (both fields empty)
    const addButton = canvas.getByRole('button', { name: /Add Liability/i });
    expect(addButton).toBeDisabled();
    
    await delay(500);
    
    // Fill only name - button should still be disabled (amount missing)
    await userEvent.type(canvas.getByPlaceholderText('Liability name'), 'Test Loan');
    await delay(300);
    expect(addButton).toBeDisabled();
    
    await delay(500);
    
    // Clear name and fill only amount - button should still be disabled
    await userEvent.clear(canvas.getByPlaceholderText('Liability name'));
    await userEvent.type(canvas.getByPlaceholderText('Total Cost'), '1000');
    await delay(300);
    expect(addButton).toBeDisabled();
    
    await delay(500);
    
    // Fill both - button should be enabled
    await userEvent.type(canvas.getByPlaceholderText('Liability name'), 'Test Loan');
    await delay(300);
    expect(addButton).not.toBeDisabled();
  },
};

// 6. SUCCESSFULLY DELETING A LIABILITY
export const SuccessfulDelete: Story = {
  name: 'Successfully Delete Liability',
  // Uses default liabilities from stateful wrapper
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify both items exist initially
    await waitFor(() => {
      expect(canvas.getByText('Personal Loan')).toBeInTheDocument();
      expect(canvas.getByText('Medical Bill')).toBeInTheDocument();
    });
    
    // Find and click the first delete button (✕)
    const deleteButtons = canvas.getAllByText('✕');
    await userEvent.click(deleteButtons[0]);
    
    // Wait for deletion to complete
    await waitFor(() => {
      expect(canvas.queryByText('Personal Loan')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify the other item still exists
    expect(canvas.getByText('Medical Bill')).toBeInTheDocument();
  },
};