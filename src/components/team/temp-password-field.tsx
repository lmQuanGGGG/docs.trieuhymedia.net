"use client";

import { Copy, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Mật khẩu tạm ngẫu nhiên 12 ký tự, bỏ các ký tự dễ nhầm (0/O, 1/l/I) */
export function generateTempPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function TempPasswordField({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const t = useTranslations("team");
  return (
    <div className="flex gap-2">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid}
        className="font-mono"
      />
      <Button type="button" variant="ghost" size="icon" onClick={() => onChange(generateTempPassword())} aria-label={t("generate")}>
        <RefreshCw />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label={t("copy")}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            toast.success(t("copied"));
          } catch {
            // Clipboard bị chặn: người dùng tự chọn và sao chép
          }
        }}
      >
        <Copy />
      </Button>
    </div>
  );
}
