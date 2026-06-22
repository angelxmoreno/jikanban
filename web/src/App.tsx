import { useEffect, useMemo, useReducer, useState } from 'react';
import { BoardView } from './components/BoardView';
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

export default function App() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [workspaceId, setWorkspaceId] = useState(state.workspaces[0].id);
    const [boardId, setBoardId] = useState(() => boardsForWorkspace(state, workspaceId)[0].id);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>(persistedTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('jkb-theme', theme);
        } catch {
            // ignore
        }
    }, [theme]);

    const workspace = workspaceById(state, workspaceId);
    const workspaceBoards = useMemo(() => boardsForWorkspace(state, workspaceId), [state, workspaceId]);

    const switchWorkspace = (id: string) => {
        setWorkspaceId(id);
        const first = boardsForWorkspace(state, id)[0];
        if (first) setBoardId(first.id);
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

                <div className="sidebar-footer">
                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    </button>
                </div>
            </aside>
            <BoardView state={state} boardId={boardId} dispatch={dispatch} />
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
