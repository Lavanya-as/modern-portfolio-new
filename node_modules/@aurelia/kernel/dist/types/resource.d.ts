import { IContainer } from './di';
import { Constructable } from './interfaces';
export type ResourceType<TUserType extends Constructable = Constructable, TResInstance extends {} = {}, TResType extends {} = {}, TUserInstance extends InstanceType<TUserType> = InstanceType<TUserType>> = (new (...args: any[]) => TResInstance & TUserInstance) & {
    readonly aliases?: readonly string[];
} & TResType & TUserType;
export type ResourceDefinition<TUserType extends Constructable = Constructable, TResInstance extends {} = {}, TDef extends {} = {}, TResType extends {} = {}, TUserInstance extends InstanceType<TUserType> = InstanceType<TUserType>> = {
    /**
     * Unique key to identify the resource.
     */
    readonly key: string;
    /**
     * A common name for the resource.
     */
    readonly name: string;
    readonly Type: ResourceType<TUserType, TResInstance, TResType, TUserInstance>;
    readonly aliases?: readonly string[];
    /**
     * @param aliasName - If provided, the resource will be registered with this alias key.
     */
    register(container: IContainer, aliasName?: string): void;
} & TDef;
export type PartialResourceDefinition<TDef extends {} = {}> = {
    readonly name: string;
    readonly aliases?: readonly string[];
} & TDef;
export interface IResourceKind<TType extends ResourceType, TDef extends ResourceDefinition> {
    readonly name: string;
    keyFrom(name: string): string;
}
export declare const resourceBaseName = "au:resource";
/**
 * Builds a resource key from the provided parts.
 */
export declare const getResourceKeyFor: (type: string, name?: string, context?: string) => string;
export declare const Protocol: {
    annotation: Readonly<{
        name: "au:annotation";
        appendTo: (target: Constructable, key: string) => void;
        set(target: Constructable, prop: string, value: unknown): void;
        get: (target: Constructable, prop: string) => unknown;
        getKeys(target: Constructable): readonly string[];
        isKey: (key: string) => boolean;
        keyFor: (name: string, context?: string) => string;
    }>;
};
/**
 * The order in which the values are checked:
 * 1. Annotations (usually set by decorators) have the highest priority; they override the definition as well as static properties on the type.
 * 2. Definition properties (usually set by the customElement decorator object literal) come next. They override static properties on the type.
 * 3. Static properties on the type come last. Note that this does not look up the prototype chain (bindables are an exception here, but we do that differently anyway)
 * 4. The default property that is provided last. The function is only called if the default property is needed
 */
export declare function fromAnnotationOrDefinitionOrTypeOrDefault<TDef extends PartialResourceDefinition, K extends keyof TDef>(name: K, def: TDef, Type: Constructable, getDefault: () => Required<TDef>[K]): Required<TDef>[K];
/**
 * The order in which the values are checked:
 * 1. Annotations (usually set by decorators) have the highest priority; they override static properties on the type.
 * 2. Static properties on the typ. Note that this does not look up the prototype chain (bindables are an exception here, but we do that differently anyway)
 * 3. The default property that is provided last. The function is only called if the default property is needed
 */
export declare function fromAnnotationOrTypeOrDefault<T, K extends keyof T, V>(name: K, Type: T, getDefault: () => V): V;
/**
 * The order in which the values are checked:
 * 1. Definition properties.
 * 2. The default property that is provided last. The function is only called if the default property is needed
 */
export declare function fromDefinitionOrDefault<TDef extends PartialResourceDefinition, K extends keyof TDef>(name: K, def: TDef, getDefault: () => Required<TDef>[K]): Required<TDef>[K];
//# sourceMappingURL=resource.d.ts.map