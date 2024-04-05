const s = "pending";

const t = "running";

const i = "completed";

const h = "canceled";

const e = new Map;

const notImplemented = s => () => {
    throw createError(`AUR1005:${s}`);
};

class Platform {
    constructor(s, t = {}) {
        this.macroTaskRequested = false;
        this.macroTaskHandle = -1;
        this.globalThis = s;
        "decodeURI decodeURIComponent encodeURI encodeURIComponent Date Reflect console".split(" ").forEach((i => {
            this[i] = i in t ? t[i] : s[i];
        }));
        "clearInterval clearTimeout queueMicrotask setInterval setTimeout".split(" ").forEach((i => {
            this[i] = i in t ? t[i] : s[i]?.bind(s) ?? notImplemented(i);
        }));
        this.performanceNow = "performanceNow" in t ? t.performanceNow : s.performance?.now?.bind(s.performance) ?? notImplemented("performance.now");
        this.flushMacroTask = this.flushMacroTask.bind(this);
        this.taskQueue = new TaskQueue(this, this.requestMacroTask.bind(this), this.cancelMacroTask.bind(this));
    }
    static getOrCreate(s, t = {}) {
        let i = e.get(s);
        if (i === void 0) {
            e.set(s, i = new Platform(s, t));
        }
        return i;
    }
    static set(s, t) {
        e.set(s, t);
    }
    requestMacroTask() {
        this.macroTaskRequested = true;
        if (this.macroTaskHandle === -1) {
            this.macroTaskHandle = this.setTimeout(this.flushMacroTask, 0);
        }
    }
    cancelMacroTask() {
        this.macroTaskRequested = false;
        if (this.macroTaskHandle > -1) {
            this.clearTimeout(this.macroTaskHandle);
            this.macroTaskHandle = -1;
        }
    }
    flushMacroTask() {
        this.macroTaskHandle = -1;
        if (this.macroTaskRequested === true) {
            this.macroTaskRequested = false;
            this.taskQueue.flush();
        }
    }
}

