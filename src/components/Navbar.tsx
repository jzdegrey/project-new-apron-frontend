import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";

interface NavbarProps {
  isSignedIn?: boolean;
}

export function Navbar({ isSignedIn = false }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-stone-600">
          <Link href="/" className="transition-colors hover:text-stone-900">
            Home
          </Link>
          {isSignedIn ? (
            <SignOutButton />
          ) : (
            <Link
              href="/sign-in"
              className="rounded-full bg-orange-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-orange-700"
            >
              Sign In / Create Account
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
