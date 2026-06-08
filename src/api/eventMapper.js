// Convert backend events to UI event format
export function mapBackendEventToUI(backendEvent) {
  console.log('Mapping backend event:', backendEvent);
  
  // Handle different event formats from backend
  const event_type = backendEvent.event_type || backendEvent.type;
  const action = backendEvent.action || backendEvent;
  const observation = backendEvent.observation || backendEvent;
  
  // Extract thought from action if available
  const thought = action?.thought || action?.tool_args?.thought || '';
  
  // For tool_call events, create both thinking and tool event
  if (event_type === 'tool_call' && thought) {
    const toolName = action?.tool_name || 'unknown';
    let toolEventType = 'run';
    let toolEventData = {};
    
    // Map tool names to event types and extract relevant data
    if (toolName === 'edit_file' || toolName === 'edit') {
      toolEventType = 'edit';
      toolEventData = {
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
      toolEventType = 'view';
      toolEventData = {
        path: action?.tool_args?.file_path || action?.file_path,
        lang: 'py',
        lines: '1-100',
        code: observation?.success ? [
          { n: 1, html: observation?.result || observation?.stdout || 'File content...' }
        ] : [],
      };
    } else if (toolName === 'search') {
      toolEventType = 'search';
      toolEventData = {
        query: action?.tool_args?.query || 'search',
        scope: action?.tool_args?.path || '.',
        results: observation?.results || [],
      };
    } else {
      // Default to run command
      toolEventData = {
        cmd: action?.tool_args?.command?.join(' ') || action?.command,
        exit: observation?.exit_code || (observation?.success ? 0 : 1),
        duration: '1.0s',
        lines: [
          { c: 'cmd', html: `<span class="p">~/orchestrator</span> $ ${action?.tool_args?.command?.join(' ') || action?.command}` },
          { c: 'o', html: observation?.stdout || observation?.stderr || 'Command executed' }
        ],
      };
    }
    
    return {
      type: 'tool_call_with_thought',
      open: true,
      thought: thought,
      tool_name: toolName,
      tool_args: action?.tool_args || {},
      observation: observation || {},
      event_type: event_type,
      tool_event_type: toolEventType,
      ...toolEventData
    };
  }
  
  // Create thinking event if thought exists and it's not already a thinking event
  if (thought && event_type !== 'thinking' && event_type !== 'cancelled' && event_type !== 'tool_call') {
    return {
      type: 'thinking',
      open: true,
      text: thought,
    };
  }
  
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
          { n: 1, html: observation.result || observation.stdout || 'File content...' }
        ] : [],
      };
    
    case 'run_command':
    case 'run':
      const stdout = observation?.stdout || observation?.result || '';
      const stderr = observation?.stderr || observation?.error || '';
      return {
        type: 'run',
        open: true,
        cmd: action.tool_args?.command?.join(' ') || action.command,
        exit: observation.exit_code || (observation.success ? 0 : 1),
        duration: '1.0s',
        lines: [
          { c: 'cmd', html: `<span class="p">~/orchestrator</span> $ ${action.tool_args?.command?.join(' ') || action.command}` },
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
