// Dummy data — the de-facto API contract. Mirrors project-files/schema.md
// field-for-field. Dates are relative to today so overdue/missed states are
// deterministic regardless of when the app runs.
import type { Board, Card, CardMilestone, CardTransition, Column, User, Workspace } from './types';

const ts = (offsetDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString();
};

const day = (offset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const currentUserId = 'u-angel';

export const workspaces: Workspace[] = [
    {
        id: 'w-default',
        name: 'Jikanban',
        slug: 'jikanban',
        created_by: 'u-angel',
        settings: {
            ollama_base_url: 'http://192.168.86.35:11434/v1',
            ollama_model: 'qwen3:8b',
            open_notebook_base_url: 'http://192.168.86.32:3000',
            open_notebook_notebook: 'jikanban',
        },
        created_at: ts(-90),
        updated_at: ts(-2),
    },
];

export const users: User[] = [
    { id: 'u-angel', name: 'Angel S. Moreno', email: 'angel@jikanban.dev', created_at: ts(-90) },
    { id: 'u-maya', name: 'Maya Chen', email: 'maya@jikanban.dev', created_at: ts(-90) },
];

export const boards: Board[] = [
    {
        id: 'b-dev',
        workspace_id: 'w-default',
        name: 'Development',
        description: 'Backend + frontend engineering',
        created_by: 'u-angel',
        created_at: ts(-90),
        updated_at: ts(-2),
    },
    {
        id: 'b-blog',
        workspace_id: 'w-default',
        name: 'Blog Post',
        description: 'Content pipeline',
        created_by: 'u-angel',
        created_at: ts(-90),
        updated_at: ts(-7),
    },
    {
        id: 'b-email',
        workspace_id: 'w-default',
        name: 'Customer Email',
        description: 'Inbound customer comms',
        created_by: 'u-angel',
        created_at: ts(-90),
        updated_at: ts(-1),
    },
];

export const columns: Column[] = [
    // Development
    {
        id: 'col-dev-0',
        board_id: 'b-dev',
        name: 'Backlog',
        position: 0,
        is_backlog: true,
        is_complete: false,
        created_at: ts(-90),
    },
    {
        id: 'col-dev-1',
        board_id: 'b-dev',
        name: 'In Progress',
        position: 1,
        is_backlog: false,
        is_complete: false,
        created_at: ts(-90),
    },
    {
        id: 'col-dev-2',
        board_id: 'b-dev',
        name: 'PR Open',
        position: 2,
        is_backlog: false,
        is_complete: false,
        created_at: ts(-90),
    },
    {
        id: 'col-dev-3',
        board_id: 'b-dev',
        name: 'Complete',
        position: 3,
        is_backlog: false,
        is_complete: true,
        created_at: ts(-90),
    },
    // Blog Post
    {
        id: 'col-blog-0',
        board_id: 'b-blog',
        name: 'Backlog',
        position: 0,
        is_backlog: true,
        is_complete: false,
        created_at: ts(-90),
    },
    {
        id: 'col-blog-1',
        board_id: 'b-blog',
        name: 'Draft',
        position: 1,
        is_backlog: false,
        is_complete: false,
        created_at: ts(-90),
    },
    {
        id: 'col-blog-2',
        board_id: 'b-blog',
        name: 'Editorialized',
        position: 2,
        is_backlog: false,
        is_complete: false,
        created_at: ts(-90),
    },
    {
        id: 'col-blog-3',
        board_id: 'b-blog',
        name: 'Announced',
        position: 3,
        is_backlog: false,
        is_complete: false,
        created_at: ts(-90),
    },
    {
        id: 'col-blog-4',
        board_id: 'b-blog',
        name: 'Complete',
        position: 4,
        is_backlog: false,
        is_complete: true,
        created_at: ts(-90),
    },
    // Customer Email
    {
        id: 'col-email-0',
        board_id: 'b-email',
        name: 'Backlog',
        position: 0,
        is_backlog: true,
        is_complete: false,
        created_at: ts(-90),
    },
    {
        id: 'col-email-1',
        board_id: 'b-email',
        name: 'Replied',
        position: 1,
        is_backlog: false,
        is_complete: false,
        created_at: ts(-90),
    },
    {
        id: 'col-email-2',
        board_id: 'b-email',
        name: 'Waiting on Response',
        position: 2,
        is_backlog: false,
        is_complete: false,
        created_at: ts(-90),
    },
    {
        id: 'col-email-3',
        board_id: 'b-email',
        name: 'Complete',
        position: 3,
        is_backlog: false,
        is_complete: true,
        created_at: ts(-90),
    },
];

export const cards: Card[] = [
    // Development
    {
        id: 'k-dev-1',
        board_id: 'b-dev',
        column_id: 'col-dev-3',
        title: 'Set up Drizzle schema',
        description: 'users, boards, columns, cards, card_milestones, card_transitions',
        priority: 'high',
        due_date: day(-2),
        created_by: 'u-angel',
        assigned_to: 'u-angel',
        work_started_at: ts(-5),
        completed_at: ts(-1),
        created_at: ts(-6),
        updated_at: ts(-1),
    },
    {
        id: 'k-dev-2',
        board_id: 'b-dev',
        column_id: 'col-dev-1',
        title: 'Implement /boards CRUD',
        description: 'GET/POST /boards, GET/PUT/DELETE /boards/:id',
        priority: 'high',
        due_date: day(5),
        created_by: 'u-angel',
        assigned_by: 'u-angel',
        assigned_to: 'u-maya',
        work_started_at: ts(-2),
        created_at: ts(-4),
        updated_at: ts(-2),
    },
    {
        id: 'k-dev-3',
        board_id: 'b-dev',
        column_id: 'col-dev-1',
        title: 'Write migration seed script',
        priority: 'medium',
        due_date: day(-3),
        created_by: 'u-angel',
        assigned_to: 'u-angel',
        work_started_at: ts(-6),
        created_at: ts(-8),
        updated_at: ts(-6),
    },
    {
        id: 'k-dev-4',
        board_id: 'b-dev',
        column_id: 'col-dev-0',
        title: 'Design /cards/:id/move endpoint',
        description: 'Stamp work_started_at / completed_at, append transition',
        priority: 'low',
        due_date: day(12),
        created_by: 'u-angel',
        created_at: ts(-3),
        updated_at: ts(-3),
    },
    {
        id: 'k-dev-5',
        board_id: 'b-dev',
        column_id: 'col-dev-2',
        title: 'Add milestone validation middleware',
        priority: 'high',
        due_date: day(2),
        created_by: 'u-angel',
        assigned_to: 'u-angel',
        work_started_at: ts(-3),
        created_at: ts(-5),
        updated_at: ts(-3),
    },
    // Blog Post
    {
        id: 'k-blog-1',
        board_id: 'b-blog',
        column_id: 'col-blog-1',
        title: 'Post: why self-hosted kanban',
        description: 'Time-aware boards, freshness, owning your toolchain',
        priority: 'medium',
        due_date: day(14),
        created_by: 'u-angel',
        assigned_to: 'u-angel',
        work_started_at: ts(-7),
        created_at: ts(-9),
        updated_at: ts(-7),
    },
    {
        id: 'k-blog-2',
        board_id: 'b-blog',
        column_id: 'col-blog-0',
        title: 'Post: Open Notebook integration',
        priority: 'low',
        due_date: day(20),
        created_by: 'u-angel',
        created_at: ts(-2),
        updated_at: ts(-2),
    },
    // Customer Email
    {
        id: 'k-email-1',
        board_id: 'b-email',
        column_id: 'col-email-1',
        title: 'Reply: pricing question from Sam',
        priority: 'high',
        due_date: day(4),
        created_by: 'u-angel',
        assigned_to: 'u-angel',
        work_started_at: ts(-1),
        created_at: ts(-2),
        updated_at: ts(-1),
    },
    {
        id: 'k-email-2',
        board_id: 'b-email',
        column_id: 'col-email-2',
        title: 'Follow up: integration question',
        priority: 'medium',
        due_date: day(-1),
        created_by: 'u-angel',
        assigned_by: 'u-angel',
        assigned_to: 'u-maya',
        work_started_at: ts(-2),
        created_at: ts(-3),
        updated_at: ts(-2),
    },
];

export const milestones: CardMilestone[] = [
    { id: 'm-1', card_id: 'k-blog-1', column_id: 'col-blog-2', target_date: day(-4), created_at: ts(-9) }, // missed
    { id: 'm-2', card_id: 'k-blog-1', column_id: 'col-blog-3', target_date: day(7), created_at: ts(-9) },
];

export const transitions: CardTransition[] = [
    {
        id: 't-1',
        card_id: 'k-dev-1',
        from_column_id: undefined,
        to_column_id: 'col-dev-1',
        transitioned_by: 'u-angel',
        transitioned_at: ts(-5),
    },
    {
        id: 't-2',
        card_id: 'k-dev-1',
        from_column_id: 'col-dev-1',
        to_column_id: 'col-dev-2',
        transitioned_by: 'u-angel',
        transitioned_at: ts(-3),
    },
    {
        id: 't-3',
        card_id: 'k-dev-1',
        from_column_id: 'col-dev-2',
        to_column_id: 'col-dev-3',
        transitioned_by: 'u-angel',
        transitioned_at: ts(-1),
    },
    {
        id: 't-4',
        card_id: 'k-dev-2',
        from_column_id: 'col-dev-0',
        to_column_id: 'col-dev-1',
        transitioned_by: 'u-angel',
        transitioned_at: ts(-2),
    },
    {
        id: 't-5',
        card_id: 'k-dev-3',
        from_column_id: 'col-dev-0',
        to_column_id: 'col-dev-1',
        transitioned_by: 'u-angel',
        transitioned_at: ts(-6),
    },
    {
        id: 't-6',
        card_id: 'k-dev-5',
        from_column_id: 'col-dev-1',
        to_column_id: 'col-dev-2',
        transitioned_by: 'u-angel',
        transitioned_at: ts(-3),
    },
    {
        id: 't-7',
        card_id: 'k-blog-1',
        from_column_id: 'col-blog-0',
        to_column_id: 'col-blog-1',
        transitioned_by: 'u-angel',
        transitioned_at: ts(-7),
    },
    {
        id: 't-8',
        card_id: 'k-email-1',
        from_column_id: 'col-email-0',
        to_column_id: 'col-email-1',
        transitioned_by: 'u-angel',
        transitioned_at: ts(-1),
    },
    {
        id: 't-9',
        card_id: 'k-email-2',
        from_column_id: 'col-email-1',
        to_column_id: 'col-email-2',
        transitioned_by: 'u-angel',
        transitioned_at: ts(-2),
    },
];
