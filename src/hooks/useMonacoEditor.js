import { useEffect, useRef, useState } from 'react';

let monacoEditor = null;
let isMonacoLoaded = false;

export function useMonacoEditor(containerRef, options = {}) {
  const [isReady, setIsReady] = useState(false);
  const [currentDecorations, setCurrentDecorations] = useState([]);

  useEffect(() => {
    if (!containerRef.current || isMonacoLoaded) return;

    // Configure Monaco loader
    if (typeof window !== 'undefined' && window.require) {
      window.require.config({ 
        paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
      });

      window.require(['vs/editor/editor.main'], function() {
        if (monacoEditor) {
          monacoEditor.dispose();
        }

        monacoEditor = window.monaco.editor.create(containerRef.current, {
          value: '',
          language: 'python',
          theme: 'vs-dark',
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          smoothScrolling: true,
          cursorSmoothCaretAnimation: true,
          automaticLayout: true,
          ...options
        });

        isMonacoLoaded = true;
        setIsReady(true);
      });
    }

    return () => {
      if (monacoEditor) {
        monacoEditor.dispose();
        monacoEditor = null;
      }
    };
  }, [containerRef, options]);

  const scrollToLine = (lineNumber) => {
    if (!monacoEditor) return;
    monacoEditor.revealLineInCenter(lineNumber, 
      window.monaco.editor.ScrollType.Smooth);
  };

  const highlightLines = (startLine, endLine, type) => {
    if (!monacoEditor) return;
    
    const colors = {
      'writing': 'rgba(34, 197, 94, 0.15)',   // green — writing
      'editing': 'rgba(234, 179, 8, 0.2)',     // yellow — about to change
      'changed': 'rgba(34, 197, 94, 0.25)',    // green — just changed
      'reading': 'rgba(59, 130, 246, 0.1)'     // blue — being read
    };
    
    const decorations = monacoEditor.deltaDecorations(
      currentDecorations,
      [{
        range: new window.monaco.Range(startLine, 1, endLine, 1),
        options: {
          isWholeLine: true,
          className: `line-highlight-${type}`,
          backgroundColor: colors[type] || colors.writing
        }
      }]
    );
    
    setCurrentDecorations(decorations);
    
    // Auto-clear after 2 seconds
    setTimeout(() => {
      setCurrentDecorations(monacoEditor.deltaDecorations(decorations, []));
    }, 2000);
  };

  const clearHighlights = () => {
    if (!monacoEditor) return;
    setCurrentDecorations(monacoEditor.deltaDecorations(currentDecorations, []));
  };

  const setValue = (value) => {
    if (!monacoEditor) return;
    monacoEditor.setValue(value);
  };

  const getValue = () => {
    if (!monacoEditor) return '';
    return monacoEditor.getValue();
  };

  const setLanguage = (language) => {
    if (!monacoEditor) return;
    const model = monacoEditor.getModel();
    if (model) {
      window.monaco.editor.setModelLanguage(model, language || 'plaintext');
    }
  };

  return {
    isReady,
    scrollToLine,
    highlightLines,
    clearHighlights,
    setValue,
    getValue,
    setLanguage
  };
}

export async function animateFileCreation(editor, filepath, content, language) {
  if (!editor) return;
  
  // Set language
  editor.setLanguage(language || 'plaintext');
  
  // Type content line by line
  const lines = content.split('\n');
  let built = '';
  
  for (let i = 0; i < lines.length; i++) {
    built += (i > 0 ? '\n' : '') + lines[i];
    editor.setValue(built);
    
    // Scroll to current line
    editor.scrollToLine(i + 1);
    
    // Highlight current line green
    editor.highlightLines(i + 1, i + 1, 'writing');
    
    // Wait before next line — faster for longer files
    const delay = lines.length > 100 ? 5 : 
                  lines.length > 50 ? 10 : 30;
    await sleep(delay);
  }
  
  // Final scroll to top
  editor.scrollToLine(1);
}

export async function animateFileEdit(editor, oldString, newString) {
  if (!editor) return;
  
  const content = editor.getValue();
  const lines = content.split('\n');
  
  // Find the line containing old_string
  let targetLine = 1;
  const oldFirstLine = oldString.split('\n')[0];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(oldFirstLine)) {
      targetLine = i + 1;
      break;
    }
  }
  
  // Scroll to that line
  editor.scrollToLine(targetLine);
  
  // Highlight yellow — about to change
  const oldLineCount = oldString.split('\n').length;
  editor.highlightLines(targetLine, targetLine + oldLineCount - 1, 'editing');
  
  await sleep(400);
  
  // Apply the edit
  const newContent = content.replace(oldString, newString);
  editor.setValue(newContent);
  
  // Highlight green — changed
  const newLineCount = newString.split('\n').length;
  editor.highlightLines(targetLine, targetLine + newLineCount - 1, 'changed');
  
  await sleep(1000);
}

export async function animateFileView(editor) {
  if (!editor) return;
  
  const content = editor.getValue();
  const lines = content.split('\n');
  
  // Scroll to top smoothly
  editor.scrollToLine(1);
  
  // Blue sweep animation
  for (let i = 0; i < lines.length; i++) {
    editor.highlightLines(i + 1, i + 1, 'reading');
    await sleep(5);
  }
  
  editor.clearHighlights();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
