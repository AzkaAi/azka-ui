// components/Header.jsx
export function Header({ activeTask, sandboxCount }) {
    return (
        <div style={{
            height: '48px',
            background: '#0d1117',
            borderBottom: '1px solid #21262d',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            justifyContent: 'space-between'
        }}>
            <span style={{
                color: '#58a6ff',
                fontWeight: 700,
                fontSize: '16px',
                fontFamily: 'JetBrains Mono, monospace'
            }}>
                AZKA.AI
            </span>

            <span style={{ color: '#8b949e', fontSize: '13px' }}>
                {activeTask?.description?.slice(0, 60) || 'No active task'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#8b949e', fontSize: '12px' }}>
                    {sandboxCount} / 4 sandboxes
                </span>
                <div style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    background: activeTask ? '#3fb950' : '#484f58',
                    boxShadow: activeTask ? '0 0 6px #3fb950' : 'none',
                    animation: activeTask ? 'pulse 2s infinite' : 'none'
                }} />
            </div>
        </div>
    );
}
