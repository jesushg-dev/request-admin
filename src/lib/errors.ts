/**
 * Custom error classes for the application
 */

export class IncompleteCategoryChainError extends Error {
  public categoryName: string;

  constructor(categoryName: string) {
    super(`Cannot activate category "${categoryName}": incomplete children chain`);
    this.name = 'IncompleteCategoryChainError';
    this.categoryName = categoryName;
  }
}
