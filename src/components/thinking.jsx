import React from 'react';

// Typewriter component for character-by-character typing animation
export function Typewriter({ text, speed = 12, onComplete }) {
  const [displayed, setDisplayed] = React.useState('');
  const [done, setDone] = React.useState(false);
  const indexRef = React.useRef(0);

  React.useEffect(() => {
    if (!text) return;
    indexRef.current = 0;
    setDisplayed('');
    setDone(false);

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(prev => prev + text[indexRef.current]);
        indexRef.current++;
      } else {
        clearInterval(interval);
        setDone(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={`typewriter ${done ? 'done' : 'typing'}`}>
      {displayed}
      {!done && <span className="cursor">▋</span>}
    </span>
  );
}

// ThinkingBubble component with expanded/collapsed states
export function ThinkingBubble({ thought, isCollapsed, elapsedSeconds, onToggle }) {
  if (isCollapsed) {
    return (
      <div className="thinking-bubble collapsed" onClick={onToggle}>
        <span className="thinking-icon">💭</span>
        <span className="thinking-summary">
          {elapsedSeconds ? `Thought for ${elapsedSeconds}s` : 'Thought'}
        </span>
        <span className="toggle-arrow">▶</span>
      </div>
    );
  }

  return (
    <div className="thinking-bubble expanded">
      <div className="thinking-header">
        <span className="thinking-icon">💭</span>
        <span className="thinking-label">Thinking...</span>
      </div>
      <div className="thinking-content">
        <Typewriter text={thought} speed={12} />
      </div>
    </div>
  );
}
