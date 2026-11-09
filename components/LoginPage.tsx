import { Logo } from '@/components/Logo';
import { LoginForm } from '@/components/LoginForm';

export function LoginPage() {
  return (
    <main className="from-tangy-blue via-habico-blue to-fire-orange relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="login-halftone pointer-events-none absolute inset-0 opacity-35"
      />
      <div aria-hidden="true" className="login-glow pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="border-habico-white/10 absolute top-16 -left-24 size-64 rounded-full border sm:left-[8%] sm:size-80"
      />
      <div
        aria-hidden="true"
        className="border-habico-white/15 absolute -right-20 -bottom-28 size-80 rounded-full border sm:right-[10%]"
      />
      <section className="border-habico-white/70 bg-habico-white relative z-10 w-full max-w-[440px] animate-[rise-in_600ms_ease-out_both] rounded-[28px] border px-6 py-8 shadow-[0_28px_90px_rgba(0,20,60,0.28)] sm:px-10 sm:py-10">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-8 text-center">
          <p className="text-habico-orange-red text-[10px] font-extrabold tracking-[0.22em] uppercase">
            Welkom thuis
          </p>
          <h1 className="text-habico-navy-dark mt-3 text-[30px] leading-tight font-extrabold sm:text-[34px]">
            Samen begint
            <br />
            het hier<span className="text-habico-orange">.</span>
          </h1>
          <p className="text-habico-blue/70 mx-auto mt-3 max-w-[300px] text-sm leading-relaxed">
            Connecting People, Creating Solutions.
          </p>
        </div>
        <LoginForm />
        <p className="text-habico-blue/40 mt-7 text-center text-[10px] font-medium">
          HABICO <span className="px-1">·</span> JOUW HUIS, JOUW PLEK
        </p>
      </section>
    </main>
  );
}
