export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class CoreLogger {
  private serviceName: string;

  constructor(serviceName: string = 'System') {
    this.serviceName = serviceName;
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] [${this.serviceName}] - ${message}${metaString}`;
  }

  public debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }

  public info(message: string, meta?: any): void {
    console.info(this.formatMessage(LogLevel.INFO, message, meta));
  }

  public warn(message: string, meta?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  public error(message: string, error?: Error | unknown, meta?: any): void {
    const errMeta = error instanceof Error 
      ? { ...meta, errorName: error.name, errorMessage: error.message, errorStack: error.stack }
      : { ...meta, errorRaw: error };
    console.error(this.formatMessage(LogLevel.ERROR, message, errMeta));
  }
}

export const logger = new CoreLogger();
export function createLogger(serviceName: string) {
  return new CoreLogger(serviceName);
}
