"use client";

// Toast system inspired by react-hot-toast library
import * as React from "react";

/**
 * Maximum number of toasts allowed on screen at once
 */
const TOAST_LIMIT = 1;

/**
 * Delay before a toast is fully removed from memory
 * (allows exit animation before deletion)
 */
const TOAST_REMOVE_DELAY = 1000000;

/**
 * Action types for toast reducer
 */
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST"
};

/**
 * Internal counter used to generate unique toast IDs
 */
let count = 0;

/**
 * Generates unique toast ID
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

/**
 * Stores active timeout references for toast removal
 */
const toastTimeouts = new Map();

/**
 * Adds toast to removal queue after delay
 * Ensures toast is removed from state after animation time
 */
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);

    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * Toast Reducer
 * Handles all toast state transitions:
 * - Add
 * - Update
 * - Dismiss
 * - Remove
 */
export const reducer = (state, action) => {
  switch (action.type) {

    /**
     * ADD_TOAST
     * Adds a new toast and respects TOAST_LIMIT
     */
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    /**
     * UPDATE_TOAST
     * Updates existing toast by ID
     */
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    /**
     * DISMISS_TOAST
     * Marks toast as closed and schedules removal
     */
    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Trigger removal queue for animation delay
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }

    /**
     * REMOVE_TOAST
     * Fully removes toast from state
     */
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }

      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

/**
 * Listeners subscribed to toast state changes
 */
const listeners = [];

/**
 * In-memory global toast state
 */
let memoryState = { toasts: [] };

/**
 * Dispatch function
 * Updates global state and notifies all listeners
 */
function dispatch(action) {
  memoryState = reducer(memoryState, action);

  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

/**
 * Toast creator function
 * Used to create new toast notifications
 */
function toast({ ...props }) {
  const id = genId();

  /**
   * Update existing toast
   */
  const update = (props) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });

  /**
   * Dismiss current toast
   */
  const dismiss = () =>
    dispatch({ type: "DISMISS_TOAST", toastId: id });

  /**
   * Add new toast to state
   */
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,

      /**
       * Auto-dismiss handler when UI closes toast
       */
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

/**
 * React hook to subscribe to toast state
 * Components use this to display toast UI
 */
function useToast() {
  const [state, setState] = React.useState(memoryState);

  /**
   * Subscribe to toast state updates
   */
  React.useEffect(() => {
    listeners.push(setState);

    return () => {
      const index = listeners.indexOf(setState);

      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId) =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };