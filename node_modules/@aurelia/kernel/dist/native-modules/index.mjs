import { Metadata as t, isObject as e, applyMetadataPolyfill as n } from "../../../metadata/dist/native-modules/index.mjs";

const r = Object.freeze;

const s = Object.assign;

const o = String;

const i = t.getOwn;

t.hasOwn;

const l = t.define;

const isFunction = t => typeof t === "function";

const isString = t => typeof t === "string";

const createObject = () => Object.create(null);

const createMappedError = (t, ...e) => new Error(`AUR${o(t).padStart(4, "0")}:${e.map(o)}`);

const c = (() => {
    const t = {};
    let e = false;
    let n = 0;
    let r = 0;
    let s = 0;
    return o => {
        switch (typeof o) {
          case "number":
            return o >= 0 && (o | 0) === o;

          case "string":
            e = t[o];
            if (e !== void 0) {
                return e;
            }
            n = o.length;
            if (n === 0) {
                return t[o] = false;
            }
            r = 0;
            s = 0;
            for (;s < n; ++s) {
                r = charCodeAt(o, s);
                if (s === 0 && r === 48 && n > 1 || r < 48 || r > 57) {
                    return t[o] = false;
                }
            }
            return t[o] = true;

          default:
            return false;
        }
    };
})();

const u = /*@__PURE__*/ function() {
    const t = s(createObject(), {
        0: true,
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
        6: true,
        7: true,
        8: true,
        9: true
    });
    const charToKind = e => {
        if (e === "") {
            return 0;
        }
        if (e !== e.toUpperCase()) {
            return 3;
        }
        if (e !== e.toLowerCase()) {
            return 2;
        }
        if (t[e] === true) {
            return 1;
        }
        return 0;
    };
    return (t, e) => {
        const n = t.length;
        if (n === 0) {
            return t;
        }
        let r = false;
        let s = "";
        let o;
        let i = "";
        let l = 0;
        let c = t.charAt(0);
        let u = charToKind(c);
        let a = 0;
        for (;a < n; ++a) {
            o = l;
            i = c;
            l = u;
            c = t.charAt(a + 1);
            u = charToKind(c);
            if (l === 0) {
                if (s.length > 0) {
                    r = true;
                }
            } else {
                if (!r && s.length > 0 && l === 2) {
                    r = o === 3 || u === 3;
                }
                s += e(i, r);
                r = false;
            }
        }
        return s;
    };
}();

const a = /*@__PURE__*/ function() {
    const t = createObject();
    const callback = (t, e) => e ? t.toUpperCase() : t.toLowerCase();
    return e => {
        let n = t[e];
        if (n === void 0) {
            n = t[e] = u(e, callback);
        }
        return n;
    };
}();

const f = /*@__PURE__*/ function() {
    const t = createObject();
    return e => {
        let n = t[e];
        if (n === void 0) {
            n = a(e);
            if (n.length > 0) {
                n = n[0].toUpperCase() + n.slice(1);
            }
            t[e] = n;
        }
        return n;
    };
}();

const h = /*@__PURE__*/ function() {
    const t = createObject();
    const callback = (t, e) => e ? `-${t.toLowerCase()}` : t.toLowerCase();
    return e => {
        let n = t[e];
        if (n === void 0) {
            n = t[e] = u(e, callback);
        }
        return n;
    };
}();

const toArray = t => {
    const e = t.length;
    const n = Array(e);
    let r = 0;
    for (;r < e; ++r) {
        n[r] = t[r];
    }
    return n;
};

const bound = (t, e, n) => ({
    configurable: true,
    enumerable: n.enumerable,
    get() {
        const t = n.value.bind(this);
        Reflect.defineProperty(this, e, {
            value: t,
            writable: true,
            configurable: true,
            enumerable: n.enumerable
        });
        return t;
    }
});

const mergeArrays = (...t) => {
    const e = [];
    let n = 0;
    const r = t.length;
    let s = 0;
    let o;
    let i = 0;
    for (;i < r; ++i) {
        o = t[i];
        if (o !== void 0) {
            s = o.length;
            let t = 0;
            for (;t < s; ++t) {
                e[n++] = o[t];
            }
        }
    }
    return e;
};

const firstDefined = (...t) => {
    const e = t.length;
    let n;
    let r = 0;
    for (;e > r; ++r) {
        n = t[r];
        if (n !== void 0) {
            return n;
        }
    }
    throw createMappedError(20);
};

const v = /*@__PURE__*/ function() {
    const t = Function.prototype;
    const e = Object.getPrototypeOf;
    const n = new WeakMap;
    let r = t;
    let s = 0;
    let o = void 0;
    return function(i) {
        o = n.get(i);
        if (o === void 0) {
            n.set(i, o = [ r = i ]);
            s = 0;
            while ((r = e(r)) !== t) {
                o[++s] = r;
            }
        }
        return o;
    };
}();

function toLookup(...t) {
    return s(createObject(), ...t);
}

const d = /*@__PURE__*/ function() {
    const t = new WeakMap;
    let e = false;
    let n = "";
    let r = 0;
    return s => {
        e = t.get(s);
        if (e === void 0) {
            n = s.toString();
            r = n.length;
            e = r >= 29 && r <= 100 && charCodeAt(n, r - 1) === 125 && charCodeAt(n, r - 2) <= 32 && charCodeAt(n, r - 3) === 93 && charCodeAt(n, r - 4) === 101 && charCodeAt(n, r - 5) === 100 && charCodeAt(n, r - 6) === 111 && charCodeAt(n, r - 7) === 99 && charCodeAt(n, r - 8) === 32 && charCodeAt(n, r - 9) === 101 && charCodeAt(n, r - 10) === 118 && charCodeAt(n, r - 11) === 105 && charCodeAt(n, r - 12) === 116 && charCodeAt(n, r - 13) === 97 && charCodeAt(n, r - 14) === 110 && charCodeAt(n, r - 15) === 91;
            t.set(s, e);
        }
        return e;
    };
}();

