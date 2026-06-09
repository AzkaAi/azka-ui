import React, { useState } from 'react';
import { Icon } from './icons.jsx';

// Graceful event renderer for malformed events
export function renderEvent(event, taskId) {
  // Guard against malformed events
  const eventType = event?.event_type || event?.type || 'unknown';
  const toolName = event?.action?.tool_name || event?.tool_name || 'unknown';
  const thought = event?.action?.thought || event?.thought || '';
  const command = event?.action?.tool_args?.command || 
                  event?.tool_args?.command ||
                  event?.action?.command ||
                  toolName;
  const stdout = event?.observation?.stdout || event?.result || 
                 JSON.stringify(event, null, 2);
  const exitCode = event?.observation?.exit_code ?? 0;
  
  // Tool icons mapping
  const toolIcons = {
    'create_file': '📄',
    'create_folder': '📁',
    'edit_file': '✏️',
    'run_command': '⚡',
    'view_file': '👁️',
    'finish': '✅',
    'search_dir': '🔍',
    'web_research': '🌐',
    'run_tests': '🧪',
    'unknown': '⚙️'
  };
  
  const icon = toolIcons[toolName] || toolIcons['unknown'];
  
  // Try to use existing card types first
  switch (eventType) {
    case 'clarification':
      return <ClarificationCard key={event.seq_id || Math.random()} event={event.data || event} taskId={taskId} />;
    case 'clarification_required':
      return <ClarificationCard key={event.seq_id || Math.random()} event={event} taskId={taskId} />;
    case 'thinking':   return <ThinkingCard key={event.seq_id || Math.random()} ev={{...event, text: thought || 'Thinking...'}} />;
    case 'view':       return <ViewCard key={event.seq_id || Math.random()} ev={event} />;
    case 'edit':       return <EditCard key={event.seq_id || Math.random()} ev={event} />;
    case 'run':        return <RunCard key={event.seq_id || Math.random()} event={event} />;
    case 'search':     return <SearchCard key={event.seq_id || Math.random()} ev={event} />;
    case 'web':        return <WebCard key={event.seq_id || Math.random()} ev={event} />;
    case 'artifact':   return <ArtifactCard key={event.seq_id || Math.random()} ev={event} />;
    case 'observation':return <ObservationCard key={event.seq_id || Math.random()} ev={event} />;
    case 'interrupt':  return <InterruptCard key={event.seq_id || Math.random()} ev={event} />;
    case 'human':      return <HumanCard key={event.seq_id || Math.random()} ev={event} />;
    case 'mcts':       return <MctsCard key={event.seq_id || Math.random()} ev={event} />;
    case 'task_complete': return <TaskCompleteCard key={event.seq_id || Math.random()} event={event} />;
    case 'finish':     return <FinishCard key={event.seq_id || Math.random()} ev={event} />;
  }
  
  // Fallback for unknown types - show minimal card with icon
  return <Shell 
    key={event.seq_id || Math.random()}
    hueClass="hue-blue"
    icoClass="ico-blue"
    icon="terminal"
    iconEmoji={icon}
    type={toolName}
    title={toolName}
    defaultOpen={true}
  >
    <div className="run-lines">
      <div className="run-line cmd">
        <span className="p">~/workspace</span> $ {command}
      </div>
      <div className="run-line o">
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' }}>
          {typeof stdout === 'string' ? stdout : JSON.stringify(stdout, null, 2)}
        </pre>
      </div>
    </div>
  </Shell>;
}

