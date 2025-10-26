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
  }, [value]);

  // Check if we should show placeholder
  const showPlaceholder = !value && !isEditorFocused;

  return (
    <div className="relative">
      {/* Placeholder */}
      {showPlaceholder && (
        <div
          className="absolute top-0 left-0 pointer-events-none text-muted-foreground p-3"
          style={{
            minHeight,
            fontSize: '14px',
            lineHeight: '1.5',
          }}
        >
          {placeholder}
        </div>
      )}

      {/* Editor content */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={handleLinkClick}
        className={`
          outline-none p-3 rounded-b-md
          ${disabled ? 'bg-muted cursor-not-allowed' : 'bg-background'}
          prose prose-sm max-w-none
          [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
          [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:border
          [&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary/80
          [&_ul]:list-disc [&_ul]:ml-6
          [&_ol]:list-decimal [&_ol]:ml-6
          [&_li]:my-1
        `}
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