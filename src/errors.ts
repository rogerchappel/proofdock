export class ProofdockError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ProofdockError';
    this.code = code;
    this.details = details;
  }
}
