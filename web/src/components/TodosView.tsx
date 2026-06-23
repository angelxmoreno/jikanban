import { useMemo, useState } from 'react';
import { ageLabel, daysUntil, freshness } from '../dates';
import type { State } from '../store';
import { boardsForWorkspace, milestonesForCard } from '../store';
import type { Card, CardMilestone, Column, Priority } from '../types';

interface Props {
    state: State;
    workspaceId: string;
    onEditCard: (cardId: string) => void;
}

// Not-done first by daysUntil asc (overdue naturally sorts first), done last.
const byUrgency = (a: Card, b: Card): number => {
    const aDone = Boolean(a.completed_at);
    const bDone = Boolean(b.completed_at);
    if (aDone !== bDone) return aDone ? 1 : -1;
    return daysUntil(a.due_date) - daysUntil(b.due_date);
};

export function TodosView({ state, workspaceId, onEditCard }: Props) {
    const [boardFilter, setBoardFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

    const workspaceBoards = useMemo(() => boardsForWorkspace(state, workspaceId), [state, workspaceId]);
    const boardIds = useMemo(() => new Set(workspaceBoards.map((b) => b.id)), [workspaceBoards]);

    const todos = useMemo(() => {
        return state.cards
            .filter((c) => c.assigned_to === state.currentUserId && boardIds.has(c.board_id))
            .filter((c) => boardFilter === 'all' || c.board_id === boardFilter)
            .filter((c) => priorityFilter === 'all' || c.priority === priorityFilter)
            .sort(byUrgency);
    }, [state, boardIds, boardFilter, priorityFilter]);

    const boardName = (id: string): string => workspaceBoards.find((b) => b.id === id)?.name ?? '';
    const columnName = (id: string): string => state.columns.find((c) => c.id === id)?.name ?? '';

    const overdueCount = todos.filter((c) => freshness(c.due_date, c.completed_at) === 'stale').length;

    return (
        <main className="main">
            <div className="board-header">
                <div>
                    <h1>My todos</h1>
                    <span className="desc">
                        {state.users.find((u) => u.id === state.currentUserId)?.name ?? ''}
                        {overdueCount > 0 && <span className="todos-overdue"> · {overdueCount} overdue</span>}
                    </span>
                </div>
                <div className="todos-filters">
                    <select
                        aria-label="Filter by board"
                        value={boardFilter}
                        onChange={(e) => setBoardFilter(e.target.value)}
                    >
                        <option value="all">All boards</option>
                        {workspaceBoards.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                    <select
                        aria-label="Filter by priority"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                    >
                        <option value="all">All priorities</option>
                        <option value="high">high</option>
                        <option value="medium">medium</option>
                        <option value="low">low</option>
                    </select>
                </div>
            </div>

            <div className="todos-list">
                {todos.length === 0 && <div className="todos-empty">No cards assigned to you.</div>}
                {todos.map((card) => {
                    const f = freshness(card.due_date, card.completed_at);
                    const missed = missedMilestones(state, card);
                    return (
                        <button
                            type="button"
                            key={card.id}
                            className={`todos-row ${f}`}
                            onClick={() => onEditCard(card.id)}
                        >
                            <span className={`priority ${card.priority}`} title={`priority: ${card.priority}`} />
                            <span className="todos-title">{card.title}</span>
                            <span className="todos-board">{boardName(card.board_id)}</span>
                            <span className="todos-col">{columnName(card.column_id)}</span>
                            {missed.length > 0 && <span className="stamp missed">missed</span>}
                            <span className="todos-age">{ageLabel(card.due_date, card.completed_at)}</span>
                        </button>
                    );
                })}
            </div>
        </main>
    );
}

const missedMilestones = (state: State, card: Card): string[] => {
    if (card.completed_at) return [];
    const curPos = state.columns.find((c) => c.id === card.column_id)?.position ?? -1;
    return milestonesForCard(state, card.id)
        .map((m) => ({ m, col: state.columns.find((c) => c.id === m.column_id) }))
        .filter(
            (x): x is { m: CardMilestone; col: Column } =>
                x.col !== undefined && daysUntil(x.m.target_date) < 0 && curPos < x.col.position
        )
        .map((x) => x.col.name);
};
