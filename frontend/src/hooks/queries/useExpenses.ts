/**
 * Expenses TanStack Query Hooks
 * 
 * Replaces the expense-related logic from the monolithic useFinancialData hook
 * with modern React Query patterns including optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesAPI } from '../../utils/api';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ExpenseItem {
  id: number;
  name: string;
  amount: number;
}

export interface ExpenseTotals {
  total: number;
}

// Mutation input types
export interface AddExpenseInput {
  name: string;
  amount: number;
}

export interface UpdateExpenseInput extends AddExpenseInput {
  id: number;
}

export interface DeleteExpenseInput {
  id: number;
}

// ============================================================================
// Query Keys
// ============================================================================

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: number) => [...expenseKeys.details(), id] as const,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalizes a raw expense item from API response
 */
const normalizeExpenseItem = (item: Record<string, unknown>): ExpenseItem => {
  return {
    id: item.id as number,
    name: item.name as string,
    amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount as string),
  };
};

/**
 * Normalizes raw API response into expense array
 */
const normalizeExpenseData = (data: unknown): ExpenseItem[] => {
  const expenses = Array.isArray(data) ? data : [];
  return expenses.map(normalizeExpenseItem);
};

/**
 * Calculate expense totals from normalized data
 */
export const calculateExpenseTotals = (expenses: ExpenseItem[]): ExpenseTotals => {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return { total };
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch and normalize expense data
 * 
 * @example
 * ```tsx
 * const { data: expenses, isLoading, error } = useExpensesQuery();
 * console.log(expenses);
 * ```
 */
export const useExpensesQuery = () => {
  return useQuery({
    queryKey: expenseKeys.all,
    queryFn: async () => {
      const response = await expensesAPI.getExpenses();
      return response;
    },
    select: normalizeExpenseData,
  });
};

/**
 * Hook to get expense totals (derived from expenses query)
 * 
 * @example
 * ```tsx
 * const { data: totals } = useExpenseTotals();
 * console.log(totals?.total);
 * ```
 */
export const useExpenseTotals = () => {
  const { data: expenses, ...rest } = useExpensesQuery();
  
  return {
    ...rest,
    data: expenses ? calculateExpenseTotals(expenses) : undefined,
  };
};

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to add a new expense item with optimistic updates
 * 
 * @example
 * ```tsx
 * const addExpense = useAddExpenseMutation();
 * 
 * addExpense.mutate({
 *   name: 'Rent',
 *   amount: 1500,
 * });
 * ```
 */
export const useAddExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddExpenseInput) => {
      const response = await expensesAPI.addExpense(input.name, input.amount);
      // API may return { expense: {...} } or the item directly
      const expenseData = response.expense || response;
      return normalizeExpenseItem(expenseData);
    },

    onMutate: async (newExpense) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: expenseKeys.all });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<unknown[]>(expenseKeys.all);

      // Optimistically update the cache
      queryClient.setQueryData<unknown[]>(expenseKeys.all, (old) => {
        const oldArray = Array.isArray(old) ? old : [];
        
        // Create optimistic item with temporary negative ID
        const optimisticItem = {
          id: -Date.now(), // Temporary ID (will be replaced on success)
          name: newExpense.name,
          amount: newExpense.amount,
        };
        
        return [...oldArray, optimisticItem];
      });

      // Return context with snapshot for potential rollback
      return { previousData };
    },

    onError: (_error, _newExpense, context) => {
      // Rollback to previous state on error
      if (context?.previousData) {
        queryClient.setQueryData(expenseKeys.all, context.previousData);
      }
    },

    onSettled: () => {
      // Always refetch after error or success to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
};

/**
 * Hook to update an existing expense item with optimistic updates
 * 
 * @example
 * ```tsx
 * const updateExpense = useUpdateExpenseMutation();
 * 
 * updateExpense.mutate({
 *   id: 1,
 *   name: 'Updated Rent',
 *   amount: 1600,
 * });
 * ```
 */
export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateExpenseInput) => {
      const response = await expensesAPI.updateExpense(input.id, input.name, input.amount);
      const expenseData = response.expense || response;
      return normalizeExpenseItem(expenseData);
    },

    onMutate: async (updatedExpense) => {
      await queryClient.cancelQueries({ queryKey: expenseKeys.all });

      const previousData = queryClient.getQueryData<unknown[]>(expenseKeys.all);

      queryClient.setQueryData<unknown[]>(expenseKeys.all, (old) => {
        const oldArray = Array.isArray(old) ? old : [];
        
        return oldArray.map((item: any) => {
          if (item.id === updatedExpense.id) {
            return {
              ...item,
              name: updatedExpense.name,
              amount: updatedExpense.amount,
            };
          }
          return item;
        });
      });

      return { previousData };
    },

    onError: (_error, _updatedExpense, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(expenseKeys.all, context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
};

/**
 * Hook to delete an expense item with optimistic updates
 * 
 * @example
 * ```tsx
 * const deleteExpense = useDeleteExpenseMutation();
 * 
 * deleteExpense.mutate({ id: 1 });
 * ```
 */
export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteExpenseInput) => {
      await expensesAPI.deleteExpense(input.id);
      return input;
    },

    onMutate: async (deletedExpense) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: expenseKeys.all });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<unknown[]>(expenseKeys.all);

      // Optimistically remove from cache
      queryClient.setQueryData<unknown[]>(expenseKeys.all, (old) => {
        const oldArray = Array.isArray(old) ? old : [];
        return oldArray.filter((item: any) => item.id !== deletedExpense.id);
      });

      // Return context with snapshot for potential rollback
      return { previousData };
    },

    onError: (_error, _deletedExpense, context) => {
      // Rollback to previous state on error
      if (context?.previousData) {
        queryClient.setQueryData(expenseKeys.all, context.previousData);
      }
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
};

// ============================================================================
// Prefetch Helper
// ============================================================================

/**
 * Prefetch expense data (useful for route preloading)
 * 
 * @example
 * ```tsx
 * const queryClient = useQueryClient();
 * 
 * // On hover or before navigation
 * prefetchExpenses(queryClient);
 * ```
 */
export const prefetchExpenses = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.prefetchQuery({
    queryKey: expenseKeys.all,
    queryFn: () => expensesAPI.getExpenses(),
  });
};
