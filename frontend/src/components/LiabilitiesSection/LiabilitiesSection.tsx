import React, { useState } from "react";
import {
  useLiabilitiesQuery,
  useAddLiabilityMutation,
  useUpdateLiabilityMutation,
  useDeleteLiabilityMutation,
  LiabilityItem,
} from "../../hooks/queries/useBalanceSheet";
import { useCurrency } from "../../context/CurrencyContext";
import { formatCurrency } from "../../utils/currency.utils";
import FinancialTable, { ColumnDefinition } from "../Shared/FinancialTable";
import { Currency } from "../../types/currency.types";

// ============================================================================
// VIEW COMPONENT - Pure UI, no data fetching
// This is exported for Storybook testing
// ============================================================================

export interface LiabilitiesSectionViewProps {
  liabilities: LiabilityItem[];
  isLoading: boolean;
  error: string | null;
  currency: Currency | null;
  isAdding: boolean;
  isUpdating: boolean;
  isDeletingId: number | null;
  onAdd: (item: { name: string; value: number }) => Promise<void>;
  onUpdate: (item: { id: number; name: string; value: number }) => Promise<void>;
  onDelete: (item: LiabilityItem) => Promise<void>;
}

export const LiabilitiesSectionView: React.FC<LiabilitiesSectionViewProps> = ({
  liabilities,
  isLoading,
  error,
  currency,
  isAdding,
  isUpdating,
  isDeletingId,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [editingItem, setEditingItem] = useState<LiabilityItem | null>(null);
  const [liabilityName, setLiabilityName] = useState("");
  const [liabilityAmount, setLiabilityAmount] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Handle add liability
  const handleAddLiability = async () => {
    if (!liabilityName.trim() || !liabilityAmount.trim() || isAdding) return;

    try {
      setLocalError(null);
      await onAdd({
        name: liabilityName,
        value: parseFloat(liabilityAmount),
      });
      setLiabilityName("");
      setLiabilityAmount("");
    } catch (err: unknown) {
      setLocalError("Failed to add liability");
    }
  };

  // Handle update liability
  const handleUpdateLiability = async () => {
    if (!editingItem || !liabilityName.trim() || !liabilityAmount.trim() || isUpdating) return;

    try {
      setLocalError(null);
      await onUpdate({
        id: editingItem.id,
        name: liabilityName,
        value: parseFloat(liabilityAmount),
      });
      setEditingItem(null);
      setLiabilityName("");
      setLiabilityAmount("");
    } catch (err: unknown) {
      setLocalError("Failed to update liability");
    }
  };

  // Handle edit click
  const handleEdit = (item: LiabilityItem) => {
    setEditingItem(item);
    setLiabilityName(item.name);
    setLiabilityAmount(item.value.toString());
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingItem(null);
    setLiabilityName("");
    setLiabilityAmount("");
  };

  // Handle delete liability
  const handleDelete = async (item: LiabilityItem) => {
    if (isDeletingId) return;

    try {
      setLocalError(null);
      await onDelete(item);
    } catch (err: unknown) {
      setLocalError("Failed to delete liability");
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem !== null) {
      await handleUpdateLiability();
    } else {
      await handleAddLiability();
    }
  };

  // Column definitions for FinancialTable
  const columns: ColumnDefinition<LiabilityItem>[] = [
    { header: "Name", accessor: "name" },
    {
      header: "Value",
      accessor: (item) => formatCurrency(item.value, currency),
      align: "right",
    },
  ];

  // Determine which item is being deleted (for loading state)
  const deletingId = isDeletingId;

  // Show loading state
  if (isLoading) {
    return (
      <div className="rf-card text-white">
        <div className="rf-section-header">Liabilities</div>
        <p className="text-center text-[#d4af37] p-5">Loading liabilities...</p>
      </div>
    );
  }

  // Display error from hook or local error
  const displayError = localError || error;

  // Default empty liabilities array if data is not yet available
  const liabilityData = liabilities ?? [];

  return (
    <div className="rf-card text-white">
      <div className="rf-section-header">Liabilities</div>

      {displayError && <p className="rf-error">{displayError}</p>}

      {/* Use FinancialTable for the list display */}
      <FinancialTable
        title=""
        data={liabilityData}
        columns={columns}
        emptyMessage="No liabilities added yet."
        onEdit={handleEdit}
        onDelete={handleDelete}
        editingId={editingItem?.id ?? null}
        deletingId={deletingId ?? null}
        noCard={true}
      />

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <input
          className="rf-input flex-1 min-w-30"
          type="text"
          placeholder="Liability name"
          value={liabilityName}
          onChange={(e) => setLiabilityName(e.target.value)}
          disabled={isAdding}
        />
        <input
          className="rf-input flex-1 min-w-30"
          type="number"
          placeholder="Total Cost"
          step="0.01"
          value={liabilityAmount}
          onChange={(e) => setLiabilityAmount(e.target.value)}
          disabled={isAdding || isUpdating}
        />
        {editingItem !== null ? (
          <div className="rf-edit-actions w-full">
            <button
              type="button"
              className="rf-btn-save"
              onClick={handleUpdateLiability}
              disabled={isUpdating || !liabilityName.trim() || !liabilityAmount.trim()}
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="rf-btn-cancel"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="rf-btn-primary w-full"
            type="submit"
            disabled={isAdding || !liabilityName.trim() || !liabilityAmount.trim()}
          >
            {isAdding ? "Adding..." : "Add Liability"}
          </button>
        )}
      </form>
    </div>
  );
};

// ============================================================================
// CONTAINER COMPONENT - Handles data fetching and mutations
// This is the default export used by the application
// ============================================================================

const LiabilitiesSection: React.FC = () => {
  const { currency } = useCurrency();

  // TanStack Query hooks
  const { data: liabilities, isLoading, error: queryError } = useLiabilitiesQuery();
  const addLiabilityMutation = useAddLiabilityMutation();
  const updateLiabilityMutation = useUpdateLiabilityMutation();
  const deleteLiabilityMutation = useDeleteLiabilityMutation();

  const errorMessage = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  return (
    <LiabilitiesSectionView
      liabilities={liabilities || []}
      isLoading={isLoading}
      error={errorMessage}
      currency={currency}
      isAdding={addLiabilityMutation.isPending}
      isUpdating={updateLiabilityMutation.isPending}
      isDeletingId={deleteLiabilityMutation.isPending ? deleteLiabilityMutation.variables?.id ?? null : null}
      onAdd={async (item) => { await addLiabilityMutation.mutateAsync(item); }}
      onUpdate={async (item) => { await updateLiabilityMutation.mutateAsync(item); }}
      onDelete={async (item) => { await deleteLiabilityMutation.mutateAsync({ id: item.id }); }}
    />
  );
};

export default LiabilitiesSection;