'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListChecks,
  MapPin,
  Plus,
  Recycle,
  Search,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useLocalStorageValue } from '@/hooks/useLocalStorageValue';
import { useProfiel } from '@/components/ProfielProvider';
import {
  ACTIVITEITEN_OPSLAG,
  BEGIN_ACTIVITEITEN,
  isAgendaActiviteiten,
  type AgendaActiviteit,
} from '../activiteiten/data';
import { REGISTRATIES_OPSLAG, TAKEN, type Taak } from '../takenlijst/data';
import { HUISNAAM } from '../huisgenoten/data';
import { useVandaag } from '../_hooks/useVandaag';

type EventType = 'Activiteit' | 'Taak' | 'Afval';
type KalenderEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  type: EventType;
  subtitle: string;
  href: string;
  description?: string;
  location?: string;
  person?: string;
  attendees?: number;
  noiseNotice?: string;
};

type WasteMoment = {
  id: string;
  soort: string;
  datum: string;
  tijd: string;
  bewoner: string;
  buitengezet: boolean;
};

type TaakRegistratie = {
  id: string;
  taakId: number;
  naam: string;
  categorie: 'schoonmaak' | 'huishoudelijk';
  bewoner: string;
  minuten: number;
  datum: string;
};

const WASTE_STORAGE = 'habico-afval-v1';
const FILTERS: Array<'Alles' | EventType> = ['Alles', 'Activiteit', 'Taak', 'Afval'];

function isWasteMoment(value: unknown): value is WasteMoment {
  if (!value || typeof value !== 'object') return false;
  const moment = value as Partial<WasteMoment>;
  return (
    typeof moment.id === 'string' &&
    typeof moment.soort === 'string' &&
    typeof moment.datum === 'string' &&
    typeof moment.tijd === 'string' &&
    typeof moment.bewoner === 'string' &&
    typeof moment.buitengezet === 'boolean'
  );
}

function isWasteMoments(value: unknown): value is WasteMoment[] {
  return Array.isArray(value) && value.every(isWasteMoment);
}

function isWasteData(value: unknown): value is { momenten: WasteMoment[] } {
  if (!value || typeof value !== 'object') return false;
  const data = value as { momenten?: unknown };
  return Array.isArray(data.momenten) && isWasteMoments(data.momenten);
}

function isTaskRegistrations(value: unknown): value is TaakRegistratie[] {
  return (
    Array.isArray(value) &&
    value.every((registration) => {
      if (!registration || typeof registration !== 'object') return false;
      const item = registration as Partial<TaakRegistratie>;
      return (
        typeof item.id === 'string' &&
        typeof item.taakId === 'number' &&
        typeof item.naam === 'string' &&
        (item.categorie === 'schoonmaak' || item.categorie === 'huishoudelijk') &&
        typeof item.bewoner === 'string' &&
        typeof item.minuten === 'number' &&
        typeof item.datum === 'string'
      );
    })
  );
}

const typeStyles: Record<EventType, { dot: string; chip: string; card: string }> = {
  Activiteit: {
    dot: 'bg-fire-orange',
    chip: 'bg-orange-50 text-fire-orange',
    card: 'border-fire-orange/20 bg-fire-orange/[0.06]',
  },
  Taak: {
    dot: 'bg-tangy-blue',
    chip: 'bg-habico-soft-blue text-tangy-blue',
    card: 'border-tangy-blue/20 bg-tangy-blue/[0.06]',
  },
  Afval: {
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700',
    card: 'border-emerald-500/20 bg-emerald-50',
  },
};

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function atNoon(date: string) {
  return new Date(`${date}T12:00:00`);
}

function eventTime(event: Pick<KalenderEvent, 'time' | 'endTime'>) {
  return event.endTime ? `${event.time} – ${event.endTime}` : event.time;
}

