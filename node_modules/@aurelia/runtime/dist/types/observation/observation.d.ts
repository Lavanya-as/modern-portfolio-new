import { IObserverLocator } from './observer-locator';
import type { IConnectable } from '../observation';
export interface IObservation {
    /**
     * Run an effect function an track the dependencies inside it,
     * to re-run whenever a dependency has changed
     */
    run(fn: EffectRunFunc): IEffect;
    /**
     * Run a getter based on the given object as its first parameter and track the dependencies via this getter,
     * to call the callback whenever the value has changed
     */
    watch<T, R>(obj: T, getter: (obj: T, watcher: IConnectable) => R, callback: (value: R, oldValue: R | undefined) => unknown, options?: IWatchOptions): IEffect;
}
export declare const IObservation: import("@aurelia/kernel").InterfaceSymbol<IObservation>;
export interface IWatchOptions {
    /**
     * Indicates whether the callback of a watch should be immediately called on init
     */
    immediate?: boolean;
}
export declare class Observation implements IObservation {
    private readonly oL;
    static get inject(): import("@aurelia/kernel").InterfaceSymbol<IObserverLocator>[];
    constructor(oL: IObserverLocator);
    run(fn: EffectRunFunc): IEffect;
    watch<T, R>(obj: T, getter: (obj: T, watcher: IConnectable) => R, callback: (value: R, oldValue: R | undefined) => unknown, options?: IWatchOptions): IEffect;
}
export type EffectRunFunc = (this: IConnectable, runner: IConnectable) => void;
export interface IEffect {
    run(): void;
    stop(): void;
}
//# sourceMappingURL=observation.d.ts.map