// Parse event for pairing logic
export function parseEventForPairing(event) {
  // Dedicated thinking event
  if (event.event_type === 'thinking' || event.type === 'thinking') {
    return { type: 'thought', text: event.action?.thought || event.text || '' };
  }
  
  // Tool call with thought attached (backend format)
  if (event.event_type === 'tool_call' && event.action?.thought) {
    return { 
      type: 'action_with_thought', 
      thought: event.action.thought,
      action: event 
    };
  }
  
  // Mapped UI events with thought field (from eventMapper)
  if (event.thought && (event.type === 'edit' || event.type === 'view' || event.type === 'search' || event.type === 'run')) {
    return {
      type: 'action_with_thought',
      thought: event.thought,
      action: event
    };
  }
  
  // Tool call with no thought
  if (event.event_type === 'tool_call') {
    return { type: 'action', action: event };
  }
  
  // Task complete
  if (event.event_type === 'task_complete' || event.type === 'task_complete') {
    return { type: 'complete', action: event };
  }
  
  // Other action events
  if (event.type === 'edit' || event.type === 'view' || event.type === 'search' || event.type === 'run') {
    return { type: 'action', action: event };
  }
  
  return { type: 'unknown', action: event };
}

// Pair events - each thought belongs to the action that follows it
export function pairEvents(events, isLive = false) {
  const pairs = [];
  let pendingThoughts = [];
  let thoughtStartTime = null;

  for (const event of events) {
    const parsed = parseEventForPairing(event);
    
    if (parsed.type === 'thought') {
      // Collect thought text
      const thoughtText = parsed.text;
      
      if (thoughtText) {
        if (!thoughtStartTime && isLive) {
          thoughtStartTime = Date.now();
        }
        // Merge multiple thoughts from same turn with newline
        pendingThoughts.push(thoughtText);
      }
    } else if (parsed.type === 'action_with_thought' && parsed.action) {
      // This is an action with thought attached - pair them together
      const thoughtText = parsed.thought;
      const thoughtSeconds = thoughtStartTime && isLive
        ? Math.round((Date.now() - thoughtStartTime) / 1000) 
        : null; // No time for history events
      
      // Combine pending thoughts with this action's thought
      const combinedThought = pendingThoughts.length > 0 
        ? [...pendingThoughts, thoughtText].join('\n\n')
        : thoughtText;
      
      pairs.push({
        thought: combinedThought || null,
        thoughtSeconds: thoughtSeconds,
        action: parsed.action
      });
      
      pendingThoughts = [];
      thoughtStartTime = null;
    } else if (parsed.action) {
      // This is an action event - pair it with pending thoughts
      const thoughtSeconds = thoughtStartTime && isLive
        ? Math.round((Date.now() - thoughtStartTime) / 1000) 
        : null; // No time for history events
      
      pairs.push({
        thought: pendingThoughts.length > 0 ? pendingThoughts.join('\n\n') : null,
        thoughtSeconds: thoughtSeconds,
        action: parsed.action
      });
      
      pendingThoughts = [];
      thoughtStartTime = null;
    }
  }

  // If there is a pending thought with no action yet (agent still thinking)
  if (pendingThoughts.length > 0) {
    pairs.push({
      thought: pendingThoughts.join('\n\n'),
      thoughtSeconds: thoughtStartTime && isLive
        ? Math.round((Date.now() - thoughtStartTime) / 1000) 
        : null, // No time for history events
      action: null  // still in progress
    });
  }

  return pairs;
}
