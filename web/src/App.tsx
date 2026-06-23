import { useEffect, useMemo, useReducer, useState } from 'react';
import { BoardView } from './components/BoardView';
import { CalendarView } from './components/CalendarView';
import { CardForm } from './components/CardForm';
import { Login } from './components/Login';
import { WorkspaceSettings } from './components/WorkspaceSettings';
import { boardsForWorkspace, initialState, reducer, workspaceById } from './store';

type Theme = 'light' | 'dark';

function urlTheme(): Theme | null {
    if (typeof window === 'undefined') return null;
    const param = new URLSearchParams(window.location.search).get('theme');
    return param === 'light' || param === 'dark' ? param : null;
}

function persistedTheme(): Theme {
    const fromUrl = urlTheme();
    if (fromUrl) return fromUrl;
    try {
        const stored = localStorage.getItem('jkb-theme') as Theme | null;
        if (stored === 'light' || stored === 'dark') return stored;
    } catch {
        // ignore
    }
    return 'light';
}

function MainApp({
    state,
    dispatch,
    onLogout,
    theme,
    setTheme,
}: {
    state: ReturnType<typeof reducer>;
    dispatch: React.Dispatch<Parameters<typeof reducer>[1]>;
    onLogout: () => void;
    theme: Theme;
    setTheme: (t: Theme) => void;
}) {
    const [workspaceId, setWorkspaceId] = useState(state.workspaces[0].id);
    const [boardId, setBoardId] = useState(() => boardsForWorkspace(state, workspaceId)[0].id);
    const [view, setView] = useState<'board' | 'calendar'>('board');
    const [editCardId, setEditCardId] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const workspace = workspaceById(state, workspaceId);
    const workspaceBoards = useMemo(() => boardsForWorkspace(state, workspaceId), [state, workspaceId]);

    const switchWorkspace = (id: string) => {
        setWorkspaceId(id);
        const first = boardsForWorkspace(state, id)[0];
        if (first) setBoardId(first.id);
    };

    const editingCard = editCardId ? state.cards.find((c) => c.id === editCardId) : undefined;

    const createWorkspace = () => {
        const name = window.prompt('Workspace name');
        if (!name?.trim()) return;
        dispatch({ type: 'createWorkspace', name: name.trim() });
    };

    const cardCount = (bid: string): number => state.cards.filter((c) => c.board_id === bid).length;

    return (
        <div className="app">
            <aside className="sidebar">
                <h1 className="brand">
                    <span className="ji">ji</span>kanban
                </h1>
                <p className="tagline">time-aware kanban — don't let work go stale</p>

                <div className="nav-label">Workspace</div>
                <select
                    className="workspace-select"
                    value={workspaceId}
                    onChange={(e) => switchWorkspace(e.target.value)}
                    aria-label="Workspace"
                >
                    {state.workspaces.map((w) => (
                        <option key={w.id} value={w.id}>
                            {w.name}
                        </option>
                    ))}
                </select>
                {workspace && (
                    <button type="button" className="settings-link" onClick={() => setSettingsOpen(true)}>
                        Workspace settings
                    </button>
                )}
                <button type="button" className="settings-link" onClick={createWorkspace}>
                    + New workspace
                </button>

                <div className="nav-label">Boards</div>
                <ul className="board-nav">
                    {workspaceBoards.map((b) => (
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

                <div className="nav-label">View</div>
                <div className="view-seg">
                    <button type="button" className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>
                        Board
                    </button>
                    <button
                        type="button"
                        className={view === 'calendar' ? 'active' : ''}
                        onClick={() => setView('calendar')}
                    >
                        Calendar
                    </button>
                </div>

                <div className="sidebar-footer">
                    <div className="current-user">
                        {state.users.find((u) => u.id === state.currentUserId)?.name ?? 'Unknown'}
                    </div>
                    <button type="button" className="settings-link" onClick={onLogout}>
                        Switch user
                    </button>
                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    </button>
                </div>
            </aside>
            {view === 'board' ? (
                <BoardView state={state} boardId={boardId} dispatch={dispatch} onEditCard={setEditCardId} />
            ) : (
                <CalendarView state={state} boardId={boardId} onEditCard={setEditCardId} />
            )}
            {editingCard && (
                <CardForm
                    open
                    mode="edit"
                    state={state}
                    boardId={editingCard.board_id}
                    card={editingCard}
                    onClose={() => setEditCardId(null)}
                    onSubmit={(payload) => {
                        if ('cardId' in payload) dispatch({ type: 'updateCard', payload });
                    }}
                />
            )}
            {workspace && (
                <WorkspaceSettings
                    open={settingsOpen}
                    workspace={workspace}
                    onClose={() => setSettingsOpen(false)}
                    onUpdate={(payload) => dispatch({ type: 'updateWorkspace', workspaceId: workspace.id, ...payload })}
                />
            )}
        </div>
    );
}

export default function App() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [loggedIn, setLoggedIn] = useState(() => {
        if (typeof window === 'undefined') return true;
        return Boolean(localStorage.getItem('jkb-current-user'));
    });
    const [theme, setTheme] = useState<Theme>(persistedTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('jkb-theme', theme);
        } catch {
            // ignore
        }
    }, [theme]);

    if (!loggedIn) {
        return (
            <Login
                users={state.users}
                onSelect={(userId) => {
                    dispatch({ type: 'setCurrentUser', userId });
                    setLoggedIn(true);
                }}
            />
        );
    }

    const logout = () => {
        localStorage.removeItem('jkb-current-user');
        setLoggedIn(false);
    };

    return <MainApp state={state} dispatch={dispatch} onLogout={logout} theme={theme} setTheme={setTheme} />;
}