const onResolve = (t, e) => {
    if (t instanceof Promise) {
        return t.then(e);
    }
    return e(t);
};

const onResolveAll = (...t) => {
    let e = void 0;
    let n = void 0;
    let r = void 0;
    let s = 0;
    let o = t.length;
    for (;s < o; ++s) {
        e = t[s];
        if ((e = t[s]) instanceof Promise) {
            if (n === void 0) {
                n = e;
            } else if (r === void 0) {
                r = [ n, e ];
            } else {
                r.push(e);
            }
        }
    }
    if (r === void 0) {
        return n;
    }
    return Promise.all(r);
};

const charCodeAt = (t, e) => t.charCodeAt(e);

const g = "au:annotation";

const getAnnotationKeyFor = (t, e) => {
    if (e === void 0) {
        return `${g}:${t}`;
    }
    return `${g}:${t}:${e}`;
};

const appendAnnotation = (t, e) => {
    const n = i(g, t);
    if (n === void 0) {
        l(g, [ e ], t);
    } else {
        n.push(e);
    }
};

const w = /*@__PURE__*/ r({
    name: "au:annotation",
    appendTo: appendAnnotation,
    set(t, e, n) {
        l(getAnnotationKeyFor(e), n, t);
    },
    get: (t, e) => i(getAnnotationKeyFor(e), t),
    getKeys(t) {
        let e = i(g, t);
        if (e === void 0) {
            l(g, e = [], t);
        }
        return e;
    },
    isKey: t => t.startsWith(g),
    keyFor: getAnnotationKeyFor
});

const y = "au:resource";

const getResourceKeyFor = (t, e, n) => {
    if (e == null) {
        return `${y}:${t}`;
    }
    if (n == null) {
        return `${y}:${t}:${e}`;
    }
    return `${y}:${t}:${e}:${n}`;
};

const m = {
    annotation: w
};

const p = Object.prototype.hasOwnProperty;

function fromAnnotationOrDefinitionOrTypeOrDefault(t, e, n, r) {
    let s = i(getAnnotationKeyFor(t), n);
    if (s === void 0) {
        s = e[t];
        if (s === void 0) {
            s = n[t];
            if (s === void 0 || !p.call(n, t)) {
                return r();
            }
            return s;
        }
        return s;
    }
    return s;
}

function fromAnnotationOrTypeOrDefault(t, e, n) {
    let r = i(getAnnotationKeyFor(t), e);
    if (r === void 0) {
        r = e[t];
        if (r === void 0 || !p.call(e, t)) {
            return n();
        }
        return r;
    }
    return r;
}

function fromDefinitionOrDefault(t, e, n) {
    const r = e[t];
    if (r === void 0) {
        return n();
    }
    return r;
}

const instanceRegistration = (t, e) => new Resolver(t, 0, e);

const singletonRegistration = (t, e) => new Resolver(t, 1, e);

const transientRegistation = (t, e) => new Resolver(t, 2, e);

const callbackRegistration = (t, e) => new Resolver(t, 3, e);

const cachedCallbackRegistration = (t, e) => new Resolver(t, 3, cacheCallbackResult(e));

const aliasToRegistration = (t, e) => new Resolver(e, 5, t);

const deferRegistration = (t, ...e) => new ParameterizedRegistry(t, e);

const R = new WeakMap;

const cacheCallbackResult = t => (e, n, r) => {
    let s = R.get(e);
    if (s === void 0) {
        R.set(e, s = new WeakMap);
    }
    if (s.has(r)) {
        return s.get(r);
    }
    const o = t(e, n, r);
    s.set(r, o);
    return o;
};

const C = {
    instance: instanceRegistration,
    singleton: singletonRegistration,
    transient: transientRegistation,
    callback: callbackRegistration,
    cachedCallback: cachedCallbackRegistration,
    aliasTo: aliasToRegistration,
    defer: deferRegistration
};

const b = /*@__PURE__*/ (() => {
    const t = new WeakMap;
    return r({
        define: (e, n) => {
            t.set(e, n);
            return e;
        },
        get: e => t.get(e),
        has: e => t.has(e)
    });
})();

const $ = {
    none(t) {
        throw createMappedError(2, t);
    },
    singleton: t => new Resolver(t, 1, t),
    transient: t => new Resolver(t, 2, t)
};

class ContainerConfiguration {
    constructor(t, e) {
        this.inheritParentResources = t;
        this.defaultResolver = e;
    }
    static from(t) {
        if (t === void 0 || t === ContainerConfiguration.DEFAULT) {
            return ContainerConfiguration.DEFAULT;
        }
        return new ContainerConfiguration(t.inheritParentResources ?? false, t.defaultResolver ?? $.singleton);
    }
}

ContainerConfiguration.DEFAULT = ContainerConfiguration.from({});

const createContainer = t => new Container(null, ContainerConfiguration.from(t));

const D = new Set("Array ArrayBuffer Boolean DataView Date Error EvalError Float32Array Float64Array Function Int8Array Int16Array Int32Array Map Number Object Promise RangeError ReferenceError RegExp Set SharedArrayBuffer String SyntaxError TypeError Uint8Array Uint8ClampedArray Uint16Array Uint32Array URIError WeakMap WeakSet".split(" "));

let L = 0;

let O = null;

