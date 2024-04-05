import { type AccessorType, type ICollectionSubscriberCollection, type ICollectionObserver } from '../observation';
import { CollectionSizeObserver } from './collection-length-observer';
export declare function enableSetObservation(): void;
export declare function disableSetObservation(): void;
export interface SetObserver extends ICollectionObserver<'set'>, ICollectionSubscriberCollection {
}
export declare class SetObserver {
    type: AccessorType;
    private lenObs?;
    constructor(observedSet: Set<unknown>);
    notify(): void;
    getLengthObserver(): CollectionSizeObserver;
}
export declare function getSetObserver(observedSet: Set<unknown>): SetObserver;
//# sourceMappingURL=set-observer.d.ts.map