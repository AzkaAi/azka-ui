// components/TracePanel.jsx
import { useEffect, useRef, useState } from 'react';
import { switchToTask } from '../state/store';
import { renderEventCard } from './cards/EventCards';

export function TracePanel({ taskId, onMetadataUpdate }) {
    const [events, setEvents] = useState([]);
    const bottomRef = useRef(null);
    const userScrolled = useRef(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!taskId) return;
        setEvents([]);
        userScrolled.current = false;

        switchToTask(taskId, (event) => {
            console.log('WebSocket event:', event);
            setEvents(prev => [...prev, event]);
            
            // Update metadata from event
            if (event.metadata && onMetadataUpdate) {
                onMetadataUpdate(event.metadata);
            }
        });
    }, [taskId, onMetadataUpdate]);

    // Auto-scroll unless user scrolled up
    useEffect(() => {
        if (!userScrolled.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [events]);

    const handleScroll = () => {
        const el = containerRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
        userScrolled.current = !atBottom;
    };

    if (!taskId) {
        return (
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#484f58',
                fontSize: '14px',
                background: '#010409',
            }}>
                Submit a task or select one from the left panel
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
                flex: 1,
                overflowY: 'auto',
                background: '#010409',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            }}
        >
            {events.map((event, idx) => (
                <div key={`${event.seq_id || idx}`}>
                    {renderEventCard(event, taskId)}
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
}
