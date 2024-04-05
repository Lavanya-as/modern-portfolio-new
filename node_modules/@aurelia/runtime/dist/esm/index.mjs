import { DI as e, emptyArray as t, isArrayIndex as r, Registration as n, resolve as i, IPlatform as o } from "@aurelia/kernel";

import { Metadata as a } from "@aurelia/metadata";

const c = Object;

const u = c.prototype.hasOwnProperty;

const l = Reflect.defineProperty;

const createError = e => new Error(e);

const isFunction = e => typeof e === "function";

const isString = e => typeof e === "string";

const isObject = e => e instanceof c;

const isArray = e => e instanceof Array;

const isSet = e => e instanceof Set;

const isMap = e => e instanceof Map;

const h = c.is;

function defineHiddenProp(e, t, r) {
    l(e, t, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function ensureProto(e, t, r) {
    if (!(t in e)) {
        defineHiddenProp(e, t, r);
    }
}

const f = Object.assign;

const p = Object.freeze;

const d = String;

const w = e.createInterface;

const createLookup = () => c.create(null);

const b = a.getOwn;

a.hasOwn;

const v = a.define;

const astVisit = (e, t) => {
    switch (e.$kind) {
      case R:
        return t.visitAccessKeyed(e);

      case M:
        return t.visitAccessMember(e);

      case A:
        return t.visitAccessScope(e);

      case x:
        return t.visitAccessThis(e);

      case E:
        return t.visitAccessBoundary(e);

      case V:
        return t.visitArrayBindingPattern(e);

      case G:
        return t.visitDestructuringAssignmentExpression(e);

      case C:
        return t.visitArrayLiteral(e);

      case F:
        return t.visitArrowFunction(e);

      case D:
        return t.visitAssign(e);

      case B:
        return t.visitBinary(e);

      case N:
        return t.visitBindingBehavior(e);

      case H:
        return t.visitBindingIdentifier(e);

      case I:
        return t.visitCallFunction(e);

      case P:
        return t.visitCallMember(e);

      case T:
        return t.visitCallScope(e);

      case $:
        return t.visitConditional(e);

      case q:
        return t.visitDestructuringAssignmentSingleExpression(e);

      case K:
        return t.visitForOfStatement(e);

      case z:
        return t.visitInterpolation(e);

      case U:
        return t.visitObjectBindingPattern(e);

      case W:
        return t.visitDestructuringAssignmentExpression(e);

      case m:
        return t.visitObjectLiteral(e);

      case k:
        return t.visitPrimitiveLiteral(e);

      case _:
        return t.visitTaggedTemplate(e);

      case O:
        return t.visitTemplate(e);

      case S:
        return t.visitUnary(e);

      case j:
        return t.visitValueConverter(e);

      case J:
        return t.visitCustom(e);

      default:
        {
            throw createError(`Unknown ast node ${JSON.stringify(e)}`);
        }
    }
};

class Unparser {
    constructor() {
        this.text = "";
    }
    static unparse(e) {
        const t = new Unparser;
        astVisit(e, t);
        return t.text;
    }
    visitAccessMember(e) {
        astVisit(e.object, this);
        this.text += `${e.optional ? "?" : ""}.${e.name}`;
    }
    visitAccessKeyed(e) {
        astVisit(e.object, this);
        this.text += `${e.optional ? "?." : ""}[`;
        astVisit(e.key, this);
        this.text += "]";
    }
    visitAccessThis(e) {
        if (e.ancestor === 0) {
            this.text += "$this";
            return;
        }
        this.text += "$parent";
        let t = e.ancestor - 1;
        while (t--) {
            this.text += ".$parent";
        }
    }
    visitAccessBoundary(e) {
        this.text += "this";
    }
    visitAccessScope(e) {
        let t = e.ancestor;
        while (t--) {
            this.text += "$parent.";
        }
        this.text += e.name;
    }
    visitArrayLiteral(e) {
        const t = e.elements;
        this.text += "[";
        for (let e = 0, r = t.length; e < r; ++e) {
            if (e !== 0) {
                this.text += ",";
            }
            astVisit(t[e], this);
        }
        this.text += "]";
    }
    visitArrowFunction(e) {
        const t = e.args;
        const r = t.length;
        let n = 0;
        let i = "(";
        let o;
        for (;n < r; ++n) {
            o = t[n].name;
            if (n > 0) {
                i += ", ";
            }
            if (n < r - 1) {
                i += o;
            } else {
                i += e.rest ? `...${o}` : o;
            }
        }
        this.text += `${i}) => `;
        astVisit(e.body, this);
    }
    visitObjectLiteral(e) {
        const t = e.keys;
        const r = e.values;
        this.text += "{";
        for (let e = 0, n = t.length; e < n; ++e) {
            if (e !== 0) {
                this.text += ",";
            }
            this.text += `'${t[e]}':`;
            astVisit(r[e], this);
        }
        this.text += "}";
    }
    visitPrimitiveLiteral(e) {
        this.text += "(";
        if (isString(e.value)) {
            const t = e.value.replace(/'/g, "\\'");
            this.text += `'${t}'`;
        } else {
            this.text += `${e.value}`;
        }
        this.text += ")";
    }
    visitCallFunction(e) {
        this.text += "(";
        astVisit(e.func, this);
        this.text += e.optional ? "?." : "";
        this.writeArgs(e.args);
        this.text += ")";
    }
    visitCallMember(e) {
        this.text += "(";
        astVisit(e.object, this);
        this.text += `${e.optionalMember ? "?." : ""}.${e.name}${e.optionalCall ? "?." : ""}`;
        this.writeArgs(e.args);
        this.text += ")";
    }
    visitCallScope(e) {
        this.text += "(";
        let t = e.ancestor;
        while (t--) {
            this.text += "$parent.";
        }
        this.text += `${e.name}${e.optional ? "?." : ""}`;
        this.writeArgs(e.args);
        this.text += ")";
    }
    visitTemplate(e) {
        const {cooked: t, expressions: r} = e;
        const n = r.length;
        this.text += "`";
        this.text += t[0];
        for (let e = 0; e < n; e++) {
            astVisit(r[e], this);
            this.text += t[e + 1];
        }
        this.text += "`";
    }
    visitTaggedTemplate(e) {
        const {cooked: t, expressions: r} = e;
        const n = r.length;
        astVisit(e.func, this);
        this.text += "`";
        this.text += t[0];
        for (let e = 0; e < n; e++) {
            astVisit(r[e], this);
            this.text += t[e + 1];
        }
        this.text += "`";
    }
    visitUnary(e) {
        this.text += `(${e.operation}`;
        if (e.operation.charCodeAt(0) >= 97) {
            this.text += " ";
        }
        astVisit(e.expression, this);
        this.text += ")";
    }
    visitBinary(e) {
        this.text += "(";
        astVisit(e.left, this);
        if (e.operation.charCodeAt(0) === 105) {
            this.text += ` ${e.operation} `;
        } else {
            this.text += e.operation;
        }
        astVisit(e.right, this);
        this.text += ")";
    }
    visitConditional(e) {
        this.text += "(";
        astVisit(e.condition, this);
        this.text += "?";
        astVisit(e.yes, this);
        this.text += ":";
        astVisit(e.no, this);
        this.text += ")";
    }
    visitAssign(e) {
        this.text += "(";
        astVisit(e.target, this);
        this.text += "=";
        astVisit(e.value, this);
        this.text += ")";
    }
    visitValueConverter(e) {
        const t = e.args;
        astVisit(e.expression, this);
        this.text += `|${e.name}`;
        for (let e = 0, r = t.length; e < r; ++e) {
            this.text += ":";
            astVisit(t[e], this);
        }
    }
    visitBindingBehavior(e) {
        const t = e.args;
        astVisit(e.expression, this);
        this.text += `&${e.name}`;
        for (let e = 0, r = t.length; e < r; ++e) {
            this.text += ":";
            astVisit(t[e], this);
        }
    }
    visitArrayBindingPattern(e) {
        const t = e.elements;
        this.text += "[";
        for (let e = 0, r = t.length; e < r; ++e) {
            if (e !== 0) {
                this.text += ",";
            }
            astVisit(t[e], this);
        }
        this.text += "]";
    }
    visitObjectBindingPattern(e) {
        const t = e.keys;
        const r = e.values;
        this.text += "{";
        for (let e = 0, n = t.length; e < n; ++e) {
            if (e !== 0) {
                this.text += ",";
            }
            this.text += `'${t[e]}':`;
            astVisit(r[e], this);
        }
        this.text += "}";
    }
    visitBindingIdentifier(e) {
        this.text += e.name;
    }
    visitForOfStatement(e) {
        astVisit(e.declaration, this);
        this.text += " of ";
        astVisit(e.iterable, this);
    }
    visitInterpolation(e) {
        const {parts: t, expressions: r} = e;
        const n = r.length;
        this.text += "${";
        this.text += t[0];
        for (let e = 0; e < n; e++) {
            astVisit(r[e], this);
            this.text += t[e + 1];
        }
        this.text += "}";
    }
    visitDestructuringAssignmentExpression(e) {
        const t = e.$kind;
        const r = t === W;
        this.text += r ? "{" : "[";
        const n = e.list;
        const i = n.length;
        let o;
        let a;
        for (o = 0; o < i; o++) {
            a = n[o];
            switch (a.$kind) {
              case q:
                astVisit(a, this);
                break;

              case G:
              case W:
                {
                    const e = a.source;
                    if (e) {
                        astVisit(e, this);
                        this.text += ":";
                    }
                    astVisit(a, this);
                    break;
                }
            }
        }
        this.text += r ? "}" : "]";
    }
    visitDestructuringAssignmentSingleExpression(e) {
        astVisit(e.source, this);
        this.text += ":";
        astVisit(e.target, this);
        const t = e.initializer;
        if (t !== void 0) {
            this.text += "=";
            astVisit(t, this);
        }
    }
    visitDestructuringAssignmentRestExpression(e) {
        this.text += "...";
        astVisit(e.target, this);
    }
    visitCustom(e) {
        this.text += d(e.value);
    }
    writeArgs(e) {
        this.text += "(";
        for (let t = 0, r = e.length; t < r; ++t) {
            if (t !== 0) {
                this.text += ",";
            }
            astVisit(e[t], this);
        }
        this.text += ")";
    }
}

const x = "AccessThis";

const E = "AccessBoundary";

const y = "AccessGlobal";

const A = "AccessScope";

const C = "ArrayLiteral";

const m = "ObjectLiteral";

const k = "PrimitiveLiteral";

const O = "Template";

const S = "Unary";

const T = "CallScope";

const P = "CallMember";

const I = "CallFunction";

const L = "CallGlobal";

const M = "AccessMember";

const R = "AccessKeyed";

const _ = "TaggedTemplate";

const B = "Binary";

const $ = "Conditional";

const D = "Assign";

const F = "ArrowFunction";

const j = "ValueConverter";

const N = "BindingBehavior";

const V = "ArrayBindingPattern";

const U = "ObjectBindingPattern";

const H = "BindingIdentifier";

const K = "ForOfStatement";

const z = "Interpolation";

const G = "ArrayDestructuring";

const W = "ObjectDestructuring";

const q = "DestructuringAssignmentLeaf";

const J = "Custom";

class CustomExpression {
    constructor(e) {
        this.value = e;
        this.$kind = J;
    }
    evaluate(e, t, r) {
        return this.value;
    }
    assign(e, t, r) {
        return r;
    }
    bind(e, t) {}
    unbind(e, t) {}
    accept(e) {
        return void 0;
    }
}

class BindingBehaviorExpression {
    constructor(e, t, r) {
        this.expression = e;
        this.name = t;
        this.args = r;
        this.$kind = N;
        this.key = `_bb_${t}`;
    }
}

class ValueConverterExpression {
    constructor(e, t, r) {
        this.expression = e;
        this.name = t;
        this.args = r;
        this.$kind = j;
    }
}

class AssignExpression {
    constructor(e, t) {
        this.target = e;
        this.value = t;
        this.$kind = D;
    }
}

class ConditionalExpression {
    constructor(e, t, r) {
        this.condition = e;
        this.yes = t;
        this.no = r;
        this.$kind = $;
    }
}

class AccessGlobalExpression {
    constructor(e) {
        this.name = e;
        this.$kind = y;
    }
}

class AccessThisExpression {
    constructor(e = 0) {
        this.ancestor = e;
        this.$kind = x;
    }
}

class AccessBoundaryExpression {
    constructor() {
        this.$kind = E;
    }
}

class AccessScopeExpression {
    constructor(e, t = 0) {
        this.name = e;
        this.ancestor = t;
        this.$kind = A;
    }
}

const isAccessGlobal = e => e.$kind === y || (e.$kind === M || e.$kind === R) && e.accessGlobal;

class AccessMemberExpression {
    constructor(e, t, r = false) {
        this.object = e;
        this.name = t;
        this.optional = r;
        this.$kind = M;
        this.accessGlobal = isAccessGlobal(e);
    }
}

class AccessKeyedExpression {
    constructor(e, t, r = false) {
        this.object = e;
        this.key = t;
        this.optional = r;
        this.$kind = R;
        this.accessGlobal = isAccessGlobal(e);
    }
}

class CallScopeExpression {
    constructor(e, t, r = 0, n = false) {
        this.name = e;
        this.args = t;
        this.ancestor = r;
        this.optional = n;
        this.$kind = T;
    }
}

class CallMemberExpression {
    constructor(e, t, r, n = false, i = false) {
        this.object = e;
        this.name = t;
        this.args = r;
        this.optionalMember = n;
        this.optionalCall = i;
        this.$kind = P;
    }
}

class CallFunctionExpression {
    constructor(e, t, r = false) {
        this.func = e;
        this.args = t;
        this.optional = r;
        this.$kind = I;
    }
}

class CallGlobalExpression {
    constructor(e, t) {
        this.name = e;
        this.args = t;
        this.$kind = L;
    }
}

class BinaryExpression {
    constructor(e, t, r) {
        this.operation = e;
        this.left = t;
        this.right = r;
        this.$kind = B;
    }
}

class UnaryExpression {
    constructor(e, t) {
        this.operation = e;
        this.expression = t;
        this.$kind = S;
    }
}

class PrimitiveLiteralExpression {
    constructor(e) {
        this.value = e;
        this.$kind = k;
    }
}

PrimitiveLiteralExpression.$undefined = new PrimitiveLiteralExpression(void 0);

PrimitiveLiteralExpression.$null = new PrimitiveLiteralExpression(null);

PrimitiveLiteralExpression.$true = new PrimitiveLiteralExpression(true);

PrimitiveLiteralExpression.$false = new PrimitiveLiteralExpression(false);

PrimitiveLiteralExpression.$empty = new PrimitiveLiteralExpression("");

class ArrayLiteralExpression {
    constructor(e) {
        this.elements = e;
        this.$kind = C;
    }
}

ArrayLiteralExpression.$empty = new ArrayLiteralExpression(t);

class ObjectLiteralExpression {
    constructor(e, t) {
        this.keys = e;
        this.values = t;
        this.$kind = m;
    }
}

ObjectLiteralExpression.$empty = new ObjectLiteralExpression(t, t);

class TemplateExpression {
    constructor(e, r = t) {
        this.cooked = e;
        this.expressions = r;
        this.$kind = O;
    }
}

TemplateExpression.$empty = new TemplateExpression([ "" ]);

class TaggedTemplateExpression {
    constructor(e, r, n, i = t) {
        this.cooked = e;
        this.func = n;
        this.expressions = i;
        this.$kind = _;
        e.raw = r;
    }
}

class ArrayBindingPattern {
    constructor(e) {
        this.elements = e;
        this.$kind = V;
    }
}

class ObjectBindingPattern {
    constructor(e, t) {
        this.keys = e;
        this.values = t;
        this.$kind = U;
    }
}

class BindingIdentifier {
    constructor(e) {
        this.name = e;
        this.$kind = H;
    }
}

class ForOfStatement {
    constructor(e, t, r) {
        this.declaration = e;
        this.iterable = t;
        this.semiIdx = r;
        this.$kind = K;
    }
}

class Interpolation {
    constructor(e, r = t) {
        this.parts = e;
        this.expressions = r;
        this.$kind = z;
        this.isMulti = r.length > 1;
        this.firstExpression = r[0];
    }
}

class DestructuringAssignmentExpression {
    constructor(e, t, r, n) {
        this.$kind = e;
        this.list = t;
        this.source = r;
        this.initializer = n;
    }
}

class DestructuringAssignmentSingleExpression {
    constructor(e, t, r) {
        this.target = e;
        this.source = t;
        this.initializer = r;
        this.$kind = q;
    }
}

class DestructuringAssignmentRestExpression {
    constructor(e, t) {
        this.target = e;
        this.indexOrProperties = t;
        this.$kind = q;
    }
}

class ArrowFunction {
    constructor(e, t, r = false) {
        this.args = e;
        this.body = t;
        this.rest = r;
        this.$kind = F;
    }
}

const createMappedError = (e, ...t) => new Error(`AUR${d(e).padStart(4, "0")}:${t.map(d)}`);

class BindingContext {
    constructor(e, t) {
        if (e !== void 0) {
            this[e] = t;
        }
    }
}

class Scope {
    constructor(e, t, r, n) {
        this.parent = e;
        this.bindingContext = t;
        this.overrideContext = r;
        this.isBoundary = n;
    }
    static getContext(e, t, r) {
        if (e == null) {
            throw createMappedError(203);
        }
        let n = e.overrideContext;
        let i = e;
        if (r > 0) {
            while (r > 0) {
                r--;
                i = i.parent;
                if (i == null) {
                    return void 0;
                }
            }
            n = i.overrideContext;
            return t in n ? n : i.bindingContext;
        }
        while (i != null && !i.isBoundary && !(t in i.overrideContext) && !(t in i.bindingContext)) {
            i = i.parent;
        }
        if (i == null) {
            return e.bindingContext;
        }
        n = i.overrideContext;
        return t in n ? n : i.bindingContext;
    }
    static create(e, t, r) {
        if (e == null) {
            throw createMappedError(204);
        }
        return new Scope(null, e, t ?? new OverrideContext, r ?? false);
    }
    static fromParent(e, t) {
        if (e == null) {
            throw createMappedError(203);
        }
        return new Scope(e, t, new OverrideContext, false);
    }
}

class OverrideContext {}

const Q = Scope.getContext;

function astEvaluate(e, t, r, n) {
    switch (e.$kind) {
      case x:
        {
            let r = t.overrideContext;
            let n = t;
            let i = e.ancestor;
            while (i-- && r) {
                n = n.parent;
                r = n?.overrideContext ?? null;
            }
            return i < 1 && n ? n.bindingContext : void 0;
        }

      case E:
        {
            let e = t;
            while (e != null && !e.isBoundary) {
                e = e.parent;
            }
            return e ? e.bindingContext : void 0;
        }

      case A:
        {
            const i = Q(t, e.name, e.ancestor);
            if (n !== null) {
                n.observe(i, e.name);
            }
            const o = i[e.name];
            if (o == null && e.name === "$host") {
                throw createMappedError(105);
            }
            if (r?.strict) {
                return r?.boundFn && isFunction(o) ? o.bind(i) : o;
            }
            return o == null ? "" : r?.boundFn && isFunction(o) ? o.bind(i) : o;
        }

      case y:
        return globalThis[e.name];

      case L:
        {
            const i = globalThis[e.name];
            if (isFunction(i)) {
                return i(...e.args.map((e => astEvaluate(e, t, r, n))));
            }
            if (!r?.strictFnCall && i == null) {
                return void 0;
            }
            throw createMappedError(107);
        }

      case C:
        return e.elements.map((e => astEvaluate(e, t, r, n)));

      case m:
        {
            const i = {};
            for (let o = 0; o < e.keys.length; ++o) {
                i[e.keys[o]] = astEvaluate(e.values[o], t, r, n);
            }
            return i;
        }

      case k:
        return e.value;

      case O:
        {
            let i = e.cooked[0];
            for (let o = 0; o < e.expressions.length; ++o) {
                i += String(astEvaluate(e.expressions[o], t, r, n));
                i += e.cooked[o + 1];
            }
            return i;
        }

      case S:
        switch (e.operation) {
          case "void":
            return void astEvaluate(e.expression, t, r, n);

          case "typeof":
            return typeof astEvaluate(e.expression, t, r, n);

          case "!":
            return !astEvaluate(e.expression, t, r, n);

          case "-":
            return -astEvaluate(e.expression, t, r, n);

          case "+":
            return +astEvaluate(e.expression, t, r, n);

          default:
            throw createMappedError(109, e.operation);
        }

      case T:
        {
            const i = e.args.map((e => astEvaluate(e, t, r, n)));
            const o = Q(t, e.name, e.ancestor);
            const a = getFunction(r?.strictFnCall, o, e.name);
            if (a) {
                return a.apply(o, i);
            }
            return void 0;
        }

      case P:
        {
            const i = astEvaluate(e.object, t, r, n);
            const o = e.args.map((e => astEvaluate(e, t, r, n)));
            const a = getFunction(r?.strictFnCall, i, e.name);
            let c;
            if (a) {
                c = a.apply(i, o);
                if (isArray(i) && X.includes(e.name)) {
                    n?.observeCollection(i);
                }
            }
            return c;
        }

      case I:
        {
            const i = astEvaluate(e.func, t, r, n);
            if (isFunction(i)) {
                return i(...e.args.map((e => astEvaluate(e, t, r, n))));
            }
            if (!r?.strictFnCall && i == null) {
                return void 0;
            }
            throw createMappedError(107);
        }

      case F:
        {
            const func = (...i) => {
                const o = e.args;
                const a = e.rest;
                const c = o.length - 1;
                const u = o.reduce(((e, t, r) => {
                    if (a && r === c) {
                        e[t.name] = i.slice(r);
                    } else {
                        e[t.name] = i[r];
                    }
                    return e;
                }), {});
                const l = Scope.fromParent(t, u);
                return astEvaluate(e.body, l, r, n);
            };
            return func;
        }

      case M:
        {
            const i = astEvaluate(e.object, t, r, n);
            let o;
            if (r?.strict) {
                if (i == null) {
                    return undefined;
                }
                if (n !== null && !e.accessGlobal) {
                    n.observe(i, e.name);
                }
                o = i[e.name];
                if (r?.boundFn && isFunction(o)) {
                    return o.bind(i);
                }
                return o;
            }
            if (n !== null && isObject(i) && !e.accessGlobal) {
                n.observe(i, e.name);
            }
            if (i) {
                o = i[e.name];
                if (r?.boundFn && isFunction(o)) {
                    return o.bind(i);
                }
                return o;
            }
            return "";
        }

      case R:
        {
            const i = astEvaluate(e.object, t, r, n);
            const o = astEvaluate(e.key, t, r, n);
            if (isObject(i)) {
                if (n !== null && !e.accessGlobal) {
                    n.observe(i, o);
                }
                return i[o];
            }
            return i == null ? void 0 : i[o];
        }

      case _:
        {
            const i = e.expressions.map((e => astEvaluate(e, t, r, n)));
            const o = astEvaluate(e.func, t, r, n);
            if (!isFunction(o)) {
                throw createMappedError(110);
            }
            return o(e.cooked, ...i);
        }

      case B:
        {
            const i = e.left;
            const o = e.right;
            switch (e.operation) {
              case "&&":
                return astEvaluate(i, t, r, n) && astEvaluate(o, t, r, n);

              case "||":
                return astEvaluate(i, t, r, n) || astEvaluate(o, t, r, n);

              case "??":
                return astEvaluate(i, t, r, n) ?? astEvaluate(o, t, r, n);

              case "==":
                return astEvaluate(i, t, r, n) == astEvaluate(o, t, r, n);

              case "===":
                return astEvaluate(i, t, r, n) === astEvaluate(o, t, r, n);

              case "!=":
                return astEvaluate(i, t, r, n) != astEvaluate(o, t, r, n);

              case "!==":
                return astEvaluate(i, t, r, n) !== astEvaluate(o, t, r, n);

              case "instanceof":
                {
                    const e = astEvaluate(o, t, r, n);
                    if (isFunction(e)) {
                        return astEvaluate(i, t, r, n) instanceof e;
                    }
                    return false;
                }

              case "in":
                {
                    const e = astEvaluate(o, t, r, n);
                    if (isObject(e)) {
                        return astEvaluate(i, t, r, n) in e;
                    }
                    return false;
                }

              case "+":
                {
                    const e = astEvaluate(i, t, r, n);
                    const a = astEvaluate(o, t, r, n);
                    if (r?.strict) {
                        return e + a;
                    }
                    if (!e || !a) {
                        if (isNumberOrBigInt(e) || isNumberOrBigInt(a)) {
                            return (e || 0) + (a || 0);
                        }
                        if (isStringOrDate(e) || isStringOrDate(a)) {
                            return (e || "") + (a || "");
                        }
                    }
                    return e + a;
                }

              case "-":
                return astEvaluate(i, t, r, n) - astEvaluate(o, t, r, n);

              case "*":
                return astEvaluate(i, t, r, n) * astEvaluate(o, t, r, n);

              case "/":
                return astEvaluate(i, t, r, n) / astEvaluate(o, t, r, n);

              case "%":
                return astEvaluate(i, t, r, n) % astEvaluate(o, t, r, n);

              case "<":
                return astEvaluate(i, t, r, n) < astEvaluate(o, t, r, n);

              case ">":
                return astEvaluate(i, t, r, n) > astEvaluate(o, t, r, n);

              case "<=":
                return astEvaluate(i, t, r, n) <= astEvaluate(o, t, r, n);

              case ">=":
                return astEvaluate(i, t, r, n) >= astEvaluate(o, t, r, n);

              default:
                throw createMappedError(108, e.operation);
            }
        }

      case $:
        return astEvaluate(e.condition, t, r, n) ? astEvaluate(e.yes, t, r, n) : astEvaluate(e.no, t, r, n);

      case D:
        return astAssign(e.target, t, r, astEvaluate(e.value, t, r, n));

      case j:
        {
            const i = r?.getConverter?.(e.name);
            if (i == null) {
                throw createMappedError(103, e.name);
            }
            if ("toView" in i) {
                return i.toView(astEvaluate(e.expression, t, r, n), ...e.args.map((e => astEvaluate(e, t, r, n))));
            }
            return astEvaluate(e.expression, t, r, n);
        }

      case N:
        return astEvaluate(e.expression, t, r, n);

      case H:
        return e.name;

      case K:
        return astEvaluate(e.iterable, t, r, n);

      case z:
        if (e.isMulti) {
            let i = e.parts[0];
            let o = 0;
            for (;o < e.expressions.length; ++o) {
                i += d(astEvaluate(e.expressions[o], t, r, n));
                i += e.parts[o + 1];
            }
            return i;
        } else {
            return `${e.parts[0]}${astEvaluate(e.firstExpression, t, r, n)}${e.parts[1]}`;
        }

      case q:
        return astEvaluate(e.target, t, r, n);

      case G:
        {
            return e.list.map((e => astEvaluate(e, t, r, n)));
        }

      case V:
      case U:
      case W:
      default:
        return void 0;

      case J:
        return e.evaluate(t, r, n);
    }
}

function astAssign(e, t, n, i) {
    switch (e.$kind) {
      case A:
        {
            if (e.name === "$host") {
                throw createMappedError(106);
            }
            const r = Q(t, e.name, e.ancestor);
            return r[e.name] = i;
        }

      case M:
        {
            const r = astEvaluate(e.object, t, n, null);
            if (isObject(r)) {
                if (e.name === "length" && isArray(r) && !isNaN(i)) {
                    r.splice(i);
                } else {
                    r[e.name] = i;
                }
            } else {
                astAssign(e.object, t, n, {
                    [e.name]: i
                });
            }
            return i;
        }

      case R:
        {
            const o = astEvaluate(e.object, t, n, null);
            const a = astEvaluate(e.key, t, n, null);
            if (isArray(o)) {
                if (a === "length" && !isNaN(i)) {
                    o.splice(i);
                    return i;
                }
                if (r(a)) {
                    o.splice(a, 1, i);
                    return i;
                }
            }
            return o[a] = i;
        }

      case D:
        astAssign(e.value, t, n, i);
        return astAssign(e.target, t, n, i);

      case j:
        {
            const r = n?.getConverter?.(e.name);
            if (r == null) {
                throw createMappedError(103, e.name);
            }
            if ("fromView" in r) {
                i = r.fromView(i, ...e.args.map((e => astEvaluate(e, t, n, null))));
            }
            return astAssign(e.expression, t, n, i);
        }

      case N:
        return astAssign(e.expression, t, n, i);

      case G:
      case W:
        {
            const r = e.list;
            const o = r.length;
            let a;
            let c;
            for (a = 0; a < o; a++) {
                c = r[a];
                switch (c.$kind) {
                  case q:
                    astAssign(c, t, n, i);
                    break;

                  case G:
                  case W:
                    {
                        if (typeof i !== "object" || i === null) {
                            throw createMappedError(112);
                        }
                        let e = astEvaluate(c.source, Scope.create(i), n, null);
                        if (e === void 0 && c.initializer) {
                            e = astEvaluate(c.initializer, t, n, null);
                        }
                        astAssign(c, t, n, e);
                        break;
                    }
                }
            }
            break;
        }

      case q:
        {
            if (e instanceof DestructuringAssignmentSingleExpression) {
                if (i == null) {
                    return;
                }
                if (typeof i !== "object") {
                    throw createMappedError(112);
                }
                let r = astEvaluate(e.source, Scope.create(i), n, null);
                if (r === void 0 && e.initializer) {
                    r = astEvaluate(e.initializer, t, n, null);
                }
                astAssign(e.target, t, n, r);
            } else {
                if (i == null) {
                    return;
                }
                if (typeof i !== "object") {
                    throw createMappedError(112);
                }
                const o = e.indexOrProperties;
                let a;
                if (r(o)) {
                    if (!Array.isArray(i)) {
                        throw createMappedError(112);
                    }
                    a = i.slice(o);
                } else {
                    a = Object.entries(i).reduce(((e, [t, r]) => {
                        if (!o.includes(t)) {
                            e[t] = r;
                        }
                        return e;
                    }), {});
                }
                astAssign(e.target, t, n, a);
            }
            break;
        }

      case J:
        return e.assign(t, n, i);

      default:
        return void 0;
    }
}

function astBind(e, t, r) {
    switch (e.$kind) {
      case N:
        {
            const n = e.name;
            const i = e.key;
            const o = r.getBehavior?.(n);
            if (o == null) {
                throw createMappedError(101, n);
            }
            if (r[i] === void 0) {
                r[i] = o;
                o.bind?.(t, r, ...e.args.map((e => astEvaluate(e, t, r, null))));
            } else {
                throw createMappedError(102, n);
            }
            astBind(e.expression, t, r);
            return;
        }

      case j:
        {
            const n = e.name;
            const i = r.getConverter?.(n);
            if (i == null) {
                throw createMappedError(103, n);
            }
            const o = i.signals;
            if (o != null) {
                const e = r.getSignaler?.();
                const t = o.length;
                let n = 0;
                for (;n < t; ++n) {
                    e?.addSignalListener(o[n], r);
                }
            }
            astBind(e.expression, t, r);
            return;
        }

      case K:
        {
            astBind(e.iterable, t, r);
            break;
        }

      case J:
        {
            e.bind?.(t, r);
        }
    }
}

function astUnbind(e, t, r) {
    switch (e.$kind) {
      case N:
        {
            const n = e.key;
            const i = r;
            if (i[n] !== void 0) {
                i[n].unbind?.(t, r);
                i[n] = void 0;
            }
            astUnbind(e.expression, t, r);
            break;
        }

      case j:
        {
            const n = r.getConverter?.(e.name);
            if (n?.signals === void 0) {
                return;
            }
            const i = r.getSignaler?.();
            let o = 0;
            for (;o < n.signals.length; ++o) {
                i?.removeSignalListener(n.signals[o], r);
            }
            astUnbind(e.expression, t, r);
            break;
        }

      case K:
        {
            astUnbind(e.iterable, t, r);
            break;
        }

      case J:
        {
            e.unbind?.(t, r);
        }
    }
}

const getFunction = (e, t, r) => {
    const n = t == null ? null : t[r];
    if (isFunction(n)) {
        return n;
    }
    if (!e && n == null) {
        return null;
    }
    throw createMappedError(111, r);
};

const isNumberOrBigInt = e => {
    switch (typeof e) {
      case "number":
      case "bigint":
        return true;

      default:
        return false;
    }
};

const isStringOrDate = e => {
    switch (typeof e) {
      case "string":
        return true;

      case "object":
        return e instanceof Date;

      default:
        return false;
    }
};

const X = "at map filter includes indexOf lastIndexOf findIndex find flat flatMap join reduce reduceRight slice every some sort".split(" ");

const Y = /*@__PURE__*/ e.createInterface("ICoercionConfiguration");

const Z = 0;

const ee = 1;

const te = 2;

const se = 4;

const re = /*@__PURE__*/ p({
    None: Z,
    Observer: ee,
    Node: te,
    Layout: se
});

function copyIndexMap(e, t, r) {
    const {length: n} = e;
    const i = Array(n);
    let o = 0;
    while (o < n) {
        i[o] = e[o];
        ++o;
    }
    if (t !== void 0) {
        i.deletedIndices = t.slice(0);
    } else if (e.deletedIndices !== void 0) {
        i.deletedIndices = e.deletedIndices.slice(0);
    } else {
        i.deletedIndices = [];
    }
    if (r !== void 0) {
        i.deletedItems = r.slice(0);
    } else if (e.deletedItems !== void 0) {
        i.deletedItems = e.deletedItems.slice(0);
    } else {
        i.deletedItems = [];
    }
    i.isIndexMap = true;
    return i;
}

function createIndexMap(e = 0) {
    const t = Array(e);
    let r = 0;
    while (r < e) {
        t[r] = r++;
    }
    t.deletedIndices = [];
    t.deletedItems = [];
    t.isIndexMap = true;
    return t;
}

function cloneIndexMap(e) {
    const t = e.slice();
    t.deletedIndices = e.deletedIndices.slice();
    t.deletedItems = e.deletedItems.slice();
    t.isIndexMap = true;
    return t;
}

function isIndexMap(e) {
    return isArray(e) && e.isIndexMap === true;
}

let ne = new Map;

let ie = false;

function batch(e) {
    const t = ne;
    const r = ne = new Map;
    ie = true;
    try {
        e();
    } finally {
        ne = null;
        ie = false;
        try {
            let e;
            let n;
            let i;
            let o;
            let a;
            let c = false;
            let u;
            let l;
            for (e of r) {
                n = e[0];
                i = e[1];
                if (t?.has(n)) {
                    t.set(n, i);
                }
                if (i[0] === 1) {
                    n.notify(i[1], i[2]);
                } else {
                    o = i[1];
                    a = i[2];
                    c = false;
                    if (a.deletedIndices.length > 0) {
                        c = true;
                    } else {
                        for (u = 0, l = a.length; u < l; ++u) {
                            if (a[u] !== u) {
                                c = true;
                                break;
                            }
                        }
                    }
                    if (c) {
                        n.notifyCollection(o, a);
                    }
                }
            }
        } finally {
            ne = t;
        }
    }
}

function addCollectionBatch(e, t, r) {
    if (!ne.has(e)) {
        ne.set(e, [ 2, t, r ]);
    } else {
        ne.get(e)[2] = r;
    }
}

function addValueBatch(e, t, r) {
    const n = ne.get(e);
    if (n === void 0) {
        ne.set(e, [ 1, t, r ]);
    } else {
        n[1] = t;
        n[2] = r;
    }
}

function subscriberCollection(e) {
    return e == null ? subscriberCollectionDeco : subscriberCollectionDeco(e);
}

const oe = new WeakSet;

function subscriberCollectionDeco(e) {
    if (oe.has(e)) {
        return;
    }
    oe.add(e);
    const t = e.prototype;
    l(t, "subs", {
        get: getSubscriberRecord
    });
    ensureProto(t, "subscribe", addSubscriber);
    ensureProto(t, "unsubscribe", removeSubscriber);
}

class SubscriberRecord {
    constructor() {
        this.count = 0;
        this.t = [];
    }
    add(e) {
        if (this.t.includes(e)) {
            return false;
        }
        this.t[this.t.length] = e;
        ++this.count;
        return true;
    }
    remove(e) {
        const t = this.t.indexOf(e);
        if (t !== -1) {
            this.t.splice(t, 1);
            --this.count;
            return true;
        }
        return false;
    }
    notify(e, t) {
        if (ie) {
            addValueBatch(this, e, t);
            return;
        }
        const r = this.t.slice(0);
        const n = r.length;
        let i = 0;
        for (;i < n; ++i) {
            r[i].handleChange(e, t);
        }
        return;
    }
    notifyCollection(e, t) {
        const r = this.t.slice(0);
        const n = r.length;
        let i = 0;
        for (;i < n; ++i) {
            r[i].handleCollectionChange(e, t);
        }
        return;
    }
}

function getSubscriberRecord() {
    return defineHiddenProp(this, "subs", new SubscriberRecord);
}

function addSubscriber(e) {
    return this.subs.add(e);
}

function removeSubscriber(e) {
    return this.subs.remove(e);
}

class CollectionLengthObserver {
    constructor(e) {
        this.owner = e;
        this.type = ee;
        this.v = (this.o = e.collection).length;
    }
    getValue() {
        return this.o.length;
    }
    setValue(e) {
        if (e !== this.v) {
            if (!Number.isNaN(e)) {
                this.o.splice(e);
                this.v = this.o.length;
            }
        }
    }
    handleCollectionChange(e, t) {
        const r = this.v;
        const n = this.o.length;
        if ((this.v = n) !== r) {
            this.subs.notify(this.v, r);
        }
    }
}

class CollectionSizeObserver {
    constructor(e) {
        this.owner = e;
        this.type = ee;
        this.v = (this.o = e.collection).size;
    }
    getValue() {
        return this.o.size;
    }
    setValue() {
        throw createMappedError(220);
    }
    handleCollectionChange(e, t) {
        const r = this.v;
        const n = this.o.size;
        if ((this.v = n) !== r) {
            this.subs.notify(this.v, r);
        }
    }
}

function implementLengthObserver(e) {
    const t = e.prototype;
    ensureProto(t, "subscribe", subscribe);
    ensureProto(t, "unsubscribe", unsubscribe);
    subscriberCollection(e);
}

function subscribe(e) {
    if (this.subs.add(e) && this.subs.count === 1) {
        this.owner.subscribe(this);
    }
}

function unsubscribe(e) {
    if (this.subs.remove(e) && this.subs.count === 0) {
        this.owner.subscribe(this);
    }
}

implementLengthObserver(CollectionLengthObserver);

implementLengthObserver(CollectionSizeObserver);

const ae = Symbol.for("__au_arr_obs__");

const ce = Array[ae] ?? defineHiddenProp(Array, ae, new WeakMap);

function sortCompare(e, t) {
    if (e === t) {
        return 0;
    }
    e = e === null ? "null" : e.toString();
    t = t === null ? "null" : t.toString();
    return e < t ? -1 : 1;
}

function preSortCompare(e, t) {
    if (e === void 0) {
        if (t === void 0) {
            return 0;
        } else {
            return 1;
        }
    }
    if (t === void 0) {
        return -1;
    }
    return 0;
}

function insertionSort(e, t, r, n, i) {
    let o, a, c, u, l;
    let h, f;
    for (h = r + 1; h < n; h++) {
        o = e[h];
        a = t[h];
        for (f = h - 1; f >= r; f--) {
            c = e[f];
            u = t[f];
            l = i(c, o);
            if (l > 0) {
                e[f + 1] = c;
                t[f + 1] = u;
            } else {
                break;
            }
        }
        e[f + 1] = o;
        t[f + 1] = a;
    }
}

function quickSort(e, t, r, n, i) {
    let o = 0, a = 0;
    let c, u, l;
    let h, f, p;
    let d, w, b;
    let v, x;
    let E, y, A, C;
    let m, k, O, S;
    while (true) {
        if (n - r <= 10) {
            insertionSort(e, t, r, n, i);
            return;
        }
        o = r + (n - r >> 1);
        c = e[r];
        h = t[r];
        u = e[n - 1];
        f = t[n - 1];
        l = e[o];
        p = t[o];
        d = i(c, u);
        if (d > 0) {
            v = c;
            x = h;
            c = u;
            h = f;
            u = v;
            f = x;
        }
        w = i(c, l);
        if (w >= 0) {
            v = c;
            x = h;
            c = l;
            h = p;
            l = u;
            p = f;
            u = v;
            f = x;
        } else {
            b = i(u, l);
            if (b > 0) {
                v = u;
                x = f;
                u = l;
                f = p;
                l = v;
                p = x;
            }
        }
        e[r] = c;
        t[r] = h;
        e[n - 1] = l;
        t[n - 1] = p;
        E = u;
        y = f;
        A = r + 1;
        C = n - 1;
        e[o] = e[A];
        t[o] = t[A];
        e[A] = E;
        t[A] = y;
        e: for (a = A + 1; a < C; a++) {
            m = e[a];
            k = t[a];
            O = i(m, E);
            if (O < 0) {
                e[a] = e[A];
                t[a] = t[A];
                e[A] = m;
                t[A] = k;
                A++;
            } else if (O > 0) {
                do {
                    C--;
                    if (C == a) {
                        break e;
                    }
                    S = e[C];
                    O = i(S, E);
                } while (O > 0);
                e[a] = e[C];
                t[a] = t[C];
                e[C] = m;
                t[C] = k;
                if (O < 0) {
                    m = e[a];
                    k = t[a];
                    e[a] = e[A];
                    t[a] = t[A];
                    e[A] = m;
                    t[A] = k;
                    A++;
                }
            }
        }
        if (n - C < A - r) {
            quickSort(e, t, C, n, i);
            n = A;
        } else {
            quickSort(e, t, r, A, i);
            r = C;
        }
    }
}

const ue = Array.prototype;

const le = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

let he;

let fe;

function overrideArrayPrototypes() {
    const e = ue.push;
    const t = ue.unshift;
    const r = ue.pop;
    const n = ue.shift;
    const i = ue.splice;
    const o = ue.reverse;
    const a = ue.sort;
    fe = {
        push: e,
        unshift: t,
        pop: r,
        shift: n,
        splice: i,
        reverse: o,
        sort: a
    };
    he = {
        push: function(...t) {
            const r = ce.get(this);
            if (r === void 0) {
                return e.apply(this, t);
            }
            const n = this.length;
            const i = t.length;
            if (i === 0) {
                return n;
            }
            this.length = r.indexMap.length = n + i;
            let o = n;
            while (o < this.length) {
                this[o] = t[o - n];
                r.indexMap[o] = -2;
                o++;
            }
            r.notify();
            return this.length;
        },
        unshift: function(...e) {
            const r = ce.get(this);
            if (r === void 0) {
                return t.apply(this, e);
            }
            const n = e.length;
            const i = new Array(n);
            let o = 0;
            while (o < n) {
                i[o++] = -2;
            }
            t.apply(r.indexMap, i);
            const a = t.apply(this, e);
            r.notify();
            return a;
        },
        pop: function() {
            const e = ce.get(this);
            if (e === void 0) {
                return r.call(this);
            }
            const t = e.indexMap;
            const n = r.call(this);
            const i = t.length - 1;
            if (t[i] > -1) {
                t.deletedIndices.push(t[i]);
                t.deletedItems.push(n);
            }
            r.call(t);
            e.notify();
            return n;
        },
        shift: function() {
            const e = ce.get(this);
            if (e === void 0) {
                return n.call(this);
            }
            const t = e.indexMap;
            const r = n.call(this);
            if (t[0] > -1) {
                t.deletedIndices.push(t[0]);
                t.deletedItems.push(r);
            }
            n.call(t);
            e.notify();
            return r;
        },
        splice: function(...e) {
            const t = e[0];
            const r = e[1];
            const n = ce.get(this);
            if (n === void 0) {
                return i.apply(this, e);
            }
            const o = this.length;
            const a = t | 0;
            const c = a < 0 ? Math.max(o + a, 0) : Math.min(a, o);
            const u = n.indexMap;
            const l = e.length;
            const h = l === 0 ? 0 : l === 1 ? o - c : r;
            let f = c;
            if (h > 0) {
                const e = f + h;
                while (f < e) {
                    if (u[f] > -1) {
                        u.deletedIndices.push(u[f]);
                        u.deletedItems.push(this[f]);
                    }
                    f++;
                }
            }
            f = 0;
            if (l > 2) {
                const e = l - 2;
                const n = new Array(e);
                while (f < e) {
                    n[f++] = -2;
                }
                i.call(u, t, r, ...n);
            } else {
                i.apply(u, e);
            }
            const p = i.apply(this, e);
            if (h > 0 || f > 0) {
                n.notify();
            }
            return p;
        },
        reverse: function() {
            const e = ce.get(this);
            if (e === void 0) {
                o.call(this);
                return this;
            }
            const t = this.length;
            const r = t / 2 | 0;
            let n = 0;
            while (n !== r) {
                const r = t - n - 1;
                const i = this[n];
                const o = e.indexMap[n];
                const a = this[r];
                const c = e.indexMap[r];
                this[n] = a;
                e.indexMap[n] = c;
                this[r] = i;
                e.indexMap[r] = o;
                n++;
            }
            e.notify();
            return this;
        },
        sort: function(e) {
            const t = ce.get(this);
            if (t === void 0) {
                a.call(this, e);
                return this;
            }
            let r = this.length;
            if (r < 2) {
                return this;
            }
            quickSort(this, t.indexMap, 0, r, preSortCompare);
            let n = 0;
            while (n < r) {
                if (this[n] === void 0) {
                    break;
                }
                n++;
            }
            if (e === void 0 || !isFunction(e)) {
                e = sortCompare;
            }
            quickSort(this, t.indexMap, 0, n, e);
            let i = false;
            for (n = 0, r = t.indexMap.length; r > n; ++n) {
                if (t.indexMap[n] !== n) {
                    i = true;
                    break;
                }
            }
            if (i || ie) {
                t.notify();
            }
            return this;
        }
    };
    for (const e of le) {
        l(he[e], "observing", {
            value: true,
            writable: false,
            configurable: false,
            enumerable: false
        });
    }
}

let pe = false;

const de = "__au_arr_on__";

function enableArrayObservation() {
    if (he === undefined) {
        overrideArrayPrototypes();
    }
    if (!(b(de, Array) ?? false)) {
        v(de, true, Array);
        for (const e of le) {
            if (ue[e].observing !== true) {
                defineHiddenProp(ue, e, he[e]);
            }
        }
    }
}

function disableArrayObservation() {
    for (const e of le) {
        if (ue[e].observing === true) {
            defineHiddenProp(ue, e, fe[e]);
        }
    }
}

class ArrayObserver {
    constructor(e) {
        this.type = ee;
        if (!pe) {
            pe = true;
            enableArrayObservation();
        }
        this.indexObservers = {};
        this.collection = e;
        this.indexMap = createIndexMap(e.length);
        this.lenObs = void 0;
        ce.set(e, this);
    }
    notify() {
        const e = this.subs;
        const t = this.indexMap;
        if (ie) {
            addCollectionBatch(e, this.collection, t);
            return;
        }
        const r = this.collection;
        const n = r.length;
        this.indexMap = createIndexMap(n);
        this.subs.notifyCollection(r, t);
    }
    getLengthObserver() {
        return this.lenObs ??= new CollectionLengthObserver(this);
    }
    getIndexObserver(e) {
        return this.indexObservers[e] ??= new ArrayIndexObserver(this, e);
    }
}

class ArrayIndexObserver {
    constructor(e, t) {
        this.owner = e;
        this.index = t;
        this.doNotCache = true;
        this.value = this.getValue();
    }
    getValue() {
        return this.owner.collection[this.index];
    }
    setValue(e) {
        if (e === this.getValue()) {
            return;
        }
        const t = this.owner;
        const r = this.index;
        const n = t.indexMap;
        if (n[r] > -1) {
            n.deletedIndices.push(n[r]);
        }
        n[r] = -2;
        t.collection[r] = e;
        t.notify();
    }
    handleCollectionChange(e, t) {
        const r = this.index;
        const n = t[r] === r;
        if (n) {
            return;
        }
        const i = this.value;
        const o = this.value = this.getValue();
        if (i !== o) {
            this.subs.notify(o, i);
        }
    }
    subscribe(e) {
        if (this.subs.add(e) && this.subs.count === 1) {
            this.owner.subscribe(this);
        }
    }
    unsubscribe(e) {
        if (this.subs.remove(e) && this.subs.count === 0) {
            this.owner.unsubscribe(this);
        }
    }
}

subscriberCollection(ArrayObserver);

subscriberCollection(ArrayIndexObserver);

function getArrayObserver(e) {
    let t = ce.get(e);
    if (t === void 0) {
        t = new ArrayObserver(e);
    }
    return t;
}

const we = Symbol.for("__au_set_obs__");

const be = Set[we] ?? defineHiddenProp(Set, we, new WeakMap);

const ve = Set.prototype;

const ge = ve.add;

const xe = ve.clear;

const Ee = ve.delete;

const ye = {
    add: ge,
    clear: xe,
    delete: Ee
};

const Ae = [ "add", "clear", "delete" ];

const Ce = {
    add: function(e) {
        const t = be.get(this);
        if (t === undefined) {
            ge.call(this, e);
            return this;
        }
        const r = this.size;
        ge.call(this, e);
        const n = this.size;
        if (n === r) {
            return this;
        }
        t.indexMap[r] = -2;
        t.notify();
        return this;
    },
    clear: function() {
        const e = be.get(this);
        if (e === undefined) {
            return xe.call(this);
        }
        const t = this.size;
        if (t > 0) {
            const t = e.indexMap;
            let r = 0;
            for (const e of this.keys()) {
                if (t[r] > -1) {
                    t.deletedIndices.push(t[r]);
                    t.deletedItems.push(e);
                }
                r++;
            }
            xe.call(this);
            t.length = 0;
            e.notify();
        }
        return undefined;
    },
    delete: function(e) {
        const t = be.get(this);
        if (t === undefined) {
            return Ee.call(this, e);
        }
        const r = this.size;
        if (r === 0) {
            return false;
        }
        let n = 0;
        const i = t.indexMap;
        for (const r of this.keys()) {
            if (r === e) {
                if (i[n] > -1) {
                    i.deletedIndices.push(i[n]);
                    i.deletedItems.push(r);
                }
                i.splice(n, 1);
                const o = Ee.call(this, e);
                if (o === true) {
                    t.notify();
                }
                return o;
            }
            n++;
        }
        return false;
    }
};

const me = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const e of Ae) {
    l(Ce[e], "observing", {
        value: true,
        writable: false,
        configurable: false,
        enumerable: false
    });
}

let ke = false;

const Oe = "__au_set_on__";

function enableSetObservation() {
    if (!(b(Oe, Set) ?? false)) {
        v(Oe, true, Set);
        for (const e of Ae) {
            if (ve[e].observing !== true) {
                l(ve, e, {
                    ...me,
                    value: Ce[e]
                });
            }
        }
    }
}

function disableSetObservation() {
    for (const e of Ae) {
        if (ve[e].observing === true) {
            l(ve, e, {
                ...me,
                value: ye[e]
            });
        }
    }
}

class SetObserver {
    constructor(e) {
        this.type = ee;
        if (!ke) {
            ke = true;
            enableSetObservation();
        }
        this.collection = e;
        this.indexMap = createIndexMap(e.size);
        this.lenObs = void 0;
        be.set(e, this);
    }
    notify() {
        const e = this.subs;
        const t = this.indexMap;
        if (ie) {
            addCollectionBatch(e, this.collection, t);
            return;
        }
        const r = this.collection;
        const n = r.size;
        this.indexMap = createIndexMap(n);
        this.subs.notifyCollection(r, t);
    }
    getLengthObserver() {
        return this.lenObs ??= new CollectionSizeObserver(this);
    }
}

subscriberCollection(SetObserver);

function getSetObserver(e) {
    let t = be.get(e);
    if (t === void 0) {
        t = new SetObserver(e);
    }
    return t;
}

const Se = Symbol.for("__au_map_obs__");

const Te = Map[Se] ?? defineHiddenProp(Map, Se, new WeakMap);

const Pe = Map.prototype;

const Ie = Pe.set;

const Le = Pe.clear;

const Me = Pe.delete;

const Re = {
    set: Ie,
    clear: Le,
    delete: Me
};

const _e = [ "set", "clear", "delete" ];

const Be = {
    set: function(e, t) {
        const r = Te.get(this);
        if (r === undefined) {
            Ie.call(this, e, t);
            return this;
        }
        const n = this.get(e);
        const i = this.size;
        Ie.call(this, e, t);
        const o = this.size;
        if (o === i) {
            let t = 0;
            for (const i of this.entries()) {
                if (i[0] === e) {
                    if (i[1] !== n) {
                        r.indexMap.deletedIndices.push(r.indexMap[t]);
                        r.indexMap.deletedItems.push(i);
                        r.indexMap[t] = -2;
                        r.notify();
                    }
                    return this;
                }
                t++;
            }
            return this;
        }
        r.indexMap[i] = -2;
        r.notify();
        return this;
    },
    clear: function() {
        const e = Te.get(this);
        if (e === undefined) {
            return Le.call(this);
        }
        const t = this.size;
        if (t > 0) {
            const t = e.indexMap;
            let r = 0;
            for (const e of this.keys()) {
                if (t[r] > -1) {
                    t.deletedIndices.push(t[r]);
                    t.deletedItems.push(e);
                }
                r++;
            }
            Le.call(this);
            t.length = 0;
            e.notify();
        }
        return undefined;
    },
    delete: function(e) {
        const t = Te.get(this);
        if (t === undefined) {
            return Me.call(this, e);
        }
        const r = this.size;
        if (r === 0) {
            return false;
        }
        let n = 0;
        const i = t.indexMap;
        for (const r of this.keys()) {
            if (r === e) {
                if (i[n] > -1) {
                    i.deletedIndices.push(i[n]);
                    i.deletedItems.push(r);
                }
                i.splice(n, 1);
                const o = Me.call(this, e);
                if (o === true) {
                    t.notify();
                }
                return o;
            }
            ++n;
        }
        return false;
    }
};

const $e = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const e of _e) {
    l(Be[e], "observing", {
        value: true,
        writable: false,
        configurable: false,
        enumerable: false
    });
}

let De = false;

const Fe = "__au_map_on__";

function enableMapObservation() {
    if (!(b(Fe, Map) ?? false)) {
        v(Fe, true, Map);
        for (const e of _e) {
            if (Pe[e].observing !== true) {
                l(Pe, e, {
                    ...$e,
                    value: Be[e]
                });
            }
        }
    }
}

function disableMapObservation() {
    for (const e of _e) {
        if (Pe[e].observing === true) {
            l(Pe, e, {
                ...$e,
                value: Re[e]
            });
        }
    }
}

class MapObserver {
    constructor(e) {
        this.type = ee;
        if (!De) {
            De = true;
            enableMapObservation();
        }
        this.collection = e;
        this.indexMap = createIndexMap(e.size);
        this.lenObs = void 0;
        Te.set(e, this);
    }
    notify() {
        const e = this.subs;
        const t = this.indexMap;
        if (ie) {
            addCollectionBatch(e, this.collection, t);
            return;
        }
        const r = this.collection;
        const n = r.size;
        this.indexMap = createIndexMap(n);
        e.notifyCollection(r, t);
    }
    getLengthObserver() {
        return this.lenObs ??= new CollectionSizeObserver(this);
    }
}

subscriberCollection(MapObserver);

function getMapObserver(e) {
    let t = Te.get(e);
    if (t === void 0) {
        t = new MapObserver(e);
    }
    return t;
}

function getObserverRecord() {
    return defineHiddenProp(this, "obs", new BindingObserverRecord(this));
}

function observe(e, t) {
    this.obs.add(this.oL.getObserver(e, t));
}

function observeCollection$1(e) {
    let t;
    if (isArray(e)) {
        t = getArrayObserver(e);
    } else if (isSet(e)) {
        t = getSetObserver(e);
    } else if (isMap(e)) {
        t = getMapObserver(e);
    } else {
        throw createMappedError(210, e);
    }
    this.obs.add(t);
}

function subscribeTo(e) {
    this.obs.add(e);
}

function noopHandleChange() {
    throw createMappedError(99, "handleChange");
}

function noopHandleCollectionChange() {
    throw createMappedError(99, "handleCollectionChange");
}

class BindingObserverRecord {
    constructor(e) {
        this.version = 0;
        this.count = 0;
        this.o = new Map;
        this.b = e;
    }
    add(e) {
        if (!this.o.has(e)) {
            e.subscribe(this.b);
            ++this.count;
        }
        this.o.set(e, this.version);
    }
    clear() {
        this.o.forEach(unsubscribeStale, this);
        this.count = this.o.size;
    }
    clearAll() {
        this.o.forEach(unsubscribeAll, this);
        this.o.clear();
        this.count = 0;
    }
}

function unsubscribeAll(e, t) {
    t.unsubscribe(this.b);
}

function unsubscribeStale(e, t) {
    if (this.version !== e) {
        t.unsubscribe(this.b);
        this.o.delete(t);
    }
}

function connectableDecorator(e) {
    const t = e.prototype;
    ensureProto(t, "observe", observe);
    ensureProto(t, "observeCollection", observeCollection$1);
    ensureProto(t, "subscribeTo", subscribeTo);
    l(t, "obs", {
        get: getObserverRecord
    });
    ensureProto(t, "handleChange", noopHandleChange);
    ensureProto(t, "handleCollectionChange", noopHandleCollectionChange);
    return e;
}

function connectable(e) {
    return e == null ? connectableDecorator : connectableDecorator(e);
}

const je = w("IExpressionParser", (e => e.singleton(ExpressionParser)));

class ExpressionParser {
    constructor() {
        this.i = createLookup();
        this.u = createLookup();
        this.h = createLookup();
    }
    parse(e, t) {
        let r;
        switch (t) {
          case Ze:
            return new CustomExpression(e);

          case qe:
            r = this.h[e];
            if (r === void 0) {
                r = this.h[e] = this.$parse(e, t);
            }
            return r;

          case Je:
            r = this.u[e];
            if (r === void 0) {
                r = this.u[e] = this.$parse(e, t);
            }
            return r;

          default:
            {
                if (e.length === 0) {
                    if (t === Xe || t === Ye) {
                        return PrimitiveLiteralExpression.$empty;
                    }
                    throw invalidEmptyExpression();
                }
                r = this.i[e];
                if (r === void 0) {
                    r = this.i[e] = this.$parse(e, t);
                }
                return r;
            }
        }
    }
    $parse(e, t) {
        et = e;
        tt = 0;
        st = e.length;
        rt = 0;
        nt = 0;
        it = 6291456;
        ot = "";
        at = $charCodeAt(0);
        ct = true;
        ut = false;
        lt = true;
        ht = -1;
        return parse(61, t === void 0 ? Ye : t);
    }
}

function unescapeCode(e) {
    switch (e) {
      case 98:
        return 8;

      case 116:
        return 9;

      case 110:
        return 10;

      case 118:
        return 11;

      case 102:
        return 12;

      case 114:
        return 13;

      case 34:
        return 34;

      case 39:
        return 39;

      case 92:
        return 92;

      default:
        return e;
    }
}

const Ne = PrimitiveLiteralExpression.$false;

const Ve = PrimitiveLiteralExpression.$true;

const Ue = PrimitiveLiteralExpression.$null;

const He = PrimitiveLiteralExpression.$undefined;

const Ke = new AccessThisExpression(0);

const ze = new AccessThisExpression(1);

const Ge = new AccessBoundaryExpression;

const We = "None";

const qe = "Interpolation";

const Je = "IsIterator";

const Qe = "IsChainable";

const Xe = "IsFunction";

const Ye = "IsProperty";

const Ze = "IsCustom";

let et = "";

let tt = 0;

let st = 0;

let rt = 0;

let nt = 0;

let it = 6291456;

let ot = "";

let at;

let ct = true;

let ut = false;

let lt = true;

let ht = -1;

const ft = String.fromCharCode;

const $charCodeAt = e => et.charCodeAt(e);

const $tokenRaw = () => et.slice(nt, tt);

const pt = ("Infinity NaN isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent" + " Array BigInt Boolean Date Map Number Object RegExp Set String JSON Math Intl").split(" ");

function parseExpression(e, t) {
    et = e;
    tt = 0;
    st = e.length;
    rt = 0;
    nt = 0;
    it = 6291456;
    ot = "";
    at = $charCodeAt(0);
    ct = true;
    ut = false;
    lt = true;
    ht = -1;
    return parse(61, t === void 0 ? Ye : t);
}

function parse(e, t) {
    if (t === Ze) {
        return new CustomExpression(et);
    }
    if (tt === 0) {
        if (t === qe) {
            return parseInterpolation();
        }
        nextToken();
        if (it & 4194304) {
            throw invalidStartOfExpression();
        }
    }
    ct = 513 > e;
    ut = false;
    lt = 514 > e;
    let r = false;
    let n = void 0;
    let i = 0;
    if (it & 131072) {
        const e = wt[it & 63];
        nextToken();
        n = new UnaryExpression(e, parse(514, t));
        ct = false;
    } else {
        e: switch (it) {
          case 12295:
            i = rt;
            ct = false;
            lt = false;
            do {
                nextToken();
                ++i;
                switch (it) {
                  case 65546:
                    nextToken();
                    if ((it & 12288) === 0) {
                        throw expectedIdentifier();
                    }
                    break;

                  case 11:
                  case 12:
                    throw expectedIdentifier();

                  case 2162701:
                    ut = true;
                    nextToken();
                    if ((it & 12288) === 0) {
                        n = i === 0 ? Ke : i === 1 ? ze : new AccessThisExpression(i);
                        r = true;
                        break e;
                    }
                    break;

                  default:
                    if (it & 2097152) {
                        n = i === 0 ? Ke : i === 1 ? ze : new AccessThisExpression(i);
                        break e;
                    }
                    throw invalidMemberExpression();
                }
            } while (it === 12295);

          case 4096:
            {
                const e = ot;
                if (t === Je) {
                    n = new BindingIdentifier(e);
                } else if (lt && pt.includes(e)) {
                    n = new AccessGlobalExpression(e);
                } else if (lt && e === "import") {
                    throw unexpectedImportKeyword();
                } else {
                    n = new AccessScopeExpression(e, i);
                }
                ct = !ut;
                nextToken();
                if (consumeOpt(51)) {
                    if (it === 524297) {
                        throw functionBodyInArrowFn();
                    }
                    const t = ut;
                    const r = rt;
                    ++rt;
                    const i = parse(62, We);
                    ut = t;
                    rt = r;
                    ct = false;
                    n = new ArrowFunction([ new BindingIdentifier(e) ], i);
                }
                break;
            }

          case 11:
            throw unexpectedDoubleDot();

          case 12:
            throw invalidSpreadOp();

          case 12292:
            ct = false;
            nextToken();
            switch (rt) {
              case 0:
                n = Ke;
                break;

              case 1:
                n = ze;
                break;

              default:
                n = new AccessThisExpression(rt);
                break;
            }
            break;

          case 12293:
            ct = false;
            nextToken();
            n = Ge;
            break;

          case 2688008:
            n = parseCoverParenthesizedExpressionAndArrowParameterList(t);
            break;

          case 2688019:
            n = et.search(/\s+of\s+/) > tt ? parseArrayDestructuring() : parseArrayLiteralExpression(t);
            break;

          case 524297:
            n = parseObjectLiteralExpression(t);
            break;

          case 2163760:
            n = new TemplateExpression([ ot ]);
            ct = false;
            nextToken();
            break;

          case 2163761:
            n = parseTemplate(t, n, false);
            break;

          case 16384:
          case 32768:
            n = new PrimitiveLiteralExpression(ot);
            ct = false;
            nextToken();
            break;

          case 8194:
          case 8195:
          case 8193:
          case 8192:
            n = wt[it & 63];
            ct = false;
            nextToken();
            break;

          default:
            if (tt >= st) {
                throw unexpectedEndOfExpression();
            } else {
                throw unconsumedToken();
            }
        }
        if (t === Je) {
            return parseForOfStatement(n);
        }
        if (514 < e) {
            return n;
        }
        if (it === 11 || it === 12) {
            throw expectedIdentifier();
        }
        if (n.$kind === x) {
            switch (it) {
              case 2162701:
                ut = true;
                ct = false;
                nextToken();
                if ((it & 13312) === 0) {
                    throw unexpectedTokenInOptionalChain();
                }
                if (it & 12288) {
                    n = new AccessScopeExpression(ot, n.ancestor);
                    nextToken();
                } else if (it === 2688008) {
                    n = new CallFunctionExpression(n, parseArguments(), true);
                } else if (it === 2688019) {
                    n = parseKeyedExpression(n, true);
                } else {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                break;

              case 65546:
                ct = !ut;
                nextToken();
                if ((it & 12288) === 0) {
                    throw expectedIdentifier();
                }
                n = new AccessScopeExpression(ot, n.ancestor);
                nextToken();
                break;

              case 11:
              case 12:
                throw expectedIdentifier();

              case 2688008:
                n = new CallFunctionExpression(n, parseArguments(), r);
                break;

              case 2688019:
                n = parseKeyedExpression(n, r);
                break;

              case 2163760:
                n = createTemplateTail(n);
                break;

              case 2163761:
                n = parseTemplate(t, n, true);
                break;
            }
        }
        while ((it & 65536) > 0) {
            switch (it) {
              case 2162701:
                n = parseOptionalChainLHS(n);
                break;

              case 65546:
                nextToken();
                if ((it & 12288) === 0) {
                    throw expectedIdentifier();
                }
                n = parseMemberExpressionLHS(n, false);
                break;

              case 11:
              case 12:
                throw expectedIdentifier();

              case 2688008:
                if (n.$kind === A) {
                    n = new CallScopeExpression(n.name, parseArguments(), n.ancestor, false);
                } else if (n.$kind === M) {
                    n = new CallMemberExpression(n.object, n.name, parseArguments(), n.optional, false);
                } else if (n.$kind === y) {
                    n = new CallGlobalExpression(n.name, parseArguments());
                } else {
                    n = new CallFunctionExpression(n, parseArguments(), false);
                }
                break;

              case 2688019:
                n = parseKeyedExpression(n, false);
                break;

              case 2163760:
                if (ut) {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                n = createTemplateTail(n);
                break;

              case 2163761:
                if (ut) {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                n = parseTemplate(t, n, true);
                break;
            }
        }
    }
    if (it === 11 || it === 12) {
        throw expectedIdentifier();
    }
    if (513 < e) {
        return n;
    }
    while ((it & 262144) > 0) {
        const r = it;
        if ((r & 960) <= e) {
            break;
        }
        nextToken();
        n = new BinaryExpression(wt[r & 63], n, parse(r & 960, t));
        ct = false;
    }
    if (63 < e) {
        return n;
    }
    if (consumeOpt(6291479)) {
        const e = parse(62, t);
        consume(6291477);
        n = new ConditionalExpression(n, e, parse(62, t));
        ct = false;
    }
    if (62 < e) {
        return n;
    }
    if (consumeOpt(4194350)) {
        if (!ct) {
            throw lhsNotAssignable();
        }
        n = new AssignExpression(n, parse(62, t));
    }
    if (61 < e) {
        return n;
    }
    while (consumeOpt(6291481)) {
        if (it === 6291456) {
            throw expectedValueConverterIdentifier();
        }
        const e = ot;
        nextToken();
        const r = new Array;
        while (consumeOpt(6291477)) {
            r.push(parse(62, t));
        }
        n = new ValueConverterExpression(n, e, r);
    }
    while (consumeOpt(6291480)) {
        if (it === 6291456) {
            throw expectedBindingBehaviorIdentifier();
        }
        const e = ot;
        nextToken();
        const r = new Array;
        while (consumeOpt(6291477)) {
            r.push(parse(62, t));
        }
        n = new BindingBehaviorExpression(n, e, r);
    }
    if (it !== 6291456) {
        if (t === qe && it === 7340046) {
            return n;
        }
        if (t === Qe && it === 6291478) {
            if (tt === st) {
                throw unconsumedToken();
            }
            ht = tt - 1;
            return n;
        }
        if ($tokenRaw() === "of") {
            throw unexpectedOfKeyword();
        }
        throw unconsumedToken();
    }
    return n;
}

function parseArrayDestructuring() {
    const e = [];
    const t = new DestructuringAssignmentExpression(G, e, void 0, void 0);
    let r = "";
    let n = true;
    let i = 0;
    while (n) {
        nextToken();
        switch (it) {
          case 7340052:
            n = false;
            addItem();
            break;

          case 6291472:
            addItem();
            break;

          case 4096:
            r = $tokenRaw();
            break;

          default:
            throw unexpectedTokenInDestructuring();
        }
    }
    consume(7340052);
    return t;
    function addItem() {
        if (r !== "") {
            e.push(new DestructuringAssignmentSingleExpression(new AccessMemberExpression(Ke, r), new AccessKeyedExpression(Ke, new PrimitiveLiteralExpression(i++)), void 0));
            r = "";
        } else {
            i++;
        }
    }
}

function parseArguments() {
    const e = ut;
    nextToken();
    const t = [];
    while (it !== 7340047) {
        t.push(parse(62, We));
        if (!consumeOpt(6291472)) {
            break;
        }
    }
    consume(7340047);
    ct = false;
    ut = e;
    return t;
}

function parseKeyedExpression(e, t) {
    const r = ut;
    nextToken();
    e = new AccessKeyedExpression(e, parse(62, We), t);
    consume(7340052);
    ct = !r;
    ut = r;
    return e;
}

function parseOptionalChainLHS(e) {
    ut = true;
    ct = false;
    nextToken();
    if ((it & 13312) === 0) {
        throw unexpectedTokenInOptionalChain();
    }
    if (it & 12288) {
        return parseMemberExpressionLHS(e, true);
    }
    if (it === 2688008) {
        if (e.$kind === A) {
            return new CallScopeExpression(e.name, parseArguments(), e.ancestor, true);
        } else if (e.$kind === M) {
            return new CallMemberExpression(e.object, e.name, parseArguments(), e.optional, true);
        } else {
            return new CallFunctionExpression(e, parseArguments(), true);
        }
    }
    if (it === 2688019) {
        return parseKeyedExpression(e, true);
    }
    throw invalidTaggedTemplateOnOptionalChain();
}

function parseMemberExpressionLHS(e, t) {
    const r = ot;
    switch (it) {
      case 2162701:
        {
            ut = true;
            ct = false;
            const n = tt;
            const i = nt;
            const o = it;
            const a = at;
            const c = ot;
            const u = ct;
            const l = ut;
            nextToken();
            if ((it & 13312) === 0) {
                throw unexpectedTokenInOptionalChain();
            }
            if (it === 2688008) {
                return new CallMemberExpression(e, r, parseArguments(), t, true);
            }
            tt = n;
            nt = i;
            it = o;
            at = a;
            ot = c;
            ct = u;
            ut = l;
            return new AccessMemberExpression(e, r, t);
        }

      case 2688008:
        {
            ct = false;
            return new CallMemberExpression(e, r, parseArguments(), t, false);
        }

      default:
        {
            ct = !ut;
            nextToken();
            return new AccessMemberExpression(e, r, t);
        }
    }
}

function parseCoverParenthesizedExpressionAndArrowParameterList(e) {
    nextToken();
    const t = tt;
    const r = nt;
    const n = it;
    const i = at;
    const o = ot;
    const a = ct;
    const c = ut;
    const u = [];
    let l = 1;
    let h = false;
    e: while (true) {
        if (it === 12) {
            nextToken();
            if (it !== 4096) {
                throw expectedIdentifier();
            }
            u.push(new BindingIdentifier(ot));
            nextToken();
            if (it === 6291472) {
                throw restParamsMustBeLastParam();
            }
            if (it !== 7340047) {
                throw invalidSpreadOp();
            }
            nextToken();
            if (it !== 51) {
                throw invalidSpreadOp();
            }
            nextToken();
            const e = ut;
            const t = rt;
            ++rt;
            const r = parse(62, We);
            ut = e;
            rt = t;
            ct = false;
            return new ArrowFunction(u, r, true);
        }
        switch (it) {
          case 4096:
            u.push(new BindingIdentifier(ot));
            nextToken();
            break;

          case 7340047:
            nextToken();
            break e;

          case 524297:
          case 2688019:
            nextToken();
            l = 4;
            break;

          case 6291472:
            l = 2;
            h = true;
            break e;

          case 2688008:
            l = 2;
            break e;

          default:
            nextToken();
            l = 2;
            break;
        }
        switch (it) {
          case 6291472:
            nextToken();
            h = true;
            if (l === 1) {
                break;
            }
            break e;

          case 7340047:
            nextToken();
            break e;

          case 4194350:
            if (l === 1) {
                l = 3;
            }
            break e;

          case 51:
            if (h) {
                throw invalidArrowParameterList();
            }
            nextToken();
            l = 2;
            break e;

          default:
            if (l === 1) {
                l = 2;
            }
            break e;
        }
    }
    if (it === 51) {
        if (l === 1) {
            nextToken();
            if (it === 524297) {
                throw functionBodyInArrowFn();
            }
            const e = ut;
            const t = rt;
            ++rt;
            const r = parse(62, We);
            ut = e;
            rt = t;
            ct = false;
            return new ArrowFunction(u, r);
        }
        throw invalidArrowParameterList();
    } else if (l === 1 && u.length === 0) {
        throw missingExpectedToken();
    }
    if (h) {
        switch (l) {
          case 2:
            throw invalidArrowParameterList();

          case 3:
            throw defaultParamsInArrowFn();

          case 4:
            throw destructuringParamsInArrowFn();
        }
    }
    tt = t;
    nt = r;
    it = n;
    at = i;
    ot = o;
    ct = a;
    ut = c;
    const f = ut;
    const p = parse(62, e);
    ut = f;
    consume(7340047);
    if (it === 51) {
        switch (l) {
          case 2:
            throw invalidArrowParameterList();

          case 3:
            throw defaultParamsInArrowFn();

          case 4:
            throw destructuringParamsInArrowFn();
        }
    }
    return p;
}

function parseArrayLiteralExpression(e) {
    const t = ut;
    nextToken();
    const r = new Array;
    while (it !== 7340052) {
        if (consumeOpt(6291472)) {
            r.push(He);
            if (it === 7340052) {
                break;
            }
        } else {
            r.push(parse(62, e === Je ? We : e));
            if (consumeOpt(6291472)) {
                if (it === 7340052) {
                    break;
                }
            } else {
                break;
            }
        }
    }
    ut = t;
    consume(7340052);
    if (e === Je) {
        return new ArrayBindingPattern(r);
    } else {
        ct = false;
        return new ArrayLiteralExpression(r);
    }
}

const dt = [ V, U, H, G, W ];

function parseForOfStatement(e) {
    if (!dt.includes(e.$kind)) {
        throw invalidLHSBindingIdentifierInForOf(e.$kind);
    }
    if (it !== 4204594) {
        throw invalidLHSBindingIdentifierInForOf(e.$kind);
    }
    nextToken();
    const t = e;
    const r = parse(61, Qe);
    return new ForOfStatement(t, r, ht);
}

function parseObjectLiteralExpression(e) {
    const t = ut;
    const r = new Array;
    const n = new Array;
    nextToken();
    while (it !== 7340046) {
        r.push(ot);
        if (it & 49152) {
            nextToken();
            consume(6291477);
            n.push(parse(62, e === Je ? We : e));
        } else if (it & 12288) {
            const t = at;
            const r = it;
            const i = tt;
            nextToken();
            if (consumeOpt(6291477)) {
                n.push(parse(62, e === Je ? We : e));
            } else {
                at = t;
                it = r;
                tt = i;
                n.push(parse(515, e === Je ? We : e));
            }
        } else {
            throw invalidPropDefInObjLiteral();
        }
        if (it !== 7340046) {
            consume(6291472);
        }
    }
    ut = t;
    consume(7340046);
    if (e === Je) {
        return new ObjectBindingPattern(r, n);
    } else {
        ct = false;
        return new ObjectLiteralExpression(r, n);
    }
}

function parseInterpolation() {
    const e = [];
    const t = [];
    const r = st;
    let n = "";
    while (tt < r) {
        switch (at) {
          case 36:
            if ($charCodeAt(tt + 1) === 123) {
                e.push(n);
                n = "";
                tt += 2;
                at = $charCodeAt(tt);
                nextToken();
                const r = parse(61, qe);
                t.push(r);
                continue;
            } else {
                n += "$";
            }
            break;

          case 92:
            n += ft(unescapeCode(nextChar()));
            break;

          default:
            n += ft(at);
        }
        nextChar();
    }
    if (t.length) {
        e.push(n);
        return new Interpolation(e, t);
    }
    return null;
}

function parseTemplate(e, t, r) {
    const n = ut;
    const i = [ ot ];
    consume(2163761);
    const o = [ parse(62, e) ];
    while ((it = scanTemplateTail()) !== 2163760) {
        i.push(ot);
        consume(2163761);
        o.push(parse(62, e));
    }
    i.push(ot);
    ct = false;
    ut = n;
    if (r) {
        nextToken();
        return new TaggedTemplateExpression(i, i, t, o);
    } else {
        nextToken();
        return new TemplateExpression(i, o);
    }
}

function createTemplateTail(e) {
    ct = false;
    const t = [ ot ];
    nextToken();
    return new TaggedTemplateExpression(t, t, e);
}

function nextToken() {
    while (tt < st) {
        nt = tt;
        if ((it = Et[at]()) != null) {
            return;
        }
    }
    it = 6291456;
}

function nextChar() {
    return at = $charCodeAt(++tt);
}

function scanIdentifier() {
    while (xt[nextChar()]) ;
    const e = bt[ot = $tokenRaw()];
    return e === undefined ? 4096 : e;
}

function scanNumber(e) {
    let t = at;
    if (e === false) {
        do {
            t = nextChar();
        } while (t <= 57 && t >= 48);
        if (t !== 46) {
            ot = parseInt($tokenRaw(), 10);
            return 32768;
        }
        t = nextChar();
        if (tt >= st) {
            ot = parseInt($tokenRaw().slice(0, -1), 10);
            return 32768;
        }
    }
    if (t <= 57 && t >= 48) {
        do {
            t = nextChar();
        } while (t <= 57 && t >= 48);
    } else {
        at = $charCodeAt(--tt);
    }
    ot = parseFloat($tokenRaw());
    return 32768;
}

function scanString() {
    const e = at;
    nextChar();
    let t = 0;
    const r = new Array;
    let n = tt;
    while (at !== e) {
        if (at === 92) {
            r.push(et.slice(n, tt));
            nextChar();
            t = unescapeCode(at);
            nextChar();
            r.push(ft(t));
            n = tt;
        } else if (tt >= st) {
            throw unterminatedStringLiteral();
        } else {
            nextChar();
        }
    }
    const i = et.slice(n, tt);
    nextChar();
    r.push(i);
    const o = r.join("");
    ot = o;
    return 16384;
}

function scanTemplate() {
    let e = true;
    let t = "";
    while (nextChar() !== 96) {
        if (at === 36) {
            if (tt + 1 < st && $charCodeAt(tt + 1) === 123) {
                tt++;
                e = false;
                break;
            } else {
                t += "$";
            }
        } else if (at === 92) {
            t += ft(unescapeCode(nextChar()));
        } else {
            if (tt >= st) {
                throw unterminatedTemplateLiteral();
            }
            t += ft(at);
        }
    }
    nextChar();
    ot = t;
    if (e) {
        return 2163760;
    }
    return 2163761;
}

const scanTemplateTail = () => {
    if (tt >= st) {
        throw unterminatedTemplateLiteral();
    }
    tt--;
    return scanTemplate();
};

const consumeOpt = e => {
    if (it === e) {
        nextToken();
        return true;
    }
    return false;
};

const consume = e => {
    if (it === e) {
        nextToken();
    } else {
        throw missingExpectedToken();
    }
};

const invalidStartOfExpression = () => createMappedError(151, et);

const invalidSpreadOp = () => createMappedError(152, et);

const expectedIdentifier = () => createMappedError(153, et);

const invalidMemberExpression = () => createMappedError(154, et);

const unexpectedEndOfExpression = () => createMappedError(155, et);

const unconsumedToken = () => createMappedError(156, $tokenRaw(), tt, et);

const invalidEmptyExpression = () => createMappedError(157);

const lhsNotAssignable = () => createMappedError(158, et);

const expectedValueConverterIdentifier = () => createMappedError(159, et);

const expectedBindingBehaviorIdentifier = () => createMappedError(160, et);

const unexpectedOfKeyword = () => createMappedError(161, et);

const unexpectedImportKeyword = () => createMappedError(162, et);

const invalidLHSBindingIdentifierInForOf = e => createMappedError(163, et, e);

const invalidPropDefInObjLiteral = () => createMappedError(164, et);

const unterminatedStringLiteral = () => createMappedError(165, et);

const unterminatedTemplateLiteral = () => createMappedError(166, et);

const missingExpectedToken = e => createMappedError(167, et);

const unexpectedCharacter = () => {
    throw createMappedError(168, et);
};

unexpectedCharacter.notMapped = true;

const unexpectedTokenInDestructuring = () => createMappedError(170, et);

const unexpectedTokenInOptionalChain = () => createMappedError(171, et);

const invalidTaggedTemplateOnOptionalChain = () => createMappedError(172, et);

const invalidArrowParameterList = () => createMappedError(173, et);

const defaultParamsInArrowFn = () => createMappedError(174, et);

const destructuringParamsInArrowFn = () => createMappedError(175, et);

const restParamsMustBeLastParam = () => createMappedError(176, et);

const functionBodyInArrowFn = () => createMappedError(178, et);

const unexpectedDoubleDot = () => createMappedError(179, et);

const wt = [ Ne, Ve, Ue, He, "this", "$this", null, "$parent", "(", "{", ".", "..", "...", "?.", "}", ")", ",", "[", "]", ":", ";", "?", "'", '"', "&", "|", "??", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 2163760, 2163761, "of", "=>" ];

const bt = f(Object.create(null), {
    true: 8193,
    null: 8194,
    false: 8192,
    undefined: 8195,
    this: 12293,
    $this: 12292,
    $parent: 12295,
    in: 6562213,
    instanceof: 6562214,
    typeof: 139305,
    void: 139306,
    of: 4204594
});

const vt = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

const decompress = (e, t, r, n) => {
    const i = r.length;
    for (let o = 0; o < i; o += 2) {
        const i = r[o];
        let a = r[o + 1];
        a = a > 0 ? a : i + 1;
        if (e) {
            e.fill(n, i, a);
        }
        if (t) {
            for (let e = i; e < a; e++) {
                t.add(e);
            }
        }
    }
};

const returnToken = e => () => {
    nextChar();
    return e;
};

const gt = new Set;

decompress(null, gt, vt.AsciiIdPart, true);

const xt = new Uint8Array(65535);

decompress(xt, null, vt.IdStart, 1);

decompress(xt, null, vt.Digit, 1);

const Et = new Array(65535);

Et.fill(unexpectedCharacter, 0, 65535);

decompress(Et, null, vt.Skip, (() => {
    nextChar();
    return null;
}));

decompress(Et, null, vt.IdStart, scanIdentifier);

decompress(Et, null, vt.Digit, (() => scanNumber(false)));

Et[34] = Et[39] = () => scanString();

Et[96] = () => scanTemplate();

Et[33] = () => {
    if (nextChar() !== 61) {
        return 131119;
    }
    if (nextChar() !== 61) {
        return 6553950;
    }
    nextChar();
    return 6553952;
};

Et[61] = () => {
    if (nextChar() === 62) {
        nextChar();
        return 51;
    }
    if (at !== 61) {
        return 4194350;
    }
    if (nextChar() !== 61) {
        return 6553949;
    }
    nextChar();
    return 6553951;
};

Et[38] = () => {
    if (nextChar() !== 38) {
        return 6291480;
    }
    nextChar();
    return 6553884;
};

Et[124] = () => {
    if (nextChar() !== 124) {
        return 6291481;
    }
    nextChar();
    return 6553819;
};

Et[63] = () => {
    if (nextChar() === 46) {
        const e = $charCodeAt(tt + 1);
        if (e <= 48 || e >= 57) {
            nextChar();
            return 2162701;
        }
        return 6291479;
    }
    if (at !== 63) {
        return 6291479;
    }
    nextChar();
    return 6553754;
};

Et[46] = () => {
    if (nextChar() <= 57 && at >= 48) {
        return scanNumber(true);
    }
    if (at === 46) {
        if (nextChar() !== 46) {
            return 11;
        }
        nextChar();
        return 12;
    }
    return 65546;
};

Et[60] = () => {
    if (nextChar() !== 61) {
        return 6554017;
    }
    nextChar();
    return 6554019;
};

Et[62] = () => {
    if (nextChar() !== 61) {
        return 6554018;
    }
    nextChar();
    return 6554020;
};

Et[37] = returnToken(6554156);

Et[40] = returnToken(2688008);

Et[41] = returnToken(7340047);

Et[42] = returnToken(6554155);

Et[43] = returnToken(2490855);

Et[44] = returnToken(6291472);

Et[45] = returnToken(2490856);

Et[47] = returnToken(6554157);

Et[58] = returnToken(6291477);

Et[59] = returnToken(6291478);

Et[91] = returnToken(2688019);

Et[93] = returnToken(7340052);

Et[123] = returnToken(524297);

Et[125] = returnToken(7340046);

let yt = null;

const At = [];

let Ct = false;

function pauseConnecting() {
    Ct = false;
}

function resumeConnecting() {
    Ct = true;
}

function currentConnectable() {
    return yt;
}

function enterConnectable(e) {
    if (e == null) {
        throw createMappedError(206);
    }
    if (yt == null) {
        yt = e;
        At[0] = yt;
        Ct = true;
        return;
    }
    if (yt === e) {
        throw createMappedError(207);
    }
    At.push(e);
    yt = e;
    Ct = true;
}

function exitConnectable(e) {
    if (e == null) {
        throw createMappedError(208);
    }
    if (yt !== e) {
        throw createMappedError(209);
    }
    At.pop();
    yt = At.length > 0 ? At[At.length - 1] : null;
    Ct = yt != null;
}

const mt = /*@__PURE__*/ p({
    get current() {
        return yt;
    },
    get connecting() {
        return Ct;
    },
    enter: enterConnectable,
    exit: exitConnectable,
    pause: pauseConnecting,
    resume: resumeConnecting
});

const kt = Reflect.get;

const Ot = Object.prototype.toString;

const St = new WeakMap;

const Tt = "__au_nw__";

const Pt = "__au_nw";

function canWrap(e) {
    switch (Ot.call(e)) {
      case "[object Object]":
        return e.constructor[Tt] !== true;

      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const It = "__raw__";

function wrap(e) {
    return canWrap(e) ? getProxy(e) : e;
}

function getProxy(e) {
    return St.get(e) ?? createProxy(e);
}

function getRaw(e) {
    return e[It] ?? e;
}

function unwrap(e) {
    return canWrap(e) && e[It] || e;
}

function doNotCollect(e, t) {
    return t === "constructor" || t === "__proto__" || t === "$observers" || t === Symbol.toPrimitive || t === Symbol.toStringTag || e.constructor[`${Pt}_${d(t)}__`] === true;
}

function createProxy(e) {
    const t = isArray(e) ? Mt : isMap(e) || isSet(e) ? Rt : Lt;
    const r = new Proxy(e, t);
    St.set(e, r);
    St.set(r, r);
    return r;
}

const Lt = {
    get(e, t, r) {
        if (t === It) {
            return e;
        }
        const n = currentConnectable();
        if (!Ct || doNotCollect(e, t) || n == null) {
            return kt(e, t, r);
        }
        n.observe(e, t);
        return wrap(kt(e, t, r));
    }
};

const Mt = {
    get(e, t, r) {
        if (t === It) {
            return e;
        }
        if (!Ct || doNotCollect(e, t) || yt == null) {
            return kt(e, t, r);
        }
        switch (t) {
          case "length":
            yt.observe(e, "length");
            return e.length;

          case "map":
            return wrappedArrayMap;

          case "includes":
            return wrappedArrayIncludes;

          case "indexOf":
            return wrappedArrayIndexOf;

          case "lastIndexOf":
            return wrappedArrayLastIndexOf;

          case "every":
            return wrappedArrayEvery;

          case "filter":
            return wrappedArrayFilter;

          case "find":
            return wrappedArrayFind;

          case "findIndex":
            return wrappedArrayFindIndex;

          case "flat":
            return wrappedArrayFlat;

          case "flatMap":
            return wrappedArrayFlatMap;

          case "join":
            return wrappedArrayJoin;

          case "push":
            return wrappedArrayPush;

          case "pop":
            return wrappedArrayPop;

          case "reduce":
            return wrappedReduce;

          case "reduceRight":
            return wrappedReduceRight;

          case "reverse":
            return wrappedArrayReverse;

          case "shift":
            return wrappedArrayShift;

          case "unshift":
            return wrappedArrayUnshift;

          case "slice":
            return wrappedArraySlice;

          case "splice":
            return wrappedArraySplice;

          case "some":
            return wrappedArraySome;

          case "sort":
            return wrappedArraySort;

          case "keys":
            return wrappedKeys;

          case "values":
          case Symbol.iterator:
            return wrappedValues;

          case "entries":
            return wrappedEntries;
        }
        yt.observe(e, t);
        return wrap(kt(e, t, r));
    },
    ownKeys(e) {
        currentConnectable()?.observe(e, "length");
        return Reflect.ownKeys(e);
    }
};

function wrappedArrayMap(e, t) {
    const r = getRaw(this);
    const n = r.map(((r, n) => unwrap(e.call(t, wrap(r), n, this))));
    observeCollection(yt, r);
    return wrap(n);
}

function wrappedArrayEvery(e, t) {
    const r = getRaw(this);
    const n = r.every(((r, n) => e.call(t, wrap(r), n, this)));
    observeCollection(yt, r);
    return n;
}

function wrappedArrayFilter(e, t) {
    const r = getRaw(this);
    const n = r.filter(((r, n) => unwrap(e.call(t, wrap(r), n, this))));
    observeCollection(yt, r);
    return wrap(n);
}

function wrappedArrayIncludes(e) {
    const t = getRaw(this);
    const r = t.includes(unwrap(e));
    observeCollection(yt, t);
    return r;
}

function wrappedArrayIndexOf(e) {
    const t = getRaw(this);
    const r = t.indexOf(unwrap(e));
    observeCollection(yt, t);
    return r;
}

function wrappedArrayLastIndexOf(e) {
    const t = getRaw(this);
    const r = t.lastIndexOf(unwrap(e));
    observeCollection(yt, t);
    return r;
}

function wrappedArrayFindIndex(e, t) {
    const r = getRaw(this);
    const n = r.findIndex(((r, n) => unwrap(e.call(t, wrap(r), n, this))));
    observeCollection(yt, r);
    return n;
}

function wrappedArrayFind(e, t) {
    const r = getRaw(this);
    const n = r.find(((t, r) => e(wrap(t), r, this)), t);
    observeCollection(yt, r);
    return wrap(n);
}

function wrappedArrayFlat() {
    const e = getRaw(this);
    observeCollection(yt, e);
    return wrap(e.flat());
}

function wrappedArrayFlatMap(e, t) {
    const r = getRaw(this);
    observeCollection(yt, r);
    return getProxy(r.flatMap(((r, n) => wrap(e.call(t, wrap(r), n, this)))));
}

function wrappedArrayJoin(e) {
    const t = getRaw(this);
    observeCollection(yt, t);
    return t.join(e);
}

function wrappedArrayPop() {
    return wrap(getRaw(this).pop());
}

function wrappedArrayPush(...e) {
    return getRaw(this).push(...e);
}

function wrappedArrayShift() {
    return wrap(getRaw(this).shift());
}

function wrappedArrayUnshift(...e) {
    return getRaw(this).unshift(...e);
}

function wrappedArraySplice(...e) {
    return wrap(getRaw(this).splice(...e));
}

function wrappedArrayReverse(...e) {
    const t = getRaw(this);
    const r = t.reverse();
    observeCollection(yt, t);
    return wrap(r);
}

function wrappedArraySome(e, t) {
    const r = getRaw(this);
    const n = r.some(((r, n) => unwrap(e.call(t, wrap(r), n, this))));
    observeCollection(yt, r);
    return n;
}

function wrappedArraySort(e) {
    const t = getRaw(this);
    const r = t.sort(e);
    observeCollection(yt, t);
    return wrap(r);
}

function wrappedArraySlice(e, t) {
    const r = getRaw(this);
    observeCollection(yt, r);
    return getProxy(r.slice(e, t));
}

function wrappedReduce(e, t) {
    const r = getRaw(this);
    const n = r.reduce(((t, r, n) => e(t, wrap(r), n, this)), t);
    observeCollection(yt, r);
    return wrap(n);
}

function wrappedReduceRight(e, t) {
    const r = getRaw(this);
    const n = r.reduceRight(((t, r, n) => e(t, wrap(r), n, this)), t);
    observeCollection(yt, r);
    return wrap(n);
}

const Rt = {
    get(e, t, r) {
        if (t === It) {
            return e;
        }
        const n = currentConnectable();
        if (!Ct || doNotCollect(e, t) || n == null) {
            return kt(e, t, r);
        }
        switch (t) {
          case "size":
            n.observe(e, "size");
            return e.size;

          case "clear":
            return wrappedClear;

          case "delete":
            return wrappedDelete;

          case "forEach":
            return wrappedForEach;

          case "add":
            if (isSet(e)) {
                return wrappedAdd;
            }
            break;

          case "get":
            if (isMap(e)) {
                return wrappedGet;
            }
            break;

          case "set":
            if (isMap(e)) {
                return wrappedSet;
            }
            break;

          case "has":
            return wrappedHas;

          case "keys":
            return wrappedKeys;

          case "values":
            return wrappedValues;

          case "entries":
            return wrappedEntries;

          case Symbol.iterator:
            return isMap(e) ? wrappedEntries : wrappedValues;
        }
        return wrap(kt(e, t, r));
    }
};

function wrappedForEach(e, t) {
    const r = getRaw(this);
    observeCollection(yt, r);
    return r.forEach(((r, n) => {
        e.call(t, wrap(r), wrap(n), this);
    }));
}

function wrappedHas(e) {
    const t = getRaw(this);
    observeCollection(yt, t);
    return t.has(unwrap(e));
}

function wrappedGet(e) {
    const t = getRaw(this);
    observeCollection(yt, t);
    return wrap(t.get(unwrap(e)));
}

function wrappedSet(e, t) {
    return wrap(getRaw(this).set(unwrap(e), unwrap(t)));
}

function wrappedAdd(e) {
    return wrap(getRaw(this).add(unwrap(e)));
}

function wrappedClear() {
    return wrap(getRaw(this).clear());
}

function wrappedDelete(e) {
    return wrap(getRaw(this).delete(unwrap(e)));
}

function wrappedKeys() {
    const e = getRaw(this);
    observeCollection(yt, e);
    const t = e.keys();
    return {
        next() {
            const e = t.next();
            const r = e.value;
            const n = e.done;
            return n ? {
                value: void 0,
                done: n
            } : {
                value: wrap(r),
                done: n
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function wrappedValues() {
    const e = getRaw(this);
    observeCollection(yt, e);
    const t = e.values();
    return {
        next() {
            const e = t.next();
            const r = e.value;
            const n = e.done;
            return n ? {
                value: void 0,
                done: n
            } : {
                value: wrap(r),
                done: n
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function wrappedEntries() {
    const e = getRaw(this);
    observeCollection(yt, e);
    const t = e.entries();
    return {
        next() {
            const e = t.next();
            const r = e.value;
            const n = e.done;
            return n ? {
                value: void 0,
                done: n
            } : {
                value: [ wrap(r[0]), wrap(r[1]) ],
                done: n
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const observeCollection = (e, t) => e?.observeCollection(t);

const _t = /*@__PURE__*/ p({
    getProxy: getProxy,
    getRaw: getRaw,
    wrap: wrap,
    unwrap: unwrap,
    rawKey: It
});

class ComputedObserver {
    constructor(e, t, r, n, i) {
        this.type = ee;
        this.v = void 0;
        this.ir = false;
        this.D = false;
        this.cb = void 0;
        this.A = void 0;
        this.C = void 0;
        this.o = e;
        this.O = i ? wrap(e) : e;
        this.$get = t;
        this.$set = r;
        this.oL = n;
    }
    init(e) {
        this.v = e;
        this.D = false;
    }
    getValue() {
        if (this.subs.count === 0) {
            return this.$get.call(this.o, this.o, this);
        }
        if (this.D) {
            this.compute();
            this.D = false;
        }
        return this.v;
    }
    setValue(e) {
        if (isFunction(this.$set)) {
            if (this.A !== void 0) {
                e = this.A.call(null, e, this.C);
            }
            if (!h(e, this.v)) {
                this.ir = true;
                this.$set.call(this.o, e);
                this.ir = false;
                this.run();
            }
        } else {
            throw createMappedError(221);
        }
    }
    useCoercer(e, t) {
        this.A = e;
        this.C = t;
        return true;
    }
    useCallback(e) {
        this.cb = e;
        return true;
    }
    handleChange() {
        this.D = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    handleCollectionChange() {
        this.D = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    subscribe(e) {
        if (this.subs.add(e) && this.subs.count === 1) {
            this.compute();
            this.D = false;
        }
    }
    unsubscribe(e) {
        if (this.subs.remove(e) && this.subs.count === 0) {
            this.D = true;
            this.obs.clearAll();
        }
    }
    run() {
        if (this.ir) {
            return;
        }
        const e = this.v;
        const t = this.compute();
        this.D = false;
        if (!h(t, e)) {
            this.cb?.(t, e);
            this.subs.notify(this.v, e);
        }
    }
    compute() {
        this.ir = true;
        this.obs.version++;
        try {
            enterConnectable(this);
            return this.v = unwrap(this.$get.call(this.O, this.O, this));
        } finally {
            this.obs.clear();
            this.ir = false;
            exitConnectable(this);
        }
    }
}

connectable(ComputedObserver);

subscriberCollection(ComputedObserver);

const Bt = /*@__PURE__*/ w("IDirtyChecker", void 0);

const $t = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

class DirtyChecker {
    static register(e) {
        e.register(n.singleton(this, this), n.aliasTo(this, Bt));
    }
    constructor() {
        this.tracked = [];
        this.T = null;
        this.P = 0;
        this.p = i(o);
        this.check = () => {
            if ($t.disabled) {
                return;
            }
            if (++this.P < $t.timeoutsPerCheck) {
                return;
            }
            this.P = 0;
            const e = this.tracked;
            const t = e.length;
            let r;
            let n = 0;
            for (;n < t; ++n) {
                r = e[n];
                if (r.isDirty()) {
                    r.flush();
                }
            }
        };
        subscriberCollection(DirtyCheckProperty);
    }
    createProperty(e, t) {
        if ($t.throw) {
            throw createError(`AUR0222:${d(t)}`);
        }
        return new DirtyCheckProperty(this, e, t);
    }
    addProperty(e) {
        this.tracked.push(e);
        if (this.tracked.length === 1) {
            this.T = this.p.taskQueue.queueTask(this.check, {
                persistent: true
            });
        }
    }
    removeProperty(e) {
        this.tracked.splice(this.tracked.indexOf(e), 1);
        if (this.tracked.length === 0) {
            this.T.cancel();
            this.T = null;
        }
    }
}

class DirtyCheckProperty {
    constructor(e, t, r) {
        this.obj = t;
        this.key = r;
        this.type = Z;
        this.ov = void 0;
        this.I = e;
    }
    getValue() {
        return this.obj[this.key];
    }
    setValue(e) {
        throw createError(`Trying to set value for property ${d(this.key)} in dirty checker`);
    }
    isDirty() {
        return this.ov !== this.obj[this.key];
    }
    flush() {
        const e = this.ov;
        const t = this.getValue();
        this.ov = t;
        this.subs.notify(t, e);
    }
    subscribe(e) {
        if (this.subs.add(e) && this.subs.count === 1) {
            this.ov = this.obj[this.key];
            this.I.addProperty(this);
        }
    }
    unsubscribe(e) {
        if (this.subs.remove(e) && this.subs.count === 0) {
            this.I.removeProperty(this);
        }
    }
}

class PrimitiveObserver {
    get doNotCache() {
        return true;
    }
    constructor(e, t) {
        this.type = Z;
        this.o = e;
        this.k = t;
    }
    getValue() {
        return this.o[this.k];
    }
    setValue() {}
    subscribe() {}
    unsubscribe() {}
}

class PropertyAccessor {
    constructor() {
        this.type = Z;
    }
    getValue(e, t) {
        return e[t];
    }
    setValue(e, t, r) {
        t[r] = e;
    }
}

class SetterObserver {
    constructor(e, t) {
        this.type = ee;
        this.v = void 0;
        this.iO = false;
        this.cb = void 0;
        this.A = void 0;
        this.C = void 0;
        this.o = e;
        this.k = t;
    }
    getValue() {
        return this.v;
    }
    setValue(e) {
        if (this.A !== void 0) {
            e = this.A.call(void 0, e, this.C);
        }
        if (this.iO) {
            if (h(e, this.v)) {
                return;
            }
            Dt = this.v;
            this.v = e;
            this.cb?.(e, Dt);
            this.subs.notify(e, Dt);
        } else {
            this.v = this.o[this.k] = e;
            this.cb?.(e, Dt);
        }
    }
    useCallback(e) {
        this.cb = e;
        this.start();
        return true;
    }
    useCoercer(e, t) {
        this.A = e;
        this.C = t;
        this.start();
        return true;
    }
    subscribe(e) {
        if (this.iO === false) {
            this.start();
        }
        this.subs.add(e);
    }
    start() {
        if (this.iO === false) {
            this.iO = true;
            this.v = this.o[this.k];
            l(this.o, this.k, {
                enumerable: true,
                configurable: true,
                get: f((() => this.getValue()), {
                    getObserver: () => this
                }),
                set: e => {
                    this.setValue(e);
                }
            });
        }
        return this;
    }
    stop() {
        if (this.iO) {
            l(this.o, this.k, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: this.v
            });
            this.iO = false;
        }
        return this;
    }
}

subscriberCollection(SetterObserver);

let Dt = void 0;

const Ft = new PropertyAccessor;

const jt = /*@__PURE__*/ w("IObserverLocator", (e => e.singleton(ObserverLocator)));

const Nt = /*@__PURE__*/ w("INodeObserverLocator", (e => e.cachedCallback((e => new DefaultNodeObserverLocator))));

class DefaultNodeObserverLocator {
    handles() {
        return false;
    }
    getObserver() {
        return Ft;
    }
    getAccessor() {
        return Ft;
    }
}

class ObserverLocator {
    constructor() {
        this.L = [];
        this.I = i(Bt);
        this.M = i(Nt);
    }
    addAdapter(e) {
        this.L.push(e);
    }
    getObserver(e, t) {
        if (e == null) {
            throw createMappedError(199, t);
        }
        if (!isObject(e)) {
            return new PrimitiveObserver(e, isFunction(t) ? "" : t);
        }
        if (isFunction(t)) {
            return new ComputedObserver(e, t, void 0, this, true);
        }
        const r = getObserverLookup(e);
        let n = r[t];
        if (n === void 0) {
            n = this.createObserver(e, t);
            if (!n.doNotCache) {
                r[t] = n;
            }
        }
        return n;
    }
    getAccessor(e, t) {
        const r = e.$observers?.[t];
        if (r !== void 0) {
            return r;
        }
        if (this.M.handles(e, t, this)) {
            return this.M.getAccessor(e, t, this);
        }
        return Ft;
    }
    getArrayObserver(e) {
        return getArrayObserver(e);
    }
    getMapObserver(e) {
        return getMapObserver(e);
    }
    getSetObserver(e) {
        return getSetObserver(e);
    }
    createObserver(e, t) {
        if (this.M.handles(e, t, this)) {
            return this.M.getObserver(e, t, this);
        }
        switch (t) {
          case "length":
            if (isArray(e)) {
                return getArrayObserver(e).getLengthObserver();
            }
            break;

          case "size":
            if (isMap(e)) {
                return getMapObserver(e).getLengthObserver();
            } else if (isSet(e)) {
                return getSetObserver(e).getLengthObserver();
            }
            break;

          default:
            if (isArray(e) && r(t)) {
                return getArrayObserver(e).getIndexObserver(Number(t));
            }
            break;
        }
        let n = Ut(e, t);
        if (n === void 0) {
            let r = Vt(e);
            while (r !== null) {
                n = Ut(r, t);
                if (n === void 0) {
                    r = Vt(r);
                } else {
                    break;
                }
            }
        }
        if (n !== void 0 && !u.call(n, "value")) {
            let r = this.R(e, t, n);
            if (r == null) {
                r = (n.get?.getObserver ?? n.set?.getObserver)?.(e, this);
            }
            return r == null ? n.configurable ? this._(e, t, n, true) : this.I.createProperty(e, t) : r;
        }
        return new SetterObserver(e, t);
    }
    _(e, t, r, n) {
        const i = new ComputedObserver(e, r.get, r.set, this, !!n);
        l(e, t, {
            enumerable: r.enumerable,
            configurable: true,
            get: f((() => i.getValue()), {
                getObserver: () => i
            }),
            set: e => {
                i.setValue(e);
            }
        });
        return i;
    }
    R(e, t, r) {
        if (this.L.length > 0) {
            for (const n of this.L) {
                const i = n.getObserver(e, t, r, this);
                if (i != null) {
                    return i;
                }
            }
        }
        return null;
    }
}

const getCollectionObserver = e => {
    let t;
    if (isArray(e)) {
        t = getArrayObserver(e);
    } else if (isMap(e)) {
        t = getMapObserver(e);
    } else if (isSet(e)) {
        t = getSetObserver(e);
    }
    return t;
};

const Vt = Object.getPrototypeOf;

const Ut = Object.getOwnPropertyDescriptor;

const getObserverLookup = e => {
    let t = e.$observers;
    if (t === void 0) {
        l(e, "$observers", {
            enumerable: false,
            value: t = createLookup()
        });
    }
    return t;
};

const Ht = /*@__PURE__*/ w("IObservation", (e => e.singleton(Observation)));

class Observation {
    static get inject() {
        return [ jt ];
    }
    constructor(e) {
        this.oL = e;
        this.B = {
            immediate: true
        };
    }
    run(e) {
        const t = new RunEffect(this.oL, e);
        t.run();
        return t;
    }
    watch(e, t, r, n = this.B) {
        let i = undefined;
        let o = false;
        const a = this.oL.getObserver(e, t);
        const c = {
            handleChange: (e, t) => r(e, i = t)
        };
        const run = () => {
            if (o) return;
            r(a.getValue(), i);
        };
        const stop = () => {
            o = true;
            a.unsubscribe(c);
        };
        a.subscribe(c);
        if (n.immediate) {
            run();
        }
        return {
            run: run,
            stop: stop
        };
    }
}

class RunEffect {
    constructor(e, t) {
        this.oL = e;
        this.fn = t;
        this.maxRunCount = 10;
        this.queued = false;
        this.running = false;
        this.runCount = 0;
        this.stopped = false;
    }
    handleChange() {
        this.queued = true;
        this.run();
    }
    handleCollectionChange() {
        this.queued = true;
        this.run();
    }
    run() {
        if (this.stopped) {
            throw createMappedError(225);
        }
        if (this.running) {
            return;
        }
        ++this.runCount;
        this.running = true;
        this.queued = false;
        ++this.obs.version;
        try {
            enterConnectable(this);
            this.fn(this);
        } finally {
            this.obs.clear();
            this.running = false;
            exitConnectable(this);
        }
        if (this.queued) {
            if (this.runCount > this.maxRunCount) {
                this.runCount = 0;
                throw createMappedError(226);
            }
            this.run();
        } else {
            this.runCount = 0;
        }
    }
    stop() {
        this.stopped = true;
        this.obs.clearAll();
    }
}

connectable(RunEffect);

function getObserversLookup(e) {
    if (e.$observers === void 0) {
        l(e, "$observers", {
            value: {}
        });
    }
    return e.$observers;
}

const Kt = {};

function observable(e, t, r) {
    if (!SetterNotifier.mixed) {
        SetterNotifier.mixed = true;
        subscriberCollection(SetterNotifier);
    }
    if (t == null) {
        return (t, r, n) => deco(t, r, n, e);
    }
    return deco(e, t, r);
    function deco(e, t, r, n) {
        const i = t === void 0;
        n = typeof n !== "object" ? {
            name: n
        } : n || {};
        if (i) {
            t = n.name;
        }
        if (t == null || t === "") {
            throw createMappedError(224);
        }
        const o = n.callback || `${d(t)}Changed`;
        let a = Kt;
        if (r) {
            delete r.value;
            delete r.writable;
            a = r.initializer?.();
            delete r.initializer;
        } else {
            r = {
                configurable: true
            };
        }
        if (!("enumerable" in r)) {
            r.enumerable = true;
        }
        const c = n.set;
        r.get = function g() {
            const e = getNotifier(this, t, o, a, c);
            currentConnectable()?.subscribeTo(e);
            return e.getValue();
        };
        r.set = function s(e) {
            getNotifier(this, t, o, a, c).setValue(e);
        };
        r.get.getObserver = function gO(e) {
            return getNotifier(e, t, o, a, c);
        };
        if (i) {
            l(e.prototype, t, r);
        } else {
            return r;
        }
    }
}

function getNotifier(e, t, r, n, i) {
    const o = getObserversLookup(e);
    let a = o[t];
    if (a == null) {
        a = new SetterNotifier(e, r, i, n === Kt ? void 0 : n);
        o[t] = a;
    }
    return a;
}

class SetterNotifier {
    constructor(e, t, r, n) {
        this.type = ee;
        this.v = void 0;
        this.ov = void 0;
        this.o = e;
        this.S = r;
        this.hs = isFunction(r);
        const i = e[t];
        this.cb = isFunction(i) ? i : void 0;
        this.v = n;
    }
    getValue() {
        return this.v;
    }
    setValue(e) {
        if (this.hs) {
            e = this.S(e);
        }
        if (!h(e, this.v)) {
            this.ov = this.v;
            this.v = e;
            this.cb?.call(this.o, this.v, this.ov);
            e = this.ov;
            this.ov = this.v;
            this.subs.notify(this.v, e);
        }
    }
}

SetterNotifier.mixed = false;

function nowrap(e, t) {
    if (e == null) {
        return (e, t) => deco(e, t);
    } else {
        return deco(e, t);
    }
    function deco(e, t) {
        const r = !t;
        if (r) {
            defineHiddenProp(e, Tt, true);
        } else {
            defineHiddenProp(e.constructor, `${Pt}_${d(t)}__`, true);
        }
    }
}

const zt = w("ISignaler", (e => e.singleton(Signaler)));

class Signaler {
    constructor() {
        this.signals = createLookup();
    }
    dispatchSignal(e) {
        const t = this.signals[e];
        if (t === undefined) {
            return;
        }
        let r;
        for (r of t.keys()) {
            r.handleChange(undefined, undefined);
        }
    }
    addSignalListener(e, t) {
        (this.signals[e] ??= new Set).add(t);
    }
    removeSignalListener(e, t) {
        this.signals[e]?.delete(t);
    }
}

export { AccessBoundaryExpression, AccessGlobalExpression, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, re as AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, ArrowFunction, AssignExpression, BinaryExpression, BindingBehaviorExpression, BindingContext, BindingIdentifier, BindingObserverRecord, CallFunctionExpression, CallMemberExpression, CallScopeExpression, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, mt as ConnectableSwitcher, CustomExpression, DestructuringAssignmentExpression, DestructuringAssignmentRestExpression, DestructuringAssignmentSingleExpression, DirtyCheckProperty, $t as DirtyCheckSettings, DirtyChecker, ForOfStatement, Y as ICoercionConfiguration, Bt as IDirtyChecker, je as IExpressionParser, Nt as INodeObserverLocator, Ht as IObservation, jt as IObserverLocator, zt as ISignaler, Interpolation, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, Observation, ObserverLocator, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, _t as ProxyObservable, Scope, SetObserver, SetterObserver, SubscriberRecord, TaggedTemplateExpression, TemplateExpression, UnaryExpression, Unparser, ValueConverterExpression, astAssign, astBind, astEvaluate, astUnbind, astVisit, batch, cloneIndexMap, connectable, copyIndexMap, createIndexMap, disableArrayObservation, disableMapObservation, disableSetObservation, enableArrayObservation, enableMapObservation, enableSetObservation, getCollectionObserver, getObserverLookup, isIndexMap, nowrap, observable, parseExpression, subscriberCollection };
//# sourceMappingURL=index.mjs.map
