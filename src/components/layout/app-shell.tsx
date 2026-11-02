"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { DocumentDialogs } from "@/components/documents/document-dialogs";
import { DialogsProvider } from "@/lib/store/dialogs-store";
import { WorkspaceProvider } from "@/lib/store/workspace-store";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { WorkspaceGate } from "./workspace-gate";

const STORAGE_KEY = "thm-sidebar-collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- đọc tuỳ chọn đã lưu sau khi hydrate
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage có thể bị chặn; dùng mặc định
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // bỏ qua
      }
      return next;
    });
  }, []);

  return (
    <WorkspaceProvider>
      <DialogsProvider>
        <div className="flex min-h-dvh bg-canvas">
          <AppSidebar collapsed={collapsed} onToggle={toggle} />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader />
            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-8">
              <WorkspaceGate>{children}</WorkspaceGate>
            </main>
          </div>
        </div>
        <DocumentDialogs />
      </DialogsProvider>
    </WorkspaceProvider>
  );
}
