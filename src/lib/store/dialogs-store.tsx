"use client";

import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

export type DialogState =
  | { kind: "upload" }
  | { kind: "newDocument" }
  | { kind: "folder" }
  | { kind: "share"; documentId?: string }
  | { kind: "rename"; documentId: string }
  | { kind: "delete"; documentIds: string[]; onDone?: () => void }
  | null;

interface DialogsContextValue {
  dialog: DialogState;
  open: (dialog: Exclude<DialogState, null>) => void;
  close: () => void;
}

const DialogsContext = createContext<DialogsContextValue | null>(null);

export function DialogsProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const value = useMemo<DialogsContextValue>(
    () => ({ dialog, open: setDialog, close: () => setDialog(null) }),
    [dialog],
  );
  return <DialogsContext.Provider value={value}>{children}</DialogsContext.Provider>;
}

export function useDialogs(): DialogsContextValue {
  const ctx = useContext(DialogsContext);
  if (!ctx) throw new Error("useDialogs phải nằm trong DialogsProvider");
  return ctx;
}
