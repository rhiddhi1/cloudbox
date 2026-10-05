import * as z from "zod";

export const signInSchema = z.object({
  interface: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter your email address" }),

  password: z
    .string()
    .min(1, { message: "Password is requried" })
    .min(8, { message: "Password should atleast be 8 character long" }),
});
