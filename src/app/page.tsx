import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { backendGetCurrentUser } from "@/lib/backendClient";
import { logger } from "@/lib/logger";
import { getSessionToken } from "@/lib/session";

const SELL_POINTS = [
  {
    title: "Plan together",
    body: "Plan meals for any date range and collaborate with family & friends.",
  },
  {
    title: "Save what you love",
    body: "Save and organize your favorite recipes in one place.",
  },
  {
    title: "Shop faster",
    body: "Grocery integrations with Kroger, Walmart, and Target — on the roadmap.",
  },
];

export default async function Home() {
  logger.info("Landing page rendered on the server");

  const token = await getSessionToken();
  const user = token ? await backendGetCurrentUser(token) : null;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar isSignedIn={!!user} />
      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-orange-50 via-stone-50 to-amber-50"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-24 sm:py-32">
            <span className="rounded-full bg-orange-100 px-4 py-1 text-sm font-medium text-orange-700">
              Now in early access
            </span>
            <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl">
              Plan meals. Save recipes. Eat better — together.
            </h1>
            <p className="max-w-xl text-lg text-stone-600">
              Project New Apron helps you plan meals, store and share recipes, and eat better —
              all in one place.
            </p>
            <Link
              href="/sign-in"
              className="mt-2 rounded-full bg-orange-600 px-7 py-3 text-base font-semibold text-white shadow-md shadow-orange-600/20 transition-colors hover:bg-orange-700"
            >
              Sign In / Create Account
            </Link>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-20 sm:grid-cols-3">
          {SELL_POINTS.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <h2 className="font-display text-lg font-semibold text-stone-900">
                {point.title}
              </h2>
              <p className="mt-2 text-sm text-stone-600">{point.body}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
