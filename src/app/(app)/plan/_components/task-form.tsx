import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TaskFields } from "@/app/(app)/plan/_components/task-fields";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { type TaskFormValues, taskSchema } from "@/lib/forms/project.schema";

export function TaskForm({
  onClose,
  onSubmit,
  members,
}: {
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
  members: string[];
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      stage: "BEFORE",
      assignees: [],
      dueDate: "",
      dueTime: "",
    },
  });
  return (
    <Modal className="max-w-xl" label="Новая задача" onClose={onClose}>
      <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
        Новая задача
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 grid gap-4"
      >
        <TaskFields
          members={members}
          register={register}
          control={control}
          errors={errors}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Добавить</Button>
        </div>
      </form>
    </Modal>
  );
}