class Container {
    get depth() {
        return this.t === null ? 0 : this.t.depth + 1;
    }
    get parent() {
        return this.t;
    }
    constructor(t, e) {
        this.id = ++L;
        this.i = 0;
        this.u = new Map;
        this.t = t;
        this.config = e;
        this.h = new Map;
        this.res = {};
        if (t === null) {
            this.root = this;
            this.R = new Map;
        } else {
            this.root = t.root;
            this.R = t.R;
            if (e.inheritParentResources) {
                for (const e in t.res) {
                    this.registerResolver(e, t.res[e]);
                }
            }
        }
        this.h.set(E, A);
    }
    register(...n) {
        if (++this.i === 100) {
            throw createMappedError(6, ...n);
        }
        let r;
        let s;
        let o;
        let i;
        let l;
        let c = 0;
        let u = n.length;
        let a;
        for (;c < u; ++c) {
            r = n[c];
            if (!e(r)) {
                continue;
            }
            if (isRegistry(r)) {
                r.register(this);
            } else if (b.has(r)) {
                b.get(r).call(r, this);
            } else if ((a = t.getOwn(y, r)) != null) {
                a.register(this);
            } else if (isClass(r)) {
                singletonRegistration(r, r).register(this);
            } else {
                s = Object.keys(r);
                i = 0;
                l = s.length;
                for (;i < l; ++i) {
                    o = r[s[i]];
                    if (!e(o)) {
                        continue;
                    }
                    if (isRegistry(o)) {
                        o.register(this);
                    } else if (b.has(o)) {
                        b.get(o).call(o, this);
                    } else {
                        this.register(o);
                    }
                }
            }
        }
        --this.i;
        return this;
    }
    registerResolver(t, e, n = false) {
        validateKey(t);
        const r = this.h;
        const s = r.get(t);
        if (s == null) {
            r.set(t, e);
            if (isResourceKey(t)) {
                if (this.res[t] !== void 0) {
                    throw createMappedError(7, t);
                }
                this.res[t] = e;
            }
        } else if (s instanceof Resolver && s.C === 4) {
            s._state.push(e);
        } else {
            r.set(t, new Resolver(t, 4, [ s, e ]));
        }
        if (n) {
            this.u.set(t, e);
        }
        return e;
    }
    registerTransformer(t, e) {
        const n = this.getResolver(t);
        if (n == null) {
            return false;
        }
        if (n.getFactory) {
            const t = n.getFactory(this);
            if (t == null) {
                return false;
            }
            t.registerTransformer(e);
            return true;
        }
        return false;
    }
    getResolver(t, e = true) {
        validateKey(t);
        if (t.resolve !== void 0) {
            return t;
        }
        const n = O;
        let r = O = this;
        let s;
        let o;
        try {
            while (r != null) {
                s = r.h.get(t);
                if (s == null) {
                    if (r.t == null) {
                        o = isRegisterInRequester(t) ? this : r;
                        if (e) {
                            return this.$(t, o);
                        }
                        return null;
                    }
                    r = r.t;
                } else {
                    return s;
                }
            }
        } finally {
            O = n;
        }
        return null;
    }
    has(t, e = false) {
        return this.h.has(t) || isResourceKey(t) && t in this.res || ((e && this.t?.has(t, true)) ?? false);
    }
    get(t) {
        validateKey(t);
        if (t.$isResolver) {
            return t.resolve(this, this);
        }
        const e = O;
        let n = O = this;
        let r;
        let s;
        try {
            while (n != null) {
                r = n.h.get(t);
                if (r == null) {
                    if (n.t == null) {
                        s = isRegisterInRequester(t) ? this : n;
                        r = this.$(t, s);
                        return r.resolve(n, this);
                    }
                    n = n.t;
                } else {
                    return r.resolve(n, this);
                }
            }
        } finally {
            O = e;
        }
        throw createMappedError(8, t);
    }
    getAll(t, e = false) {
        validateKey(t);
        const n = O;
        const r = O = this;
        let s = r;
        let o;
        let i = T;
        try {
            if (e) {
                while (s != null) {
                    o = s.h.get(t);
                    if (o != null) {
                        i = i.concat(buildAllResponse(o, s, r));
                    }
                    s = s.t;
                }
                return i;
            }
            while (s != null) {
                o = s.h.get(t);
                if (o == null) {
                    s = s.t;
                    if (s == null) {
                        return T;
                    }
                } else {
                    return buildAllResponse(o, s, r);
                }
            }
        } finally {
            O = n;
        }
        return T;
    }
    invoke(t, e) {
        if (d(t)) {
            throw createMappedError(15, t);
        }
        const n = O;
        O = this;
        try {
            return e === void 0 ? new t(...getDependencies(t).map(containerGetKey, this)) : new t(...getDependencies(t).map(containerGetKey, this), ...e);
        } finally {
            O = n;
        }
    }
    hasFactory(t) {
        return this.R.has(t);
    }
    getFactory(t) {
        let e = this.R.get(t);
        if (e === void 0) {
            if (d(t)) {
                throw createMappedError(15, t);
            }
            this.R.set(t, e = new Factory(t, getDependencies(t)));
        }
        return e;
    }
    registerFactory(t, e) {
        this.R.set(t, e);
    }
    createChild(t) {
        if (t === void 0 && this.config.inheritParentResources) {
            if (this.config === ContainerConfiguration.DEFAULT) {
                return new Container(this, this.config);
            }
            return new Container(this, ContainerConfiguration.from({
                ...this.config,
                inheritParentResources: false
            }));
        }
        return new Container(this, ContainerConfiguration.from(t ?? this.config));
    }
    disposeResolvers() {
        const t = this.h;
        const e = this.u;
        let n;
        let r;
        for ([r, n] of e.entries()) {
            n.dispose();
            t.delete(r);
        }
        e.clear();
    }
    useResources(t) {
        const e = t.res;
        for (const t in e) {
            this.registerResolver(t, e[t]);
        }
    }
    find(t) {
        let e = this;
        let n = e.res[t];
        if (n == null) {
            e = e.root;
            n = e.res[t];
        }
        if (n == null) {
            return null;
        }
        return n.getFactory?.(e)?.Type ?? null;
    }
    dispose() {
        if (this.u.size > 0) {
            this.disposeResolvers();
        }
        this.h.clear();
        if (this.root === this) {
            this.R.clear();
            this.res = {};
        }
    }
    $(t, e) {
        if (!isFunction(t)) {
            throw createMappedError(9, t);
        }
        if (D.has(t.name)) {
            throw createMappedError(10, t);
        }
        if (isRegistry(t)) {
            const n = t.register(e, t);
            if (!(n instanceof Object) || n.resolve == null) {
                const n = e.h.get(t);
                if (n != null) {
                    return n;
                }
                throw createMappedError(11, t);
            }
            return n;
        }
        if (t.$isInterface) {
            throw createMappedError(12, t.friendlyName);
        }
        const n = this.config.defaultResolver(t, e);
        e.h.set(t, n);
        return n;
    }
}

