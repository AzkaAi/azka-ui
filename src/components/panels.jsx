import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons.jsx';
import { useMonacoEditor, animateFileCreation, animateFileEdit, animateFileView } from '../hooks/useMonacoEditor.js';

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
function TaskRow({ task, selected, onSelect, onCancel, onTaskUpdate }) {
  // Handle both string IDs and object tasks
  const taskId = typeof task === 'string' ? task : task.task_id || task.id;
  const taskDesc = typeof task === 'string' ? `Task ${taskId}` : (task.description || task.desc || 'Untitled Task');
  const taskStatus = typeof task === 'string' ? 'active' : task.status || 'active';
  const [isCancelling, setIsCancelling] = useState(false);
  
  async function handleCancel(e) {
    e.stopPropagation();
    if (onCancel && window.confirm('Stop this task? The agent will finish its current action then stop.')) {
      setIsCancelling(true);
      await onCancel(taskId);
      // Immediately update task status in UI
      if (onTaskUpdate) {
        onTaskUpdate(taskId, 'CANCELLED');
      }
      setIsCancelling(false);
    }
  }
  
  return (
    <button
      className={`task-row ${selected ? ' sel' : ''} ${isCancelling ? 'cancelling' : ''} ${taskStatus === 'completed' ? 'completed-flash' : ''}`}
      onClick={onSelect}
    >
      <div className="task-row-top">
        <span className={`badge ${taskStatus} ${taskStatus === 'active' ? 'active-badge' : ''}`}>
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

export function LeftPanel({ tasks, selectedId, onSelect, onStartTask, onCancel, onTaskUpdate }) {
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
              onTaskUpdate={onTaskUpdate}
            />
          ))
        )}
      </div>
    </aside>
  );
}

/* ---------- RIGHT PANEL ---------- */
function FilesTab({ artifacts }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tree, setTree] = useState([]);
  const [fileContent, setFileContent] = useState('');
  const [language, setLanguage] = useState('');
  const [isNewFile, setIsNewFile] = useState(false);
  const containerRef = useRef(null);
  
  const monacoEditor = useMonacoEditor(containerRef);

  useEffect(() => {
    if (!artifacts || artifacts.length === 0) return;

    // Build file tree from artifacts
    const treeMap = new Map();
    
    artifacts.forEach(artifact => {
      // Strip /workspace/{task_id}/ prefix
      const cleanPath = artifact.filepath.replace(/^\/workspace\/[^/]+\//, '');
      const parts = cleanPath.split('/');
      
      let currentPath = '';
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const fullPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!treeMap.has(fullPath)) {
          treeMap.set(fullPath, {
            name: part,
            path: fullPath,
            isFile: isLast,
            parent: currentPath || null,
            children: [],
            content: artifact.content,
            language: artifact.language,
            isNew: true // Mark as new for animation
          });
        }
        
        // Add to parent's children
        if (currentPath && treeMap.has(currentPath)) {
          const parent = treeMap.get(currentPath);
          if (!parent.children.includes(fullPath)) {
            parent.children.push(fullPath);
          }
        }
        
        currentPath = fullPath;
      });
    });

    // Convert map to array and sort
    const treeArray = Array.from(treeMap.values()).sort((a, b) => {
      if (a.path === b.path) return 0;
      if (a.path.startsWith(b.path)) return 1;
      if (b.path.startsWith(a.path)) return -1;
      return a.path.localeCompare(b.path);
    });

    setTree(treeArray);
    
    // Select first file by default
    const firstFile = treeArray.find(item => item.isFile);
    if (firstFile) {
      setSelectedFile(firstFile.path);
      setFileContent(firstFile.content);
      setLanguage(firstFile.language);
      setIsNewFile(true);
      
      // Animate file creation if Monaco is ready
      if (monacoEditor.isReady) {
        animateFileCreation(monacoEditor, firstFile.path, firstFile.content, firstFile.language);
      }
    }
  }, [artifacts, monacoEditor.isReady]);

  const handleFileClick = (item) => {
    if (item.isFile) {
      setSelectedFile(item.path);
      setFileContent(item.content);
      setLanguage(item.language);
      setIsNewFile(false);
      
      // Animate file view if Monaco is ready
      if (monacoEditor.isReady) {
        monacoEditor.setValue(item.content);
        monacoEditor.setLanguage(item.language);
        animateFileView(monacoEditor);
      }
    }
  };

  // Check if file is an image
  const isImage = selectedFile && (
    language === 'screenshot' ||
    selectedFile.endsWith('.png') ||
    selectedFile.endsWith('.jpg') ||
    selectedFile.endsWith('.jpeg') ||
    selectedFile.endsWith('.gif')
  );

  const renderTree = (items, parentPath = '') => {
    return items
      .filter(item => item.parent === parentPath)
      .map(item => (
        <div key={item.path}>
          <div
            className={`tree-row ${item.isNew ? 'new-file' : ''}`}
            onClick={() => handleFileClick(item)}
            style={{
              paddingLeft: (7 + (item.path.split('/').length - 1) * 15) + 'px',
              background: selectedFile === item.path ? 'var(--accent-weak)' : 'transparent'
            }}
          >
            <span className="tw">
              {!item.isFile ? (
                <Icon 
                  name={item.children.length > 0 ? 'chevD' : 'chevR'} 
                  className={`folder-icon ${selectedFile === item.path ? 'open' : ''}`}
                />
              ) : null}
            </span>
            <span className="fi">
              <Icon name={item.isFile ? 'fileCode' : 'folder'} />
            </span>
            <span className="nm">{item.name}</span>
          </div>
          {!item.isFile && renderTree(items, item.path)}
        </div>
      ));
  };

  // Apply syntax highlighting
  useEffect(() => {
    if (fileContent && typeof window !== 'undefined' && window.hljs) {
      const pre = document.querySelector('.code-content');
      if (pre) {
        pre.innerHTML = fileContent;
        window.hljs.highlightElement(pre);
      }
    }
  }, [fileContent, language]);

  if (!artifacts || artifacts.length === 0) {
    return (
      <div className="empty-state">
        <Icon name="fileCode" size={32} />
        <p>No files touched yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="filetree scroll">
        {renderTree(tree)}
      </div>
      <div className="fileview">
        <div className="fileview-head">
          <span className="fp">
            {selectedFile ? (
              <>
                <span className="dir">{selectedFile.substring(0, selectedFile.lastIndexOf('/') + 1)}</span>
                {selectedFile.split('/').pop()}
              </>
            ) : 'Select a file'}
          </span>
          {selectedFile && language ? (
            <span className="badge-mod" style={{ marginLeft: '8px' }}>{language}</span>
          ) : null}
        </div>
        <div className="fileview-body scroll">
          {selectedFile ? (
            isImage ? (
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={fileContent.startsWith('data:') ? fileContent : `data:image/png;base64,${fileContent}`}
                  alt={selectedFile}
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div 
                ref={containerRef}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  minHeight: '400px',
                  border: '1px solid var(--border)'
                }}
              />
            )
          ) : (
            <div className="empty-state" style={{ height: '100%' }}>
              <Icon name="fileCode" size={32} />
              <p>Select a file to view its content</p>
            </div>
          )}
        </div>
      </div>
    </>
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

