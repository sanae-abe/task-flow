/**
 * ログユーティリティ
 * 本番環境では console.log を無効化し、エラーログのみを出力
 */

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, ...args);
  },

  _error: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, ...args);
  },
};

export default logger;
