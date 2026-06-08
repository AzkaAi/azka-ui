import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { EventCard } from './cards.jsx';
import { Header, LeftPanel, RightPanel, Footer } from './panels.jsx';
import { startTask, getTasks, connectWebSocket } from '../api/client.js';
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
          {events.map((ev, i) => <EventCard key={i} ev={ev} onOpenArtifact={onOpenArtifact} />)}
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

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data = await getTasks();
      // Transform backend task IDs to UI task objects
      const uiTasks = (data.tasks || []).map(taskId => ({
        id: taskId,
        desc: `Task ${taskId}`,
        repo: 'azka-orchestrator',
        status: 'active',
        elapsed: '0m 0s',
        selected: false,
      }));
      setTasks(uiTasks);
      if (uiTasks.length > 0) {
        setSelectedId(uiTasks[0].id);
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }
  }

  async function handleStartTask(taskDescription) {
    try {
      const result = await startTask(taskDescription);
      // Reload tasks to get the new task
      await loadTasks();
      setSelectedId(result.task_id);
      
      // Connect WebSocket for this task
      if (wsConnection) {
        wsConnection.close();
      }
      
      const ws = connectWebSocket(result.task_id, (data) => {
        const uiEvent = mapBackendEventToUI(data);
        setEvents(prev => [...prev, uiEvent]);
        setTurnCount(prev => prev + 1);
        // Simple cost estimation (mock for now)
        setTotalCost(prev => prev + 0.01);
      });
      
      setWsConnection(ws);
    } catch (e) {
      console.error('Failed to start task:', e);
    }
  }

  function handleSelectTask(taskId) {
    setSelectedId(taskId);
    // Clear events when switching tasks
    setEvents([]);
    setTurnCount(0);
    setTotalCost(0);
    
    // Close existing WebSocket
    if (wsConnection) {
      wsConnection.close();
      setWsConnection(null);
    }
    
    // Connect to new task's WebSocket
    const ws = connectWebSocket(taskId, (data) => {
      const uiEvent = mapBackendEventToUI(data);
      setEvents(prev => [...prev, uiEvent]);
      setTurnCount(prev => prev + 1);
      setTotalCost(prev => prev + 0.01);
    });
    
    setWsConnection(ws);
  }

  function handleOpenArtifact(artifactId) {
    console.log('Open artifact:', artifactId);
    // TODO: Implement artifact viewer
  }

  return (
    <div className="app">
      <Header />
      <LeftPanel tasks={tasks} selectedId={selectedId} onSelect={handleSelectTask} onStartTask={handleStartTask} />
      <CenterFeed events={events} onOpenArtifact={handleOpenArtifact} />
      <RightPanel />
      <Footer turnCount={turnCount} totalCost={totalCost} />
    </div>
  );
}
