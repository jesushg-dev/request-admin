export class UserNotFoundErr extends Error {}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ConcurrentModificationError extends Error {
  constructor(message: string = 'Database update conflict occurred') {
    super(message);
    this.name = 'ConcurrentModificationError';
  }
}
