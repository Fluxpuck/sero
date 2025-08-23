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
 * Simple logger utility for the API
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`${colors.blue}[INFO] ${message} ${colors.reset}`, ...args);
  },

  warn: (message: string, ...args: any[]) => {
    console.log(`${colors.yellow}[WARN]${colors.reset} ${message}`, ...args);
  },

  error: (message: string, ...args: any[]) => {
    console.error(`${colors.red}[ERROR] ${message} ${colors.reset}`, ...args);
  },

  success: (message: string, ...args: any[]) => {
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`, ...args);
  },

  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`${colors.gray}[DEBUG]${colors.reset} ${message}`, ...args);
    }
  },
};
