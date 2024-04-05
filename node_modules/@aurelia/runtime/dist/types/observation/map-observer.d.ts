import { CollectionSizeObserver } from './collection-length-observer';
import type { AccessorType, ICollectionObserver, ICollectionSubscriberCollection } from '../observation';
export declare function enableMapObservation(): void;
export declare function disableMapObservation(): void;
export interface MapObserver extends ICollectionObserver<'map'>, ICollectionSubscriberCollection {
}
export declare class MapObserver {
    type: AccessorType;
    private lenObs?;
    constructor(map: Map<unknown, unknown>);
    notify(): void;
    getLengthObserver(): CollectionSizeObserver;
}
export declare function getMapObserver(map: Map<unknown, unknown>): MapObserver;
//# sourceMappingURL=map-observer.d.ts.map