export function RightPanel({ artifacts }) {
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
        {tab === 'files' ? <FilesTab artifacts={artifacts} /> :
         tab === 'artifacts' ? <ArtifactsTab /> :
         tab === 'mcts' ? <MctsTab /> :
         <MetricsTab />}
      </div>
    </aside>
  );
}

/* ---------- FOOTER ---------- */
export function Footer({ turnCount, totalCost, activeSandboxes }) {
  const [secs, setSecs] = useState(0);
  const [displayedTurn, setDisplayedTurn] = useState(turnCount);
  const [displayedCost, setDisplayedCost] = useState(totalCost);
  const [displayedSandboxes, setDisplayedSandboxes] = useState(activeSandboxes);
  
  useEffect(() => {
    const id = setInterval(() => {
      setSecs(s => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  
  // Animate counter updates
  useEffect(() => {
    if (turnCount !== displayedTurn) {
      setDisplayedTurn(turnCount);
    }
  }, [turnCount, displayedTurn]);
  
  useEffect(() => {
    if (totalCost !== displayedCost) {
      setDisplayedCost(totalCost);
    }
  }, [totalCost, displayedCost]);
  
  useEffect(() => {
    if (activeSandboxes !== displayedSandboxes) {
      setDisplayedSandboxes(activeSandboxes);
    }
  }, [activeSandboxes, displayedSandboxes]);
  
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
        <span className={`fv tick ${turnCount !== displayedTurn ? 'counter-updating' : ''} ${turnCount !== displayedTurn ? 'counter-updated' : ''}`}>{displayedTurn}</span>
      </div>
      <div className="foot-sep" />
      <div className="foot-item">
        <Icon name="boxes" />
        <span className="fk">Sandboxes</span>
        <span className={`fv ${activeSandboxes !== displayedSandboxes ? 'counter-updating' : ''} ${activeSandboxes !== displayedSandboxes ? 'counter-updated' : ''}`}>{displayedSandboxes || '0 / 4'}</span>
      </div>
      <div className="foot-spacer" />
      <div className="foot-item">
        <Icon name="coins" />
        <span className="fk">Cost</span>
        <span className={`fv tick ${totalCost !== displayedCost ? 'counter-updating' : ''} ${totalCost !== displayedCost ? 'counter-updated' : ''}`}>${displayedCost.toFixed(2)}</span>
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
