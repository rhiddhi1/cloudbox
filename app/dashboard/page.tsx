import { SectionCards } from "@/components/section-cards";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards userId={userId} />
        <div className="px-4 lg:px-6">{/* <ChartAreaInteractive /> */}</div>
        {/* <DataTable data={data} /> */}
      </div>
    </div>
  );
}
