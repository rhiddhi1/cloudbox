"use client";

import { signInSchema } from "@/schemas/signInSchema";
import { useSignIn } from "@clerk/nextjs/legacy";
import { zodResolver } from "@hookform/resolvers/zod";
import { error } from "console";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { tr } from "zod/v4/locales";

export default function SignInForm() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setAuthError("");

    try {
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password,
      });

      if (result.status == "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        console.log("SignIn Error:", error);
        setAuthError("Sign in error");
      }
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Could not sign in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return <h1>Return a signIn form</h1>;
}
