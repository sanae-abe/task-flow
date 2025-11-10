import { ThreeWayMerger } from './three-way-merger';
import { Logger } from '../utils/logger';
export class ConflictResolver {
    logger;
    merger;
    statistics;
    defaultPolicy;
    constructor(options) {
        this.logger = Logger.getInstance().child({ feature: 'conflict-resolver' });
        this.merger = new ThreeWayMerger();
        this.statistics = this.initializeStatistics();
        this.defaultPolicy = options?.policy || 'manual';
    }
    /**
     * Resolve single conflict (synchronous version for backward compatibility)
     */
    resolve(conflict, policy) {
        const resolvedPolicy = policy || this.defaultPolicy;
        try {
            const resolution = this.resolveSync(conflict, resolvedPolicy);
            return {
                success: true,
                resolvedTask: resolution.mergedTask,
                resolution,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                requiresManualResolution: true,
            };
        }
    }
    /**
     * Resolve single conflict (async version)
     */
    async resolveAsync(conflict, policy) {
        const resolvedPolicy = policy || this.defaultPolicy;
        const startTime = Date.now();
        this.logger.info({
            conflictId: conflict.id,
            taskId: conflict.taskId,
            policy: resolvedPolicy,
            conflictType: conflict.conflictType,
        }, 'Starting conflict resolution');
        try {
            const resolution = this.resolveSync(conflict, resolvedPolicy);
            this.updateStatistics(conflict, resolution, Date.now() - startTime);
            this.logger.info({
                conflictId: conflict.id,
                taskId: conflict.taskId,
                method: resolution.method,
                resolvedBy: resolution.resolvedBy,
            }, 'Conflict resolved successfully');
            return resolution;
        }
        catch (error) {
            this.logger.error({
                err: error,
                conflictId: conflict.id,
                taskId: conflict.taskId,
                policy: resolvedPolicy,
            }, 'Failed to resolve conflict');
            throw error;
        }
    }
    /**
     * Internal synchronous resolution
     */
    resolveSync(conflict, policy) {
        switch (policy) {
            case 'prefer_file':
                return this.resolvePreferFile(conflict);
            case 'prefer_app':
                return this.resolvePreferApp(conflict);
            case 'manual':
                return this.resolveManual(conflict);
            case 'merge':
                return this.resolveMerge(conflict);
            default:
                throw new Error(`Unknown resolution policy: ${policy}`);
        }
    }
    /**
     * Resolve multiple conflicts in batch
     */
    async resolveBatch(conflicts, policy) {
        const timer = this.logger.startTimer('resolve-batch');
        this.logger.info({
            conflictCount: conflicts.length,
            policy,
        }, 'Starting batch conflict resolution');
        const results = [];
        let resolved = 0;
        let failed = 0;
        let manualRequired = 0;
        for (const conflict of conflicts) {
            try {
                const resolution = await this.resolveAsync(conflict, policy);
                results.push({ conflict, resolution });
                if (resolution.method === 'manual_merge') {
                    manualRequired++;
                }
                else {
                    resolved++;
                }
            }
            catch (error) {
                results.push({
                    conflict,
                    error: error instanceof Error ? error : new Error(String(error)),
                });
                failed++;
            }
        }
        const batchResult = {
            total: conflicts.length,
            resolved,
            failed,
            manualRequired,
            results,
            statistics: { ...this.statistics },
        };
        timer.done({ itemsProcessed: conflicts.length });
        this.logger.info({
            total: batchResult.total,
            resolved: batchResult.resolved,
            failed: batchResult.failed,
            manualRequired: batchResult.manualRequired,
        }, 'Batch conflict resolution completed');
        return batchResult;
    }
    /**
     * Create manual resolution record
     */
    createManualResolutionRecord(conflict) {
        const conflictingFields = [];
        const fieldValues = {};
        const fields = [
            'title', 'status', 'priority', 'dueDate', 'description',
            'tags', 'parentId', 'order', 'section', 'archived',
        ];
        for (const field of fields) {
            const fileValue = conflict.fileVersion[field];
            const appValue = conflict.appVersion[field];
            const baseValue = conflict.baseVersion?.[field];
            if (!this.valuesEqual(fileValue, appValue)) {
                conflictingFields.push(field);
                fieldValues[field] = { fileValue, appValue, baseValue };
            }
        }
        const suggestion = this.getResolutionSuggestion(conflict);
        const suggestedResolution = suggestion.suggestedPolicy === 'prefer_file' ? 'prefer_file' :
            suggestion.suggestedPolicy === 'prefer_app' ? 'prefer_app' : 'merge';
        const record = {
            conflictId: conflict.id,
            taskId: conflict.taskId,
            conflictingFields,
            fieldValues,
            suggestedResolution,
            reason: suggestion.reason,
            createdAt: new Date(),
        };
        this.logger.info({ conflictId: conflict.id, taskId: conflict.taskId, conflictingFields, suggestedResolution }, 'Created manual resolution record');
        return record;
    }
    /**
     * Get resolution suggestion
     */
    getResolutionSuggestion(conflict) {
        const alternatives = [];
        if (conflict.baseVersion) {
            const mergeResult = this.merger.merge(conflict.baseVersion, conflict.fileVersion, conflict.appVersion);
            if (!mergeResult.hasConflicts) {
                return {
                    suggestedPolicy: 'merge',
                    confidence: 0.95,
                    reason: 'All fields can be automatically merged without conflicts',
                    alternatives: [
                        { policy: 'prefer_file', reason: 'Use file version if merge is not desired' },
                        { policy: 'prefer_app', reason: 'Use app version if merge is not desired' },
                    ],
                    mergePreview: mergeResult.mergedTask,
                };
            }
            if (mergeResult.report.conflictingFields.length <= 2) {
                alternatives.push({
                    policy: 'merge',
                    reason: `Can auto-merge ${mergeResult.report.autoMergedFields.length} fields, ${mergeResult.report.conflictingFields.length} require manual resolution`,
                });
            }
        }
        const fileNewer = conflict.fileVersion.updatedAt >= conflict.appVersion.updatedAt;
        const timeDiff = Math.abs(conflict.fileVersion.updatedAt.getTime() - conflict.appVersion.updatedAt.getTime());
        if (timeDiff > 5 * 60 * 1000) {
            const policy = fileNewer ? 'prefer_file' : 'prefer_app';
            const source = fileNewer ? 'file' : 'app';
            return {
                suggestedPolicy: policy,
                confidence: 0.85,
                reason: `${source} version is significantly newer (${Math.round(timeDiff / 1000)}s difference)`,
                alternatives: [
                    { policy: fileNewer ? 'prefer_app' : 'prefer_file', reason: 'Use older version if it contains important changes' },
                    { policy: 'manual', reason: 'Review both versions manually' },
                    ...alternatives,
                ],
            };
        }
        if (conflict.conflictType === 'deletion') {
            return {
                suggestedPolicy: 'manual',
                confidence: 0.7,
                reason: 'Deletion conflict requires manual review to avoid data loss',
                alternatives: [
                    { policy: 'prefer_file', reason: 'Accept file deletion' },
                    { policy: 'prefer_app', reason: 'Keep app version' },
                    ...alternatives,
                ],
            };
        }
        return {
            suggestedPolicy: 'manual',
            confidence: 0.6,
            reason: 'Conflict requires manual review for best results',
            alternatives: [
                { policy: fileNewer ? 'prefer_file' : 'prefer_app', reason: `Prefer newer ${fileNewer ? 'file' : 'app'} version` },
                { policy: fileNewer ? 'prefer_app' : 'prefer_file', reason: `Prefer older ${fileNewer ? 'app' : 'file'} version` },
                ...alternatives,
            ],
        };
    }
    getStatistics() {
        return { ...this.statistics };
    }
    resetStatistics() {
        this.statistics = this.initializeStatistics();
        this.logger.info('Statistics reset');
    }
    resolvePreferFile(conflict) {
        return {
            method: 'use_file',
            mergedTask: { ...conflict.fileVersion, updatedAt: new Date() },
            resolvedBy: 'system',
            resolvedAt: new Date(),
            reason: 'Used file version as per conflict resolution policy',
        };
    }
    resolvePreferApp(conflict) {
        return {
            method: 'use_app',
            mergedTask: { ...conflict.appVersion, updatedAt: new Date() },
            resolvedBy: 'system',
            resolvedAt: new Date(),
            reason: 'Used app version as per conflict resolution policy',
        };
    }
    resolveManual(conflict) {
        const record = this.createManualResolutionRecord(conflict);
        const useFile = conflict.fileVersion.updatedAt >= conflict.appVersion.updatedAt;
        return {
            method: 'manual_merge',
            mergedTask: { ...(useFile ? conflict.fileVersion : conflict.appVersion), updatedAt: new Date() },
            resolvedBy: 'user',
            resolvedAt: new Date(),
            reason: `Manual resolution required for ${record.conflictingFields.length} conflicting fields: ${record.conflictingFields.join(', ')}`,
        };
    }
    resolveMerge(conflict) {
        const mergeResult = this.merger.merge(conflict.baseVersion || conflict.fileVersion, conflict.fileVersion, conflict.appVersion);
        if (!mergeResult.hasConflicts) {
            return {
                method: 'auto_merge',
                mergedTask: mergeResult.mergedTask,
                resolvedBy: 'system',
                resolvedAt: new Date(),
                reason: `Successfully auto-merged ${mergeResult.report.autoMergedFields.length} fields`,
            };
        }
        return {
            method: 'auto_merge',
            mergedTask: mergeResult.mergedTask,
            resolvedBy: 'system',
            resolvedAt: new Date(),
            reason: `Auto-merged ${mergeResult.report.autoMergedFields.length} fields, used conflict resolution for ${mergeResult.report.conflictingFields.length} conflicting fields: ${mergeResult.report.conflictingFields.join(', ')}`,
        };
    }
    updateStatistics(conflict, resolution, durationMs) {
        this.statistics.byMethod[resolution.method]++;
        this.statistics.byConflictType[conflict.conflictType]++;
        this.statistics.totalConflictsDetected++;
        const totalTime = this.statistics.averageResolutionTimeMs * (this.statistics.totalConflictsDetected - 1);
        this.statistics.averageResolutionTimeMs = (totalTime + durationMs) / this.statistics.totalConflictsDetected;
        const autoResolved = this.statistics.byMethod.use_file + this.statistics.byMethod.use_app + this.statistics.byMethod.auto_merge;
        this.statistics.autoResolvedPercentage = (autoResolved / this.statistics.totalConflictsDetected) * 100;
    }
    initializeStatistics() {
        return {
            byMethod: { use_file: 0, use_app: 0, manual_merge: 0, auto_merge: 0 },
            byConflictType: { content: 0, deletion: 0, creation: 0 },
            averageResolutionTimeMs: 0,
            totalFieldsMerged: 0,
            totalConflictsDetected: 0,
            autoResolvedPercentage: 0,
        };
    }
    valuesEqual(a, b) {
        if (a == null && b == null)
            return true;
        if (a == null || b == null)
            return false;
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length)
                return false;
            return a.every((val, idx) => this.valuesEqual(val, b[idx]));
        }
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime();
        }
        if (typeof a === 'object' && typeof b === 'object') {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length)
                return false;
            return keysA.every(key => this.valuesEqual(a[key], b[key]));
        }
        return a === b;
    }
}
export default new ConflictResolver();
//# sourceMappingURL=conflict-resolver.js.map