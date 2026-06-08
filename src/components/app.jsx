/* ============================================================
   AZKA.AI — App composition + center trace feed
   ============================================================ */
(function () {
  const { useState, useRef, useEffect } = React;
  const Icon = window.Icon;
  const EventCard = window.EventCard;
  const { Header, LeftPanel, RightPanel, Footer } = window.AzkaPanels;

  function CenterFeed() {
    const { EVENTS } = window.AZKA;
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

    return React.createElement('main', { className: 'center' },
      React.createElement('div', { className: 'trace-head' },
        React.createElement('span', { className: 't' }, 'Live Trace'),
        React.createElement('span', { className: 'live' }, React.createElement('span', { className: 'd' }), 'streaming'),
        React.createElement('span', { className: 'spacer' }),
        React.createElement('button', { className: 'mini-btn' },
          React.createElement(Icon, { name: 'minus' }), 'Collapse all'),
        React.createElement('button', { className: 'mini-btn' },
          React.createElement(Icon, { name: 'arrowDown' }), 'Jump to latest'),
      ),
      reconnect ? React.createElement('div', { className: 'reconnect' },
        React.createElement('span', { className: 'spin' }),
        'Reconnecting — backfilling 2 events…') : null,
      React.createElement('div', { className: 'feed scroll', ref: feedRef, onScroll },
        React.createElement('div', { className: 'feed-inner' },
          EVENTS.map((ev, i) => React.createElement(EventCard, { key: i, ev, onOpenArtifact: () => {} }))
        )
      ),
      showUnread ? React.createElement('button', { className: 'unread-pill', onClick: scrollToBottom },
        React.createElement(Icon, { name: 'arrowDown' }), 'New events',
        React.createElement('span', { className: 'n' }, '3')) : null,
    );
  }

  function App() {
    const { TASKS } = window.AZKA;
    const [selectedId, setSelectedId] = useState(TASKS.find(t => t.selected).id);
    return React.createElement('div', { className: 'app' },
      React.createElement(Header),
      React.createElement(LeftPanel, { tasks: TASKS, selectedId, onSelect: setSelectedId }),
      React.createElement(CenterFeed),
      React.createElement(RightPanel),
      React.createElement(Footer),
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();
