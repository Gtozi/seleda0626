import React, { createContext, useContext, useRef, useCallback } from 'react';

export interface ReturnTarget {
  /** Unique identifier for this return target. */
  id: string;
  /** Human-readable name for debugging/logging. */
  name: string;
  /** Callback that restores this target (e.g. switches tab, reopens modal). */
  restore: () => void;
}

interface ModalReturnContextValue {
  /** Push a new return target onto the stack. */
  push: (target: ReturnTarget) => void;
  /** Pop the top return target from the stack. */
  pop: () => ReturnTarget | undefined;
  /** Peek at the top return target without removing it. */
  peek: () => ReturnTarget | undefined;
  /** Remove all targets from the stack. */
  clear: () => void;
  /** Current stack depth. */
  size: () => number;
}

const ModalReturnContext = createContext<ModalReturnContextValue | null>(null);

export const ModalReturnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stackRef = useRef<ReturnTarget[]>([]);

  const push = useCallback((target: ReturnTarget) => {
    stackRef.current.push(target);
  }, []);

  const pop = useCallback(() => {
    return stackRef.current.pop();
  }, []);

  const peek = useCallback(() => {
    return stackRef.current[stackRef.current.length - 1];
  }, []);

  const clear = useCallback(() => {
    stackRef.current = [];
  }, []);

  const size = useCallback(() => stackRef.current.length, []);

  return (
    <ModalReturnContext.Provider value={{ push, pop, peek, clear, size }}>
      {children}
    </ModalReturnContext.Provider>
  );
};

export const useModalReturn = () => {
  const ctx = useContext(ModalReturnContext);
  if (!ctx) {
    throw new Error('useModalReturn must be used within a ModalReturnProvider');
  }
  return ctx;
};
