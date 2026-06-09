import React from 'react';
import { ThinkingBubble } from './thinking.jsx';
import { renderEvent } from './cards.jsx';

export function EventPair({ thought, thoughtSeconds, action, isLatest, isLive }) {
  const [thoughtCollapsed, setThoughtCollapsed] = React.useState(
    // Collapse thought if action exists and this is not the latest pair
    // or if we're loading from history (not live)
    action !== null && (!isLatest || !isLive)
  );

  // Auto-collapse thought when action arrives
  React.useEffect(() => {
    if (action !== null && isLive) {
      // Small delay so user sees the thought before it collapses
      const timer = setTimeout(() => {
        setThoughtCollapsed(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [action, isLive]);

  // When loading from history, ensure all thoughts are collapsed
  React.useEffect(() => {
    if (!isLive && action !== null) {
      setThoughtCollapsed(true);
    }
  }, [isLive, action]);

  return (
    <div className="event-pair">
      {thought && (
        <ThinkingBubble
          thought={thought}
          isCollapsed={thoughtCollapsed}
          elapsedSeconds={thoughtSeconds}
          onToggle={() => setThoughtCollapsed(prev => !prev)}
        />
      )}
      {action && renderEvent(action)}
    </div>
  );
}
