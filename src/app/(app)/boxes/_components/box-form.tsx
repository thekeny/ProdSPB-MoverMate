import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
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

export function BoxForm({
  onClose,
  onSubmit,
  destinationRooms,
  sourceRooms,
  lastSourceRoom,
}: {
  onClose: () => void;
  onSubmit: (values: BoxFormValues) => void;
  destinationRooms: string[];
  sourceRooms: string[];
  lastSourceRoom: string;
}) {
  const fragileId = useId();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
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
    <Modal className="max-w-xl" label="Новая коробка" onClose={onClose}>
      <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
        Новая коробка
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 grid gap-4"
      >
        <Field label="Краткое описание" error={errors.title?.message}>
          <TextInput
            {...register("title")}
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
                      {room}
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
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Содержимое коробки">
          <Controller
            control={control}
            name="items"
            render={({ field }) => (
              <ChipInput
                ariaLabel="Содержимое коробки"
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Вещь, пробел или Enter"
              />
            )}
          />
        </Field>
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
          <Button type="submit">Создать</Button>
        </div>
      </form>
    </Modal>
  );
}
