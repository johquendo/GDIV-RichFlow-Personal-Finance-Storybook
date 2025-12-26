/**
 * Balance Sheet TanStack Query Hooks
 * 
 * Provides React Query hooks for managing assets and liabilities
 * with optimistic updates and parallel data fetching.
 */

import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { assetsAPI, liabilitiesAPI } from '../../utils/api';

// ============================================================================
// Type Definitions
// ============================================================================

export interface AssetItem {
  id: number;
  name: string;
  value: number;
}

export interface LiabilityItem {
  id: number;
  name: string;
  value: number;
}

export interface BalanceSheetData {
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

// Mutation input types
export interface AddAssetInput {
  name: string;
  value: number;
}

export interface UpdateAssetInput extends AddAssetInput {
  id: number;
}

export interface DeleteAssetInput {
  id: number;
}

export interface AddLiabilityInput {
  name: string;
  value: number;
}

export interface UpdateLiabilityInput extends AddLiabilityInput {
  id: number;
}

export interface DeleteLiabilityInput {
  id: number;
}

// ============================================================================
// Query Keys
// ============================================================================

export const balanceSheetKeys = {
  all: ['balanceSheet'] as const,
  assets: () => [...balanceSheetKeys.all, 'assets'] as const,
  liabilities: () => [...balanceSheetKeys.all, 'liabilities'] as const,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalizes a raw asset item from API response
 */
const normalizeAssetItem = (item: Record<string, unknown>): AssetItem => {
  return {
    id: item.id as number,
    name: item.name as string,
    value: typeof item.value === 'number' ? item.value : parseFloat(item.value as string),
  };
};

/**
 * Normalizes a raw liability item from API response
 */
const normalizeLiabilityItem = (item: Record<string, unknown>): LiabilityItem => {
  return {
    id: item.id as number,
    name: item.name as string,
    value: typeof item.value === 'number' ? item.value : parseFloat(item.value as string),
  };
};

/**
 * Normalizes raw API response into asset array
 */
const normalizeAssetsData = (data: unknown): AssetItem[] => {
  const assets = Array.isArray(data) ? data : [];
  return assets.map(normalizeAssetItem);
};

/**
 * Normalizes raw API response into liability array
 */
const normalizeLiabilitiesData = (data: unknown): LiabilityItem[] => {
  const liabilities = Array.isArray(data) ? data : [];
  return liabilities.map(normalizeLiabilityItem);
};

// ============================================================================
// Individual Queries
// ============================================================================

/**
 * Hook to fetch assets
 */
export const useAssetsQuery = () => {
  return useQuery({
    queryKey: balanceSheetKeys.assets(),
    queryFn: async () => {
      const response = await assetsAPI.getAssets();
      return response;
    },
    select: normalizeAssetsData,
  });
};

/**
 * Hook to fetch liabilities
 */
export const useLiabilitiesQuery = () => {
  return useQuery({
    queryKey: balanceSheetKeys.liabilities(),
    queryFn: async () => {
      const response = await liabilitiesAPI.getLiabilities();
      return response;
    },
    select: normalizeLiabilitiesData,
  });
};

// ============================================================================
// Combined Balance Sheet Query
// ============================================================================

/**
 * Hook to fetch both assets and liabilities in parallel
 * Returns combined balance sheet data with calculated net worth
 * 
 * @example
 * ```tsx
 * const { assets, liabilities, netWorth, isLoading } = useBalanceSheetQuery();
 * ```
 */
export const useBalanceSheetQuery = () => {
  const results = useQueries({
    queries: [
      {
        queryKey: balanceSheetKeys.assets(),
        queryFn: async () => {
          const response = await assetsAPI.getAssets();
          return normalizeAssetsData(response);
        },
      },
      {
        queryKey: balanceSheetKeys.liabilities(),
        queryFn: async () => {
          const response = await liabilitiesAPI.getLiabilities();
          return normalizeLiabilitiesData(response);
        },
      },
    ],
  });

  const [assetsResult, liabilitiesResult] = results;

  const assets = assetsResult.data ?? [];
  const liabilities = liabilitiesResult.data ?? [];
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  return {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netWorth,
    isLoading: assetsResult.isLoading || liabilitiesResult.isLoading,
    isError: assetsResult.isError || liabilitiesResult.isError,
    error: assetsResult.error || liabilitiesResult.error,
  };
};

// ============================================================================
// Asset Mutations
// ============================================================================

/**
 * Hook to add a new asset with optimistic updates
 */
export const useAddAssetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddAssetInput) => {
      const response = await assetsAPI.addAsset(input.name, input.value);
      const assetData = response.asset || response;
      return normalizeAssetItem(assetData);
    },

    onMutate: async (newAsset) => {
      await queryClient.cancelQueries({ queryKey: balanceSheetKeys.assets() });

      const previousData = queryClient.getQueryData<unknown[]>(balanceSheetKeys.assets());

      queryClient.setQueryData<unknown[]>(balanceSheetKeys.assets(), (old) => {
        const oldArray = Array.isArray(old) ? old : [];
        const optimisticItem = {
          id: -Date.now(),
          name: newAsset.name,
          value: newAsset.value,
        };
        return [...oldArray, optimisticItem];
      });

      return { previousData };
    },

    onError: (_error, _newAsset, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(balanceSheetKeys.assets(), context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: balanceSheetKeys.assets() });
    },
  });
};

