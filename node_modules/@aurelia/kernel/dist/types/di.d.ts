import { Constructable, IDisposable } from './interfaces';
import { ResourceType } from './resource';
import type { IAllResolver, ICallableResolver, IFactoryResolver, ILazyResolver, INewInstanceResolver, IOptionalResolver, IResolvedFactory, IResolvedLazy } from './di.resolvers';
export type ResolveCallback<T = any> = (handler: IContainer, requestor: IContainer, resolver: IResolver<T>) => T;
export type InterfaceSymbol<K = any> = (target: Injectable | AbstractInjectable, property: string | symbol | undefined, index?: number) => void;
interface IResolverLike<C, K = any> {
    readonly $isResolver: true;
    resolve(handler: C, requestor: C): Resolved<K>;
    getFactory?(container: C): (K extends Constructable ? IFactory<K> : never) | null;
}
export interface IResolver<K = any> extends IResolverLike<IContainer, K> {
}
export interface IDisposableResolver<K = any> extends IResolver<K> {
    dispose(): void;
}
export interface IRegistration<K = any> {
    register(container: IContainer, key?: Key): IResolver<K>;
}
export type Transformer<K> = (instance: Resolved<K>) => Resolved<K>;
export interface IFactory<T extends Constructable = any> {
    readonly Type: T;
    registerTransformer(transformer: Transformer<T>): void;
    construct(container: IContainer, dynamicDependencies?: unknown[]): Resolved<T>;
}
export interface IServiceLocator {
    readonly root: IServiceLocator;
    has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean;
    get<K extends Key>(key: IAllResolver<K>): Resolved<K>[];
    get<K extends Key>(key: INewInstanceResolver<K>): Resolved<K>;
    get<K extends Key>(key: ILazyResolver<K>): IResolvedLazy<K>;
    get<K extends Key>(key: IOptionalResolver<K>): Resolved<K> | undefined;
    get<K extends Key>(key: IFactoryResolver<K>): IResolvedFactory<K>;
    get<K extends Key>(key: ICallableResolver<K>): Resolved<K>;
    get<K extends Key>(key: IResolver<K>): Resolved<K>;
    get<K extends Key>(key: K): Resolved<K>;
    get<K extends Key>(key: Key): Resolved<K>;
    get<K extends Key>(key: K | Key): Resolved<K>;
    getAll<K extends Key>(key: K, searchAncestors?: boolean): Resolved<K>[];
    getAll<K extends Key>(key: Key, searchAncestors?: boolean): Resolved<K>[];
    getAll<K extends Key>(key: K | Key, searchAncestors?: boolean): Resolved<K>[];
}
export interface IRegistry {
    register(container: IContainer, ...params: unknown[]): void | IResolver | IContainer;
}
export interface IContainer extends IServiceLocator, IDisposable {
    readonly id: number;
    readonly root: IContainer;
    readonly parent: IContainer | null;
    register(...params: any[]): IContainer;
    registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>, isDisposable?: boolean): IResolver<T>;
    registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean;
    getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null;
    registerFactory<T extends Constructable>(key: T, factory: IFactory<T>): void;
    invoke<T extends {}, TDeps extends unknown[] = unknown[]>(key: Constructable<T>, dynamicDependencies?: TDeps): T;
    hasFactory<T extends Constructable>(key: any): boolean;
    getFactory<T extends Constructable>(key: T): IFactory<T>;
    createChild(config?: IContainerConfiguration): IContainer;
    disposeResolvers(): void;
    /**
     * Register resources from another container, an API for manually registering resources
     *
     * This is a semi private API, apps should avoid using it directly
     */
    useResources(container: IContainer): void;
    find<TResType extends ResourceType>(key: string): TResType | null;
}
export declare class ResolverBuilder<K> {
    constructor(
    /** @internal */ _container: IContainer, 
    /** @internal */ _key: Key);
    instance(value: K): IResolver<K>;
    singleton(value: Constructable): IResolver<K>;
    transient(value: Constructable): IResolver<K>;
    callback(value: ResolveCallback<K>): IResolver<K>;
    cachedCallback(value: ResolveCallback<K>): IResolver<K>;
    aliasTo(destinationKey: Key): IResolver<K>;
}
export type RegisterSelf<T extends Constructable> = {
    register(container: IContainer): IResolver<InstanceType<T>>;
    registerInRequestor: boolean;
};
export type Key = PropertyKey | object | InterfaceSymbol | Constructable | IResolver;
export type Resolved<K> = (K extends InterfaceSymbol<infer T> ? T : K extends Constructable ? InstanceType<K> : K extends IResolverLike<any, infer T1> ? T1 extends Constructable ? InstanceType<T1> : T1 : K);
export type Injectable<T = {}> = Constructable<T> & {
    inject?: Key[];
};
export type AbstractInjectable<T = {}> = (abstract new (...args: any[]) => T) & {
    inject?: Key[];
};
export interface IContainerConfiguration {
    /**
     * If `true`, `createChild` will inherit the resource resolvers from its parent container
     * instead of only from the root container.
     *
     * Setting this flag will not implicitly perpetuate it in the child container hierarchy.
     * It must be explicitly set on each call to `createChild`.
     */
    inheritParentResources?: boolean;
    defaultResolver?(key: Key, handler: IContainer): IResolver;
}
export declare const inject: (...dependencies: Key[]) => (target: Injectable, key?: string | number, descriptor?: PropertyDescriptor | number) => void;
export declare const DI: {
    createContainer: (config?: Partial<IContainerConfiguration> | undefined) => IContainer;
    getDesignParamtypes: (Type: Constructable | Injectable) => readonly Key[] | undefined;
    getAnnotationParamtypes: (Type: Constructable | Injectable) => readonly Key[] | undefined;
    getOrCreateAnnotationParamTypes: (Type: Constructable | Injectable) => Key[];
    getDependencies: (Type: Constructable | Injectable) => Key[];
    /**
     * creates a decorator that also matches an interface and can be used as a {@linkcode Key}.
     * ```ts
     * const ILogger = DI.createInterface<Logger>('Logger');
     * container.register(Registration.singleton(ILogger, getSomeLogger()));
     * const log = container.get(ILogger);
     * log.info('hello world');
     * class Foo {
     *   constructor( @ILogger log: ILogger ) {
     *     log.info('hello world');
     *   }
     * }
     * ```
     * you can also build default registrations into your interface.
     * ```ts
     * export const ILogger = DI.createInterface<Logger>('Logger', builder => builder.cachedCallback(LoggerDefault));
     * const log = container.get(ILogger);
     * log.info('hello world');
     * class Foo {
     *   constructor( @ILogger log: ILogger ) {
     *     log.info('hello world');
     *   }
     * }
     * ```
     * but these default registrations won't work the same with other decorators that take keys, for example
     * ```ts
     * export const MyStr = DI.createInterface<string>('MyStr', builder => builder.instance('somestring'));
     * class Foo {
     *   constructor( @optional(MyStr) public readonly str: string ) {
     *   }
     * }
     * container.get(Foo).str; // returns undefined
     * ```
     * to fix this add this line somewhere before you do a `get`
     * ```ts
     * container.register(MyStr);
     * container.get(Foo).str; // returns 'somestring'
     * ```
     *
     * - @param configureOrName - supply a string to improve error messaging
     */
    createInterface: <K extends Key>(configureOrName?: string | ((builder: ResolverBuilder<K>) => IResolver<K>) | undefined, configuror?: ((builder: ResolverBuilder<K>) => IResolver<K>) | undefined) => InterfaceSymbol<K>;
    inject: (...dependencies: Key[]) => (target: Injectable, key?: string | number, descriptor?: PropertyDescriptor | number) => void;
    /**
     * Registers the `target` class as a transient dependency; each time the dependency is resolved
     * a new instance will be created.
     *
     * @param target - The class / constructor function to register as transient.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     *
     * @example ```ts
     * // On an existing class
     * class Foo { }
     * DI.transient(Foo);
     *
     * // Inline declaration
     * const Foo = DI.transient(class { });
     * // Foo is now strongly typed with register
     * Foo.register(container);
     * ```
     */
    transient<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
    /**
     * Registers the `target` class as a singleton dependency; the class will only be created once. Each
     * consecutive time the dependency is resolved, the same instance will be returned.
     *
     * @param target - The class / constructor function to register as a singleton.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     * @example ```ts
     * // On an existing class
     * class Foo { }
     * DI.singleton(Foo);
     *
     * // Inline declaration
     * const Foo = DI.singleton(class { });
     * // Foo is now strongly typed with register
     * Foo.register(container);
     * ```
     */
    singleton<T_1 extends Constructable>(target: T_1 & Partial<RegisterSelf<T_1>>, options?: SingletonOptions): T_1 & RegisterSelf<T_1>;
};
export declare const IContainer: InterfaceSymbol<IContainer>;
export declare const IServiceLocator: InterfaceSymbol<IServiceLocator>;
declare function transientDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
/**
 * Registers the decorated class as a transient dependency; each time the dependency is resolved
 * a new instance will be created.
 *
 * @example ```ts
 * &#64;transient()
 * class Foo { }
 * ```
 */
