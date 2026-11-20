'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  Users,
  X,
} from 'lucide-react';
import { useProfiel } from '@/components/ProfielProvider';
import { useLocalStorageValue } from '@/hooks/useLocalStorageValue';
import {
  ACTIVITEITEN_OPSLAG,
  BEGIN_ACTIVITEITEN,
  isAgendaActiviteiten,
  type ActiviteitSoort,
  type AgendaActiviteit,
} from './data';
import { HUISNAAM } from '../huisgenoten/data';
import { useVandaag } from '../_hooks/useVandaag';

type ActivityView = 'Alles' | 'Mijn activiteiten' | 'Gezamenlijk';
type ActivityFilter = 'Alles' | ActiviteitSoort | 'Gemeld';

type ActivityDraft = {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  type: ActiviteitSoort;
  reminder: boolean;
  noiseNotice: boolean;
};

const activityTypes: ActiviteitSoort[] = ['Samen doen', 'Spontaan', 'Feestje'];
const filters: ActivityFilter[] = ['Alles', 'Samen doen', 'Spontaan', 'Feestje', 'Gemeld'];

const typeStyles: Record<ActiviteitSoort, string> = {
  'Samen doen': 'bg-habico-soft-blue text-tangy-blue',
  Spontaan: 'bg-emerald-50 text-emerald-700',
  Feestje: 'bg-orange-50 text-fire-orange',
};

