import { Logo } from "@/components/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-sm text-stone-500 sm:flex-row sm:justify-between">
        <Logo iconClassName="h-6 w-6 text-orange-600" className="text-stone-500" />
        <p>&copy; {year} Project New Apron. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="/terms-of-service" className="transition-colors hover:text-stone-900">
            Terms of Service
          </a>
          <a href="/privacy-policy" className="transition-colors hover:text-stone-900">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
