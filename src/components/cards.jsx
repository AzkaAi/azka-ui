import React, { useState } from 'react';
import { Icon } from './icons.jsx';

// Generic collapsible shell ---------------------------------
function Shell({ hueClass, icoClass, icon, type, title, meta, defaultOpen, collapsible = true, children }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const isOpen = collapsible ? open : true;
  return (
    <div className={'card event-card ' + hueClass + (isOpen ? ' open' : '')}>
      <button
        className="card-head"
        onClick={() => collapsible && setOpen(o => !o)}
        style={collapsible ? null : { cursor: 'default' }}
      >
        <span className={'card-ico ' + icoClass}><Icon name={icon} /></span>
        <span className="card-type">{type}</span>
        <span className="card-title">{title}</span>
        {meta ? <span className="card-meta">{meta}</span> : null}
        {collapsible ? <span className="chev"><Icon name="chevR" /></span> : null}
      </button>
      {isOpen && children ? <div className="card-body">{children}</div> : null}
    </div>
  );
}

// 1 · Thinking ----------------------------------------------
function ThinkingCard({ ev }) {
  const [open, setOpen] = useState(!!ev.open);
  return (
    <div className={'card thinking' + (open ? ' open' : '')}>
      <button className="card-head" onClick={() => setOpen(o => !o)}>
        <span className="card-ico ico-violet"><Icon name="brain" /></span>
        <span className="card-type">Thinking</span>
        <span className="card-title">{open ? '' : 'Reasoning about the refresh race…'}</span>
        <span className="chev"><Icon name="chevR" /></span>
      </button>
      {open ? (
        <div className="card-body">
          <p className="think-text" dangerouslySetInnerHTML={{ __html: ev.text }} />
        </div>
      ) : null}
    </div>
  );
}

// 1.5 · Session Insights Card ---------------------------------
export function SessionInsightsCard({ insights }) {
  if (!insights) return null;
  
  // Render markdown to HTML using marked
  const renderInsights = (text) => {
    if (!text) return "";
    if (typeof window !== 'undefined' && window.marked) {
      return window.marked.parse(text);
    }
    // Fallback: simple markdown rendering
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };
  
  return (
    <div className="card insights-card" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="card-head">
        <span className="card-ico ico-info"><Icon name="info" /></span>
        <span className="card-type">Session Insights</span>
      </div>
      <div className="card-body">
        <div 
          className="insights-content"
          dangerouslySetInnerHTML={{__html: renderInsights(insights)}}
        />
      </div>
    </div>
  );
}

// 2 · View File ---------------------------------------------
function ViewCard({ ev }) {
  return (
    <Shell
      hueClass="h-view"
      icoClass="ico-slate"
      icon="fileText"
      type="View File"
      defaultOpen={ev.open}
      title={<span className="path">{ev.path}</span>}
      meta={
        <>
          <span className="pill">{ev.lang}</span>
          <span>L{ev.lines}</span>
        </>
      }
    >
      <div className="codeblock scroll">
        {ev.code.map((r, i) => (
          <div className="code-row" key={i}>
            <span className="ln">{r.n}</span>
            <span className="lc" dangerouslySetInnerHTML={{ __html: r.html || '\u200b' }} />
          </div>
        ))}
      </div>
    </Shell>
  );
}