class Factory {
    constructor(t, e) {
        this.Type = t;
        this.dependencies = e;
        this.transformers = null;
    }
    construct(t, e) {
        const n = O;
        O = t;
        let r;
        try {
            if (e === void 0) {
                r = new this.Type(...this.dependencies.map(containerGetKey, t));
            } else {
                r = new this.Type(...this.dependencies.map(containerGetKey, t), ...e);
            }
            if (this.transformers == null) {
                return r;
            }
            return this.transformers.reduce(transformInstance, r);
        } finally {
            O = n;
        }
    }
    registerTransformer(t) {
        (this.transformers ??= []).push(t);
    }
}

function transformInstance(t, e) {
    return e(t);
}

function validateKey(t) {
    if (t === null || t === void 0) {
        throw createMappedError(14);
    }
}

function containerGetKey(t) {
    return this.get(t);
}

function resolve(...t) {
    if (O == null) {
        throw createMappedError(16, ...t);
    }
    return t.length === 1 ? O.get(t[0]) : t.map(containerGetKey, O);
}

const buildAllResponse = (t, e, n) => {
    if (t instanceof Resolver && t.C === 4) {
        const r = t._state;
        const s = r.length;
        const o = Array(s);
        let i = 0;
        for (;i < s; ++i) {
            o[i] = r[i].resolve(e, n);
        }
        return o;
    }
    return [ t.resolve(e, n) ];
};

const A = {
    $isResolver: true,
    resolve(t, e) {
        return e;
    }
};

const isRegistry = t => isFunction(t.register);

const isSelfRegistry = t => isRegistry(t) && typeof t.registerInRequestor === "boolean";

const isRegisterInRequester = t => isSelfRegistry(t) && t.registerInRequestor;

const isClass = t => t.prototype !== void 0;

const isResourceKey = t => isString(t) && t.indexOf(":") > 0;

n(Reflect, false, false);

class ResolverBuilder {
    constructor(t, e) {
        this.c = t;
        this.k = e;
    }
    instance(t) {
        return this.L(0, t);
    }
    singleton(t) {
        return this.L(1, t);
    }
    transient(t) {
        return this.L(2, t);
    }
    callback(t) {
        return this.L(3, t);
    }
    cachedCallback(t) {
        return this.L(3, cacheCallbackResult(t));
    }
    aliasTo(t) {
        return this.L(5, t);
    }
    L(t, e) {
        const {c: n, k: r} = this;
        this.c = this.k = void 0;
        return n.registerResolver(r, new Resolver(r, t, e));
    }
}

const cloneArrayWithPossibleProps = t => {
    const e = t.slice();
    const n = Object.keys(t);
    const r = n.length;
    let s;
    for (let o = 0; o < r; ++o) {
        s = n[o];
        if (!c(s)) {
            e[s] = t[s];
        }
    }
    return e;
};

const getAnnotationParamtypes = t => {
    const e = getAnnotationKeyFor("di:paramtypes");
    return i(e, t);
};

const getDesignParamtypes = t => i("design:paramtypes", t);

const getOrCreateAnnotationParamTypes = t => {
    const e = getAnnotationKeyFor("di:paramtypes");
    let n = i(e, t);
    if (n === void 0) {
        l(e, n = [], t);
        appendAnnotation(t, e);
    }
    return n;
};

const getDependencies = t => {
    const e = getAnnotationKeyFor("di:dependencies");
    let n = i(e, t);
    if (n === void 0) {
        const r = t.inject;
        if (r === void 0) {
            const e = getDesignParamtypes(t);
            const r = getAnnotationParamtypes(t);
            if (e === void 0) {
                if (r === void 0) {
                    const e = Object.getPrototypeOf(t);
                    if (isFunction(e) && e !== Function.prototype) {
                        n = cloneArrayWithPossibleProps(getDependencies(e));
                    } else {
                        n = [];
                    }
                } else {
                    n = cloneArrayWithPossibleProps(r);
                }
            } else if (r === void 0) {
                n = cloneArrayWithPossibleProps(e);
            } else {
                n = cloneArrayWithPossibleProps(e);
                let t = r.length;
                let s;
                let o = 0;
                for (;o < t; ++o) {
                    s = r[o];
                    if (s !== void 0) {
                        n[o] = s;
                    }
                }
                const i = Object.keys(r);
                let l;
                o = 0;
                t = i.length;
                for (o = 0; o < t; ++o) {
                    l = i[o];
                    if (!c(l)) {
                        n[l] = r[l];
                    }
                }
            }
        } else {
            n = cloneArrayWithPossibleProps(r);
        }
        l(e, n, t);
        appendAnnotation(t, e);
    }
    return n;
};

