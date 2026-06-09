// API client for AZKA.AI orchestrator backend
// Version: 5.0 - fix task selection and agent startup
const API_BASE = 'https://api.azkaai.com';
const WS_BASE = 'wss://api.azkaai.com';

export async function startTask(taskDescription, taskId = null) {
  console.log('Making request to:', `${API_BASE}/spawn-subtask`);
  console.log('Request body:', JSON.stringify({ task_description: taskDescription, parent_task_id: taskId || "root" }));
  
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

export async function getTaskEvents(taskId) {
  const response = await fetch(`${API_BASE}/tasks/${taskId}`);
  return response.json();
}

export async function getTaskMetrics(taskId) {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/metrics`);
  return response.json();
}

export async function cancelTask(taskId) {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
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
      console.log('[RENDER CALLBACK - WebSocket]', data);
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

// Task Session Class for WebSocket management and history loading
export class TaskSession {
  constructor(taskId) {
    this.taskId = taskId;
    this.highestSeqId = 0;
    this.bufferedEvents = [];
    this.isLive = false;
    this.ws = null;
  }

  initialize(renderCallback) {
    this.ws = new WebSocket(
      `wss://api.azkaai.com/ws/${this.taskId}` 
    );
    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (!this.isLive) {
        this.bufferedEvents.push(data);
      } else {
        this.processEvent(data, renderCallback);
      }
    };
    this.ws.onclose = () => {
      setTimeout(() => {
        if (this.taskId) {
          this.isLive = false;
          this.initialize(renderCallback);
          this.loadHistory(renderCallback);
        }
      }, 3000);
    };
  }

  processEvent(data, renderCallback) {
    console.log("[RENDER CALLBACK - processEvent]", data);
    if (data.seq_id <= this.highestSeqId) return;
    
    // Buffer if out of order
    if (data.seq_id > this.highestSeqId + 1) {
      this.bufferedEvents.push(data);
      this.bufferedEvents.sort((a, b) => a.seq_id - b.seq_id);
      return;
    }
    
    this.highestSeqId = data.seq_id;
    renderCallback(data);
    
    // Check buffer for next events
    while (this.bufferedEvents.length > 0 && 
           this.bufferedEvents[0].seq_id === this.highestSeqId + 1) {
      const next = this.bufferedEvents.shift();
      this.highestSeqId = next.seq_id;
      renderCallback(next);
    }
  }

  async loadHistory(renderCallback) {
    try {
      const response = await fetch(
        `https://api.azkaai.com/tasks/${this.taskId}` 
      );
      const data = await response.json();
      const log = typeof data.event_log === 'string'
        ? JSON.parse(data.event_log)
        : (data.event_log || []);
      console.log("[loadHistory] Found", log.length, "events in history");
      log.forEach(event => {
        console.log("[RENDER CALLBACK - loadHistory]", event);
        this.highestSeqId = Math.max(
          this.highestSeqId, event.seq_id || 0
        );
        renderCallback(event);
      });
      
      // After rendering all events, check if task is complete
      const lastEvent = log[log.length - 1];
      if (lastEvent && (
        lastEvent.event_type === 'task_complete' || 
        lastEvent.action?.tool_name === 'finish'
      )) {
        console.log("[loadHistory] Task complete detected, firing status update");
        // Fire a synthetic status update
        renderCallback({
          event_type: 'task_status_update',
          status: 'completed',
          task_id: this.taskId
        });
      }
      
      this.isLive = true;
      this.bufferedEvents
        .filter(e => e.seq_id > this.highestSeqId)
        .sort((a, b) => a.seq_id - b.seq_id)
        .forEach(e => this.processEvent(e, renderCallback));
    } catch (error) {
      console.error("State reconciliation failed:", error);
    } finally {
      this.bufferedEvents = [];
    }
  }

  teardown() {
    this.taskId = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

let currentSession = null;

export function switchToTask(taskId, renderCallback) {
  if (currentSession) currentSession.teardown();
  currentSession = new TaskSession(taskId);
  currentSession.initialize(renderCallback);
  currentSession.loadHistory(renderCallback);
}
