export enum Err {
  NO_RESULTS = "NO_RESULTS",
  AMBIGUOUS = "AMBIGUOUS", 
  RATE_LIMITED = "RATE_LIMITED",
  UPSTREAM_DOWN = "UPSTREAM_DOWN",
  INVALID_INPUT = "INVALID_INPUT",
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

export const ERR_MSG: Record<Err, string> = {
  [Err.NO_RESULTS]: "No matches found. Try a different title, author, or genre.",
  [Err.AMBIGUOUS]: "Too many matches. Please be more specific.",
  [Err.RATE_LIMITED]: "Whoa there! You're going too fast. Give me a moment, then try again.",
  [Err.UPSTREAM_DOWN]: "One of our book sources is temporarily down. Try again in a few minutes.",
  [Err.INVALID_INPUT]: "I didn't understand that request. Try using a book title or author name.",
  [Err.AUTHENTICATION_FAILED]: "There's an authentication issue with one of the services. Please contact support.",
  [Err.PERMISSION_DENIED]: "Access denied to the requested resource.",
  [Err.NETWORK_ERROR]: "Network connectivity issue. Please try again.",
  [Err.TIMEOUT]: "That request took too long. Please try again.",
  [Err.UNKNOWN_ERROR]: "Something unexpected happened. Please try again or contact support."
};

export class BookFairyError extends Error {
  constructor(
    public readonly code: Err,
    message?: string,
    public readonly cause?: Error
  ) {
    super(message || ERR_MSG[code]);
    this.name = 'BookFairyError';
  }
  
  toUserMessage(): string {
    return ERR_MSG[this.code];
  }
}
