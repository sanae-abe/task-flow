/**
 * RichTextEditor type definitions
 *
 * This file contains all the type definitions used across the RichTextEditor module.
 */

// Props interface for the main RichTextEditor component
export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

// Toolbar button configuration
export interface ToolbarButton {
  id: string;
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  action: () => void;
  isActive?: boolean;
}

// Style configuration for editor elements
export interface EditorStyles {
  code: {
    backgroundColor: string;
    color: string;
    padding: string;
    borderRadius: string;
    fontFamily: string;
    fontSize: string;
  };
  link: {
    color: string;
    textDecoration: string;
  };
  codeBlock: {
    backgroundColor: string;
    padding: string;
    borderRadius: string;
    border: string;
    fontFamily: string;
    fontSize: string;
    whiteSpace: 'pre-wrap';
    margin: string;
    display: 'block';
  };
}

// Link editing state
export interface LinkEditState {
  isEditing: boolean;
  url: string;
  range: Range | null;
}

// Emoji picker configuration
export interface EmojiConfig {
  isOpen: boolean;
  position: { top: number; left: number } | null;
}

// Command types for editor actions
export type EditorCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'codeBlock'
  | 'unorderedList'
  | 'orderedList'
  | 'link'
  | 'emoji';

// Format checking functions return type
export interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}