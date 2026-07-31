import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendGetCurrentUser } from "@/lib/backendClient";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default async function WelcomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await backendGetCurrentUser(token) : null;

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <h1 className="font-display text-2xl font-semibold text-stone-900">
            Welcome, {user.first_name}!
          </h1>
          <p className="mt-2 text-stone-600">You&apos;re signed in as {user.username}.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