const createInterface = (t, e) => {
    const n = isFunction(t) ? t : e;
    const r = (isString(t) ? t : undefined) ?? "(anonymous)";
    const Interface = function(t, e, n) {
        if (t == null || new.target !== undefined) {
            throw createMappedError(1, r);
        }
        const s = getOrCreateAnnotationParamTypes(t);
        s[n] = Interface;
    };
    Interface.$isInterface = true;
    Interface.friendlyName = r;
    if (n != null) {
        Interface.register = (t, e) => n(new ResolverBuilder(t, e ?? Interface));
    }
    Interface.toString = () => `InterfaceSymbol<${r}>`;
    return Interface;
};

const inject = (...t) => (e, n, r) => {
    if (typeof r === "number") {
        const n = getOrCreateAnnotationParamTypes(e);
        const s = t[0];
        if (s !== void 0) {
            n[r] = s;
        }
    } else if (n) {
        const r = getOrCreateAnnotationParamTypes(e.constructor);
        const s = t[0];
        if (s !== void 0) {
            r[n] = s;
        }
    } else if (r) {
        const e = r.value;
        const n = getOrCreateAnnotationParamTypes(e);
        let s;
        let o = 0;
        for (;o < t.length; ++o) {
            s = t[o];
            if (s !== void 0) {
                n[o] = s;
            }
        }
    } else {
        const n = getOrCreateAnnotationParamTypes(e);
        let r;
        let s = 0;
        for (;s < t.length; ++s) {
            r = t[s];
            if (r !== void 0) {
                n[s] = r;
            }
        }
    }
};

const k = {
    createContainer: createContainer,
    getDesignParamtypes: getDesignParamtypes,
    getAnnotationParamtypes: getAnnotationParamtypes,
    getOrCreateAnnotationParamTypes: getOrCreateAnnotationParamTypes,
    getDependencies: getDependencies,
    createInterface: createInterface,
    inject: inject,
    transient(t) {
        t.register = function(e) {
            const n = transientRegistation(t, t);
            return n.register(e, t);
        };
        t.registerInRequestor = false;
        return t;
    },
    singleton(t, e = F) {
        t.register = function(e) {
            const n = singletonRegistration(t, t);
            return n.register(e, t);
        };
        t.registerInRequestor = e.scoped;
        return t;
    }
};

const E = /*@__PURE__*/ createInterface("IContainer");

const I = E;

function transientDecorator(t) {
    return k.transient(t);
}

function transient(t) {
    return t == null ? transientDecorator : transientDecorator(t);
}

const F = {
    scoped: false
};

const M = k.singleton;

function singleton(t) {
    if (isFunction(t)) {
        return M(t);
    }
    return function(e) {
        return M(e, t);
    };
}

class Resolver {
    get $isResolver() {
        return true;
    }
    constructor(t, e, n) {
        this.O = false;
        this.A = null;
        this.k = t;
        this.C = e;
        this._state = n;
    }
    register(t, e) {
        return t.registerResolver(e || this.k, this);
    }
    resolve(t, e) {
        switch (this.C) {
          case 0:
            return this._state;

          case 1:
            {
                if (this.O) {
                    throw createMappedError(3, this._state.name);
                }
                this.O = true;
                this._state = (this.A = t.getFactory(this._state)).construct(e);
                this.C = 0;
                this.O = false;
                return this._state;
            }

          case 2:
            {
                const n = t.getFactory(this._state);
                if (n === null) {
                    throw createMappedError(4, this.k);
                }
                return n.construct(e);
            }

          case 3:
            return this._state(t, e, this);

          case 4:
            return this._state[0].resolve(t, e);

          case 5:
            return e.get(this._state);

          default:
            throw createMappedError(5, this.C);
        }
    }
    getFactory(t) {
        switch (this.C) {
          case 1:
          case 2:
            return t.getFactory(this._state);

          case 5:
            return t.getResolver(this._state)?.getFactory?.(t) ?? null;

          case 0:
            return this.A;

          default:
            return null;
        }
    }
}

class InstanceProvider {
    get friendlyName() {
        return this.I;
    }
    constructor(t, e = null, n = null) {
        this.I = t;
        this.F = e;
        this.M = n;
    }
    prepare(t) {
        this.F = t;
    }
    get $isResolver() {
        return true;
    }
    resolve() {
        if (this.F == null) {
            throw createMappedError(13, this.I);
        }
        return this.F;
    }
    getFactory(t) {
        return this.M == null ? null : t.getFactory(this.M);
    }
    dispose() {
        this.F = null;
    }
}

class ParameterizedRegistry {
    constructor(t, e) {
        this.key = t;
        this.params = e;
    }
    register(t) {
        if (t.has(this.key, true)) {
            const e = t.get(this.key);
            e.register(t, ...this.params);
        } else {
            t.register(...this.params.filter((t => typeof t === "object")));
        }
    }
}

const T = r([]);

const _ = r({});

function noop() {}

const j = /*@__PURE__*/ createInterface("IPlatform");

function createResolver(t) {
    return function(e) {
        function Resolver(t, e, n) {
            inject(Resolver)(t, e, n);
        }
        Resolver.$isResolver = true;
        Resolver.resolve = function(n, r) {
            return t(e, n, r);
        };
        return Resolver;
    };
}

const all = (t, e = false) => {
    function resolver(t, e, n) {
        inject(resolver)(t, e, n);
    }
    resolver.$isResolver = true;
    resolver.resolve = (n, r) => r.getAll(t, e);
    return resolver;
};