class TaskQueue {
    get isEmpty() {
        return this.t === 0 && this.i.length === 0 && this.h.length === 0 && this.u.length === 0;
    }
    get T() {
        return this.t === 0 && this.i.every(isPersistent) && this.h.every(isPersistent) && this.u.every(isPersistent);
    }
    constructor(s, t, i) {
        this.platform = s;
        this.$request = t;
        this.$cancel = i;
        this.$ = void 0;
        this.t = 0;
        this.i = [];
        this.h = [];
        this.u = [];
        this.R = false;
        this.A = void 0;
        this.P = [];
        this.M = 0;
        this.U = 0;
        this.q = 0;
        this.I = () => {
            if (!this.R) {
                this.R = true;
                this.U = this._();
                this.$request();
            }
        };
        this._ = s.performanceNow;
        this.C = new Tracer(s.console);
    }
    flush(s = this._()) {
        this.R = false;
        this.q = s;
        if (this.$ === void 0) {
            if (this.h.length > 0) {
                this.i.push(...this.h);
                this.h.length = 0;
            }
            if (this.u.length > 0) {
                let t = -1;
                while (++t < this.u.length && this.u[t].queueTime <= s) {}
                this.i.push(...this.u.splice(0, t));
            }
            let i;
            while (this.i.length > 0) {
                (i = this.i.shift()).run();
                if (i.status === t) {
                    if (i.suspend === true) {
                        this.$ = i;
                        this.I();
                        return;
                    } else {
                        ++this.t;
                    }
                }
            }
            if (this.h.length > 0) {
                this.i.push(...this.h);
                this.h.length = 0;
            }
            if (this.u.length > 0) {
                let t = -1;
                while (++t < this.u.length && this.u[t].queueTime <= s) {}
                this.i.push(...this.u.splice(0, t));
            }
            if (this.i.length > 0 || this.u.length > 0 || this.t > 0) {
                this.I();
            }
            if (this.A !== void 0 && this.T) {
                const s = this.A;
                this.A = void 0;
                s.resolve();
            }
        } else {
            this.I();
        }
    }
    cancel() {
        if (this.R) {
            this.$cancel();
            this.R = false;
        }
    }
    async yield() {
        if (this.isEmpty) ; else {
            if (this.A === void 0) {
                this.A = createExposedPromise();
            }
            await this.A;
        }
    }
    queueTask(s, t) {
        const {delay: i, preempt: h, persistent: e, reusable: o, suspend: n} = {
            ...r,
            ...t
        };
        if (h) {
            if (i > 0) {
                throw preemptDelayComboError();
            }
            if (e) {
                throw preemptyPersistentComboError();
            }
        }
        if (this.i.length === 0) {
            this.I();
        }
        const c = this._();
        let a;
        if (o) {
            const t = this.P;
            const r = this.M - 1;
            if (r >= 0) {
                a = t[r];
                t[r] = void 0;
                this.M = r;
                a.reuse(c, i, h, e, n, s);
            } else {
                a = new Task(this.C, this, c, c + i, h, e, n, o, s);
            }
        } else {
            a = new Task(this.C, this, c, c + i, h, e, n, o, s);
        }
        if (h) {
            this.i[this.i.length] = a;
        } else if (i === 0) {
            this.h[this.h.length] = a;
        } else {
            this.u[this.u.length] = a;
        }
        return a;
    }
    remove(s) {
        let t = this.i.indexOf(s);
        if (t > -1) {
            this.i.splice(t, 1);
            return;
        }
        t = this.h.indexOf(s);
        if (t > -1) {
            this.h.splice(t, 1);
            return;
        }
        t = this.u.indexOf(s);
        if (t > -1) {
            this.u.splice(t, 1);
            return;
        }
        throw createError(`Task #${s.id} could not be found`);
    }
    N(s) {
        this.P[this.M++] = s;
    }
    j(s) {
        s.reset(this._());
        if (s.createdTime === s.queueTime) {
            this.h[this.h.length] = s;
        } else {
            this.u[this.u.length] = s;
        }
    }
    F(s) {
        if (s.suspend === true) {
            if (this.$ !== s) {
                throw createError(`Async task completion mismatch: suspenderTask=${this.$?.id}, task=${s.id}`);
            }
            this.$ = void 0;
        } else {
            --this.t;
        }
        if (this.A !== void 0 && this.T) {
            const s = this.A;
            this.A = void 0;
            s.resolve();
        }
        if (this.isEmpty) {
            this.cancel();
        }
    }
}

class TaskAbortError extends Error {
    constructor(s) {
        super("Task was canceled.");
        this.task = s;
    }
}

let o = 0;

