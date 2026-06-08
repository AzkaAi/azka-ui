// Convert backend events to UI event format
export function mapBackendEventToUI(backendEvent) {
  console.log('Mapping backend event:', backendEvent);
  
  // Handle different event formats from backend
  const event_type = backendEvent.event_type || backendEvent.type;
  const action = backendEvent.action || backendEvent;
  const observation = backendEvent.observation || backendEvent;
  
  switch (event_type) {
    case 'view_file':
    case 'view':
      return {
        type: 'view',
        open: true,
        path: action.tool_args?.file_path || action.file_path,
        lang: 'py',
        lines: '1-100',
        code: observation.success ? [
          { n: 1, html: observation.result || 'File content...' }
        ] : [],
      };
    
    case 'run_command':
    case 'run':
      return {
        type: 'run',
        open: true,
        cmd: action.tool_args?.command?.join(' ') || action.command,
        exit: observation.success ? 0 : 1,
        duration: '1.0s',
        lines: observation.success ? [
          { c: 'cmd', html: `<span class="p">~/orchestrator</span> $ ${action.tool_args?.command?.join(' ') || action.command}` },
          { c: 'o', html: observation.result || 'Command executed' }
        ] : [
          { c: 'cmd', html: `<span class="p">~/orchestrator</span> $ ${action.tool_args?.command?.join(' ') || action.command}` },
          { c: 'o', html: `<span class="t-red">Error: ${observation.error}</span>` }
        ],
      };
    
    case 'edit_file':
    case 'edit':
      return {
        type: 'edit',
        open: true,
        path: action.tool_args?.filepath || action.filepath,
        result: observation.success ? 'ok' : 'error',
        added: 0,
        removed: 0,
        hunk: '@@ -1,1 +1,1 @@',
        diff: observation.success ? [
          { k: 'ctx', n: '1', s: ' ', t: action.tool_args?.new_string || action.new_string }
        ] : [],
      };
    
    case 'finish':
      return {
        type: 'finish',
        open: true,
        result: action.tool_args?.result || action.result || 'Task completed',
        summary: action.tool_args?.result || action.result || 'Task completed successfully',
        bullets: ['Agent finished task', 'All steps completed'],
        tokens: '0',
        cost: '$0.00',
        time: '0m 0s',
      };
    
    default:
      // For unknown event types, create a generic observation card
      return {
        type: 'observation',
        open: true,
        json: [
          '{',
          `  <span class="jk">"event_type"</span>: <span class="js">"${event_type}"</span>,`,
          `  <span class="jk">"success"</span>: <span class="jb">${observation.success}</span>`,
          '}',
        ],
      };
  }
}
