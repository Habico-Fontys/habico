import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

const variants = {
  primary: 'bg-habico-orange text-habico-white shadow-sm hover:bg-habico-orange-red',
  secondary:
    'border border-habico-grey bg-habico-white text-habico-navy hover:border-tangy-blue hover:text-tangy-blue',
  ghost: 'bg-transparent text-habico-white hover:bg-habico-blue',
};

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
