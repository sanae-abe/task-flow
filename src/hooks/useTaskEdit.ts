/**
 * Legacy useTaskEdit hook - now uses modular architecture
 *
 * This file maintains backward compatibility by re-exporting
 * the modular implementation from the useTaskEdit directory.
 */

// Re-export everything from the modular implementation
export { useTaskEdit } from './useTaskEdit/index';
export type { UseTaskEditProps, UseTaskEditReturn } from './useTaskEdit/index';