const P = /*@__PURE__*/ createResolver(((t, e, n) => () => n.get(t)));

const S = /*@__PURE__*/ createResolver(((t, e, n) => {
    if (n.has(t, true)) {
        return n.get(t);
    } else {
        return undefined;
    }
}));

const K = /*@__PURE__*/ s(((t, e, n) => {
    inject(K)(t, e, n);
}), {
    $isResolver: true,
    resolve: () => void 0
});

const W = /*@__PURE__*/ createResolver(((t, e, n) => (...r) => e.getFactory(t).construct(n, r)));

const G = /*@__PURE__*/ createResolver(((t, e, n) => n.has(t, false) ? n.get(t) : void 0));

const N = /*@__PURE__*/ createResolver(((t, e, n) => n.has(t, false) ? n.get(t) : n.root.get(t)));

const B = /*@__PURE__*/ createResolver(((t, e, n) => n.has(t, false) ? n.get(t) : n.root.has(t, false) ? n.root.get(t) : void 0));

const z = /*@__PURE__*/ createResolver(((t, e, n) => n === n.root ? n.getAll(t, false) : n.has(t, false) ? n.getAll(t, false).concat(n.root.getAll(t, false)) : n.root.getAll(t, false)));

const Q = /*@__PURE__*/ createResolver(((t, e, n) => {
    const r = createNewInstance(t, e, n);
    const s = new InstanceProvider(o(t), r);
    n.registerResolver(t, s, true);
    return r;
}));

const U = /*@__PURE__*/ createResolver(((t, e, n) => createNewInstance(t, e, n)));

const createNewInstance = (t, e, n) => {
    if (e.hasFactory(t)) {
        return e.getFactory(t).construct(n);
    }
    if (isInterface(t)) {
        const r = isFunction(t.register);
        const s = e.getResolver(t, false);
        let o;
        if (s == null) {
            if (r) {
                o = (x ??= createContainer()).getResolver(t, true)?.getFactory?.(e);
            }
            x.dispose();
        } else {
            o = s.getFactory?.(e);
        }
        if (o != null) {
            return o.construct(n);
        }
        throw createMappedError(17, t);
    }
    return e.getFactory(t).construct(n);
};

const isInterface = t => isFunction(t) && t.$isInterface === true;

let x;

function __decorate(t, e, n, r) {
    var s = arguments.length, o = s < 3 ? e : r === null ? r = Object.getOwnPropertyDescriptor(e, n) : r, i;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") o = Reflect.decorate(t, e, n, r); else for (var l = t.length - 1; l >= 0; l--) if (i = t[l]) o = (s < 3 ? i(o) : s > 3 ? i(e, n, o) : i(e, n)) || o;
    return s > 3 && o && Object.defineProperty(e, n, o), o;
}

const H = 0;

const V = 1;

const q = 2;

const J = 3;

const X = 4;

const Y = 5;

const Z = 6;

const tt = r({
    trace: H,
    debug: V,
    info: q,
    warn: J,
    error: X,
    fatal: Y,
    none: Z
});

const et = /*@__PURE__*/ createInterface("ILogConfig", (t => t.instance(new LogConfig("no-colors", J))));

const nt = /*@__PURE__*/ createInterface("ISink");

const rt = /*@__PURE__*/ createInterface("ILogEventFactory", (t => t.singleton(DefaultLogEventFactory)));

const st = /*@__PURE__*/ createInterface("ILogger", (t => t.singleton(DefaultLogger)));

const ot = /*@__PURE__*/ createInterface("ILogScope");

const it = /*@__PURE__*/ r({
    key: getAnnotationKeyFor("logger-sink-handles"),
    define(t, e) {
        l(this.key, e.handles, t.prototype);
        return t;
    },
    getHandles(e) {
        return t.get(this.key, e);
    }
});

const sink = t => e => it.define(e, t);

const lt = toLookup({
    red(t) {
        return `[31m${t}[39m`;
    },
    green(t) {
        return `[32m${t}[39m`;
    },
    yellow(t) {
        return `[33m${t}[39m`;
    },
    blue(t) {
        return `[34m${t}[39m`;
    },
    magenta(t) {
        return `[35m${t}[39m`;
    },
    cyan(t) {
        return `[36m${t}[39m`;
    },
    white(t) {
        return `[37m${t}[39m`;
    },
    grey(t) {
        return `[90m${t}[39m`;
    }
});

class LogConfig {
    constructor(t, e) {
        this.colorOptions = t;
        this.level = e;
    }
}

const ct = function() {
    const t = {
        "no-colors": toLookup({
            TRC: "TRC",
            DBG: "DBG",
            INF: "INF",
            WRN: "WRN",
            ERR: "ERR",
            FTL: "FTL",
            QQQ: "???"
        }),
        colors: toLookup({
            TRC: lt.grey("TRC"),
            DBG: lt.grey("DBG"),
            INF: lt.white("INF"),
            WRN: lt.yellow("WRN"),
            ERR: lt.red("ERR"),
            FTL: lt.red("FTL"),
            QQQ: lt.grey("???")
        })
    };
    return (e, n) => {
        if (e <= H) {
            return t[n].TRC;
        }
        if (e <= V) {
            return t[n].DBG;
        }
        if (e <= q) {
            return t[n].INF;
        }
        if (e <= J) {
            return t[n].WRN;
        }
        if (e <= X) {
            return t[n].ERR;
        }
        if (e <= Y) {
            return t[n].FTL;
        }
        return t[n].QQQ;
    };
}();

const getScopeString = (t, e) => {
    if (e === "no-colors") {
        return t.join(".");
    }
    return t.map(lt.cyan).join(".");
};

