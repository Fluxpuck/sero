// ANSI color codes for console output
const colors = {
  reset: "\u001b[0m",
  bright: "\u001b[1m",
  dim: "\u001b[2m",
  red: "\u001b[31m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  blue: "\u001b[34m",
  gray: "\u001b[90m",
};

/**
 * Creates a logger with a specified name for better log identification
 * @param name The name to be included in log messages
 */
export const logger = (name?: string) => {
  const logPrefix = name ? `[${name}]` : "";

  return {
    info: (message: string, ...args: any[]) => {
      console.log(
        `${colors.blue}[INFO]${logPrefix} ${message} ${colors.reset}`,
        ...args
      );
    },

    warn: (message: string, ...args: any[]) => {
      console.log(
        `${colors.yellow}[WARN]${logPrefix}${colors.reset} ${message}`,
        ...args
      );
    },

    error: (message: string, ...args: any[]) => {
      console.error(
        `${colors.red}[ERROR]${logPrefix} ${message} ${colors.reset}`,
        ...args
      );
    },

    success: (message: string, ...args: any[]) => {
      console.log(
        `${colors.green}[SUCCESS]${logPrefix}${colors.reset} ${message}`,
        ...args
      );
    },

    debug: (message: string, ...args: any[]) => {
      if (process.env.DEBUG === "true") {
        console.log(
          `${colors.gray}[DEBUG]${logPrefix}${colors.reset} ${message}`,
          ...args
        );
      }
    },
  };
};
