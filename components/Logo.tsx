type LogoProps = {
  variant?: 'dark' | 'light';
  compact?: boolean;
};

export function Logo({ variant = 'dark', compact = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-3" aria-label="Habico">
      <svg
        aria-hidden="true"
        className={compact ? 'size-10 shrink-0' : 'size-12 shrink-0'}
        viewBox="0 0 96 96"
        fill="none"
      >
        <rect width="96" height="96" rx="25" className="fill-tangy-blue" />
        <path d="M16 43 48 13l32 30h-9v35H25V43h-9Z" className="fill-habico-white" />
        <path
          d="M34 53h10M52 53h10M34 65c2 4 5 6 9 6s7-2 9-6M53 65c2 4 5 6 9 6s7-2 9-6"
          className="stroke-tangy-blue"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M39 78h18" className="stroke-habico-white" strokeWidth="5" strokeLinecap="round" />
      </svg>
      {!compact && (
        <span
          className={`text-[25px] leading-none font-extrabold tracking-normal ${variant === 'light' ? 'text-habico-white' : 'text-habico-navy-dark'}`}
        >
          Habico<span className="text-habico-orange">.</span>
        </span>
      )}
    </span>
  );
}
