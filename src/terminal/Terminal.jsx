// terminal/Terminal.jsx
import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export function TerminalView({ stdout }) {
    const containerRef = useRef(null);
    const termRef = useRef(null);

    useEffect(() => {
        const term = new Terminal({
            convertEol: true,
            fontSize: 13,
            fontFamily: 'JetBrains Mono, monospace',
            theme: {
                background: '#0d1117',
                foreground: '#e6edf3',
                cursor: '#58a6ff',
            },
            rows: 20,
            scrollback: 1000,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(containerRef.current);
        fitAddon.fit();
        termRef.current = term;

        return () => term.dispose();
    }, []);

    useEffect(() => {
        if (!termRef.current || !stdout) return;

        // Clear viewport only — preserves scrollback history
        // NEVER use term.reset() — it destroys scrollback and causes flicker
        termRef.current.write('\x1b[2J\x1b[H');

        const lines = stdout.split('\n');
        if (lines.length > 500) {
            termRef.current.writeln(
                '\x1b[33m[Truncated — showing last 500 lines]\x1b[0m'
            );
        }

        const truncated = lines.slice(-500);
        // \r\n prevents row alignment drift in xterm.js
        termRef.current.write(truncated.join('\r\n'));
    }, [stdout]);

    return (
        <div
            ref={containerRef}
            style={{ background: '#0d1117', padding: '4px' }}
        />
    );
}
