import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="text-center">
        <h1 className="text-3xl font-bold">Welcome to Droply</h1>
        <p className="mt-2 text-muted-foreground">
          Your account is ready.
        </p>
      </section>
    </main>
  );
}
