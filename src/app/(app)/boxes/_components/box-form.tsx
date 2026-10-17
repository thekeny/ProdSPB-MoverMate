import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ItemScanModal } from "@/app/(app)/boxes/_components/item-scan-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChipInput } from "@/components/ui/chip-input";
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
import { type BoxFormValues, boxSchema } from "@/lib/forms/project.schema";
import { mergeItemEntries } from "@/lib/item-entries";

export function BoxForm({
  projectId,
  onClose,
  onSubmit,
  destinationRooms,
  sourceRooms,
  lastSourceRoom,
}: {
  projectId: string;
  onClose: () => void;
  onSubmit: (values: BoxFormValues) => Promise<boolean>;
  destinationRooms: string[];
  sourceRooms: string[];
  lastSourceRoom: string;
}) {
  const fragileId = useId();
  const [scanOpen, setScanOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BoxFormValues>({
    resolver: zodResolver(boxSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      room: destinationRooms[0] ?? "",
      sourceRoom: lastSourceRoom || sourceRooms[0] || "",
      items: [],
      fragile: false,
    },
  });
  return (
    <>
      <Modal className="max-w-xl" label="Новая коробка" onClose={onClose}>
        <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
          Новая коробка
        </h2>
        <form
          onSubmit={handleSubmit(async (values) => {
            if (await onSubmit(values)) onClose();
          })}
          noValidate
          className="mt-6 grid gap-4"
        >
          <Field label="Описание (необязательно)" error={errors.title?.message}>
            <TextInput
              {...register("title")}
              maxLength={100}
              placeholder="Посуда на первое время"
            />
          </Field>
          <Field label="Куда">
            <Controller
              control={control}
              name="room"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={destinationRooms.map((room) => ({
                    label: room,
                    value: room,
                  }))}
                >
                  <SelectTrigger onBlur={field.onBlur}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationRooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        <span className="[overflow-wrap:anywhere]">{room}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Вещи из комнаты">
            <Controller
              control={control}
              name="sourceRoom"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={sourceRooms.map((room) => ({
                    label: room,
                    value: room,
                  }))}
                >
                  <SelectTrigger onBlur={field.onBlur}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceRooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        <span className="[overflow-wrap:anywhere]">{room}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <div className="grid gap-2">
            <Field label="Содержимое коробки">
              <Controller
                control={control}
                name="items"
                render={({ field }) => (
                  <ChipInput
                    ariaLabel="Содержимое коробки"
                    value={field.value.map((item) => item.name)}
                    onValueChange={(names) =>
                      field.onChange(
                        names.map(
                          (name) =>
                            field.value.find((item) => item.name === name) ?? {
                              name,
                              quantity: 1,
                            },
                        ),
                      )
                    }
                    formatToken={(name) => {
                      const quantity =
                        field.value.find((item) => item.name === name)
                          ?.quantity ?? 1;
                      return quantity > 1 ? `${name} · ${quantity} шт.` : name;
                    }}
                    onBlur={field.onBlur}
                    placeholder="Вещь и нажмите Enter"
                    enterOnly
                    maxLength={100}
                  />
                )}
              />
            </Field>
            <Button
              variant="outline"
              className="justify-self-start"
              onClick={() => setScanOpen(true)}
            >
              <Camera />
              Добавить по фото
            </Button>
          </div>
          <label
            htmlFor={fragileId}
            className="flex cursor-pointer items-center gap-2 text-sm font-bold"
          >
            <Controller
              control={control}
              name="fragile"
              render={({ field }) => (
                <Checkbox
                  id={fragileId}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            Хрупкое содержимое
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Создать
            </Button>
          </div>
        </form>
      </Modal>
      {scanOpen && (
        <ItemScanModal
          projectId={projectId}
          submitLabel="Добавить в коробку"
          onClose={() => setScanOpen(false)}
          onSubmit={({ items }) =>
            setValue("items", mergeItemEntries(getValues("items"), items), {
              shouldDirty: true,
            })
          }
        />
      )}
    </>
  );
}
