// components/ViewerPanel.jsx
import { useState } from 'react';

export function ViewerPanel({ taskId }) {
    const [activeTab, setActiveTab] = useState('files');

    const tabs = ['Files', 'Artifacts', 'MCTS', 'Metrics'];

    return (
        <div style={{
            width: '350px',
            background: '#0d1117',
            borderLeft: '1px solid #21262d',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Tab Bar */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #21262d',
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        style={{
                            flex: 1,
                            padding: '8px 4px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.toLowerCase()
                                ? '2px solid #58a6ff' : '2px solid transparent',
                            color: activeTab === tab.toLowerCase()
                                ? '#58a6ff' : '#8b949e',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {activeTab === 'files' && (
                    <div style={{ color: '#484f58', fontSize: '12px' }}>
                        Files touched by agent appear here as tasks run.
                    </div>
                )}
                {activeTab === 'artifacts' && (
                    <div style={{ color: '#484f58', fontSize: '12px' }}>
                        Generated artifacts appear here.
                    </div>
                )}
                {activeTab === 'mcts' && (
                    <div style={{ color: '#484f58', fontSize: '12px' }}>
                        MCTS branch tree appears here.
                    </div>
                )}
                {activeTab === 'metrics' && (
                    <div style={{ color: '#484f58', fontSize: '12px' }}>
                        Langfuse metrics appear here.
                    </div>
                )}
            </div>
        </div>
    );
}
