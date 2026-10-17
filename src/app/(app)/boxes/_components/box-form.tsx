import type { FormEvent } from "react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { roomOptions } from "@/configs/consts/rooms.const";

export function BoxForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const fragileId = useId();
  return (
    <Modal className="max-w-md" label="Новая коробка" onClose={onClose}>
      <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
        Новая коробка
      </h2>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <Field label="Краткое описание">
          <TextInput
            required
            name="title"
            placeholder="Посуда на первое время"
          />
        </Field>
        <Field label="Комната">
          <Select
            name="room"
            defaultValue={roomOptions[0].value}
            items={roomOptions}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roomOptions.map((room) => (
                <SelectItem key={room.value} value={room.value}>
                  {room.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Содержимое, через запятую">
          <TextInput name="items" placeholder="Кружки, тарелки, чайник" />
        </Field>
        <label
          htmlFor={fragileId}
          className="flex cursor-pointer items-center gap-2 text-sm font-bold"
        >
          <Checkbox id={fragileId} name="fragile" />
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
