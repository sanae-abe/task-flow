/**
 * Modular RichTextEditor Component
 *
 * This is the main export for the refactored RichTextEditor with modular architecture.
 */

import React, { useEffect } from 'react';
import type { RichTextEditorProps } from './types';
import { useEditorState } from './hooks/useEditorState';
import { useEditorHandlers } from './hooks/useEditorHandlers';
import Toolbar from './components/Toolbar';
import EditorContent from './components/EditorContent';
import EmojiPickerWrapper from './components/EmojiPickerWrapper';
import LinkInsertDialog from '../LinkInsertDialog';
import { restoreRange } from './utils/editor';
import { insertEmoji } from './utils/formatting';

/**
 * Modular Rich Text Editor Component
 *
 * Features:
 * - Toolbar with formatting buttons
 * - ContentEditable editor area
 * - Link insertion and editing
 * - Emoji picker
 * - Keyboard shortcuts
 * - Paste handling
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange,
  placeholder = "説明を入力してください...",
  disabled = false,
  minHeight = "120px",
}) => {
  // State management
  const editorState = useEditorState();

  // Event handlers
  const handlers = useEditorHandlers({
    editorState,
    onChange,
    disabled,
  });

  // Global event handlers for emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorState.showEmojiPicker &&
        editorState.emojiButtonRef.current &&
        !editorState.emojiButtonRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.EmojiPickerReact')
      ) {
        editorState.setShowEmojiPicker(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editorState.showEmojiPicker) {
        editorState.setShowEmojiPicker(false);
      }
    };

    if (editorState.showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editorState.showEmojiPicker]);

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    if (editorState.savedEmojiRange && editorState.editorRef.current) {
      editorState.editorRef.current.focus();
      restoreRange(editorState.savedEmojiRange);
      insertEmoji(emoji);
      handlers.handleInput();
    }
    editorState.setShowEmojiPicker(false);
    editorState.setSavedEmojiRange(null);
  };

  return (
    <div className="w-full border rounded-md">
      {/* Toolbar */}
      <Toolbar
        onButtonClick={handlers.handleToolbarButtonClick}
        disabled={disabled}
        emojiButtonRef={editorState.emojiButtonRef}
      />

      {/* Editor Content */}
      <EditorContent
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        minHeight={minHeight}
        editorState={editorState}
        handlers={handlers}
      />

      {/* Link Insert Dialog */}
      {editorState.showLinkDialog && (
        <LinkInsertDialog
          isOpen={editorState.showLinkDialog}
          initialText={editorState.selectedText}
          onInsert={(url: string) => {
            handlers.handleLinkInsert(url);
          }}
          onCancel={() => {
            editorState.setShowLinkDialog(false);
            editorState.setSelectedText("");
            editorState.setSavedRange(null);
          }}
        />
      )}

      {/* Link Edit Dialog */}
      {editorState.showLinkEditDialog && editorState.editingLink && (
        <LinkInsertDialog
          isOpen={editorState.showLinkEditDialog}
          initialText={editorState.editingLink.textContent || ""}
          initialUrl={editorState.editingLink.href}
          onInsert={(url: string) => {
            handlers.handleLinkEdit(url);
          }}
          onCancel={() => {
            editorState.setShowLinkEditDialog(false);
            editorState.setEditingLink(null);
          }}
        />
      )}

      {/* Emoji Picker */}
      <EmojiPickerWrapper
        isOpen={editorState.showEmojiPicker}
        onClose={() => editorState.setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
        buttonRef={editorState.emojiButtonRef}
      />
    </div>
  );
};

export default RichTextEditor;
export type { RichTextEditorProps } from './types';