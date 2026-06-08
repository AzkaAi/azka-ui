import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { EventCard } from './cards.jsx';
import { Header, LeftPanel, RightPanel, Footer } from './panels.jsx';
import { TASKS, EVENTS } from './data.jsx';

function CenterFeed() {
  const feedRef = useRef(null);
  const [showUnread, setShowUnread] = useState(false);
  const [reconnect, setReconnect] = useState(true);
  useEffect(() => { const id = setTimeout(() => setReconnect(false), 4200); return () => clearTimeout(id); }, []);

  // demonstrate the unread pill: show it when the user scrolls up from bottom
  function onScroll() {
    const el = feedRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowUnread(!atBottom);
  }
  function scrollToBottom() {
    const el = feedRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  return (
    <main className="center">
      <div className="trace-head">
        <span className="t">Live Trace</span>
        <span className="live"><span className="d" /> streaming</span>
        <span className="spacer" />
        <button className="mini-btn">
          <Icon name="minus" /> Collapse all
        </button>
        <button className="mini-btn">
          <Icon name="arrowDown" /> Jump to latest
        </button>
      </div>
      {reconnect ? (
        <div className="reconnect">
          <span className="spin" /> Reconnecting — backfilling 2 events…
        </div>
      ) : null}
      <div className="feed scroll" ref={feedRef} onScroll={onScroll}>
        <div className="feed-inner">
          {EVENTS.map((ev, i) => <EventCard key={i} ev={ev} onOpenArtifact={() => {}} />)}
        </div>
      </div>
      {showUnread ? (
        <button className="unread-pill" onClick={scrollToBottom}>
          <Icon name="arrowDown" /> New events
          <span className="n">3</span>
        </button>
      ) : null}
    </main>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState(TASKS.find(t => t.selected).id);
  return (
    <div className="app">
      <Header />
      <LeftPanel tasks={TASKS} selectedId={selectedId} onSelect={setSelectedId} />
      <CenterFeed />
      <RightPanel />
      <Footer />
    </div>
  );
}
