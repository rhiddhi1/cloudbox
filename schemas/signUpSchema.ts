import * as z from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Enter email" })
      .email({ message: "Please enter valid email address" }),
    password: z
      .string()
      .min(1, { message: "Enter password" })
      .min(8, { message: "Password should be minimum 8 characters" }),
    confirmPassword: z.string().min(1, { message: "Enter password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
  });
