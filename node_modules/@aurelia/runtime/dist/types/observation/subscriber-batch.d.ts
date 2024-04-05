import { type ISubscriberRecord, type ICollectionSubscriber, type IndexMap, type Collection } from '../observation';
import type { IAnySubscriber } from './subscriber-collection';
export declare let batching: boolean;
export declare function batch(fn: () => unknown): void;
export declare function addCollectionBatch(subs: ISubscriberRecord<ICollectionSubscriber>, collection: Collection, indexMap: IndexMap): void;
export declare function addValueBatch(subs: ISubscriberRecord<IAnySubscriber>, newValue: unknown, oldValue: unknown): void;
//# sourceMappingURL=subscriber-batch.d.ts.map