const getIsoString = (t, e) => {
    if (e === "no-colors") {
        return new Date(t).toISOString();
    }
    return lt.grey(new Date(t).toISOString());
};

class DefaultLogEvent {
    constructor(t, e, n, r, s, o) {
        this.severity = t;
        this.message = e;
        this.optionalParams = n;
        this.scope = r;
        this.colorOptions = s;
        this.timestamp = o;
    }
    toString() {
        const {severity: t, message: e, scope: n, colorOptions: r, timestamp: s} = this;
        if (n.length === 0) {
            return `${getIsoString(s, r)} [${ct(t, r)}] ${e}`;
        }
        return `${getIsoString(s, r)} [${ct(t, r)} ${getScopeString(n, r)}] ${e}`;
    }
    getFormattedLogInfo(t = false) {
        const {severity: e, message: n, scope: r, colorOptions: s, timestamp: o, optionalParams: i} = this;
        let l = null;
        let c = "";
        if (t && n instanceof Error) {
            l = n;
        } else {
            c = n;
        }
        const u = r.length === 0 ? "" : ` ${getScopeString(r, s)}`;
        let a = `${getIsoString(o, s)} [${ct(e, s)}${u}] ${c}`;
        if (i === void 0 || i.length === 0) {
            return l === null ? [ a ] : [ a, l ];
        }
        let f = 0;
        while (a.includes("%s")) {
            a = a.replace("%s", String(i[f++]));
        }
        return l !== null ? [ a, l, ...i.slice(f) ] : [ a, ...i.slice(f) ];
    }
}

class DefaultLogEventFactory {
    constructor() {
        this.config = resolve(et);
    }
    createLogEvent(t, e, n, r) {
        return new DefaultLogEvent(e, n, r, t.scope, this.config.colorOptions, Date.now());
    }
}

class ConsoleSink {
    static register(t) {
        singletonRegistration(nt, ConsoleSink).register(t);
    }
    constructor(t = resolve(j)) {
        const e = t.console;
        this.handleEvent = function emit(t) {
            const n = t.getFormattedLogInfo(true);
            switch (t.severity) {
              case H:
              case V:
                return e.debug(...n);

              case q:
                return e.info(...n);

              case J:
                return e.warn(...n);

              case X:
              case Y:
                return e.error(...n);
            }
        };
    }
}

class DefaultLogger {
    constructor(t = resolve(et), e = resolve(rt), n = resolve(all(nt)), r = resolve(S(ot)) ?? [], s = null) {
        this.scope = r;
        this.T = createObject();
        let o;
        let i;
        let l;
        let c;
        let u;
        let a;
        this.config = t;
        this.f = e;
        this.sinks = n;
        if (s === null) {
            this.root = this;
            this.parent = this;
            o = this._ = [];
            i = this.j = [];
            l = this.P = [];
            c = this.K = [];
            u = this.W = [];
            a = this.G = [];
            for (const t of n) {
                const e = it.getHandles(t);
                if (e?.includes(H) ?? true) {
                    o.push(t);
                }
                if (e?.includes(V) ?? true) {
                    i.push(t);
                }
                if (e?.includes(q) ?? true) {
                    l.push(t);
                }
                if (e?.includes(J) ?? true) {
                    c.push(t);
                }
                if (e?.includes(X) ?? true) {
                    u.push(t);
                }
                if (e?.includes(Y) ?? true) {
                    a.push(t);
                }
            }
        } else {
            this.root = s.root;
            this.parent = s;
            o = this._ = s._;
            i = this.j = s.j;
            l = this.P = s.P;
            c = this.K = s.K;
            u = this.W = s.W;
            a = this.G = s.G;
        }
    }
    trace(t, ...e) {
        if (this.config.level <= H) {
            this.N(this._, H, t, e);
        }
    }
    debug(t, ...e) {
        if (this.config.level <= V) {
            this.N(this.j, V, t, e);
        }
    }
    info(t, ...e) {
        if (this.config.level <= q) {
            this.N(this.P, q, t, e);
        }
    }
    warn(t, ...e) {
        if (this.config.level <= J) {
            this.N(this.K, J, t, e);
        }
    }
    error(t, ...e) {
        if (this.config.level <= X) {
            this.N(this.W, X, t, e);
        }
    }
    fatal(t, ...e) {
        if (this.config.level <= Y) {
            this.N(this.G, Y, t, e);
        }
    }
    scopeTo(t) {
        const e = this.T;
        let n = e[t];
        if (n === void 0) {
            n = e[t] = new DefaultLogger(this.config, this.f, null, this.scope.concat(t), this);
        }
        return n;
    }
    N(t, e, n, r) {
        const s = isFunction(n) ? n() : n;
        const o = this.f.createLogEvent(this, e, s, r);
        for (let e = 0, n = t.length; e < n; ++e) {
            t[e].handleEvent(o);
        }
    }
}

__decorate([ bound ], DefaultLogger.prototype, "trace", null);

__decorate([ bound ], DefaultLogger.prototype, "debug", null);

__decorate([ bound ], DefaultLogger.prototype, "info", null);

__decorate([ bound ], DefaultLogger.prototype, "warn", null);

__decorate([ bound ], DefaultLogger.prototype, "error", null);

__decorate([ bound ], DefaultLogger.prototype, "fatal", null);

const ut = /*@__PURE__*/ toLookup({
    create({level: t = J, colorOptions: e = "no-colors", sinks: n = []} = {}) {
        return toLookup({
            register(r) {
                r.register(instanceRegistration(et, new LogConfig(e, t)));
                for (const t of n) {
                    if (isFunction(t)) {
                        r.register(singletonRegistration(nt, t));
                    } else {
                        r.register(t);
                    }
                }
                return r;
            }
        });
    }
});

