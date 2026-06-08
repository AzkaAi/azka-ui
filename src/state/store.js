// state/store.js
export class TaskSession {
    constructor(taskId) {
        this.taskId = taskId;
        this.highestSeqId = 0;
        this.bufferedEvents = [];
        this.isLive = false;
        this.ws = null;
        this.terminalInstance = null;
    }

    initialize(renderCallback) {
        this.ws = new WebSocket(
            `ws://100.103.30.38:8000/ws/${this.taskId}` 
        );

        this.ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (!this.isLive) {
                this.bufferedEvents.push(data);
            } else {
                this.processEvent(data, renderCallback);
            }
        };

        this.ws.onclose = () => {
            // this.taskId is nulled by teardown()
            // so intentional disconnects never trigger reconnect
            setTimeout(() => {
                if (this.taskId) {
                    this.isLive = false;
                    this.initialize(renderCallback);
                    // Backfill events missed during disconnect
                    this.loadHistory(renderCallback);
                }
            }, 3000);
        };
    }

    processEvent(data, renderCallback) {
        if (data.seq_id <= this.highestSeqId) return;
        this.highestSeqId = data.seq_id;
        renderCallback(data);
    }

    async loadHistory(renderCallback) {
        try {
            const response = await fetch(
                `http://100.103.30.38:8000/tasks/${this.taskId}` 
            );
            const data = await response.json();

            data.event_log?.forEach(event => {
                this.highestSeqId = Math.max(
                    this.highestSeqId, event.seq_id || 0
                );
                renderCallback(event);
            });

            this.isLive = true;
            this.bufferedEvents
                .filter(e => e.seq_id > this.highestSeqId)
                .sort((a, b) => a.seq_id - b.seq_id)
                .forEach(e => this.processEvent(e, renderCallback));

        } catch (error) {
            console.error("State reconciliation failed:", error);
        } finally {
            this.bufferedEvents = [];
        }
    }

    teardown() {
        this.taskId = null;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

let currentSession = null;

export function switchToTask(taskId, renderCallback) {
    if (currentSession) currentSession.teardown();
    currentSession = new TaskSession(taskId);
    currentSession.initialize(renderCallback);
    currentSession.loadHistory(renderCallback);
}
