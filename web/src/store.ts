// In-memory store. Phase 6 replaces this with Hono RPC calls; the action
// shapes here prefigure the API. Transitions are append-only (DECISION-009).

import { isoNow } from './dates';
import {
    currentUserId,
    boards as seedBoards,
    cards as seedCards,
    columns as seedColumns,
    milestones as seedMilestones,
    transitions as seedTransitions,
    users as seedUsers,
} from './dummy';
import type { Board, Card, CardMilestone, CardTransition, Column, Priority, User } from './types';

export interface State {
    users: User[];
    boards: Board[];
    columns: Column[];
    cards: Card[];
    milestones: CardMilestone[];
    transitions: CardTransition[];
}

export const initialState: State = {
    users: seedUsers,
    boards: seedBoards,
    columns: seedColumns,
    cards: seedCards,
    milestones: seedMilestones,
    transitions: seedTransitions,
};

export interface NewCard {
    boardId: string;
    title: string;
    description?: string;
    priority: Priority;
    dueDate: string;
    assignedTo?: string;
    assignedBy?: string;
    milestones: { columnId: string; targetDate: string }[];
}

export interface EditCard {
    cardId: string;
    title: string;
    description?: string;
    priority: Priority;
    dueDate: string;
    assignedTo?: string;
    assignedBy?: string;
    milestones: { columnId: string; targetDate: string }[];
}

export type Action =
    | { type: 'move'; cardId: string; toColumnId: string }
    | { type: 'addCard'; payload: NewCard }
    | { type: 'updateCard'; payload: EditCard };

const uid = (): string => crypto.randomUUID();

// Stamps work_started_at when leaving Backlog, completed_at when entering
// Complete; clears completed_at when leaving Complete (DECISION-009 transition appended).
const moveCard = (card: Card, toColumnId: string, columns: Column[]): Card => {
    const from = card.column_id;
    const toCol = columns.find((c) => c.id === toColumnId);
    const fromCol = columns.find((c) => c.id === from);
    const now = isoNow();
    const next: Card = { ...card, column_id: toColumnId, updated_at: now };
    if (fromCol?.is_backlog && !toCol?.is_backlog && !next.work_started_at) next.work_started_at = now;
    if (toCol?.is_complete && !next.completed_at) next.completed_at = now;
    if (fromCol?.is_complete && !toCol?.is_complete) next.completed_at = undefined;
    return next;
};

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'move': {
            const card = state.cards.find((c) => c.id === action.cardId);
            if (!card || card.column_id === action.toColumnId) return state;
            const fromCol = state.columns.find((c) => c.id === card.column_id);
            return {
                ...state,
                cards: state.cards.map((c) =>
                    c.id === action.cardId ? moveCard(c, action.toColumnId, state.columns) : c
                ),
                transitions: [
                    ...state.transitions,
                    {
                        id: uid(),
                        card_id: action.cardId,
                        from_column_id: fromCol?.is_backlog ? undefined : card.column_id,
                        to_column_id: action.toColumnId,
                        transitioned_by: currentUserId,
                        transitioned_at: isoNow(),
                    },
                ],
            };
        }
        case 'addCard': {
            const { payload } = action;
            const backlog = state.columns.find((c) => c.board_id === payload.boardId && c.is_backlog);
            if (!backlog) return state;
            const now = isoNow();
            const id = uid();
            const card: Card = {
                id,
                board_id: payload.boardId,
                column_id: backlog.id,
                title: payload.title,
                description: payload.description,
                priority: payload.priority,
                due_date: payload.dueDate,
                created_by: currentUserId,
                assigned_by: payload.assignedBy,
                assigned_to: payload.assignedTo,
                created_at: now,
                updated_at: now,
            };
            const newMilestones = payload.milestones.map((m) => ({
                id: uid(),
                card_id: id,
                column_id: m.columnId,
                target_date: m.targetDate,
                created_at: now,
            }));
            return { ...state, cards: [...state.cards, card], milestones: [...state.milestones, ...newMilestones] };
        }
        case 'updateCard': {
            const { payload } = action;
            const now = isoNow();
            const cards = state.cards.map((c) =>
                c.id === payload.cardId
                    ? {
                          ...c,
                          title: payload.title,
                          description: payload.description,
                          priority: payload.priority,
                          due_date: payload.dueDate,
                          assigned_by: payload.assignedBy,
                          assigned_to: payload.assignedTo,
                          updated_at: now,
                      }
                    : c
            );
            const milestones = state.milestones.filter((m) => m.card_id !== payload.cardId);
            const rebuilt = payload.milestones.map((m) => ({
                id: uid(),
                card_id: payload.cardId,
                column_id: m.columnId,
                target_date: m.targetDate,
                created_at: now,
            }));
            return { ...state, cards, milestones: [...milestones, ...rebuilt] };
        }
        default:
            return state;
    }
};

// Selectors
export const columnsForBoard = (state: State, boardId: string): Column[] =>
    state.columns.filter((c) => c.board_id === boardId).sort((a, b) => a.position - b.position);

export const cardsForColumn = (state: State, columnId: string): Card[] =>
    state.cards.filter((c) => c.column_id === columnId);

export const milestonesForCard = (state: State, cardId: string): CardMilestone[] =>
    state.milestones.filter((m) => m.card_id === cardId);

export const userById = (state: State, id?: string): User | undefined =>
    id ? state.users.find((u) => u.id === id) : undefined;
