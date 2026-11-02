"use client";

import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/shared/form-field";
import { SITE_URL } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { useWorkspace } from "@/lib/store/workspace-store";
import { useApiErrorToast } from "@/lib/use-api-error";
import type { ShareSettings } from "@/types";
import { FileTypeIcon } from "../file-type-icon";

/** Ngày dạng yyyy-mm-dd cho input type=date */
const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

function ShareSettingsForm({ documentId }: { documentId: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const showError = useApiErrorToast();
  const { getShare, updateShare } = useWorkspace();
  const [settings, setSettings] = useState<ShareSettings | null | undefined>(undefined);
  const [isActive, setIsActive] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [password, setPassword] = useState("");
  const [removePassword, setRemovePassword] = useState(false);
  const [expiry, setExpiry] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getShare(documentId)
      .then((s) => {
        if (cancelled) return;
        setSettings(s);
        setIsActive(s?.isActive ?? true);
        setAllowDownload(s?.allowDownload ?? false);
        setExpiry(toDateInput(s?.expiresAt ?? null));
      })
      .catch((error: unknown) => {
        if (!cancelled) setSettings(null);
        showError(error);
      });
    return () => {
      cancelled = true;
    };
  }, [documentId, getShare, showError]);

  if (settings === undefined) {
    return (
      <div className="grid gap-3" aria-busy="true" aria-label={t("dialogs.share.loading")}>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const shareUrl = settings?.token ? `${SITE_URL}/${locale}/share/${settings.token}` : "";

  const save = async () => {
    setSaving(true);
    try {
      const next = await updateShare(documentId, {
        isActive,
        allowDownload,
        password: removePassword ? "" : password || undefined,
        // Hết hạn vào cuối ngày đã chọn, theo giờ Việt Nam
        expiresAt: expiry ? `${expiry}T23:59:59+07:00` : null,
      });
      setSettings(next);
      setPassword("");
      setRemovePassword(false);
      toast.success(t("documents.toast.shareSaved"));
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t("documents.toast.linkCopied"));
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard có thể bị chặn; người dùng vẫn chọn và copy thủ công được
    }
  };

  return (
    <div className="grid gap-4">
      {shareUrl && settings?.isActive ? (
        <FormField id="share-link" label={t("dialogs.share.linkLabel")} hint={t("dialogs.share.views", { count: settings.views })}>
          <div className="flex gap-2">
            <Input id="share-link" readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
            <Button type="button" variant="secondary" onClick={copy} aria-label={t("common.copyLink")}>
              {copied ? <Check /> : <Copy />}
              <span className="hidden sm:inline">{t("common.copyLink")}</span>
            </Button>
          </div>
        </FormField>
      ) : null}

      <div className="grid gap-4 rounded-xl bg-muted/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Label htmlFor="share-active">{t("dialogs.share.enable")}</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("dialogs.share.enableHint")}</p>
          </div>
          <Switch id="share-active" checked={isActive} onCheckedChange={setIsActive} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="share-download" className="font-normal">{t("dialogs.share.allowDownload")}</Label>
          <Switch id="share-download" checked={allowDownload} onCheckedChange={setAllowDownload} />
        </div>
        <FormField
          id="share-password"
          label={t("dialogs.share.password")}
          hint={settings?.passwordProtected && !removePassword ? t("dialogs.share.passwordSet") : undefined}
        >
          <div className="flex gap-2">
            <Input
              id="share-password"
              type="password"
              autoComplete="new-password"
              value={password}
              disabled={removePassword}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("dialogs.share.passwordPlaceholder")}
            />
            {settings?.passwordProtected ? (
              <Button type="button" variant={removePassword ? "secondary" : "ghost"} onClick={() => setRemovePassword((v) => !v)}>
                {t("dialogs.share.removePassword")}
              </Button>
            ) : null}
          </div>
        </FormField>
        <FormField id="share-expiry" label={t("dialogs.share.expiry")} hint={expiry ? undefined : t("dialogs.share.noExpiry")}>
          <Input id="share-expiry" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </FormField>
      </div>

      <DialogFooter className="items-center sm:justify-between">
        {settings?.token && settings.isActive ? (
          <Button variant="ghost" size="sm" asChild className="text-brand">
            <Link href={`/share/${settings.token}`} target="_blank">
              <ExternalLink /> {t("dialogs.share.preview")}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : null}
          {t("dialogs.share.save")}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function ShareDialog({
  open,
  documentId,
  onOpenChange,
}: {
  open: boolean;
  documentId?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const { documents, getDocument } = useWorkspace();
  const [pickedId, setPickedId] = useState<string | undefined>(documentId);
  const doc = getDocument(documentId ?? pickedId ?? "");
  const shareable = documents.filter((d) => d.can?.share);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setPickedId(undefined);
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dialogs.share.title")}</DialogTitle>
          <DialogDescription>{t("dialogs.share.description")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {documentId ? (
            doc ? (
              <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                <FileTypeIcon type={doc.type} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.brand}</p>
                </div>
              </div>
            ) : null
          ) : (
            <FormField id="share-doc" label={t("dialogs.share.documentLabel")}>
              <Select value={pickedId} onValueChange={setPickedId}>
                <SelectTrigger id="share-doc" className="w-full">
                  <SelectValue placeholder={t("dialogs.share.pickDocument")} />
                </SelectTrigger>
                <SelectContent>
                  {shareable.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <span className="truncate">{d.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          {doc ? (
            doc.can?.share ? (
              <ShareSettingsForm key={doc.id} documentId={doc.id} />
            ) : (
              <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">{t("dialogs.share.noPermission")}</p>
            )
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
