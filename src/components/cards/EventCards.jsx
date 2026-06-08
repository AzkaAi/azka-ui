// components/cards/EventCards.jsx
import { useState } from 'react';

const COLORS = {
    bg: '#0d1117',
    border: '#21262d',
    text: '#e6edf3',
    muted: '#8b949e',
    blue: '#58a6ff',
    green: '#3fb950',
    yellow: '#d29922',
    red: '#f85149',
    orange: '#fb8500',
    purple: '#bc8cff',
};

function Card({ icon, title, color = COLORS.blue,
                children, collapsible = false, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderLeft: `3px solid ${color}`,
            borderRadius: '6px',
            overflow: 'hidden',
        }}>
            <div
                onClick={() => collapsible && setOpen(!open)}
                style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: collapsible ? 'pointer' : 'default',
                    userSelect: 'none',
                }}
            >
                <span>{icon}</span>
                <span style={{
                    color,
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace'
                }}>
                    {title}
                </span>
                {collapsible && (
                    <span style={{
                        marginLeft: 'auto',
                        color: COLORS.muted,
                        fontSize: '11px'
                    }}>
                        {open ? '▲' : '▼'}
                    </span>
                )}
            </div>
            {(!collapsible || open) && children && (
                <div style={{
                    padding: '0 12px 10px',
                    borderTop: `1px solid ${COLORS.border}` 
                }}>
                    {children}
                </div>
            )}
        </div>
    );
}

function Code({ children, language = 'text' }) {
    return (
        <pre style={{
            background: '#161b22',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#e6edf3',
            fontFamily: 'JetBrains Mono, monospace',
            overflowX: 'auto',
            margin: '6px 0 0',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
        }}>
            {children}
        </pre>
    );
}

// ── CARD COMPONENTS ───────────────────────────────────────────────

function ThinkingCard({ event }) {
    return (
        <Card icon="🧠" title="THINKING" color={COLORS.purple} collapsible defaultOpen>
            <p style={{
                color: COLORS.muted,
                fontSize: '13px',
                fontStyle: 'italic',
                margin: '8px 0 0',
                lineHeight: '1.5'
            }}>
                {event.action?.thought || 'Processing...'}
            </p>
        </Card>
    );
}

function ViewFileCard({ event }) {
    const args = event.action?.tool_args || {};
    const result = event.observation?.stdout || '';
    return (
        <Card icon="👁" title={`VIEW FILE — ${args.file_path || ''}`}
              color={COLORS.blue} collapsible>
            <Code>{result.slice(0, 2000)}{result.length > 2000 ? '\n...[truncated]' : ''}</Code>
        </Card>
    );
}

function EditFileCard({ event }) {
    const args = event.action?.tool_args || {};
    return (
        <Card icon="✏️" title={`EDIT FILE — ${args.filepath || ''}`}
              color={COLORS.yellow} collapsible defaultOpen>
            <div style={{ marginTop: '8px' }}>
                <div style={{
                    fontSize: '11px',
                    color: COLORS.muted,
                    marginBottom: '4px'
                }}>REMOVED</div>
                <pre style={{
                    background: '#3d1a1a',
                    padding: '6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#f85149',
                    fontFamily: 'JetBrains Mono, monospace',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                }}>
                    {args.old_string}
                </pre>
                <div style={{
                    fontSize: '11px',
                    color: COLORS.muted,
                    margin: '6px 0 4px'
                }}>ADDED</div>
                <pre style={{
                    background: '#1a3d1a',
                    padding: '6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#3fb950',
                    fontFamily: 'JetBrains Mono, monospace',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                }}>
                    {args.new_string}
                </pre>
            </div>
            <div style={{
                marginTop: '6px',
                fontSize: '12px',
                color: event.observation?.stdout === 'EDIT APPLIED'
                    ? COLORS.green : COLORS.red
            }}>
                {event.observation?.stdout || ''}
            </div>
        </Card>
    );
}

function RunCommandCard({ event }) {
    const args = event.action?.tool_args || {};
    const obs = event.observation || {};
    const exitCode = obs.exit_code ?? '?';
    return (
        <Card icon="⚡" title={`RUN — ${Array.isArray(args.command)
            ? args.command.join(' ') : args.command || ''}`}
              color={exitCode === 0 ? COLORS.green : COLORS.red}
              collapsible defaultOpen>
            <div style={{ marginTop: '8px' }}>
                <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: exitCode === 0 ? '#1a3d1a' : '#3d1a1a',
                    color: exitCode === 0 ? COLORS.green : COLORS.red,
                    fontFamily: 'JetBrains Mono, monospace',
                }}>
                    exit {exitCode}
                </span>
                {obs.stdout && (
                    <Code>{obs.stdout.slice(0, 1000)}</Code>
                )}
                {obs.error && (
                    <Code>{obs.error}</Code>
                )}
            </div>
        </Card>
    );
}

function SearchDirCard({ event }) {
    const args = event.action?.tool_args || {};
    const result = event.observation?.stdout || '';
    return (
        <Card icon="🔍" title={`SEARCH — "${args.search_query || ''}"`}
              color={COLORS.blue} collapsible>
            <Code>{result}</Code>
        </Card>
    );
}

