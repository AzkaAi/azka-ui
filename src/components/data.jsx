/* ============================================================
   AZKA.AI — placeholder data
   ============================================================ */
(function () {

  const TASKS = [
    {
      id: 'tsk_9f3a',
      desc: 'Fix JWT token refresh race condition causing intermittent 401s under load (#1847)',
      repo: 'acme-corp/payments-api',
      status: 'active',
      elapsed: '4m 12s',
      selected: true,
    },
    {
      id: 'tsk_7c1d',
      desc: 'Add pagination to the /transactions list endpoint and update OpenAPI spec',
      repo: 'acme-corp/payments-api',
      status: 'awaiting',
      elapsed: '11m 38s',
      selected: false,
    },
    {
      id: 'tsk_4e8b',
      desc: 'Migrate legacy Stripe webhook handler to the new idempotency-key scheme',
      repo: 'acme-corp/billing-svc',
      status: 'completed',
      elapsed: '8m 02s',
      selected: false,
    },
    {
      id: 'tsk_2a6f',
      desc: 'Investigate flaky e2e test in checkout flow — payment_intent.confirm timeout',
      repo: 'acme-corp/web-checkout',
      status: 'failed',
      elapsed: '6m 47s',
      selected: false,
    },
  ];

  // ---- The live trace: every event is a card ----
  const EVENTS = [
    {
      type: 'thinking',
      open: true,
      text: 'The issue report mentions intermittent <em>401 Unauthorized</em> under concurrent load. That smells like a race in the refresh path — two requests both seeing an expired token and racing to refresh, where the second clobbers the first. Let me start by locating the token refresh logic before forming a patch.',
    },
    {
      type: 'search',
      open: false,
      query: 'refreshAccessToken',
      scope: 'src/**/*.ts',
      results: [
        { path: 'src/auth/token-manager.ts', hits: 3 },
        { path: 'src/auth/middleware.ts', hits: 1 },
        { path: 'src/auth/__tests__/token-manager.test.ts', hits: 5 },
        { path: 'src/http/interceptors.ts', hits: 2 },
      ],
    },
    {
      type: 'view',
      open: true,
      path: 'src/auth/token-manager.ts',
      lang: 'ts',
      lines: '38–54',
      code: [
        { n: 38, html: '<span class="tok-key">async</span> <span class="tok-fn">refreshAccessToken</span>() {' },
        { n: 39, html: '  <span class="tok-key">if</span> (<span class="tok-num">Date</span>.now() &lt; <span class="tok-key">this</span>.expiresAt) {' },
        { n: 40, html: '    <span class="tok-key">return</span> <span class="tok-key">this</span>.accessToken;' },
        { n: 41, html: '  }' },
        { n: 42, html: '  <span class="tok-com">// no guard against concurrent callers</span>' },
        { n: 43, html: '  <span class="tok-key">const</span> res = <span class="tok-key">await</span> <span class="tok-fn">fetch</span>(<span class="tok-str">`/oauth/refresh`</span>, {' },
        { n: 44, html: '    method: <span class="str">\'POST\'</span>,' },
        { n: 45, html: '    body: <span class="tok-num">JSON</span>.<span class="tok-fn">stringify</span>({ token: <span class="tok-key">this</span>.refreshToken }),' },
        { n: 46, html: '  });' },
        { n: 47, html: '  <span class="tok-key">const</span> data = <span class="tok-key">await</span> res.<span class="tok-fn">json</span>();' },
        { n: 48, html: '  <span class="tok-key">this</span>.accessToken = data.access_token;' },
        { n: 49, html: '  <span class="tok-key">this</span>.refreshToken = data.refresh_token;' },
        { n: 50, html: '  <span class="tok-key">this</span>.expiresAt = <span class="tok-num">Date</span>.now() + data.expires_in * <span class="tok-num">1000</span>;' },
        { n: 51, html: '  <span class="tok-key">return</span> <span class="tok-key">this</span>.accessToken;' },
        { n: 52, html: '}' },
      ],
    },
    {
      type: 'thinking',
      open: false,
      text: 'Confirmed. Line 42 has the bug: there is no in-flight guard. When N requests arrive with an expired token, all N call <em>/oauth/refresh</em>. The server rotates the refresh token on each call, so requests 2..N submit a now-invalidated refresh token and get a 401. Fix: memoize the in-flight refresh promise so concurrent callers await the same request.',
    },
    {
      type: 'edit',
      open: true,
      path: 'src/auth/token-manager.ts',
      result: 'ok',
      added: 6, removed: 1,
      hunk: '@@ -38,7 +38,12 @@ class TokenManager {',
      diff: [
        { k: 'ctx', n: '38', s: ' ', t: '  async refreshAccessToken() {' },
        { k: 'ctx', n: '39', s: ' ', t: '    if (Date.now() < this.expiresAt) return this.accessToken;' },
        { k: 'del', n: '42', s: '-', t: '    // no guard against concurrent callers' },
        { k: 'add', n: '42', s: '+', t: '    // collapse concurrent refreshes onto one in-flight promise' },
        { k: 'add', n: '43', s: '+', t: '    if (this.inFlight) return this.inFlight;' },
        { k: 'add', n: '44', s: '+', t: '    this.inFlight = this._doRefresh().finally(() => {' },
        { k: 'add', n: '45', s: '+', t: '      this.inFlight = null;' },
        { k: 'add', n: '46', s: '+', t: '    });' },
        { k: 'add', n: '47', s: '+', t: '    return this.inFlight;' },
        { k: 'ctx', n: '48', s: ' ', t: '  }' },
      ],
    },
    {
      type: 'run',
      open: true,
      cmd: 'pnpm test src/auth/__tests__/token-manager.test.ts',
      exit: 1,
      duration: '3.4s',
      lines: [
        { c: 'cmd', html: '<span class="p">~/payments-api</span> $ pnpm test src/auth/__tests__/token-manager.test.ts' },
        { c: 'o', html: '<span class="t-dim">RUN</span>  v2.1.4  /home/sandbox/payments-api' },
        { c: 'o', html: '' },
        { c: 'o', html: ' <span class="t-green">✓</span> returns cached token before expiry <span class="t-dim">(2ms)</span>' },
        { c: 'o', html: ' <span class="t-red">✗</span> collapses concurrent refreshes <span class="t-dim">(14ms)</span>' },
        { c: 'o', html: '   <span class="t-red">AssertionError</span>: expected fetch to be called <span class="t-bold">1</span> time, got <span class="t-bold">4</span>' },
        { c: 'o', html: '   <span class="t-dim">❯ token-manager.test.ts:61:23</span>' },
        { c: 'o', html: '' },
        { c: 'o', html: ' <span class="t-red">Test Files</span>  1 failed (1)' },
        { c: 'o', html: ' <span class="t-dim">Tests</span>  <span class="t-red">1 failed</span> | <span class="t-green">1 passed</span> (2)' },
      ],
    },
    {
      type: 'observation',
      open: false,
      json: [
        '{',
        '  <span class="jk">"tool"</span>: <span class="js">"run_command"</span>,',
        '  <span class="jk">"exit_code"</span>: <span class="jn">1</span>,',
        '  <span class="jk">"duration_ms"</span>: <span class="jn">3412</span>,',
        '  <span class="jk">"stdout_bytes"</span>: <span class="jn">2048</span>,',
        '  <span class="jk">"failing_test"</span>: <span class="js">"collapses concurrent refreshes"</span>,',
        '  <span class="jk">"assertion"</span>: {',
        '    <span class="jk">"expected"</span>: <span class="jn">1</span>, <span class="jk">"actual"</span>: <span class="jn">4</span>,',
        '    <span class="jk">"matcher"</span>: <span class="js">"toHaveBeenCalledTimes"</span>',
        '  },',
        '  <span class="jk">"truncated"</span>: <span class="jb">false</span>',
        '}',
      ],
    },
    {
      type: 'thinking',
      open: false,
      text: 'The test still sees 4 fetch calls. My guard reads <em>this.inFlight</em> but the field was never declared on the class, so it is <em>undefined</em> on every entry. I need to initialise <em>inFlight = null</em> in the constructor and refactor the body into <em>_doRefresh()</em>. Let me make that follow-up edit.',
    },
    {
      type: 'web',
      open: false,
      url: 'https://datatracker.ietf.org/doc/html/rfc6749#section-1.5',
      title: 'RFC 6749 — The OAuth 2.0 Authorization Framework',
      truncated: true,
      paras: [
        'Refresh tokens are issued to the client by the authorization server and are used to obtain a new access token when the current access token becomes invalid or expires.',
        'The authorization server MAY issue a new refresh token, in which case the client MUST discard the old refresh token and replace it with the new one — confirming that token rotation is expected behaviour here.',
      ],
    },
    {
      type: 'mcts',
      open: false,
      branch: 'branch-c',
      commit: 'a4f9e21b',
      depth: 3,
      score: 0.82,
    },
    {
      type: 'interrupt',
      open: true,
      msg: 'Detected a repeating action loop — the same test command was re-run 3 times with an identical failing assertion and no intervening edit.',
      from: 're-run verification',
      to: 'inspect class fields & refactor',
    },
    {
      type: 'edit',
      open: false,
      path: 'src/auth/token-manager.ts',
      result: 'ok',
      added: 9, removed: 4,
      hunk: '@@ -12,6 +12,8 @@ class TokenManager {',
      diff: [
        { k: 'ctx', n: '12', s: ' ', t: '  private expiresAt = 0;' },
        { k: 'add', n: '13', s: '+', t: '  private inFlight: Promise<string> | null = null;' },
        { k: 'ctx', n: '14', s: ' ', t: '' },
        { k: 'ctx', n: '50', s: ' ', t: '  private async _doRefresh(): Promise<string> {' },
        { k: 'del', n: '51', s: '-', t: '    const res = await fetch(`/oauth/refresh`, {' },
        { k: 'add', n: '51', s: '+', t: '    const res = await fetch(`/oauth/refresh`, {' },
        { k: 'add', n: '52', s: '+', t: '      method: "POST",' },
        { k: 'add', n: '53', s: '+', t: '      body: JSON.stringify({ token: this.refreshToken }),' },
        { k: 'ctx', n: '54', s: ' ', t: '    });' },
      ],
    },
    {
      type: 'run',
      open: false,
      cmd: 'pnpm test src/auth/__tests__/token-manager.test.ts',
      exit: 0,
      duration: '3.1s',
      lines: [
        { c: 'cmd', html: '<span class="p">~/payments-api</span> $ pnpm test src/auth/__tests__/token-manager.test.ts' },
        { c: 'o', html: ' <span class="t-green">✓</span> returns cached token before expiry <span class="t-dim">(2ms)</span>' },
        { c: 'o', html: ' <span class="t-green">✓</span> collapses concurrent refreshes <span class="t-dim">(9ms)</span>' },
        { c: 'o', html: ' <span class="t-green">✓</span> rotates refresh token after success <span class="t-dim">(6ms)</span>' },
        { c: 'o', html: '' },
        { c: 'o', html: ' <span class="t-green">Test Files</span>  1 passed (1)' },
        { c: 'o', html: ' <span class="t-dim">Tests</span>  <span class="t-green">3 passed</span> (3)' },
      ],
    },
    {
      type: 'artifact',
      open: true,
      filename: 'fix-summary-1847.md',
      format: 'Markdown',
      size: '2.1 KB',
    },
    {
      type: 'human',
      open: true,
      question: 'The fix changes the public signature of TokenManager — refreshAccessToken now returns a shared promise. Should I also update the cached singleton in',
      ctx: 'src/http/interceptors.ts',
      tail: 'to await it, or keep that out of scope for this PR?',
    },
    {
      type: 'finish',
      open: true,
      summary: 'Resolved the concurrent-refresh race in TokenManager by collapsing all in-flight refresh calls onto a single memoized promise. All auth tests pass and the load repro no longer produces 401s.',
      bullets: [
        'Added inFlight promise guard + _doRefresh() refactor',
        'Verified with 200-concurrent-request load repro — 0 × 401',
        '3 / 3 unit tests passing, no type regressions',
      ],
      tokens: '184,920',
      cost: '$0.47',
      time: '4m 41s',
    },
  ];

  // ---- File tree (right panel · Files tab) ----
  const TREE = [
    { depth: 0, type: 'folder', name: 'src', open: true },
    { depth: 1, type: 'folder', name: 'auth', open: true },
    { depth: 2, type: 'file', name: 'token-manager.ts', modified: true, sel: true, ext: 'ts' },
    { depth: 2, type: 'file', name: 'middleware.ts', modified: false, ext: 'ts' },
    { depth: 2, type: 'folder', name: '__tests__', open: true },
    { depth: 3, type: 'file', name: 'token-manager.test.ts', modified: true, ext: 'ts' },
    { depth: 1, type: 'folder', name: 'http', open: true },
    { depth: 2, type: 'file', name: 'interceptors.ts', modified: false, ext: 'ts' },
    { depth: 1, type: 'file', name: 'index.ts', modified: false, ext: 'ts' },
    { depth: 0, type: 'file', name: 'package.json', modified: false, ext: 'json' },
  ];

  // ---- Current file content (Files tab viewer) ----
  const FILE_VIEW = {
    dir: 'src/auth/',
    name: 'token-manager.ts',
    modified: true,
    lineCount: 64,
    code: [
      { n: 10, html: '<span class="tok-key">export class</span> <span class="tok-fn">TokenManager</span> {' },
      { n: 11, html: '  <span class="tok-key">private</span> accessToken = <span class="tok-str">\'\'</span>;' },
      { n: 12, html: '  <span class="tok-key">private</span> expiresAt = <span class="tok-num">0</span>;' },
      { n: 13, html: '  <span class="tok-key">private</span> inFlight: <span class="tok-fn">Promise</span>&lt;<span class="tok-fn">string</span>&gt; | <span class="tok-key">null</span> = <span class="tok-key">null</span>;' },
      { n: 14, html: '' },
      { n: 15, html: '  <span class="tok-key">async</span> <span class="tok-fn">refreshAccessToken</span>() {' },
      { n: 16, html: '    <span class="tok-key">if</span> (<span class="tok-num">Date</span>.now() &lt; <span class="tok-key">this</span>.expiresAt) {' },
      { n: 17, html: '      <span class="tok-key">return</span> <span class="tok-key">this</span>.accessToken;' },
      { n: 18, html: '    }' },
      { n: 19, html: '    <span class="tok-com">// collapse concurrent refreshes onto one in-flight promise</span>' },
      { n: 20, html: '    <span class="tok-key">if</span> (<span class="tok-key">this</span>.inFlight) <span class="tok-key">return</span> <span class="tok-key">this</span>.inFlight;' },
      { n: 21, html: '    <span class="tok-key">this</span>.inFlight = <span class="tok-key">this</span>.<span class="tok-fn">_doRefresh</span>().<span class="tok-fn">finally</span>(() =&gt; {' },
      { n: 22, html: '      <span class="tok-key">this</span>.inFlight = <span class="tok-key">null</span>;' },
      { n: 23, html: '    });' },
      { n: 24, html: '    <span class="tok-key">return</span> <span class="tok-key">this</span>.inFlight;' },
      { n: 25, html: '  }' },
      { n: 26, html: '' },
      { n: 27, html: '  <span class="tok-key">private async</span> <span class="tok-fn">_doRefresh</span>(): <span class="tok-fn">Promise</span>&lt;<span class="tok-fn">string</span>&gt; {' },
      { n: 28, html: '    <span class="tok-key">const</span> res = <span class="tok-key">await</span> <span class="tok-fn">fetch</span>(<span class="tok-str">`/oauth/refresh`</span>, {' },
      { n: 29, html: '      method: <span class="str">\'POST\'</span>,' },
      { n: 30, html: '      body: <span class="tok-num">JSON</span>.<span class="tok-fn">stringify</span>({ token: <span class="tok-key">this</span>.refreshToken }),' },
      { n: 31, html: '    });' },
      { n: 32, html: '    <span class="tok-key">const</span> data = <span class="tok-key">await</span> res.<span class="tok-fn">json</span>();' },
      { n: 33, html: '    <span class="tok-key">this</span>.accessToken = data.access_token;' },
      { n: 34, html: '    <span class="tok-key">this</span>.expiresAt = <span class="tok-num">Date</span>.now() + data.expires_in * <span class="tok-num">1000</span>;' },
      { n: 35, html: '    <span class="tok-key">return</span> <span class="tok-key">this</span>.accessToken;' },
      { n: 36, html: '  }' },
      { n: 37, html: '}' },
    ],
  };

  // ---- Artifacts ----
  const ARTIFACTS = [
    { filename: 'fix-summary-1847.md', format: 'Markdown', size: '2.1 KB' },
    { filename: 'load-repro-results.json', format: 'JSON', size: '8.4 KB' },
    { filename: 'token-flow-diagram.svg', format: 'SVG', size: '14 KB' },
  ];

  // ---- Metrics (Metrics tab) ----
  const METRICS = {
    inputTokens: '156,402',
    outputTokens: '28,518',
    cost: '$0.47',
    avgLatency: '1,284',
    toolCalls: [
      { name: 'view_file', icon: 'fileText', count: 14, pct: 100, color: 'c-slate' },
      { name: 'edit_file', icon: 'filePen', count: 9, pct: 64, color: '' },
      { name: 'run_command', icon: 'terminal', count: 7, pct: 50, color: 'c-slate' },
      { name: 'search_directory', icon: 'search', count: 6, pct: 43, color: 'c-cyan' },
      { name: 'web_research', icon: 'globe', count: 2, pct: 14, color: 'c-green' },
    ],
    phases: [
      { name: 'Localization', key: 'loc', pct: 34, time: '1m 35s' },
      { name: 'Patch Engineering', key: 'patch', pct: 46, time: '2m 09s' },
      { name: 'Verification', key: 'verify', pct: 20, time: '0m 57s' },
    ],
  };

  // ---- MCTS tree (MCTS tab) — laid out nodes ----
  const MCTS_TREE = {
    nodes: [
      { id: 'root', x: 186, y: 30,  commit: 'init0000', score: '—',    visits: 9, state: 'root',    label: 'root' },
      { id: 'a',    x: 96,  y: 110, commit: '7b1c0e44', score: 0.41, visits: 3, state: 'failed',  label: 'A' },
      { id: 'b',    x: 186, y: 110, commit: 'c2d8f190', score: 0.63, visits: 2, state: 'explored',label: 'B' },
      { id: 'c',    x: 276, y: 110, commit: 'a4f9e21b', score: 0.82, visits: 4, state: 'active',  label: 'C' },
      { id: 'a1',   x: 60,  y: 196, commit: 'd90ab123', score: 0.22, visits: 1, state: 'failed',  label: 'A1' },
      { id: 'c1',   x: 230, y: 196, commit: 'e7c41d65', score: 0.71, visits: 2, state: 'explored',label: 'C1' },
      { id: 'c2',   x: 320, y: 196, commit: 'f1390aa8', score: 0.94, visits: 3, state: 'win',     label: 'C2' },
    ],
    edges: [
      ['root','a'], ['root','b'], ['root','c'],
      ['a','a1'], ['c','c1'], ['c','c2'],
    ],
  };

  // ---- Footer live values ----
  const FOOTER = {
    model: 'claude-sonnet-4.6',
    phase: 'patch',
    turn: 47,
    sandboxes: '3 / 4',
    tokens: 184920,
    cost: 0.47,
  };

  window.AZKA = { TASKS, EVENTS, TREE, FILE_VIEW, ARTIFACTS, METRICS, MCTS_TREE, FOOTER };
})();
