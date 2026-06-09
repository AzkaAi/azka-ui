// Normalize file paths by stripping workspace prefixes
// Use lastIndexOf to handle cases where 'workspace' appears in folder names
export function normalizePath(filepath) {
  if (!filepath) return '';
  const parts = filepath.split('/');
  const workspaceIdx = parts.lastIndexOf('workspace');
  if (workspaceIdx !== -1 && parts.length >= workspaceIdx + 2) {
    return parts.slice(workspaceIdx + 2).join('/');
  }
  return parts[parts.length - 1];
}
