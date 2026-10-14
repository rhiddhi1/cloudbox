"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { useSignIn } from "@clerk/nextjs/legacy";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type ResetStep = "email" | "code" | "password" | "complete";

export default function ForgotPasswordForm() {
  const { signIn, isLoaded } = useSignIn();
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailAddressId, setEmailAddressId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const sendResetCode = async () => {
    if (!isLoaded) return;

    const result = await signIn.create({ identifier: email });
    const resetFactor = result.supportedFirstFactors?.find(
      (factor) => factor.strategy === "reset_password_email_code",
    );

    if (!resetFactor) {
      throw new Error(
        "Email password reset is not available for this account.",
      );
    }

    setEmailAddressId(resetFactor.emailAddressId);
    await signIn.prepareFirstFactor({
      strategy: "reset_password_email_code",
      emailAddressId: resetFactor.emailAddressId,
    });
    setStep("code");
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await sendResetCode();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not send a reset code. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });

      if (result.status === "needs_new_password") {
        setStep("password");
      } else {
        setError("The reset code could not be verified. Please try again.");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not verify the reset code. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded || isSubmitting) return;

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.resetPassword({ password });

      if (result.status === "complete") {
        setStep("complete");
      } else {
        setError(
          `Password reset requires an additional step (${result.status}).`,
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not reset your password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !emailAddressId || isResending) return;

    setIsResending(true);
    setError(null);

    try {
      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not resend the reset code. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
          {step === "complete" ? (
            <CheckCircle2 className="size-6" aria-hidden="true" />
          ) : step === "email" ? (
            <Mail className="size-6" aria-hidden="true" />
          ) : (
            <KeyRound className="size-6" aria-hidden="true" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {step === "email" && "Forgot your password?"}
          {step === "code" && "Check your email"}
          {step === "password" && "Create a new password"}
          {step === "complete" && "Password reset"}
        </CardTitle>
        <CardDescription>
          {step === "email" &&
            "Enter the email address associated with your account and we’ll send you a reset code."}
          {step === "code" && `Enter the reset code sent to ${email}.`}
          {step === "password" && "Choose a new password for your account."}
          {step === "complete" &&
            "Your password has been updated. You can now sign in with your new password."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={!isLoaded || isSubmitting}>
                {isSubmitting ? "Sending code..." : "Send reset code"}
              </Button>
            </FieldGroup>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleCodeSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="code">Reset code</FieldLabel>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter the code from your email"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                />
              </Field>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={!isLoaded || isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify code"}
              </Button>
              <FieldDescription className="text-center">
                Didn&apos;t receive a code?{" "}
                <button
                  className="underline underline-offset-4 disabled:opacity-50"
                  type="button"
                  disabled={!isLoaded || isResending}
                  onClick={handleResendCode}
                >
                  {isResending ? "Resending..." : "Resend"}
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handlePasswordSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm new password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </Field>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={!isLoaded || isSubmitting}>
                {isSubmitting ? "Updating password..." : "Update password"}
              </Button>
            </FieldGroup>
          </form>
        )}

        {step === "complete" && (
          <Link
            className={buttonVariants({ className: "w-full" })}
            href="/sign-in"
          >
            Back to sign in
          </Link>
        )}

        {step !== "complete" && (
          <div className="mt-6 text-center">
            <Link
              className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
              href="/sign-in"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to sign in
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
