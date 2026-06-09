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
function TaskRow({ task, selected, onSelect, onCancel, onTaskUpdate }) {
  // Handle both string IDs and object tasks
  const taskId = typeof task === 'string' ? task : task.task_id || task.id;
  const taskDesc = typeof task === 'string' ? `Task ${taskId}` : (task.description || task.desc || 'Untitled Task');
  const taskStatus = typeof task === 'string' ? 'active' : task.status || 'active';
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Case-insensitive status checks
  const isActive = taskStatus?.toLowerCase() === 'active';
  const isCompleted = taskStatus?.toLowerCase() === 'completed' || 
                      taskStatus?.toLowerCase() === 'complete';
  
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
      className={`task-row ${selected ? ' sel' : ''} ${isCancelling ? 'cancelling' : ''} ${isCompleted ? 'completed-flash' : ''}`}
      onClick={onSelect}
    >
      <div className="task-row-top">
        <span className={`badge ${taskStatus} ${isActive ? 'active-badge' : ''}`}>
          <span className="bdot" /> {taskStatus}
        </span>
        <span className="spacer" />
        {isActive && onCancel ? (
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
  const [fileContent, setFileContent] = useState('');
  const [language, setLanguage] = useState('');
  
  // Get display path - strip workspace prefixes
  function getDisplayPath(filepath) {
    if (!filepath) return "";
    const parts = filepath.split("/");
    const workspaceIdx = parts.findIndex(p => p === "workspace");
    if (workspaceIdx !== -1 && parts.length > workspaceIdx + 2) {
      return parts.slice(workspaceIdx + 2).join("/");
    }
    const trajIdx = parts.findIndex(p => p === "trajectory-0");
    if (trajIdx !== -1) {
      return parts.slice(trajIdx + 1).join("/");
    }
    return parts[parts.length - 1];
  }

  // Download single file
  function downloadFile(filepath, content) {
    try {
      const filename = getDisplayPath(filepath).split("/").pop();
      const blob = new Blob([content], {type: "text/plain;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch(e) {
      console.error("Download failed:", e);
    }
  }

  // Download all files as zip
  async function downloadAllFiles(artifacts) {
    if (typeof JSZip === 'undefined') {
      console.error('JSZip not loaded');
      // Fallback: download files individually
      artifacts.forEach(a => downloadFile(a.filepath, a.content));
      return;
    }
    
    const zip = new JSZip();
    artifacts.forEach(artifact => {
      const filename = getDisplayPath(artifact.filepath);
      zip.file(filename, artifact.content);
    });
    
    const blob = await zip.generateAsync({type: "blob"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "azka_output.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  const handleFileClick = (artifact) => {
    console.log("[File clicked]", artifact.filepath, "content length:", artifact.content?.length);
    setSelectedFile(artifact.filepath);
    setFileContent(artifact.content);
    setLanguage(artifact.language);
  };

  // Apply syntax highlighting
  useEffect(() => {
    if (fileContent && typeof window !== 'undefined' && window.hljs) {
      const pre = document.querySelector('.file-viewer-pre code');
      if (pre) {
        window.hljs.highlightElement(pre);
      }
    }
  }, [fileContent, language]);

  // Check if file is an image
  const isImage = selectedFile && (
    language === 'screenshot' ||
    selectedFile.endsWith('.png') ||
    selectedFile.endsWith('.jpg') ||
    selectedFile.endsWith('.jpeg') ||
    selectedFile.endsWith('.gif')
  );

  // Select first file by default when artifacts load
  useEffect(() => {
    if (artifacts && artifacts.length > 0 && !selectedFile) {
      const firstFile = artifacts[0];
      setSelectedFile(firstFile.filepath);
      setFileContent(firstFile.content);
      setLanguage(firstFile.language);
    }
  }, [artifacts, selectedFile]);

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
      <div className="files-header">
        <span className="files-title">Files</span>
        {artifacts.length > 0 && (
          <button 
            className="download-all-btn"
            onClick={() => downloadAllFiles(artifacts)}
          >
            ↓ Download All
          </button>
        )}
      </div>
      <div className="filetree scroll">
        {artifacts.map((artifact, index) => (
          <div 
            key={index}
            className="file-item"
            onClick={() => handleFileClick(artifact)}
            style={{
              background: selectedFile === artifact.filepath ? 'rgba(255,255,255,0.06)' : 'transparent'
            }}
          >
            <span className="file-icon">📄</span>
            <span className="file-name">{getDisplayPath(artifact.filepath)}</span>
            <button 
              className="file-download-btn"
              onClick={(e) => {
                e.stopPropagation();
                console.log("[Download clicked]", artifact.filepath);
                downloadFile(artifact.filepath, artifact.content);
              }}
              title="Download file"
            >
              ↓
            </button>
          </div>
        ))}
      </div>
      <div className="fileview">
        {selectedFile ? (
          isImage ? (
            <div className="file-viewer">
              <div className="file-viewer-header">
                <span className="file-viewer-path">{getDisplayPath(selectedFile)}</span>
                <button 
                  className="file-download-btn-inline"
                  onClick={() => downloadFile(selectedFile, fileContent)}
                >
                  ↓ Download
                </button>
              </div>
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
            </div>
          ) : (
            <div className="file-viewer">
              <div className="file-viewer-header">
                <span className="file-viewer-path">{getDisplayPath(selectedFile)}</span>
                <button 
                  className="file-download-btn-inline"
                  onClick={() => downloadFile(selectedFile, fileContent)}
                >
                  ↓ Download
                </button>
              </div>
              <pre className="file-viewer-pre">
                <code className={`language-${language || 'plaintext'}`}>
                  {fileContent}
                </code>
              </pre>
            </div>
          )
        ) : (
          <div className="empty-state" style={{ height: '100%' }}>
            <Icon name="fileCode" size={32} />
            <p>Select a file to view its content</p>
          </div>
        )}
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
