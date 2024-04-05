function isObject(t) {
    return typeof t === "object" && t !== null || typeof t === "function";
}

function isNullOrUndefined(t) {
    return t === null || t === void 0;
}

let t = new WeakMap;

const $typeError = (t, e, a, n, r) => new TypeError(`${t}(${e.map(String).join(",")}) - Expected '${a}' to be of type ${r}, but got: ${Object.prototype.toString.call(n)} (${String(n)})`);

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

function GetOrCreateMetadataMap(e, a, n) {
    let r = t.get(e);
    if (r === void 0) {
        if (!n) {
            return void 0;
        }
        r = new Map;
        t.set(e, r);
    }
    let o = r.get(a);
    if (o === void 0) {
        if (!n) {
            return void 0;
        }
        o = new Map;
        r.set(a, o);
    }
    return o;
}

function OrdinaryHasOwnMetadata(t, e, a) {
    const n = GetOrCreateMetadataMap(e, a, false);
    if (n === void 0) {
        return false;
    }
    return n.has(t);
}

function OrdinaryHasMetadata(t, e, a) {
    if (OrdinaryHasOwnMetadata(t, e, a)) {
        return true;
    }
    const r = n(e);
    if (r !== null) {
        return OrdinaryHasMetadata(t, r, a);
    }
    return false;
}

function OrdinaryGetOwnMetadata(t, e, a) {
    const n = GetOrCreateMetadataMap(e, a, false);
    if (n === void 0) {
        return void 0;
    }
    return n.get(t);
}

function OrdinaryGetMetadata(t, e, a) {
    if (OrdinaryHasOwnMetadata(t, e, a)) {
        return OrdinaryGetOwnMetadata(t, e, a);
    }
    const r = n(e);
    if (r !== null) {
        return OrdinaryGetMetadata(t, r, a);
    }
    return void 0;
}

function OrdinaryDefineOwnMetadata(t, e, a, n) {
    const r = GetOrCreateMetadataMap(a, n, true);
    r.set(t, e);
}

function OrdinaryOwnMetadataKeys(t, e) {
    const a = [];
    const n = GetOrCreateMetadataMap(t, e, false);
    if (n === void 0) {
        return a;
    }
    const r = n.keys();
    let o = 0;
    for (const t of r) {
        a[o] = t;
        ++o;
    }
    return a;
}

function OrdinaryMetadataKeys(t, e) {
    const a = OrdinaryOwnMetadataKeys(t, e);
    const r = n(t);
    if (r === null) {
        return a;
    }
    const o = OrdinaryMetadataKeys(r, e);
    const i = a.length;
    if (i === 0) {
        return o;
    }
    const d = o.length;
    if (d === 0) {
        return a;
    }
    const c = new Set;
    const f = [];
    let s = 0;
    let u;
    for (let t = 0; t < i; ++t) {
        u = a[t];
        if (!c.has(u)) {
            c.add(u);
            f[s] = u;
            ++s;
        }
    }
    for (let t = 0; t < d; ++t) {
        u = o[t];
        if (!c.has(u)) {
            c.add(u);
            f[s] = u;
            ++s;
        }
    }
    return f;
}

function OrdinaryDeleteMetadata(t, e, a) {
    const n = GetOrCreateMetadataMap(t, a, false);
    if (n === void 0) {
        return false;
    }
    return n.delete(e);
}

function metadata(t, e) {
    function decorator(a, n) {
        if (!isObject(a)) {
            throw $typeError("@metadata", [ t, e, a, n ], "target", a, "Object or Function");
        }
        OrdinaryDefineOwnMetadata(t, e, a, ensurePropertyKeyOrUndefined(n));
    }
    return decorator;
}

function decorate(t, e, a, n) {
    if (a !== void 0) {
        if (!Array.isArray(t)) {
            throw $typeError("Metadata.decorate", [ t, e, a, n ], "decorators", t, "Array");
        }
        if (!isObject(e)) {
            throw $typeError("Metadata.decorate", [ t, e, a, n ], "target", e, "Object or Function");
        }
        if (!isObject(n) && !isNullOrUndefined(n)) {
            throw $typeError("Metadata.decorate", [ t, e, a, n ], "attributes", n, "Object, Function, null, or undefined");
        }
        if (n === null) {
            n = void 0;
        }
        a = toPropertyKey(a);
        return DecorateProperty(t, e, a, n);
    } else {
        if (!Array.isArray(t)) {
            throw $typeError("Metadata.decorate", [ t, e, a, n ], "decorators", t, "Array");
        }
        if (typeof e !== "function") {
            throw $typeError("Metadata.decorate", [ t, e, a, n ], "target", e, "Function");
        }
        return DecorateConstructor(t, e);
    }
}

function DecorateConstructor(t, e) {
    for (let a = t.length - 1; a >= 0; --a) {
        const n = t[a];
        const r = n(e);
        if (!isNullOrUndefined(r)) {
            if (typeof r !== "function") {
                throw $typeError("DecorateConstructor", [ t, e ], "decorated", r, "Function, null, or undefined");
            }
            e = r;
        }
    }
    return e;
}

function DecorateProperty(t, e, a, n) {
    for (let r = t.length - 1; r >= 0; --r) {
        const o = t[r];
        const i = o(e, a, n);
        if (!isNullOrUndefined(i)) {
            if (!isObject(i)) {
                throw $typeError("DecorateProperty", [ t, e, a, n ], "decorated", i, "Object, Function, null, or undefined");
            }
            n = i;
        }
    }
    return n;
}

function $define(t, e, a, n) {
    if (!isObject(a)) {
        throw $typeError("Metadata.define", [ t, e, a, n ], "target", a, "Object or Function");
    }
    return OrdinaryDefineOwnMetadata(t, e, a, toPropertyKeyOrUndefined(n));
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

const def = (t, e, a, n, r) => {
    if (!Reflect.defineProperty(t, e, {
        writable: n,
        enumerable: false,
        configurable: r,
        value: a
    })) {
        throw createError(`AUR1000:${e}`);
    }
};

const a = "[[$au]]";

const hasInternalSlot = t => a in t;

const $applyMetadataPolyfill = (e, n, r) => [ [ a, t ], [ "metadata", metadata ], [ "decorate", decorate ], [ "defineMetadata", $define ], [ "hasMetadata", $has ], [ "hasOwnMetadata", $hasOwn ], [ "getMetadata", $get ], [ "getOwnMetadata", $getOwn ], [ "getMetadataKeys", $getKeys ], [ "getOwnMetadataKeys", $getOwnKeys ], [ "deleteMetadata", $delete ] ].forEach((([t, a]) => def(e, t, a, n, r)));

const applyMetadataPolyfill = (e, n = true, r = false, o = true, i = true) => {
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
        if (n) {
            const t = d.map((function(t) {
                const e = `${Reflect[t].toString().slice(0, 100)}...`;
                return `${t}:\n${e}`;
            })).join("\n\n");
            throw createError(`AUR1002:${t}`);
        } else if (r) {
            $applyMetadataPolyfill(e, o, i);
        }
    } else {
        $applyMetadataPolyfill(e, o, i);
    }
};

const createError = t => new Error(t);

const n = Object.getPrototypeOf;

export { e as Metadata, applyMetadataPolyfill, isNullOrUndefined, isObject, metadata };