/**
 * Hook to update an existing asset with optimistic updates
 */
export const useUpdateAssetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAssetInput) => {
      const response = await assetsAPI.updateAsset(input.id, input.name, input.value);
      const assetData = response.asset || response;
      return normalizeAssetItem(assetData);
    },

    onMutate: async (updatedAsset) => {
      await queryClient.cancelQueries({ queryKey: balanceSheetKeys.assets() });

      const previousData = queryClient.getQueryData<unknown[]>(balanceSheetKeys.assets());

      queryClient.setQueryData<unknown[]>(balanceSheetKeys.assets(), (old) => {
        const oldArray = Array.isArray(old) ? old : [];
        return oldArray.map((item: any) => {
          if (item.id === updatedAsset.id) {
            return {
              ...item,
              name: updatedAsset.name,
              value: updatedAsset.value,
            };
          }
          return item;
        });
      });

      return { previousData };
    },

    onError: (_error, _updatedAsset, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(balanceSheetKeys.assets(), context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: balanceSheetKeys.assets() });
    },
  });
};

/**
 * Hook to delete an asset with optimistic updates
 */
export const useDeleteAssetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteAssetInput) => {
      await assetsAPI.deleteAsset(input.id);
      return input;
    },

    onMutate: async (deletedAsset) => {
      await queryClient.cancelQueries({ queryKey: balanceSheetKeys.assets() });

      const previousData = queryClient.getQueryData<unknown[]>(balanceSheetKeys.assets());

      queryClient.setQueryData<unknown[]>(balanceSheetKeys.assets(), (old) => {
        const oldArray = Array.isArray(old) ? old : [];
        return oldArray.filter((item: any) => item.id !== deletedAsset.id);
      });

      return { previousData };
    },

    onError: (_error, _deletedAsset, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(balanceSheetKeys.assets(), context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: balanceSheetKeys.assets() });
    },
  });
};

// ============================================================================
// Liability Mutations
// ============================================================================

/**
 * Hook to add a new liability with optimistic updates
 */
export const useAddLiabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddLiabilityInput) => {
      const response = await liabilitiesAPI.addLiability(input.name, input.value);
      const liabilityData = response.liability || response;
      return normalizeLiabilityItem(liabilityData);
    },

    onMutate: async (newLiability) => {
      await queryClient.cancelQueries({ queryKey: balanceSheetKeys.liabilities() });

      const previousData = queryClient.getQueryData<unknown[]>(balanceSheetKeys.liabilities());

      queryClient.setQueryData<unknown[]>(balanceSheetKeys.liabilities(), (old) => {
        const oldArray = Array.isArray(old) ? old : [];
        const optimisticItem = {
          id: -Date.now(),
          name: newLiability.name,
          value: newLiability.value,
        };
        return [...oldArray, optimisticItem];
      });

      return { previousData };
    },

    onError: (_error, _newLiability, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(balanceSheetKeys.liabilities(), context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: balanceSheetKeys.liabilities() });
    },
  });
};

/**
 * Hook to update an existing liability with optimistic updates
 */
export const useUpdateLiabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateLiabilityInput) => {
      const response = await liabilitiesAPI.updateLiability(input.id, input.name, input.value);
      const liabilityData = response.liability || response;
      return normalizeLiabilityItem(liabilityData);
    },

    onMutate: async (updatedLiability) => {
      await queryClient.cancelQueries({ queryKey: balanceSheetKeys.liabilities() });

      const previousData = queryClient.getQueryData<unknown[]>(balanceSheetKeys.liabilities());

      queryClient.setQueryData<unknown[]>(balanceSheetKeys.liabilities(), (old) => {
        const oldArray = Array.isArray(old) ? old : [];
        return oldArray.map((item: any) => {
          if (item.id === updatedLiability.id) {
            return {
              ...item,
              name: updatedLiability.name,
              value: updatedLiability.value,
            };
          }
          return item;
        });
      });

      return { previousData };
    },

    onError: (_error, _updatedLiability, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(balanceSheetKeys.liabilities(), context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: balanceSheetKeys.liabilities() });
    },
  });
};

/**
 * Hook to delete a liability with optimistic updates
 */
export const useDeleteLiabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteLiabilityInput) => {
      await liabilitiesAPI.deleteLiability(input.id);
      return input;
    },

    onMutate: async (deletedLiability) => {
      await queryClient.cancelQueries({ queryKey: balanceSheetKeys.liabilities() });

      const previousData = queryClient.getQueryData<unknown[]>(balanceSheetKeys.liabilities());

      queryClient.setQueryData<unknown[]>(balanceSheetKeys.liabilities(), (old) => {
        const oldArray = Array.isArray(old) ? old : [];
        return oldArray.filter((item: any) => item.id !== deletedLiability.id);
      });

      return { previousData };
    },

    onError: (_error, _deletedLiability, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(balanceSheetKeys.liabilities(), context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: balanceSheetKeys.liabilities() });
    },
  });
};

// ============================================================================
// Prefetch Helpers
// ============================================================================

/**
 * Prefetch balance sheet data (useful for route preloading)
 */
export const prefetchBalanceSheet = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: balanceSheetKeys.assets(),
      queryFn: () => assetsAPI.getAssets(),
    }),
    queryClient.prefetchQuery({
      queryKey: balanceSheetKeys.liabilities(),
      queryFn: () => liabilitiesAPI.getLiabilities(),
    }),
  ]);
};
