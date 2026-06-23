// Date math for the freshness system. All board dates are ISO 8601 date-only
// (YYYY-MM-DD). Parsed as local dates to avoid TZ drift.

const DAY_MS = 86_400_000;

const localMidnight = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const today = (): string => {
    const d = localMidnight(new Date());
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const isoNow = (): string => new Date().toISOString();

// Whole days from today until the given date. Negative = past.
export const daysUntil = (isoDate: string): number => {
    const [y, m, d] = isoDate.split('-').map(Number);
    const due = localMidnight(new Date(y, m - 1, d));
    return Math.round((due.getTime() - localMidnight(new Date()).getTime()) / DAY_MS);
};

export type Freshness = 'fresh' | 'soon' | 'stale' | 'done';

export const freshness = (dueDate: string, completedAt?: string): Freshness => {
    if (completedAt) return 'done';
    const d = daysUntil(dueDate);
    if (d < 0) return 'stale';
    if (d <= 3) return 'soon';
    return 'fresh';
};

export const ageLabel = (dueDate: string, completedAt?: string): string => {
    if (completedAt) return 'done';
    const d = daysUntil(dueDate);
    if (d === 0) return 'due today';
    if (d < 0) return `${Math.abs(d)}d overdue`;
    return `due in ${d}d`;
};

// --- Calendar helpers. ISO dates are local (YYYY-MM-DD). Week starts Monday.

export const ISO = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const parseISO = (iso: string): Date => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const addDays = (iso: string, n: number): string => {
    const d = parseISO(iso);
    d.setDate(d.getDate() + n);
    return ISO(d);
};

// 0=Sun .. 6=Sat -> Monday-based index 0..6
const monIndex = (d: Date): number => (d.getDay() + 6) % 7;

// 6 weeks x 7 days of ISO strings covering the month (Monday-start).
export const calendarWeeks = (year: number, month0: number): string[][] => {
    const first = new Date(year, month0, 1);
    const start = new Date(first);
    start.setDate(start.getDate() - monIndex(first));
    const weeks: string[][] = [];
    for (let w = 0; w < 6; w++) {
        const row: string[] = [];
        for (let i = 0; i < 7; i++) {
            row.push(ISO(start));
            start.setDate(start.getDate() + 1);
        }
        weeks.push(row);
    }
    return weeks;
};

// 7 ISO strings of the week containing `anchorIso` (Monday-start).
export const weekDays = (anchorIso: string): string[] => {
    const anchor = parseISO(anchorIso);
    const start = new Date(anchor);
    start.setDate(start.getDate() - monIndex(anchor));
    return Array.from({ length: 7 }, (_, i) => addDays(ISO(start), i));
};

export const monthLabel = (year: number, month0: number): string =>
    new Date(year, month0, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

export const weekLabel = (isoDays: string[]): string => {
    const a = isoDays[0];
    const b = isoDays[6];
    const [ay, am, ad] = a.split('-').map(Number);
    const [by, bm, bd] = b.split('-').map(Number);
    const sameMonth = am === bm && ay === by;
    const startStr = new Date(ay, am - 1, ad).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endStr = sameMonth
        ? String(bd)
        : new Date(by, bm - 1, bd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${startStr} – ${endStr}, ${ay}`;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const weekdayHeaders = (): string[] => WEEKDAYS;
