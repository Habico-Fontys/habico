import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="grid gap-2">
      <label className="text-habico-navy-dark text-sm font-semibold" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`border-habico-grey bg-habico-white text-habico-navy-dark placeholder:text-habico-blue/45 focus:border-tangy-blue focus:ring-tangy-blue/10 h-12 w-full rounded-xl border px-4 text-sm focus:ring-4 focus:outline-none ${className}`}
        {...props}
      />
      {error && (
        <p className="text-habico-orange-red text-xs font-medium" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
