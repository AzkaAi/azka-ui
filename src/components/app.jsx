import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { SessionInsightsCard } from './cards.jsx';
import { Header, LeftPanel, RightPanel, Footer } from './panels.jsx';
import { EventPair } from './eventPair.jsx';
import { startTask, getTasks, connectWebSocket, cancelTask, getTaskEvents, switchToTask } from '../api/client.js';
import { mapBackendEventToUI } from '../api/eventMapper.js';
import { pairEvents } from '../utils/eventPairing.js';
import { useFaviconStatus } from '../hooks/useFaviconStatus.js';

function CenterFeed({ events, insights, onOpenArtifact, isLive = false }) {
  const feedRef = useRef(null);
  const [showUnread, setShowUnread] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

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

  // Pair events for thought+action rendering
  const pairs = pairEvents(events, isLive);
  
  // Debug event rendering
  console.log("[CenterFeed] Rendering", pairs.length, "event pairs, isLive:", isLive);
  pairs.forEach((pair, index) => {
    console.log("[CenterFeed] Pair", index, "thought:", !!pair.thought, "action:", pair.action?.type);
  });

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
          <SessionInsightsCard insights={insights} />
          {pairs.length === 0 ? (
            <div className="empty-state">
              <Icon name="activity" size={32} />
              <p>No events yet</p>
            </div>
          ) : (
            pairs.map((pair, index) => (
              <EventPair
                key={index}
                thought={pair.thought}
                thoughtSeconds={pair.thoughtSeconds}
                action={pair.action}
                isLatest={index === pairs.length - 1}
                isLive={isLive}
              />
            ))
          )}
          <div ref={bottomRef} />
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
  const [insights, setInsights] = useState(null);
  const [activeSandboxes, setActiveSandboxes] = useState('0 / 4');
  const [isLive, setIsLive] = useState(false);
  const [taskStatus, setTaskStatus] = useState('idle'); // idle, active, complete, error
  
  // Update favicon based on task status
  useFaviconStatus(taskStatus);

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
      console.log('[Task object sample]', data.tasks?.[0]);
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
      setIsLive(true);
      setTaskStatus('active');
      
      // Connect WebSocket for this task immediately
      if (wsConnection) {
        wsConnection.close();
      }
      
      const ws = connectWebSocket(taskId, (data) => {
        console.log("[RENDER CALLBACK]", data);
        console.log("[Event received]", data.event_type, data.seq_id);
        const uiEvent = mapBackendEventToUI(data);
        console.log("[Mapped to UI event]", uiEvent.type, uiEvent);
        setEvents(prev => [...prev, uiEvent]);
        
        // Update metadata from event
        if (data.metadata) {
          setTurnCount(data.metadata.turn_number || 0);
          setTotalCost(data.metadata.accumulated_cost_usd || 0);
          setActiveSandboxes(data.metadata.active_sandboxes || '0 / 4');
        }
        
        // Handle task_complete event to extract artifacts
        if (data.event_type === 'task_complete' && data.artifacts) {
          setArtifacts(data.artifacts);
          setTaskStatus('complete');
          // Update task status in left panel
          console.log("[Task complete] Updating task status for:", taskId);
          console.log("[Current tasks]", tasks);
          setTasks(prev => {
            console.log("[Updating tasks from]", prev);
            const updated = prev.map(t => {
              const taskIdField = t.task_id || t.id;
              console.log("[Checking task]", taskIdField, "matches", taskId, ":", taskIdField === taskId);
              return taskIdField === taskId 
                ? {...t, status: 'completed'} 
                : t;
            });
            console.log("[Updated tasks]", updated);
            return updated;
          });
          // Refresh task list from backend
          loadTasks();
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
    console.log("[handleSelectTask] called with taskId:", taskId);
    // Don't clear events if we're already on this task
    if (selectedId === taskId) {
      console.log("[handleSelectTask] Already on this task, skipping");
      return;
    }
    
    console.log("[handleSelectTask] Clearing events and switching to task");
    setSelectedId(taskId);
    // Clear events when switching tasks
    setEvents([]);
    setTurnCount(0);
    setTotalCost(0);
    setArtifacts(null);
    setInsights(null);
    
    // Close existing WebSocket
    if (wsConnection) {
      wsConnection.close();
      setWsConnection(null);
    }
    
    // Load task details including insights and artifacts
    let taskIsActive = false;
    try {
      const taskData = await getTaskEvents(taskId);
      if (taskData.insights) {
        setInsights(taskData.insights);
      }
      if (taskData.artifacts) {
        setArtifacts(taskData.artifacts);
      }
      // Check if task is active (not completed)
      const hasCompleteEvent = taskData.events?.some(e => e.event_type === 'task_complete');
      taskIsActive = !hasCompleteEvent;
      setTaskStatus(hasCompleteEvent ? 'complete' : 'active');
    } catch (e) {
      console.log('No task details available:', taskId);
      // If we can't load task details, assume it might be active
      taskIsActive = true;
      setTaskStatus('active');
    }
    
    // Set isLive based on whether task is active
    setIsLive(taskIsActive);
    
    console.log("[handleSelectTask] Calling switchToTask with taskId:", taskId);
    // Use switchToTask pattern for history loading and WebSocket connection
    // This is called for EVERY task click regardless of status
    switchToTask(taskId, (data) => {
      console.log("[RENDER CALLBACK]", data);
      console.log("[Event received in switchToTask]", data.event_type, data.seq_id);
      const uiEvent = mapBackendEventToUI(data);
      console.log("[Mapped to UI event in switchToTask]", uiEvent.type, uiEvent);
      setEvents(prev => [...prev, uiEvent]);
      
      // Update metadata from event
      if (data.metadata) {
        setTurnCount(data.metadata.turn_number || 0);
        setTotalCost(data.metadata.accumulated_cost_usd || 0);
        setActiveSandboxes(data.metadata.active_sandboxes || '0 / 4');
      }
      
      // Handle task_complete event to extract artifacts
      if (data.event_type === 'task_complete' && data.artifacts) {
        setArtifacts(data.artifacts);
        setTaskStatus('complete');
        setIsLive(false); // Task is no longer live
        // Update task status in left panel
        console.log("[Task complete in switchToTask] Updating task status for:", taskId);
        console.log("[Current tasks]", tasks);
        setTasks(prev => {
          console.log("[Updating tasks from]", prev);
          const updated = prev.map(t => {
            const taskIdField = t.task_id || t.id;
            console.log("[Checking task]", taskIdField, "matches", taskId, ":", taskIdField === taskId);
            return taskIdField === taskId 
              ? {...t, status: 'completed'} 
              : t;
          });
          console.log("[Updated tasks]", updated);
          return updated;
        });
        // Refresh task list from backend
        loadTasks();
      }
    });
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

  function handleTaskUpdate(taskId, newStatus) {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        (task.task_id === taskId || task.id === taskId) 
          ? { ...task, status: newStatus }
          : task
      )
    );
  }

  return (
    <div className="app">
      <Header selectedId={selectedId} onCancel={handleCancelTask} />
      <LeftPanel tasks={tasks} selectedId={selectedId} onSelect={handleSelectTask} onStartTask={handleStartTask} onCancel={handleCancelTask} onTaskUpdate={handleTaskUpdate} />
      <CenterFeed events={events} insights={insights} onOpenArtifact={handleOpenArtifact} isLive={isLive} />
      <RightPanel artifacts={artifacts} />
      <Footer turnCount={turnCount} totalCost={totalCost} activeSandboxes={activeSandboxes} />
    </div>
  );
}