class Task {
    get result() {
        const e = this.O;
        if (e === void 0) {
            switch (this.W) {
              case s:
                {
                    const s = this.O = createExposedPromise();
                    this.B = s.resolve;
                    this.G = s.reject;
                    return s;
                }

              case t:
                throw createError("Trying to await task from within task will cause a deadlock.");

              case i:
                return this.O = Promise.resolve();

              case h:
                return this.O = Promise.reject(new TaskAbortError(this));
            }
        }
        return e;
    }
    get status() {
        return this.W;
    }
    constructor(t, i, h, e, r, n, c, a, l) {
        this.taskQueue = i;
        this.createdTime = h;
        this.queueTime = e;
        this.preempt = r;
        this.persistent = n;
        this.suspend = c;
        this.reusable = a;
        this.callback = l;
        this.id = ++o;
        this.B = void 0;
        this.G = void 0;
        this.O = void 0;
        this.W = s;
        this.C = t;
    }
    run(e = this.taskQueue.platform.performanceNow()) {
        if (this.W !== s) {
            throw createError(`Cannot run task in ${this.W} state`);
        }
        const {persistent: o, reusable: r, taskQueue: n, callback: c, B: a, G: l, createdTime: f} = this;
        let u;
        this.W = t;
        try {
            u = c(e - f);
            if (u instanceof Promise) {
                u.then((s => {
                    if (this.persistent) {
                        n.j(this);
                    } else {
                        if (o) {
                            this.W = h;
                        } else {
                            this.W = i;
                        }
                        this.dispose();
                    }
                    n.F(this);
                    if (false && this.C.enabled) ;
                    if (a !== void 0) {
                        a(s);
                    }
                    if (!this.persistent && r) {
                        n.N(this);
                    }
                })).catch((s => {
                    if (!this.persistent) {
                        this.dispose();
                    }
                    n.F(this);
                    if (false && this.C.enabled) ;
                    if (l !== void 0) {
                        l(s);
                    } else {
                        throw s;
                    }
                }));
            } else {
                if (this.persistent) {
                    n.j(this);
                } else {
                    if (o) {
                        this.W = h;
                    } else {
                        this.W = i;
                    }
                    this.dispose();
                }
                if (false && this.C.enabled) ;
                if (a !== void 0) {
                    a(u);
                }
                if (!this.persistent && r) {
                    n.N(this);
                }
            }
        } catch (s) {
            if (!this.persistent) {
                this.dispose();
            }
            if (l !== void 0) {
                l(s);
            } else {
                throw s;
            }
        }
    }
    cancel() {
        if (this.W === s) {
            const s = this.taskQueue;
            const t = this.reusable;
            const i = this.G;
            s.remove(this);
            if (s.isEmpty) {
                s.cancel();
            }
            this.W = h;
            this.dispose();
            if (t) {
                s.N(this);
            }
            if (i !== void 0) {
                i(new TaskAbortError(this));
            }
            return true;
        } else if (this.W === t && this.persistent) {
            this.persistent = false;
            return true;
        }
        return false;
    }
    reset(t) {
        const i = this.queueTime - this.createdTime;
        this.createdTime = t;
        this.queueTime = t + i;
        this.W = s;
        this.B = void 0;
        this.G = void 0;
        this.O = void 0;
    }
    reuse(t, i, h, e, o, r) {
        this.createdTime = t;
        this.queueTime = t + i;
        this.preempt = h;
        this.persistent = e;
        this.suspend = o;
        this.callback = r;
        this.W = s;
    }
    dispose() {
        this.callback = void 0;
        this.B = void 0;
        this.G = void 0;
        this.O = void 0;
    }
}

class Tracer {
    constructor(s) {
        this.console = s;
        this.enabled = false;
        this.depth = 0;
    }
    enter(s, t) {
        this.log(`${"  ".repeat(this.depth++)}> `, s, t);
    }
    leave(s, t) {
        this.log(`${"  ".repeat(--this.depth)}< `, s, t);
    }
    trace(s, t) {
        this.log(`${"  ".repeat(this.depth)}- `, s, t);
    }
    log(s, t, i) {
        if (t instanceof TaskQueue) {
            const h = t.i.length;
            const e = t.h.length;
            const o = t.u.length;
            const r = t.R;
            const n = !!t.$;
            const c = `processing=${h} pending=${e} delayed=${o} flushReq=${r} susTask=${n}`;
            this.console.log(`${s}[Q.${i}] ${c}`);
        } else {
            const h = t["id"];
            const e = Math.round(t["createdTime"] * 10) / 10;
            const o = Math.round(t["queueTime"] * 10) / 10;
            const r = t["preempt"];
            const n = t["reusable"];
            const c = t["persistent"];
            const a = t["suspend"];
            const l = t["W"];
            const f = `id=${h} created=${e} queue=${o} preempt=${r} persistent=${c} reusable=${n} status=${l} suspend=${a}`;
            this.console.log(`${s}[T.${i}] ${f}`);
        }
    }
}

const r = {
    delay: 0,
    preempt: false,
    persistent: false,
    reusable: true,
    suspend: false
};

let n;

let c;

const executor = (s, t) => {
    n = s;
    c = t;
};

const createExposedPromise = () => {
    const s = new Promise(executor);
    s.resolve = n;
    s.reject = c;
    return s;
};

const isPersistent = s => s.persistent;

const preemptDelayComboError = () => createError(`AUR1006`);

const preemptyPersistentComboError = () => createError(`AUR1007`);

const createError = s => new Error(s);

const reportTaskQueue = s => {
    const t = s.i;
    const i = s.h;
    const h = s.u;
    const e = s.R;
    return {
        processing: t,
        pending: i,
        delayed: h,
        flushRequested: e
    };
};

const ensureEmpty = s => {
    s.flush();
    s.h.forEach((s => s.cancel()));
};

export { Platform, Task, TaskAbortError, TaskQueue, ensureEmpty, reportTaskQueue };

