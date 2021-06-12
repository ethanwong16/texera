/**
 * assert.ts maintains a set of useful assertion functions.
 * They are used to provide type hints to help Typescript analyze code.
 */
interface Primitives {
  number: number;
  boolean: boolean;
  string: string;
  object: object;
}

type AnyType = { new (...args: any[]): any } | keyof Primitives;

type GuardedType<T extends AnyType> = T extends { new(...args: any[]): infer U; } ? U : T extends keyof Primitives ? Primitives[T] : never;

/**
 * isType returns true if val is of type (uses typeof and insteanceof, so only works with classes and primitives, not interfaces and types)
 * e.g. isType(foo, 'string') or isType(foo, Foo)
 * for primitives, pass a string of the primitive name ('number' or 'boolean' or 'string')
 * @param val value
 * @param type class, can be string for primitives
 * @returns boolean
 */
export function isType<T extends AnyType>(val: any, type: T): val is GuardedType<T> {
  const interfaceType: AnyType = type;
  if (typeof interfaceType === 'string' ) {
    return typeof val === interfaceType;
  }
  return val instanceof interfaceType;
}

/**
 * safely cast value (uses typeof and insteanceof, so only works with classes and primitives, not interfaces and types)
 * @param val value
 * @param type class, can be string for primitives
 * @returns value, but type is now known
 */
export function asType<T extends AnyType>(val: any, type: T): GuardedType<T> {
  if (!isType(val, type)) {
    throw new TypeError(`Type Guard expected value ${val} to be of type ${type}, but received ${typeof val}`);
  }
  return val;
}

/**
 * isNonNull returns true if value is not null or undefined
 * @param val value
 * @returns boolean
 */
export function isNonNull<T>(val: T): val is NonNullable<T> {
  return val !== undefined && val !== null;
}

/**
 * safely cast value to NonNullable<T>, (this removes null from string|null type, etc)
 * @param val value
 * @returns value, but it's known to not be null or undefined
 */
export function nonNull<T>(val: T): NonNullable<T> {
  if (!isNonNull(val)) {
    throw new TypeError(`Type Guard expected value ${val} to not be null or undefined`);
  }
  return val;
}
