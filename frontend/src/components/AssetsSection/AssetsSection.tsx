import React, { useState } from "react";
import {
  useAssetsQuery,
  useAddAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  AssetItem,
} from "../../hooks/queries/useBalanceSheet";
import { useCurrency } from "../../context/CurrencyContext";
import { formatCurrency } from "../../utils/currency.utils";
import FinancialTable, { ColumnDefinition } from "../Shared/FinancialTable";

const AssetsSection: React.FC = () => {
  const { currency } = useCurrency();

  // TanStack Query hooks
  const { data: assets, isLoading, error: queryError } = useAssetsQuery();
  const addAssetMutation = useAddAssetMutation();
  const updateAssetMutation = useUpdateAssetMutation();
  const deleteAssetMutation = useDeleteAssetMutation();

  const [editingItem, setEditingItem] = useState<AssetItem | null>(null);
  const [assetName, setAssetName] = useState("");
  const [assetAmount, setAssetAmount] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Handle add asset
  const handleAddAsset = async () => {
    if (!assetName.trim() || !assetAmount.trim() || addAssetMutation.isPending) return;

    try {
      setLocalError(null);
      await addAssetMutation.mutateAsync({
        name: assetName,
        value: parseFloat(assetAmount),
      });
      setAssetName("");
      setAssetAmount("");
    } catch (err: unknown) {
      setLocalError("Failed to add asset");
    }
  };

  // Handle update asset
  const handleUpdateAsset = async () => {
    if (!editingItem || !assetName.trim() || !assetAmount.trim() || updateAssetMutation.isPending) return;

    try {
      setLocalError(null);
      await updateAssetMutation.mutateAsync({
        id: editingItem.id,
        name: assetName,
        value: parseFloat(assetAmount),
      });
      setEditingItem(null);
      setAssetName("");
      setAssetAmount("");
    } catch (err: unknown) {
      setLocalError("Failed to update asset");
    }
  };

  // Handle edit click
  const handleEdit = (item: AssetItem) => {
    setEditingItem(item);
    setAssetName(item.name);
    setAssetAmount(item.value.toString());
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingItem(null);
    setAssetName("");
    setAssetAmount("");
  };

  // Handle delete asset
  const handleDelete = async (item: AssetItem) => {
    if (deleteAssetMutation.isPending) return;

    try {
      setLocalError(null);
      await deleteAssetMutation.mutateAsync({ id: item.id });
    } catch (err: unknown) {
      setLocalError("Failed to delete asset");
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem !== null) {
      await handleUpdateAsset();
    } else {
      await handleAddAsset();
    }
  };

  // Column definitions for FinancialTable
  const columns: ColumnDefinition<AssetItem>[] = [
    { header: "Name", accessor: "name" },
    {
      header: "Value",
      accessor: (item) => formatCurrency(item.value, currency),
      align: "right",
    },
  ];

  // Determine which item is being deleted (for loading state)
  const deletingId = deleteAssetMutation.isPending ? deleteAssetMutation.variables?.id : null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="rf-card text-white">
        <div className="rf-section-header">Assets</div>
        <p className="text-center text-[#d4af37] p-5">Loading assets...</p>
      </div>
    );
  }

  // Display error from hook or local error
  const displayError =
    localError || (queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null);

  // Default empty assets array if data is not yet available
  const assetData = assets ?? [];

  return (
    <div className="rf-card text-white">
      <div className="rf-section-header">Assets</div>

      {displayError && <p className="rf-error">{displayError}</p>}

      {/* Use FinancialTable for the list display */}
      <FinancialTable
        title=""
        data={assetData}
        columns={columns}
        emptyMessage="No assets added yet."
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
          placeholder="Asset name"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          disabled={addAssetMutation.isPending}
        />
        <input
          className="rf-input flex-1 min-w-[120px]"
          type="number"
          placeholder="Total Value"
          step="0.01"
          value={assetAmount}
          onChange={(e) => setAssetAmount(e.target.value)}
          disabled={addAssetMutation.isPending || updateAssetMutation.isPending}
        />
        {editingItem !== null ? (
          <div className="rf-edit-actions w-full">
            <button
              type="button"
              className="rf-btn-save"
              onClick={handleUpdateAsset}
              disabled={updateAssetMutation.isPending || !assetName.trim() || !assetAmount.trim()}
            >
              {updateAssetMutation.isPending && updateAssetMutation.variables?.id === editingItem?.id
                ? "Saving..."
                : "Save"}
            </button>
            <button
              type="button"
              className="rf-btn-cancel"
              onClick={handleCancelEdit}
              disabled={updateAssetMutation.isPending}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="rf-btn-primary w-full"
            type="submit"
            disabled={addAssetMutation.isPending || !assetName.trim() || !assetAmount.trim()}
          >
            {addAssetMutation.isPending ? "Adding..." : "Add Asset"}
          </button>
        )}
      </form>
    </div>
  );
};

export default AssetsSection;