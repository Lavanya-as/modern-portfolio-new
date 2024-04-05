import { type AccessorType, type ISubscriberCollection, type ICollectionSubscriberCollection, type IObserver, type ICollectionObserver, type IndexMap, type ISubscriber } from '../observation';
import { CollectionLengthObserver } from './collection-length-observer';
export declare function enableArrayObservation(): void;
export declare function disableArrayObservation(): void;
export interface ArrayObserver extends ICollectionObserver<'array'>, ICollectionSubscriberCollection {
}
export declare class ArrayObserver {
    type: AccessorType;
    private readonly indexObservers;
    private lenObs?;
    constructor(array: unknown[]);
    notify(): void;
    getLengthObserver(): CollectionLengthObserver;
    getIndexObserver(index: number): IArrayIndexObserver;
}
export interface IArrayIndexObserver extends IObserver {
    owner: ICollectionObserver<'array'>;
}
export interface ArrayIndexObserver extends IArrayIndexObserver, ISubscriberCollection {
}
export declare class ArrayIndexObserver implements IArrayIndexObserver {
    readonly owner: ArrayObserver;
    readonly index: number;
    doNotCache: boolean;
    value: unknown;
    constructor(owner: ArrayObserver, index: number);
    getValue(): unknown;
    setValue(newValue: unknown): void;
    /**
     * From interface `ICollectionSubscriber`
     */
    handleCollectionChange(_arr: unknown[], indexMap: IndexMap): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
}
export declare function getArrayObserver(array: unknown[]): ArrayObserver;
//# sourceMappingURL=array-observer.d.ts.map