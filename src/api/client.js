// API client for AZKA.AI orchestrator backend
// Force redeploy - v2
const API_BASE = 'https://api.azkaai.com';
const WS_BASE = 'wss://api.azkaai.com';

export async function startTask(taskDescription, taskId = null) {
  console.log('Making request to:', `${API_BASE}/start-task`);
  console.log('Request body:', JSON.stringify({ task_id: taskId, task_description: taskDescription }));
  
  const response = await fetch(`${API_BASE}/start-task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task_id: taskId,
      task_description: taskDescription,
    }),
  });
  
  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);
  
  const responseText = await response.text();
  console.log('Raw response text:', responseText);
  
  if (!response.ok) {
    console.error('API error:', response.status, responseText);
    throw new Error(`API error: ${response.status} - ${responseText}`);
  }
  
  const data = JSON.parse(responseText);
  console.log('Parsed API response:', data);
  return data;
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
    console.log('WebSocket connected to:', `${WS_BASE}/ws/${taskId}`);
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket received:', data);
      onMessage(data);
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
      console.error('Raw message:', event.data);
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
