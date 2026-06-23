import { useState } from 'react';
import type { User } from '../types';

interface Props {
    users: User[];
    onSelect: (userId: string) => void;
}

export function Login({ users, onSelect }: Props) {
    const [selected, setSelected] = useState(users[0]?.id ?? '');

    return (
        <div className="login">
            <div className="login-card">
                <h1 className="brand">
                    <span className="ji">ji</span>kanban
                </h1>
                <p className="tagline">Select a user to continue</p>
                <div className="field">
                    <select value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="User">
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name} ({u.email})
                            </option>
                        ))}
                    </select>
                </div>
                <button type="button" className="btn primary" onClick={() => onSelect(selected)}>
                    Continue
                </button>
            </div>
        </div>
    );
}
