import { ICoercionConfiguration, IObserver, InterceptorFunc } from '../observation';
import type { IIndexable } from '@aurelia/kernel';
import type { AccessorType, ISubscriber, ISubscriberCollection } from '../observation';
export interface SetterObserver extends ISubscriberCollection {
}
/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
export declare class SetterObserver implements IObserver, ISubscriberCollection {
    type: AccessorType;
    constructor(obj: IIndexable, key: PropertyKey);
    getValue(): unknown;
    setValue(newValue: unknown): void;
    useCallback(callback: (newValue: unknown, oldValue: unknown) => void): boolean;
    useCoercer(coercer: InterceptorFunc, coercionConfig?: ICoercionConfiguration | undefined): boolean;
    subscribe(subscriber: ISubscriber): void;
    start(): this;
    stop(): this;
}
//# sourceMappingURL=setter-observer.d.ts.map