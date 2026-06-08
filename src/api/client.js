// API client for AZKA.AI orchestrator backend
const API_BASE = 'http://100.103.30.38:8000';
const WS_BASE = 'ws://100.103.30.38:8000';

export async function startTask(taskDescription, taskId = null) {
  const response = await fetch(`${API_BASE}/spawn-subtask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task_description: taskDescription,
      parent_task_id: taskId || "root"
    }),
  });
  return response.json();
}

export async function getTasks() {
  const response = await fetch(`${API_BASE}/tasks`);
  return response.json();
}

export async function getTask(taskId) {
  const response = await fetch(`${API_BASE}/tasks/${taskId}`);
  return response.json();
}

export async function getTaskMetrics(taskId) {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/metrics`);
  return response.json();
}

export function connectWebSocket(taskId, onMessage) {
  const ws = new WebSocket(`${WS_BASE}/ws/${taskId}`);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket closed');
  };
  
  return ws;
}
