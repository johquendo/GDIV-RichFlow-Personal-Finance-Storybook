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

const LiabilitiesSection: React.FC = () => {
  const { currency } = useCurrency();

  // TanStack Query hooks
  const { data: liabilities, isLoading, error: queryError } = useLiabilitiesQuery();
  const addLiabilityMutation = useAddLiabilityMutation();
  const updateLiabilityMutation = useUpdateLiabilityMutation();
  const deleteLiabilityMutation = useDeleteLiabilityMutation();

  const [editingItem, setEditingItem] = useState<LiabilityItem | null>(null);
  const [liabilityName, setLiabilityName] = useState("");
  const [liabilityAmount, setLiabilityAmount] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Handle add liability
  const handleAddLiability = async () => {
    if (!liabilityName.trim() || !liabilityAmount.trim() || addLiabilityMutation.isPending) return;

    try {
      setLocalError(null);
      await addLiabilityMutation.mutateAsync({
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
    if (!editingItem || !liabilityName.trim() || !liabilityAmount.trim() || updateLiabilityMutation.isPending) return;

    try {
      setLocalError(null);
      await updateLiabilityMutation.mutateAsync({
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
    if (deleteLiabilityMutation.isPending) return;

    try {
      setLocalError(null);
      await deleteLiabilityMutation.mutateAsync({ id: item.id });
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
  const deletingId = deleteLiabilityMutation.isPending ? deleteLiabilityMutation.variables?.id : null;

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
  const displayError =
    localError || (queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null);

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
          className="rf-input flex-1 min-w-[120px]"
          type="text"
          placeholder="Liability name"
          value={liabilityName}
          onChange={(e) => setLiabilityName(e.target.value)}
          disabled={addLiabilityMutation.isPending}
        />
        <input
          className="rf-input flex-1 min-w-[120px]"
          type="number"
          placeholder="Total Cost"
          step="0.01"
          value={liabilityAmount}
          onChange={(e) => setLiabilityAmount(e.target.value)}
          disabled={addLiabilityMutation.isPending || updateLiabilityMutation.isPending}
        />
        {editingItem !== null ? (
          <div className="rf-edit-actions w-full">
            <button
              type="button"
              className="rf-btn-save"
              onClick={handleUpdateLiability}
              disabled={updateLiabilityMutation.isPending || !liabilityName.trim() || !liabilityAmount.trim()}
            >
              {updateLiabilityMutation.isPending && updateLiabilityMutation.variables?.id === editingItem?.id
                ? "Saving..."
                : "Save"}
            </button>
            <button
              type="button"
              className="rf-btn-cancel"
              onClick={handleCancelEdit}
              disabled={updateLiabilityMutation.isPending}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="rf-btn-primary w-full"
            type="submit"
            disabled={addLiabilityMutation.isPending || !liabilityName.trim() || !liabilityAmount.trim()}
          >
            {addLiabilityMutation.isPending ? "Adding..." : "Add Liability"}
          </button>
        )}
      </form>
    </div>
  );
};

export default LiabilitiesSection;