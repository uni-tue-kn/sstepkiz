/**
 * Indicates if software runs in development mode.
 */
export const DEV_MODE = process.env.NODE_ENV === 'dev';

/**
 * Name of default configuration file.
 */
export const CONFIG_FILE = `gamification-config${DEV_MODE ? '.dev' : ''}.env`;

/**
 * Default log level.
 */
export const DEFAULT_LOG_LEVEL = 0;

/**
 * Default port.
 */
export const DEFAULT_PORT = 3200;
