import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthForm } from "@/components/AuthForm";
import { logger } from "@/lib/logger";

export default function SignInPage() {
  logger.info("Sign in / create account page rendered on the server");

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
          <AuthForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
