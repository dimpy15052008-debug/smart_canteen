/**
 * AuthCursorContext.tsx
 * Shared context for the AuthCursor component.
 * Buttons communicate their cursor state here; the cursor reads it.
 * No prop-drilling required.
 */
import React, { createContext, useState, useCallback, useMemo } from "react";

export type AuthCursorState = "idle" | "hover" | "pressed" | "loading";

export interface AuthCursorContextValue {
  cursorState: AuthCursorState;
  setCursorState: (state: AuthCursorState) => void;
}

export const AuthCursorContext = createContext<AuthCursorContextValue | null>(null);

export const AuthCursorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cursorState, setCursorStateRaw] = useState<AuthCursorState>("idle");

  const setCursorState = useCallback((state: AuthCursorState) => {
    setCursorStateRaw(state);
  }, []);

  const value = useMemo(
    () => ({ cursorState, setCursorState }),
    [cursorState, setCursorState]
  );

  return (
    <AuthCursorContext.Provider value={value}>
      {children}
    </AuthCursorContext.Provider>
  );
};
