interface IHasId<T> {
  readonly id: T
}

/**
 * `IHasStringId` interface specifies that the id property should be a string.
 */
export interface IHasStringId extends IHasId<string> {}
