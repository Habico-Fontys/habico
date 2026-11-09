import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & { children: ReactNode };

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <section
      className={`border-habico-grey/70 bg-habico-white rounded-2xl border p-5 shadow-[0_8px_24px_rgba(0,35,71,0.04)] sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
