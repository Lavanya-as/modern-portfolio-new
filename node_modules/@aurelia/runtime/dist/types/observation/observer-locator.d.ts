import { ComputedGetterFn } from './computed-observer';
import { PropertyAccessor } from './property-accessor';
import type { Collection, IAccessor, ICollectionObserver, IObserver, AccessorOrObserver, CollectionObserver } from '../observation';
export declare const propertyAccessor: PropertyAccessor;
export interface IObjectObservationAdapter {
    getObserver(object: unknown, key: PropertyKey, descriptor: PropertyDescriptor, requestor: IObserverLocator): IObserver | null;
}
export interface IObserverLocator extends ObserverLocator {
}
export declare const IObserverLocator: import("@aurelia/kernel").InterfaceSymbol<IObserverLocator>;
export interface INodeObserverLocator {
    handles(obj: unknown, key: PropertyKey, requestor: IObserverLocator): boolean;
    getObserver(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
    getAccessor(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
}
export declare const INodeObserverLocator: import("@aurelia/kernel").InterfaceSymbol<INodeObserverLocator>;
export type ExtendedPropertyDescriptor = PropertyDescriptor & {
    get?: ObservableGetter;
    set?: ObservableSetter;
};
export type ObservableGetter = PropertyDescriptor['get'] & {
    getObserver?(obj: unknown, requestor: IObserverLocator): IObserver;
};
export type ObservableSetter = PropertyDescriptor['set'] & {
    getObserver?(obj: unknown, requestor: IObserverLocator): IObserver;
};
export declare class ObserverLocator {
    addAdapter(adapter: IObjectObservationAdapter): void;
    getObserver(obj: unknown, key: PropertyKey): IObserver;
    getObserver<T, R>(obj: T, key: ComputedGetterFn<T, R>): IObserver<R>;
    getAccessor(obj: object, key: PropertyKey): AccessorOrObserver;
    getArrayObserver(observedArray: unknown[]): ICollectionObserver<'array'>;
    getMapObserver(observedMap: Map<unknown, unknown>): ICollectionObserver<'map'>;
    getSetObserver(observedSet: Set<unknown>): ICollectionObserver<'set'>;
    private createObserver;
}
export type RepeatableCollection = Collection | null | undefined | number;
export declare const getCollectionObserver: (collection: RepeatableCollection) => CollectionObserver | undefined;
export declare const getObserverLookup: <T extends IObserver<unknown>>(instance: object) => Record<PropertyKey, T>;
//# sourceMappingURL=observer-locator.d.ts.map