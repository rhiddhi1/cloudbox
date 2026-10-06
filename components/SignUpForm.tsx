"use client";

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { signUpSchema } from "@/schemas/signUpSchema";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<z.infer<typeof signUpSchema>>({
  resolver: zodResolver(signUpSchema),
  defaultValues: {
    email: "",
    password: "",
    confirmPassword: "",
  },
});

export default function SignUpForm() {}
