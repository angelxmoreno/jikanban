import { Dialog, Text } from '@radix-ui/themes';
import { useState } from 'react';
import { today } from '../dates';
import type { EditCard, NewCard, State } from '../store';
import type { Card, Priority } from '../types';

interface Props {
    open: boolean;
    mode: 'new' | 'edit';
    state: State;
    boardId: string;
    card?: Card;
    onClose: () => void;
    onSubmit: (payload: NewCard | EditCard) => void;
}

interface MForm {
    columnId: string;
    targetDate: string; // '' = unset
}

interface FormErrors {
    title?: string;
    due?: string;
    ms?: string;
}

// Filled milestone dates must precede the due date and stay ordered by column
// position (schema.md constraints). Pure so it can be tested directly later.
const validate = (title: string, filled: MForm[], dueDate: string): FormErrors => {
    const errors: FormErrors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (filled.length > 0) {
        if (filled.some((m) => m.targetDate >= dueDate)) errors.ms = 'Milestone dates must be before the due date';
        for (let i = 1; i < filled.length; i++) {
            if (filled[i].targetDate <= filled[i - 1].targetDate) {
                errors.ms = 'Milestone dates must be in column order';
                break;
            }
        }
    }
    return errors;
};

export function CardForm({ open, mode, state, boardId, card, onClose, onSubmit }: Props) {
    const middleCols = state.columns
        .filter((c) => c.board_id === boardId && !c.is_backlog && !c.is_complete)
        .sort((a, b) => a.position - b.position);

    const cardMs = card ? state.milestones.filter((m) => m.card_id === card.id) : [];

    const [title, setTitle] = useState(card?.title ?? '');
    const [description, setDescription] = useState(card?.description ?? '');
    const [priority, setPriority] = useState<Priority>(card?.priority ?? 'medium');
    const [dueDate, setDueDate] = useState(card?.due_date ?? today());
    const [assignedTo, setAssignedTo] = useState(card?.assigned_to ?? '');
    const [assignedBy, setAssignedBy] = useState(card?.assigned_by ?? '');
    const [milestones, setMilestones] = useState<MForm[]>(
        middleCols.map((c) => ({
            columnId: c.id,
            targetDate: cardMs.find((m) => m.column_id === c.id)?.target_date ?? '',
        }))
    );

    const posOf = (id: string): number => middleCols.find((c) => c.id === id)?.position ?? 0;
    const filled = milestones.filter((m) => m.targetDate).sort((a, b) => posOf(a.columnId) - posOf(b.columnId));
    const errors = validate(title, filled, dueDate);
    const valid = !errors.title && !errors.ms;

    const submit = () => {
        const ms = filled.map((m) => ({ columnId: m.columnId, targetDate: m.targetDate }));
        if (mode === 'edit' && card) {
            onSubmit({
                cardId: card.id,
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                dueDate,
                assignedTo: assignedTo || undefined,
                assignedBy: assignedBy || undefined,
                milestones: ms,
            } satisfies EditCard);
        } else {
            onSubmit({
                boardId,
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                dueDate,
                assignedTo: assignedTo || undefined,
                assignedBy: assignedBy || undefined,
                milestones: ms,
            } satisfies NewCard);
        }
        onClose();
    };

    return (
        <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
            <Dialog.Content style={{ maxWidth: 460 }}>
                <Dialog.Title>{mode === 'edit' ? 'Edit card' : 'New card'}</Dialog.Title>
                <div className="form-grid">
                    <div className="field">
                        <label htmlFor="f-title">Title</label>
                        <input id="f-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        {errors.title && <div className="error">{errors.title}</div>}
                    </div>
                    <div className="field">
                        <label htmlFor="f-desc">Description</label>
                        <textarea id="f-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="field-row">
                        <div className="field">
                            <label htmlFor="f-priority">Priority</label>
                            <select
                                id="f-priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                            >
                                <option value="low">low</option>
                                <option value="medium">medium</option>
                                <option value="high">high</option>
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="f-due">Due date</label>
                            <input
                                id="f-due"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                            {errors.due && <div className="error">{errors.due}</div>}
                        </div>
                    </div>
                    <div className="field-row">
                        <div className="field">
                            <label htmlFor="f-assignto">Assigned to</label>
                            <select id="f-assignto" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                                <option value="">—</option>
                                {state.users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="f-assignby">Assigned by</label>
                            <select id="f-assignby" value={assignedBy} onChange={(e) => setAssignedBy(e.target.value)}>
                                <option value="">—</option>
                                {state.users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {middleCols.length > 0 && (
                        <div className="field">
                            <span className="field-label">Milestones (per stage)</span>
                            {milestones.map((m, i) => (
                                <div
                                    key={m.columnId}
                                    className="milestone-row"
                                    style={i > 0 ? { marginTop: 8 } : undefined}
                                >
                                    <Text as="label" size="1" color="gray">
                                        {middleCols.find((c) => c.id === m.columnId)?.name}
                                    </Text>
                                    <input
                                        type="date"
                                        value={m.targetDate}
                                        onChange={(e) =>
                                            setMilestones((ms) =>
                                                ms.map((x) =>
                                                    x.columnId === m.columnId ? { ...x, targetDate: e.target.value } : x
                                                )
                                            )
                                        }
                                    />
                                    <span />
                                </div>
                            ))}
                            {errors.ms && <div className="error">{errors.ms}</div>}
                        </div>
                    )}
                </div>
                <div className="form-actions">
                    <button type="button" className="btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="btn primary" disabled={!valid} onClick={submit}>
                        {mode === 'edit' ? 'Save changes' : 'Create card'}
                    </button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
}
