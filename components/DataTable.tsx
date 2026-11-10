import type { ReactNode } from 'react';
import type { ActivityRow } from '@/data/mock';

const statusStyles: Record<ActivityRow['status'], string> = {
  Afgerond: 'bg-tangy-blue/10 text-habico-blue',
  'In behandeling': 'bg-habico-orange/15 text-habico-navy',
  Gepland: 'bg-habico-grey/50 text-habico-navy',
};

type Column<T> = { key: string; heading: string; render: (row: T) => ReactNode };

const columns: Column<ActivityRow>[] = [
  {
    key: 'activity',
    heading: 'Activiteit',
    render: (row) => (
      <div className="min-w-48">
        <p className="text-habico-navy-dark font-semibold">{row.name}</p>
        <p className="text-habico-blue/60 mt-1 text-xs">{row.detail}</p>
      </div>
    ),
  },
  {
    key: 'date',
    heading: 'Moment',
    render: (row) => (
      <span className="text-habico-navy/70 text-xs font-medium whitespace-nowrap">{row.time}</span>
    ),
  },
  {
    key: 'status',
    heading: 'Status',
    render: (row) => (
      <span
        className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap ${statusStyles[row.status]}`}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: 'id',
    heading: 'Referentie',
    render: (row) => <span className="text-habico-blue/55 font-mono text-[11px]">{row.id}</span>,
  },
];

export function DataTable({ rows }: { rows: ActivityRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[690px] border-collapse text-left">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className="border-habico-grey/70 text-habico-blue/55 border-b px-4 pb-3 text-[10px] font-extrabold tracking-[0.12em] uppercase first:pl-0"
                key={column.key}
              >
                {column.heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="group" key={row.id}>
              {columns.map((column) => (
                <td
                  className="border-habico-grey/50 border-b px-4 py-4 align-middle text-sm group-last:border-b-0 first:pl-0 last:pr-0"
                  key={column.key}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
