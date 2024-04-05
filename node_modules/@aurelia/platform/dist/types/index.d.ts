declare const tsPending: "pending";
declare const tsRunning: "running";
declare const tsCompleted: "completed";
declare const tsCanceled: "canceled";
export type TaskStatus = typeof tsPending | typeof tsRunning | typeof tsCompleted | typeof tsCanceled;
export declare class Platform<TGlobal extends typeof globalThis = typeof globalThis> {
    readonly globalThis: TGlobal;
    readonly decodeURI: TGlobal['decodeURI'];
    readonly decodeURIComponent: TGlobal['decodeURIComponent'];
    readonly encodeURI: TGlobal['encodeURI'];
    readonly encodeURIComponent: TGlobal['encodeURIComponent'];
    readonly Date: TGlobal['Date'];
    readonly Reflect: TGlobal['Reflect'];
    readonly clearInterval: TGlobal['clearInterval'];
    readonly clearTimeout: TGlobal['clearTimeout'];
    readonly queueMicrotask: TGlobal['queueMicrotask'];
    readonly setInterval: TGlobal['setInterval'];
    readonly setTimeout: TGlobal['setTimeout'];
    readonly console: TGlobal['console'];
    readonly performanceNow: () => number;
    readonly taskQueue: TaskQueue;
    constructor(g: TGlobal, overrides?: Partial<Exclude<Platform, 'globalThis'>>);
    static getOrCreate<TGlobal extends typeof globalThis = typeof globalThis>(g: TGlobal, overrides?: Partial<Exclude<Platform, 'globalThis'>>): Platform<TGlobal>;
    static set(g: typeof globalThis, platform: Platform): void;
    protected macroTaskRequested: boolean;
    protected macroTaskHandle: number;
    protected requestMacroTask(): void;
    protected cancelMacroTask(): void;
    protected flushMacroTask(): void;
}
type TaskCallback<T = any> = (delta: number) => T;
export declare class TaskQueue {
    readonly platform: Platform;
    private readonly $request;
    private readonly $cancel;
    get isEmpty(): boolean;
    constructor(platform: Platform, $request: () => void, $cancel: () => void);
    flush(time?: number): void;
    /**
     * Cancel the next flush cycle (and/or the macrotask that schedules the next flush cycle, in case this is a microtask queue), if it was requested.
     *
     * This operation is idempotent and will do nothing if no flush is scheduled.
     */
    cancel(): void;
    /**
     * Returns a promise that, when awaited, resolves when:
     * - all *non*-persistent (including async) tasks have finished;
     * - the last-added persistent task has run exactly once;
     *
     * This operation is idempotent: the same promise will be returned until it resolves.
     *
     * If `yield()` is called multiple times in a row when there are one or more persistent tasks in the queue, each call will await exactly one cycle of those tasks.
     */
    yield(): Promise<void>;
    queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): Task<T>;
    /**
     * Remove the task from this queue.
     */
    remove<T = any>(task: Task<T>): void;
}
export declare class TaskAbortError<T = any> extends Error {
    task: Task<T>;
    constructor(task: Task<T>);
}
type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export interface ITask<T = any> {
    readonly result: Promise<UnwrapPromise<T>>;
    readonly status: TaskStatus;
    run(): void;
    cancel(): boolean;
}
export declare class Task<T = any> implements ITask {
    readonly taskQueue: TaskQueue;
    createdTime: number;
    queueTime: number;
    preempt: boolean;
    persistent: boolean;
    suspend: boolean;
    readonly reusable: boolean;
    callback: TaskCallback<T>;
    readonly id: number;
    get result(): Promise<UnwrapPromise<T>>;
    get status(): TaskStatus;
    constructor(tracer: Tracer, taskQueue: TaskQueue, createdTime: number, queueTime: number, preempt: boolean, persistent: boolean, suspend: boolean, reusable: boolean, callback: TaskCallback<T>);
    run(time?: number): void;
    cancel(): boolean;
    reset(time: number): void;
    reuse(time: number, delay: number, preempt: boolean, persistent: boolean, suspend: boolean, callback: TaskCallback<T>): void;
    dispose(): void;
}
export type QueueTaskOptions = {
    /**
     * The number of milliseconds to wait before queueing the task.
     *
     * NOTE: just like `setTimeout`, there is no guarantee that the task will actually run
     * after the specified delay. It is merely a *minimum* delay.
     *
     * Defaults to `0`
     */
    delay?: number;
    /**
     * If `true`, the task will be run synchronously if it is the same priority as the
     * `TaskQueue` that is currently flushing. Otherwise, it will be run on the next tick.
     *
     * Defaults to `false`
     */
    preempt?: boolean;
    /**
     * If `true`, the task will be added back onto the queue after it finished running, indefinitely, until manually canceled.
     *
     * Defaults to `false`
     */
    persistent?: boolean;
    /**
     * If `true`, the task will be kept in-memory after finishing, so that it can be reused for future tasks for efficiency.
     *
     * Defaults to `true`
     */
    reusable?: boolean;
    /**
     * If `true`, and the task callback returns a promise, that promise will be awaited before consecutive tasks are run.
     *
     * Defaults to `false`.
     */
    suspend?: boolean;
};
declare class Tracer {
    private readonly console;
    enabled: boolean;
    private depth;
    constructor(console: Platform['console']);
    enter(obj: TaskQueue | Task, method: string): void;
    leave(obj: TaskQueue | Task, method: string): void;
    trace(obj: TaskQueue | Task, method: string): void;
    private log;
}
/**
 * Retrieve internal tasks information of a TaskQueue
 */
export declare const reportTaskQueue: (taskQueue: TaskQueue) => {
    processing: Task<any>[];
    pending: Task<any>[];
    delayed: Task<any>[];
    flushRequested: boolean;
};
/**
 * Flush a taskqueue and cancel all the tasks that are queued by the flush
 * Mainly for debugging purposes
 */
export declare const ensureEmpty: (taskQueue: TaskQueue) => void;
export {};
//# sourceMappingURL=index.d.ts.map