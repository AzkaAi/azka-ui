// components/TaskPanel.jsx
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { switchToTask } from '../state/store';

export function TaskPanel({ onTaskSelect, activeTaskId }) {
    const [tasks, setTasks] = useState([]);
    const [description, setDescription] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Poll for task list every 5 seconds
    useEffect(() => {
        const load = () => api.getTasks().then(data => {
            setTasks(data.tasks || data || []);
        });
        load();
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async () => {
        if (!description.trim()) return;
        setSubmitting(true);
        try {
            const result = await api.spawnTask(description, repoUrl);
            if (result.subtask_id) {
                onTaskSelect(result.subtask_id);
            }
        } finally {
            setSubmitting(false);
            setDescription('');
        }
    };

    const statusColor = {
        ACTIVE: '#3fb950',
        COMPLETED: '#58a6ff',
        FAILED: '#f85149',
        AWAITING_HUMAN: '#d29922',
    };

    return (
        <div style={{
            width: '250px',
            background: '#0d1117',
            borderRight: '1px solid #21262d',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            {/* Submit Form */}
            <div style={{ padding: '12px', borderBottom: '1px solid #21262d' }}>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the task or paste a GitHub issue..."
                    style={{
                        width: '100%',
                        height: '80px',
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        color: '#e6edf3',
                        padding: '8px',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        resize: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                    onKeyDown={e => {
                        if (e.metaKey && e.key === 'Enter') handleSubmit();
                    }}
                />
                <input
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    placeholder="GitHub repo URL (optional)"
                    style={{
                        width: '100%',
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        color: '#e6edf3',
                        padding: '6px 8px',
                        fontSize: '12px',
                        outline: 'none',
                        marginTop: '6px',
                        boxSizing: 'border-box',
                    }}
                />
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !description.trim()}
                    style={{
                        width: '100%',
                        marginTop: '8px',
                        padding: '8px',
                        background: submitting ? '#21262d' : '#238636',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                >
                    {submitting ? 'Submitting...' : '⚡ Run AZKA.AI'}
                </button>
                <div style={{
                    color: '#484f58',
                    fontSize: '11px',
                    textAlign: 'center',
                    marginTop: '4px'
                }}>
                    ⌘+Enter to submit
                </div>
            </div>

            {/* Task History */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {tasks.length === 0 && (
                    <div style={{
                        color: '#484f58',
                        fontSize: '12px',
                        textAlign: 'center',
                        padding: '24px 12px'
                    }}>
                        No tasks yet. Submit one above.
                    </div>
                )}
                {tasks.map(task => (
                    <div
                        key={task.task_id}
                        onClick={() => onTaskSelect(task.task_id)}
                        style={{
                            padding: '10px 12px',
                            borderBottom: '1px solid #21262d',
                            cursor: 'pointer',
                            background: activeTaskId === task.task_id
                                ? '#161b22' : 'transparent',
                            borderLeft: activeTaskId === task.task_id
                                ? '2px solid #58a6ff' : '2px solid transparent',
                        }}
                    >
                        <div style={{
                            color: '#e6edf3',
                            fontSize: '12px',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {task.description?.slice(0, 50) || task.task_id}
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                fontSize: '10px',
                                color: statusColor[task.status] || '#8b949e',
                                fontWeight: 600,
                            }}>
                                {task.status}
                            </span>
                            <span style={{
                                fontSize: '10px',
                                color: '#484f58',
                                fontFamily: 'JetBrains Mono, monospace'
                            }}>
                                {task.task_id}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
