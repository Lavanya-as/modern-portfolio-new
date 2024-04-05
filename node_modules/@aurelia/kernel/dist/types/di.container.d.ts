import { IContainer, type Key, type IResolver, type Resolved, type IContainerConfiguration } from './di';
import type { IAllResolver, INewInstanceResolver, ILazyResolver, IResolvedLazy, IOptionalResolver, IFactoryResolver, IResolvedFactory } from './di.resolvers';
export declare const Registrable: Readonly<{
    /**
     * Associate an object as a registrable, making the container recognize & use
     * the specific given register function during the registration
     */
    define: <T extends WeakKey>(object: T, register: (this: T, container: IContainer) => IContainer | void) => T;
    get: <T_1 extends WeakKey>(object: T_1) => ((container: IContainer) => IContainer | void) | undefined;
    has: <T_2 extends WeakKey>(object: T_2) => boolean;
}>;
export declare const DefaultResolver: {
    none(key: Key): IResolver;
    singleton: (key: Key) => IResolver;
    transient: (key: Key) => IResolver;
};
export declare class ContainerConfiguration implements IContainerConfiguration {
    readonly inheritParentResources: boolean;
    readonly defaultResolver: (key: Key, handler: IContainer) => IResolver;
    static readonly DEFAULT: ContainerConfiguration;
    private constructor();
    static from(config?: IContainerConfiguration): ContainerConfiguration;
}
export type IResolvedInjection<K extends Key> = K extends IAllResolver<infer R> ? Resolved<R>[] : K extends INewInstanceResolver<infer R> ? Resolved<R> : K extends ILazyResolver<infer R> ? IResolvedLazy<R> : K extends IOptionalResolver<infer R> ? Resolved<R> | undefined : K extends IFactoryResolver<infer R> ? IResolvedFactory<R> : K extends IResolver<infer R> ? Resolved<R> : K extends [infer R1 extends Key, ...infer R2] ? [IResolvedInjection<R1>, ...IResolvedInjection<R2>] : K extends {
    __resolved__: infer T;
} ? T : Resolved<K>;
/**
 * Retrieve the resolved value of a key, or values of a list of keys from the currently active container.
 *
 * Calling this without an active container will result in an error.
 */
export declare function resolve<K extends Key>(key: K): IResolvedInjection<K>;
export declare function resolve<K extends Key[]>(...keys: K): IResolvedInjection<K>;
//# sourceMappingURL=di.container.d.ts.map