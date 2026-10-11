import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Cloud,
  FileText,
  Folder,
  HardDrive,
  LockKeyhole,
  Search,
  ShieldCheck,
  Star,
  Upload,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

const features = [
  {
    icon: Upload,
    title: "Everything in one place",
    description:
      "Bring your files together in a single, focused workspace that feels easy to navigate.",
  },
  {
    icon: Folder,
    title: "A little more organized",
    description:
      "Create folders, keep favorites close, and find what you need without the digging.",
  },
  {
    icon: ShieldCheck,
    title: "Yours by default",
    description:
      "Your workspace is tied to your account, so your files are there when you need them.",
  },
];

const sampleFiles = [
  { name: "Brand guidelines.pdf", detail: "PDF · 2.4 MB", icon: FileText },
  { name: "Product launch", detail: "Folder · 8 items", icon: Folder },
  { name: "Moodboard-final.png", detail: "PNG · 4.1 MB", icon: FileText },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <section className="relative isolate overflow-hidden bg-[#09090b] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_-15%,rgba(99,102,241,0.28),transparent_58%)]"
        />
        <header className="border-b border-white/10">
          <nav
            aria-label="Main navigation"
            className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
          >
            <Link href="/" className="flex items-center gap-2.5 font-semibold">
              <span className="flex size-8 items-center justify-center rounded-lg border border-white/15 bg-white/10">
                <Cloud className="size-4" aria-hidden="true" />
              </span>
              <span className="text-base tracking-tight">Cloudbox</span>
            </Link>

            <div className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
              <a className="transition-colors hover:text-white" href="#features">
                Features
              </a>
              <a className="transition-colors hover:text-white" href="#workspace">
                Workspace
              </a>
              <a className="transition-colors hover:text-white" href="#security">
                Privacy
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "hidden text-zinc-300 hover:bg-white/10 hover:text-white sm:inline-flex",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className={buttonVariants({
                  className: "bg-white text-zinc-950 hover:bg-zinc-200",
                })}
              >
                Get started
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </nav>
        </header>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-28">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300">
              <span className="size-1.5 rounded-full bg-indigo-400" />
              A calmer home for your files
            </div>
            <h1 className="text-5xl leading-[1.04] font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Your files,
              <br />
              <span className="text-zinc-500">without the noise.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
              Cloudbox keeps your work together and within reach. Upload, sort,
              and get back to what matters.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className={buttonVariants({
                  size: "lg",
                  className: "h-12 bg-white px-6 text-zinc-950 hover:bg-zinc-200",
                })}
              >
                Create your free account
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="/sign-in"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className:
                    "h-12 border-white/15 bg-white/[0.04] px-6 text-white hover:bg-white/10 hover:text-white",
                })}
              >
                Sign in
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
              <Check className="size-4 text-indigo-400" aria-hidden="true" />
              Simple storage, thoughtfully organized
            </div>
          </div>

          <div id="workspace" className="relative mx-auto w-full max-w-2xl">
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[2rem] bg-indigo-500/15 blur-3xl"
            />
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111113] shadow-2xl shadow-black/40">
              <div className="flex h-12 items-center gap-2 border-b border-white/10 px-4">
                <span className="size-2.5 rounded-full bg-zinc-700" />
                <span className="size-2.5 rounded-full bg-zinc-700" />
                <span className="size-2.5 rounded-full bg-zinc-700" />
                <div className="ml-3 flex h-7 flex-1 items-center justify-center rounded-md border border-white/5 bg-white/[0.03] text-[11px] text-zinc-500">
                  cloudbox.app/dashboard
                </div>
              </div>

              <div className="grid min-h-[370px] grid-cols-[145px_1fr] sm:grid-cols-[180px_1fr]">
                <aside className="border-r border-white/10 p-3 sm:p-4">
                  <div className="mb-7 flex items-center gap-2 px-1">
                    <span className="flex size-7 items-center justify-center rounded-md bg-white text-zinc-950">
                      <Cloud className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold">Cloudbox</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 rounded-md bg-white/10 px-2.5 py-2 text-white">
                      <HardDrive className="size-3.5" aria-hidden="true" />
                      My files
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-2 text-zinc-500">
                      <Star className="size-3.5" aria-hidden="true" />
                      Starred
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-2 text-zinc-500">
                      <Folder className="size-3.5" aria-hidden="true" />
                      Folders
                    </div>
                  </div>
                  <div className="mt-8 border-t border-white/10 pt-4">
                    <p className="px-2.5 text-[10px] font-medium tracking-wider text-zinc-600 uppercase">
                      Storage
                    </p>
                    <div className="mt-3 px-2.5">
                      <div className="mb-2 flex justify-between text-[10px] text-zinc-500">
                        <span>3.2 GB used</span>
                        <span>32%</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[32%] rounded-full bg-indigo-400" />
                      </div>
                    </div>
                  </div>
                </aside>

                <div className="min-w-0 p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">My files</p>
                      <p className="mt-1 text-[11px] text-zinc-500">
                        A little space for everything
                      </p>
                    </div>
                    <div className="flex size-8 items-center justify-center rounded-md border border-white/10 text-zinc-400">
                      <Search className="size-3.5" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { icon: Folder, label: "Folders", value: "12" },
                      { icon: FileText, label: "Files", value: "248" },
                      { icon: Star, label: "Starred", value: "8" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        className="rounded-lg border border-white/10 bg-white/[0.025] p-3 sm:p-3.5"
                        key={label}
                      >
                        <Icon
                          className="size-3.5 text-zinc-500"
                          aria-hidden="true"
                        />
                        <p className="mt-3 text-base font-medium">{value}</p>
                        <p className="mt-0.5 text-[10px] text-zinc-500">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-medium text-zinc-300">
                        Recently added
                      </p>
                      <span className="text-[10px] text-zinc-600">View all</span>
                    </div>
                    <div className="divide-y divide-white/[0.07]">
                      {sampleFiles.map(({ name, detail, icon: Icon }) => (
                        <div
                          className="flex items-center gap-3 py-3"
                          key={name}
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-zinc-400">
                            <Icon className="size-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-zinc-200">
                              {name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-zinc-600">
                              {detail}
                            </p>
                          </div>
                          <ArrowUpRight
                            className="size-3.5 text-zinc-600"
                            aria-hidden="true"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-3 -bottom-5 hidden items-center gap-2 rounded-lg border border-white/10 bg-[#18181b] px-3.5 py-3 shadow-xl sm:flex">
              <span className="flex size-8 items-center justify-center rounded-md bg-white/10 text-zinc-300">
                <LockKeyhole className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-medium">Private by default</p>
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  Your files stay yours
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.18em] text-zinc-500 uppercase">
              Less searching. More doing.
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              A workspace that
              <br className="hidden sm:block" /> gets out of your way.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-500 dark:text-zinc-400">
              The essentials for keeping your digital life organized, without
              adding more noise to your day.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-white/[0.03]"
                key={title}
              >
                <div className="flex size-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="security"
        className="border-y border-zinc-200 bg-zinc-50 text-zinc-950 dark:border-white/10 dark:bg-[#09090b] dark:text-white"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Your space, your account
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Make room for what matters.
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Start with a clean slate and bring your files into one organized
              workspace.
            </p>
          </div>
          <Link
            href="/sign-up"
            className={buttonVariants({
              size: "lg",
              className:
                "h-11 bg-zinc-950 px-5 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
            })}
          >
            Get started for free
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="bg-white text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-white"
          >
            <Cloud className="size-4" aria-hidden="true" />
            Cloudbox
          </Link>
          <p>Keep your files close. Keep your day moving.</p>
          <div className="flex gap-5">
            <Link className="transition-colors hover:text-foreground" href="/sign-in">
              Sign in
            </Link>
            <Link className="transition-colors hover:text-foreground" href="/sign-up">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
