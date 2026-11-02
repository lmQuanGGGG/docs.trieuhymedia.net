"use client";

import { useTranslations } from "next-intl";
import { type Control, Controller, type FieldValues, type Path } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { brands, categorySlugs, visibilities } from "@/types";

interface MetaValues extends FieldValues {
  category: string;
  brand: string;
  visibility: string;
}

/** Ba trường chọn dùng chung: danh mục, thương hiệu, quyền xem */
export function MetaSelectFields<T extends MetaValues>({ control, idPrefix }: { control: Control<T>; idPrefix: string }) {
  const t = useTranslations();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Controller
        control={control}
        name={"category" as Path<T>}
        render={({ field }) => (
          <FormField id={`${idPrefix}-category`} label={t("dialogs.upload.categoryLabel")}>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`${idPrefix}-category`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categorySlugs.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`categories.${c}.name`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
      <Controller
        control={control}
        name={"brand" as Path<T>}
        render={({ field }) => (
          <FormField id={`${idPrefix}-brand`} label={t("dialogs.upload.brandLabel")}>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`${idPrefix}-brand`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
      <Controller
        control={control}
        name={"visibility" as Path<T>}
        render={({ field }) => (
          <FormField id={`${idPrefix}-visibility`} label={t("dialogs.upload.visibilityLabel")} className="sm:col-span-2">
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`${idPrefix}-visibility`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilities.map((v) => (
                  <SelectItem key={v} value={v}>
                    {t(`visibility.${v}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
    </div>
  );
}
