"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Form mở khoá link chia sẻ có mật khẩu; server đặt cookie rồi trang được render lại */
export function ShareUnlockForm({ token }: { token: string }) {
  const t = useTranslations("publicLock");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(false);
    const res = await fetch(`/api/share/${encodeURIComponent(token)}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setPending(false);
    if (res?.ok) router.refresh();
    else setError(true);
  };

  return (
    <form onSubmit={submit} className="surface mx-auto grid w-full max-w-md gap-4 p-8" noValidate>
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
        <LockKeyhole className="size-5" />
      </span>
      <div>
        <h1 className="text-lg font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="share-unlock">{t("password")}</Label>
        <Input
          id="share-unlock"
          type="password"
          autoFocus
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error}
        />
        {error ? <p role="alert" className="text-xs text-destructive">{t("wrong")}</p> : null}
      </div>
      <Button type="submit" disabled={pending || !password}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        {t("submit")}
      </Button>
    </form>
  );
}
