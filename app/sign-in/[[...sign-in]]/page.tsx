import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-6">
      <SignIn signUpUrl="/signup" fallbackRedirectUrl="/dashboard" />
    </main>
  );
}
