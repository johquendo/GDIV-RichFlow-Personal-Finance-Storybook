/**
 * Pure Reducer Functions for Financial State Reconstruction
 * 
 * This module contains pure functions for reconstructing financial state
 * from event streams. No database interactions - only state transformations.
 */

import { EntityType, ActionType, Event } from '../../types/event.types.js';

/**
 * Represents the reconstructed financial state at a point in time
 */
export interface FinancialState {
    assets: Map<number, { id: number; name: string; value: number }>;
    liabilities: Map<number, { id: number; name: string; value: number }>;
    incomeLines: Map<number, { id: number; name: string; amount: number; type: string; quadrant?: string | null }>;
    expenses: Map<number, { id: number; name: string; amount: number }>;
    cashSavings: number;
    currency: { symbol: string; name: string };
}

/**
 * Creates an empty initial financial state
 */
export function createEmptyState(currency: { symbol: string; name: string }): FinancialState {
    return {
        assets: new Map(),
        liabilities: new Map(),
        incomeLines: new Map(),
        expenses: new Map(),
        cashSavings: 0,
        currency: { ...currency }
    };
}

/**
 * Reducer for ASSET entity events
 */
export const assetReducer = (state: FinancialState, event: Event): FinancialState => {
    const newState = { ...state, assets: new Map(state.assets) };
    const { actionType, entityId, afterValue } = event;

    switch (actionType) {
        case ActionType.CREATE:
        case ActionType.UPDATE:
            if (afterValue) {
                newState.assets.set(entityId, {
                    id: entityId,
                    name: afterValue.name,
                    value: Number(afterValue.value)
                });
            }
            break;
        case ActionType.DELETE:
            newState.assets.delete(entityId);
            break;
    }
    return newState;
};

/**
 * Reducer for LIABILITY entity events
 */
export const liabilityReducer = (state: FinancialState, event: Event): FinancialState => {
    const newState = { ...state, liabilities: new Map(state.liabilities) };
    const { actionType, entityId, afterValue } = event;

    switch (actionType) {
        case ActionType.CREATE:
        case ActionType.UPDATE:
            if (afterValue) {
                newState.liabilities.set(entityId, {
                    id: entityId,
                    name: afterValue.name,
                    value: Number(afterValue.value)
                });
            }
            break;
        case ActionType.DELETE:
            newState.liabilities.delete(entityId);
            break;
    }
    return newState;
};

/**
 * Reducer for INCOME entity events
 */
export const incomeReducer = (state: FinancialState, event: Event): FinancialState => {
    if (event.entitySubtype === 'INCOME_STATEMENT') return state;

    const newState = { ...state, incomeLines: new Map(state.incomeLines) };
    const { actionType, entityId, afterValue } = event;

    switch (actionType) {
        case ActionType.CREATE:
        case ActionType.UPDATE:
            if (afterValue) {
                newState.incomeLines.set(entityId, {
                    id: entityId,
                    name: afterValue.name,
                    amount: Number(afterValue.amount),
                    type: afterValue.type,
                    quadrant: afterValue.quadrant || null
                });
            }
            break;
        case ActionType.DELETE:
            newState.incomeLines.delete(entityId);
            break;
    }
    return newState;
};

/**
 * Reducer for EXPENSE entity events
 */
export const expenseReducer = (state: FinancialState, event: Event): FinancialState => {
    const newState = { ...state, expenses: new Map(state.expenses) };
    const { actionType, entityId, afterValue } = event;

    switch (actionType) {
        case ActionType.CREATE:
        case ActionType.UPDATE:
            if (afterValue) {
                newState.expenses.set(entityId, {
                    id: entityId,
                    name: afterValue.name,
                    amount: Number(afterValue.amount)
                });
            }
            break;
        case ActionType.DELETE:
            newState.expenses.delete(entityId);
            break;
    }
    return newState;
};

/**
 * Reducer for CASH_SAVINGS entity events
 */
export const cashSavingsReducer = (state: FinancialState, event: Event): FinancialState => {
    const { actionType, afterValue } = event;

    if ((actionType === ActionType.CREATE || actionType === ActionType.UPDATE) && afterValue && afterValue.amount !== undefined) {
        return { ...state, cashSavings: Number(afterValue.amount) };
    }
    return state;
};

/**
 * Reducer for USER entity events (currency changes)
 */
export const userReducer = (state: FinancialState, event: Event): FinancialState => {
    const { actionType, afterValue } = event;

    if (actionType === ActionType.UPDATE && afterValue && afterValue.currencyCode) {
        return {
            ...state,
            currency: {
                symbol: afterValue.currencyCode,
                name: afterValue.currencyName || afterValue.currencyCode
            }
        };
    }
    return state;
};

/**
 * Root Reducer: Dispatches to specific reducers based on entity type
 */
export const rootReducer = (state: FinancialState, event: Event): FinancialState => {
    switch (event.entityType) {
        case EntityType.ASSET:
            return assetReducer(state, event);
        case EntityType.LIABILITY:
            return liabilityReducer(state, event);
        case EntityType.INCOME:
            return incomeReducer(state, event);
        case EntityType.EXPENSE:
            return expenseReducer(state, event);
        case EntityType.CASH_SAVINGS:
            return cashSavingsReducer(state, event);
        case EntityType.USER:
            return userReducer(state, event);
        default:
            return state;
    }
};

/**
 * Reconstruct financial state from a list of events up to a target date
 * Uses the pure reducer pattern
 */
export function reconstructStateFromEvents(
    events: Event[],
    targetDate: Date,
    initialCurrency: { symbol: string; name: string }
): FinancialState {
    const initialState = createEmptyState(initialCurrency);

    // Filter events up to targetDate and sort chronologically
    const relevantEvents = events
        .filter(e => new Date(e.timestamp) <= targetDate)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Apply reducer pipeline
    return relevantEvents.reduce(rootReducer, initialState);
}

/**
 * Helper to hydrate FinancialState from JSON snapshot
 * Handles Map reconstruction from serialized arrays
 */
export function hydrateStateFromSnapshot(snapshotData: any): FinancialState {
    return {
        assets: new Map(snapshotData.assets),
        liabilities: new Map(snapshotData.liabilities),
        incomeLines: new Map(snapshotData.incomeLines),
        expenses: new Map(snapshotData.expenses),
        cashSavings: Number(snapshotData.cashSavings),
        currency: snapshotData.currency
    };
}

/**
 * Helper to serialize FinancialState to JSON-compatible object
 * Handles Map serialization to arrays
 */
export function serializeStateForSnapshot(state: FinancialState): any {
    return {
        assets: Array.from(state.assets.entries()),
        liabilities: Array.from(state.liabilities.entries()),
        incomeLines: Array.from(state.incomeLines.entries()),
        expenses: Array.from(state.expenses.entries()),
        cashSavings: state.cashSavings,
        currency: state.currency
    };
}
