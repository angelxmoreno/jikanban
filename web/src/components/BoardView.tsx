import { useState } from 'react';
import type { Action, EditCard, NewCard, State } from '../store';
import { columnsForBoard } from '../store';
import { CardForm } from './CardForm';
import { Column } from './Column';

interface Props {
    state: State;
    boardId: string;
    dispatch: (a: Action) => void;
    onEditCard: (cardId: string) => void;
}

export function BoardView({ state, boardId, dispatch, onEditCard }: Props) {
    const board = state.boards.find((b) => b.id === boardId);
    const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    if (!board) return null;
    const columns = columnsForBoard(state, boardId);

    const moveCard = (cardId: string, toColumnId: string) => {
        dispatch({ type: 'move', cardId, toColumnId });
        setDraggingCardId(null);
    };

    const onSubmit = (payload: NewCard | EditCard) => {
        if (!('cardId' in payload)) dispatch({ type: 'addCard', payload });
    };

    return (
        <main className="main">
            <div className="board-header">
                <div>
                    <h1>{board.name}</h1>
                    {board.description && <span className="desc">{board.description}</span>}
                </div>
                <button type="button" className="add-btn" onClick={() => setCreating(true)}>
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
                        onEdit={onEditCard}
                        onDragStart={setDraggingCardId}
                        onMoveCard={moveCard}
                    />
                ))}
            </div>
            {creating && (
                <CardForm
                    open
                    mode="new"
                    state={state}
                    boardId={boardId}
                    onClose={() => setCreating(false)}
                    onSubmit={onSubmit}
                />
            )}
        </main>
    );
}
