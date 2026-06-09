// Convert backend events to UI event format
export function mapBackendEventToUI(backendEvent) {
  console.log('Mapping backend event:', backendEvent);
  
  // Handle different event formats from backend
  const event_type = backendEvent.event_type || backendEvent.type;
  const action = backendEvent.action || backendEvent;
  const observation = backendEvent.observation || backendEvent;
  
  // Extract thought from action if available (for pairing logic)
  const thought = action?.thought || action?.tool_args?.thought || '';
  
  switch (event_type) {
    case 'tool_call':
      // Handle tool_call events with thought preservation
      const toolName = action?.tool_name || 'unknown';
      
      if (toolName === 'edit_file' || toolName === 'edit') {
        return {
          type: 'edit',
          open: true,
          thought: thought,
          path: action?.tool_args?.filepath || action?.filepath,
          result: observation?.success ? 'ok' : 'error',
          added: 0,
          removed: 0,
          hunk: '@@ -1,1 +1,1 @@',
          diff: observation?.success ? [
            { k: 'ctx', n: '1', s: ' ', t: action?.tool_args?.new_string || action?.new_string }
          ] : [],
        };
      } else if (toolName === 'view_file' || toolName === 'view') {
        return {
          type: 'view',
          open: true,
          thought: thought,
          path: action?.tool_args?.file_path || action?.file_path,
          lang: 'py',
          lines: '1-100',
          code: observation?.success ? [
            { n: 1, html: observation?.result || observation?.stdout || 'File content...' }
          ] : [],
        };
      } else if (toolName === 'search') {
        return {
          type: 'search',
          open: true,
          thought: thought,
          query: action?.tool_args?.query || 'search',
          scope: action?.tool_args?.path || '.',
          results: observation?.results || [],
        };
      } else {
        // Default to run command
        const cmd = action?.tool_args?.command;
        const commandStr = Array.isArray(cmd) ? cmd.join(' ') : String(cmd || 'command');
        return {
          type: 'run',
          open: true,
          thought: thought,
          cmd: commandStr,
          exit: observation?.exit_code || (observation?.success ? 0 : 1),
          duration: '1.0s',
          lines: [
            { c: 'cmd', html: `<span class="p">~/orchestrator</span> $ ${commandStr}` },
            { c: 'o', html: observation?.stdout || observation?.stderr || 'Command executed' }
          ],
        };
      }
    
    case 'thinking':
      return {
        type: 'thinking',
        open: true,
        text: action?.thought || action?.text || '',
      };
    
    case 'view_file':
    case 'view':
      return {
        type: 'view',
        open: true,
        path: action.tool_args?.file_path || action.file_path,
        lang: 'py',
        lines: '1-100',
        code: observation.success ? [
          { n: 1, html: observation.result || observation.stdout || 'File content...' }
        ] : [],
      };
    
    case 'run_command':
    case 'run':
      const stdout = observation?.stdout || observation?.result || '';
      const stderr = observation?.stderr || observation?.error || '';
      const cmd = action.tool_args?.command;
      const commandStr = Array.isArray(cmd) ? cmd.join(' ') : String(cmd || 'command');
      return {
        type: 'run',
        open: true,
        cmd: commandStr,
        exit: observation.exit_code || (observation.success ? 0 : 1),
        duration: '1.0s',
        lines: [
          { c: 'cmd', html: `<span class="p">~/orchestrator</span> $ ${commandStr}` },
          { c: 'o', html: stdout || stderr || 'Command executed' }
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
    
    case 'task_complete':
      return {
        type: 'task_complete',
        open: true,
        observation: {
          stdout: observation?.stdout || action?.result || 'Task completed successfully'
        },
        artifacts: backendEvent.artifacts || [],
      };
    
    case 'cancelled':
      return {
        type: 'finish',
        open: true,
        result: 'cancelled',
        summary: 'Task was cancelled by user',
        bullets: ['Task stopped', 'Agent halted'],
        tokens: '0',
        cost: '$0.00',
        time: '0m 0s',
      };
    
    case 'clarification_required':
      return {
        type: 'clarification',
        data: backendEvent
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
