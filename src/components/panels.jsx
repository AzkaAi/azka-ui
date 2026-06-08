import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons.jsx';
import { TREE, FILE_VIEW, ARTIFACTS, METRICS, MCTS_TREE, FOOTER } from './data.jsx';

/* ---------- HEADER ---------- */
export function Header() {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark"><Icon name="spark" /></div>
        <div className="brand-name">
          AZKA<span className="dot">.</span><span className="ai">AI</span>
        </div>
      </div>
      <div className="header-sep" />
      <div className="header-task">
        <span className="label">Working on</span>
        <span className="name">Fix JWT token refresh race condition under load</span>
        <span className="tid">#1847</span>
      </div>
      <div className="status-ind">
        <span className="bars">
          <i /><i /><i /><i />
        </span>
        Running
      </div>
      <div className="sandbox-meter">
        <Icon name="boxes" size={13} />
        <span className="pips">
          <i className="on" /><i className="on" /><i className="on" /><i />
        </span>
        <span className="mono"><b>3</b> / 4</span> sandboxes
      </div>
      <button className="icon-btn" title="Settings"><Icon name="settings" /></button>
    </header>
  );
}

/* ---------- LEFT PANEL ---------- */
function TaskRow({ task, selected, onSelect }) {
  const stateLabel = { active: 'Active', completed: 'Completed', failed: 'Failed', awaiting: 'Awaiting Human' };
  return (
    <button
      className={'task-row' + (selected ? ' sel' : '')}
      onClick={onSelect}
    >
      <div className="task-row-top">
        <span className={'badge ' + task.status}>
          <span className="bdot" /> {stateLabel[task.status]}
        </span>
        <span className="spacer" />
      </div>
      <div className="desc">{task.desc}</div>
      <div className="task-row-meta">
        <span className="tid">{task.id}</span>
        <span className="dot-sep" />
        <span className="elapsed"><Icon name="clock" /> {task.elapsed}</span>
      </div>
    </button>
  );
}

export function LeftPanel({ tasks, selectedId, onSelect }) {
  return (
    <aside className="left">
      <div className="submit-form">
        <div className="field">
          <div className="field-label">
            Task<span className="opt">plain English or issue URL</span>
          </div>
          <textarea
            className="task-input"
            defaultValue="Fix JWT token refresh race condition causing intermittent 401s under load (#1847)"
          />
        </div>
        <div className="field">
          <div className="field-label">
            Repository<span className="opt">optional</span>
          </div>
          <div className="repo-input-wrap">
            <input className="repo-input" defaultValue="github.com/acme-corp/payments-api" />
          </div>
        </div>
        <button className="submit-btn">
          <Icon name="zap" /> Launch Agent
        </button>
        <div className="kbd-hint">
          Press <span className="kbd">⌘</span> <span className="kbd">↵</span> to submit
        </div>
      </div>
      <div className="panel-head">
        <span className="t">History</span>
        <span className="count">{tasks.length}</span>
      </div>
      <div className="task-list scroll">
        {tasks.map(t => (
          <TaskRow
            key={t.id}
            task={t}
            selected={t.id === selectedId}
            onSelect={() => onSelect(t.id)}
          />
        ))}
      </div>
    </aside>
  );
}

