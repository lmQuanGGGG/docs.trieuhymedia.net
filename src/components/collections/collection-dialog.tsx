"use client";

import { Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FileTypeIcon } from "@/components/documents/file-type-icon";
import { FormField } from "@/components/shared/form-field";
import type { CollectionInput } from "@/lib/api";
import { useWorkspace } from "@/lib/store/workspace-store";
import { cn } from "@/lib/utils";
import type { CollectionMode, ShareCollectionItem } from "@/types";

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

/** Tạo/sửa bộ chia sẻ: chọn "tất cả tài liệu của tôi" hoặc chọn tay từng tài liệu */
export function CollectionDialog({
  open,
  initial,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  initial: ShareCollectionItem | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CollectionInput) => Promise<void>;
}) {
  const t = useTranslations("collections");
  const tc = useTranslations("common");
  const { documents, currentUserId } = useWorkspace();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [mode, setMode] = useState<CollectionMode>(initial?.mode ?? "selected");
  const [includePrivate, setIncludePrivate] = useState(initial?.includePrivate ?? false);
  const [selected, setSelected] = useState<string[]>(initial?.documentIds ?? []);
  const [allowDownload, setAllowDownload] = useState(initial?.allowDownload ?? true);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [password, setPassword] = useState("");
  const [removePassword, setRemovePassword] = useState(false);
  const [expiry, setExpiry] = useState(toDateInput(initial?.expiresAt ?? null));
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  // Chỉ chọn được tài liệu mình có quyền chia sẻ
  const shareable = useMemo(() => documents.filter((d) => d.can?.share), [documents]);
  const visible = shareable.filter((d) => d.title.toLowerCase().includes(query.trim().toLowerCase()));
  const mine = documents.filter((d) => d.ownerId === currentUserId && (includePrivate || d.visibility !== "private"));
  const titleError = touched && title.trim().length < 3 ? t("titleError") : undefined;
  const selectError = touched && mode === "selected" && selected.length === 0 ? t("selectError") : undefined;

  const toggle = (id: string, on: boolean) => setSelected((s) => (on ? [...s, id] : s.filter((x) => x !== id)));

  const submit = async () => {
    setTouched(true);
    if (title.trim().length < 3 || (mode === "selected" && selected.length === 0)) return;
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        mode,
        includePrivate,
        documentIds: mode === "selected" ? selected : [],
        allowDownload,
        isActive,
        password: removePassword ? "" : password || undefined,
        expiresAt: expiry ? `${expiry}T23:59:59+07:00` : null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? t("editTitle") : t("createTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <FormField id="col-title" label={t("titleLabel")} error={titleError}>
            <Input id="col-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("titlePlaceholder")} aria-invalid={!!titleError} />
          </FormField>
          <FormField id="col-desc" label={t("descriptionLabel")}>
            <Textarea id="col-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormField>

          <fieldset className="grid gap-2">
            <legend className="mb-1.5 text-[13px] font-medium">{t("modeLabel")}</legend>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
              {(["selected", "all"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-xl bg-muted/50 p-3 text-left transition-all hover:bg-muted",
                    mode === m && "bg-card shadow-lift ring-2 ring-brand/50",
                  )}
                >
                  <span className="block text-sm font-medium">{t(`mode.${m}`)}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{t(`mode.${m}Hint`)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {mode === "all" ? (
            <div className="grid gap-2 rounded-xl bg-muted/50 p-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="col-private" className="font-normal">{t("includePrivate")}</Label>
                <Switch id="col-private" checked={includePrivate} onCheckedChange={setIncludePrivate} />
              </div>
              <p className="text-xs text-muted-foreground">{t("allPreview", { count: mine.length })}</p>
            </div>
          ) : (
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium">{t("pickLabel", { count: selected.length })}</span>
                {shareable.length > 0 ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-brand hover:underline"
                    onClick={() => setSelected(selected.length === shareable.length ? [] : shareable.map((d) => d.id))}
                  >
                    {selected.length === shareable.length ? t("clearAll") : t("selectAll")}
                  </button>
                ) : null}
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" />
              </div>
              <ul className="max-h-60 overflow-y-auto rounded-xl bg-muted/40 p-1">
                {visible.length === 0 ? (
                  <li className="p-4 text-center text-sm text-muted-foreground">{t("noShareable")}</li>
                ) : (
                  visible.map((d) => (
                    <li key={d.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-card">
                        <Checkbox checked={selected.includes(d.id)} onCheckedChange={(v) => toggle(d.id, v === true)} />
                        <FileTypeIcon type={d.type} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-sm">{d.title}</span>
                      </label>
                    </li>
                  ))
                )}
              </ul>
              {selectError ? <p role="alert" className="text-xs text-destructive">{selectError}</p> : null}
            </div>
          )}

          <div className="grid gap-4 rounded-xl bg-muted/50 p-4">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="col-download" className="font-normal">{t("allowDownload")}</Label>
              <Switch id="col-download" checked={allowDownload} onCheckedChange={setAllowDownload} />
            </div>
            {initial ? (
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="col-active" className="font-normal">{t("active")}</Label>
                <Switch id="col-active" checked={isActive} onCheckedChange={setIsActive} />
              </div>
            ) : null}
            <FormField
              id="col-password"
              label={t("password")}
              hint={initial?.passwordProtected && !removePassword ? t("passwordSet") : t("passwordHint")}
            >
              <div className="flex gap-2">
                <Input id="col-password" type="password" autoComplete="new-password" value={password} disabled={removePassword} onChange={(e) => setPassword(e.target.value)} />
                {initial?.passwordProtected ? (
                  <Button type="button" variant={removePassword ? "secondary" : "ghost"} onClick={() => setRemovePassword((v) => !v)}>
                    {t("removePassword")}
                  </Button>
                ) : null}
              </div>
            </FormField>
            <FormField id="col-expiry" label={t("expiry")} hint={expiry ? undefined : t("noExpiry")}>
              <Input id="col-expiry" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </FormField>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{tc("cancel")}</Button>
          <Button onClick={() => void submit()} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : null}
            {initial ? tc("saveChanges") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
