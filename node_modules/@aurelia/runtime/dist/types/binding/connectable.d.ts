import type { Class } from '@aurelia/kernel';
import type { IConnectable, ISubscribable, ISubscriber, IBinding, ICollectionSubscriber, ICollectionSubscribable } from '../observation';
import type { IObserverLocator } from '../observation/observer-locator';
export interface IConnectableBinding extends IConnectable, IBinding, ISubscriber, ICollectionSubscriber {
    oL: IObserverLocator;
    /**
     * A record storing observers that are currently subscribed to by this binding
     */
    obs: BindingObserverRecord;
}
type ObservationRecordImplType = {
    version: number;
    count: number;
} & Record<string, unknown>;
export interface BindingObserverRecord extends ObservationRecordImplType {
}
export declare class BindingObserverRecord {
    version: number;
    count: number;
    constructor(b: IConnectableBinding);
    /**
     * Add, and subscribe to a given observer
     */
    add(observer: ISubscribable | ICollectionSubscribable): void;
    /**
     * Unsubscribe the observers that are not up to date with the record version
     */
    clear(): void;
    clearAll(): void;
}
type Connectable = {
    oL: IObserverLocator;
} & IConnectable & Partial<ISubscriber & ICollectionSubscriber>;
type DecoratableConnectable<TProto, TClass> = Class<TProto & Connectable, TClass>;
type DecoratedConnectable<TProto, TClass> = Class<TProto & Connectable, TClass>;
declare function connectableDecorator<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass>;
export declare function connectable(): typeof connectableDecorator;
export declare function connectable<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass>;
export {};
//# sourceMappingURL=connectable.d.ts.map