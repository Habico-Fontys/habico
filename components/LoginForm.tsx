'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { demoCredentials } from '@/data/auth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (username === demoCredentials.username && password === demoCredentials.password) {
      setError('');
      router.push('/dashboard');
      return;
    }
    setError('Deze inloggegevens kloppen niet. Controleer je gebruikersnaam en wachtwoord.');
  }

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
      <Input
        label="Gebruikersnaam"
        name="username"
        autoComplete="username"
        placeholder="Je gebruikersnaam"
        required
      />
      <Input
        label="Wachtwoord"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Je wachtwoord"
        required
      />
      {error && (
        <p
          className="border-habico-orange-red/20 bg-habico-orange-red/5 text-habico-orange-red rounded-xl border px-4 py-3 text-sm leading-relaxed font-medium"
          role="alert"
        >
          {error}
        </p>
      )}
      <Button className="mt-1 w-full" type="submit">
        Inloggen <span aria-hidden="true">↗</span>
      </Button>
      <p className="text-habico-blue/60 text-center text-xs">
        Demo: admin <span className="text-habico-grey px-1">/</span> habico123
      </p>
    </form>
  );
}
