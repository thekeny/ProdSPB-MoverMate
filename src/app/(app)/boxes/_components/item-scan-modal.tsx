import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Camera, Loader2, Plus, Trash2 } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { scanItems } from "@/api/items";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { ITEM_PRIORITY_OPTIONS } from "@/configs/consts/item-priorities.const";
import { plural } from "@/lib/format";
import {
  type ItemScanFormValues,
  itemScanPlacementSchema,
  itemScanSchema,
} from "@/lib/forms/project.schema";
import { prepareScanImage, scanErrorMessage } from "@/lib/scan-image";

export function ItemScanModal({
  projectId,
  submitLabel,
  placement,
  onClose,
  onSubmit,
}: {
  projectId: string;
  submitLabel: string;
  placement?: { sourceRooms: string[]; defaultRoom: string };
  onClose: () => void;
  onSubmit: (values: ItemScanFormValues) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemScanFormValues>({
    resolver: zodResolver(placement ? itemScanPlacementSchema : itemScanSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      room: placement?.defaultRoom ?? "",
      priority: "NORMAL",
      items: [],
    },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });
  const scan = useMutation({
    mutationFn: async (file: File) =>
      scanItems(projectId, await prepareScanImage(file)),
  });

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const pickPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setListOpen(false);
    replace([]);
    scan.mutate(file, {
      onSuccess: ({ items }) => {
        replace(
          items.map(({ name, quantity }) => ({
            name,
            quantity: Math.max(1, quantity),
          })),
        );
        setListOpen(items.length > 0);
      },
    });
  };

  const addRow = () => {
    append({ name: "", quantity: 1 });
    setListOpen(true);
  };

  const found = scan.data?.items.length ?? 0;

  return (
    <Modal className="max-w-xl" label="Вещи по фото" onClose={onClose}>
      <h2 className="pr-10 text-2xl font-extrabold tracking-[-0.04em]">
        Вещи по фото
      </h2>
      <p className="mt-2 text-sm text-[#4E5752]">
        Сфотографируйте вещи, а мы составим список. Проверьте его перед
        добавлением.
      </p>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={pickPhoto}
      />
      <div className="mt-5 flex items-center gap-4 rounded-lg bg-[#F5F3EE] p-3">
        {preview ? (
          // biome-ignore lint/performance/noImgElement: local blob preview
          <img
            src={preview}
            alt="Выбранное фото"
            className="size-20 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="grid size-20 shrink-0 place-items-center rounded-md bg-[#E2E9DD]">
            <Camera aria-hidden="true" className="size-7 text-[#42664D]" />
          </div>
        )}
        <div className="grid min-w-0 flex-1 justify-items-start gap-2">
          <p aria-live="polite" className="text-sm">
            {scan.isPending ? (
              <span className="flex items-center gap-2 font-bold">
                <Loader2
                  aria-hidden="true"
                  className="size-4 animate-spin text-[#42664D]"
                />
                Распознаём вещи…
              </span>
            ) : scan.isError ? (
              <span role="alert" className="text-[#A84D3C]">
                {scanErrorMessage(scan.error)}
              </span>
            ) : scan.isSuccess ? (
              found ? (
                <span className="font-bold">
                  Нашли {found} {plural(found, ["вещь", "вещи", "вещей"])}
                </span>
              ) : (
                <span className="text-[#68716C]">
                  Вещей на фото не нашлось. Попробуйте другой ракурс.
                </span>
              )
            ) : (
              <span className="text-[#68716C]">
                JPEG, PNG, WebP или GIF до 5 МБ
              </span>
            )}
          </p>
          <Button
            variant="outline"
            disabled={scan.isPending}
            onClick={() => fileInput.current?.click()}
          >
            <Camera />
            {preview ? "Другое фото" : "Выбрать фото"}
          </Button>
        </div>
      </div>
      {listOpen ? (
        <form
          onSubmit={handleSubmit((values) => {
            onSubmit(values);
            onClose();
          })}
          noValidate
          className="mt-5 grid gap-4"
        >
          <div className="grid gap-2">
            {fields.map((field, index) => {
              const error =
                errors.items?.[index]?.name?.message ??
                errors.items?.[index]?.quantity?.message;
              const errorId = `scan-item-${field.id}-error`;
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-[minmax(0,1fr)_4.5rem_auto] items-center gap-2"
                >
                  <TextInput
                    {...register(`items.${index}.name`)}
                    placeholder="Название вещи"
                    aria-label={`Название вещи ${index + 1}`}
                    aria-invalid={
                      errors.items?.[index]?.name ? true : undefined
                    }
                    aria-describedby={error ? errorId : undefined}
                  />
                  <TextInput
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    aria-label={`Количество, вещь ${index + 1}`}
                    aria-invalid={
                      errors.items?.[index]?.quantity ? true : undefined
                    }
                    aria-describedby={error ? errorId : undefined}
                  />
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    aria-label={`Убрать вещь ${index + 1}`}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  {error && (
                    <p
                      id={errorId}
                      role="alert"
                      className="col-span-full text-xs text-[#A84D3C]"
                    >
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
            {errors.items?.root?.message || errors.items?.message ? (
              <p role="alert" className="text-xs text-[#A84D3C]">
                {errors.items?.root?.message ?? errors.items?.message}
              </p>
            ) : null}
            <Button
              variant="ghost"
              className="justify-self-start"
              onClick={addRow}
            >
              <Plus />
              Добавить строку
            </Button>
          </div>
          {placement && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Из комнаты">
                <Controller
                  control={control}
                  name="room"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={placement.sourceRooms.map((room) => ({
                        label: room,
                        value: room,
                      }))}
                    >
                      <SelectTrigger onBlur={field.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {placement.sourceRooms.map((room) => (
                          <SelectItem key={room} value={room}>
                            {room}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Приоритет">
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={ITEM_PRIORITY_OPTIONS}
                    >
                      <SelectTrigger onBlur={field.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      ) : (
        scan.isSuccess && (
          <Button variant="ghost" className="mt-3" onClick={addRow}>
            <Plus />
            Ввести вручную
          </Button>
        )
      )}
    </Modal>
  );
}
