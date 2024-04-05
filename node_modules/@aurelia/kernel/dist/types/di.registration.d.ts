import { type Key, IRegistration, type ResolveCallback, type Resolved, type IRegistry } from './di';
import { Constructable } from './interfaces';
/**
 * you can use the resulting {@linkcode IRegistration} of any of the factory methods
 * to register with the container, e.g.
 * ```
 * class Foo {}
 * const container = DI.createContainer();
 * container.register(Registration.instance(Foo, new Foo()));
 * container.get(Foo);
 * ```
 */
export declare const Registration: {
    /**
     * allows you to pass an instance.
     * Every time you request this {@linkcode Key} you will get this instance back.
     * ```
     * Registration.instance(Foo, new Foo()));
     * ```
     *
     * @param key - key to register the instance with
     * @param value - the instance associated with the key
     */
    instance: <T>(key: Key, value: T) => IRegistration<T>;
    /**
     * Creates an instance from the class.
     * Every time you request this {@linkcode Key} you will get the same one back.
     * ```
     * Registration.singleton(Foo, Foo);
     * ```
     *
     * @param key - key to register the singleton class with
     * @param value - the singleton class to instantiate when a container resolves the associated key
     */
    singleton: <T_1 extends Constructable>(key: Key, value: T_1) => IRegistration<InstanceType<T_1>>;
    /**
     * Creates an instance from a class.
     * Every time you request this {@linkcode Key} you will get a new instance.
     * ```
     * Registration.instance(Foo, Foo);
     * ```
     *
     * @param key - key to register the transient class with
     * @param value - the class to instantiate when a container resolves the associated key
     */
    transient: <T_2 extends Constructable>(key: Key, value: T_2) => IRegistration<InstanceType<T_2>>;
    /**
     * Creates an instance from the method passed.
     * Every time you request this {@linkcode Key} you will get a new instance.
     * ```
     * Registration.callback(Foo, () => new Foo());
     * Registration.callback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
     * ```
     *
     * @param key - key to register the callback with
     * @param callback - the callback to invoke when a container resolves the associated key
     */
    callback: <T_3>(key: Key, callback: ResolveCallback<T_3>) => IRegistration<Resolved<T_3>>;
    /**
     * Creates an instance from the method passed.
     * On the first request for the {@linkcode Key} your callback is called and returns an instance.
     * subsequent requests for the {@linkcode Key}, the initial instance returned will be returned.
     * If you pass the same {@linkcode Registration} to another container the same cached value will be used.
     * Should all references to the resolver returned be removed, the cache will expire.
     * ```
     * Registration.cachedCallback(Foo, () => new Foo());
     * Registration.cachedCallback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
     * ```
     *
     * @param key - key to register the cached callback with
     * @param callback - the cache callback to invoke when a container resolves the associated key
     */
    cachedCallback: <T_4>(key: Key, callback: ResolveCallback<T_4>) => IRegistration<Resolved<T_4>>;
    /**
     * creates an alternate {@linkcode Key} to retrieve an instance by.
     * Returns the same scope as the original {@linkcode Key}.
     * ```
     * Register.singleton(Foo, Foo)
     * Register.aliasTo(Foo, MyFoos);
     *
     * container.getAll(MyFoos) // contains an instance of Foo
     * ```
     *
     * @param originalKey - the real key to resolve the get call from a container
     * @param aliasKey - the key that a container allows to resolve the real key associated
     */
    aliasTo: <T_5>(originalKey: T_5, aliasKey: Key) => IRegistration<Resolved<T_5>>;
    /**
     * @internal
     * @param key - the key to register a defer registration
     * @param params - the parameters that should be passed to the resolution of the key
     */
    defer: (key: Key, ...params: unknown[]) => IRegistry;
};
//# sourceMappingURL=di.registration.d.ts.map