'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useLocalStorageValue } from '@/hooks/useLocalStorageValue';
import {
  ACTIVITEITEN_OPSLAG,
  BEGIN_ACTIVITEITEN,
  isAgendaActiviteiten,
  type ActiviteitSoort,
  type AgendaActiviteit,
} from './data';
import { HUISNAAM } from '../huisgenoten/data';

type ActivityFilter = 'Alles' | ActiviteitSoort;

type ActivityDraft = {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: ActiviteitSoort;
  reminder: boolean;
};
const activityTypes: ActiviteitSoort[] = ['Samen doen', 'Spontaan', 'Feestje'];
const filters: ActivityFilter[] = ['Alles', ...activityTypes];

const typeStyles: Record<ActiviteitSoort, string> = {
  'Samen doen': 'bg-habico-soft-blue text-tangy-blue',
  Spontaan: 'bg-emerald-50 text-emerald-700',
  Feestje: 'bg-orange-50 text-fire-orange',
};

const dateFormatter = new Intl.DateTimeFormat('nl-NL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function formatActivityDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

function getToday() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function createEmptyDraft(date = ''): ActivityDraft {
  return {
    title: '',
    description: '',
    date,
    time: '18:00',
    location: '',
    type: 'Samen doen',
    reminder: true,
  };
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useLocalStorageValue(
    ACTIVITEITEN_OPSLAG,
    BEGIN_ACTIVITEITEN,
    isAgendaActiviteiten,
  );
  const [today, setToday] = useState('');
  const [filter, setFilter] = useState<ActivityFilter>('Alles');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<ActivityDraft>(createEmptyDraft);

  const visibleActivities = useMemo(
    () =>
      activities
        .filter((activity) => filter === 'Alles' || activity.type === filter)
        .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)),
    [activities, filter],
  );
  const upcomingCount = activities.length;
  const participantCount = activities.reduce((total, activity) => total + activity.attendees, 0);

  function toggleForm() {
    if (!showForm) {
      const currentDate = getToday();
      setToday(currentDate);
      setDraft((current) => ({ ...current, date: currentDate }));
    }
    setShowForm((open) => !open);
  }

  function toggleAttendance(id: string) {
    setActivities((current) =>
      current.map((activity) => {
        if (activity.id !== id) return activity;
        const attending = !activity.attending;
        return {
          ...activity,
          attending,
          attendees: activity.attendees + (attending ? 1 : -1),
        };
      }),
    );
  }

  function toggleReminder(id: string) {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === id ? { ...activity, reminder: !activity.reminder } : activity,
      ),
    );
  }

  function createActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activity: AgendaActiviteit = {
      id: `activity-${Date.now()}`,
      title: draft.title.trim(),
      description: draft.description.trim() || `Georganiseerd door Marvin.`,
      date: draft.date,
      time: draft.time,
      location: draft.location.trim(),
      organizer: 'Marvin',
      type: draft.type,
      attendees: 1,
      attending: true,
      reminder: draft.reminder,
      ...(draft.type === 'Feestje'
        ? { noiseNotice: 'Er kan tijdens dit feestje wat extra geluid zijn.' }
        : {}),
    };

    setActivities((current) => [...current, activity]);
    setFilter('Alles');
    setDraft(createEmptyDraft(today));
    setShowForm(false);
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-76px)] max-w-[1480px] px-4 py-8 sm:px-7 lg:px-10">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-habico-orange-red text-[10px] font-extrabold tracking-[0.2em] uppercase">
            {HUISNAAM.toUpperCase()} · SAMEN THUIS
          </p>
          <h1 className="text-habico-navy-dark mt-2 text-3xl font-extrabold">
            Activiteiten<span className="text-habico-orange">.</span>
          </h1>
          <p className="text-habico-blue/65 mt-2 max-w-xl text-sm">
            Plan iets leuks, laat weten waar je aan meedoet of nodig je huisgenoten spontaan uit.
          </p>
        </div>
        <Button onClick={toggleForm}>
          <span aria-hidden="true" className="text-lg leading-none">
            {showForm ? '-' : '+'}
          </span>
          {showForm ? 'Sluiten' : 'Activiteit toevoegen'}
        </Button>
      </div>

      <section aria-label="Agenda in cijfers" className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4 sm:p-5">
          <span className="bg-habico-soft-blue text-tangy-blue grid size-10 shrink-0 place-items-center rounded-xl text-lg">
            ◷
          </span>
          <div>
            <p className="text-habico-navy-dark text-lg leading-tight font-extrabold">
              {upcomingCount}
            </p>
            <p className="text-habico-blue/60 mt-1 text-xs">activiteiten in de agenda</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4 sm:p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg text-emerald-700">
            ♡
          </span>
          <div>
            <p className="text-habico-navy-dark text-lg leading-tight font-extrabold">
              {participantCount}
            </p>
            <p className="text-habico-blue/60 mt-1 text-xs">keer gezellig aangehaakt</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4 sm:p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-lg text-fire-orange">
            ✳
          </span>
          <div>
            <p className="text-habico-navy-dark text-lg leading-tight font-extrabold">
              {activities.filter((activity) => activity.type === 'Spontaan').length}
            </p>
            <p className="text-habico-blue/60 mt-1 text-xs">spontane plannen</p>
          </div>
        </Card>
      </section>

      {showForm && (
        <Card className="mb-5 p-5 sm:p-7">
          <div className="mb-5">
            <p className="text-habico-blue/55 text-[10px] font-bold tracking-[0.15em] uppercase">
              Iets organiseren
            </p>
            <h2 className="text-habico-navy-dark mt-1 text-lg font-bold">
              Wat gaan we samen doen?
            </h2>
          </div>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={createActivity}>
            <label className="grid gap-1.5 text-xs font-semibold sm:col-span-2">
              <span className="text-habico-navy-dark">Naam van de activiteit</span>
              <input
                required
                maxLength={70}
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="Bijv. samen koken of hardlopen"
                className="border-habico-grey/80 bg-habico-white text-habico-navy-dark placeholder:text-habico-blue/40 focus:border-tangy-blue min-h-11 rounded-xl border px-3 outline-none"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold">
              <span className="text-habico-navy-dark">Soort activiteit</span>
              <select
                value={draft.type}
                onChange={(event) =>
                  setDraft({ ...draft, type: event.target.value as ActiviteitSoort })
                }
                className="border-habico-grey/80 bg-habico-white text-habico-navy-dark focus:border-tangy-blue min-h-11 rounded-xl border px-3 outline-none"
              >
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-semibold">
              <span className="text-habico-navy-dark">Locatie</span>
              <input
                required
                maxLength={60}
                value={draft.location}
                onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                placeholder="Bijv. woonkamer"
                className="border-habico-grey/80 bg-habico-white text-habico-navy-dark placeholder:text-habico-blue/40 focus:border-tangy-blue min-h-11 rounded-xl border px-3 outline-none"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold">
              <span className="text-habico-navy-dark">Datum</span>
              <input
                required
                type="date"
                min={today || undefined}
                value={draft.date}
                onChange={(event) => setDraft({ ...draft, date: event.target.value })}
                className="border-habico-grey/80 bg-habico-white text-habico-navy-dark focus:border-tangy-blue min-h-11 rounded-xl border px-3 outline-none"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold">
              <span className="text-habico-navy-dark">Tijd</span>
              <input
                required
                type="time"
                value={draft.time}
                onChange={(event) => setDraft({ ...draft, time: event.target.value })}
                className="border-habico-grey/80 bg-habico-white text-habico-navy-dark focus:border-tangy-blue min-h-11 rounded-xl border px-3 outline-none"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold sm:col-span-2">
              <span className="text-habico-navy-dark">Extra informatie (optioneel)</span>
              <textarea
                maxLength={180}
                rows={2}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                placeholder="Vertel je huisgenoten wat meer..."
                className="border-habico-grey/80 bg-habico-white text-habico-navy-dark placeholder:text-habico-blue/40 focus:border-tangy-blue rounded-xl border px-3 py-2.5 outline-none"
              />
            </label>
            <label className="text-habico-blue/70 flex items-center gap-2 text-xs sm:col-span-2">
              <input
                type="checkbox"
                checked={draft.reminder}
                onChange={(event) => setDraft({ ...draft, reminder: event.target.checked })}
                className="accent-tangy-blue size-4"
              />
              Herinner mij aan deze activiteit
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit">Activiteit plaatsen</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Annuleren
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <section aria-label="Activiteitenagenda">
          <Card className="p-5 sm:p-7">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-habico-blue/55 text-[10px] font-bold tracking-[0.15em] uppercase">
                  Huisagenda
                </p>
                <h2 className="text-habico-navy-dark mt-1 text-lg font-bold">Binnenkort</h2>
              </div>
              <span className="text-habico-blue/55 text-xs">
                {visibleActivities.length}{' '}
                {visibleActivities.length === 1 ? 'activiteit' : 'activiteiten'}
              </span>
            </div>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                  className={`min-h-9 shrink-0 rounded-full px-3 text-xs font-semibold transition ${
                    filter === item
                      ? 'bg-tangy-blue text-habico-white'
                      : 'bg-habico-blue/5 text-habico-blue/65 hover:bg-habico-blue/10'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              {visibleActivities.length > 0 ? (
                visibleActivities.map((activity) => (
                  <article
                    key={activity.id}
                    className="border-habico-grey/60 grid gap-4 rounded-2xl border p-4 sm:grid-cols-[60px_minmax(0,1fr)] sm:items-start sm:p-5"
                  >
                    <div className="bg-habico-blue/5 text-habico-blue flex h-14 w-fit min-w-14 flex-col items-center justify-center rounded-xl px-2 sm:h-16 sm:w-16">
                      <span className="text-[9px] leading-none font-bold tracking-wide uppercase">
                        {new Intl.DateTimeFormat('nl-NL', { month: 'short' }).format(
                          new Date(`${activity.date}T12:00:00`),
                        )}
                      </span>
                      <span className="mt-1 text-xl leading-none font-extrabold">
                        {new Date(`${activity.date}T12:00:00`).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${typeStyles[activity.type]}`}
                        >
                          {activity.type}
                        </span>
                        <span className="text-habico-blue/55 text-[11px]">
                          {formatActivityDate(activity.date)} · {activity.time}
                        </span>
                      </div>
                      <h3 className="text-habico-navy-dark mt-2 text-base font-bold">
                        {activity.title}
                      </h3>
                      <p className="text-habico-blue/65 mt-1 text-xs leading-relaxed">
                        {activity.description}
                      </p>
                      {activity.noiseNotice && (
                        <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-[11px] leading-relaxed text-orange-800">
                          <span className="font-bold">Kleine heads-up:</span> {activity.noiseNotice}
                        </p>
                      )}
                      <div className="text-habico-blue/55 mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
                        <span>
                          <span aria-hidden="true">⌖ </span>
                          {activity.location}
                        </span>
                        <span>
                          <span aria-hidden="true">♡ </span>
                          {activity.attendees}{' '}
                          {activity.attendees === 1 ? 'doet mee' : 'doen mee'}
                        </span>
                        <span>Georganiseerd door {activity.organizer}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          variant={activity.attending ? 'primary' : 'secondary'}
                          aria-pressed={activity.attending}
                          className={`min-h-9 rounded-lg px-3 text-xs ${
                            activity.attending
                              ? '!border-orange-200 !bg-orange-50 !text-fire-orange'
                              : '!border-[#D9D9D9] !bg-[#FD7702] !text-white'
                          }`}
                          onClick={() => toggleAttendance(activity.id)}
                        >
                         
                          {activity.attending ? 'Uitschrijven' : 'Doe mee'}
                        </Button>
                        <Button
                          variant={activity.reminder ? 'primary' : 'secondary'}
                          aria-pressed={activity.reminder}
                          className={`min-h-9 rounded-lg px-3 text-xs transition-all duration-200 ${
                            activity.reminder
                              ? '!border-[#cbd2ff] !bg-habico-soft-blue !text-tangy-blue'
                              : '!border-[#1D38FF] !bg-[#1D38FF] !text-white'
                          }`}
                          onClick={() => toggleReminder(activity.id)}
                        >
                          
                          {activity.reminder ? 'Herinnering uitschakelen' : 'Herinner mij'}
                        </Button>
                      </div>
                      {(activity.attending || activity.reminder) && (
                        <div
                          role="status"
                          aria-live="polite"
                          className="mt-3 flex flex-wrap gap-2"
                        >
                          {activity.attending && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-[11px] font-semibold text-orange-800">
                              <span
                                aria-hidden="true"
                                className="grid size-4 place-items-center rounded-full bg-fire-orange text-[10px] text-white"
                              >
                                ✓
                              </span>
                              Je bent ingeschreven
                            </span>
                          )}
                          {activity.reminder && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd2ff] bg-habico-soft-blue px-2.5 py-1.5 text-[11px] font-semibold text-tangy-blue">
                              <span
                                aria-hidden="true"
                                className="grid size-4 place-items-center rounded-full bg-tangy-blue text-[10px] text-white"
                              >
                                ✓
                              </span>
                              Herinnering staat aan
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="border-habico-grey/60 rounded-2xl border border-dashed px-5 py-10 text-center">
                  <p className="text-habico-navy-dark text-sm font-bold">
                    Nog geen activiteiten in deze categorie
                  </p>
                  <p className="text-habico-blue/60 mt-1 text-xs">
                    Voeg er eentje toe en nodig je huisgenoten uit.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </section>

        <aside className="grid gap-4">
          <Card className="relative overflow-hidden bg-tangy-blue p-5 text-habico-white sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -bottom-10 size-32 rounded-full bg-habico-white/10"
            />
            <div className="relative">
              <p className="text-habico-white/65 text-[10px] font-bold tracking-[0.15em] uppercase">
                Goed om te weten
              </p>
              <h2 className="mt-2 text-lg font-bold">Een agenda voor iedereen</h2>
              <p className="text-habico-white/80 mt-2 text-xs leading-relaxed">
                Plan samen iets leuks, of deel een spontaan idee. Huisgenoten zien meteen wanneer
                en waar het is en kunnen laten weten of ze aansluiten.
              </p>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-habico-navy-dark text-base font-bold">Samen prettig wonen</h2>
            <p className="text-habico-blue/65 mt-2 text-xs leading-relaxed">
              Organiseer je een feestje? Laat je huisgenoten weten wat ze kunnen verwachten en
              houd rekening met afspraken over rust in huis.
            </p>
            <div className="border-habico-grey/60 text-habico-blue/60 mt-4 border-t pt-4 text-[11px] leading-relaxed">
              Een herinnering instellen helpt je om je plannen niet te vergeten. In deze demo wordt
              de instelling alleen op de pagina bijgehouden.
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}