// 3 · Edit File ---------------------------------------------
function EditCard({ ev }) {
  const ok = ev.result === 'ok';
  return (
    <Shell
      hueClass="h-edit"
      icoClass="ico-accent"
      icon="filePen"
      type="Edit File"
      defaultOpen={ev.open}
      title={<span className="path">{ev.path}</span>}
      meta={
        <>
          <span style={{ color: 'var(--green-text)', fontFamily: 'var(--mono)', fontSize: '11px' }}>
            +{ev.added}
          </span>
          <span style={{ color: 'var(--red-text)', fontFamily: 'var(--mono)', fontSize: '11px' }}>
            −{ev.removed}
          </span>
          <span className={'exit ' + (ok ? 'ok' : 'fail')}>
            <Icon name={ok ? 'check' : 'x'} /> {ok ? 'applied' : 'failed'}
          </span>
        </>
      }
    >
      <div className="diff">
        <div className="diff-hunk">{ev.hunk}</div>
        {ev.diff.map((r, i) => (
          <div className={'diff-row ' + r.k} key={i}>
            <span className="ln">{r.n}</span>
            <span className="sign">{r.s}</span>
            <span className="lc">{r.t || '\u200b'}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

// 4 · Run Command -------------------------------------------
function RunCard({ ev }) {
  const ok = ev.exit === 0;
  return (
    <Shell
      hueClass="h-run"
      icoClass="ico-dark"
      icon="terminal"
      type="Run"
      defaultOpen={ev.open}
      title={<span className="mono">{ev.cmd}</span>}
      meta={
        <>
          <span style={{ fontSize: '11px' }}>{ev.duration}</span>
          <span className={'exit ' + (ok ? 'ok' : 'fail')}>
            <Icon name={ok ? 'check' : 'x'} /> exit {ev.exit}
          </span>
        </>
      }
    >
      <div className="terminal scroll">
        {ev.lines.map((l, i) => (
          <div
            key={i}
            className={l.c === 'cmd' ? 'cmd-line' : 'o'}
            dangerouslySetInnerHTML={{ __html: l.html || '\u200b' }}
          />
        ))}
      </div>
    </Shell>
  );
}

// 5 · Search Directory --------------------------------------
function SearchCard({ ev }) {
  return (
    <Shell
      hueClass="h-search"
      icoClass="ico-cyan"
      icon="search"
      type="Search"
      defaultOpen={ev.open}
      title={
        <>
          <span className="q">"{ev.query}"</span>
          <span style={{ color: 'var(--text-4)', marginLeft: '7px', fontFamily: 'var(--mono)', fontSize: '11px' }}>
            in {ev.scope}
          </span>
        </>
      }
      meta={<span className="pill">{ev.results.length + ' files'}</span>}
    >
      <div className="match-list">
        {ev.results.map((r, i) => (
          <div className="match-row" key={i}>
            <Icon name="fileCode" />
            <span>{r.path}</span>
            <span className="hit">{r.hits + ' match' + (r.hits > 1 ? 'es' : '')}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

// 6 · Web Research ------------------------------------------
function WebCard({ ev }) {
  return (
    <Shell
      hueClass="h-web"
      icoClass="ico-teal"
      icon="globe"
      type="Web Research"
      defaultOpen={ev.open}
      title={<span className="mono" style={{ color: 'var(--text-2)' }}>{ev.url}</span>}
      meta={
        ev.truncated ? (
          <span className="truncated-note">
            <Icon name="minus" size={10} /> clipped
          </span>
        ) : null
      }
    >
      <div className="web-clip">
        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '7px', fontSize: '13px' }}>
          {ev.title}
        </div>
        {ev.paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <div className="web-meta">
          <Icon name="globe" size={12} />
          <span>{new URL(ev.url).hostname}</span>
          {ev.truncated ? (
            <span className="truncated-note" style={{ marginLeft: 'auto' }}>
              content truncated at 4,000 tokens
            </span>
          ) : null}
        </div>
      </div>
    </Shell>
  );
}

// 7 · Artifact ----------------------------------------------
function ArtifactCard({ ev, onOpen }) {
  return (
    <Shell
      hueClass="h-artifact"
      icoClass="ico-accent"
      icon="fileOut"
      type="Artifact"
      defaultOpen={ev.open}
      title={
        <>
          <span className="mono">{ev.filename}</span>
          <span style={{ color: 'var(--text-4)', marginLeft: '7px', fontSize: '11px' }}>{ev.format}</span>
        </>
      }
    >
      <div className="artifact-row">
        <div className="artifact-ico"><Icon name="fileText" /></div>
        <div className="artifact-info">
          <div className="fn">{ev.filename}</div>
          <div className="meta">{ev.format + ' · ' + ev.size + ' · generated by agent'}</div>
        </div>
        <button className="btn-secondary" onClick={onOpen}>
          <Icon name="eye" /> Open in viewer
        </button>
      </div>
    </Shell>
  );
}

// 8 · Observation -------------------------------------------
function ObservationCard({ ev }) {
  return (
    <Shell
      hueClass="h-obs"
      icoClass="ico-gray"
      icon="braces"
      type="Observation"
      defaultOpen={ev.open}
      title={<span style={{ color: 'var(--text-3)' }}>Raw tool result</span>}
      meta={<span className="pill">debug</span>}
    >
      <pre className="json scroll" dangerouslySetInnerHTML={{ __html: ev.json.join('\n') }} />
    </Shell>
  );
}

// 9 · System Interrupt --------------------------------------
function InterruptCard({ ev }) {
  return (
    <div className="card interrupt">
      <div className="interrupt-head">
        <div className="ico"><Icon name="refresh" /></div>
        <div className="interrupt-body">
          <div className="t">System Interrupt · Strategy Changed</div>
          <div className="msg">{ev.msg}</div>
          <div className="strat">
            <span className="from">{ev.from}</span>
            <Icon name="arrowRight" />
            <span className="to">{ev.to}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 10 · Human Required ---------------------------------------
function HumanCard({ ev }) {
  const [val, setVal] = useState('');
  return (
    <div className="card human">
      <div className="human-top">
        <div className="ico"><Icon name="helpCircle" /></div>
        <div className="t">Human Required</div>
        <div className="pulse-tag">
          <span className="d" /> Agent paused — waiting for you
        </div>
      </div>
      <div className="human-body">
        <div className="human-q">
          {ev.question} <span className="ctx">{ev.ctx}</span> {ev.tail}
        </div>
        <div className="human-input-row">
          <input
            className="human-input"
            placeholder="Type your answer…"
            value={val}
            onChange={e => setVal(e.target.value)}
            autoFocus={false}
          />
          <button className="human-send">
            <Icon name="send" /> Send
          </button>
        </div>
        <div className="human-hint">
          <span><Icon name="bell" size={12} /> Browser notified</span>
          <span><Icon name="volume" size={12} /> Sound played</span>
          <span><span className="kbd">⌘</span><span className="kbd">↵</span>to send</span>
        </div>
      </div>
    </div>
  );
}

// 11 · MCTS Branch ------------------------------------------
function MctsCard({ ev }) {
  return (
    <Shell
      hueClass="h-search mcts"
      icoClass="ico-cyan"
      icon="gitBranch"
      type="MCTS Branch"
      defaultOpen={ev.open}
      title={
        <>
          <span style={{ color: 'var(--text)', fontWeight: 500 }}>Opened </span>
          <span className="mono">{ev.branch}</span>
        </>
      }
      meta={<span className="pill" style={{ color: 'var(--cyan)' }}>score {ev.score}</span>}
    >
      <div className="mcts-grid">
        <div className="mcts-cell">
          <div className="k">Branch</div>
          <div className="v">{ev.branch}</div>
        </div>
        <div className="mcts-cell">
          <div className="k">Commit</div>
          <div className="v">{ev.commit}</div>
        </div>
        <div className="mcts-cell">
          <div className="k">Depth</div>
          <div className="v">d{ev.depth}</div>
        </div>
        <div className="mcts-cell">
          <div className="k">Score</div>
          <div className="v score">{ev.score.toFixed(2)}</div>
        </div>
      </div>
    </Shell>
  );
}

// 12 · Task Complete -----------------------------------------------
function TaskCompleteCard({ ev }) {
  const summary = ev.observation?.stdout || ev.summary || 'Task completed successfully';
  return (
    <div className="card task-complete-card event-card" style={{ backgroundColor: '#1a3a1a', border: '1px solid #2a5a2a' }}>
      <div className="task-complete-top">
        <div className="task-complete-badge complete-checkmark" style={{ backgroundColor: '#2a5a2a', color: '#ffffff' }}>
          <Icon name="check" />
        </div>
        <div>
          <div className="t" style={{ color: '#ffffff', fontWeight: 'bold' }}>Task Complete</div>
        </div>
      </div>
      <div className="task-complete-summary" style={{ color: '#e0e0e0' }}>
        {summary}
      </div>
    </div>
  );
}

// 13 · Finish (legacy) -----------------------------------------------
function FinishCard({ ev }) {
  return (
    <div className="card finish">
      <div className="finish-top">
        <div className="finish-badge"><Icon name="check" /></div>
        <div>
          <div className="t">Task Complete</div>
          <div className="sub">Agent finished successfully · 2 files changed</div>
        </div>
      </div>
      <div className="finish-summary">
        {ev.summary}
        <ul>{ev.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
      </div>
      <div className="finish-stats">
        <div className="fstat">
          <div className="k"><Icon name="coins" /> Tokens</div>
          <div className="v">{ev.tokens}</div>
        </div>
        <div className="fstat">
          <div className="k"><Icon name="dollar" /> Cost</div>
          <div className="v">{ev.cost}</div>
        </div>
        <div className="fstat">
          <div className="k"><Icon name="timer" /> Time</div>
          <div className="v">{ev.time}</div>
        </div>
      </div>
    </div>
  );
}

// Dispatcher -------------------------------------------------
export function EventCard({ ev, onOpenArtifact }) {
  switch (ev.type) {
    case 'thinking':   return <ThinkingCard ev={ev} />;
    case 'view':       return <ViewCard ev={ev} />;
    case 'edit':       return <EditCard ev={ev} />;
    case 'run':        return <RunCard ev={ev} />;
    case 'search':     return <SearchCard ev={ev} />;
    case 'web':        return <WebCard ev={ev} />;
    case 'artifact':   return <ArtifactCard ev={ev} onOpen={onOpenArtifact} />;
    case 'observation':return <ObservationCard ev={ev} />;
    case 'interrupt':  return <InterruptCard ev={ev} />;
    case 'human':      return <HumanCard ev={ev} />;
    case 'mcts':       return <MctsCard ev={ev} />;
    case 'task_complete': return <TaskCompleteCard ev={ev} />;
    case 'finish':     return <FinishCard ev={ev} />;
    default: return null;
  }
}
