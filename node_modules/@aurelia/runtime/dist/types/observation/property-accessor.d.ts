import type { AccessorType, IAccessor } from '../observation';
export declare class PropertyAccessor implements IAccessor {
    type: AccessorType;
    getValue(obj: object, key: string): unknown;
    setValue(value: unknown, obj: object, key: string): void;
}
//# sourceMappingURL=property-accessor.d.ts.map