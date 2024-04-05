import { Constructable } from '@aurelia/kernel';
/**
 * A decorator to signal proxy observation shouldn't make an effort to wrap an object
 */
export declare function nowrap(target: Constructable): void;
export declare function nowrap(target: object, key: PropertyKey, descriptor?: PropertyDescriptor): void;
export declare function nowrap(): ClassDecorator | PropertyDecorator | any;
export declare function nowrap(target?: Constructable | object, key?: PropertyKey, descriptor?: PropertyDescriptor): ClassDecorator | PropertyDecorator;
//# sourceMappingURL=proxy-decorators.d.ts.map