import { ageLabel, daysUntil, freshness } from '../dates';
import type { State } from '../store';
import { milestonesForCard, userById } from '../store';
import type { Card, CardMilestone, Column } from '../types';

interface Props {
    card: Card;
    state: State;
    dragging: boolean;
    onEdit: (cardId: string) => void;
    onDragStart: (cardId: string) => void;
}

const initials = (name: string): string =>
    name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

export function CardItem({ card, state, dragging, onEdit, onDragStart }: Props) {
    const f = freshness(card.due_date, card.completed_at);
    const assignee = userById(state, card.assigned_to);
    const curPos = state.columns.find((c) => c.id === card.column_id)?.position ?? -1;
    const missed = milestonesForCard(state, card.id)
        .map((m) => ({ m, col: state.columns.find((c) => c.id === m.column_id) }))
        .filter(
            (x): x is { m: CardMilestone; col: Column } =>
                x.col !== undefined && daysUntil(x.m.target_date) < 0 && curPos < x.col.position
        )
        .map((x) => x.col.name);

    return (
        <button
            type="button"
            className={`card${dragging ? ' dragging' : ''}`}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('text/cardId', card.id);
                e.dataTransfer.effectAllowed = 'move';
                onDragStart(card.id);
            }}
            onClick={() => onEdit(card.id)}
        >
            {f === 'stale' && <span className="stamp stale">stale</span>}
            {missed.length > 0 && <span className="stamp missed">missed</span>}
            <span className="card-title">{card.title}</span>
            <span className="card-meta">
                <span className={`priority ${card.priority}`} title={`priority: ${card.priority}`} />
                <span>{ageLabel(card.due_date, card.completed_at)}</span>
                {assignee && <span className="assignee">{initials(assignee.name)}</span>}
            </span>
            <span className={`rail ${f}`} />
        </button>
    );
}
