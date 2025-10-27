/**
 * Editor Content Component
 *
 * This component renders the main contentEditable area of the RichTextEditor.
 */

import React, { useEffect } from 'react';
import type { UseEditorStateReturn } from '../hooks/useEditorState';
import type { UseEditorHandlersReturn } from '../hooks/useEditorHandlers';

interface EditorContentProps {
  value: string;
  placeholder: string;
  disabled: boolean;
  minHeight: string;
  editorState: UseEditorStateReturn;
  handlers: UseEditorHandlersReturn;
}

const EditorContent: React.FC<EditorContentProps> = ({
  value,
  placeholder,
  disabled,
  minHeight,
  editorState,
  handlers,
}) => {
  const { editorRef, isEditorFocused } = editorState;
  const { handleInput, handleFocus, handleBlur, handleKeyDown, handlePaste, handleLinkClick } = handlers;

  // Update editor content when value changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // editorRef is intentionally omitted to prevent infinite loops

  // Check if we should show placeholder
  const showPlaceholder = !value && !isEditorFocused;

  return (
    <div className="relative">
      {/* Placeholder */}
      {showPlaceholder && (
        <div className="absolute top-0 left-0 pointer-events-none text-muted-foreground p-3 text-sm">
          {placeholder}
        </div>
      )}

      {/* Editor content */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={handleLinkClick}
        className={`
          outline-none p-3 rounded-b-md
          ${disabled ? 'bg-muted cursor-not-allowed' : 'bg-background'}
          prose prose-sm max-w-none text-foreground [&_a]:font-normal [&_p]:mb-[1em] [&_ul]:mb-[1em] [&_ol]:mb-[1em] [&_ul]:ml-[1.5em] [&_ol]:ml-[1.5em] [&_ul]:list-disc [&_ol]:list-disc [&_a]:underline [&_a]:font-medium`}
        style={{
          minHeight,
          fontSize: '14px',
          lineHeight: '1.5',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      />
    </div>
  );
};

export default EditorContent;