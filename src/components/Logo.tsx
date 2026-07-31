interface LogoProps {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
}

export function Logo({ className, iconClassName, showWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={iconClassName ?? "h-8 w-8 text-orange-600"}
        fill="currentColor"
      >
        <circle cx="8.2" cy="10" r="3.1" />
        <circle cx="12" cy="6.7" r="3.9" />
        <circle cx="15.8" cy="10" r="3.1" />
        <rect x="7.5" y="9" width="9" height="5.5" rx="1.4" />
        <rect x="6.5" y="16.5" width="11" height="3.5" rx="1.2" />
      </svg>
      {showWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-stone-900">
          Project New Apron
        </span>
      )}
    </span>
  );
}