function WebResearchCard({ event }) {
    const args = event.action?.tool_args || {};
    return (
        <Card icon="🌐" title={`WEB — ${args.url || ''}`}
              color={COLORS.blue} collapsible>
            <Code>{event.observation?.stdout?.slice(0, 500) || ''}</Code>
        </Card>
    );
}

function ArtifactCard({ event }) {
    const args = event.action?.tool_args || {};
    return (
        <Card icon="📄" title={`ARTIFACT — ${args.filename || ''}`}
              color={COLORS.purple}>
            <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: COLORS.muted
            }}>
                Format: {args.file_format?.toUpperCase()}
                <button style={{
                    marginLeft: '12px',
                    padding: '4px 10px',
                    background: '#21262d',
                    border: '1px solid #30363d',
                    borderRadius: '4px',
                    color: COLORS.text,
                    fontSize: '11px',
                    cursor: 'pointer',
                }}>
                    View Artifact →
                </button>
            </div>
        </Card>
    );
}

function ObservationCard({ event }) {
    const obs = event.observation || {};
    return (
        <Card icon="📊" title="OBSERVATION" color={COLORS.muted} collapsible>
            <Code>{JSON.stringify(obs, null, 2).slice(0, 500)}</Code>
        </Card>
    );
}

function SystemInterruptCard({ event }) {
    return (
        <div style={{
            background: '#2d1a00',
            border: '1px solid #d29922',
            borderRadius: '6px',
            padding: '12px',
        }}>
            <div style={{
                color: COLORS.yellow,
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '6px'
            }}>
                ⚠️ SYSTEM INTERRUPT
            </div>
            <div style={{
                color: COLORS.text,
                fontSize: '13px'
            }}>
                {event.action?.thought ||
                 event.action?.tool_args?.message || ''}
            </div>
        </div>
    );
}

function HumanRequiredCard({ event, taskId }) {
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        await fetch(
            `http://100.103.30.38:8000/tasks/${taskId}/respond`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer })
            }
        );
        setSubmitted(true);
    };

    return (
        <div style={{
            background: '#1a2d00',
            border: '1px solid #3fb950',
            borderRadius: '6px',
            padding: '12px',
        }}>
            <div style={{
                color: COLORS.green,
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '8px'
            }}>
                👤 AGENT NEEDS YOUR INPUT
            </div>
            <div style={{
                color: COLORS.text,
                fontSize: '13px',
                marginBottom: '10px'
            }}>
                {event.action?.tool_args?.question || ''}
            </div>
            {!submitted ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder="Your answer..."
                        style={{
                            flex: 1,
                            background: '#161b22',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            color: COLORS.text,
                            padding: '6px 8px',
                            fontSize: '13px',
                            outline: 'none',
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleSubmit();
                        }}
                    />
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '6px 14px',
                            background: '#238636',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}
                    >
                        Send
                    </button>
                </div>
            ) : (
                <div style={{ color: COLORS.green, fontSize: '12px' }}>
                    ✓ Answer submitted — agent resuming...
                </div>
            )}
        </div>
    );
}

function MCTSBranchCard({ event }) {
    const args = event.action?.tool_args || {};
    return (
        <Card icon="🌿" title={`MCTS BRANCH — node ${args.node_id || ''}`}
              color={COLORS.purple} collapsible>
            <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                color: COLORS.muted,
                marginTop: '6px'
            }}>
                <div>Commit: {args.commit_hash?.slice(0, 8) || '?'}</div>
                <div>UCT Score: {args.uct_score || '?'}</div>
                <div>Depth: {args.depth || '?'}</div>
            </div>
        </Card>
    );
}

function FinishCard({ event }) {
    const obs = event.observation || {};
    return (
        <div style={{
            background: '#0d2818',
            border: '2px solid #3fb950',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
        }}>
            <div style={{
                fontSize: '24px',
                marginBottom: '8px'
            }}>🏆</div>
            <div style={{
                color: COLORS.green,
                fontSize: '16px',
                fontWeight: 700,
                marginBottom: '6px'
            }}>
                TASK COMPLETE
            </div>
            <div style={{
                color: COLORS.muted,
                fontSize: '13px'
            }}>
                {obs.stdout || 'Agent finished successfully'}
            </div>
        </div>
    );
}

// ── ROUTER ────────────────────────────────────────────────────────

export function renderEventCard(event, taskId) {
    const tool = event.action?.tool_name || event.event_type;

    switch (tool) {
        case 'view_file':      return <ViewFileCard event={event} />;
        case 'edit_file':      return <EditFileCard event={event} />;
        case 'run_command':    return <RunCommandCard event={event} />;
        case 'search_dir':     return <SearchDirCard event={event} />;
        case 'web_research_sandbox': return <WebResearchCard event={event} />;
        case 'generate_user_artifact': return <ArtifactCard event={event} />;
        case 'system_interrupt': return <SystemInterruptCard event={event} />;
        case 'human_response':
        case 'human_required': return <HumanRequiredCard event={event} taskId={taskId} />;
        case 'mcts_branch':    return <MCTSBranchCard event={event} />;
        case 'finish':         return <FinishCard event={event} />;
        case 'observation':    return <ObservationCard event={event} />;
        default:               return <ThinkingCard event={event} />;
    }
}
