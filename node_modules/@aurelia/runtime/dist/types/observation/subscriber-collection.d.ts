import type { Collection, ICollectionSubscriber, IndexMap, ISubscriber, ISubscriberRecord } from '../observation';
export type IAnySubscriber = ISubscriber | ICollectionSubscriber;
export declare function subscriberCollection(): ClassDecorator;
export declare function subscriberCollection(target: Function): void;
export declare class SubscriberRecord<T extends IAnySubscriber> implements ISubscriberRecord<T> {
    count: number;
    add(subscriber: T): boolean;
    remove(subscriber: T): boolean;
    notify(val: unknown, oldVal: unknown): void;
    notifyCollection(collection: Collection, indexMap: IndexMap): void;
}
//# sourceMappingURL=subscriber-collection.d.ts.map