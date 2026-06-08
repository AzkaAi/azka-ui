/* ============================================================
   AZKA.AI — Header, Left, Right, Footer panels
   ============================================================ */
(function () {
  const { useState, useEffect, useRef } = React;
  const Icon = window.Icon;

  /* ---------- HEADER ---------- */
  function Header() {
    return React.createElement('header', { className: 'header' },
      React.createElement('div', { className: 'brand' },
        React.createElement('div', { className: 'brand-mark' }, React.createElement(Icon, { name: 'spark' })),
        React.createElement('div', { className: 'brand-name' }, 'AZKA',
          React.createElement('span', { className: 'dot' }, '.'),
          React.createElement('span', { className: 'ai' }, 'AI')),
      ),
      React.createElement('div', { className: 'header-sep' }),
      React.createElement('div', { className: 'header-task' },
        React.createElement('span', { className: 'label' }, 'Working on'),
        React.createElement('span', { className: 'name' }, 'Fix JWT token refresh race condition under load'),
        React.createElement('span', { className: 'tid' }, '#1847'),
      ),
      React.createElement('div', { className: 'status-ind' },
        React.createElement('span', { className: 'bars' },
          React.createElement('i'), React.createElement('i'), React.createElement('i'), React.createElement('i')),
        'Running'),
      React.createElement('div', { className: 'sandbox-meter' },
        React.createElement(Icon, { name: 'boxes', size: 13 }),
        React.createElement('span', { className: 'pips' },
          React.createElement('i', { className: 'on' }), React.createElement('i', { className: 'on' }),
          React.createElement('i', { className: 'on' }), React.createElement('i')),
        React.createElement('span', { className: 'mono' }, React.createElement('b', null, '3'), ' / 4'),
        ' sandboxes'),
      React.createElement('button', { className: 'icon-btn', title: 'Settings' }, React.createElement(Icon, { name: 'settings' })),
    );
  }

  /* ---------- LEFT PANEL ---------- */
  function TaskRow({ task, selected, onSelect }) {
    const stateLabel = { active: 'Active', completed: 'Completed', failed: 'Failed', awaiting: 'Awaiting Human' };
    return React.createElement('button', {
      className: 'task-row' + (selected ? ' sel' : ''), onClick: onSelect,
    },
      React.createElement('div', { className: 'task-row-top' },
        React.createElement('span', { className: 'badge ' + task.status },
          React.createElement('span', { className: 'bdot' }), stateLabel[task.status]),
        React.createElement('span', { className: 'spacer' }),
      ),
      React.createElement('div', { className: 'desc' }, task.desc),
      React.createElement('div', { className: 'task-row-meta' },
        React.createElement('span', { className: 'tid' }, task.id),
        React.createElement('span', { className: 'dot-sep' }),
        React.createElement('span', { className: 'elapsed' }, React.createElement(Icon, { name: 'clock' }), task.elapsed),
      ),
    );
  }

  function LeftPanel({ tasks, selectedId, onSelect }) {
    return React.createElement('aside', { className: 'left' },
      React.createElement('div', { className: 'submit-form' },
        React.createElement('div', { className: 'field' },
          React.createElement('div', { className: 'field-label' }, 'Task',
            React.createElement('span', { className: 'opt' }, 'plain English or issue URL')),
          React.createElement('textarea', {
            className: 'task-input', defaultValue: 'Fix JWT token refresh race condition causing intermittent 401s under load (#1847)',
          }),
        ),
        React.createElement('div', { className: 'field' },
          React.createElement('div', { className: 'field-label' }, 'Repository',
            React.createElement('span', { className: 'opt' }, 'optional')),
          React.createElement('div', { className: 'repo-input-wrap' },
            React.createElement('input', { className: 'repo-input', defaultValue: 'github.com/acme-corp/payments-api' }),
          ),
        ),
        React.createElement('button', { className: 'submit-btn' },
          React.createElement(Icon, { name: 'zap' }), 'Launch Agent'),
        React.createElement('div', { className: 'kbd-hint' },
          'Press ', React.createElement('span', { className: 'kbd' }, '⌘'), ' ',
          React.createElement('span', { className: 'kbd' }, '↵'), ' to submit'),
      ),
      React.createElement('div', { className: 'panel-head' },
        React.createElement('span', { className: 't' }, 'History'),
        React.createElement('span', { className: 'count' }, tasks.length),
      ),
      React.createElement('div', { className: 'task-list scroll' },
        tasks.map(t => React.createElement(TaskRow, {
          key: t.id, task: t, selected: t.id === selectedId, onSelect: () => onSelect(t.id),
        }))
      ),
    );
  }

  /* ---------- RIGHT PANEL ---------- */
  function FilesTab() {
    const { TREE, FILE_VIEW } = window.AZKA;
    const [sel, setSel] = useState('token-manager.ts');
    return React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'filetree scroll' },
        TREE.map((row, i) => {
          const isFolder = row.type === 'folder';
          const selected = !isFolder && row.name === sel;
          return React.createElement('div', {
            key: i, className: 'tree-row' + (isFolder ? ' folder' : '') + (selected ? ' sel' : ''),
            style: { paddingLeft: (7 + row.depth * 15) + 'px' },
            onClick: () => !isFolder && setSel(row.name),
          },
            React.createElement('span', { className: 'tw' },
              isFolder ? React.createElement(Icon, { name: row.open ? 'chevD' : 'chevR' }) : null),
            React.createElement('span', { className: 'fi' },
              React.createElement(Icon, { name: isFolder ? (row.open ? 'folderOpen' : 'folder') : 'fileCode' })),
            React.createElement('span', { className: 'nm' }, row.name),
            row.modified ? React.createElement('span', { className: 'mod', title: 'Modified' }) : null,
          );
        })
      ),
      React.createElement('div', { className: 'fileview' },
        React.createElement('div', { className: 'fileview-head' },
          React.createElement('span', { className: 'fp' },
            React.createElement('span', { className: 'dir' }, FILE_VIEW.dir), FILE_VIEW.name),
          FILE_VIEW.modified ? React.createElement('span', { className: 'badge-mod' }, 'Modified') : null,
          React.createElement('span', { className: 'spacer' }),
          React.createElement('span', { className: 'lines' }, FILE_VIEW.lineCount + ' lines'),
        ),
        React.createElement('div', { className: 'fileview-body scroll' },
          React.createElement('div', { className: 'codeblock' },
            FILE_VIEW.code.map((r, i) => React.createElement('div', { className: 'code-row', key: i },
              React.createElement('span', { className: 'ln' }, r.n),
              React.createElement('span', { className: 'lc', dangerouslySetInnerHTML: { __html: r.html || '\u200b' } }),
            ))
          )
        ),
      ),
    );
  }

  function ArtifactsTab() {
    const { ARTIFACTS } = window.AZKA;
    return React.createElement('div', { className: 'artifacts-list scroll' },
      ARTIFACTS.map((a, i) => React.createElement('div', { className: 'art-card', key: i },
        React.createElement('div', { className: 'artifact-ico' }, React.createElement(Icon, { name: 'fileText' })),
        React.createElement('div', { className: 'artifact-info' },
          React.createElement('div', { className: 'fn' }, a.filename),
          React.createElement('div', { className: 'meta' }, a.format + ' · ' + a.size)),
        React.createElement('button', { className: 'icon-btn', title: 'Download' }, React.createElement(Icon, { name: 'download' })),
      ))
    );
  }

  function MctsTab() {
    const { MCTS_TREE } = window.AZKA;
    const stateColor = { root: '#64748b', failed: '#e0473e', explored: '#8b5cf6', active: '#4f6ef2', win: '#18a558' };
    const byId = {}; MCTS_TREE.nodes.forEach(n => byId[n.id] = n);
    return React.createElement('div', { className: 'mcts-tab' },
      React.createElement('div', { className: 'mcts-toolbar' },
        React.createElement('div', { className: 'z' },
          React.createElement('button', { className: 'icon-btn', title: 'Zoom out' }, React.createElement(Icon, { name: 'minus' })),
          React.createElement('button', { className: 'icon-btn', title: 'Zoom in' }, React.createElement(Icon, { name: 'plus' })),
          React.createElement('button', { className: 'icon-btn', title: 'Fit' }, React.createElement(Icon, { name: 'expand' })),
        ),
        React.createElement('span', { className: 'spacer' }),
        React.createElement('div', { className: 'legend' },
          React.createElement('span', null, React.createElement('span', { className: 'nd', style: { background: '#4f6ef2' } }), 'active'),
          React.createElement('span', null, React.createElement('span', { className: 'nd', style: { background: '#18a558' } }), 'win'),
          React.createElement('span', null, React.createElement('span', { className: 'nd', style: { background: '#e0473e' } }), 'failed'),
        ),
      ),
      React.createElement('div', { className: 'mcts-canvas' },
        React.createElement('svg', { width: '100%', height: '100%', viewBox: '0 0 372 260', style: { display: 'block' } },
          MCTS_TREE.edges.map((e, i) => {
            const a = byId[e[0]], b = byId[e[1]];
            return React.createElement('path', {
              key: i, d: `M${a.x} ${a.y+16} C ${a.x} ${(a.y+b.y)/2}, ${b.x} ${(a.y+b.y)/2}, ${b.x} ${b.y-16}`,
              fill: 'none', stroke: b.state === 'win' ? '#18a558' : b.state === 'active' ? '#4f6ef2' : '#d3d6de',
              strokeWidth: b.state === 'win' || b.state === 'active' ? 2 : 1.4,
              strokeDasharray: b.state === 'failed' ? '3 3' : 'none',
            });
          }),
          MCTS_TREE.nodes.map((n, i) => {
            const col = stateColor[n.state];
            const isWin = n.state === 'win', isActive = n.state === 'active';
            return React.createElement('g', { key: i, transform: `translate(${n.x},${n.y})` },
              (isWin || isActive) ? React.createElement('circle', { r: 17, fill: col, opacity: 0.12 }) : null,
              React.createElement('circle', {
                r: 13, fill: '#fff', stroke: col, strokeWidth: isWin || isActive ? 2.5 : 1.6,
                strokeDasharray: n.state === 'failed' ? '3 2' : 'none',
              }),
              isWin ? React.createElement('path', { d: 'M-4 0 L-1 3 L5 -4', fill: 'none', stroke: col, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
                    : React.createElement('text', { textAnchor: 'middle', dy: '3.5', className: 'node-label', fill: col, fontWeight: 600 }, n.label),
              React.createElement('text', { textAnchor: 'middle', y: 27, className: 'node-label', fill: '#8a909c' }, n.commit),
              n.score !== '—' ? React.createElement('text', { textAnchor: 'middle', y: 38, className: 'node-label', fill: col, fontWeight: 600 }, n.score) : null,
            );
          }),
        ),
        React.createElement('div', { style: { position: 'absolute', bottom: 10, left: 12, fontSize: '10.5px', color: 'var(--text-3)', fontFamily: 'var(--mono)' } },
          '7 nodes · depth 2 · drag to pan · scroll to zoom'),
      ),
    );
  }

  function MetricsTab() {
    const { METRICS } = window.AZKA;
    return React.createElement('div', { className: 'metrics scroll' },
      React.createElement('div', { className: 'metric-section-t' }, 'Token Usage'),
      React.createElement('div', { className: 'metric-grid' },
        React.createElement('div', { className: 'mcard' },
          React.createElement('div', { className: 'mk' }, React.createElement(Icon, { name: 'arrowDown' }), 'Input tokens'),
          React.createElement('div', { className: 'mv' }, METRICS.inputTokens)),
        React.createElement('div', { className: 'mcard' },
          React.createElement('div', { className: 'mk' }, React.createElement(Icon, { name: 'arrowRight' }), 'Output tokens'),
          React.createElement('div', { className: 'mv' }, METRICS.outputTokens)),
        React.createElement('div', { className: 'mcard' },
          React.createElement('div', { className: 'mk' }, React.createElement(Icon, { name: 'dollar' }), 'Est. cost'),
          React.createElement('div', { className: 'mv accent' }, METRICS.cost),
          React.createElement('div', { className: 'msub up' }, 'updating live')),
        React.createElement('div', { className: 'mcard' },
          React.createElement('div', { className: 'mk' }, React.createElement(Icon, { name: 'gauge' }), 'Avg LLM latency'),
          React.createElement('div', { className: 'mv' }, METRICS.avgLatency, React.createElement('small', null, ' ms'))),
      ),
      React.createElement('div', { className: 'metric-section-t' }, 'Tool Calls'),
      React.createElement('div', { className: 'bar-list' },
        METRICS.toolCalls.map((t, i) => React.createElement('div', { className: 'bar-item', key: i },
          React.createElement('div', { className: 'bar-top' },
            React.createElement('span', { className: 'nm' }, React.createElement(Icon, { name: t.icon }), t.name),
            React.createElement('span', { className: 'ct' }, t.count)),
          React.createElement('div', { className: 'bar-track' },
            React.createElement('div', { className: 'bar-fill ' + t.color, style: { width: t.pct + '%' } })),
        ))
      ),
      React.createElement('div', { className: 'metric-section-t' }, 'Time by Phase'),
      React.createElement('div', { className: 'phase-bar' },
        METRICS.phases.map((p, i) => React.createElement('div', {
          key: i, className: 'phase-seg ' + p.key, style: { width: p.pct + '%' },
        }, p.pct + '%'))
      ),
      React.createElement('div', { className: 'phase-legend' },
        METRICS.phases.map((p, i) => React.createElement('span', { key: i },
          React.createElement('span', { className: 'sw', style: { background: p.key === 'loc' ? 'var(--accent)' : p.key === 'patch' ? 'var(--violet)' : 'var(--green)' } }),
          p.name, ' · ', React.createElement('span', { className: 'mono', style: { color: 'var(--text-3)' } }, p.time))),
      ),
    );
  }

  function RightPanel() {
    const [tab, setTab] = useState('files');
    const tabs = [
      { id: 'files', label: 'Files', icon: 'folderTree', count: '4' },
      { id: 'artifacts', label: 'Artifacts', icon: 'package', count: '3' },
      { id: 'mcts', label: 'MCTS Tree', icon: 'sitemap', count: '7' },
      { id: 'metrics', label: 'Metrics', icon: 'gauge', count: null },
    ];
    return React.createElement('aside', { className: 'right' },
      React.createElement('div', { className: 'tabbar' },
        tabs.map(t => React.createElement('button', {
          key: t.id, className: 'tab' + (tab === t.id ? ' active' : ''), onClick: () => setTab(t.id),
        },
          React.createElement(Icon, { name: t.icon }), t.label,
          t.count ? React.createElement('span', { className: 'tcount' }, t.count) : null,
        ))
      ),
      React.createElement('div', { className: 'right-body' },
        tab === 'files' ? React.createElement(FilesTab) :
        tab === 'artifacts' ? React.createElement(ArtifactsTab) :
        tab === 'mcts' ? React.createElement(MctsTab) :
        React.createElement(MetricsTab),
      ),
    );
  }

  /* ---------- FOOTER ---------- */
  function Footer() {
    const { FOOTER } = window.AZKA;
    const [tokens, setTokens] = useState(FOOTER.tokens);
    const [secs, setSecs] = useState(281);
    const [turn, setTurn] = useState(FOOTER.turn);
    useEffect(() => {
      const id = setInterval(() => {
        setTokens(t => t + Math.floor(Math.random() * 240 + 40));
        setSecs(s => s + 1);
        if (Math.random() < 0.18) setTurn(t => t + 1);
      }, 1000);
      return () => clearInterval(id);
    }, []);
    const cost = (tokens / 184920 * 0.47);
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return React.createElement('footer', { className: 'footer' },
      React.createElement('div', { className: 'foot-item foot-model' },
        React.createElement('span', { className: 'md' }),
        React.createElement('span', { className: 'fk' }, 'Model'),
        React.createElement('span', { className: 'fv' }, FOOTER.model)),
      React.createElement('div', { className: 'foot-sep' }),
      React.createElement('div', { className: 'foot-item' },
        React.createElement('div', { className: 'foot-phase patch' },
          React.createElement('span', { className: 'pd' }), 'Patch Engineering')),
      React.createElement('div', { className: 'foot-sep' }),
      React.createElement('div', { className: 'foot-item' },
        React.createElement('span', { className: 'fk' }, 'Turn'),
        React.createElement('span', { className: 'fv tick' }, turn)),
      React.createElement('div', { className: 'foot-sep' }),
      React.createElement('div', { className: 'foot-item' },
        React.createElement(Icon, { name: 'boxes' }),
        React.createElement('span', { className: 'fk' }, 'Sandboxes'),
        React.createElement('span', { className: 'fv' }, FOOTER.sandboxes)),
      React.createElement('div', { className: 'foot-spacer' }),
      React.createElement('div', { className: 'foot-item' },
        React.createElement(Icon, { name: 'coins' }),
        React.createElement('span', { className: 'fk' }, 'Tokens'),
        React.createElement('span', { className: 'fv tick' }, tokens.toLocaleString())),
      React.createElement('div', { className: 'foot-sep' }),
      React.createElement('div', { className: 'foot-item' },
        React.createElement('span', { className: 'fk' }, 'Cost'),
        React.createElement('span', { className: 'fv tick' }, '$' + cost.toFixed(2))),
      React.createElement('div', { className: 'foot-sep' }),
      React.createElement('div', { className: 'foot-item' },
        React.createElement(Icon, { name: 'timer' }),
        React.createElement('span', { className: 'fk' }, 'Elapsed'),
        React.createElement('span', { className: 'fv tick' }, mm + ':' + ss)),
    );
  }

  window.AzkaPanels = { Header, LeftPanel, RightPanel, Footer };
})();