const at = /*@__PURE__*/ createInterface((t => t.singleton(ModuleLoader)));

const noTransform = t => t;

class ModuleTransformer {
    constructor(t) {
        this.B = new Map;
        this.U = new Map;
        this.H = t;
    }
    transform(t) {
        if (t instanceof Promise) {
            return this.V(t);
        } else if (typeof t === "object" && t !== null) {
            return this.q(t);
        } else {
            throw createMappedError(21, t);
        }
    }
    V(t) {
        if (this.B.has(t)) {
            return this.B.get(t);
        }
        const e = t.then((t => this.q(t)));
        this.B.set(t, e);
        void e.then((e => {
            this.B.set(t, e);
        }));
        return e;
    }
    q(t) {
        if (this.U.has(t)) {
            return this.U.get(t);
        }
        const e = this.H(this.J(t));
        this.U.set(t, e);
        if (e instanceof Promise) {
            void e.then((e => {
                this.U.set(t, e);
            }));
        }
        return e;
    }
    J(t) {
        if (t == null) throw createMappedError(21, t);
        if (typeof t !== "object") return new AnalyzedModule(t, []);
        let e;
        let n;
        let r;
        let s;
        const o = [];
        for (const l in t) {
            switch (typeof (e = t[l])) {
              case "object":
                if (e === null) {
                    continue;
                }
                n = isFunction(e.register);
                r = false;
                s = null;
                break;

              case "function":
                n = isFunction(e.register);
                r = e.prototype !== void 0;
                s = i(y, e) ?? null;
                break;

              default:
                continue;
            }
            o.push(new ModuleItem(l, e, n, r, s));
        }
        return new AnalyzedModule(t, o);
    }
}

class ModuleLoader {
    constructor() {
        this.transformers = new Map;
    }
    load(t, e = noTransform) {
        const n = this.transformers;
        let r = n.get(e);
        if (r === void 0) {
            n.set(e, r = new ModuleTransformer(e));
        }
        return r.transform(t);
    }
    dispose() {
        this.transformers.clear();
    }
}

class AnalyzedModule {
    constructor(t, e) {
        this.raw = t;
        this.items = e;
    }
}

class ModuleItem {
    constructor(t, e, n, r, s) {
        this.key = t;
        this.value = e;
        this.isRegistry = n;
        this.isConstructable = r;
        this.definition = s;
    }
}

const aliasedResourcesRegistry = (t, e, n = {}) => ({
    register(r) {
        const s = r.get(at).load(t);
        let o = false;
        s.items.forEach((t => {
            const s = t.definition;
            if (s == null) {
                r.register(t.value);
                return;
            }
            if (!o && e != null) {
                o = true;
                s.register(r, e);
                return;
            }
            const i = n[s.name];
            s.register(r, i);
        }));
    }
});

class Handler {
    constructor(t, e) {
        this.type = t;
        this.cb = e;
    }
    handle(t) {
        if (t instanceof this.type) {
            this.cb.call(null, t);
        }
    }
}

const ft = /*@__PURE__*/ createInterface("IEventAggregator", (t => t.singleton(EventAggregator)));

class EventAggregator {
    constructor() {
        this.eventLookup = {};
        this.messageHandlers = [];
    }
    publish(t, e) {
        if (!t) {
            throw createMappedError(18, t);
        }
        if (isString(t)) {
            let n = this.eventLookup[t];
            if (n !== void 0) {
                n = n.slice();
                let r = n.length;
                while (r-- > 0) {
                    n[r](e, t);
                }
            }
        } else {
            const e = this.messageHandlers.slice();
            let n = e.length;
            while (n-- > 0) {
                e[n].handle(t);
            }
        }
    }
    subscribe(t, e) {
        if (!t) {
            throw createMappedError(19, t);
        }
        let n;
        let r;
        if (isString(t)) {
            if (this.eventLookup[t] === void 0) {
                this.eventLookup[t] = [];
            }
            n = e;
            r = this.eventLookup[t];
        } else {
            n = new Handler(t, e);
            r = this.messageHandlers;
        }
        r.push(n);
        return {
            dispose() {
                const t = r.indexOf(n);
                if (t !== -1) {
                    r.splice(t, 1);
                }
            }
        };
    }
    subscribeOnce(t, e) {
        const n = this.subscribe(t, ((t, r) => {
            n.dispose();
            e(t, r);
        }));
        return n;
    }
}

export { AnalyzedModule, ConsoleSink, ContainerConfiguration, k as DI, DefaultLogEvent, DefaultLogEventFactory, DefaultLogger, $ as DefaultResolver, EventAggregator, E as IContainer, ft as IEventAggregator, et as ILogConfig, rt as ILogEventFactory, st as ILogger, at as IModuleLoader, j as IPlatform, I as IServiceLocator, nt as ISink, InstanceProvider, LogConfig, tt as LogLevel, ut as LoggerConfiguration, ModuleItem, m as Protocol, b as Registrable, C as Registration, aliasedResourcesRegistry, all, z as allResources, bound, a as camelCase, createResolver, T as emptyArray, _ as emptyObject, W as factory, firstDefined, lt as format, fromAnnotationOrDefinitionOrTypeOrDefault, fromAnnotationOrTypeOrDefault, fromDefinitionOrDefault, v as getPrototypeChain, getResourceKeyFor, K as ignore, inject, c as isArrayIndex, d as isNativeFunction, h as kebabCase, P as lazy, mergeArrays, Q as newInstanceForScope, U as newInstanceOf, noop, onResolve, onResolveAll, S as optional, B as optionalResource, G as own, f as pascalCase, resolve, N as resource, y as resourceBaseName, singleton, sink, toArray, transient };

