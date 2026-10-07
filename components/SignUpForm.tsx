"use client";

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs/legacy";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { signUpSchema } from "@/schemas/signUpSchema";
import { useState } from "react";
import { tr } from "zod/locales";
import { sign } from "crypto";
import { useRouter } from "next/router";

export default function SignUpForm() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false); // when data is sent to signUp, we set it true
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificaitonCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );

  // signUp takes email and password and sends it to clerk for verificaiton
  const { isLoaded, signUp, setActive } = useSignUp();

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

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code", // clerk sends code in email
      });
      setVerifying(true);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Could not start sign-up.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmmit = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setIsSubmitting(true);
    setVerificationError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificaitonCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId }); // creating user session when the email is verified
        router.push("/dashboard");
      } else {
        console.error("Verification incomplete:", result);
        setVerificationError(
          "Verification could not be completed. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerificationError(
        error instanceof Error
          ? error.message
          : "An error occurred during verification. Please try again.",
      );
    } finally {
      setIsSubmitting(false); // setting down the spinning spinner
    }
  };

  if (verifying) {
    //return; // Input OTP component
  }

  return <h1>signUp form</h1>;
}