// Generic collapsible shell ---------------------------------
function Shell({ hueClass, icoClass, icon, iconEmoji, type, title, meta, defaultOpen, collapsible = true, children }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const isOpen = collapsible ? open : true;
  return (
    <div className={'card event-card ' + hueClass + (isOpen ? ' open' : '')}>
      <button
        className="card-head"
        onClick={() => collapsible && setOpen(o => !o)}
        style={collapsible ? null : { cursor: 'default' }}
      >
        {iconEmoji ? (
          <span className="card-ico emoji">{iconEmoji}</span>
        ) : (
          <span className={'card-ico ' + icoClass}><Icon name={icon} /></span>
        )}
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
  
  // Parse the insights text into sections
  const sections = parseInsights(insights);
  
  return (
    <div className="session-insights-card">
      <div className="insights-header">
        <div className="insights-icon">✦</div>
        <span className="insights-title">Session Insights</span>
      </div>
      <div className="insights-body">
        {sections.map((section, i) => (
          <div key={i} className="insights-section">
            {section.heading && (
              <div className="insights-section-heading">
                {section.heading}
              </div>
            )}
            <div className="insights-section-content">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function parseInsights(text) {
  if (!text) return [];
  
  // Remove markdown headers and split into sections
  const lines = text.split('\n').filter(l => l.trim());
  const sections = [];
  let currentSection = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect bold headers like **What was accomplished:**
    const boldHeader = trimmed.match(/^\*\*(.+?):\*\*\s*(.*)/);
    if (boldHeader) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        heading: boldHeader[1],
        content: boldHeader[2] || ''
      };
      continue;
    }
    
    // Detect ## headers
    const markdownHeader = trimmed.match(/^#+\s+(.+)/);
    if (markdownHeader) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        heading: null,
        content: markdownHeader[1]
      };
      continue;
    }
    
    // Regular content
    if (currentSection) {
      currentSection.content += (currentSection.content ? ' ' : '') + 
                                 trimmed.replace(/\*\*/g, '');
    } else {
      currentSection = { heading: null, content: trimmed.replace(/\*\*/g, '') };
    }
  }
  
  if (currentSection) sections.push(currentSection);
  return sections.filter(s => s.content.trim());
}

// Clarification Card for agent questions
function ClarificationCard({ event, taskId }) {
  const [answer, setAnswer] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  
  const questions = event.questions || event.observation?.stdout || '';
  
  async function handleSubmit() {
    if (!answer.trim()) return;
    
    await fetch(
      `https://api.azkaai.com/tasks/${taskId}/respond`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({answer: answer.trim()})
      }
    );
    
    setSubmitted(true);
  }
  
  return (
    <div className="clarification-card">
      <div className="clarification-header">
        <span className="clarification-icon">💬</span>
        <span className="clarification-title">
          Before I start building, I have a few questions
        </span>
      </div>
      <div className="clarification-questions">
        {questions}
      </div>
      {!submitted ? (
        <div className="clarification-input-area">
          <textarea
            className="clarification-textarea"
            placeholder="Type your answers here..."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            rows={5}
          />
          <button 
            className="clarification-submit"
            onClick={handleSubmit}
            disabled={!answer.trim()}
          >
            ✓ Confirm and Start Building
          </button>
        </div>
      ) : (
        <div className="clarification-submitted">
          ✓ Got it. Starting to build now...
        </div>
      )}
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
  console.log("[RunCard]", JSON.stringify(ev, null, 2));
  
  const command = ev?.action?.tool_args?.command?.join(' ') || 
                  ev?.action?.command ||
                  ev?.cmd ||
                  ev?.command ||
                  'command';
  const stdout = ev?.observation?.stdout || ev?.result || '';
  const exitCode = ev?.observation?.exit_code ?? ev?.exit ?? 0;
  const [displayedOutput, setDisplayedOutput] = React.useState('');
  
  React.useEffect(() => {
    if (!stdout) return;
    
    let i = 0;
    const lines = stdout.split('\n');
    let lineIndex = 0;
    
    const interval = setInterval(() => {
      if (lineIndex < lines.length) {
        setDisplayedOutput(prev => 
          prev + (prev ? '\n' : '') + lines[lineIndex]
        );
        lineIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50); // One line per 50ms
    
    return () => clearInterval(interval);
  }, [stdout]);
  
  const isSuccess = exitCode === 0;
  
  return (
    <div className="tool-card run-card">
      <div className="card-header">
        <span className="tool-icon">⚡</span>
        <span className="card-title">Run Command</span>
        <span className={`exit-badge ${isSuccess ? 'success' : 'error'}`}>
          {isSuccess ? '✓' : '✗'} exit {exitCode}
        </span>
      </div>
      <div className="terminal-block">
        <div className="terminal-command">
          <span className="terminal-prompt">$</span>
          <span className="terminal-cmd-text">{command}</span>
        </div>
        {displayedOutput && (
          <div className="terminal-output">
            {displayedOutput}
          </div>
        )}
      </div>
    </div>
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
    default: return renderEvent(ev);
  }
}