export declare function transient<T extends Constructable>(): typeof transientDecorator;
/**
 * Registers the `target` class as a transient dependency; each time the dependency is resolved
 * a new instance will be created.
 *
 * @param target - The class / constructor function to register as transient.
 *
 * @example ```ts
 * &#64;transient()
 * class Foo { }
 * ```
 */
export declare function transient<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
type SingletonOptions = {
    scoped: boolean;
};
declare const singletonDecorator: <T extends Constructable>(target: T & Partial<RegisterSelf<T>>) => T & RegisterSelf<T>;
/**
 * Registers the decorated class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * @example ```ts
 * &#64;singleton()
 * class Foo { }
 * ```
 */
export declare function singleton<T extends Constructable>(): typeof singletonDecorator;
export declare function singleton<T extends Constructable>(options?: SingletonOptions): typeof singletonDecorator;
/**
 * Registers the `target` class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * @param target - The class / constructor function to register as a singleton.
 *
 * @example ```ts
 * &#64;singleton()
 * class Foo { }
 * ```
 */
export declare function singleton<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
export declare class InstanceProvider<K extends Key> implements IDisposableResolver<K | null> {
    get friendlyName(): string | undefined;
    constructor(name?: string, 
    /**
     * if not undefined, then this is the value this provider will resolve to
     * until overridden by explicit prepare call
     */
    instance?: Resolved<K> | null, Type?: Constructable | null);
    prepare(instance: Resolved<K>): void;
    get $isResolver(): true;
    resolve(): Resolved<K> | null;
    getFactory(container: IContainer): (K extends Constructable ? IFactory<K> : never) | null;
    dispose(): void;
}
/**
 * An implementation of IRegistry that delegates registration to a
 * separately registered class. The ParameterizedRegistry facilitates the
 * passing of parameters to the final registry.
 */
export declare class ParameterizedRegistry implements IRegistry {
    private readonly key;
    private readonly params;
    constructor(key: Key, params: unknown[]);
    register(container: IContainer): void;
}
export {};
//# sourceMappingURL=di.d.ts.map