import { FileIcon, ImageIcon } from '@primer/octicons-react';
import React from 'react';

/**
 * ファイルサイズを人間が読める形式に変換する
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
};

/**
 * ファイルタイプに応じたアイコンを取得する
 */
export const getFileIcon = (type: string, size = 16): React.ReactElement => {
  if (type.startsWith('image/')) {
    return React.createElement(ImageIcon, { size });
  }
  return React.createElement(FileIcon, { size });
};

/**
 * ファイルタイプの検証
 */
export const isImageFile = (type: string): boolean => type.startsWith('image/');

export const isTextFile = (type: string, fileName: string): boolean => {
  const textTypes = ['text/', 'application/json'];
  const textExtensions = ['.md', '.txt', '.csv'];
  
  return textTypes.some(t => type.startsWith(t)) ||
         textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};