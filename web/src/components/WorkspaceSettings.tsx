import { Dialog } from '@radix-ui/themes';
import { useState } from 'react';
import type { Workspace } from '../types';

interface Props {
    open: boolean;
    workspace: Workspace;
    onClose: () => void;
    onUpdate: (payload: { name?: string; settings: Partial<Workspace['settings']> }) => void;
}

export function WorkspaceSettings({ open, workspace, onClose, onUpdate }: Props) {
    const [name, setName] = useState(workspace.name);
    const [ollamaBaseUrl, setOllamaBaseUrl] = useState(workspace.settings.ollama_base_url ?? '');
    const [ollamaModel, setOllamaModel] = useState(workspace.settings.ollama_model ?? '');
    const [openNotebookBaseUrl, setOpenNotebookBaseUrl] = useState(workspace.settings.open_notebook_base_url ?? '');
    const [openNotebookNotebook, setOpenNotebookNotebook] = useState(workspace.settings.open_notebook_notebook ?? '');

    const submit = () => {
        onUpdate({
            name: name.trim() || workspace.name,
            settings: {
                ollama_base_url: ollamaBaseUrl.trim() || undefined,
                ollama_model: ollamaModel.trim() || undefined,
                open_notebook_base_url: openNotebookBaseUrl.trim() || undefined,
                open_notebook_notebook: openNotebookNotebook.trim() || undefined,
            },
        });
        onClose();
    };

    return (
        <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
            <Dialog.Content style={{ maxWidth: 480 }}>
                <Dialog.Title>Workspace settings</Dialog.Title>
                <div className="form-grid">
                    <div className="field">
                        <label htmlFor="ws-name">Workspace name</label>
                        <input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="section-label">AI assistant</div>
                    <div className="field">
                        <label htmlFor="ws-ollama-url">Ollama base URL</label>
                        <input
                            id="ws-ollama-url"
                            value={ollamaBaseUrl}
                            onChange={(e) => setOllamaBaseUrl(e.target.value)}
                            placeholder="http://192.168.86.35:11434/v1"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="ws-ollama-model">Ollama model</label>
                        <input
                            id="ws-ollama-model"
                            value={ollamaModel}
                            onChange={(e) => setOllamaModel(e.target.value)}
                            placeholder="qwen3:8b"
                        />
                    </div>
                    <div className="section-label">Open Notebook sync</div>
                    <div className="field">
                        <label htmlFor="ws-on-url">Open Notebook base URL</label>
                        <input
                            id="ws-on-url"
                            value={openNotebookBaseUrl}
                            onChange={(e) => setOpenNotebookBaseUrl(e.target.value)}
                            placeholder="http://192.168.86.32:3000"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="ws-on-notebook">Notebook</label>
                        <input
                            id="ws-on-notebook"
                            value={openNotebookNotebook}
                            onChange={(e) => setOpenNotebookNotebook(e.target.value)}
                            placeholder="jikanban"
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="btn primary" onClick={submit}>
                        Save settings
                    </button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
}
