import { useReducer, useState } from 'react';
import { BoardView } from './components/BoardView';
import { initialState, reducer } from './store';

export default function App() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [boardId, setBoardId] = useState(state.boards[0].id);

    const cardCount = (bid: string): number => state.cards.filter((c) => c.board_id === bid).length;

    return (
        <div className="app">
            <aside className="sidebar">
                <h1 className="brand">
                    <span className="ji">ji</span>kanban
                </h1>
                <p className="tagline">time-aware kanban — don't let work go stale</p>
                <div className="nav-label">Boards</div>
                <ul className="board-nav">
                    {state.boards.map((b) => (
                        <li key={b.id}>
                            <button
                                type="button"
                                className={b.id === boardId ? 'active' : ''}
                                onClick={() => setBoardId(b.id)}
                            >
                                {b.name}
                                <span className="count">{cardCount(b.id)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
            <BoardView state={state} boardId={boardId} dispatch={dispatch} />
        </div>
    );
}
