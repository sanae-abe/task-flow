/**
 * Editor state management hook
 *
 * This hook manages the internal state of the RichTextEditor component
 * including focus state, dialogs, and selection ranges.
 */

import { useState, useRef } from 'react';

export interface UseEditorStateReturn {
  // Editor refs
  editorRef: React.RefObject<HTMLDivElement>;
  emojiButtonRef: React.RefObject<HTMLButtonElement>;

  // Focus state
  isEditorFocused: boolean;
  setIsEditorFocused: (focused: boolean) => void;

  // Link dialog state
  showLinkDialog: boolean;
  setShowLinkDialog: (show: boolean) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;
  savedRange: Range | null;
  setSavedRange: (range: Range | null) => void;

  // Link editing state
  editingLink: HTMLAnchorElement | null;
  setEditingLink: (link: HTMLAnchorElement | null) => void;
  showLinkEditDialog: boolean;
  setShowLinkEditDialog: (show: boolean) => void;

  // Emoji picker state
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  savedEmojiRange: Range | null;
  setSavedEmojiRange: (range: Range | null) => void;

  // Toolbar interaction state
  isToolbarInteraction: boolean;
  setIsToolbarInteraction: (interaction: boolean) => void;

  // Utility functions
  resetState: () => void;
}

export const useEditorState = (): UseEditorStateReturn => {
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  // State
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [editingLink, setEditingLink] = useState<HTMLAnchorElement | null>(null);
  const [showLinkEditDialog, setShowLinkEditDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [savedEmojiRange, setSavedEmojiRange] = useState<Range | null>(null);
  const [isToolbarInteraction, setIsToolbarInteraction] = useState(false);

  // Reset all state to initial values
  const resetState = () => {
    setIsEditorFocused(false);
    setShowLinkDialog(false);
    setSelectedText("");
    setSavedRange(null);
    setEditingLink(null);
    setShowLinkEditDialog(false);
    setShowEmojiPicker(false);
    setSavedEmojiRange(null);
    setIsToolbarInteraction(false);
  };

  return {
    // Refs
    editorRef,
    emojiButtonRef,

    // Focus state
    isEditorFocused,
    setIsEditorFocused,

    // Link dialog state
    showLinkDialog,
    setShowLinkDialog,
    selectedText,
    setSelectedText,
    savedRange,
    setSavedRange,

    // Link editing state
    editingLink,
    setEditingLink,
    showLinkEditDialog,
    setShowLinkEditDialog,

    // Emoji picker state
    showEmojiPicker,
    setShowEmojiPicker,
    savedEmojiRange,
    setSavedEmojiRange,

    // Toolbar interaction state
    isToolbarInteraction,
    setIsToolbarInteraction,

    // Utility functions
    resetState,
  };
};