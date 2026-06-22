// Domain types for Jikanban.
// Mirrors project-files/schema.md field-for-field. These types ARE the API
// contract — Phase 5 Hono routes must return shapes matching them. Keep in
// sync with schema.md.
//
// Storage notes (schema.md):
//   - Text PKs (nanoid/cuid) -> strings here.
//   - Timestamps stored as ISO 8601 strings -> strings here.
//   - priority is an enum (low | medium | high).
//   - is_backlog / is_complete are integer booleans (0/1) in SQLite; the API
//     serializes them as booleans, so the FE contract uses boolean.

export type Priority = 'low' | 'medium' | 'high';

export interface WorkspaceSettings {
    ollama_base_url?: string;
    ollama_model?: string;
    open_notebook_base_url?: string;
    open_notebook_notebook?: string;
}

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    created_by: string;
    settings: WorkspaceSettings;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    created_at: string;
}

export interface Board {
    id: string;
    workspace_id: string;
    name: string;
    description?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Column {
    id: string;
    board_id: string;
    name: string;
    position: number;
    is_backlog: boolean;
    is_complete: boolean;
    created_at: string;
}

export interface Card {
    id: string;
    board_id: string;
    column_id: string;
    title: string;
    description?: string;
    priority: Priority;
    due_date: string;
    created_by: string;
    assigned_by?: string;
    assigned_to?: string;
    work_started_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface CardMilestone {
    id: string;
    card_id: string;
    column_id: string;
    target_date: string;
    created_at: string;
}

export interface CardTransition {
    id: string;
    card_id: string;
    from_column_id?: string;
    to_column_id: string;
    transitioned_by: string;
    transitioned_at: string;
}
