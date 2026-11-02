"use client";

import { useDialogs } from "@/lib/store/dialogs-store";
import { useWorkspace } from "@/lib/store/workspace-store";
import { DeleteDialog } from "./dialogs/delete-dialog";
import { FolderDialog } from "./dialogs/folder-dialog";
import { NewDocumentDialog } from "./dialogs/new-document-dialog";
import { RenameDialog } from "./dialogs/rename-dialog";
import { ShareDialog } from "./dialogs/share-dialog";
import { UploadDialog } from "./dialogs/upload-dialog";

/** Nơi render tập trung mọi dialog thao tác tài liệu */
export function DocumentDialogs() {
  const { dialog, close } = useDialogs();
  const { getDocument } = useWorkspace();
  const onOpenChange = (open: boolean) => {
    if (!open) close();
  };

  return (
    <>
      <UploadDialog open={dialog?.kind === "upload"} onOpenChange={onOpenChange} />
      <NewDocumentDialog open={dialog?.kind === "newDocument"} onOpenChange={onOpenChange} />
      <FolderDialog open={dialog?.kind === "folder"} onOpenChange={onOpenChange} />
      <ShareDialog
        key={dialog?.kind === "share" ? (dialog.documentId ?? "pick") : "closed"}
        open={dialog?.kind === "share"}
        documentId={dialog?.kind === "share" ? dialog.documentId : undefined}
        onOpenChange={onOpenChange}
      />
      <RenameDialog
        document={dialog?.kind === "rename" ? getDocument(dialog.documentId) : undefined}
        onOpenChange={onOpenChange}
      />
      <DeleteDialog
        documentIds={dialog?.kind === "delete" ? dialog.documentIds : undefined}
        onDone={dialog?.kind === "delete" ? dialog.onDone : undefined}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
