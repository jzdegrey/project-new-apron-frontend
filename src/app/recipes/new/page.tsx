import { redirect } from "next/navigation";
import { backendGetCurrentUser } from "@/lib/backendClient";
import { getSessionToken } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RecipeForm } from "@/components/recipes/RecipeForm";

export default async function NewRecipePage() {
  const token = await getSessionToken();
  const user = token ? await backendGetCurrentUser(token) : null;
  if (!user || !token) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <Navbar isSignedIn />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <h1 className="font-display text-3xl font-semibold text-stone-900">Create Recipe</h1>
          <div className="mt-6">
            <RecipeForm mode="create" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
