import { useState } from 'react';
import type { State } from '../store';
import { cardsForColumn } from '../store';
import type { Column as ColumnType } from '../types';
import { CardItem } from './CardItem';

interface Props {
    column: ColumnType;
    state: State;
    draggingCardId: string | null;
    onEdit: (cardId: string) => void;
    onDragStart: (cardId: string) => void;
    onMoveCard: (cardId: string, toColumnId: string) => void;
}

export function Column({ column, state, draggingCardId, onEdit, onDragStart, onMoveCard }: Props) {
    const [drop, setDrop] = useState(false);
    const cards = cardsForColumn(state, column.id);

    return (
        <>
            {/* biome-ignore lint/a11y/noStaticElementInteractions: DnD drop target — drag events, not a click/keyboard interaction */}
            <section
                className={`column${drop ? ' drop' : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (!drop) setDrop(true);
                }}
                onDragLeave={() => setDrop(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDrop(false);
                    const cardId = e.dataTransfer.getData('text/cardId');
                    if (cardId) onMoveCard(cardId, column.id);
                }}
            >
                <header className="column-head">
                    <span
                        className={`name ${column.is_backlog ? 'backlog' : ''} ${column.is_complete ? 'complete' : ''}`}
                    >
                        {column.name}
                    </span>
                    <span className="count">{cards.length}</span>
                </header>
                <div className="column-list">
                    {cards.length === 0 && <div className="column-empty">—</div>}
                    {cards.map((c) => (
                        <CardItem
                            key={c.id}
                            card={c}
                            state={state}
                            dragging={draggingCardId === c.id}
                            onEdit={onEdit}
                            onDragStart={onDragStart}
                        />
                    ))}
                </div>
            </section>
        </>
    );
}
