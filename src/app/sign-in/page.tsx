import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthForm } from "@/components/AuthForm";
import { backendGetCurrentUser } from "@/lib/backendClient";
import { logger } from "@/lib/logger";
import { getSessionToken } from "@/lib/session";

export default async function SignInPage() {
  logger.info("Sign in / create account page rendered on the server");

  const token = await getSessionToken();
  const user = token ? await backendGetCurrentUser(token) : null;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar isSignedIn={!!user} />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
          <AuthForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
