import { useMemo, useState } from 'react';
import {
    addDays,
    ageLabel,
    calendarWeeks,
    daysUntil,
    freshness,
    ISO,
    monthLabel,
    today,
    weekDays,
    weekdayHeaders,
    weekLabel,
} from '../dates';
import type { State } from '../store';
import { milestonesForCard, userById } from '../store';
import type { Card, CardMilestone } from '../types';

type CalMode = 'month' | 'week';

interface Props {
    state: State;
    boardId: string;
    onEditCard: (cardId: string) => void;
}

const initials = (name: string): string =>
    name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

// Cards + milestones for the active board, indexed by ISO day.
interface DayIndex {
    cards: Card[];
    milestones: { m: CardMilestone; card: Card }[];
}

const indexByDay = (state: State, boardId: string): Map<string, DayIndex> => {
    const map = new Map<string, DayIndex>();
    const boardCards = state.cards.filter((c) => c.board_id === boardId);
    for (const card of boardCards) {
        const day = card.due_date.slice(0, 10);
        let entry = map.get(day);
        if (!entry) {
            entry = { cards: [], milestones: [] };
            map.set(day, entry);
        }
        entry.cards.push(card);
        for (const m of milestonesForCard(state, card.id)) {
            entry.milestones.push({ m, card });
        }
    }
    return map;
};

const missedMilestone = (state: State, card: Card, m: CardMilestone): boolean => {
    if (card.completed_at) return false;
    const col = state.columns.find((c) => c.id === m.column_id);
    if (!col) return false;
    const curPos = state.columns.find((c) => c.id === card.column_id)?.position ?? -1;
    return daysUntil(m.target_date) < 0 && curPos < col.position;
};

export function CalendarView({ state, boardId, onEditCard }: Props) {
    const board = state.boards.find((b) => b.id === boardId);
    const [mode, setMode] = useState<CalMode>('month');
    const [cursor, setCursor] = useState<string>(today());

    const index = useMemo(() => indexByDay(state, boardId), [state, boardId]);

    if (!board) return null;

    const [yStr, mStr] = cursor.split('-').map(Number);
    const year = yStr;
    const month0 = mStr - 1;

    const step = (delta: number) => {
        if (mode === 'month') {
            const d = new Date(year, month0 + delta, 1);
            setCursor(ISO(d));
        } else {
            setCursor(addDays(cursor, delta * 7));
        }
    };

    const weekIsos = mode === 'week' ? weekDays(cursor) : [];
    const weeks = mode === 'month' ? calendarWeeks(year, month0) : [];
    const label = mode === 'month' ? monthLabel(year, month0) : weekLabel(weekIsos);
    const t = today();

    return (
        <main className="main">
            <div className="board-header">
                <div>
                    <h1>{board.name}</h1>
                    <span className="desc">calendar</span>
                </div>
                <div className="cal-controls">
                    <div className="cal-seg">
                        <button
                            type="button"
                            className={mode === 'month' ? 'active' : ''}
                            onClick={() => setMode('month')}
                        >
                            Month
                        </button>
                        <button
                            type="button"
                            className={mode === 'week' ? 'active' : ''}
                            onClick={() => setMode('week')}
                        >
                            Week
                        </button>
                    </div>
                    <div className="cal-nav">
                        <button type="button" onClick={() => step(-1)} aria-label="Previous">
                            ‹
                        </button>
                        <button type="button" className="cal-today" onClick={() => setCursor(today())}>
                            Today
                        </button>
                        <button type="button" onClick={() => step(1)} aria-label="Next">
                            ›
                        </button>
                    </div>
                    <span className="cal-label">{label}</span>
                </div>
            </div>

            <div className="cal-grid-wrap">
                <div className="cal-weekdays">
                    {weekdayHeaders().map((w) => (
                        <span key={w}>{w}</span>
                    ))}
                </div>

                {mode === 'month' ? (
                    <div className="cal-month">
                        {weeks.map((row) => (
                            <div className="cal-row" key={row[0]}>
                                {row.map((iso) => {
                                    const entry = index.get(iso);
                                    const [, em, ed] = iso.split('-').map(Number);
                                    const inMonth = em - 1 === month0;
                                    const isToday = iso === t;
                                    const isPast = iso < t;
                                    return (
                                        <div
                                            key={iso}
                                            className={`cal-cell${inMonth ? '' : ' out'}${isToday ? ' today' : ''}${isPast ? ' past' : ''}`}
                                        >
                                            <span className="cal-date">{ed}</span>
                                            {entry && (
                                                <div className="cal-cell-items">
                                                    {entry.milestones.map(({ m, card }) => {
                                                        const col = state.columns.find((c) => c.id === m.column_id);
                                                        const missed = missedMilestone(state, card, m);
                                                        return (
                                                            <span
                                                                key={m.id}
                                                                className={`cal-milestone${missed ? ' missed' : ''}`}
                                                                title={`${col?.name ?? ''} milestone${missed ? ' — missed' : ''}`}
                                                            >
                                                                ◆ {col?.name ?? ''}
                                                            </span>
                                                        );
                                                    })}
                                                    {entry.cards.map((card) => {
                                                        const f = freshness(card.due_date, card.completed_at);
                                                        const assignee = userById(state, card.assigned_to);
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={card.id}
                                                                className={`cal-card ${f}`}
                                                                onClick={() => onEditCard(card.id)}
                                                            >
                                                                <span className={`priority ${card.priority}`} />
                                                                <span className="cal-card-title">{card.title}</span>
                                                                {assignee && (
                                                                    <span className="assignee">
                                                                        {initials(assignee.name)}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="cal-week">
                        {weekIsos.map((iso) => {
                            const entry = index.get(iso);
                            const [ey, em, ed] = iso.split('-').map(Number);
                            const isToday = iso === t;
                            const isPast = iso < t;
                            return (
                                <div key={iso} className={`cal-wcol${isToday ? ' today' : ''}${isPast ? ' past' : ''}`}>
                                    <header className="cal-whead">
                                        {new Date(ey, em - 1, ed).toLocaleDateString(undefined, {
                                            weekday: 'short',
                                        })}
                                        <span className="cal-wdate">{ed}</span>
                                    </header>
                                    <div className="cal-witems">
                                        {entry?.milestones.map(({ m, card }) => {
                                            const col = state.columns.find((c) => c.id === m.column_id);
                                            const missed = missedMilestone(state, card, m);
                                            return (
                                                <span
                                                    key={m.id}
                                                    className={`cal-milestone${missed ? ' missed' : ''}`}
                                                    title={`${col?.name ?? ''} milestone${missed ? ' — missed' : ''}`}
                                                >
                                                    ◆ {col?.name ?? ''}
                                                </span>
                                            );
                                        })}
                                        {entry?.cards.map((card) => {
                                            const f = freshness(card.due_date, card.completed_at);
                                            const assignee = userById(state, card.assigned_to);
                                            return (
                                                <button
                                                    type="button"
                                                    key={card.id}
                                                    className={`cal-card ${f}`}
                                                    onClick={() => onEditCard(card.id)}
                                                >
                                                    <span className={`priority ${card.priority}`} />
                                                    <span className="cal-card-title">{card.title}</span>
                                                    <span className="cal-card-meta">
                                                        {ageLabel(card.due_date, card.completed_at)}
                                                    </span>
                                                    {assignee && (
                                                        <span className="assignee">{initials(assignee.name)}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                        {(!entry || (entry.cards.length === 0 && entry.milestones.length === 0)) && (
                                            <div className="cal-wempty">—</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
