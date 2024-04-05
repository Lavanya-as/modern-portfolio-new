import { IContainer, IResolver, Key, Resolved } from './di';
export type ICallableResolver<T> = IResolver<T> & ((...args: unknown[]) => any);
/**
 * ! Semi private API to avoid repetitive work creating resolvers.
 *
 * Naming isn't entirely correct, but it's good enough for internal usage.
 */
export declare function createResolver<T extends Key>(getter: (key: T, handler: IContainer, requestor: IContainer) => any): ((key: T) => ICallableResolver<T>);
/**
 * Create a resolver that will resolve all values of a key from resolving container
 */
export declare const all: <T extends Key>(key: T, searchAncestors?: boolean) => IAllResolver<T>;
export type IAllResolver<T> = IResolver<Resolved<T>[]> & {
    __isAll: undefined;
    (...args: unknown[]): any;
};
/**
 * Lazily inject a dependency depending on whether the [[`Key`]] is present at the time of function call.
 *
 * You need to make your argument a function that returns the type, for example
 * ```ts
 * class Foo {
 *   constructor( @lazy('random') public random: () => number )
 * }
 * const foo = container.get(Foo); // instanceof Foo
 * foo.random(); // throws
 * ```
 * would throw an exception because you haven't registered `'random'` before calling the method. This, would give you a
 * new [['Math.random()']] number each time.
 * ```ts
 * class Foo {
 *   constructor( @lazy('random') public random: () => random )
 * }
 * container.register(Registration.callback('random', Math.random ));
 * container.get(Foo).random(); // some random number
 * container.get(Foo).random(); // another random number
 * ```
 * `@lazy` does not manage the lifecycle of the underlying key. If you want a singleton, you have to register as a
 * `singleton`, `transient` would also behave as you would expect, providing you a new instance each time.
 *
 * - @param key [[`Key`]]
 * see { @link DI.createInterface } on interactions with interfaces
 */
export declare const lazy: <K extends Key>(key: K) => ILazyResolver<K>;
export type ILazyResolver<K extends Key = Key> = IResolver<() => K> & {
    __isLazy: undefined;
} & ((...args: unknown[]) => any);
export type IResolvedLazy<K> = () => Resolved<K>;
/**
 * Allows you to optionally inject a dependency depending on whether the [[`Key`]] is present, for example
 * ```ts
 * class Foo {
 *   constructor( @inject('mystring') public str: string = 'somestring' )
 * }
 * container.get(Foo); // throws
 * ```
 * would fail
 * ```ts
 * class Foo {
 *   constructor( @optional('mystring') public str: string = 'somestring' )
 * }
 * container.get(Foo).str // somestring
 * ```
 * if you use it without a default it will inject `undefined`, so rember to mark your input type as
 * possibly `undefined`!
 *
 * - @param key: [[`Key`]]
 *
 * see { @link DI.createInterface } on interactions with interfaces
 */
export declare const optional: <K extends Key>(key: K) => IOptionalResolver<K>;
export type IOptionalResolver<K extends Key = Key> = IResolver<K | undefined> & {
    __isOptional: undefined;
    (...args: unknown[]): any;
};
/**
 * ignore tells the container not to try to inject a dependency
 */
export declare const ignore: IResolver<undefined>;
/**
 * Inject a function that will return a resolved instance of the [[key]] given.
 * Also supports passing extra parameters to the invocation of the resolved constructor of [[key]]
 *
 * For typings, it's a function that take 0 or more arguments and return an instance. Example:
 * ```ts
 * class Foo {
 *   constructor( @factory(MyService) public createService: (...args: unknown[]) => MyService)
 * }
 * const foo = container.get(Foo); // instanceof Foo
 * const myService_1 = foo.createService('user service')
 * const myService_2 = foo.createService('content service')
 * ```
 *
 * ```ts
 * class Foo {
 *   constructor( @factory('random') public createRandomizer: () => Randomizer)
 * }
 * container.get(Foo).createRandomizer(); // create a randomizer
 * ```
 * would throw an exception because you haven't registered `'random'` before calling the method. This, would give you a
 * new instance of Randomizer each time.
 *
 * `@factory` does not manage the lifecycle of the underlying key. If you want a singleton, you have to register as a
 * `singleton`, `transient` would also behave as you would expect, providing you a new instance each time.
 *
 * - @param key [[`Key`]]
 * see { @link DI.createInterface } on interactions with interfaces
 */
export declare const factory: <K>(key: K) => IFactoryResolver<K>;
export type IFactoryResolver<K = any> = IResolver<K> & {
    __isFactory: undefined;
} & ((...args: unknown[]) => any);
export type IResolvedFactory<K> = (...args: unknown[]) => Resolved<K>;
/**
 * Create a resolver that will only resolve if the requesting container has the key pre-registered
 */
export declare const own: <T extends Key>(key: T) => IOptionalResolver<T>;
/**
 * Create a resolver that will resolve a key based on resource semantic (leaf + root + ignore middle layer container)
 * Will resolve at the root level if the key is not registered in the requestor container
 */
export declare const resource: <K extends Key>(key: K) => ICallableResolver<K>;
/**
 * Create a resolver that will resolve a key based on resource semantic (leaf + root + ignore middle layer container)
 * only if the key is registered either in the requestor container or in the root container
 *
 * Returns `undefined` if the key is not registered in either container
 */
export declare const optionalResource: <K extends Key>(key: K) => IOptionalResolver<K>;
/**
 * Create a resolver for resolving all registrations of a key with resource semantic (leaf + root + ignore middle layer container)
 */
export declare const allResources: <T>(key: T) => IAllResolver<T>;
/**
 * Create a resolver that will resolve a new instance of a key, and register the newly created instance with the requestor container
 */
export declare const newInstanceForScope: <K>(key: K) => INewInstanceResolver<K>;
/**
 * Create a resolver that will resolve a new instance of a key
 */
export declare const newInstanceOf: <K>(key: K) => INewInstanceResolver<K>;
export type INewInstanceResolver<T> = IResolver<T> & {
    __newInstance: undefined;
    (...args: unknown[]): any;
};
//# sourceMappingURL=di.resolvers.d.ts.map