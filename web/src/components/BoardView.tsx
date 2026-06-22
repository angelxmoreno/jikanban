import { useState } from 'react';
import type { Action, EditCard, NewCard, State } from '../store';
import { columnsForBoard } from '../store';
import { CardForm } from './CardForm';
import { Column } from './Column';

interface Props {
    state: State;
    boardId: string;
    dispatch: (a: Action) => void;
}

type EditState = { mode: 'new' } | { mode: 'edit'; cardId: string } | null;

export function BoardView({ state, boardId, dispatch }: Props) {
    const board = state.boards.find((b) => b.id === boardId);
    const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
    const [edit, setEdit] = useState<EditState>(null);
    if (!board) return null;
    const columns = columnsForBoard(state, boardId);

    const moveCard = (cardId: string, toColumnId: string) => {
        dispatch({ type: 'move', cardId, toColumnId });
        setDraggingCardId(null);
    };

    const onSubmit = (payload: NewCard | EditCard) => {
        if ('cardId' in payload) dispatch({ type: 'updateCard', payload });
        else dispatch({ type: 'addCard', payload });
    };

    const editingCard =
        edit !== null && edit.mode === 'edit' ? state.cards.find((c) => c.id === edit.cardId) : undefined;

    return (
        <main className="main">
            <div className="board-header">
                <div>
                    <h1>{board.name}</h1>
                    {board.description && <span className="desc">{board.description}</span>}
                </div>
                <button type="button" className="add-btn" onClick={() => setEdit({ mode: 'new' })}>
                    + new card
                </button>
            </div>
            <div className="board">
                {columns.map((col) => (
                    <Column
                        key={col.id}
                        column={col}
                        state={state}
                        draggingCardId={draggingCardId}
                        onEdit={(id) => setEdit({ mode: 'edit', cardId: id })}
                        onDragStart={setDraggingCardId}
                        onMoveCard={moveCard}
                    />
                ))}
            </div>
            {edit && (
                <CardForm
                    open
                    mode={edit.mode}
                    state={state}
                    boardId={boardId}
                    card={editingCard}
                    onClose={() => setEdit(null)}
                    onSubmit={onSubmit}
                />
            )}
        </main>
    );
}
