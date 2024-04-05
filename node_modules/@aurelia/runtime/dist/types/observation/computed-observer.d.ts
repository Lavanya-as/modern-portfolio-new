import { ICoercionConfiguration, IObserver, InterceptorFunc } from '../observation';
import type { AccessorType, ISubscriber, ICollectionSubscriber, ISubscriberCollection, IConnectable } from '../observation';
import type { IConnectableBinding } from '../binding/connectable';
import type { IObserverLocator } from './observer-locator';
export type ComputedGetterFn<T = any, R = any> = (this: T, obj: T, observer: IConnectable) => R;
export interface ComputedObserver<T extends object> extends IConnectableBinding, ISubscriberCollection {
}
export declare class ComputedObserver<T extends object> implements IObserver, IConnectableBinding, ISubscriber, ICollectionSubscriber, ISubscriberCollection {
    type: AccessorType;
    /**
     * The getter this observer is wrapping
     */
    readonly $get: ComputedGetterFn<T>;
    /**
     * The setter this observer is wrapping
     */
    readonly $set: undefined | ((v: unknown) => void);
    /**
     * A semi-private property used by connectable mixin
     */
    readonly oL: IObserverLocator;
    constructor(obj: T, get: ComputedGetterFn<T>, set: undefined | ((v: unknown) => void), observerLocator: IObserverLocator, useProxy: boolean);
    init(value: unknown): void;
    getValue(): any;
    setValue(v: unknown): void;
    useCoercer(coercer: InterceptorFunc, coercionConfig?: ICoercionConfiguration | undefined): boolean;
    useCallback(callback: (newValue: unknown, oldValue: unknown) => void): boolean;
    handleChange(): void;
    handleCollectionChange(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    private run;
    private compute;
}
//# sourceMappingURL=computed-observer.d.ts.map