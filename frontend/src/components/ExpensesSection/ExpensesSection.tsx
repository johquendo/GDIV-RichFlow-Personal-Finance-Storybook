import React, { useState } from 'react';
import {
  useExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  ExpenseItem,
} from '../../hooks/queries/useExpenses';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/currency.utils';
import FinancialTable, { ColumnDefinition } from '../Shared/FinancialTable';

const ExpenseSection: React.FC = () => {
  const { currency } = useCurrency();

  // TanStack Query hooks
  const { data: expenses, isLoading, error: queryError } = useExpensesQuery();
  const addExpenseMutation = useAddExpenseMutation();
  const updateExpenseMutation = useUpdateExpenseMutation();
  const deleteExpenseMutation = useDeleteExpenseMutation();

  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Handle add expense
  const handleAddExpense = async () => {
    if (!name.trim() || !amount.trim() || addExpenseMutation.isPending) return;

    try {
      setLocalError(null);
      await addExpenseMutation.mutateAsync({
        name,
        amount: parseFloat(amount),
      });
      setName('');
      setAmount('');
    } catch (err: unknown) {
      setLocalError('Failed to add expense');
    }
  };

  // Handle update expense
  const handleUpdateExpense = async () => {
    if (!editingItem || !name.trim() || !amount.trim() || updateExpenseMutation.isPending) return;

    try {
      setLocalError(null);
      await updateExpenseMutation.mutateAsync({
        id: editingItem.id,
        name,
        amount: parseFloat(amount),
      });
      setEditingItem(null);
      setName('');
      setAmount('');
    } catch (err: unknown) {
      setLocalError('Failed to update expense');
    }
  };

  // Handle edit click
  const handleEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setName(item.name);
    setAmount(item.amount.toString());
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingItem(null);
    setName('');
    setAmount('');
  };

  // Handle delete expense
  const handleDelete = async (item: ExpenseItem) => {
    if (deleteExpenseMutation.isPending) return;

    try {
      setLocalError(null);
      await deleteExpenseMutation.mutateAsync({ id: item.id });
    } catch (err: unknown) {
      setLocalError('Failed to delete expense');
    }
  };

  // Column definitions for FinancialTable
  const columns: ColumnDefinition<ExpenseItem>[] = [
    { header: 'Name', accessor: 'name' },
    {
      header: 'Amount',
      accessor: (item) => formatCurrency(item.amount, currency),
      align: 'right',
    },
  ];

  // Determine which item is being deleted (for loading state)
  const deletingId = deleteExpenseMutation.isPending ? deleteExpenseMutation.variables?.id : null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-transparent text-white h-full flex flex-col font-sans">
        <div className="rf-section-header">Expenses</div>
        <div className="rf-card flex-1 flex flex-col">
          <p className="text-center text-[#d4af37] p-5">Loading expenses...</p>
        </div>
      </div>
    );
  }

  // Display error from hook or local error
  const displayError =
    localError || (queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null);

  // Default empty expense array if data is not yet available
  const expenseData = expenses ?? [];

  return (
    <div className="bg-transparent text-white h-full flex flex-col font-sans">
      <div className="rf-section-header">Expenses</div>

      {displayError && <div className="rf-error">{displayError}</div>}

      <div className="rf-card flex-1 flex flex-col">
        {/* Use FinancialTable for the list display */}
        <FinancialTable
          title=""
          data={expenseData}
          columns={columns}
          emptyMessage="No expenses added yet."
          onEdit={handleEdit}
          onDelete={handleDelete}
          editingId={editingItem?.id ?? null}
          deletingId={deletingId ?? null}
          noCard={true}
        />

        {/* Input row */}
        <div className="rf-input-row">
          <input
            className="rf-input"
            type="text"
            placeholder="Expense name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rf-input"
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {editingItem !== null ? (
          <div className="rf-edit-actions">
            <button
              className="rf-btn-save"
              onClick={handleUpdateExpense}
              disabled={updateExpenseMutation.isPending || !name.trim() || !amount.trim()}
            >
              {updateExpenseMutation.isPending && updateExpenseMutation.variables?.id === editingItem?.id
                ? 'Saving...'
                : 'Save'}
            </button>
            <button
              className="rf-btn-cancel"
              onClick={handleCancelEdit}
              disabled={updateExpenseMutation.isPending}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="rf-btn-primary"
            onClick={handleAddExpense}
            disabled={addExpenseMutation.isPending || !name.trim() || !amount.trim() || editingItem !== null}
          >
            {addExpenseMutation.isPending ? 'Adding...' : '+ Add Expense'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpenseSection;