const button =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition duration-200 motion-reduce:transition-none';

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function atNoon(date: string) {
  return new Date(`${date}T12:00:00`);
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

function activityTime(activity: Pick<AgendaActiviteit, 'time' | 'endTime'>) {
  return activity.endTime ? `${activity.time} – ${activity.endTime}` : activity.time;
}

function emptyDraft(date = ''): ActivityDraft {
  return {
    title: '',
    description: '',
    date,
    time: '18:00',
    endTime: '19:00',
    location: '',
    type: 'Samen doen',
    reminder: true,
    noiseNotice: false,
  };
}

export default function ActivitiesPage() {
  const { profiel } = useProfiel();
  const vandaag = useVandaag();
  const userName = profiel.voornaam.trim() || 'Marvin';
  const [activities, setActivities] = useLocalStorageValue(
    ACTIVITEITEN_OPSLAG,
    BEGIN_ACTIVITEITEN,
    isAgendaActiviteiten,
  );
  const today = vandaag ? dateKey(vandaag) : '2026-11-18';
  const [weekOffset, setWeekOffset] = useState(0);
  const week = useMemo(() => {
    const base = vandaag ?? new Date(2026, 10, 18, 12);
    return addDays(monday(base), weekOffset * 7);
  }, [vandaag, weekOffset]);
  const [view, setView] = useState<ActivityView>('Alles');
  const [filter, setFilter] = useState<ActivityFilter>('Alles');
  const [draft, setDraft] = useState<ActivityDraft>(() => emptyDraft(today));
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = activities.find((activity) => activity.id === selectedId) ?? null;
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (showForm || selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [showForm, selected]);

  function closeDialog() {
    setShowForm(false);
    setSelectedId(null);
  }

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(week, index)),
    [week],
  );

  const visibleActivities = useMemo(() => {
    return activities.filter((activity) => {
      const personal =
        activity.organizer === userName || activity.attending;
      const matchesView =
        view === 'Alles' ||
        (view === 'Mijn activiteiten' && personal) ||
        (view === 'Gezamenlijk' && !personal);
      const matchesFilter =
        filter === 'Alles' ||
        (filter === 'Gemeld'
          ? activity.reminder || Boolean(activity.noiseNotice)
          : activity.type === filter);
      return matchesView && matchesFilter;
    });
  }, [activities, filter, userName, view]);

  const weekActivities = visibleActivities.filter((activity) =>
    days.some((day) => dateKey(day) === activity.date),
  );

  const highlightedActivities = activities
    .filter((activity) => {
      const dateTime = new Date(`${activity.date}T${activity.time}:00`);
      const start = atNoon(today);
      const isSoon = dateTime >= start && dateTime <= addDays(start, 7);
      return activity.reminder || activity.noiseNotice || isSoon;
    })
    .sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
    )
    .slice(0, 4);

  function toggleAttendance(id: string) {
    setActivities((current) =>
      current.map((activity) => {
        if (activity.id !== id) return activity;
        const attending = !activity.attending;
        return {
          ...activity,
          attending,
          attendees: Math.max(0, activity.attendees + (attending ? 1 : -1)),
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

  function openForm(date = today) {
    setSelectedId(null);
    setDraft(emptyDraft(date));
    setShowForm(true);
  }

  function createActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activity: AgendaActiviteit = {
      id: `activity-${Date.now()}`,
      title: draft.title.trim(),
      description: draft.description.trim() || `Georganiseerd door ${userName}.`,
      date: draft.date,
      time: draft.time,
      endTime: draft.endTime,
      location: draft.location.trim(),
      organizer: userName,
      type: draft.type,
      attendees: 1,
      attending: true,
      reminder: draft.reminder,
      ...(draft.noiseNotice
        ? { noiseNotice: 'Er kan extra geluid zijn. Bedankt voor je begrip!' }
        : {}),
    };
    setActivities((current) => [...current, activity]);
    setView('Mijn activiteiten');
    setFilter('Alles');
    closeDialog();
  }

  return (
    <main className="relative isolate mx-auto min-h-[calc(100vh-76px)] max-w-[1480px] overflow-hidden px-4 py-8 sm:px-7 lg:px-10">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-habico-orange-red text-[10px] font-extrabold tracking-[0.2em] uppercase">
            {HUISNAAM.toUpperCase()} · SAMEN THUIS
          </p>
          <h1 className="text-habico-navy-dark mt-2 text-3xl font-extrabold">
            Activiteiten<span className="text-habico-orange">.</span>
          </h1>
          <p className="text-habico-blue/65 mt-2 max-w-xl text-sm">
            Plan, meld en volg activiteiten voor jou en het hele huis.
          </p>
        </div>
        <button type="button" onClick={() => openForm()} className={`${button} bg-habico-orange text-habico-white shadow-sm hover:bg-habico-orange-red`}>
          <Plus size={17} aria-hidden="true" />
          Activiteit toevoegen
        </button>
      </div>

      <section className="mb-5" aria-labelledby="activiteit-uitgelicht">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.16em] text-habico-orange-red uppercase">
              Vandaag en binnenkort
            </p>
            <h2 id="activiteit-uitgelicht" className="mt-1 text-lg font-extrabold text-habico-navy-dark">
              Uitgelichte activiteiten
            </h2>
          </div>
          {highlightedActivities.length > 0 && (
            <span className="text-xs font-semibold text-habico-blue/55">
              {highlightedActivities.length} {highlightedActivities.length === 1 ? 'moment' : 'momenten'}
            </span>
          )}
        </div>

        {highlightedActivities.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {highlightedActivities.map((activity) => {
              const date = atNoon(activity.date);
              const isSoon = activity.date >= today;
              return (
                <button
                  key={`highlight-${activity.id}`}
                  type="button"
                  onClick={() => setSelectedId(activity.id)}
                  className="group min-h-[156px] rounded-2xl border border-habico-grey/70 bg-habico-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-tangy-blue/30 hover:shadow-lg motion-reduce:translate-y-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold ${typeStyles[activity.type]}`}>
                      {activity.type}
                    </span>
                    {activity.reminder || activity.noiseNotice ? (
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-habico-soft-blue text-tangy-blue">
                        <Bell size={15} aria-hidden="true" />
                      </span>
                    ) : (
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-orange-50 text-fire-orange">
                        <CalendarDays size={15} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-[15px] font-extrabold leading-5 text-habico-navy-dark">
                    {activity.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-habico-blue/60">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} aria-hidden="true" />
                      {date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} aria-hidden="true" />
                      {activityTime(activity)}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-[10px] text-habico-blue/55">
                    {activity.organizer} · {isSoon ? 'Binnenkort' : 'Gepland'}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-habico-grey/70 bg-habico-white px-5 py-8 text-center">
            <p className="text-sm font-bold text-habico-navy-dark">Geen activiteiten in beeld</p>
            <p className="mt-1 text-xs text-habico-blue/55">Nieuwe activiteiten verschijnen hier wanneer ze dichtbij komen of een melding hebben.</p>
          </div>
        )}
      </section>

      <section className="mb-5 flex flex-wrap items-center justify-between gap-3" aria-label="Activiteitenfilters">
        <div className="flex flex-wrap gap-2">
          {(['Alles', 'Mijn activiteiten', 'Gezamenlijk'] as ActivityView[]).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              onClick={() => setView(item)}
              className={`min-h-10 rounded-full border px-4 text-xs font-bold transition ${
                view === item
                  ? 'border-habico-navy-dark bg-habico-navy-dark text-habico-white'
                  : 'border-habico-grey/80 bg-habico-white text-habico-blue/70 hover:border-tangy-blue hover:text-tangy-blue'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="text-xs font-semibold text-habico-blue/55">
          {visibleActivities.length} {visibleActivities.length === 1 ? 'activiteit' : 'activiteiten'}
        </p>
      </section>

      <section className="mb-5 flex gap-2 overflow-x-auto pb-1" aria-label="Soort activiteiten">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
            className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-bold transition ${
              filter === item
                ? 'border-tangy-blue bg-habico-soft-blue text-tangy-blue'
                : 'border-habico-grey/80 bg-habico-white text-habico-blue/60 hover:border-tangy-blue'
            }`}
          >
            {item === 'Gemeld' && <Bell size={13} aria-hidden="true" />}
            {item}
          </button>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-habico-grey/80 bg-habico-white shadow-sm">
        <header className="flex items-center justify-between border-b border-habico-grey/70 px-4 py-4 sm:px-6">
          <div className="flex gap-2">
            <button type="button" aria-label="Vorige week" onClick={() => setWeekOffset((current) => current - 1)} className="grid size-9 place-items-center rounded-lg border border-habico-grey/80 text-habico-navy hover:border-tangy-blue">
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Volgende week" onClick={() => setWeekOffset((current) => current + 1)} className="grid size-9 place-items-center rounded-lg border border-habico-grey/80 text-habico-navy hover:border-tangy-blue">
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          <h2 className="text-habico-navy-dark text-sm font-extrabold capitalize sm:text-lg">{weekTitle(week)}</h2>
          <button type="button" onClick={() => setWeekOffset(0)} className="min-h-9 rounded-lg border border-habico-grey/80 px-3 text-xs font-bold text-habico-navy hover:border-tangy-blue">
            Vandaag
          </button>
        </header>

        <div className="overflow-x-auto">
          <div className="grid min-w-[860px] grid-cols-7">
            {days.map((day) => {
              const key = dateKey(day);
              const dayActivities = weekActivities
                .filter((activity) => activity.date === key)
                .sort((a, b) => a.time.localeCompare(b.time));
              const isToday = key === today;

              return (
                <section key={key} className={`min-h-[430px] border-r border-habico-grey/60 last:border-r-0 ${isToday ? 'bg-tangy-blue/[0.035]' : ''}`}>
                  <header className="flex h-[82px] flex-col items-center justify-center border-b border-habico-grey/70 bg-habico-landing/35">
                    <span className="text-[10px] font-extrabold uppercase text-habico-blue/55">
                      {day.toLocaleDateString('nl-NL', { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span className={`mt-1 grid size-9 place-items-center rounded-full text-base font-extrabold ${isToday ? 'bg-tangy-blue text-habico-white' : 'text-habico-navy-dark'}`}>
                      {day.getDate()}
                    </span>
                  </header>
                  <div className="space-y-2 p-2.5">
                    {dayActivities.map((activity) => (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => setSelectedId(activity.id)}
                        className="group w-full rounded-2xl border border-habico-grey/70 bg-habico-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-tangy-blue/30 hover:shadow-md motion-reduce:translate-y-0"
                      >
                        <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${typeStyles[activity.type]}`}>{activity.type}</span>
                        <h3 className="mt-2 text-[12px] font-extrabold leading-[1.35] text-habico-navy-dark">{activity.title}</h3>
                        <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-habico-blue/65">
                          <Clock3 size={12} aria-hidden="true" /> {activityTime(activity)}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-habico-blue/55">{activity.organizer}</p>
                        {activity.reminder && <Bell size={12} className="mt-2 text-tangy-blue" aria-label="Herinnering aan" />}
                      </button>
                    ))}
                    {dayActivities.length === 0 && (
                      <button type="button" onClick={() => openForm(key)} className="flex min-h-[90px] w-full items-center justify-center rounded-2xl border border-dashed border-habico-grey/70 text-[10px] font-semibold text-habico-blue/35 hover:border-tangy-blue/50 hover:text-tangy-blue">
                        <Plus size={16} aria-hidden="true" /> Toevoegen
                      </button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <dialog
        ref={dialog}
        onClose={closeDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-habico-grey/80 bg-habico-white p-0 text-habico-navy shadow-2xl backdrop:bg-habico-navy-dark/30"
      >
        {showForm && (
          <form onSubmit={createActivity} className="p-5 sm:p-7">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.15em] text-habico-orange-red uppercase">Nieuwe activiteit</p>
                <h2 className="mt-1 text-xl font-extrabold text-habico-navy-dark">Wat gaan we doen?</h2>
              </div>
              <button type="button" onClick={closeDialog} aria-label="Sluiten" className="grid size-9 place-items-center rounded-full text-habico-blue/55 hover:bg-habico-landing">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-bold sm:col-span-2">
                Naam
                <input required maxLength={70} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="min-h-11 rounded-xl border border-habico-grey/80 px-3 outline-none focus:border-tangy-blue" />
              </label>
              <label className="grid gap-1.5 text-xs font-bold">
                Soort
                <select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as ActiviteitSoort })} className="min-h-11 rounded-xl border border-habico-grey/80 px-3 outline-none focus:border-tangy-blue">
                  {activityTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-bold">
                Locatie
                <input required maxLength={60} value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} className="min-h-11 rounded-xl border border-habico-grey/80 px-3 outline-none focus:border-tangy-blue" />
              </label>
              <label className="grid gap-1.5 text-xs font-bold">
                Datum
                <input required type="date" min={today} value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="min-h-11 rounded-xl border border-habico-grey/80 px-3 outline-none focus:border-tangy-blue" />
              </label>
              <label className="grid gap-1.5 text-xs font-bold">
                Tijd
                <input required type="time" value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} className="min-h-11 rounded-xl border border-habico-grey/80 px-3 outline-none focus:border-tangy-blue" />
              </label>
              <label className="grid gap-1.5 text-xs font-bold">
                Eindtijd
                <input
                  required
                  type="time"
                  min={draft.time}
                  value={draft.endTime}
                  onChange={(event) => setDraft({ ...draft, endTime: event.target.value })}
                  className="min-h-11 rounded-xl border border-habico-grey/80 px-3 outline-none focus:border-tangy-blue"
                />
              </label>
              <label className="grid gap-1.5 text-xs font-bold sm:col-span-2">
                Extra informatie
                <textarea rows={3} maxLength={180} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="rounded-xl border border-habico-grey/80 px-3 py-2.5 outline-none focus:border-tangy-blue" />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input type="checkbox" checked={draft.reminder} onChange={(event) => setDraft({ ...draft, reminder: event.target.checked })} className="size-4 accent-tangy-blue" />
                Herinnering
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input type="checkbox" checked={draft.noiseNotice} onChange={(event) => setDraft({ ...draft, noiseNotice: event.target.checked })} className="size-4 accent-habico-orange" />
                Geluidsmelding
              </label>
            </div>
            <button type="submit" className={`${button} mt-6 w-full bg-habico-orange text-white hover:bg-habico-orange-red`}>
              <Check size={17} aria-hidden="true" /> Activiteit plaatsen
            </button>
          </form>
        )}

        {selected && (
          <div className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${typeStyles[selected.type]}`}>{selected.type}</span>
                <h2 className="mt-3 text-xl font-extrabold text-habico-navy-dark">{selected.title}</h2>
              </div>
              <button type="button" onClick={closeDialog} aria-label="Sluiten" className="grid size-9 place-items-center rounded-full text-habico-blue/55 hover:bg-habico-landing">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-habico-blue/65">{selected.description}</p>
            <div className="mt-5 space-y-3 text-xs text-habico-blue/70">
              <p className="flex items-center gap-2"><CalendarDays size={16} /> {atNoon(selected.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <p className="flex items-center gap-2"><Clock3 size={16} /> {activityTime(selected)}</p>
              <p className="flex items-center gap-2"><MapPin size={16} /> {selected.location}</p>
              <p className="flex items-center gap-2"><Users size={16} /> {selected.attendees} deelnemers · Georganiseerd door {selected.organizer}</p>
              {selected.noiseNotice && <p className="rounded-xl border border-habico-orange/20 bg-habico-orange/10 p-3 leading-5">{selected.noiseNotice}</p>}
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => toggleAttendance(selected.id)} className={`${button} ${selected.attending ? 'border border-habico-grey/80 bg-habico-white text-habico-navy' : 'bg-habico-orange text-white'}`}>
                {selected.attending ? 'Uitschrijven' : 'Doe mee'}
              </button>
              <button type="button" onClick={() => toggleReminder(selected.id)} className={`${button} ${selected.reminder ? 'border border-tangy-blue/20 bg-habico-soft-blue text-tangy-blue' : 'bg-tangy-blue text-white'}`}>
                <Bell size={15} aria-hidden="true" />
                {selected.reminder ? 'Herinnering uit' : 'Herinner mij'}
              </button>
            </div>
          </div>
        )}
      </dialog>

    </main>
  );
}
