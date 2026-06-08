// components/Footer.jsx
export function Footer({ metadata }) {
    const {
        turn_number = 0,
        current_phase = 'IDLE',
        accumulated_cost_usd = 0,
        active_sandboxes = '0 / 4',
        model = 'deepseek-coder',
        elapsed = '0s',
    } = metadata || {};

    const phaseColor = {
        LOCALIZATION: '#58a6ff',
        PATCH_ENGINEERING: '#d29922',
        VERIFICATION: '#3fb950',
        IDLE: '#484f58',
    };

    return (
        <div style={{
            height: '36px',
            background: '#161b22',
            borderTop: '1px solid #21262d',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '24px',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
        }}>
            <span style={{ color: '#58a6ff' }}>{model}</span>

            <span style={{
                color: phaseColor[current_phase] || '#484f58',
                fontWeight: 700,
            }}>
                {current_phase}
            </span>

            <span style={{ color: '#8b949e' }}>
                Turn {turn_number}
            </span>

            <span style={{ color: '#8b949e' }}>
                {active_sandboxes} sandboxes
            </span>

            <span style={{ color: '#8b949e', marginLeft: 'auto' }}>
                ${accumulated_cost_usd.toFixed(4)}
            </span>

            <span style={{ color: '#484f58' }}>{elapsed}</span>
        </div>
    );
}
