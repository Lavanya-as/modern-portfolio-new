"use strict";

function isObject(t) {
    return typeof t === "object" && t !== null || typeof t === "function";
}

function isNullOrUndefined(t) {
    return t === null || t === void 0;
}

let t = new WeakMap;

const $typeError = (t, e, a, r, n) => new TypeError(`${t}(${e.map(String).join(",")}) - Expected '${a}' to be of type ${n}, but got: ${Object.prototype.toString.call(r)} (${String(r)})`);

function toPropertyKeyOrUndefined(t) {
    switch (typeof t) {
      case "undefined":
      case "string":
      case "symbol":
        return t;

      default:
        return `${t}`;
    }
}

function toPropertyKey(t) {
    switch (typeof t) {
      case "string":
      case "symbol":
        return t;

      default:
        return `${t}`;
    }
}

function ensurePropertyKeyOrUndefined(t) {
    switch (typeof t) {
      case "undefined":
      case "string":
      case "symbol":
        return t;

      default:
        throw new TypeError(`Invalid metadata propertyKey: ${t}.`);
    }
}

function GetOrCreateMetadataMap(e, a, r) {
    let n = t.get(e);
    if (n === void 0) {
        if (!r) {
            return void 0;
        }
        n = new Map;
        t.set(e, n);
    }
    let o = n.get(a);
    if (o === void 0) {
        if (!r) {
            return void 0;
        }
        o = new Map;
        n.set(a, o);
    }
    return o;
}

function OrdinaryHasOwnMetadata(t, e, a) {
    const r = GetOrCreateMetadataMap(e, a, false);
    if (r === void 0) {
        return false;
    }
    return r.has(t);
}

function OrdinaryHasMetadata(t, e, a) {
    if (OrdinaryHasOwnMetadata(t, e, a)) {
        return true;
    }
    const n = r(e);
    if (n !== null) {
        return OrdinaryHasMetadata(t, n, a);
    }
    return false;
}

function OrdinaryGetOwnMetadata(t, e, a) {
    const r = GetOrCreateMetadataMap(e, a, false);
    if (r === void 0) {
        return void 0;
    }
    return r.get(t);
}

function OrdinaryGetMetadata(t, e, a) {
    if (OrdinaryHasOwnMetadata(t, e, a)) {
        return OrdinaryGetOwnMetadata(t, e, a);
    }
    const n = r(e);
    if (n !== null) {
        return OrdinaryGetMetadata(t, n, a);
    }
    return void 0;
}

function OrdinaryDefineOwnMetadata(t, e, a, r) {
    const n = GetOrCreateMetadataMap(a, r, true);
    n.set(t, e);
}

function OrdinaryOwnMetadataKeys(t, e) {
    const a = [];
    const r = GetOrCreateMetadataMap(t, e, false);
    if (r === void 0) {
        return a;
    }
    const n = r.keys();
    let o = 0;
    for (const t of n) {
        a[o] = t;
        ++o;
    }
    return a;
}

function OrdinaryMetadataKeys(t, e) {
    const a = OrdinaryOwnMetadataKeys(t, e);
    const n = r(t);
    if (n === null) {
        return a;
    }
    const o = OrdinaryMetadataKeys(n, e);
    const i = a.length;
    if (i === 0) {
        return o;
    }
    const d = o.length;
    if (d === 0) {
        return a;
    }
    const c = new Set;
    const s = [];
    let f = 0;
    let u;
    for (let t = 0; t < i; ++t) {
        u = a[t];
        if (!c.has(u)) {
            c.add(u);
            s[f] = u;
            ++f;
        }
    }
    for (let t = 0; t < d; ++t) {
        u = o[t];
        if (!c.has(u)) {
            c.add(u);
            s[f] = u;
            ++f;
        }
    }
    return s;
}

function OrdinaryDeleteMetadata(t, e, a) {
    const r = GetOrCreateMetadataMap(t, a, false);
    if (r === void 0) {
        return false;
    }
    return r.delete(e);
}

function metadata(t, e) {
    function decorator(a, r) {
        if (!isObject(a)) {
            throw $typeError("@metadata", [ t, e, a, r ], "target", a, "Object or Function");
        }
        OrdinaryDefineOwnMetadata(t, e, a, ensurePropertyKeyOrUndefined(r));
    }
    return decorator;
}

function decorate(t, e, a, r) {
    if (a !== void 0) {
        if (!Array.isArray(t)) {
            throw $typeError("Metadata.decorate", [ t, e, a, r ], "decorators", t, "Array");
        }
        if (!isObject(e)) {
            throw $typeError("Metadata.decorate", [ t, e, a, r ], "target", e, "Object or Function");
        }
        if (!isObject(r) && !isNullOrUndefined(r)) {
            throw $typeError("Metadata.decorate", [ t, e, a, r ], "attributes", r, "Object, Function, null, or undefined");
        }
        if (r === null) {
            r = void 0;
        }
        a = toPropertyKey(a);
        return DecorateProperty(t, e, a, r);
    } else {
        if (!Array.isArray(t)) {
            throw $typeError("Metadata.decorate", [ t, e, a, r ], "decorators", t, "Array");
        }
        if (typeof e !== "function") {
            throw $typeError("Metadata.decorate", [ t, e, a, r ], "target", e, "Function");
        }
        return DecorateConstructor(t, e);
    }
}

