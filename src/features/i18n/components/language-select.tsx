"use client";

import { Select } from "@mantine/core";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Language");
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      label={compact ? undefined : t("label")}
      aria-label={compact ? t("label") : undefined}
      w={compact ? 140 : undefined}
      size={compact ? "sm" : undefined}
      value={locale}
      data={[
        { value: "vi", label: t("vietnamese") },
        { value: "en", label: t("english") },
        { value: "ko", label: t("korean") },
      ]}
      allowDeselect={false}
      disabled={isPending}
      onChange={(value) => {
        if (!value || value === locale) return;

        startTransition(async () => {
          await setLocale(value);
          router.refresh();
        });
      }}
    />
  );
}
