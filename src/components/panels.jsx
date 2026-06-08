import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons.jsx';

/* ---------- HEADER ---------- */
export function Header({ selectedId, onCancel }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark"><Icon name="spark" /></div>
        <div className="brand-name">
          AZKA<span className="dot">.</span><span className="ai">AI</span>
        </div>
      </div>
      {selectedId && onCancel ? (
        <button className="stop-btn" onClick={() => onCancel(selectedId)} title="Stop current task">
          <Icon name="x" /> Stop Task
        </button>
      ) : null}
      <button className="icon-btn" title="Settings"><Icon name="settings" /></button>
    </header>
  );
}

/* ---------- LEFT PANEL ---------- */
function TaskRow({ task, selected, onSelect, onCancel }) {
  // Handle both string IDs and object tasks
  const taskId = typeof task === 'string' ? task : task.task_id || task.id;
  const taskDesc = typeof task === 'string' ? `Task ${taskId}` : task.description || task.desc || `Task ${taskId}`;
  const taskStatus = typeof task === 'string' ? 'active' : task.status || 'active';
  
  async function handleCancel(e) {
    e.stopPropagation();
    if (onCancel && window.confirm('Stop this task? The agent will finish its current action then stop.')) {
      await onCancel(taskId);
    }
  }
  
  return (
    <button
      className={'task-row' + (selected ? ' sel' : '')}
      onClick={onSelect}
    >
      <div className="task-row-top">
        <span className={'badge ' + taskStatus}>
          <span className="bdot" /> {taskStatus}
        </span>
        <span className="spacer" />
        {taskStatus === 'active' && onCancel ? (
          <button className="cancel-btn" onClick={handleCancel} title="Stop task">
            <Icon name="x" />
          </button>
        ) : null}
      </div>
      <div className="desc">{taskDesc}</div>
      <div className="task-row-meta">
        <span className="tid">{taskId}</span>
      </div>
    </button>
  );
}

export function LeftPanel({ tasks, selectedId, onSelect, onStartTask, onCancel }) {
  const [taskInput, setTaskInput] = useState('');
  
  async function handleSubmit() {
    console.log('Submit clicked, taskInput:', taskInput);
    if (taskInput.trim()) {
      await onStartTask(taskInput);
      setTaskInput('');
    } else {
      console.error('Task input is empty');
    }
  }
  
  return (
    <aside className="left">
      <div className="submit-form">
        <div className="field">
          <div className="field-label">
            Task<span className="opt">plain English or issue URL</span>
          </div>
          <textarea
            className="task-input"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Describe your task..."
          />
        </div>
        <button className="submit-btn" onClick={handleSubmit}>
          <Icon name="zap" /> Launch Agent
        </button>
      </div>
      <div className="panel-head">
        <span className="t">History</span>
        <span className="count">{tasks.length}</span>
      </div>
      <div className="task-list scroll">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <Icon name="clock" size={24} />
            <p>No tasks yet</p>
          </div>
        ) : (
          tasks.map(t => (
            <TaskRow
              key={t.task_id || t.id}
              task={t}
              selected={(t.task_id || t.id) === selectedId}
              onSelect={() => onSelect(t.task_id || t.id)}
              onCancel={onCancel}
            />
          ))
        )}
      </div>
    </aside>
  );
}

/* ---------- RIGHT PANEL ---------- */
function FilesTab() {
  return (
    <div className="empty-state">
      <Icon name="fileCode" size={32} />
      <p>No files touched yet</p>
    </div>
  );
}

function ArtifactsTab() {
  return (
    <div className="empty-state">
      <Icon name="fileOut" size={32} />
      <p>No artifacts generated yet</p>
    </div>
  );
}

function MctsTab() {
  return (
    <div className="empty-state">
      <Icon name="gitBranch" size={32} />
      <p>No branches explored yet</p>
    </div>
  );
}

function MetricsTab() {
  return (
    <div className="empty-state">
      <Icon name="gauge" size={32} />
      <p>No metrics yet</p>
    </div>
  );
}

export function RightPanel() {
  const [tab, setTab] = useState('files');
  const tabs = [
    { id: 'files', label: 'Files', icon: 'folderTree', count: null },
    { id: 'artifacts', label: 'Artifacts', icon: 'package', count: null },
    { id: 'mcts', label: 'MCTS Tree', icon: 'sitemap', count: null },
    { id: 'metrics', label: 'Metrics', icon: 'gauge', count: null },
  ];
  return (
    <aside className="right">
      <div className="tabbar">
        {tabs.map(t => (
          <button
            key={t.id}
            className={'tab' + (tab === t.id ? ' active' : '')}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} /> {t.label}
            {t.count ? <span className="tcount">{t.count}</span> : null}
          </button>
        ))}
      </div>
      <div className="right-body">
        {tab === 'files' ? <FilesTab /> :
         tab === 'artifacts' ? <ArtifactsTab /> :
         tab === 'mcts' ? <MctsTab /> :
         <MetricsTab />}
      </div>
    </aside>
  );
}

/* ---------- FOOTER ---------- */
export function Footer({ turnCount, totalCost }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSecs(s => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return (
    <footer className="footer">
      <div className="foot-item foot-model">
        <span className="md" />
        <span className="fk">Model</span>
        <span className="fv">DeepSeek v4-flash</span>
      </div>
      <div className="foot-sep" />
      <div className="foot-item">
        <div className="foot-phase patch">
          <span className="pd" /> Localization
        </div>
      </div>
      <div className="foot-sep" />
      <div className="foot-item">
        <span className="fk">Turn</span>
        <span className="fv tick">{turnCount}</span>
      </div>
      <div className="foot-sep" />
      <div className="foot-item">
        <Icon name="boxes" />
        <span className="fk">Sandboxes</span>
        <span className="fv">0</span>
      </div>
      <div className="foot-spacer" />
      <div className="foot-item">
        <Icon name="coins" />
        <span className="fk">Cost</span>
        <span className="fv tick">${totalCost.toFixed(2)}</span>
      </div>
      <div className="foot-sep" />
      <div className="foot-item">
        <Icon name="timer" />
        <span className="fk">Elapsed</span>
        <span className="fv tick">{mm}:{ss}</span>
      </div>
    </footer>
  );
}
