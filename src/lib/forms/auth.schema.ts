import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Введите не менее 3 символов.")
  .max(32, "Введите не более 32 символов.");

const passwordSchema = z
  .string()
  .min(8, "Пароль должен содержать не менее 8 символов.")
  .max(128, "Пароль должен содержать не более 128 символов.");

export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const registrationSchema = loginSchema
  .extend({ confirmPassword: passwordSchema })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Пароли должны совпадать.",
  });

export const authFormSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .max(128, "Пароль должен содержать не более 128 символов.")
      .optional(),
  })
  .superRefine((values, context) => {
    if (
      values.confirmPassword !== undefined &&
      values.password !== values.confirmPassword
    ) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Пароли должны совпадать.",
      });
    }
  });

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .max(128, "Пароль должен содержать не более 128 символов."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Новые пароли не совпадают.",
  });

export const usernameFormSchema = z.object({ username: usernameSchema });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type AuthFormValues = z.infer<typeof authFormSchema>;
export type RegistrationFormValues = z.infer<typeof registrationSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
