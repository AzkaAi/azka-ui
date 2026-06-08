// App.jsx
import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TaskPanel } from './components/TaskPanel';
import { TracePanel } from './components/TracePanel';
import { ViewerPanel } from './components/ViewerPanel';

export default function App() {
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [lastMetadata, setLastMetadata] = useState(null);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#010409',
            color: '#e6edf3',
            fontFamily: 'Inter, system-ui, sans-serif',
            overflow: 'hidden',
        }}>
            <Header
                activeTask={activeTaskId}
                sandboxCount={lastMetadata?.active_sandboxes || '0 / 4'}
            />

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <TaskPanel
                    onTaskSelect={setActiveTaskId}
                    activeTaskId={activeTaskId}
                />

                <TracePanel
                    taskId={activeTaskId}
                    onMetadataUpdate={setLastMetadata}
                />

                <ViewerPanel taskId={activeTaskId} />
            </div>

            <Footer metadata={lastMetadata} />
        </div>
    );
}