function DecorateConstructor(t, e) {
    for (let a = t.length - 1; a >= 0; --a) {
        const r = t[a];
        const n = r(e);
        if (!isNullOrUndefined(n)) {
            if (typeof n !== "function") {
                throw $typeError("DecorateConstructor", [ t, e ], "decorated", n, "Function, null, or undefined");
            }
            e = n;
        }
    }
    return e;
}

function DecorateProperty(t, e, a, r) {
    for (let n = t.length - 1; n >= 0; --n) {
        const o = t[n];
        const i = o(e, a, r);
        if (!isNullOrUndefined(i)) {
            if (!isObject(i)) {
                throw $typeError("DecorateProperty", [ t, e, a, r ], "decorated", i, "Object, Function, null, or undefined");
            }
            r = i;
        }
    }
    return r;
}

function $define(t, e, a, r) {
    if (!isObject(a)) {
        throw $typeError("Metadata.define", [ t, e, a, r ], "target", a, "Object or Function");
    }
    return OrdinaryDefineOwnMetadata(t, e, a, toPropertyKeyOrUndefined(r));
}

function $has(t, e, a) {
    if (!isObject(e)) {
        throw $typeError("Metadata.has", [ t, e, a ], "target", e, "Object or Function");
    }
    return OrdinaryHasMetadata(t, e, toPropertyKeyOrUndefined(a));
}

function $hasOwn(t, e, a) {
    if (!isObject(e)) {
        throw $typeError("Metadata.hasOwn", [ t, e, a ], "target", e, "Object or Function");
    }
    return OrdinaryHasOwnMetadata(t, e, toPropertyKeyOrUndefined(a));
}

function $get(t, e, a) {
    if (!isObject(e)) {
        throw $typeError("Metadata.get", [ t, e, a ], "target", e, "Object or Function");
    }
    return OrdinaryGetMetadata(t, e, toPropertyKeyOrUndefined(a));
}

function $getOwn(t, e, a) {
    if (!isObject(e)) {
        throw $typeError("Metadata.getOwn", [ t, e, a ], "target", e, "Object or Function");
    }
    return OrdinaryGetOwnMetadata(t, e, toPropertyKeyOrUndefined(a));
}

function $getKeys(t, e) {
    if (!isObject(t)) {
        throw $typeError("Metadata.getKeys", [ t, e ], "target", t, "Object or Function");
    }
    return OrdinaryMetadataKeys(t, toPropertyKeyOrUndefined(e));
}

function $getOwnKeys(t, e) {
    if (!isObject(t)) {
        throw $typeError("Metadata.getOwnKeys", [ t, e ], "target", t, "Object or Function");
    }
    return OrdinaryOwnMetadataKeys(t, toPropertyKeyOrUndefined(e));
}

function $delete(t, e, a) {
    if (!isObject(e)) {
        throw $typeError("Metadata.delete", [ t, e, a ], "target", e, "Object or Function");
    }
    return OrdinaryDeleteMetadata(e, t, toPropertyKeyOrUndefined(a));
}

const e = {
    define: $define,
    has: $has,
    hasOwn: $hasOwn,
    get: $get,
    getOwn: $getOwn,
    getKeys: $getKeys,
    getOwnKeys: $getOwnKeys,
    delete: $delete
};

const def = (t, e, a, r, n) => {
    if (!Reflect.defineProperty(t, e, {
        writable: r,
        enumerable: false,
        configurable: n,
        value: a
    })) {
        throw createError(`AUR1000:${e}`);
    }
};

const a = "[[$au]]";

const hasInternalSlot = t => a in t;

const $applyMetadataPolyfill = (e, r, n) => [ [ a, t ], [ "metadata", metadata ], [ "decorate", decorate ], [ "defineMetadata", $define ], [ "hasMetadata", $has ], [ "hasOwnMetadata", $hasOwn ], [ "getMetadata", $get ], [ "getOwnMetadata", $getOwn ], [ "getMetadataKeys", $getKeys ], [ "getOwnMetadataKeys", $getOwnKeys ], [ "deleteMetadata", $delete ] ].forEach((([t, a]) => def(e, t, a, r, n)));

const applyMetadataPolyfill = (e, r = true, n = false, o = true, i = true) => {
    if (hasInternalSlot(e)) {
        if (e[a] === t) {
            return;
        }
        if (e[a] instanceof WeakMap) {
            t = e[a];
            return;
        }
        throw createError(`AUR1001`);
    }
    const d = "metadata decorate defineMetadata hasMetadata hasOwnMetadata getMetadata getOwnMetadata getMetadataKeys getOwnMetadataKeys deleteMetadata".split(" ").filter((t => t in Reflect));
    if (d.length > 0) {
        if (r) {
            const t = d.map((function(t) {
                const e = `${Reflect[t].toString().slice(0, 100)}...`;
                return `${t}:\n${e}`;
            })).join("\n\n");
            throw createError(`AUR1002:${t}`);
        } else if (n) {
            $applyMetadataPolyfill(e, o, i);
        }
    } else {
        $applyMetadataPolyfill(e, o, i);
    }
};

const createError = t => new Error(t);

const r = Object.getPrototypeOf;

exports.Metadata = e;

exports.applyMetadataPolyfill = applyMetadataPolyfill;

exports.isNullOrUndefined = isNullOrUndefined;

exports.isObject = isObject;

exports.metadata = metadata;
//# sourceMappingURL=index.cjs.map
