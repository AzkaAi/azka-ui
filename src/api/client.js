// api/client.js
const BASE = 'http://100.103.30.38:8000';

export const api = {
    getTasks: () =>
        fetch(`${BASE}/tasks`).then(r => r.json()),

    getTask: (taskId) =>
        fetch(`${BASE}/tasks/${taskId}`).then(r => r.json()),

    spawnTask: (description, repoUrl = '') =>
        fetch(`${BASE}/spawn-subtask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task_description: description,
                repo_url: repoUrl,
                parent_task_id: 'root'
            })
        }).then(r => r.json()),

    respondToTask: (taskId, answer) =>
        fetch(`${BASE}/tasks/${taskId}/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer })
        }).then(r => r.json()),

    getMetrics: (taskId) =>
        fetch(`${BASE}/tasks/${taskId}/metrics`).then(r => r.json()),
};
