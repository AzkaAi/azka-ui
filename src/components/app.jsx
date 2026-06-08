import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { EventCard } from './cards.jsx';
import { Header, LeftPanel, RightPanel, Footer } from './panels.jsx';
import { startTask, getTasks, connectWebSocket, cancelTask, getTaskEvents } from '../api/client.js';
import { mapBackendEventToUI } from '../api/eventMapper.js';

function CenterFeed({ events, onOpenArtifact }) {
  const feedRef = useRef(null);
  const [showUnread, setShowUnread] = useState(false);

  // demonstrate the unread pill: show it when the user scrolls up from bottom
  function onScroll() {
    const el = feedRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowUnread(!atBottom);
  }
  function scrollToBottom() {
    const el = feedRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  return (
    <main className="center">
      <div className="trace-head">
        <span className="t">Live Trace</span>
        <span className="live"><span className="d" /> streaming</span>
        <span className="spacer" />
        <button className="mini-btn">
          <Icon name="minus" /> Collapse all
        </button>
        <button className="mini-btn">
          <Icon name="arrowDown" /> Jump to latest
        </button>
      </div>
      <div className="feed scroll" ref={feedRef} onScroll={onScroll}>
        <div className="feed-inner">
          {events.length === 0 ? (
            <div className="empty-state">
              <Icon name="activity" size={32} />
              <p>No events yet</p>
            </div>
          ) : (
            events.map((ev, i) => <EventCard key={i} ev={ev} onOpenArtifact={onOpenArtifact} />)
          )}
        </div>
      </div>
      {showUnread ? (
        <button className="unread-pill" onClick={scrollToBottom}>
          <Icon name="arrowDown" /> New events
          <span className="n">{events.length}</span>
        </button>
      ) : null}
    </main>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [wsConnection, setWsConnection] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [artifacts, setArtifacts] = useState(null);

  // Load tasks on mount and poll every 5 seconds
  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadTasks() {
    try {
      const data = await getTasks();
      console.log('Loaded tasks:', data);
      // Use backend tasks directly or empty array
      setTasks(data.tasks || []);
    } catch (e) {
      console.error('Failed to load tasks:', e);
      setTasks([]);
    }
  }

  async function handleStartTask(taskDescription) {
    try {
      console.log('Starting task with description:', taskDescription);
      const result = await startTask(taskDescription);
      console.log('Task started - full response:', JSON.stringify(result, null, 2));
      console.log('Task started - task_id:', result.task_id);
      console.log('Task started - status:', result.status);
      
      // Use the subtask_id from response
      const taskId = result.subtask_id || result.task_id;
      console.log('Using task_id:', taskId);
      
      if (!taskId) {
        console.error('task_id is missing from response');
        alert('Error: No task_id returned from server');
        return;
      }
      
      // Set selected task immediately
      setSelectedId(taskId);
      
      // Clear previous events
      setEvents([]);
      setTurnCount(0);
      setTotalCost(0);
      
      // Connect WebSocket for this task immediately
      if (wsConnection) {
        wsConnection.close();
      }
      
      const ws = connectWebSocket(taskId, (data) => {
        console.log('WebSocket event:', data);
        const uiEvent = mapBackendEventToUI(data);
        setEvents(prev => [...prev, uiEvent]);
        setTurnCount(prev => prev + 1);
        setTotalCost(prev => prev + 0.01);
        
        // Handle task_complete event to extract artifacts
        if (data.event_type === 'task_complete' && data.artifacts) {
          setArtifacts(data.artifacts);
        }
      });
      
      setWsConnection(ws);
      
      // Reload tasks in background to update history
      loadTasks();
    } catch (e) {
      console.error('Failed to start task:', e);
      alert('Failed to start task: ' + e.message);
    }
  }

  async function handleSelectTask(taskId) {
    setSelectedId(taskId);
    // Clear events when switching tasks
    setEvents([]);
    setTurnCount(0);
    setTotalCost(0);
    setArtifacts(null);
    
    // Close existing WebSocket
    if (wsConnection) {
      wsConnection.close();
      setWsConnection(null);
    }
    
    // Load existing events for this task
    try {
      const eventData = await getTaskEvents(taskId);
      console.log('Loaded existing events for task:', taskId, eventData);
      
      if (eventData.events && Array.isArray(eventData.events)) {
        const uiEvents = eventData.events.map(ev => mapBackendEventToUI(ev));
        setEvents(uiEvents);
        setTurnCount(uiEvents.length);
        setTotalCost(uiEvents.length * 0.01);
        
        // Check for task_complete event and extract artifacts
        const completeEvent = eventData.events.find(ev => ev.event_type === 'task_complete');
        if (completeEvent && completeEvent.artifacts) {
          setArtifacts(completeEvent.artifacts);
        }
      }
    } catch (e) {
      console.log('No existing events for task (expected for new tasks):', taskId);
    }
    
    // Connect to new task's WebSocket for live updates
    const ws = connectWebSocket(taskId, (data) => {
      const uiEvent = mapBackendEventToUI(data);
      setEvents(prev => [...prev, uiEvent]);
      setTurnCount(prev => prev + 1);
      setTotalCost(prev => prev + 0.01);
      
      // Handle task_complete event to extract artifacts
      if (data.event_type === 'task_complete' && data.artifacts) {
        setArtifacts(data.artifacts);
      }
    });
    
    setWsConnection(ws);
  }

  function handleOpenArtifact(artifactId) {
    console.log('Open artifact:', artifactId);
    // TODO: Implement artifact viewer
  }

  async function handleCancelTask(taskId) {
    try {
      await cancelTask(taskId);
      console.log('Task cancelled:', taskId);
    } catch (e) {
      console.error('Failed to cancel task:', e);
      alert('Failed to cancel task: ' + e.message);
    }
  }

  return (
    <div className="app">
      <Header selectedId={selectedId} onCancel={handleCancelTask} />
      <LeftPanel tasks={tasks} selectedId={selectedId} onSelect={handleSelectTask} onStartTask={handleStartTask} onCancel={handleCancelTask} />
      <CenterFeed events={events} onOpenArtifact={handleOpenArtifact} />
      <RightPanel artifacts={artifacts} />
      <Footer turnCount={turnCount} totalCost={totalCost} />
    </div>
  );
}
