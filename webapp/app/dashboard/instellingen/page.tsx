import { Card } from '@/components/Card';

export default function SettingsPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-76px)] max-w-[1480px] px-4 py-8 sm:px-7 lg:px-10">
      <p className="text-habico-orange-red text-[10px] font-extrabold tracking-[0.2em] uppercase">
        HABICO
      </p>
      <h2 className="text-habico-navy-dark mt-2 text-3xl font-extrabold">
        Instellingen<span className="text-habico-orange">.</span>
      </h2>
      <Card className="mt-6">
        <h3 className="text-habico-navy-dark text-base font-bold">Binnenkort beschikbaar</h3>
        <p className="text-habico-blue/65 mt-2 text-sm">
          De huisinstellingen vind je hier zodra deze functie is ingericht.
        </p>
      </Card>
    </main>
  );
}
