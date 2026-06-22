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