function monday(date: Date) {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function weekTitle(start: Date) {
  const end = addDays(start, 6);
  const startText = start.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  const endText = end.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${startText} — ${endText}`;
}

function taskDate(task: Taak, week: Date) {
  return dateKey(addDays(week, task.dag));
}

export default function CalendarPage() {
  const vandaag = useVandaag();
  const { profiel } = useProfiel();
  const userName = profiel.voornaam.trim();
  const [weekOffset, setWeekOffset] = useState(0);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Alles');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addDate, setAddDate] = useState<{ date: string; label: string } | null>(null);
  const addDialog = useRef<HTMLDialogElement>(null);
  const [activities] = useLocalStorageValue(
    ACTIVITEITEN_OPSLAG,
    BEGIN_ACTIVITEITEN,
    isAgendaActiviteiten,
  );
  const [wasteData] = useLocalStorageValue(
    WASTE_STORAGE,
    { momenten: [] },
    isWasteData,
  );
  const [taskRegistrations] = useLocalStorageValue(
    REGISTRATIES_OPSLAG,
    [],
    isTaskRegistrations,
  );

  const week = useMemo(() => {
    const base = vandaag ?? new Date(2026, 10, 18, 12);
    return addDays(monday(base), weekOffset * 7);
  }, [vandaag, weekOffset]);
  const todayKey = vandaag ? dateKey(vandaag) : '2026-11-18';

  useEffect(() => {
    if (addDate) addDialog.current?.showModal();
    else addDialog.current?.close();
  }, [addDate]);

  const wasteMoments = wasteData.momenten;

  const events = useMemo<KalenderEvent[]>(() => {
    const activityEvents: KalenderEvent[] = activities
      .filter((activity) => activity.organizer === userName || activity.attending)
      .map((activity: AgendaActiviteit) => ({
      id: activity.id,
      title: activity.title,
      date: activity.date,
      time: activity.time,
      endTime: activity.endTime,
      type: 'Activiteit',
      subtitle: activity.location || activity.type,
      href: '/dashboard/activiteiten',
      description: activity.description,
      location: activity.location,
      person: activity.organizer,
      attendees: activity.attendees,
      noiseNotice: activity.noiseNotice,
      }));

    const plannedTaskEvents: KalenderEvent[] = TAKEN
      .filter((task) => task.bewoner === userName)
      .map((task) => ({
      id: `task-${weekOffset}-${task.id}-${dateKey(week)}`,
      title: task.naam,
      date: taskDate(task, week),
      time: '09:00',
      type: 'Taak',
      subtitle: `${task.bewoner} · ${task.minuten} min`,
      href: '/dashboard/takenlijst',
      description: `${task.categorie === 'schoonmaak' ? 'Schoonmaaktaak' : 'Huishoudelijke taak'} van ${task.minuten} minuten.`,
      location: task.ruimte,
      person: task.bewoner,
      }));

    const registeredTaskEvents: KalenderEvent[] = taskRegistrations
      .filter((registration) => registration.bewoner === userName)
      .map((registration) => ({
        id: `registration-${registration.id}`,
        title: registration.naam,
        date: registration.datum,
        time: '09:00',
        type: 'Taak',
        subtitle: `${registration.bewoner} · ${registration.minuten} min`,
        href: '/dashboard/takenlijst',
        description: `Registratie van ${registration.minuten} minuten voor deze taak.`,
        person: registration.bewoner,
      }));

    const wasteEvents: KalenderEvent[] = wasteMoments
      .filter((moment) => moment.bewoner === userName)
      .map((moment) => ({
      id: moment.id,
      title: `${moment.soort} buitenzetten`,
      date: moment.datum,
      time: moment.tijd,
      type: 'Afval',
      subtitle: moment.bewoner,
      href: '/dashboard/afval',
      person: moment.bewoner,
      }));

    return [...activityEvents, ...plannedTaskEvents, ...registeredTaskEvents, ...wasteEvents];
  }, [activities, taskRegistrations, userName, week, weekOffset, wasteMoments]);

  const visibleEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesFilter = filter === 'Alles' || event.type === filter;
        const haystack = `${event.title} ${event.subtitle} ${event.person ?? ''} ${event.location ?? ''}`.toLowerCase();
        return matchesFilter && haystack.includes(search.trim().toLowerCase());
      }),
    [events, filter, search],
  );

  const days = Array.from({ length: 7 }, (_, index) => addDays(week, index));
  const weekEvents = visibleEvents
    .filter((event) => event.date >= dateKey(week) && event.date <= dateKey(addDays(week, 6)))
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  const weekCount = weekEvents.length;
  const selectedEvent = visibleEvents.find((event) => event.id === selectedId);

  function changeWeek(amount: number) {
    setWeekOffset((current) => current + amount);
    setSelectedId(null);
  }

  function goToToday() {
    setWeekOffset(0);
    setSelectedId(null);
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-76px)] max-w-[1480px] px-4 py-8 sm:px-7 lg:px-10">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-habico-orange-red text-[10px] font-extrabold tracking-[0.2em] uppercase">
            {HUISNAAM.toUpperCase()} · SAMEN THUIS
          </p>
          <h1 className="text-habico-navy-dark mt-2 text-3xl font-extrabold">
            Agenda<span className="text-habico-orange">.</span>
          </h1>
          <p className="text-habico-blue/65 mt-2 max-w-xl text-sm">
            Jouw activiteiten, taken en ophaalmomenten in één overzicht.
          </p>
        </div>
      </div>

      <section className="mb-5 flex flex-wrap items-center gap-2" aria-label="Kalenderfilters">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => {
                setFilter(item);
                setSelectedId(null);
              }}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-bold transition ${
                filter === item
                  ? 'border-habico-navy-dark bg-habico-navy-dark text-habico-white'
                  : 'border-habico-grey/80 bg-habico-white text-habico-blue/70 hover:border-tangy-blue hover:text-tangy-blue'
              }`}
            >
              {item !== 'Alles' && (
                <span aria-hidden="true" className={`size-2 rounded-full ${typeStyles[item].dot}`} />
              )}
              {item}
            </button>
          ))}
        </div>
        <label className="relative min-w-[180px] flex-1 sm:max-w-[260px]">
          <span className="sr-only">Agenda doorzoeken</span>
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-habico-blue/50"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Zoeken..."
            className="min-h-10 w-full rounded-full border border-habico-grey/80 bg-habico-white pr-9 pl-9 text-xs font-semibold text-habico-navy outline-none transition placeholder:text-habico-blue/40 focus:border-tangy-blue focus:ring-2 focus:ring-tangy-blue/10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Zoektekst wissen"
              className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-habico-blue/50 hover:bg-habico-landing hover:text-habico-navy"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </label>
        <p className="ml-auto text-xs font-semibold text-habico-blue/55">
          {weekCount} {weekCount === 1 ? 'afspraak' : 'afspraken'} deze week
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 overflow-hidden rounded-3xl border border-habico-grey/80 bg-habico-white shadow-sm">
          <header className="flex items-center justify-between border-b border-habico-grey/70 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeWeek(-1)}
                aria-label="Vorige week"
                className="grid size-9 place-items-center rounded-lg border border-habico-grey/80 text-habico-navy transition hover:border-tangy-blue hover:text-tangy-blue"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => changeWeek(1)}
                aria-label="Volgende week"
                className="grid size-9 place-items-center rounded-lg border border-habico-grey/80 text-habico-navy transition hover:border-tangy-blue hover:text-tangy-blue"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
            <h2 className="text-habico-navy-dark text-base font-extrabold capitalize sm:text-lg">
              {weekTitle(week)}
            </h2>
            <button
              type="button"
              onClick={goToToday}
              className="min-h-9 rounded-lg border border-habico-grey/80 px-3 text-xs font-bold text-habico-navy transition hover:border-tangy-blue hover:text-tangy-blue"
            >
              Vandaag
            </button>
          </header>

          <div className="overflow-x-auto">
            <div className="grid min-w-[860px] grid-cols-7">
              {days.map((day) => {
                const key = dateKey(day);
                const dayEvents = visibleEvents
                  .filter((event) => event.date === key)
                  .sort((a, b) => a.time.localeCompare(b.time));
                const isToday = key === todayKey;
                const dayName = day.toLocaleDateString('nl-NL', { weekday: 'short' }).replace('.', '');

                return (
                  <section
                    key={key}
                    className={`min-h-[470px] border-r border-habico-grey/60 last:border-r-0 ${
                      isToday ? 'bg-tangy-blue/[0.035]' : 'bg-habico-white'
                    }`}
                  >
                    <header
                      className={`flex h-[82px] flex-col items-center justify-center border-b border-habico-grey/70 ${
                        isToday ? 'bg-tangy-blue/[0.05]' : 'bg-habico-landing/35'
                      }`}
                    >
                      <span className="text-[10px] font-extrabold uppercase text-habico-blue/55">{dayName}</span>
                      <span
                        className={`mt-1 grid size-9 place-items-center rounded-full text-base font-extrabold ${
                          isToday
                            ? 'bg-tangy-blue text-habico-white shadow-sm'
                            : 'text-habico-navy-dark'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                    </header>

                    <div className="space-y-2 p-2.5">
                      {dayEvents.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => setSelectedId(event.id)}
                          aria-label={`${event.title}, ${eventTime(event)}`}
                          className={`group w-full rounded-2xl border p-3 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                            typeStyles[event.type].card
                          } ${selectedId === event.id ? 'ring-2 ring-habico-navy-dark/20' : ''}`}
                        >
                          <span className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-bold ${typeStyles[event.type].chip}`}>
                            <span className={`size-1.5 rounded-full ${typeStyles[event.type].dot}`} />
                            {event.type}
                          </span>
                          <h3 className="text-habico-navy-dark text-[12px] font-extrabold leading-[1.35]">
                            {event.title}
                          </h3>
                          <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-habico-blue/65">
                            <Clock3 size={12} aria-hidden="true" />
                            {eventTime(event)}
                          </p>
                          {event.person && (
                            <p className="mt-1 truncate text-[10px] text-habico-blue/55">{event.person}</p>
                          )}
                        </button>
                      ))}
                      {dayEvents.length === 0 && (
                        <div className="flex min-h-[90px] items-center justify-center rounded-2xl border border-dashed border-habico-grey/70 text-[10px] font-semibold text-habico-blue/35">
                          Geen items
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setAddDate({
                            date: key,
                            label: atNoon(key).toLocaleDateString('nl-NL', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            }),
                          })
                        }
                        aria-label={`Toevoegen op ${dayName} ${day.getDate()}`}
                        className="mx-auto flex size-9 items-center justify-center rounded-full text-habico-blue/35 transition hover:bg-habico-soft-blue hover:text-tangy-blue"
                      >
                        <Plus size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-habico-grey/80 bg-habico-white p-5 shadow-sm xl:sticky xl:top-24">
          <div className="flex items-center justify-between">
            <p className="text-habico-blue/55 text-[10px] font-extrabold tracking-[0.16em] uppercase">
              Selectie
            </p>
            {selectedEvent && (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Selectie sluiten"
                className="grid size-8 place-items-center rounded-full text-habico-blue/45 transition hover:bg-habico-landing hover:text-habico-navy"
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>
          {selectedEvent ? (
            <div className="mt-4">
              <div className={`mb-4 flex size-11 items-center justify-center rounded-xl ${typeStyles[selectedEvent.type].chip}`}>
                {selectedEvent.type === 'Activiteit' && <Users size={21} aria-hidden="true" />}
                {selectedEvent.type === 'Taak' && <ListChecks size={21} aria-hidden="true" />}
                {selectedEvent.type === 'Afval' && <Recycle size={21} aria-hidden="true" />}
              </div>
              <h3 className="text-habico-navy-dark text-lg font-extrabold">{selectedEvent.title}</h3>
              <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${typeStyles[selectedEvent.type].chip}`}>
                {selectedEvent.type}
              </span>
              {selectedEvent.description && (
                <p className="mt-4 text-xs leading-5 text-habico-blue/65">
                  {selectedEvent.description}
                </p>
              )}
              <div className="mt-5 space-y-3 text-xs text-habico-blue/70">
                <p className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-habico-navy" aria-hidden="true" />
                  {atNoon(selectedEvent.date).toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 size={16} className="text-habico-navy" aria-hidden="true" />
                  {eventTime(selectedEvent)}
                </p>
                {selectedEvent.location && (
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="shrink-0 text-habico-navy" aria-hidden="true" />
                    {selectedEvent.location}
                  </p>
                )}
                {selectedEvent.person && (
                  <p className="flex items-center gap-2">
                    <Sparkles size={16} className="text-habico-navy" aria-hidden="true" />
                    {selectedEvent.person}
                  </p>
                )}
                {selectedEvent.attendees !== undefined && (
                  <p className="flex items-center gap-2">
                    <Users size={16} className="text-habico-navy" aria-hidden="true" />
                    {selectedEvent.attendees} {selectedEvent.attendees === 1 ? 'deelnemer' : 'deelnemers'}
                  </p>
                )}
              </div>
              {selectedEvent.noiseNotice && (
                <p className="mt-4 rounded-xl border border-habico-orange/20 bg-habico-orange/10 p-3 text-[11px] leading-5 text-habico-navy">
                  {selectedEvent.noiseNotice}
                </p>
              )}
              <Link
                href={selectedEvent.href}
                className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-habico-orange px-4 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-habico-orange-red motion-reduce:translate-y-0"
                style={{ color: '#fff' }}
              >
                {selectedEvent.type === 'Activiteit'
                  ? 'Activiteiten bekijken'
                  : selectedEvent.type === 'Taak'
                    ? 'Takenlijst openen'
                    : 'Afvalplanning openen'}
              </Link>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-habico-landing/60 p-4 text-sm leading-6 text-habico-blue/65">
              Er zijn geen afspraken zichtbaar met dit filter.
            </div>
          )}

          {weekEvents.length > 0 && (
            <div className="mt-5 border-t border-habico-grey/70 pt-4">
              <p className="mb-2 text-[10px] font-extrabold tracking-[0.14em] text-habico-blue/55 uppercase">
                Volgende in overzicht
              </p>
              <div className="max-h-[240px] space-y-1.5 overflow-y-auto pr-1">
                {weekEvents.slice(0, 8).map((event) => (
                  <button
                    key={`overview-${event.id}`}
                    type="button"
                    onClick={() => setSelectedId(event.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
                      selectedEvent?.id === event.id
                        ? 'border-habico-navy-dark/25 bg-habico-landing'
                        : 'border-transparent hover:bg-habico-landing/70'
                    }`}
                  >
                    <span className={`size-2 shrink-0 rounded-full ${typeStyles[event.type].dot}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-bold text-habico-navy-dark">
                        {event.title}
                      </span>
                      <span className="mt-0.5 block text-[9px] text-habico-blue/55">
                        {atNoon(event.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} · {eventTime(event)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <dialog
        ref={addDialog}
        onClose={() => setAddDate(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setAddDate(null);
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-habico-grey/80 bg-habico-white p-0 shadow-2xl backdrop:bg-habico-navy-dark/30"
      >
        {addDate && (
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.16em] text-habico-orange-red uppercase">
                  Toevoegen
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-habico-navy-dark">
                  Wat wil je plannen?
                </h2>
                <p className="mt-1 text-xs text-habico-blue/55">{addDate.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setAddDate(null)}
                aria-label="Menu sluiten"
                className="grid size-9 shrink-0 place-items-center rounded-full text-habico-blue/55 transition hover:bg-habico-landing hover:text-habico-navy"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <Link
                href="/dashboard/activiteiten"
                onClick={() => setAddDate(null)}
                className="group flex min-h-24 items-center gap-3 rounded-2xl border border-fire-orange/20 bg-fire-orange/[0.06] p-4 text-habico-navy-dark transition hover:-translate-y-0.5 hover:border-fire-orange/40 hover:shadow-md motion-reduce:translate-y-0"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-fire-orange">
                  <Users size={19} aria-hidden="true" />
                </span>
                <span className="text-sm font-extrabold">Activiteit</span>
              </Link>
              <Link
                href="/dashboard/takenlijst"
                onClick={() => setAddDate(null)}
                className="group flex min-h-24 items-center gap-3 rounded-2xl border border-tangy-blue/20 bg-tangy-blue/[0.06] p-4 text-habico-navy-dark transition hover:-translate-y-0.5 hover:border-tangy-blue/40 hover:shadow-md motion-reduce:translate-y-0"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-habico-soft-blue text-tangy-blue">
                  <ListChecks size={19} aria-hidden="true" />
                </span>
                <span className="text-sm font-extrabold">Taak</span>
              </Link>
              <Link
                href="/dashboard/afval"
                onClick={() => setAddDate(null)}
                className="group flex min-h-24 items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50 p-4 text-habico-navy-dark transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md motion-reduce:translate-y-0"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Recycle size={19} aria-hidden="true" />
                </span>
                <span className="text-sm font-extrabold">Afvalmoment</span>
              </Link>
              <Link
                href="/dashboard/boodschappenlijst"
                onClick={() => setAddDate(null)}
                className="group flex min-h-24 items-center gap-3 rounded-2xl border border-habico-grey/80 bg-habico-landing/60 p-4 text-habico-navy-dark transition hover:-translate-y-0.5 hover:border-tangy-blue/40 hover:shadow-md motion-reduce:translate-y-0"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-habico-soft-blue text-tangy-blue">
                  <ShoppingCart size={19} aria-hidden="true" />
                </span>
                <span className="text-sm font-extrabold">Boodschappen</span>
              </Link>
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}
