import type { Primitive } from '@aurelia/kernel';
import type { AccessorType, IAccessor, ISubscribable } from '../observation';
export declare class PrimitiveObserver implements IAccessor, ISubscribable {
    get doNotCache(): true;
    type: AccessorType;
    constructor(obj: Primitive, key: PropertyKey);
    getValue(): unknown;
    setValue(): void;
    subscribe(): void;
    unsubscribe(): void;
}
//# sourceMappingURL=primitive-observer.d.ts.map