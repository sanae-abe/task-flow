import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger utility', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('debug', () => {
    it('should log in development environment', () => {
      process.env.NODE_ENV = 'development';
      logger.debug('Test debug message');

      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG] Test debug message');
    });

    it('should log with additional arguments in development', () => {
      process.env.NODE_ENV = 'development';
      const obj = { key: 'value' };
      logger.debug('Test with args', obj, 123);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[DEBUG] Test with args',
        obj,
        123
      );
    });

    it('should not log in production environment', () => {
      process.env.NODE_ENV = 'production';
      logger.debug('Test debug message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should not log in test environment', () => {
      process.env.NODE_ENV = 'test';
      logger.debug('Test debug message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should handle empty message', () => {
      process.env.NODE_ENV = 'development';
      logger.debug('');

      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG] ');
    });

    it('should handle multiple arguments', () => {
      process.env.NODE_ENV = 'development';
      logger.debug('Message', 'arg1', 'arg2', 'arg3');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[DEBUG] Message',
        'arg1',
        'arg2',
        'arg3'
      );
    });
  });

  describe('info', () => {
    it('should log in development environment', () => {
      process.env.NODE_ENV = 'development';
      logger.info('Test info message');

      expect(consoleSpy.info).toHaveBeenCalledWith('[INFO] Test info message');
    });

    it('should log with additional arguments in development', () => {
      process.env.NODE_ENV = 'development';
      const data = { status: 'ok' };
      logger.info('Operation completed', data);

      expect(consoleSpy.info).toHaveBeenCalledWith(
        '[INFO] Operation completed',
        data
      );
    });

    it('should not log in production environment', () => {
      process.env.NODE_ENV = 'production';
      logger.info('Test info message');

      expect(consoleSpy.info).not.toHaveBeenCalled();
    });

    it('should handle complex objects', () => {
      process.env.NODE_ENV = 'development';
      const complexObj = {
        nested: { deep: { value: 123 } },
        array: [1, 2, 3],
      };
      logger.info('Complex data', complexObj);

      expect(consoleSpy.info).toHaveBeenCalledWith(
        '[INFO] Complex data',
        complexObj
      );
    });
  });

  describe('warn', () => {
    it('should always log warnings regardless of environment', () => {
      process.env.NODE_ENV = 'production';
      logger.warn('Test warning');

      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Test warning');
    });

    it('should log warnings in development', () => {
      process.env.NODE_ENV = 'development';
      logger.warn('Development warning');

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[WARN] Development warning'
      );
    });

    it('should log with additional arguments', () => {
      const error = new Error('Something went wrong');
      logger.warn('Warning with error', error);

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[WARN] Warning with error',
        error
      );
    });

    it('should handle multiple warnings', () => {
      logger.warn('Warning 1');
      logger.warn('Warning 2');
      logger.warn('Warning 3');

      expect(consoleSpy.warn).toHaveBeenCalledTimes(3);
    });
  });

  describe('_error', () => {
    it('should always log errors regardless of environment', () => {
      process.env.NODE_ENV = 'production';
      logger._error('Test error');

      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Test error');
    });

    it('should log errors in development', () => {
      process.env.NODE_ENV = 'development';
      logger._error('Development error');

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[ERROR] Development error'
      );
    });

    it('should log with Error objects', () => {
      const error = new Error('Critical failure');
      logger._error('Error occurred', error);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[ERROR] Error occurred',
        error
      );
    });

    it('should log with stack traces', () => {
      const error = new Error('Stack trace test');
      logger._error('Error with stack', error);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[ERROR] Error with stack',
        error
      );
    });

    it('should handle multiple arguments in error logs', () => {
      const context = { userId: '123', action: 'delete' };
      const error = new Error('Operation failed');
      logger._error('Failed operation', context, error);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[ERROR] Failed operation',
        context,
        error
      );
    });
  });

  describe('Environment-specific behavior', () => {
    it('should suppress debug and info in production but keep warn and error', () => {
      process.env.NODE_ENV = 'production';

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger._error('Error message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should log all levels in development', () => {
      process.env.NODE_ENV = 'development';

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger._error('Error');

      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined arguments', () => {
      process.env.NODE_ENV = 'development';
      logger.debug('Message', undefined);

      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG] Message', undefined);
    });

    it('should handle null arguments', () => {
      process.env.NODE_ENV = 'development';
      logger.info('Message', null);

      expect(consoleSpy.info).toHaveBeenCalledWith('[INFO] Message', null);
    });

    it('should handle circular references in objects', () => {
      process.env.NODE_ENV = 'development';
      const circular: any = { name: 'test' };
      circular.self = circular;

      logger.debug('Circular', circular);
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should handle special characters in messages', () => {
      process.env.NODE_ENV = 'development';
      logger.debug('Special chars: \n\t\r🎉');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[DEBUG] Special chars: \n\t\r🎉'
      );
    });
  });
});
