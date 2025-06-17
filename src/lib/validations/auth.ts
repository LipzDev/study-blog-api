import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email deve ter um formato válido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z
      .string()
      .min(1, "Email é obrigatório")
      .email("Email deve ter um formato válido"),
    password: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email deve ter um formato válido"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token é obrigatório"),
    password: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