/* ---------- RIGHT PANEL ---------- */
function FilesTab() {
  const [sel, setSel] = useState('token-manager.ts');
  return (
    <>
      <div className="filetree scroll">
        {TREE.map((row, i) => {
          const isFolder = row.type === 'folder';
          const selected = !isFolder && row.name === sel;
          return (
            <div
              key={i}
              className={'tree-row' + (isFolder ? ' folder' : '') + (selected ? ' sel' : '')}
              style={{ paddingLeft: (7 + row.depth * 15) + 'px' }}
              onClick={() => !isFolder && setSel(row.name)}
            >
              <span className="tw">
                {isFolder ? <Icon name={row.open ? 'chevD' : 'chevR'} /> : null}
              </span>
              <span className="fi">
                <Icon name={isFolder ? (row.open ? 'folderOpen' : 'folder') : 'fileCode'} />
              </span>
              <span className="nm">{row.name}</span>
              {row.modified ? <span className="mod" title="Modified" /> : null}
            </div>
          );
        })}
      </div>
      <div className="fileview">
        <div className="fileview-head">
          <span className="fp">
            <span className="dir">{FILE_VIEW.dir}</span>{FILE_VIEW.name}
          </span>
          {FILE_VIEW.modified ? <span className="badge-mod">Modified</span> : null}
          <span className="spacer" />
          <span className="lines">{FILE_VIEW.lineCount + ' lines'}</span>
        </div>
        <div className="fileview-body scroll">
          <div className="codeblock">
            {FILE_VIEW.code.map((r, i) => (
              <div className="code-row" key={i}>
                <span className="ln">{r.n}</span>
                <span className="lc" dangerouslySetInnerHTML={{ __html: r.html || '\u200b' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ArtifactsTab() {
  return (
    <div className="artifacts-list scroll">
      {ARTIFACTS.map((a, i) => (
        <div className="art-card" key={i}>
          <div className="artifact-ico"><Icon name="fileText" /></div>
          <div className="artifact-info">
            <div className="fn">{a.filename}</div>
            <div className="meta">{a.format + ' · ' + a.size}</div>
          </div>
          <button className="icon-btn" title="Download"><Icon name="download" /></button>
        </div>
      ))}
    </div>
  );
}

function MctsTab() {
  const stateColor = { root: '#64748b', failed: '#e0473e', explored: '#8b5cf6', active: '#4f6ef2', win: '#18a558' };
  const byId = {};
  MCTS_TREE.nodes.forEach(n => byId[n.id] = n);
  return (
    <div className="mcts-tab">
      <div className="mcts-toolbar">
        <div className="z">
          <button className="icon-btn" title="Zoom out"><Icon name="minus" /></button>
          <button className="icon-btn" title="Zoom in"><Icon name="plus" /></button>
          <button className="icon-btn" title="Fit"><Icon name="expand" /></button>
        </div>
        <span className="spacer" />
        <div className="legend">
          <span><span className="nd" style={{ background: '#4f6ef2' }} /> active</span>
          <span><span className="nd" style={{ background: '#18a558' }} /> win</span>
          <span><span className="nd" style={{ background: '#e0473e' }} /> failed</span>
        </div>
      </div>
      <div className="mcts-canvas">
        <svg width="100%" height="100%" viewBox="0 0 372 260" style={{ display: 'block' }}>
          {MCTS_TREE.edges.map((e, i) => {
            const a = byId[e[0]], b = byId[e[1]];
            return (
              <path
                key={i}
                d={`M${a.x} ${a.y+16} C ${a.x} ${(a.y+b.y)/2}, ${b.x} ${(a.y+b.y)/2}, ${b.x} ${b.y-16}`}
                fill="none"
                stroke={b.state === 'win' ? '#18a558' : b.state === 'active' ? '#4f6ef2' : '#d3d6de'}
                strokeWidth={b.state === 'win' || b.state === 'active' ? 2 : 1.4}
                strokeDasharray={b.state === 'failed' ? '3 3' : 'none'}
              />
            );
          })}
          {MCTS_TREE.nodes.map((n, i) => {
            const col = stateColor[n.state];
            const isWin = n.state === 'win', isActive = n.state === 'active';
            return (
              <g key={i} transform={`translate(${n.x},${n.y})`}>
                {(isWin || isActive) ? <circle r={17} fill={col} opacity={0.12} /> : null}
                <circle
                  r={13}
                  fill="#fff"
                  stroke={col}
                  strokeWidth={isWin || isActive ? 2.5 : 1.6}
                  strokeDasharray={n.state === 'failed' ? '3 2' : 'none'}
                />
                {isWin ? (
                  <path
                    d="M-4 0 L-1 3 L5 -4"
                    fill="none"
                    stroke={col}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <text textAnchor="middle" dy="3.5" className="node-label" fill={col} fontWeight={600}>
                    {n.label}
                  </text>
                )}
                <text textAnchor="middle" y={27} className="node-label" fill="#8a909c">
                  {n.commit}
                </text>
                {n.score !== '—' ? (
                  <text textAnchor="middle" y={38} className="node-label" fill={col} fontWeight={600}>
                    {n.score}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: '10.5px', color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
          7 nodes · depth 2 · drag to pan · scroll to zoom
        </div>
      </div>
    </div>
  );
}

function MetricsTab() {
  return (
    <div className="metrics scroll">
      <div className="metric-section-t">Token Usage</div>
      <div className="metric-grid">
        <div className="mcard">
          <div className="mk"><Icon name="arrowDown" /> Input tokens</div>
          <div className="mv">{METRICS.inputTokens}</div>
        </div>
        <div className="mcard">
          <div className="mk"><Icon name="arrowRight" /> Output tokens</div>
          <div className="mv">{METRICS.outputTokens}</div>
        </div>
        <div className="mcard">
          <div className="mk"><Icon name="dollar" /> Est. cost</div>
          <div className="mv accent">{METRICS.cost}</div>
          <div className="msub up">updating live</div>
        </div>
        <div className="mcard">
          <div className="mk"><Icon name="gauge" /> Avg LLM latency</div>
          <div className="mv">{METRICS.avgLatency}<small> ms</small></div>
        </div>
      </div>
      <div className="metric-section-t">Tool Calls</div>
      <div className="bar-list">
        {METRICS.toolCalls.map((t, i) => (
          <div className="bar-item" key={i}>
            <div className="bar-top">
              <span className="nm"><Icon name={t.icon} /> {t.name}</span>
              <span className="ct">{t.count}</span>
            </div>
            <div className="bar-track">
              <div className={'bar-fill ' + t.color} style={{ width: t.pct + '%' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="metric-section-t">Time by Phase</div>
      <div className="phase-bar">
        {METRICS.phases.map((p, i) => (
          <div key={i} className={'phase-seg ' + p.key} style={{ width: p.pct + '%' }}>
            {p.pct + '%'}
          </div>
        ))}
      </div>
      <div className="phase-legend">
        {METRICS.phases.map((p, i) => (
          <span key={i}>
            <span className="sw" style={{ background: p.key === 'loc' ? 'var(--accent)' : p.key === 'patch' ? 'var(--violet)' : 'var(--green)' }} />
            {p.name} · <span className="mono" style={{ color: 'var(--text-3)' }}>{p.time}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function RightPanel() {
  const [tab, setTab] = useState('files');
  const tabs = [
    { id: 'files', label: 'Files', icon: 'folderTree', count: '4' },
    { id: 'artifacts', label: 'Artifacts', icon: 'package', count: '3' },
    { id: 'mcts', label: 'MCTS Tree', icon: 'sitemap', count: '7' },
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
export function Footer() {
  const [tokens, setTokens] = useState(FOOTER.tokens);
  const [secs, setSecs] = useState(281);
  const [turn, setTurn] = useState(FOOTER.turn);
  useEffect(() => {
    const id = setInterval(() => {
      setTokens(t => t + Math.floor(Math.random() * 240 + 40));
      setSecs(s => s + 1);
      if (Math.random() < 0.18) setTurn(t => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const cost = (tokens / 184920 * 0.47);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return (
    <footer className="footer">
      <div className="foot-item foot-model">
        <span className="md" />
        <span className="fk">Model</span>
        <span className="fv">{FOOTER.model}</span>
      </div>
      <div className="foot-sep" />
      <div className="foot-item">
        <div className="foot-phase patch">
          <span className="pd" /> Patch Engineering
        </div>
      </div>
      <div className="foot-sep" />
      <div className="foot-item">
        <span className="fk">Turn</span>
        <span className="fv tick">{turn}</span>
      </div>
      <div className="foot-sep" />
      <div className="foot-item">
        <Icon name="boxes" />
        <span className="fk">Sandboxes</span>
        <span className="fv">{FOOTER.sandboxes}</span>
      </div>
      <div className="foot-spacer" />
      <div className="foot-item">
        <Icon name="coins" />
        <span className="fk">Tokens</span>
        <span className="fv tick">{tokens.toLocaleString()}</span>
      </div>
      <div className="foot-sep" />
      <div className="foot-item">
        <span className="fk">Cost</span>
        <span className="fv tick">${cost.toFixed(2)}</span>
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
