/* ============================================================
   AZKA.AI — the 12 event card types
   ============================================================ */
(function () {
  const { useState } = React;
  const Icon = window.Icon;

  // Generic collapsible shell ---------------------------------
  function Shell({ hueClass, icoClass, icon, type, title, meta, defaultOpen, collapsible = true, children }) {
    const [open, setOpen] = useState(!!defaultOpen);
    const isOpen = collapsible ? open : true;
    return (
      React.createElement('div', { className: 'card ' + hueClass + (isOpen ? ' open' : '') },
        React.createElement('button', {
          className: 'card-head', onClick: () => collapsible && setOpen(o => !o),
          style: collapsible ? null : { cursor: 'default' },
        },
          React.createElement('span', { className: 'card-ico ' + icoClass }, React.createElement(Icon, { name: icon })),
          React.createElement('span', { className: 'card-type' }, type),
          React.createElement('span', { className: 'card-title' }, title),
          meta ? React.createElement('span', { className: 'card-meta' }, meta) : null,
          collapsible ? React.createElement('span', { className: 'chev' }, React.createElement(Icon, { name: 'chevR' })) : null,
        ),
        isOpen && children ? React.createElement('div', { className: 'card-body' }, children) : null,
      )
    );
  }

  // 1 · Thinking ----------------------------------------------
  function ThinkingCard({ ev }) {
    const [open, setOpen] = useState(!!ev.open);
    return React.createElement('div', { className: 'card thinking' + (open ? ' open' : '') },
      React.createElement('button', { className: 'card-head', onClick: () => setOpen(o => !o) },
        React.createElement('span', { className: 'card-ico ico-violet' }, React.createElement(Icon, { name: 'brain' })),
        React.createElement('span', { className: 'card-type' }, 'Thinking'),
        React.createElement('span', { className: 'card-title' }, open ? '' : 'Reasoning about the refresh race…'),
        React.createElement('span', { className: 'chev' }, React.createElement(Icon, { name: 'chevR' })),
      ),
      open ? React.createElement('div', { className: 'card-body' },
        React.createElement('p', { className: 'think-text', dangerouslySetInnerHTML: { __html: ev.text } })
      ) : null,
    );
  }

  // 2 · View File ---------------------------------------------
  function ViewCard({ ev }) {
    return React.createElement(Shell, {
      hueClass: 'h-view', icoClass: 'ico-slate', icon: 'fileText', type: 'View File',
      defaultOpen: ev.open,
      title: React.createElement('span', { className: 'path' }, ev.path),
      meta: React.createElement(React.Fragment, null,
        React.createElement('span', { className: 'pill' }, ev.lang),
        React.createElement('span', null, 'L' + ev.lines),
      ),
    },
      React.createElement('div', { className: 'codeblock scroll' },
        ev.code.map((r, i) => React.createElement('div', { className: 'code-row', key: i },
          React.createElement('span', { className: 'ln' }, r.n),
          React.createElement('span', { className: 'lc', dangerouslySetInnerHTML: { __html: r.html || '\u200b' } }),
        ))
      )
    );
  }

  // 3 · Edit File ---------------------------------------------
  function EditCard({ ev }) {
    const ok = ev.result === 'ok';
    return React.createElement(Shell, {
      hueClass: 'h-edit', icoClass: 'ico-accent', icon: 'filePen', type: 'Edit File',
      defaultOpen: ev.open,
      title: React.createElement('span', { className: 'path' }, ev.path),
      meta: React.createElement(React.Fragment, null,
        React.createElement('span', { style: { color: 'var(--green-text)', fontFamily: 'var(--mono)', fontSize: '11px' } }, '+' + ev.added),
        React.createElement('span', { style: { color: 'var(--red-text)', fontFamily: 'var(--mono)', fontSize: '11px' } }, '\u2212' + ev.removed),
        React.createElement('span', { className: 'exit ' + (ok ? 'ok' : 'fail') },
          React.createElement(Icon, { name: ok ? 'check' : 'x' }), ok ? 'applied' : 'failed'),
      ),
    },
      React.createElement('div', { className: 'diff' },
        React.createElement('div', { className: 'diff-hunk' }, ev.hunk),
        ev.diff.map((r, i) => React.createElement('div', { className: 'diff-row ' + r.k, key: i },
          React.createElement('span', { className: 'ln' }, r.n),
          React.createElement('span', { className: 'sign' }, r.s),
          React.createElement('span', { className: 'lc' }, r.t || '\u200b'),
        ))
      )
    );
  }

  // 4 · Run Command -------------------------------------------
  function RunCard({ ev }) {
    const ok = ev.exit === 0;
    return React.createElement(Shell, {
      hueClass: 'h-run', icoClass: 'ico-dark', icon: 'terminal', type: 'Run',
      defaultOpen: ev.open,
      title: React.createElement('span', { className: 'mono' }, ev.cmd),
      meta: React.createElement(React.Fragment, null,
        React.createElement('span', { style: { fontSize: '11px' } }, ev.duration),
        React.createElement('span', { className: 'exit ' + (ok ? 'ok' : 'fail') },
          React.createElement(Icon, { name: ok ? 'check' : 'x' }), 'exit ' + ev.exit),
      ),
    },
      React.createElement('div', { className: 'terminal scroll' },
        ev.lines.map((l, i) => React.createElement('div', {
          key: i, className: l.c === 'cmd' ? 'cmd-line' : 'o',
          dangerouslySetInnerHTML: { __html: l.html || '\u200b' },
        }))
      )
    );
  }

  // 5 · Search Directory --------------------------------------
  function SearchCard({ ev }) {
    return React.createElement(Shell, {
      hueClass: 'h-search', icoClass: 'ico-cyan', icon: 'search', type: 'Search',
      defaultOpen: ev.open,
      title: React.createElement(React.Fragment, null,
        React.createElement('span', { className: 'q' }, '"' + ev.query + '"'),
        React.createElement('span', { style: { color: 'var(--text-4)', marginLeft: '7px', fontFamily: 'var(--mono)', fontSize: '11px' } }, 'in ' + ev.scope)),
      meta: React.createElement('span', { className: 'pill' }, ev.results.length + ' files'),
    },
      React.createElement('div', { className: 'match-list' },
        ev.results.map((r, i) => React.createElement('div', { className: 'match-row', key: i },
          React.createElement(Icon, { name: 'fileCode' }),
          React.createElement('span', null, r.path),
          React.createElement('span', { className: 'hit' }, r.hits + ' match' + (r.hits > 1 ? 'es' : '')),
        ))
      )
    );
  }

  // 6 · Web Research ------------------------------------------
  function WebCard({ ev }) {
    return React.createElement(Shell, {
      hueClass: 'h-web', icoClass: 'ico-teal', icon: 'globe', type: 'Web Research',
      defaultOpen: ev.open,
      title: React.createElement('span', { className: 'mono', style: { color: 'var(--text-2)' } }, ev.url),
      meta: ev.truncated ? React.createElement('span', { className: 'truncated-note' },
        React.createElement(Icon, { name: 'minus', size: 10 }), 'clipped') : null,
    },
      React.createElement('div', { className: 'web-clip' },
        React.createElement('div', { style: { fontWeight: 600, color: 'var(--text)', marginBottom: '7px', fontSize: '13px' } }, ev.title),
        ev.paras.map((p, i) => React.createElement('p', { key: i }, p)),
        React.createElement('div', { className: 'web-meta' },
          React.createElement(Icon, { name: 'globe', size: 12 }),
          React.createElement('span', null, new URL(ev.url).hostname),
          ev.truncated ? React.createElement('span', { className: 'truncated-note', style: { marginLeft: 'auto' } },
            'content truncated at 4,000 tokens') : null,
        )
      )
    );
  }

  // 7 · Artifact ----------------------------------------------
  function ArtifactCard({ ev, onOpen }) {
    return React.createElement(Shell, {
      hueClass: 'h-artifact', icoClass: 'ico-accent', icon: 'fileOut', type: 'Artifact',
      defaultOpen: ev.open,
      title: React.createElement(React.Fragment, null,
        React.createElement('span', { className: 'mono' }, ev.filename),
        React.createElement('span', { style: { color: 'var(--text-4)', marginLeft: '7px', fontSize: '11px' } }, ev.format)),
    },
      React.createElement('div', { className: 'artifact-row' },
        React.createElement('div', { className: 'artifact-ico' }, React.createElement(Icon, { name: 'fileText' })),
        React.createElement('div', { className: 'artifact-info' },
          React.createElement('div', { className: 'fn' }, ev.filename),
          React.createElement('div', { className: 'meta' }, ev.format + ' · ' + ev.size + ' · generated by agent'),
        ),
        React.createElement('button', { className: 'btn-secondary', onClick: onOpen },
          React.createElement(Icon, { name: 'eye' }), 'Open in viewer'),
      )
    );
  }

  // 8 · Observation -------------------------------------------
  function ObservationCard({ ev }) {
    return React.createElement(Shell, {
      hueClass: 'h-obs', icoClass: 'ico-gray', icon: 'braces', type: 'Observation',
      defaultOpen: ev.open,
      title: React.createElement('span', { style: { color: 'var(--text-3)' } }, 'Raw tool result'),
      meta: React.createElement('span', { className: 'pill' }, 'debug'),
    },
      React.createElement('pre', { className: 'json scroll', dangerouslySetInnerHTML: { __html: ev.json.join('\n') } })
    );
  }

  // 9 · System Interrupt --------------------------------------
  function InterruptCard({ ev }) {
    return React.createElement('div', { className: 'card interrupt' },
      React.createElement('div', { className: 'interrupt-head' },
        React.createElement('div', { className: 'ico' }, React.createElement(Icon, { name: 'refresh' })),
        React.createElement('div', { className: 'interrupt-body' },
          React.createElement('div', { className: 't' }, 'System Interrupt · Strategy Changed'),
          React.createElement('div', { className: 'msg' }, ev.msg),
          React.createElement('div', { className: 'strat' },
            React.createElement('span', { className: 'from' }, ev.from),
            React.createElement(Icon, { name: 'arrowRight' }),
            React.createElement('span', { className: 'to' }, ev.to),
          ),
        ),
      ),
    );
  }

  // 10 · Human Required ---------------------------------------
  function HumanCard({ ev }) {
    const [val, setVal] = useState('');
    return React.createElement('div', { className: 'card human' },
      React.createElement('div', { className: 'human-top' },
        React.createElement('div', { className: 'ico' }, React.createElement(Icon, { name: 'helpCircle' })),
        React.createElement('div', { className: 't' }, 'Human Required'),
        React.createElement('div', { className: 'pulse-tag' },
          React.createElement('span', { className: 'd' }), 'Agent paused — waiting for you'),
      ),
      React.createElement('div', { className: 'human-body' },
        React.createElement('div', { className: 'human-q' },
          ev.question, ' ',
          React.createElement('span', { className: 'ctx' }, ev.ctx), ' ', ev.tail),
        React.createElement('div', { className: 'human-input-row' },
          React.createElement('input', {
            className: 'human-input', placeholder: 'Type your answer…',
            value: val, onChange: e => setVal(e.target.value), autoFocus: false,
          }),
          React.createElement('button', { className: 'human-send' },
            React.createElement(Icon, { name: 'send' }), 'Send'),
        ),
        React.createElement('div', { className: 'human-hint' },
          React.createElement('span', null, React.createElement(Icon, { name: 'bell', size: 12 }), 'Browser notified'),
          React.createElement('span', null, React.createElement(Icon, { name: 'volume', size: 12 }), 'Sound played'),
          React.createElement('span', null, React.createElement('span', { className: 'kbd' }, '⌘'), React.createElement('span', { className: 'kbd' }, '↵'), 'to send'),
        ),
      ),
    );
  }

  // 11 · MCTS Branch ------------------------------------------
  function MctsCard({ ev }) {
    return React.createElement(Shell, {
      hueClass: 'h-search mcts', icoClass: 'ico-cyan', icon: 'gitBranch', type: 'MCTS Branch',
      defaultOpen: ev.open,
      title: React.createElement(React.Fragment, null,
        React.createElement('span', { style: { color: 'var(--text)', fontWeight: 500 } }, 'Opened '),
        React.createElement('span', { className: 'mono' }, ev.branch)),
      meta: React.createElement('span', { className: 'pill', style: { color: 'var(--cyan)' } }, 'score ' + ev.score),
    },
      React.createElement('div', { className: 'mcts-grid' },
        React.createElement('div', { className: 'mcts-cell' },
          React.createElement('div', { className: 'k' }, 'Branch'),
          React.createElement('div', { className: 'v' }, ev.branch)),
        React.createElement('div', { className: 'mcts-cell' },
          React.createElement('div', { className: 'k' }, 'Commit'),
          React.createElement('div', { className: 'v' }, ev.commit)),
        React.createElement('div', { className: 'mcts-cell' },
          React.createElement('div', { className: 'k' }, 'Depth'),
          React.createElement('div', { className: 'v' }, 'd' + ev.depth)),
        React.createElement('div', { className: 'mcts-cell' },
          React.createElement('div', { className: 'k' }, 'Score'),
          React.createElement('div', { className: 'v score' }, ev.score.toFixed(2))),
      )
    );
  }

  // 12 · Finish -----------------------------------------------
  function FinishCard({ ev }) {
    return React.createElement('div', { className: 'card finish' },
      React.createElement('div', { className: 'finish-top' },
        React.createElement('div', { className: 'finish-badge' }, React.createElement(Icon, { name: 'check' })),
        React.createElement('div', null,
          React.createElement('div', { className: 't' }, 'Task Complete'),
          React.createElement('div', { className: 'sub' }, 'Agent finished successfully · 2 files changed'),
        ),
      ),
      React.createElement('div', { className: 'finish-summary' },
        ev.summary,
        React.createElement('ul', null, ev.bullets.map((b, i) => React.createElement('li', { key: i }, b))),
      ),
      React.createElement('div', { className: 'finish-stats' },
        React.createElement('div', { className: 'fstat' },
          React.createElement('div', { className: 'k' }, React.createElement(Icon, { name: 'coins' }), 'Tokens'),
          React.createElement('div', { className: 'v' }, ev.tokens)),
        React.createElement('div', { className: 'fstat' },
          React.createElement('div', { className: 'k' }, React.createElement(Icon, { name: 'dollar' }), 'Cost'),
          React.createElement('div', { className: 'v' }, ev.cost)),
        React.createElement('div', { className: 'fstat' },
          React.createElement('div', { className: 'k' }, React.createElement(Icon, { name: 'timer' }), 'Time'),
          React.createElement('div', { className: 'v' }, ev.time)),
      ),
    );
  }

  // Dispatcher -------------------------------------------------
  function EventCard({ ev, onOpenArtifact }) {
    switch (ev.type) {
      case 'thinking':   return React.createElement(ThinkingCard, { ev });
      case 'view':       return React.createElement(ViewCard, { ev });
      case 'edit':       return React.createElement(EditCard, { ev });
      case 'run':        return React.createElement(RunCard, { ev });
      case 'search':     return React.createElement(SearchCard, { ev });
      case 'web':        return React.createElement(WebCard, { ev });
      case 'artifact':   return React.createElement(ArtifactCard, { ev, onOpen: onOpenArtifact });
      case 'observation':return React.createElement(ObservationCard, { ev });
      case 'interrupt':  return React.createElement(InterruptCard, { ev });
      case 'human':      return React.createElement(HumanCard, { ev });
      case 'mcts':       return React.createElement(MctsCard, { ev });
      case 'finish':     return React.createElement(FinishCard, { ev });
      default: return null;
    }
  }

  window.EventCard = EventCard;
})();
