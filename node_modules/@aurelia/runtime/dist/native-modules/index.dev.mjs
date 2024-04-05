import { DI, emptyArray, isArrayIndex, Registration, resolve, IPlatform, ILogger } from '../../../kernel/dist/native-modules/index.mjs';
import { Metadata } from '../../../metadata/dist/native-modules/index.mjs';

const O = Object;
/**
 * A shortcut to Object.prototype.hasOwnProperty
 * Needs to do explicit .call
 *
 * @internal
 */
const hasOwnProp = O.prototype.hasOwnProperty;
/**
 * Reflect does not throw on invalid property def
 *
 * @internal
 */
const def = Reflect.defineProperty;
/** @internal */
const createError = (message) => new Error(message);
/** @internal */
// eslint-disable-next-line @typescript-eslint/ban-types
const isFunction = (v) => typeof v === 'function';
/** @internal */
const isString = (v) => typeof v === 'string';
/** @internal */
const isObject = (v) => v instanceof O;
/** @internal */
const isArray = (v) => v instanceof Array;
/** @internal */
const isSet = (v) => v instanceof Set;
/** @internal */
const isMap = (v) => v instanceof Map;
/** @internal */
const areEqual = O.is;
/** @internal */
function defineHiddenProp(obj, key, value) {
    def(obj, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value
    });
    return value;
}
/** @internal */
function ensureProto(proto, key, defaultValue) {
    if (!(key in proto)) {
        defineHiddenProp(proto, key, defaultValue);
    }
}
/** @internal */ const objectAssign = Object.assign;
/** @internal */ const objectFreeze = Object.freeze;
// this is used inside template literal, since TS errs without String(...value)
/** @internal */ const safeString = String;
/** @internal */ const createInterface = DI.createInterface;
/** @internal */ const createLookup = () => O.create(null);
/** @internal */ const getOwnMetadata = Metadata.getOwn;
/** @internal */ Metadata.hasOwn;
/** @internal */ const defineMetadata = Metadata.define;

const astVisit = (ast, visitor) => {
    switch (ast.$kind) {
        case ekAccessKeyed: return visitor.visitAccessKeyed(ast);
        case ekAccessMember: return visitor.visitAccessMember(ast);
        case ekAccessScope: return visitor.visitAccessScope(ast);
        case ekAccessThis: return visitor.visitAccessThis(ast);
        case ekAccessBoundary: return visitor.visitAccessBoundary(ast);
        case ekArrayBindingPattern: return visitor.visitArrayBindingPattern(ast);
        case ekArrayDestructuring: return visitor.visitDestructuringAssignmentExpression(ast);
        case ekArrayLiteral: return visitor.visitArrayLiteral(ast);
        case ekArrowFunction: return visitor.visitArrowFunction(ast);
        case ekAssign: return visitor.visitAssign(ast);
        case ekBinary: return visitor.visitBinary(ast);
        case ekBindingBehavior: return visitor.visitBindingBehavior(ast);
        case ekBindingIdentifier: return visitor.visitBindingIdentifier(ast);
        case ekCallFunction: return visitor.visitCallFunction(ast);
        case ekCallMember: return visitor.visitCallMember(ast);
        case ekCallScope: return visitor.visitCallScope(ast);
        case ekConditional: return visitor.visitConditional(ast);
        case ekDestructuringAssignmentLeaf: return visitor.visitDestructuringAssignmentSingleExpression(ast);
        case ekForOfStatement: return visitor.visitForOfStatement(ast);
        case ekInterpolation: return visitor.visitInterpolation(ast);
        case ekObjectBindingPattern: return visitor.visitObjectBindingPattern(ast);
        case ekObjectDestructuring: return visitor.visitDestructuringAssignmentExpression(ast);
        case ekObjectLiteral: return visitor.visitObjectLiteral(ast);
        case ekPrimitiveLiteral: return visitor.visitPrimitiveLiteral(ast);
        case ekTaggedTemplate: return visitor.visitTaggedTemplate(ast);
        case ekTemplate: return visitor.visitTemplate(ast);
        case ekUnary: return visitor.visitUnary(ast);
        case ekValueConverter: return visitor.visitValueConverter(ast);
        case ekCustom: return visitor.visitCustom(ast);
        default: {
            throw createError(`Unknown ast node ${JSON.stringify(ast)}`);
        }
    }
};
class Unparser {
    constructor() {
        this.text = '';
    }
    static unparse(expr) {
        const visitor = new Unparser();
        astVisit(expr, visitor);
        return visitor.text;
    }
    visitAccessMember(expr) {
        astVisit(expr.object, this);
        this.text += `${expr.optional ? '?' : ''}.${expr.name}`;
    }
    visitAccessKeyed(expr) {
        astVisit(expr.object, this);
        this.text += `${expr.optional ? '?.' : ''}[`;
        astVisit(expr.key, this);
        this.text += ']';
    }
    visitAccessThis(expr) {
        if (expr.ancestor === 0) {
            this.text += '$this';
            return;
        }
        this.text += '$parent';
        let i = expr.ancestor - 1;
        while (i--) {
            this.text += '.$parent';
        }
    }
    visitAccessBoundary(_expr) {
        this.text += 'this';
    }
    visitAccessScope(expr) {
        let i = expr.ancestor;
        while (i--) {
            this.text += '$parent.';
        }
        this.text += expr.name;
    }
    visitArrayLiteral(expr) {
        const elements = expr.elements;
        this.text += '[';
        for (let i = 0, length = elements.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            astVisit(elements[i], this);
        }
        this.text += ']';
    }
    visitArrowFunction(expr) {
        const args = expr.args;
        const ii = args.length;
        let i = 0;
        let text = '(';
        let name;
        for (; i < ii; ++i) {
            name = args[i].name;
            if (i > 0) {
                text += ', ';
            }
            if (i < ii - 1) {
                text += name;
            }
            else {
                text += expr.rest ? `...${name}` : name;
            }
        }
        this.text += `${text}) => `;
        astVisit(expr.body, this);
    }
    visitObjectLiteral(expr) {
        const keys = expr.keys;
        const values = expr.values;
        this.text += '{';
        for (let i = 0, length = keys.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            this.text += `'${keys[i]}':`;
            astVisit(values[i], this);
        }
        this.text += '}';
    }
    visitPrimitiveLiteral(expr) {
        this.text += '(';
        if (isString(expr.value)) {
            const escaped = expr.value.replace(/'/g, '\\\'');
            this.text += `'${escaped}'`;
        }
        else {
            this.text += `${expr.value}`;
        }
        this.text += ')';
    }
    visitCallFunction(expr) {
        this.text += '(';
        astVisit(expr.func, this);
        this.text += expr.optional ? '?.' : '';
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitCallMember(expr) {
        this.text += '(';
        astVisit(expr.object, this);
        this.text += `${expr.optionalMember ? '?.' : ''}.${expr.name}${expr.optionalCall ? '?.' : ''}`;
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitCallScope(expr) {
        this.text += '(';
        let i = expr.ancestor;
        while (i--) {
            this.text += '$parent.';
        }
        this.text += `${expr.name}${expr.optional ? '?.' : ''}`;
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitTemplate(expr) {
        const { cooked, expressions } = expr;
        const length = expressions.length;
        this.text += '`';
        this.text += cooked[0];
        for (let i = 0; i < length; i++) {
            astVisit(expressions[i], this);
            this.text += cooked[i + 1];
        }
        this.text += '`';
    }
    visitTaggedTemplate(expr) {
        const { cooked, expressions } = expr;
        const length = expressions.length;
        astVisit(expr.func, this);
        this.text += '`';
        this.text += cooked[0];
        for (let i = 0; i < length; i++) {
            astVisit(expressions[i], this);
            this.text += cooked[i + 1];
        }
        this.text += '`';
    }
    visitUnary(expr) {
        this.text += `(${expr.operation}`;
        if (expr.operation.charCodeAt(0) >= /* a */ 97) {
            this.text += ' ';
        }
        astVisit(expr.expression, this);
        this.text += ')';
    }
    visitBinary(expr) {
        this.text += '(';
        astVisit(expr.left, this);
        if (expr.operation.charCodeAt(0) === /* i */ 105) {
            this.text += ` ${expr.operation} `;
        }
        else {
            this.text += expr.operation;
        }
        astVisit(expr.right, this);
        this.text += ')';
    }
    visitConditional(expr) {
        this.text += '(';
        astVisit(expr.condition, this);
        this.text += '?';
        astVisit(expr.yes, this);
        this.text += ':';
        astVisit(expr.no, this);
        this.text += ')';
    }
    visitAssign(expr) {
        this.text += '(';
        astVisit(expr.target, this);
        this.text += '=';
        astVisit(expr.value, this);
        this.text += ')';
    }
    visitValueConverter(expr) {
        const args = expr.args;
        astVisit(expr.expression, this);
        this.text += `|${expr.name}`;
        for (let i = 0, length = args.length; i < length; ++i) {
            this.text += ':';
            astVisit(args[i], this);
        }
    }
    visitBindingBehavior(expr) {
        const args = expr.args;
        astVisit(expr.expression, this);
        this.text += `&${expr.name}`;
        for (let i = 0, length = args.length; i < length; ++i) {
            this.text += ':';
            astVisit(args[i], this);
        }
    }
    visitArrayBindingPattern(expr) {
        const elements = expr.elements;
        this.text += '[';
        for (let i = 0, length = elements.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            astVisit(elements[i], this);
        }
        this.text += ']';
    }
    visitObjectBindingPattern(expr) {
        const keys = expr.keys;
        const values = expr.values;
        this.text += '{';
        for (let i = 0, length = keys.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            this.text += `'${keys[i]}':`;
            astVisit(values[i], this);
        }
        this.text += '}';
    }
    visitBindingIdentifier(expr) {
        this.text += expr.name;
    }
    visitForOfStatement(expr) {
        astVisit(expr.declaration, this);
        this.text += ' of ';
        astVisit(expr.iterable, this);
    }
    visitInterpolation(expr) {
        const { parts, expressions } = expr;
        const length = expressions.length;
        this.text += '${';
        this.text += parts[0];
        for (let i = 0; i < length; i++) {
            astVisit(expressions[i], this);
            this.text += parts[i + 1];
        }
        this.text += '}';
    }
    visitDestructuringAssignmentExpression(expr) {
        const $kind = expr.$kind;
        const isObjDes = $kind === ekObjectDestructuring;
        this.text += isObjDes ? '{' : '[';
        const list = expr.list;
        const len = list.length;
        let i;
        let item;
        for (i = 0; i < len; i++) {
            item = list[i];
            switch (item.$kind) {
                case ekDestructuringAssignmentLeaf:
                    astVisit(item, this);
                    break;
                case ekArrayDestructuring:
                case ekObjectDestructuring: {
                    const source = item.source;
                    if (source) {
                        astVisit(source, this);
                        this.text += ':';
                    }
                    astVisit(item, this);
                    break;
                }
            }
        }
        this.text += isObjDes ? '}' : ']';
    }
    visitDestructuringAssignmentSingleExpression(expr) {
        astVisit(expr.source, this);
        this.text += ':';
        astVisit(expr.target, this);
        const initializer = expr.initializer;
        if (initializer !== void 0) {
            this.text += '=';
            astVisit(initializer, this);
        }
    }
    visitDestructuringAssignmentRestExpression(expr) {
        this.text += '...';
        astVisit(expr.target, this);
    }
    visitCustom(expr) {
        this.text += safeString(expr.value);
    }
    writeArgs(args) {
        this.text += '(';
        for (let i = 0, length = args.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            astVisit(args[i], this);
        }
        this.text += ')';
    }
}

/** @internal */ const ekAccessThis = 'AccessThis';
/** @internal */ const ekAccessBoundary = 'AccessBoundary';
/** @internal */ const ekAccessGlobal = 'AccessGlobal';
/** @internal */ const ekAccessScope = 'AccessScope';
/** @internal */ const ekArrayLiteral = 'ArrayLiteral';
/** @internal */ const ekObjectLiteral = 'ObjectLiteral';
/** @internal */ const ekPrimitiveLiteral = 'PrimitiveLiteral';
/** @internal */ const ekTemplate = 'Template';
/** @internal */ const ekUnary = 'Unary';
/** @internal */ const ekCallScope = 'CallScope';
/** @internal */ const ekCallMember = 'CallMember';
/** @internal */ const ekCallFunction = 'CallFunction';
/** @internal */ const ekCallGlobal = 'CallGlobal';
/** @internal */ const ekAccessMember = 'AccessMember';
/** @internal */ const ekAccessKeyed = 'AccessKeyed';
/** @internal */ const ekTaggedTemplate = 'TaggedTemplate';
/** @internal */ const ekBinary = 'Binary';
/** @internal */ const ekConditional = 'Conditional';
/** @internal */ const ekAssign = 'Assign';
/** @internal */ const ekArrowFunction = 'ArrowFunction';
/** @internal */ const ekValueConverter = 'ValueConverter';
/** @internal */ const ekBindingBehavior = 'BindingBehavior';
/** @internal */ const ekArrayBindingPattern = 'ArrayBindingPattern';
/** @internal */ const ekObjectBindingPattern = 'ObjectBindingPattern';
/** @internal */ const ekBindingIdentifier = 'BindingIdentifier';
/** @internal */ const ekForOfStatement = 'ForOfStatement';
/** @internal */ const ekInterpolation = 'Interpolation';
/** @internal */ const ekArrayDestructuring = 'ArrayDestructuring';
/** @internal */ const ekObjectDestructuring = 'ObjectDestructuring';
/** @internal */ const ekDestructuringAssignmentLeaf = 'DestructuringAssignmentLeaf';
/** @internal */ const ekCustom = 'Custom';
class CustomExpression {
    constructor(value) {
        this.value = value;
        this.$kind = ekCustom;
    }
    evaluate(_s, _e, _c) {
        return this.value;
    }
    assign(s, e, val) {
        return val;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bind(s, b) {
        // empty
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unbind(s, b) {
        // empty
    }
    accept(_visitor) {
        return (void 0);
    }
}
class BindingBehaviorExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.$kind = ekBindingBehavior;
        this.key = `_bb_${name}`;
    }
}
class ValueConverterExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.$kind = ekValueConverter;
    }
}
class AssignExpression {
    constructor(target, value) {
        this.target = target;
        this.value = value;
        this.$kind = ekAssign;
    }
}
class ConditionalExpression {
    constructor(condition, yes, no) {
        this.condition = condition;
        this.yes = yes;
        this.no = no;
        this.$kind = ekConditional;
    }
}
class AccessGlobalExpression {
    constructor(name) {
        this.name = name;
        this.$kind = ekAccessGlobal;
    }
}
class AccessThisExpression {
    constructor(ancestor = 0) {
        this.ancestor = ancestor;
        this.$kind = ekAccessThis;
    }
}
class AccessBoundaryExpression {
    constructor() {
        this.$kind = ekAccessBoundary;
    }
}
class AccessScopeExpression {
    constructor(name, ancestor = 0) {
        this.name = name;
        this.ancestor = ancestor;
        this.$kind = ekAccessScope;
    }
}
const isAccessGlobal = (ast) => (ast.$kind === ekAccessGlobal ||
    (ast.$kind === ekAccessMember ||
        ast.$kind === ekAccessKeyed) && ast.accessGlobal);
class AccessMemberExpression {
    constructor(object, name, optional = false) {
        this.object = object;
        this.name = name;
        this.optional = optional;
        this.$kind = ekAccessMember;
        this.accessGlobal = isAccessGlobal(object);
    }
}
class AccessKeyedExpression {
    constructor(object, key, optional = false) {
        this.object = object;
        this.key = key;
        this.optional = optional;
        this.$kind = ekAccessKeyed;
        this.accessGlobal = isAccessGlobal(object);
    }
}
class CallScopeExpression {
    constructor(name, args, ancestor = 0, optional = false) {
        this.name = name;
        this.args = args;
        this.ancestor = ancestor;
        this.optional = optional;
        this.$kind = ekCallScope;
    }
}
class CallMemberExpression {
    constructor(object, name, args, optionalMember = false, optionalCall = false) {
        this.object = object;
        this.name = name;
        this.args = args;
        this.optionalMember = optionalMember;
        this.optionalCall = optionalCall;
        this.$kind = ekCallMember;
    }
}
class CallFunctionExpression {
    constructor(func, args, optional = false) {
        this.func = func;
        this.args = args;
        this.optional = optional;
        this.$kind = ekCallFunction;
    }
}
class CallGlobalExpression {
    constructor(name, args) {
        this.name = name;
        this.args = args;
        this.$kind = ekCallGlobal;
    }
}
class BinaryExpression {
    constructor(operation, left, right) {
        this.operation = operation;
        this.left = left;
        this.right = right;
        this.$kind = ekBinary;
    }
}
class UnaryExpression {
    constructor(operation, expression) {
        this.operation = operation;
        this.expression = expression;
        this.$kind = ekUnary;
    }
}
class PrimitiveLiteralExpression {
    constructor(value) {
        this.value = value;
        this.$kind = ekPrimitiveLiteral;
    }
}
PrimitiveLiteralExpression.$undefined = new PrimitiveLiteralExpression(void 0);
PrimitiveLiteralExpression.$null = new PrimitiveLiteralExpression(null);
PrimitiveLiteralExpression.$true = new PrimitiveLiteralExpression(true);
PrimitiveLiteralExpression.$false = new PrimitiveLiteralExpression(false);
PrimitiveLiteralExpression.$empty = new PrimitiveLiteralExpression('');
class ArrayLiteralExpression {
    constructor(elements) {
        this.elements = elements;
        this.$kind = ekArrayLiteral;
    }
}
ArrayLiteralExpression.$empty = new ArrayLiteralExpression(emptyArray);
class ObjectLiteralExpression {
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
        this.$kind = ekObjectLiteral;
    }
}
ObjectLiteralExpression.$empty = new ObjectLiteralExpression(emptyArray, emptyArray);
class TemplateExpression {
    constructor(cooked, expressions = emptyArray) {
        this.cooked = cooked;
        this.expressions = expressions;
        this.$kind = ekTemplate;
    }
}
TemplateExpression.$empty = new TemplateExpression(['']);
class TaggedTemplateExpression {
    constructor(cooked, raw, func, expressions = emptyArray) {
        this.cooked = cooked;
        this.func = func;
        this.expressions = expressions;
        this.$kind = ekTaggedTemplate;
        cooked.raw = raw;
    }
}
class ArrayBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(elements) {
        this.elements = elements;
        this.$kind = ekArrayBindingPattern;
    }
}
class ObjectBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
        this.$kind = ekObjectBindingPattern;
    }
}
class BindingIdentifier {
    constructor(name) {
        this.name = name;
        this.$kind = ekBindingIdentifier;
    }
}
// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
class ForOfStatement {
    constructor(declaration, iterable, semiIdx) {
        this.declaration = declaration;
        this.iterable = iterable;
        this.semiIdx = semiIdx;
        this.$kind = ekForOfStatement;
    }
}
/*
* Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
* so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
* but this class might be a candidate for removal if it turns out it does provide all we need
*/
class Interpolation {
    constructor(parts, expressions = emptyArray) {
        this.parts = parts;
        this.expressions = expressions;
        this.$kind = ekInterpolation;
        this.isMulti = expressions.length > 1;
        this.firstExpression = expressions[0];
    }
}
// spec: https://tc39.es/ecma262/#sec-destructuring-assignment
/** This is an internal API */
class DestructuringAssignmentExpression {
    constructor($kind, list, source, initializer) {
        this.$kind = $kind;
        this.list = list;
        this.source = source;
        this.initializer = initializer;
    }
}
/** This is an internal API */
class DestructuringAssignmentSingleExpression {
    constructor(target, source, initializer) {
        this.target = target;
        this.source = source;
        this.initializer = initializer;
        this.$kind = ekDestructuringAssignmentLeaf;
    }
}
/** This is an internal API */
class DestructuringAssignmentRestExpression {
    constructor(target, indexOrProperties) {
        this.target = target;
        this.indexOrProperties = indexOrProperties;
        this.$kind = ekDestructuringAssignmentLeaf;
    }
}
class ArrowFunction {
    constructor(args, body, rest = false) {
        this.args = args;
        this.body = body;
        this.rest = rest;
        this.$kind = ekArrowFunction;
    }
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */
/** @internal */
const createMappedError = (code, ...details) => new Error(`AUR${safeString(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
    ;

const errorsMap = {
    [99 /* ErrorNames.method_not_implemented */]: 'Method {{0}} not implemented',
    [101 /* ErrorNames.ast_behavior_not_found */]: `Ast eval error: binding behavior "{{0}}" could not be found. Did you forget to register it as a dependency?`,
    [102 /* ErrorNames.ast_behavior_duplicated */]: `Ast eval error: binding behavior "{{0}}" already applied.`,
    [103 /* ErrorNames.ast_converter_not_found */]: `Ast eval error: value converter "{{0}}" could not be found. Did you forget to register it as a dependency?`,
    [105 /* ErrorNames.ast_$host_not_found */]: `Ast eval error: unable to find $host context. Did you forget [au-slot] attribute?`,
    [106 /* ErrorNames.ast_no_assign_$host */]: `Ast eval error: invalid assignment. "$host" is a reserved keyword.`,
    [107 /* ErrorNames.ast_not_a_function */]: `Ast eval error: expression is not a function.`,
    [109 /* ErrorNames.ast_unknown_unary_operator */]: `Ast eval error: unknown unary operator: "{{0}}"`,
    [108 /* ErrorNames.ast_unknown_binary_operator */]: `Ast eval error: unknown binary operator: "{{0}}"`,
    [110 /* ErrorNames.ast_tagged_not_a_function */]: `Ast eval error: left-hand side of tagged template expression is not a function.`,
    [111 /* ErrorNames.ast_name_is_not_a_function */]: `Ast eval error: expected "{{0}}" to be a function`,
    [112 /* ErrorNames.ast_destruct_null */]: `Ast eval error: cannot use non-object value for destructuring assignment.`,
    [151 /* ErrorNames.parse_invalid_start */]: `Expression error: invalid start: "{{0}}"`,
    [152 /* ErrorNames.parse_no_spread */]: `Expression error: spread operator is not supported: "{{0}}"`,
    [153 /* ErrorNames.parse_expected_identifier */]: `Expression error: expected identifier: "{{0}}"`,
    [154 /* ErrorNames.parse_invalid_member_expr */]: `Expression error: invalid member expression: "{{0}}"`,
    [155 /* ErrorNames.parse_unexpected_end */]: `Expression error: unexpected end of expression: "{{0}}"`,
    [156 /* ErrorNames.parse_unconsumed_token */]: `Expression error: unconsumed token: "{{0}}" at position {{1}} of "{{2}}"`,
    [157 /* ErrorNames.parse_invalid_empty */]: `Expression error: invalid empty expression. Empty expression is only valid in event bindings (trigger, delegate, capture etc...)`,
    [158 /* ErrorNames.parse_left_hand_side_not_assignable */]: `Expression error: left hand side of expression is not assignable: "{{0}}"`,
    [159 /* ErrorNames.parse_expected_converter_identifier */]: `Expression error: expected identifier to come after value converter operator: "{{0}}"`,
    [160 /* ErrorNames.parse_expected_behavior_identifier */]: `Expression error: expected identifier to come after binding behavior operator: {{0}}`,
    [161 /* ErrorNames.parse_unexpected_keyword_of */]: `Expression error: unexpected keyword "of": "{{0}}"`,
    [162 /* ErrorNames.parse_unexpected_keyword_import */]: `Expression error: unexpected keyword "import": "{{0}}"`,
    [163 /* ErrorNames.parse_invalid_identifier_in_forof */]: `Expression error: invalid BindingIdentifier at left hand side of "of": "{{0}}" | kind: {{1}}`,
    [164 /* ErrorNames.parse_invalid_identifier_object_literal_key */]: `Expression error: invalid or unsupported property definition in object literal: "{{0}}"`,
    [165 /* ErrorNames.parse_unterminated_string */]: `Expression error: unterminated quote in string literal: "{{0}}"`,
    [166 /* ErrorNames.parse_unterminated_template_string */]: `Expression error: unterminated template string: "{{0}}"`,
    [167 /* ErrorNames.parse_missing_expected_token */]: `Expression error: missing expected token "{{0}}" in "{{1}}"`,
    [168 /* ErrorNames.parse_unexpected_character */]: `Expression error: unexpected character: "{{0}}"`,
    [170 /* ErrorNames.parse_unexpected_token_destructuring */]: `Expression error: unexpected "{{0}}" at position "{{1}}" for destructuring assignment in "{{2}}"`,
    [171 /* ErrorNames.parse_unexpected_token_optional_chain */]: `Expression error: unexpected {{0}} at position "{{1}}" for optional chain in "{{2}}"`,
    [172 /* ErrorNames.parse_invalid_tag_in_optional_chain */]: `Expression error: invalid tagged template on optional chain in "{{1}}"`,
    [173 /* ErrorNames.parse_invalid_arrow_params */]: `Expression error: invalid arrow parameter list in "{{0}}"`,
    [174 /* ErrorNames.parse_no_arrow_param_default_value */]: `Expression error: arrow function with default parameters is not supported: "{{0}}"`,
    [175 /* ErrorNames.parse_no_arrow_param_destructuring */]: `Expression error: arrow function with destructuring parameters is not supported: "{{0}}"`,
    [176 /* ErrorNames.parse_rest_must_be_last */]: `Expression error: rest parameter must be last formal parameter in arrow function: "{{0}}"`,
    [178 /* ErrorNames.parse_no_arrow_fn_body */]: `Expression error: arrow function with function body is not supported: "{{0}}"`,
    [179 /* ErrorNames.parse_unexpected_double_dot */]: `Expression error: unexpected token '.' at position "{{1}}" in "{{0}}"`,
    [199 /* ErrorNames.observing_null_undefined */]: `Trying to observe property {{0}} on null/undefined`,
    [203 /* ErrorNames.null_scope */]: `Trying to retrieve a property or build a scope from a null/undefined scope`,
    [204 /* ErrorNames.create_scope_with_null_context */]: 'Trying to create a scope with null/undefined binding context',
    [206 /* ErrorNames.switch_on_null_connectable */]: `Trying to switch to a null/undefined connectable`,
    [207 /* ErrorNames.switch_active_connectable */]: `Trying to enter an active connectable`,
    [208 /* ErrorNames.switch_off_null_connectable */]: `Trying to pop a null/undefined connectable`,
    [209 /* ErrorNames.switch_off_inactive_connectable */]: `Trying to exit an inactive connectable`,
    [210 /* ErrorNames.non_recognisable_collection_type */]: `Unrecognised collection type {{0:toString}}.`,
    [220 /* ErrorNames.assign_readonly_size */]: `Map/Set "size" is a readonly property`,
    [221 /* ErrorNames.assign_readonly_readonly_property_from_computed */]: `Trying to assign value to readonly property "{{0}}" through computed observer.`,
    [224 /* ErrorNames.invalid_observable_decorator_usage */]: `Invalid @observable decorator usage, cannot determine property name`,
    [225 /* ErrorNames.stopping_a_stopped_effect */]: `Trying to stop an effect that has already been stopped`,
    [226 /* ErrorNames.effect_maximum_recursion_reached */]: `Maximum number of recursive effect run reached. Consider handle effect dependencies differently.`,
};
const getMessageByCode = (name, ...details) => {
    let cooked = errorsMap[name];
    for (let i = 0; i < details.length; ++i) {
        const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
        let matches = regex.exec(cooked);
        while (matches != null) {
            const method = matches[1]?.slice(1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let value = details[i];
            if (value != null) {
                switch (method) {
                    case 'nodeName':
                        value = value.nodeName.toLowerCase();
                        break;
                    case 'name':
                        value = value.name;
                        break;
                    case 'typeof':
                        value = typeof value;
                        break;
                    case 'ctor':
                        value = value.constructor.name;
                        break;
                    case 'controller':
                        value = value.controller.name;
                        break;
                    case 'target@property':
                        value = `${value.target}@${value.targetProperty}`;
                        break;
                    case 'toString':
                        value = Object.prototype.toString.call(value);
                        break;
                    case 'join(!=)':
                        value = value.join('!=');
                        break;
                    case 'bindingCommandHelp':
                        value = getBindingCommandHelp(value);
                        break;
                    case 'element':
                        value = value === '*' ? 'all elements' : `<${value} />`;
                        break;
                    default: {
                        // property access
                        if (method?.startsWith('.')) {
                            value = safeString(value[method.slice(1)]);
                        }
                        else {
                            value = safeString(value);
                        }
                    }
                }
            }
            cooked = cooked.slice(0, matches.index) + value + cooked.slice(regex.lastIndex);
            matches = regex.exec(cooked);
        }
    }
    return cooked;
};
function getBindingCommandHelp(name) {
    switch (name) {
        case 'delegate':
            return `\nThe ".delegate" binding command has been removed in v2.`
                + ` Binding command ".trigger" should be used instead.`
                + ` If you are migrating v1 application, install compat package`
                + ` to add back the ".delegate" binding command for ease of migration.`;
        case 'call':
            return `\nThe ".call" binding command has been removed in v2.`
                + ` If you want to pass a callback that preserves the context of the function call,`
                + ` you can use lambda instead. Refer to lambda expression doc for more details.`;
        default:
            return '';
    }
}

/**
 * A class for creating context in synthetic scope to keep the number of classes of context in scope small
 */
class BindingContext {
    constructor(key, value) {
        if (key !== void 0) {
            this[key] = value;
        }
    }
}
class Scope {
    constructor(parent, bindingContext, overrideContext, isBoundary) {
        this.parent = parent;
        this.bindingContext = bindingContext;
        this.overrideContext = overrideContext;
        this.isBoundary = isBoundary;
    }
    static getContext(scope, name, ancestor) {
        if (scope == null) {
            throw createMappedError(203 /* ErrorNames.null_scope */);
        }
        let overrideContext = scope.overrideContext;
        let currentScope = scope;
        if (ancestor > 0) {
            // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
            while (ancestor > 0) {
                ancestor--;
                currentScope = currentScope.parent;
                if (currentScope == null) {
                    return void 0;
                }
            }
            overrideContext = currentScope.overrideContext;
            // Here we are giving benefit of doubt considering the dev has used one or more `$parent` token, and thus should know what s/he is targeting.
            return name in overrideContext ? overrideContext : currentScope.bindingContext;
        }
        // walk the scope hierarchy until
        // the first scope that has the property in its contexts
        // or
        // the closet boundary scope
        // -------------------------
        // this behavior is different with v1
        // where it would fallback to the immediate scope instead of the root one
        // TODO: maybe avoid immediate loop and return earlier
        // -------------------------
        while (currentScope != null
            && !currentScope.isBoundary
            && !(name in currentScope.overrideContext)
            && !(name in currentScope.bindingContext)) {
            currentScope = currentScope.parent;
        }
        if (currentScope == null) {
            return scope.bindingContext;
        }
        overrideContext = currentScope.overrideContext;
        return name in overrideContext ? overrideContext : currentScope.bindingContext;
    }
    static create(bc, oc, isBoundary) {
        if (bc == null) {
            throw createMappedError(204 /* ErrorNames.create_scope_with_null_context */);
        }
        return new Scope(null, bc, oc ?? new OverrideContext(), isBoundary ?? false);
    }
    static fromParent(ps, bc) {
        if (ps == null) {
            throw createMappedError(203 /* ErrorNames.null_scope */);
        }
        return new Scope(ps, bc, new OverrideContext(), false);
    }
}
class OverrideContext {
}

/* eslint-disable no-fallthrough */
const getContext = Scope.getContext;
// eslint-disable-next-line max-lines-per-function
function astEvaluate(ast, s, e, c) {
    switch (ast.$kind) {
        case ekAccessThis: {
            let oc = s.overrideContext;
            let currentScope = s;
            let i = ast.ancestor;
            while (i-- && oc) {
                currentScope = currentScope.parent;
                oc = currentScope?.overrideContext ?? null;
            }
            return i < 1 && currentScope ? currentScope.bindingContext : void 0;
        }
        case ekAccessBoundary: {
            let currentScope = s;
            while (currentScope != null
                && !currentScope.isBoundary) {
                currentScope = currentScope.parent;
            }
            return currentScope ? currentScope.bindingContext : void 0;
        }
        case ekAccessScope: {
            const obj = getContext(s, ast.name, ast.ancestor);
            if (c !== null) {
                c.observe(obj, ast.name);
            }
            const evaluatedValue = obj[ast.name];
            if (evaluatedValue == null && ast.name === '$host') {
                throw createMappedError(105 /* ErrorNames.ast_$host_not_found */);
            }
            if (e?.strict) {
                // return evaluatedValue;
                return e?.boundFn && isFunction(evaluatedValue)
                    ? evaluatedValue.bind(obj)
                    : evaluatedValue;
            }
            return evaluatedValue == null
                ? ''
                : e?.boundFn && isFunction(evaluatedValue)
                    ? evaluatedValue.bind(obj)
                    : evaluatedValue;
        }
        case ekAccessGlobal:
            return globalThis[ast.name];
        case ekCallGlobal: {
            const func = globalThis[ast.name];
            if (isFunction(func)) {
                return func(...ast.args.map(a => astEvaluate(a, s, e, c)));
            }
            /* istanbul-ignore-next */
            if (!e?.strictFnCall && func == null) {
                return void 0;
            }
            throw createMappedError(107 /* ErrorNames.ast_not_a_function */);
        }
        case ekArrayLiteral:
            return ast.elements.map(expr => astEvaluate(expr, s, e, c));
        case ekObjectLiteral: {
            const instance = {};
            for (let i = 0; i < ast.keys.length; ++i) {
                instance[ast.keys[i]] = astEvaluate(ast.values[i], s, e, c);
            }
            return instance;
        }
        case ekPrimitiveLiteral:
            return ast.value;
        case ekTemplate: {
            let result = ast.cooked[0];
            for (let i = 0; i < ast.expressions.length; ++i) {
                result += String(astEvaluate(ast.expressions[i], s, e, c));
                result += ast.cooked[i + 1];
            }
            return result;
        }
        case ekUnary:
            switch (ast.operation) {
                case 'void':
                    return void astEvaluate(ast.expression, s, e, c);
                case 'typeof':
                    return typeof astEvaluate(ast.expression, s, e, c);
                case '!':
                    return !astEvaluate(ast.expression, s, e, c);
                case '-':
                    return -astEvaluate(ast.expression, s, e, c);
                case '+':
                    return +astEvaluate(ast.expression, s, e, c);
                default:
                    throw createMappedError(109 /* ErrorNames.ast_unknown_unary_operator */, ast.operation);
            }
        case ekCallScope: {
            const args = ast.args.map(a => astEvaluate(a, s, e, c));
            const context = getContext(s, ast.name, ast.ancestor);
            // ideally, should observe property represents by ast.name as well
            // because it could be changed
            // todo: did it ever surprise anyone?
            const func = getFunction(e?.strictFnCall, context, ast.name);
            if (func) {
                return func.apply(context, args);
            }
            return void 0;
        }
        case ekCallMember: {
            const instance = astEvaluate(ast.object, s, e, c);
            const args = ast.args.map(a => astEvaluate(a, s, e, c));
            const func = getFunction(e?.strictFnCall, instance, ast.name);
            let ret;
            if (func) {
                ret = func.apply(instance, args);
                // todo(doc): investigate & document in engineering doc the difference
                //            between observing before/after func.apply
                if (isArray(instance) && autoObserveArrayMethods.includes(ast.name)) {
                    c?.observeCollection(instance);
                }
            }
            return ret;
        }
        case ekCallFunction: {
            const func = astEvaluate(ast.func, s, e, c);
            if (isFunction(func)) {
                return func(...ast.args.map(a => astEvaluate(a, s, e, c)));
            }
            if (!e?.strictFnCall && func == null) {
                return void 0;
            }
            throw createMappedError(107 /* ErrorNames.ast_not_a_function */);
        }
        case ekArrowFunction: {
            const func = (...args) => {
                const params = ast.args;
                const rest = ast.rest;
                const lastIdx = params.length - 1;
                const context = params.reduce((map, param, i) => {
                    if (rest && i === lastIdx) {
                        map[param.name] = args.slice(i);
                    }
                    else {
                        map[param.name] = args[i];
                    }
                    return map;
                }, {});
                const functionScope = Scope.fromParent(s, context);
                return astEvaluate(ast.body, functionScope, e, c);
            };
            return func;
        }
        case ekAccessMember: {
            const instance = astEvaluate(ast.object, s, e, c);
            let ret;
            if (e?.strict) {
                if (instance == null) {
                    return undefined;
                }
                if (c !== null && !ast.accessGlobal) {
                    c.observe(instance, ast.name);
                }
                ret = instance[ast.name];
                if (e?.boundFn && isFunction(ret)) {
                    return ret.bind(instance);
                }
                return ret;
            }
            if (c !== null && isObject(instance) && !ast.accessGlobal) {
                c.observe(instance, ast.name);
            }
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (instance) {
                ret = instance[ast.name];
                if (e?.boundFn && isFunction(ret)) {
                    return ret.bind(instance);
                }
                return ret;
            }
            return '';
        }
        case ekAccessKeyed: {
            const instance = astEvaluate(ast.object, s, e, c);
            const key = astEvaluate(ast.key, s, e, c);
            if (isObject(instance)) {
                if (c !== null && !ast.accessGlobal) {
                    c.observe(instance, key);
                }
                return instance[key];
            }
            return instance == null
                ? void 0
                : instance[key];
        }
        case ekTaggedTemplate: {
            const results = ast.expressions.map(expr => astEvaluate(expr, s, e, c));
            const func = astEvaluate(ast.func, s, e, c);
            if (!isFunction(func)) {
                throw createMappedError(110 /* ErrorNames.ast_tagged_not_a_function */);
            }
            return func(ast.cooked, ...results);
        }
        case ekBinary: {
            const left = ast.left;
            const right = ast.right;
            switch (ast.operation) {
                case '&&':
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    return astEvaluate(left, s, e, c) && astEvaluate(right, s, e, c);
                case '||':
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    return astEvaluate(left, s, e, c) || astEvaluate(right, s, e, c);
                case '??':
                    return astEvaluate(left, s, e, c) ?? astEvaluate(right, s, e, c);
                case '==':
                    // eslint-disable-next-line eqeqeq
                    return astEvaluate(left, s, e, c) == astEvaluate(right, s, e, c);
                case '===':
                    return astEvaluate(left, s, e, c) === astEvaluate(right, s, e, c);
                case '!=':
                    // eslint-disable-next-line eqeqeq
                    return astEvaluate(left, s, e, c) != astEvaluate(right, s, e, c);
                case '!==':
                    return astEvaluate(left, s, e, c) !== astEvaluate(right, s, e, c);
                case 'instanceof': {
                    const $right = astEvaluate(right, s, e, c);
                    if (isFunction($right)) {
                        return astEvaluate(left, s, e, c) instanceof $right;
                    }
                    return false;
                }
                case 'in': {
                    const $right = astEvaluate(right, s, e, c);
                    if (isObject($right)) {
                        return astEvaluate(left, s, e, c) in $right;
                    }
                    return false;
                }
                // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
                // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
                // ast makes bugs in user code easier to track down for end users
                // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
                case '+': {
                    const $left = astEvaluate(left, s, e, c);
                    const $right = astEvaluate(right, s, e, c);
                    if (e?.strict) {
                        return $left + $right;
                    }
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    if (!$left || !$right) {
                        if (isNumberOrBigInt($left) || isNumberOrBigInt($right)) {
                            return ($left || 0) + ($right || 0);
                        }
                        if (isStringOrDate($left) || isStringOrDate($right)) {
                            return ($left || '') + ($right || '');
                        }
                    }
                    return $left + $right;
                }
                case '-':
                    return astEvaluate(left, s, e, c) - astEvaluate(right, s, e, c);
                case '*':
                    return astEvaluate(left, s, e, c) * astEvaluate(right, s, e, c);
                case '/':
                    return astEvaluate(left, s, e, c) / astEvaluate(right, s, e, c);
                case '%':
                    return astEvaluate(left, s, e, c) % astEvaluate(right, s, e, c);
                case '<':
                    return astEvaluate(left, s, e, c) < astEvaluate(right, s, e, c);
                case '>':
                    return astEvaluate(left, s, e, c) > astEvaluate(right, s, e, c);
                case '<=':
                    return astEvaluate(left, s, e, c) <= astEvaluate(right, s, e, c);
                case '>=':
                    return astEvaluate(left, s, e, c) >= astEvaluate(right, s, e, c);
                default:
                    throw createMappedError(108 /* ErrorNames.ast_unknown_binary_operator */, ast.operation);
            }
        }
        case ekConditional:
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            return astEvaluate(ast.condition, s, e, c) ? astEvaluate(ast.yes, s, e, c) : astEvaluate(ast.no, s, e, c);
        case ekAssign:
            return astAssign(ast.target, s, e, astEvaluate(ast.value, s, e, c));
        case ekValueConverter: {
            const vc = e?.getConverter?.(ast.name);
            if (vc == null) {
                throw createMappedError(103 /* ErrorNames.ast_converter_not_found */, ast.name);
            }
            if ('toView' in vc) {
                return vc.toView(astEvaluate(ast.expression, s, e, c), ...ast.args.map(a => astEvaluate(a, s, e, c)));
            }
            return astEvaluate(ast.expression, s, e, c);
        }
        case ekBindingBehavior:
            return astEvaluate(ast.expression, s, e, c);
        case ekBindingIdentifier:
            return ast.name;
        case ekForOfStatement:
            return astEvaluate(ast.iterable, s, e, c);
        case ekInterpolation:
            if (ast.isMulti) {
                let result = ast.parts[0];
                let i = 0;
                for (; i < ast.expressions.length; ++i) {
                    result += safeString(astEvaluate(ast.expressions[i], s, e, c));
                    result += ast.parts[i + 1];
                }
                return result;
            }
            else {
                return `${ast.parts[0]}${astEvaluate(ast.firstExpression, s, e, c)}${ast.parts[1]}`;
            }
        case ekDestructuringAssignmentLeaf:
            return astEvaluate(ast.target, s, e, c);
        case ekArrayDestructuring: {
            return ast.list.map(x => astEvaluate(x, s, e, c));
        }
        // TODO: this should come after batch
        // as a destructuring expression like [x, y] = value
        //
        // should only trigger change only once:
        // batch(() => {
        //   object.x = value[0]
        //   object.y = value[1]
        // })
        //
        // instead of twice:
        // object.x = value[0]
        // object.y = value[1]
        case ekArrayBindingPattern:
        // TODO
        // similar to array binding ast, this should only come after batch
        // for a single notification per destructing,
        // regardless number of property assignments on the scope binding context
        case ekObjectBindingPattern:
        case ekObjectDestructuring:
        default:
            return void 0;
        case ekCustom:
            return ast.evaluate(s, e, c);
    }
}
function astAssign(ast, s, e, val) {
    switch (ast.$kind) {
        case ekAccessScope: {
            if (ast.name === '$host') {
                throw createMappedError(106 /* ErrorNames.ast_no_assign_$host */);
            }
            const obj = getContext(s, ast.name, ast.ancestor);
            return obj[ast.name] = val;
        }
        case ekAccessMember: {
            const obj = astEvaluate(ast.object, s, e, null);
            if (isObject(obj)) {
                if (ast.name === 'length' && isArray(obj) && !isNaN(val)) {
                    obj.splice(val);
                }
                else {
                    obj[ast.name] = val;
                }
            }
            else {
                astAssign(ast.object, s, e, { [ast.name]: val });
            }
            return val;
        }
        case ekAccessKeyed: {
            const instance = astEvaluate(ast.object, s, e, null);
            const key = astEvaluate(ast.key, s, e, null);
            if (isArray(instance)) {
                if (key === 'length' && !isNaN(val)) {
                    instance.splice(val);
                    return val;
                }
                if (isArrayIndex(key)) {
                    instance.splice(key, 1, val);
                    return val;
                }
            }
            return instance[key] = val;
        }
        case ekAssign:
            astAssign(ast.value, s, e, val);
            return astAssign(ast.target, s, e, val);
        case ekValueConverter: {
            const vc = e?.getConverter?.(ast.name);
            if (vc == null) {
                throw createMappedError(103 /* ErrorNames.ast_converter_not_found */, ast.name);
            }
            if ('fromView' in vc) {
                val = vc.fromView(val, ...ast.args.map(a => astEvaluate(a, s, e, null)));
            }
            return astAssign(ast.expression, s, e, val);
        }
        case ekBindingBehavior:
            return astAssign(ast.expression, s, e, val);
        case ekArrayDestructuring:
        case ekObjectDestructuring: {
            const list = ast.list;
            const len = list.length;
            let i;
            let item;
            for (i = 0; i < len; i++) {
                item = list[i];
                switch (item.$kind) {
                    case ekDestructuringAssignmentLeaf:
                        astAssign(item, s, e, val);
                        break;
                    case ekArrayDestructuring:
                    case ekObjectDestructuring: {
                        if (typeof val !== 'object' || val === null) {
                            throw createMappedError(112 /* ErrorNames.ast_destruct_null */);
                        }
                        let source = astEvaluate(item.source, Scope.create(val), e, null);
                        if (source === void 0 && item.initializer) {
                            source = astEvaluate(item.initializer, s, e, null);
                        }
                        astAssign(item, s, e, source);
                        break;
                    }
                }
            }
            break;
        }
        case ekDestructuringAssignmentLeaf: {
            if (ast instanceof DestructuringAssignmentSingleExpression) {
                if (val == null) {
                    return;
                }
                if (typeof val !== 'object') {
                    throw createMappedError(112 /* ErrorNames.ast_destruct_null */);
                }
                let source = astEvaluate(ast.source, Scope.create(val), e, null);
                if (source === void 0 && ast.initializer) {
                    source = astEvaluate(ast.initializer, s, e, null);
                }
                astAssign(ast.target, s, e, source);
            }
            else {
                if (val == null) {
                    return;
                }
                if (typeof val !== 'object') {
                    throw createMappedError(112 /* ErrorNames.ast_destruct_null */);
                }
                const indexOrProperties = ast.indexOrProperties;
                let restValue;
                if (isArrayIndex(indexOrProperties)) {
                    if (!Array.isArray(val)) {
                        throw createMappedError(112 /* ErrorNames.ast_destruct_null */);
                    }
                    restValue = val.slice(indexOrProperties);
                }
                else {
                    restValue = Object
                        .entries(val)
                        .reduce((acc, [k, v]) => {
                        if (!indexOrProperties.includes(k)) {
                            acc[k] = v;
                        }
                        return acc;
                        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    }, {});
                }
                astAssign(ast.target, s, e, restValue);
            }
            break;
        }
        case ekCustom:
            return ast.assign(s, e, val);
        default:
            return void 0;
    }
}
function astBind(ast, s, b) {
    switch (ast.$kind) {
        case ekBindingBehavior: {
            const name = ast.name;
            const key = ast.key;
            const behavior = b.getBehavior?.(name);
            if (behavior == null) {
                throw createMappedError(101 /* ErrorNames.ast_behavior_not_found */, name);
            }
            if (b[key] === void 0) {
                b[key] = behavior;
                behavior.bind?.(s, b, ...ast.args.map(a => astEvaluate(a, s, b, null)));
            }
            else {
                throw createMappedError(102 /* ErrorNames.ast_behavior_duplicated */, name);
            }
            astBind(ast.expression, s, b);
            return;
        }
        case ekValueConverter: {
            const name = ast.name;
            const vc = b.getConverter?.(name);
            if (vc == null) {
                throw createMappedError(103 /* ErrorNames.ast_converter_not_found */, name);
            }
            // note: the cast is expected. To connect, it just needs to be a IConnectable
            // though to work with signal, it needs to have `handleChange`
            // so having `handleChange` as a guard in the connectable as a safe measure is needed
            // to make sure signaler works
            const signals = vc.signals;
            if (signals != null) {
                const signaler = b.getSignaler?.();
                const ii = signals.length;
                let i = 0;
                for (; i < ii; ++i) {
                    // todo: signaler api
                    signaler?.addSignalListener(signals[i], b);
                }
            }
            astBind(ast.expression, s, b);
            return;
        }
        case ekForOfStatement: {
            astBind(ast.iterable, s, b);
            break;
        }
        case ekCustom: {
            ast.bind?.(s, b);
        }
    }
}
function astUnbind(ast, s, b) {
    switch (ast.$kind) {
        case ekBindingBehavior: {
            const key = ast.key;
            const $b = b;
            if ($b[key] !== void 0) {
                $b[key].unbind?.(s, b);
                $b[key] = void 0;
            }
            astUnbind(ast.expression, s, b);
            break;
        }
        case ekValueConverter: {
            const vc = b.getConverter?.(ast.name);
            if (vc?.signals === void 0) {
                return;
            }
            const signaler = b.getSignaler?.();
            let i = 0;
            for (; i < vc.signals.length; ++i) {
                // the cast is correct, as the value converter expression would only add
                // a IConnectable that also implements `ISubscriber` interface to the signaler
                signaler?.removeSignalListener(vc.signals[i], b);
            }
            astUnbind(ast.expression, s, b);
            break;
        }
        case ekForOfStatement: {
            astUnbind(ast.iterable, s, b);
            break;
        }
        case ekCustom: {
            ast.unbind?.(s, b);
        }
    }
}
const getFunction = (mustEvaluate, obj, name) => {
    const func = obj == null ? null : obj[name];
    if (isFunction(func)) {
        return func;
    }
    if (!mustEvaluate && func == null) {
        return null;
    }
    throw createMappedError(111 /* ErrorNames.ast_name_is_not_a_function */, name);
};
/**
 * Determines if the value passed is a number or bigint for parsing purposes
 *
 * @param value - Value to evaluate
 */
const isNumberOrBigInt = (value) => {
    switch (typeof value) {
        case 'number':
        case 'bigint':
            return true;
        default:
            return false;
    }
};
/**
 * Determines if the value passed is a string or Date for parsing purposes
 *
 * @param value - Value to evaluate
 */
const isStringOrDate = (value) => {
    switch (typeof value) {
        case 'string':
            return true;
        case 'object':
            return value instanceof Date;
        default:
            return false;
    }
};
const autoObserveArrayMethods = 'at map filter includes indexOf lastIndexOf findIndex find flat flatMap join reduce reduceRight slice every some sort'.split(' ');
// sort,      // bad supported, self mutation + unclear dependency
// push,      // not supported, self mutation + unclear dependency
// pop,       // not supported, self mutation + unclear dependency
// shift,     // not supported, self mutation + unclear dependency
// splice,    // not supported, self mutation + unclear dependency
// unshift,   // not supported, self mutation + unclear dependency
// reverse,   // not supported, self mutation + unclear dependency
// keys,    // not meaningful in template
// values,  // not meaningful in template
// entries, // not meaningful in template

const ICoercionConfiguration = /*@__PURE__*/ DI.createInterface('ICoercionConfiguration');
/** @internal */ const atNone = 0b0_000_000;
/** @internal */ const atObserver = 0b0_000_001;
/** @internal */ const atNode = 0b0_000_010;
/** @internal */ const atLayout = 0b0_000_100;
const AccessorType = /*@__PURE__*/ objectFreeze({
    None: atNone,
    Observer: atObserver,
    Node: atNode,
    // misc characteristic of accessors/observers when update
    //
    // by default, everything is synchronous
    // except changes that are supposed to cause reflow/heavy computation
    // an observer can use this flag to signal binding that don't carelessly tell it to update
    // queue it instead
    // todo: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    // todo: https://csstriggers.com/
    Layout: atLayout,
});
function copyIndexMap(existing, deletedIndices, deletedItems) {
    const { length } = existing;
    const arr = Array(length);
    let i = 0;
    while (i < length) {
        arr[i] = existing[i];
        ++i;
    }
    if (deletedIndices !== void 0) {
        arr.deletedIndices = deletedIndices.slice(0);
    }
    else if (existing.deletedIndices !== void 0) {
        arr.deletedIndices = existing.deletedIndices.slice(0);
    }
    else {
        arr.deletedIndices = [];
    }
    if (deletedItems !== void 0) {
        arr.deletedItems = deletedItems.slice(0);
    }
    else if (existing.deletedItems !== void 0) {
        arr.deletedItems = existing.deletedItems.slice(0);
    }
    else {
        arr.deletedItems = [];
    }
    arr.isIndexMap = true;
    return arr;
}
function createIndexMap(length = 0) {
    const arr = Array(length);
    let i = 0;
    while (i < length) {
        arr[i] = i++;
    }
    arr.deletedIndices = [];
    arr.deletedItems = [];
    arr.isIndexMap = true;
    return arr;
}
function cloneIndexMap(indexMap) {
    const clone = indexMap.slice();
    clone.deletedIndices = indexMap.deletedIndices.slice();
    clone.deletedItems = indexMap.deletedItems.slice();
    clone.isIndexMap = true;
    return clone;
}
function isIndexMap(value) {
    return isArray(value) && value.isIndexMap === true;
}

let currBatch = new Map();
// eslint-disable-next-line import/no-mutable-exports
let batching = false;
function batch(fn) {
    const prevBatch = currBatch;
    const newBatch = currBatch = new Map();
    batching = true;
    try {
        fn();
    }
    finally {
        currBatch = null;
        batching = false;
        try {
            let pair;
            let subs;
            let batchRecord;
            let col;
            let indexMap;
            let hasChanges = false;
            let i;
            let ii;
            for (pair of newBatch) {
                subs = pair[0];
                batchRecord = pair[1];
                if (prevBatch?.has(subs)) {
                    prevBatch.set(subs, batchRecord);
                }
                if (batchRecord[0] === 1) {
                    subs.notify(batchRecord[1], batchRecord[2]);
                }
                else {
                    col = batchRecord[1];
                    indexMap = batchRecord[2];
                    hasChanges = false;
                    if (indexMap.deletedIndices.length > 0) {
                        hasChanges = true;
                    }
                    else {
                        for (i = 0, ii = indexMap.length; i < ii; ++i) {
                            if (indexMap[i] !== i) {
                                hasChanges = true;
                                break;
                            }
                        }
                    }
                    if (hasChanges) {
                        subs.notifyCollection(col, indexMap);
                    }
                }
            }
        }
        finally {
            currBatch = prevBatch;
        }
    }
}
function addCollectionBatch(subs, collection, indexMap) {
    if (!currBatch.has(subs)) {
        currBatch.set(subs, [2, collection, indexMap]);
    }
    else {
        currBatch.get(subs)[2] = indexMap;
    }
}
function addValueBatch(subs, newValue, oldValue) {
    const batchRecord = currBatch.get(subs);
    if (batchRecord === void 0) {
        currBatch.set(subs, [1, newValue, oldValue]);
    }
    else {
        batchRecord[1] = newValue;
        batchRecord[2] = oldValue;
    }
}

function subscriberCollection(target) {
    return target == null ? subscriberCollectionDeco : subscriberCollectionDeco(target);
}
const decoratedTarget = new WeakSet();
function subscriberCollectionDeco(target) {
    if (decoratedTarget.has(target)) {
        return;
    }
    decoratedTarget.add(target);
    const proto = target.prototype;
    // not configurable, as in devtool, the getter could be invoked on the prototype,
    // and become permanently broken
    def(proto, 'subs', { get: getSubscriberRecord });
    ensureProto(proto, 'subscribe', addSubscriber);
    ensureProto(proto, 'unsubscribe', removeSubscriber);
}
/* eslint-enable @typescript-eslint/ban-types */
class SubscriberRecord {
    constructor() {
        this.count = 0;
        /** @internal */
        this._subs = [];
    }
    add(subscriber) {
        if (this._subs.includes(subscriber)) {
            return false;
        }
        this._subs[this._subs.length] = subscriber;
        ++this.count;
        return true;
    }
    remove(subscriber) {
        const idx = this._subs.indexOf(subscriber);
        if (idx !== -1) {
            this._subs.splice(idx, 1);
            --this.count;
            return true;
        }
        return false;
    }
    notify(val, oldVal) {
        if (batching) {
            addValueBatch(this, val, oldVal);
            return;
        }
        /**
         * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
         * callSubscribers invocation, so we're caching them all before invoking any.
         * Subscribers added during this invocation are not invoked (and they shouldn't be).
         * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
         * however this is accounted for via $isBound and similar flags on the subscriber objects)
         */
        const _subs = this._subs.slice(0);
        const len = _subs.length;
        let i = 0;
        for (; i < len; ++i) {
            _subs[i].handleChange(val, oldVal);
        }
        return;
    }
    notifyCollection(collection, indexMap) {
        const _subs = this._subs.slice(0);
        const len = _subs.length;
        let i = 0;
        for (; i < len; ++i) {
            _subs[i].handleCollectionChange(collection, indexMap);
        }
        return;
    }
}
function getSubscriberRecord() {
    return defineHiddenProp(this, 'subs', new SubscriberRecord());
}
function addSubscriber(subscriber) {
    return this.subs.add(subscriber);
}
function removeSubscriber(subscriber) {
    return this.subs.remove(subscriber);
}

class CollectionLengthObserver {
    constructor(owner) {
        this.owner = owner;
        this.type = atObserver;
        this._value = (this._obj = owner.collection).length;
    }
    getValue() {
        return this._obj.length;
    }
    setValue(newValue) {
        // if in the template, length is two-way bound directly
        // then there's a chance that the new value is invalid
        // add a guard so that we don't accidentally broadcast invalid values
        if (newValue !== this._value) {
            if (!Number.isNaN(newValue)) {
                this._obj.splice(newValue);
                this._value = this._obj.length;
                // todo: maybe use splice so that it'll notify everything properly
                // this._obj.length = newValue;
                // this.subs.notify(newValue, currentValue);
            }
            else {
                // eslint-disable-next-line no-console
                console.warn(`Invalid value "${newValue}" for array length`);
            }
        }
    }
    handleCollectionChange(_arr, _) {
        const oldValue = this._value;
        const value = this._obj.length;
        if ((this._value = value) !== oldValue) {
            this.subs.notify(this._value, oldValue);
        }
    }
}
class CollectionSizeObserver {
    constructor(owner) {
        this.owner = owner;
        this.type = atObserver;
        this._value = (this._obj = owner.collection).size;
    }
    getValue() {
        return this._obj.size;
    }
    setValue() {
        throw createMappedError(220 /* ErrorNames.assign_readonly_size */);
    }
    handleCollectionChange(_collection, _) {
        const oldValue = this._value;
        const value = this._obj.size;
        if ((this._value = value) !== oldValue) {
            this.subs.notify(this._value, oldValue);
        }
    }
}
function implementLengthObserver(klass) {
    const proto = klass.prototype;
    ensureProto(proto, 'subscribe', subscribe);
    ensureProto(proto, 'unsubscribe', unsubscribe);
    subscriberCollection(klass);
}
function subscribe(subscriber) {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
        this.owner.subscribe(this);
    }
}
function unsubscribe(subscriber) {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
        this.owner.subscribe(this);
    }
}
implementLengthObserver(CollectionLengthObserver);
implementLengthObserver(CollectionSizeObserver);

// multiple applications of Aurelia wouldn't have different observers for the same Array object
const lookupMetadataKey$2 = Symbol.for('__au_arr_obs__');
const observerLookup$2 = (Array[lookupMetadataKey$2]
    ?? defineHiddenProp(Array, lookupMetadataKey$2, new WeakMap()));
// https://tc39.github.io/ecma262/#sec-sortcompare
function sortCompare(x, y) {
    if (x === y) {
        return 0;
    }
    x = x === null ? 'null' : x.toString();
    y = y === null ? 'null' : y.toString();
    return x < y ? -1 : 1;
}
function preSortCompare(x, y) {
    if (x === void 0) {
        if (y === void 0) {
            return 0;
        }
        else {
            return 1;
        }
    }
    if (y === void 0) {
        return -1;
    }
    return 0;
}
function insertionSort(arr, indexMap, from, to, compareFn) {
    let velement, ielement, vtmp, itmp, order;
    let i, j;
    for (i = from + 1; i < to; i++) {
        velement = arr[i];
        ielement = indexMap[i];
        for (j = i - 1; j >= from; j--) {
            vtmp = arr[j];
            itmp = indexMap[j];
            order = compareFn(vtmp, velement);
            if (order > 0) {
                arr[j + 1] = vtmp;
                indexMap[j + 1] = itmp;
            }
            else {
                break;
            }
        }
        arr[j + 1] = velement;
        indexMap[j + 1] = ielement;
    }
}
function quickSort(arr, indexMap, from, to, compareFn) {
    let thirdIndex = 0, i = 0;
    let v0, v1, v2;
    let i0, i1, i2;
    let c01, c02, c12;
    let vtmp, itmp;
    let vpivot, ipivot, lowEnd, highStart;
    let velement, ielement, order, vtopElement;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        if (to - from <= 10) {
            insertionSort(arr, indexMap, from, to, compareFn);
            return;
        }
        thirdIndex = from + ((to - from) >> 1);
        v0 = arr[from];
        i0 = indexMap[from];
        v1 = arr[to - 1];
        i1 = indexMap[to - 1];
        v2 = arr[thirdIndex];
        i2 = indexMap[thirdIndex];
        c01 = compareFn(v0, v1);
        if (c01 > 0) {
            vtmp = v0;
            itmp = i0;
            v0 = v1;
            i0 = i1;
            v1 = vtmp;
            i1 = itmp;
        }
        c02 = compareFn(v0, v2);
        if (c02 >= 0) {
            vtmp = v0;
            itmp = i0;
            v0 = v2;
            i0 = i2;
            v2 = v1;
            i2 = i1;
            v1 = vtmp;
            i1 = itmp;
        }
        else {
            c12 = compareFn(v1, v2);
            if (c12 > 0) {
                vtmp = v1;
                itmp = i1;
                v1 = v2;
                i1 = i2;
                v2 = vtmp;
                i2 = itmp;
            }
        }
        arr[from] = v0;
        indexMap[from] = i0;
        arr[to - 1] = v2;
        indexMap[to - 1] = i2;
        vpivot = v1;
        ipivot = i1;
        lowEnd = from + 1;
        highStart = to - 1;
        arr[thirdIndex] = arr[lowEnd];
        indexMap[thirdIndex] = indexMap[lowEnd];
        arr[lowEnd] = vpivot;
        indexMap[lowEnd] = ipivot;
        partition: for (i = lowEnd + 1; i < highStart; i++) {
            velement = arr[i];
            ielement = indexMap[i];
            order = compareFn(velement, vpivot);
            if (order < 0) {
                arr[i] = arr[lowEnd];
                indexMap[i] = indexMap[lowEnd];
                arr[lowEnd] = velement;
                indexMap[lowEnd] = ielement;
                lowEnd++;
            }
            else if (order > 0) {
                do {
                    highStart--;
                    // eslint-disable-next-line eqeqeq
                    if (highStart == i) {
                        break partition;
                    }
                    vtopElement = arr[highStart];
                    order = compareFn(vtopElement, vpivot);
                } while (order > 0);
                arr[i] = arr[highStart];
                indexMap[i] = indexMap[highStart];
                arr[highStart] = velement;
                indexMap[highStart] = ielement;
                if (order < 0) {
                    velement = arr[i];
                    ielement = indexMap[i];
                    arr[i] = arr[lowEnd];
                    indexMap[i] = indexMap[lowEnd];
                    arr[lowEnd] = velement;
                    indexMap[lowEnd] = ielement;
                    lowEnd++;
                }
            }
        }
        if (to - highStart < lowEnd - from) {
            quickSort(arr, indexMap, highStart, to, compareFn);
            to = lowEnd;
        }
        else {
            quickSort(arr, indexMap, from, lowEnd, compareFn);
            from = highStart;
        }
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proto$2 = Array.prototype;
const methods$2 = ['push', 'unshift', 'pop', 'shift', 'splice', 'reverse', 'sort'];
let observe$3;
let native$2;
function overrideArrayPrototypes() {
    const $push = proto$2.push;
    const $unshift = proto$2.unshift;
    const $pop = proto$2.pop;
    const $shift = proto$2.shift;
    const $splice = proto$2.splice;
    const $reverse = proto$2.reverse;
    const $sort = proto$2.sort;
    native$2 = { push: $push, unshift: $unshift, pop: $pop, shift: $shift, splice: $splice, reverse: $reverse, sort: $sort };
    observe$3 = {
        // https://tc39.github.io/ecma262/#sec-array.prototype.push
        push: function (...args) {
            const o = observerLookup$2.get(this);
            if (o === void 0) {
                return $push.apply(this, args);
            }
            const len = this.length;
            const argCount = args.length;
            if (argCount === 0) {
                return len;
            }
            this.length = o.indexMap.length = len + argCount;
            let i = len;
            while (i < this.length) {
                this[i] = args[i - len];
                o.indexMap[i] = -2;
                i++;
            }
            o.notify();
            return this.length;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
        unshift: function (...args) {
            const o = observerLookup$2.get(this);
            if (o === void 0) {
                return $unshift.apply(this, args);
            }
            const argCount = args.length;
            const inserts = new Array(argCount);
            let i = 0;
            while (i < argCount) {
                inserts[i++] = -2;
            }
            $unshift.apply(o.indexMap, inserts);
            const len = $unshift.apply(this, args);
            o.notify();
            return len;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.pop
        pop: function () {
            const o = observerLookup$2.get(this);
            if (o === void 0) {
                return $pop.call(this);
            }
            const indexMap = o.indexMap;
            const element = $pop.call(this);
            // only mark indices as deleted if they actually existed in the original array
            const index = indexMap.length - 1;
            if (indexMap[index] > -1) {
                indexMap.deletedIndices.push(indexMap[index]);
                indexMap.deletedItems.push(element);
            }
            $pop.call(indexMap);
            o.notify();
            return element;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.shift
        shift: function () {
            const o = observerLookup$2.get(this);
            if (o === void 0) {
                return $shift.call(this);
            }
            const indexMap = o.indexMap;
            const element = $shift.call(this);
            // only mark indices as deleted if they actually existed in the original array
            if (indexMap[0] > -1) {
                indexMap.deletedIndices.push(indexMap[0]);
                indexMap.deletedItems.push(element);
            }
            $shift.call(indexMap);
            o.notify();
            return element;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.splice
        splice: function (...args) {
            const start = args[0];
            const deleteCount = args[1];
            const o = observerLookup$2.get(this);
            if (o === void 0) {
                return $splice.apply(this, args);
            }
            const len = this.length;
            const relativeStart = start | 0;
            const actualStart = relativeStart < 0 ? Math.max((len + relativeStart), 0) : Math.min(relativeStart, len);
            const indexMap = o.indexMap;
            const argCount = args.length;
            const actualDeleteCount = argCount === 0 ? 0 : argCount === 1 ? len - actualStart : deleteCount;
            let i = actualStart;
            if (actualDeleteCount > 0) {
                const to = i + actualDeleteCount;
                while (i < to) {
                    // only mark indices as deleted if they actually existed in the original array
                    if (indexMap[i] > -1) {
                        indexMap.deletedIndices.push(indexMap[i]);
                        indexMap.deletedItems.push(this[i]);
                    }
                    i++;
                }
            }
            i = 0;
            if (argCount > 2) {
                const itemCount = argCount - 2;
                const inserts = new Array(itemCount);
                while (i < itemCount) {
                    inserts[i++] = -2;
                }
                $splice.call(indexMap, start, deleteCount, ...inserts);
            }
            else {
                $splice.apply(indexMap, args);
            }
            const deleted = $splice.apply(this, args);
            // only notify when there's deletion, or addition
            if (actualDeleteCount > 0 || i > 0) {
                o.notify();
            }
            return deleted;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
        reverse: function () {
            const o = observerLookup$2.get(this);
            if (o === void 0) {
                $reverse.call(this);
                return this;
            }
            const len = this.length;
            const middle = (len / 2) | 0;
            let lower = 0;
            while (lower !== middle) {
                const upper = len - lower - 1;
                const lowerValue = this[lower];
                const lowerIndex = o.indexMap[lower];
                const upperValue = this[upper];
                const upperIndex = o.indexMap[upper];
                this[lower] = upperValue;
                o.indexMap[lower] = upperIndex;
                this[upper] = lowerValue;
                o.indexMap[upper] = lowerIndex;
                lower++;
            }
            o.notify();
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-array.prototype.sort
        // https://github.com/v8/v8/blob/master/src/js/array.js
        sort: function (compareFn) {
            const o = observerLookup$2.get(this);
            if (o === void 0) {
                $sort.call(this, compareFn);
                return this;
            }
            let len = this.length;
            if (len < 2) {
                return this;
            }
            quickSort(this, o.indexMap, 0, len, preSortCompare);
            let i = 0;
            while (i < len) {
                if (this[i] === void 0) {
                    break;
                }
                i++;
            }
            if (compareFn === void 0 || !isFunction(compareFn) /* spec says throw a TypeError, should we do that too? */) {
                compareFn = sortCompare;
            }
            quickSort(this, o.indexMap, 0, i, compareFn);
            // todo(fred): it shouldn't notify if the sort produce a stable array:
            //             where every item has the same index before/after
            //             though this is inefficient we loop a few times like this
            let shouldNotify = false;
            for (i = 0, len = o.indexMap.length; len > i; ++i) {
                if (o.indexMap[i] !== i) {
                    shouldNotify = true;
                    break;
                }
            }
            if (shouldNotify || batching) {
                o.notify();
            }
            return this;
        }
    };
    for (const method of methods$2) {
        def(observe$3[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
}
let enableArrayObservationCalled = false;
const observationEnabledKey$2 = '__au_arr_on__';
function enableArrayObservation() {
    if (observe$3 === undefined) {
        overrideArrayPrototypes();
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!(getOwnMetadata(observationEnabledKey$2, Array) ?? false)) {
        defineMetadata(observationEnabledKey$2, true, Array);
        for (const method of methods$2) {
            if (proto$2[method].observing !== true) {
                defineHiddenProp(proto$2, method, observe$3[method]);
            }
        }
    }
}
function disableArrayObservation() {
    for (const method of methods$2) {
        if (proto$2[method].observing === true) {
            defineHiddenProp(proto$2, method, native$2[method]);
        }
    }
}
class ArrayObserver {
    constructor(array) {
        this.type = atObserver;
        if (!enableArrayObservationCalled) {
            enableArrayObservationCalled = true;
            enableArrayObservation();
        }
        this.indexObservers = {};
        this.collection = array;
        this.indexMap = createIndexMap(array.length);
        this.lenObs = void 0;
        observerLookup$2.set(array, this);
    }
    notify() {
        const subs = this.subs;
        const indexMap = this.indexMap;
        if (batching) {
            addCollectionBatch(subs, this.collection, indexMap);
            return;
        }
        const arr = this.collection;
        const length = arr.length;
        this.indexMap = createIndexMap(length);
        this.subs.notifyCollection(arr, indexMap);
    }
    getLengthObserver() {
        return this.lenObs ??= new CollectionLengthObserver(this);
    }
    getIndexObserver(index) {
        // It's unnecessary to destroy/recreate index observer all the time,
        // so just create once, and add/remove instead
        return this.indexObservers[index] ??= new ArrayIndexObserver(this, index);
    }
}
class ArrayIndexObserver {
    constructor(owner, index) {
        this.owner = owner;
        this.index = index;
        this.doNotCache = true;
        this.value = this.getValue();
    }
    getValue() {
        return this.owner.collection[this.index];
    }
    setValue(newValue) {
        if (newValue === this.getValue()) {
            return;
        }
        const arrayObserver = this.owner;
        const index = this.index;
        const indexMap = arrayObserver.indexMap;
        if (indexMap[index] > -1) {
            indexMap.deletedIndices.push(indexMap[index]);
        }
        indexMap[index] = -2;
        // do not need to update current value here
        // as it will be updated inside handle collection change
        arrayObserver.collection[index] = newValue;
        arrayObserver.notify();
    }
    /**
     * From interface `ICollectionSubscriber`
     */
    handleCollectionChange(_arr, indexMap) {
        const index = this.index;
        const noChange = indexMap[index] === index;
        if (noChange) {
            return;
        }
        const prevValue = this.value;
        const currValue = this.value = this.getValue();
        // hmm
        if (prevValue !== currValue) {
            this.subs.notify(currValue, prevValue);
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.owner.subscribe(this);
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.owner.unsubscribe(this);
        }
    }
}
subscriberCollection(ArrayObserver);
subscriberCollection(ArrayIndexObserver);
function getArrayObserver(array) {
    let observer = observerLookup$2.get(array);
    if (observer === void 0) {
        observer = new ArrayObserver(array);
    }
    return observer;
}

// multiple applications of Aurelia wouldn't have different observers for the same Set object
const lookupMetadataKey$1 = Symbol.for('__au_set_obs__');
const observerLookup$1 = (Set[lookupMetadataKey$1]
    ?? defineHiddenProp(Set, lookupMetadataKey$1, new WeakMap()));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proto$1 = Set.prototype;
const $add = proto$1.add;
const $clear$1 = proto$1.clear;
const $delete$1 = proto$1.delete;
const native$1 = { add: $add, clear: $clear$1, delete: $delete$1 };
const methods$1 = ['add', 'clear', 'delete'];
// note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
// fortunately, add/delete/clear are easy to reconstruct for the indexMap
const observe$2 = {
    // https://tc39.github.io/ecma262/#sec-set.prototype.add
    add: function (value) {
        const o = observerLookup$1.get(this);
        if (o === undefined) {
            $add.call(this, value);
            return this;
        }
        const oldSize = this.size;
        $add.call(this, value);
        const newSize = this.size;
        if (newSize === oldSize) {
            return this;
        }
        o.indexMap[oldSize] = -2;
        o.notify();
        return this;
    },
    // https://tc39.github.io/ecma262/#sec-set.prototype.clear
    clear: function () {
        const o = observerLookup$1.get(this);
        if (o === undefined) {
            return $clear$1.call(this);
        }
        const size = this.size;
        if (size > 0) {
            const indexMap = o.indexMap;
            let i = 0;
            // deepscan-disable-next-line
            for (const key of this.keys()) {
                if (indexMap[i] > -1) {
                    indexMap.deletedIndices.push(indexMap[i]);
                    indexMap.deletedItems.push(key);
                }
                i++;
            }
            $clear$1.call(this);
            indexMap.length = 0;
            o.notify();
        }
        return undefined;
    },
    // https://tc39.github.io/ecma262/#sec-set.prototype.delete
    delete: function (value) {
        const o = observerLookup$1.get(this);
        if (o === undefined) {
            return $delete$1.call(this, value);
        }
        const size = this.size;
        if (size === 0) {
            return false;
        }
        let i = 0;
        const indexMap = o.indexMap;
        for (const entry of this.keys()) {
            if (entry === value) {
                if (indexMap[i] > -1) {
                    indexMap.deletedIndices.push(indexMap[i]);
                    indexMap.deletedItems.push(entry);
                }
                indexMap.splice(i, 1);
                const deleteResult = $delete$1.call(this, value);
                if (deleteResult === true) {
                    o.notify();
                }
                return deleteResult;
            }
            i++;
        }
        return false;
    }
};
const descriptorProps$1 = {
    writable: true,
    enumerable: false,
    configurable: true
};
for (const method of methods$1) {
    def(observe$2[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}
let enableSetObservationCalled = false;
const observationEnabledKey$1 = '__au_set_on__';
function enableSetObservation() {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!(getOwnMetadata(observationEnabledKey$1, Set) ?? false)) {
        defineMetadata(observationEnabledKey$1, true, Set);
        for (const method of methods$1) {
            if (proto$1[method].observing !== true) {
                def(proto$1, method, { ...descriptorProps$1, value: observe$2[method] });
            }
        }
    }
}
function disableSetObservation() {
    for (const method of methods$1) {
        if (proto$1[method].observing === true) {
            def(proto$1, method, { ...descriptorProps$1, value: native$1[method] });
        }
    }
}
class SetObserver {
    constructor(observedSet) {
        this.type = atObserver;
        if (!enableSetObservationCalled) {
            enableSetObservationCalled = true;
            enableSetObservation();
        }
        this.collection = observedSet;
        this.indexMap = createIndexMap(observedSet.size);
        this.lenObs = void 0;
        observerLookup$1.set(observedSet, this);
    }
    notify() {
        const subs = this.subs;
        const indexMap = this.indexMap;
        if (batching) {
            addCollectionBatch(subs, this.collection, indexMap);
            return;
        }
        const set = this.collection;
        const size = set.size;
        this.indexMap = createIndexMap(size);
        this.subs.notifyCollection(set, indexMap);
    }
    getLengthObserver() {
        return this.lenObs ??= new CollectionSizeObserver(this);
    }
}
subscriberCollection(SetObserver);
function getSetObserver(observedSet) {
    let observer = observerLookup$1.get(observedSet);
    if (observer === void 0) {
        observer = new SetObserver(observedSet);
    }
    return observer;
}

// multiple applications of Aurelia wouldn't have different observers for the same Map object
const lookupMetadataKey = Symbol.for('__au_map_obs__');
const observerLookup = (Map[lookupMetadataKey]
    ?? defineHiddenProp(Map, lookupMetadataKey, new WeakMap()));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proto = Map.prototype;
const $set = proto.set;
const $clear = proto.clear;
const $delete = proto.delete;
const native = { set: $set, clear: $clear, delete: $delete };
const methods = ['set', 'clear', 'delete'];
// note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
// fortunately, map/delete/clear are easy to reconstruct for the indexMap
const observe$1 = {
    // https://tc39.github.io/ecma262/#sec-map.prototype.map
    set: function (key, value) {
        const o = observerLookup.get(this);
        if (o === undefined) {
            $set.call(this, key, value);
            return this;
        }
        const oldValue = this.get(key);
        const oldSize = this.size;
        $set.call(this, key, value);
        const newSize = this.size;
        if (newSize === oldSize) {
            let i = 0;
            for (const entry of this.entries()) {
                if (entry[0] === key) {
                    if (entry[1] !== oldValue) {
                        o.indexMap.deletedIndices.push(o.indexMap[i]);
                        o.indexMap.deletedItems.push(entry);
                        o.indexMap[i] = -2;
                        o.notify();
                    }
                    return this;
                }
                i++;
            }
            return this;
        }
        o.indexMap[oldSize] = -2;
        o.notify();
        return this;
    },
    // https://tc39.github.io/ecma262/#sec-map.prototype.clear
    clear: function () {
        const o = observerLookup.get(this);
        if (o === undefined) {
            return $clear.call(this);
        }
        const size = this.size;
        if (size > 0) {
            const indexMap = o.indexMap;
            let i = 0;
            // deepscan-disable-next-line
            for (const key of this.keys()) {
                if (indexMap[i] > -1) {
                    indexMap.deletedIndices.push(indexMap[i]);
                    indexMap.deletedItems.push(key);
                }
                i++;
            }
            $clear.call(this);
            indexMap.length = 0;
            o.notify();
        }
        return undefined;
    },
    // https://tc39.github.io/ecma262/#sec-map.prototype.delete
    delete: function (value) {
        const o = observerLookup.get(this);
        if (o === undefined) {
            return $delete.call(this, value);
        }
        const size = this.size;
        if (size === 0) {
            return false;
        }
        let i = 0;
        const indexMap = o.indexMap;
        for (const entry of this.keys()) {
            if (entry === value) {
                if (indexMap[i] > -1) {
                    indexMap.deletedIndices.push(indexMap[i]);
                    indexMap.deletedItems.push(entry);
                }
                indexMap.splice(i, 1);
                const deleteResult = $delete.call(this, value);
                if (deleteResult === true) {
                    o.notify();
                }
                return deleteResult;
            }
            ++i;
        }
        return false;
    }
};
const descriptorProps = {
    writable: true,
    enumerable: false,
    configurable: true
};
for (const method of methods) {
    def(observe$1[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}
let enableMapObservationCalled = false;
const observationEnabledKey = '__au_map_on__';
function enableMapObservation() {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!(getOwnMetadata(observationEnabledKey, Map) ?? false)) {
        defineMetadata(observationEnabledKey, true, Map);
        for (const method of methods) {
            if (proto[method].observing !== true) {
                def(proto, method, { ...descriptorProps, value: observe$1[method] });
            }
        }
    }
}
function disableMapObservation() {
    for (const method of methods) {
        if (proto[method].observing === true) {
            def(proto, method, { ...descriptorProps, value: native[method] });
        }
    }
}
class MapObserver {
    constructor(map) {
        this.type = atObserver;
        if (!enableMapObservationCalled) {
            enableMapObservationCalled = true;
            enableMapObservation();
        }
        this.collection = map;
        this.indexMap = createIndexMap(map.size);
        this.lenObs = void 0;
        observerLookup.set(map, this);
    }
    notify() {
        const subs = this.subs;
        const indexMap = this.indexMap;
        if (batching) {
            addCollectionBatch(subs, this.collection, indexMap);
            return;
        }
        const map = this.collection;
        const size = map.size;
        this.indexMap = createIndexMap(size);
        subs.notifyCollection(map, indexMap);
    }
    getLengthObserver() {
        return this.lenObs ??= new CollectionSizeObserver(this);
    }
}
subscriberCollection(MapObserver);
function getMapObserver(map) {
    let observer = observerLookup.get(map);
    if (observer === void 0) {
        observer = new MapObserver(map);
    }
    return observer;
}

function getObserverRecord() {
    return defineHiddenProp(this, 'obs', new BindingObserverRecord(this));
}
function observe(obj, key) {
    this.obs.add(this.oL.getObserver(obj, key));
}
function observeCollection$1(collection) {
    let obs;
    if (isArray(collection)) {
        obs = getArrayObserver(collection);
    }
    else if (isSet(collection)) {
        obs = getSetObserver(collection);
    }
    else if (isMap(collection)) {
        obs = getMapObserver(collection);
    }
    else {
        throw createMappedError(210 /* ErrorNames.non_recognisable_collection_type */, collection);
    }
    this.obs.add(obs);
}
function subscribeTo(subscribable) {
    this.obs.add(subscribable);
}
function noopHandleChange() {
    throw createMappedError(99 /* ErrorNames.method_not_implemented */, 'handleChange');
}
function noopHandleCollectionChange() {
    throw createMappedError(99 /* ErrorNames.method_not_implemented */, 'handleCollectionChange');
}
class BindingObserverRecord {
    constructor(b) {
        this.version = 0;
        this.count = 0;
        // a map of the observers (subscribables) that the owning binding of this record
        // is currently subscribing to. The values are the version of the observers,
        // as the observers version may need to be changed during different evaluation
        /** @internal */
        this.o = new Map();
        this.b = b;
    }
    /**
     * Add, and subscribe to a given observer
     */
    add(observer) {
        if (!this.o.has(observer)) {
            observer.subscribe(this.b);
            ++this.count;
        }
        this.o.set(observer, this.version);
    }
    /**
     * Unsubscribe the observers that are not up to date with the record version
     */
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
function unsubscribeAll(version, subscribable) {
    subscribable.unsubscribe(this.b);
}
function unsubscribeStale(version, subscribable) {
    if (this.version !== version) {
        subscribable.unsubscribe(this.b);
        this.o.delete(subscribable);
    }
}
function connectableDecorator(target) {
    const proto = target.prototype;
    ensureProto(proto, 'observe', observe);
    ensureProto(proto, 'observeCollection', observeCollection$1);
    ensureProto(proto, 'subscribeTo', subscribeTo);
    def(proto, 'obs', { get: getObserverRecord });
    // optionally add these two methods to normalize a connectable impl
    // though don't override if it already exists
    ensureProto(proto, 'handleChange', noopHandleChange);
    ensureProto(proto, 'handleCollectionChange', noopHandleCollectionChange);
    return target;
}
function connectable(target) {
    return target == null ? connectableDecorator : connectableDecorator(target);
}

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
const IExpressionParser = createInterface('IExpressionParser', x => x.singleton(ExpressionParser));
class ExpressionParser {
    constructor() {
        /** @internal */ this._expressionLookup = createLookup();
        /** @internal */ this._forOfLookup = createLookup();
        /** @internal */ this._interpolationLookup = createLookup();
    }
    parse(expression, expressionType) {
        let found;
        switch (expressionType) {
            case etIsCustom:
                return new CustomExpression(expression);
            case etInterpolation:
                found = this._interpolationLookup[expression];
                if (found === void 0) {
                    found = this._interpolationLookup[expression] = this.$parse(expression, expressionType);
                }
                return found;
            case etIsIterator:
                found = this._forOfLookup[expression];
                if (found === void 0) {
                    found = this._forOfLookup[expression] = this.$parse(expression, expressionType);
                }
                return found;
            default: {
                if (expression.length === 0) {
                    if (expressionType === etIsFunction || expressionType === etIsProperty) {
                        return PrimitiveLiteralExpression.$empty;
                    }
                    throw invalidEmptyExpression();
                }
                found = this._expressionLookup[expression];
                if (found === void 0) {
                    found = this._expressionLookup[expression] = this.$parse(expression, expressionType);
                }
                return found;
            }
        }
    }
    /** @internal */
    $parse(expression, expressionType) {
        $input = expression;
        $index = 0;
        $length = expression.length;
        $scopeDepth = 0;
        $startIndex = 0;
        $currentToken = 6291456 /* Token.EOF */;
        $tokenValue = '';
        $currentChar = $charCodeAt(0);
        $assignable = true;
        $optional = false;
        $accessGlobal = true;
        $semicolonIndex = -1;
        return parse(61 /* Precedence.Variadic */, expressionType === void 0 ? etIsProperty : expressionType);
    }
}

function unescapeCode(code) {
    switch (code) {
        case 98 /* Char.LowerB */: return 8 /* Char.Backspace */;
        case 116 /* Char.LowerT */: return 9 /* Char.Tab */;
        case 110 /* Char.LowerN */: return 10 /* Char.LineFeed */;
        case 118 /* Char.LowerV */: return 11 /* Char.VerticalTab */;
        case 102 /* Char.LowerF */: return 12 /* Char.FormFeed */;
        case 114 /* Char.LowerR */: return 13 /* Char.CarriageReturn */;
        case 34 /* Char.DoubleQuote */: return 34 /* Char.DoubleQuote */;
        case 39 /* Char.SingleQuote */: return 39 /* Char.SingleQuote */;
        case 92 /* Char.Backslash */: return 92 /* Char.Backslash */;
        default: return code;
    }
}


const $false = PrimitiveLiteralExpression.$false;
const $true = PrimitiveLiteralExpression.$true;
const $null = PrimitiveLiteralExpression.$null;
const $undefined = PrimitiveLiteralExpression.$undefined;
const $this = new AccessThisExpression(0);
const $parent = new AccessThisExpression(1);
const boundary = new AccessBoundaryExpression();
const etNone = 'None';
const etInterpolation = 'Interpolation';
const etIsIterator = 'IsIterator';
const etIsChainable = 'IsChainable';
const etIsFunction = 'IsFunction';
const etIsProperty = 'IsProperty';
const etIsCustom = 'IsCustom';
let $input = '';
let $index = 0;
let $length = 0;
let $scopeDepth = 0;
let $startIndex = 0;
let $currentToken = 6291456 /* Token.EOF */;
let $tokenValue = '';
let $currentChar;
let $assignable = true;
let $optional = false;
let $accessGlobal = true;
let $semicolonIndex = -1;
const stringFromCharCode = String.fromCharCode;
const $charCodeAt = (index) => $input.charCodeAt(index);
const $tokenRaw = () => $input.slice($startIndex, $index);
const globalNames = ('Infinity NaN isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent' +
    ' Array BigInt Boolean Date Map Number Object RegExp Set String JSON Math Intl').split(' ');
function parseExpression(input, expressionType) {
    $input = input;
    $index = 0;
    $length = input.length;
    $scopeDepth = 0;
    $startIndex = 0;
    $currentToken = 6291456 /* Token.EOF */;
    $tokenValue = '';
    $currentChar = $charCodeAt(0);
    $assignable = true;
    $optional = false;
    $accessGlobal = true;
    $semicolonIndex = -1;
    return parse(61 /* Precedence.Variadic */, expressionType === void 0 ? etIsProperty : expressionType);
}
// This is performance-critical code which follows a subset of the well-known ES spec.
// Knowing the spec, or parsers in general, will help with understanding this code and it is therefore not the
// single source of information for being able to figure it out.
// It generally does not need to change unless the spec changes or spec violations are found, or optimization
// opportunities are found (which would likely not fix these warnings in any case).
// It's therefore not considered to have any tangible impact on the maintainability of the code base.
// For reference, most of the parsing logic is based on: https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions
// eslint-disable-next-line max-lines-per-function
function parse(minPrecedence, expressionType) {
    if (expressionType === etIsCustom) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new CustomExpression($input);
    }
    if ($index === 0) {
        if (expressionType === etInterpolation) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return parseInterpolation();
        }
        nextToken();
        if ($currentToken & 4194304 /* Token.ExpressionTerminal */) {
            throw invalidStartOfExpression();
        }
    }
    $assignable = 513 /* Precedence.Binary */ > minPrecedence;
    $optional = false;
    $accessGlobal = 514 /* Precedence.LeftHandSide */ > minPrecedence;
    let optionalThisTail = false;
    let result = void 0;
    let ancestor = 0;
    if ($currentToken & 131072 /* Token.UnaryOp */) {
        /**
         * parseUnaryExpression
         *
         * https://tc39.github.io/ecma262/#sec-unary-operators
         *
         * UnaryExpression :
         * 1. LeftHandSideExpression
         * 2. void UnaryExpression
         * 3. typeof UnaryExpression
         * 4. + UnaryExpression
         * 5. - UnaryExpression
         * 6. ! UnaryExpression
         *
         * IsValidAssignmentTarget
         * 2,3,4,5,6 = false
         * 1 = see parseLeftHandSideExpression
         *
         * Note: technically we should throw on ++ / -- / +++ / ---, but there's nothing to gain from that
         */
        const op = TokenValues[$currentToken & 63 /* Token.Type */];
        nextToken();
        result = new UnaryExpression(op, parse(514 /* Precedence.LeftHandSide */, expressionType));
        $assignable = false;
    }
    else {
        /**
         * parsePrimaryExpression
         *
         * https://tc39.github.io/ecma262/#sec-primary-expression
         *
         * PrimaryExpression :
         * 1. this
         * 2. IdentifierName
         * 3. Literal
         * 4. ArrayLiteralExpression
         * 5. ObjectLiteralExpression
         * 6. TemplateLiteral
         * 7. ParenthesizedExpression
         *
         * Literal :
         * NullLiteral
         * BooleanLiteral
         * NumericLiteral
         * StringLiteral
         *
         * ParenthesizedExpression :
         * ( AssignmentExpression )
         *
         * IsValidAssignmentTarget
         * 1,3,4,5,6,7 = false
         * 2 = true
         */
        primary: switch ($currentToken) {
            case 12295 /* Token.ParentScope */: // $parent
                ancestor = $scopeDepth;
                $assignable = false;
                $accessGlobal = false;
                do {
                    nextToken();
                    ++ancestor;
                    switch ($currentToken) {
                        case 65546 /* Token.Dot */:
                            nextToken();
                            if (($currentToken & 12288 /* Token.IdentifierName */) === 0) {
                                throw expectedIdentifier();
                            }
                            break;
                        case 11 /* Token.DotDot */:
                        case 12 /* Token.DotDotDot */:
                            throw expectedIdentifier();
                        case 2162701 /* Token.QuestionDot */:
                            $optional = true;
                            nextToken();
                            if (($currentToken & 12288 /* Token.IdentifierName */) === 0) {
                                result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThisExpression(ancestor);
                                optionalThisTail = true;
                                break primary;
                            }
                            break;
                        default:
                            if ($currentToken & 2097152 /* Token.AccessScopeTerminal */) {
                                result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThisExpression(ancestor);
                                break primary;
                            }
                            throw invalidMemberExpression();
                    }
                } while ($currentToken === 12295 /* Token.ParentScope */);
            // falls through
            case 4096 /* Token.Identifier */: { // identifier
                const id = $tokenValue;
                if (expressionType === etIsIterator) {
                    result = new BindingIdentifier(id);
                }
                else if ($accessGlobal && globalNames.includes(id)) {
                    result = new AccessGlobalExpression(id);
                }
                else if ($accessGlobal && id === 'import') {
                    throw unexpectedImportKeyword();
                }
                else {
                    result = new AccessScopeExpression(id, ancestor);
                }
                $assignable = !$optional;
                nextToken();
                if (consumeOpt(51 /* Token.Arrow */)) {
                    if ($currentToken === 524297 /* Token.OpenBrace */) {
                        throw functionBodyInArrowFn();
                    }
                    const _optional = $optional;
                    const _scopeDepth = $scopeDepth;
                    ++$scopeDepth;
                    const body = parse(62 /* Precedence.Assign */, etNone);
                    $optional = _optional;
                    $scopeDepth = _scopeDepth;
                    $assignable = false;
                    result = new ArrowFunction([new BindingIdentifier(id)], body);
                }
                break;
            }
            case 11 /* Token.DotDot */:
                throw unexpectedDoubleDot();
            case 12 /* Token.DotDotDot */:
                throw invalidSpreadOp();
            case 12292 /* Token.ThisScope */: // $this
                $assignable = false;
                nextToken();
                switch ($scopeDepth) {
                    case 0:
                        result = $this;
                        break;
                    case 1:
                        result = $parent;
                        break;
                    default:
                        result = new AccessThisExpression($scopeDepth);
                        break;
                }
                break;
            case 12293 /* Token.AccessBoundary */: // this
                $assignable = false;
                nextToken();
                result = boundary;
                break;
            case 2688008 /* Token.OpenParen */:
                result = parseCoverParenthesizedExpressionAndArrowParameterList(expressionType);
                break;
            case 2688019 /* Token.OpenBracket */:
                result = $input.search(/\s+of\s+/) > $index ? parseArrayDestructuring() : parseArrayLiteralExpression(expressionType);
                break;
            case 524297 /* Token.OpenBrace */:
                result = parseObjectLiteralExpression(expressionType);
                break;
            case 2163760 /* Token.TemplateTail */:
                result = new TemplateExpression([$tokenValue]);
                $assignable = false;
                nextToken();
                break;
            case 2163761 /* Token.TemplateContinuation */:
                result = parseTemplate(expressionType, result, false);
                break;
            case 16384 /* Token.StringLiteral */:
            case 32768 /* Token.NumericLiteral */:
                result = new PrimitiveLiteralExpression($tokenValue);
                $assignable = false;
                nextToken();
                break;
            case 8194 /* Token.NullKeyword */:
            case 8195 /* Token.UndefinedKeyword */:
            case 8193 /* Token.TrueKeyword */:
            case 8192 /* Token.FalseKeyword */:
                result = TokenValues[$currentToken & 63 /* Token.Type */];
                $assignable = false;
                nextToken();
                break;
            default:
                if ($index >= $length) {
                    throw unexpectedEndOfExpression();
                }
                else {
                    throw unconsumedToken();
                }
        }
        if (expressionType === etIsIterator) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return parseForOfStatement(result);
        }
        if (514 /* Precedence.LeftHandSide */ < minPrecedence) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result;
        }
        if ($currentToken === 11 /* Token.DotDot */ || $currentToken === 12 /* Token.DotDotDot */) {
            throw expectedIdentifier();
        }
        if (result.$kind === ekAccessThis) {
            switch ($currentToken) {
                case 2162701 /* Token.QuestionDot */:
                    $optional = true;
                    $assignable = false;
                    nextToken();
                    if (($currentToken & 13312 /* Token.OptionalSuffix */) === 0) {
                        throw unexpectedTokenInOptionalChain();
                    }
                    if ($currentToken & 12288 /* Token.IdentifierName */) {
                        result = new AccessScopeExpression($tokenValue, result.ancestor);
                        nextToken();
                    }
                    else if ($currentToken === 2688008 /* Token.OpenParen */) {
                        result = new CallFunctionExpression(result, parseArguments(), true);
                    }
                    else if ($currentToken === 2688019 /* Token.OpenBracket */) {
                        result = parseKeyedExpression(result, true);
                    }
                    else {
                        throw invalidTaggedTemplateOnOptionalChain();
                    }
                    break;
                case 65546 /* Token.Dot */:
                    $assignable = !$optional;
                    nextToken();
                    if (($currentToken & 12288 /* Token.IdentifierName */) === 0) {
                        throw expectedIdentifier();
                    }
                    result = new AccessScopeExpression($tokenValue, result.ancestor);
                    nextToken();
                    break;
                case 11 /* Token.DotDot */:
                case 12 /* Token.DotDotDot */:
                    throw expectedIdentifier();
                case 2688008 /* Token.OpenParen */:
                    result = new CallFunctionExpression(result, parseArguments(), optionalThisTail);
                    break;
                case 2688019 /* Token.OpenBracket */:
                    result = parseKeyedExpression(result, optionalThisTail);
                    break;
                case 2163760 /* Token.TemplateTail */:
                    result = createTemplateTail(result);
                    break;
                case 2163761 /* Token.TemplateContinuation */:
                    result = parseTemplate(expressionType, result, true);
                    break;
            }
        }
        /**
         * parseMemberExpression (Token.Dot, Token.OpenBracket, Token.TemplateContinuation)
         *
         * MemberExpression :
         * 1. PrimaryExpression
         * 2. MemberExpression [ AssignmentExpression ]
         * 3. MemberExpression . IdentifierName
         * 4. MemberExpression TemplateLiteral
         *
         * IsValidAssignmentTarget
         * 1,4 = false
         * 2,3 = true
         *
         *
         * parseCallExpression (Token.OpenParen)
         * CallExpression :
         * 1. MemberExpression Arguments
         * 2. CallExpression Arguments
         * 3. CallExpression [ AssignmentExpression ]
         * 4. CallExpression . IdentifierName
         * 5. CallExpression TemplateLiteral
         *
         * IsValidAssignmentTarget
         * 1,2,5 = false
         * 3,4 = true
         */
        while (($currentToken & 65536 /* Token.LeftHandSide */) > 0) {
            switch ($currentToken) {
                case 2162701 /* Token.QuestionDot */:
                    result = parseOptionalChainLHS(result);
                    break;
                case 65546 /* Token.Dot */:
                    nextToken();
                    if (($currentToken & 12288 /* Token.IdentifierName */) === 0) {
                        throw expectedIdentifier();
                    }
                    result = parseMemberExpressionLHS(result, false);
                    break;
                case 11 /* Token.DotDot */:
                case 12 /* Token.DotDotDot */:
                    throw expectedIdentifier();
                case 2688008 /* Token.OpenParen */:
                    if (result.$kind === ekAccessScope) {
                        result = new CallScopeExpression(result.name, parseArguments(), result.ancestor, false);
                    }
                    else if (result.$kind === ekAccessMember) {
                        result = new CallMemberExpression(result.object, result.name, parseArguments(), result.optional, false);
                    }
                    else if (result.$kind === ekAccessGlobal) {
                        result = new CallGlobalExpression(result.name, parseArguments());
                    }
                    else {
                        result = new CallFunctionExpression(result, parseArguments(), false);
                    }
                    break;
                case 2688019 /* Token.OpenBracket */:
                    result = parseKeyedExpression(result, false);
                    break;
                case 2163760 /* Token.TemplateTail */:
                    if ($optional) {
                        throw invalidTaggedTemplateOnOptionalChain();
                    }
                    result = createTemplateTail(result);
                    break;
                case 2163761 /* Token.TemplateContinuation */:
                    if ($optional) {
                        throw invalidTaggedTemplateOnOptionalChain();
                    }
                    result = parseTemplate(expressionType, result, true);
                    break;
            }
        }
    }
    if ($currentToken === 11 /* Token.DotDot */ || $currentToken === 12 /* Token.DotDotDot */) {
        throw expectedIdentifier();
    }
    if (513 /* Precedence.Binary */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /**
     * parseBinaryExpression
     *
     * https://tc39.github.io/ecma262/#sec-multiplicative-operators
     *
     * MultiplicativeExpression : (local precedence 6)
     * UnaryExpression
     * MultiplicativeExpression * / % UnaryExpression
     *
     * AdditiveExpression : (local precedence 5)
     * MultiplicativeExpression
     * AdditiveExpression + - MultiplicativeExpression
     *
     * RelationalExpression : (local precedence 4)
     * AdditiveExpression
     * RelationalExpression < > <= >= instanceof in AdditiveExpression
     *
     * EqualityExpression : (local precedence 3)
     * RelationalExpression
     * EqualityExpression == != === !== RelationalExpression
     *
     * LogicalANDExpression : (local precedence 2)
     * EqualityExpression
     * LogicalANDExpression && EqualityExpression
     *
     * LogicalORExpression : (local precedence 1)
     * LogicalANDExpression
     * LogicalORExpression || LogicalANDExpression
     *
     * CoalesceExpression :
     * CoalesceExpressionHead ?? BitwiseORExpression
     *
     * CoalesceExpressionHead :
     * CoelesceExpression
     * BitwiseORExpression
     *
     * ShortCircuitExpression :
     * LogicalORExpression
     * CoalesceExpression
     */
    while (($currentToken & 262144 /* Token.BinaryOp */) > 0) {
        const opToken = $currentToken;
        if ((opToken & 960 /* Token.Precedence */) <= minPrecedence) {
            break;
        }
        nextToken();
        result = new BinaryExpression(TokenValues[opToken & 63 /* Token.Type */], result, parse(opToken & 960 /* Token.Precedence */, expressionType));
        $assignable = false;
    }
    if (63 /* Precedence.Conditional */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /**
     * parseConditionalExpression
     * https://tc39.github.io/ecma262/#prod-ConditionalExpression
     *
     * ConditionalExpression :
     * 1. ShortCircuitExpression
     * 2. ShortCircuitExpression ? AssignmentExpression : AssignmentExpression
     *
     * IsValidAssignmentTarget
     * 1,2 = false
     */
    if (consumeOpt(6291479 /* Token.Question */)) {
        const yes = parse(62 /* Precedence.Assign */, expressionType);
        consume(6291477 /* Token.Colon */);
        result = new ConditionalExpression(result, yes, parse(62 /* Precedence.Assign */, expressionType));
        $assignable = false;
    }
    if (62 /* Precedence.Assign */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /**
     * parseAssignmentExpression
     *
     * https://tc39.github.io/ecma262/#prod-AssignmentExpression
     * Note: AssignmentExpression here is equivalent to ES Expression because we don't parse the comma operator
     *
     * AssignmentExpression :
     * 1. ConditionalExpression
     * 2. LeftHandSideExpression = AssignmentExpression
     *
     * IsValidAssignmentTarget
     * 1,2 = false
     */
    if (consumeOpt(4194350 /* Token.Equals */)) {
        if (!$assignable) {
            throw lhsNotAssignable();
        }
        result = new AssignExpression(result, parse(62 /* Precedence.Assign */, expressionType));
    }
    if (61 /* Precedence.Variadic */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /**
     * parseValueConverter
     */
    while (consumeOpt(6291481 /* Token.Bar */)) {
        if ($currentToken === 6291456 /* Token.EOF */) {
            throw expectedValueConverterIdentifier();
        }
        const name = $tokenValue;
        nextToken();
        const args = new Array();
        while (consumeOpt(6291477 /* Token.Colon */)) {
            args.push(parse(62 /* Precedence.Assign */, expressionType));
        }
        result = new ValueConverterExpression(result, name, args);
    }
    /**
     * parseBindingBehavior
     */
    while (consumeOpt(6291480 /* Token.Ampersand */)) {
        if ($currentToken === 6291456 /* Token.EOF */) {
            throw expectedBindingBehaviorIdentifier();
        }
        const name = $tokenValue;
        nextToken();
        const args = new Array();
        while (consumeOpt(6291477 /* Token.Colon */)) {
            args.push(parse(62 /* Precedence.Assign */, expressionType));
        }
        result = new BindingBehaviorExpression(result, name, args);
    }
    if ($currentToken !== 6291456 /* Token.EOF */) {
        if (expressionType === etInterpolation && $currentToken === 7340046 /* Token.CloseBrace */) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result;
        }
        if (expressionType === etIsChainable && $currentToken === 6291478 /* Token.Semicolon */) {
            if ($index === $length) {
                throw unconsumedToken();
            }
            $semicolonIndex = $index - 1;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result;
        }
        if ($tokenRaw() === 'of') {
            throw unexpectedOfKeyword();
        }
        throw unconsumedToken();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result;
}
/**
 * [key,]
 * [key]
 * [,value]
 * [key,value]
 */
function parseArrayDestructuring() {
    const items = [];
    const dae = new DestructuringAssignmentExpression(ekArrayDestructuring, items, void 0, void 0);
    let target = '';
    let $continue = true;
    let index = 0;
    while ($continue) {
        nextToken();
        switch ($currentToken) {
            case 7340052 /* Token.CloseBracket */:
                $continue = false;
                addItem();
                break;
            case 6291472 /* Token.Comma */:
                addItem();
                break;
            case 4096 /* Token.Identifier */:
                target = $tokenRaw();
                break;
            default:
                throw unexpectedTokenInDestructuring();
        }
    }
    consume(7340052 /* Token.CloseBracket */);
    return dae;
    function addItem() {
        if (target !== '') {
            items.push(new DestructuringAssignmentSingleExpression(new AccessMemberExpression($this, target), new AccessKeyedExpression($this, new PrimitiveLiteralExpression(index++)), void 0));
            target = '';
        }
        else {
            index++;
        }
    }
}
function parseArguments() {
    const _optional = $optional;
    nextToken();
    const args = [];
    while ($currentToken !== 7340047 /* Token.CloseParen */) {
        args.push(parse(62 /* Precedence.Assign */, etNone));
        if (!consumeOpt(6291472 /* Token.Comma */)) {
            break;
        }
    }
    consume(7340047 /* Token.CloseParen */);
    $assignable = false;
    $optional = _optional;
    return args;
}
function parseKeyedExpression(result, optional) {
    const _optional = $optional;
    nextToken();
    result = new AccessKeyedExpression(result, parse(62 /* Precedence.Assign */, etNone), optional);
    consume(7340052 /* Token.CloseBracket */);
    $assignable = !_optional;
    $optional = _optional;
    return result;
}
function parseOptionalChainLHS(lhs) {
    $optional = true;
    $assignable = false;
    nextToken();
    if (($currentToken & 13312 /* Token.OptionalSuffix */) === 0) {
        throw unexpectedTokenInOptionalChain();
    }
    if ($currentToken & 12288 /* Token.IdentifierName */) {
        return parseMemberExpressionLHS(lhs, true);
    }
    if ($currentToken === 2688008 /* Token.OpenParen */) {
        if (lhs.$kind === ekAccessScope) {
            return new CallScopeExpression(lhs.name, parseArguments(), lhs.ancestor, true);
        }
        else if (lhs.$kind === ekAccessMember) {
            return new CallMemberExpression(lhs.object, lhs.name, parseArguments(), lhs.optional, true);
        }
        else {
            return new CallFunctionExpression(lhs, parseArguments(), true);
        }
    }
    if ($currentToken === 2688019 /* Token.OpenBracket */) {
        return parseKeyedExpression(lhs, true);
    }
    throw invalidTaggedTemplateOnOptionalChain();
}
function parseMemberExpressionLHS(lhs, optional) {
    const rhs = $tokenValue;
    switch ($currentToken) {
        case 2162701 /* Token.QuestionDot */: {
            $optional = true;
            $assignable = false;
            const indexSave = $index;
            const startIndexSave = $startIndex;
            const currentTokenSave = $currentToken;
            const currentCharSave = $currentChar;
            const tokenValueSave = $tokenValue;
            const assignableSave = $assignable;
            const optionalSave = $optional;
            nextToken();
            if (($currentToken & 13312 /* Token.OptionalSuffix */) === 0) {
                throw unexpectedTokenInOptionalChain();
            }
            if ($currentToken === 2688008 /* Token.OpenParen */) {
                return new CallMemberExpression(lhs, rhs, parseArguments(), optional, true);
            }
            $index = indexSave;
            $startIndex = startIndexSave;
            $currentToken = currentTokenSave;
            $currentChar = currentCharSave;
            $tokenValue = tokenValueSave;
            $assignable = assignableSave;
            $optional = optionalSave;
            return new AccessMemberExpression(lhs, rhs, optional);
        }
        case 2688008 /* Token.OpenParen */: {
            $assignable = false;
            return new CallMemberExpression(lhs, rhs, parseArguments(), optional, false);
        }
        default: {
            $assignable = !$optional;
            nextToken();
            return new AccessMemberExpression(lhs, rhs, optional);
        }
    }
}

/**
 * https://tc39.es/ecma262/#prod-CoverParenthesizedExpressionAndArrowParameterList
 * CoverParenthesizedExpressionAndArrowParameterList :
 * ( Expression )
 * ( )
 * ( BindingIdentifier )
 * ( Expression , BindingIdentifier )
 */
function parseCoverParenthesizedExpressionAndArrowParameterList(expressionType) {
    nextToken();
    const indexSave = $index;
    const startIndexSave = $startIndex;
    const currentTokenSave = $currentToken;
    const currentCharSave = $currentChar;
    const tokenValueSave = $tokenValue;
    const assignableSave = $assignable;
    const optionalSave = $optional;
    const arrowParams = [];
    let paramsState = 1 /* ArrowFnParams.Valid */;
    let isParamList = false;
    // eslint-disable-next-line no-constant-condition
    loop: while (true) {
        if ($currentToken === 12 /* Token.DotDotDot */) {
            nextToken();
            if ($currentToken !== 4096 /* Token.Identifier */) {
                throw expectedIdentifier();
            }
            arrowParams.push(new BindingIdentifier($tokenValue));
            nextToken();
            if ($currentToken === 6291472 /* Token.Comma */) {
                throw restParamsMustBeLastParam();
            }
            if ($currentToken !== 7340047 /* Token.CloseParen */) {
                throw invalidSpreadOp();
            }
            nextToken();
            if ($currentToken !== 51 /* Token.Arrow */) {
                throw invalidSpreadOp();
            }
            nextToken();
            const _optional = $optional;
            const _scopeDepth = $scopeDepth;
            ++$scopeDepth;
            const body = parse(62 /* Precedence.Assign */, etNone);
            $optional = _optional;
            $scopeDepth = _scopeDepth;
            $assignable = false;
            return new ArrowFunction(arrowParams, body, true);
        }
        switch ($currentToken) {
            case 4096 /* Token.Identifier */:
                arrowParams.push(new BindingIdentifier($tokenValue));
                nextToken();
                break;
            case 7340047 /* Token.CloseParen */:
                // ()     - only valid if followed directly by an arrow
                nextToken();
                break loop;
            /* eslint-disable */
            case 524297 /* Token.OpenBrace */:
            // ({     - may be a valid parenthesized expression
            case 2688019 /* Token.OpenBracket */:
                // ([     - may be a valid parenthesized expression
                nextToken();
                paramsState = 4 /* ArrowFnParams.Destructuring */;
                break;
            /* eslint-enable */
            case 6291472 /* Token.Comma */:
                // (,     - never valid
                // (a,,   - never valid
                paramsState = 2 /* ArrowFnParams.Invalid */;
                isParamList = true;
                break loop;
            case 2688008 /* Token.OpenParen */:
                // ((     - may be a valid nested parenthesized expression or arrow fn
                // (a,(   - never valid
                paramsState = 2 /* ArrowFnParams.Invalid */;
                break loop;
            default:
                nextToken();
                paramsState = 2 /* ArrowFnParams.Invalid */;
                break;
        }
        switch ($currentToken) {
            case 6291472 /* Token.Comma */:
                nextToken();
                isParamList = true;
                if (paramsState === 1 /* ArrowFnParams.Valid */) {
                    break;
                }
                // ([something invalid],   - treat as arrow fn / invalid arrow params
                break loop;
            case 7340047 /* Token.CloseParen */:
                nextToken();
                break loop;
            case 4194350 /* Token.Equals */:
                // (a=a     - may be a valid parenthesized expression
                if (paramsState === 1 /* ArrowFnParams.Valid */) {
                    paramsState = 3 /* ArrowFnParams.Default */;
                }
                break loop;
            case 51 /* Token.Arrow */:
                // (a,a=>  - never valid
                if (isParamList) {
                    throw invalidArrowParameterList();
                }
                // (a=>    - may be a valid parenthesized expression with nested arrow fn
                nextToken();
                paramsState = 2 /* ArrowFnParams.Invalid */;
                break loop;
            default:
                if (paramsState === 1 /* ArrowFnParams.Valid */) {
                    paramsState = 2 /* ArrowFnParams.Invalid */;
                }
                break loop;
        }
    }
    if ($currentToken === 51 /* Token.Arrow */) {
        if (paramsState === 1 /* ArrowFnParams.Valid */) {
            nextToken();
            if ($currentToken === 524297 /* Token.OpenBrace */) {
                throw functionBodyInArrowFn();
            }
            const _optional = $optional;
            const _scopeDepth = $scopeDepth;
            ++$scopeDepth;
            const body = parse(62 /* Precedence.Assign */, etNone);
            $optional = _optional;
            $scopeDepth = _scopeDepth;
            $assignable = false;
            return new ArrowFunction(arrowParams, body);
        }
        throw invalidArrowParameterList();
    }
    else if (paramsState === 1 /* ArrowFnParams.Valid */ && arrowParams.length === 0) {
        // ()    - never valid as a standalone expression
        throw missingExpectedToken(51 /* Token.Arrow */);
    }
    if (isParamList) {
        // ([something invalid],   - treat as arrow fn / invalid arrow params
        switch (paramsState) {
            case 2 /* ArrowFnParams.Invalid */:
                throw invalidArrowParameterList();
            case 3 /* ArrowFnParams.Default */:
                throw defaultParamsInArrowFn();
            case 4 /* ArrowFnParams.Destructuring */:
                throw destructuringParamsInArrowFn();
        }
    }
    $index = indexSave;
    $startIndex = startIndexSave;
    $currentToken = currentTokenSave;
    $currentChar = currentCharSave;
    $tokenValue = tokenValueSave;
    $assignable = assignableSave;
    $optional = optionalSave;
    const _optional = $optional;
    const expr = parse(62 /* Precedence.Assign */, expressionType);
    $optional = _optional;
    consume(7340047 /* Token.CloseParen */);
    if ($currentToken === 51 /* Token.Arrow */) {
        // we only get here if there was a valid parenthesized expression which was not valid as arrow fn params
        switch (paramsState) {
            case 2 /* ArrowFnParams.Invalid */:
                throw invalidArrowParameterList();
            case 3 /* ArrowFnParams.Default */:
                throw defaultParamsInArrowFn();
            case 4 /* ArrowFnParams.Destructuring */:
                throw destructuringParamsInArrowFn();
        }
    }
    return expr;
}
/**
 * parseArrayLiteralExpression
 * https://tc39.github.io/ecma262/#prod-ArrayLiteralExpression
 *
 * ArrayLiteralExpression :
 * [ Elision(opt) ]
 * [ ElementList ]
 * [ ElementList, Elision(opt) ]
 *
 * ElementList :
 * Elision(opt) AssignmentExpression
 * ElementList, Elision(opt) AssignmentExpression
 *
 * Elision :
 * ,
 * Elision ,
 */
function parseArrayLiteralExpression(expressionType) {
    const _optional = $optional;
    nextToken();
    const elements = new Array();
    while ($currentToken !== 7340052 /* Token.CloseBracket */) {
        if (consumeOpt(6291472 /* Token.Comma */)) {
            elements.push($undefined);
            if ($currentToken === 7340052 /* Token.CloseBracket */) {
                break;
            }
        }
        else {
            elements.push(parse(62 /* Precedence.Assign */, expressionType === etIsIterator ? etNone : expressionType));
            if (consumeOpt(6291472 /* Token.Comma */)) {
                if ($currentToken === 7340052 /* Token.CloseBracket */) {
                    break;
                }
            }
            else {
                break;
            }
        }
    }
    $optional = _optional;
    consume(7340052 /* Token.CloseBracket */);
    if (expressionType === etIsIterator) {
        return new ArrayBindingPattern(elements);
    }
    else {
        $assignable = false;
        return new ArrayLiteralExpression(elements);
    }
}
const allowedForExprKinds = [ekArrayBindingPattern, ekObjectBindingPattern, ekBindingIdentifier, ekArrayDestructuring, ekObjectDestructuring];
function parseForOfStatement(result) {
    if (!allowedForExprKinds.includes(result.$kind)) {
        throw invalidLHSBindingIdentifierInForOf(result.$kind);
    }
    if ($currentToken !== 4204594 /* Token.OfKeyword */) {
        throw invalidLHSBindingIdentifierInForOf(result.$kind);
    }
    nextToken();
    const declaration = result;
    const statement = parse(61 /* Precedence.Variadic */, etIsChainable);
    return new ForOfStatement(declaration, statement, $semicolonIndex);
}
/**
 * parseObjectLiteralExpression
 * https://tc39.github.io/ecma262/#prod-Literal
 *
 * ObjectLiteralExpression :
 * { }
 * { PropertyDefinitionList }
 *
 * PropertyDefinitionList :
 * PropertyDefinition
 * PropertyDefinitionList, PropertyDefinition
 *
 * PropertyDefinition :
 * IdentifierName
 * PropertyName : AssignmentExpression
 *
 * PropertyName :
 * IdentifierName
 * StringLiteral
 * NumericLiteral
 */
function parseObjectLiteralExpression(expressionType) {
    const _optional = $optional;
    const keys = new Array();
    const values = new Array();
    nextToken();
    while ($currentToken !== 7340046 /* Token.CloseBrace */) {
        keys.push($tokenValue);
        // Literal = mandatory colon
        if ($currentToken & 49152 /* Token.StringOrNumericLiteral */) {
            nextToken();
            consume(6291477 /* Token.Colon */);
            values.push(parse(62 /* Precedence.Assign */, expressionType === etIsIterator ? etNone : expressionType));
        }
        else if ($currentToken & 12288 /* Token.IdentifierName */) {
            // IdentifierName = optional colon
            const currentChar = $currentChar;
            const currentToken = $currentToken;
            const index = $index;
            nextToken();
            if (consumeOpt(6291477 /* Token.Colon */)) {
                values.push(parse(62 /* Precedence.Assign */, expressionType === etIsIterator ? etNone : expressionType));
            }
            else {
                // Shorthand
                $currentChar = currentChar;
                $currentToken = currentToken;
                $index = index;
                values.push(parse(515 /* Precedence.Primary */, expressionType === etIsIterator ? etNone : expressionType));
            }
        }
        else {
            throw invalidPropDefInObjLiteral();
        }
        if ($currentToken !== 7340046 /* Token.CloseBrace */) {
            consume(6291472 /* Token.Comma */);
        }
    }
    $optional = _optional;
    consume(7340046 /* Token.CloseBrace */);
    if (expressionType === etIsIterator) {
        return new ObjectBindingPattern(keys, values);
    }
    else {
        $assignable = false;
        return new ObjectLiteralExpression(keys, values);
    }
}
function parseInterpolation() {
    const parts = [];
    const expressions = [];
    const length = $length;
    let result = '';
    while ($index < length) {
        switch ($currentChar) {
            case 36 /* Char.Dollar */:
                if ($charCodeAt($index + 1) === 123 /* Char.OpenBrace */) {
                    parts.push(result);
                    result = '';
                    $index += 2;
                    $currentChar = $charCodeAt($index);
                    nextToken();
                    const expression = parse(61 /* Precedence.Variadic */, etInterpolation);
                    expressions.push(expression);
                    continue;
                }
                else {
                    result += '$';
                }
                break;
            case 92 /* Char.Backslash */:
                result += stringFromCharCode(unescapeCode(nextChar()));
                break;
            default:
                result += stringFromCharCode($currentChar);
        }
        nextChar();
    }
    if (expressions.length) {
        parts.push(result);
        return new Interpolation(parts, expressions);
    }
    return null;
}
/**
 * parseTemplateLiteralExpression
 * https://tc39.github.io/ecma262/#prod-Literal
 *
 * TemplateExpression :
 * NoSubstitutionTemplate
 * TemplateHead
 *
 * NoSubstitutionTemplate :
 * ` TemplateCharacters(opt) `
 *
 * TemplateHead :
 * ` TemplateCharacters(opt) ${
 *
 * TemplateSubstitutionTail :
 * TemplateMiddle
 * TemplateTail
 *
 * TemplateMiddle :
 * } TemplateCharacters(opt) ${
 *
 * TemplateTail :
 * } TemplateCharacters(opt) `
 *
 * TemplateCharacters :
 * TemplateCharacter TemplateCharacters(opt)
 *
 * TemplateCharacter :
 * $ [lookahead ≠ {]
 * \ EscapeSequence
 * SourceCharacter (but not one of ` or \ or $)
 */
function parseTemplate(expressionType, result, tagged) {
    const _optional = $optional;
    const cooked = [$tokenValue];
    // TODO: properly implement raw parts / decide whether we want this
    consume(2163761 /* Token.TemplateContinuation */);
    const expressions = [parse(62 /* Precedence.Assign */, expressionType)];
    while (($currentToken = scanTemplateTail()) !== 2163760 /* Token.TemplateTail */) {
        cooked.push($tokenValue);
        consume(2163761 /* Token.TemplateContinuation */);
        expressions.push(parse(62 /* Precedence.Assign */, expressionType));
    }
    cooked.push($tokenValue);
    $assignable = false;
    $optional = _optional;
    if (tagged) {
        nextToken();
        return new TaggedTemplateExpression(cooked, cooked, result, expressions);
    }
    else {
        nextToken();
        return new TemplateExpression(cooked, expressions);
    }
}
function createTemplateTail(result) {
    $assignable = false;
    const strings = [$tokenValue];
    nextToken();
    return new TaggedTemplateExpression(strings, strings, result);
}
function nextToken() {
    while ($index < $length) {
        $startIndex = $index;
        if (($currentToken = (CharScanners[$currentChar]())) != null) { // a null token means the character must be skipped
            return;
        }
    }
    $currentToken = 6291456 /* Token.EOF */;
}
function nextChar() {
    return $currentChar = $charCodeAt(++$index);
}
function scanIdentifier() {
    // run to the next non-idPart
    while (IdParts[nextChar()])
        ;
    const token = KeywordLookup[$tokenValue = $tokenRaw()];
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return token === undefined ? 4096 /* Token.Identifier */ : token;
}
function scanNumber(isFloat) {
    let char = $currentChar;
    if (isFloat === false) {
        do {
            char = nextChar();
        } while (char <= 57 /* Char.Nine */ && char >= 48 /* Char.Zero */);
        if (char !== 46 /* Char.Dot */) {
            $tokenValue = parseInt($tokenRaw(), 10);
            return 32768 /* Token.NumericLiteral */;
        }
        // past this point it's always a float
        char = nextChar();
        if ($index >= $length) {
            // unless the number ends with a dot - that behaves a little different in native ES expressions
            // but in our AST that behavior has no effect because numbers are always stored in variables
            $tokenValue = parseInt($tokenRaw().slice(0, -1), 10);
            return 32768 /* Token.NumericLiteral */;
        }
    }
    if (char <= 57 /* Char.Nine */ && char >= 48 /* Char.Zero */) {
        do {
            char = nextChar();
        } while (char <= 57 /* Char.Nine */ && char >= 48 /* Char.Zero */);
    }
    else {
        $currentChar = $charCodeAt(--$index);
    }
    $tokenValue = parseFloat($tokenRaw());
    return 32768 /* Token.NumericLiteral */;
}
function scanString() {
    const quote = $currentChar;
    nextChar(); // Skip initial quote.
    let unescaped = 0;
    const buffer = new Array();
    let marker = $index;
    while ($currentChar !== quote) {
        if ($currentChar === 92 /* Char.Backslash */) {
            buffer.push($input.slice(marker, $index));
            nextChar();
            unescaped = unescapeCode($currentChar);
            nextChar();
            buffer.push(stringFromCharCode(unescaped));
            marker = $index;
        }
        else if ($index >= $length) {
            throw unterminatedStringLiteral();
        }
        else {
            nextChar();
        }
    }
    const last = $input.slice(marker, $index);
    nextChar(); // Skip terminating quote.
    // Compute the unescaped string value.
    buffer.push(last);
    const unescapedStr = buffer.join('');
    $tokenValue = unescapedStr;
    return 16384 /* Token.StringLiteral */;
}
function scanTemplate() {
    let tail = true;
    let result = '';
    while (nextChar() !== 96 /* Char.Backtick */) {
        if ($currentChar === 36 /* Char.Dollar */) {
            if (($index + 1) < $length && $charCodeAt($index + 1) === 123 /* Char.OpenBrace */) {
                $index++;
                tail = false;
                break;
            }
            else {
                result += '$';
            }
        }
        else if ($currentChar === 92 /* Char.Backslash */) {
            result += stringFromCharCode(unescapeCode(nextChar()));
        }
        else {
            if ($index >= $length) {
                throw unterminatedTemplateLiteral();
            }
            result += stringFromCharCode($currentChar);
        }
    }
    nextChar();
    $tokenValue = result;
    if (tail) {
        return 2163760 /* Token.TemplateTail */;
    }
    return 2163761 /* Token.TemplateContinuation */;
}
const scanTemplateTail = () => {
    if ($index >= $length) {
        throw unterminatedTemplateLiteral();
    }
    $index--;
    return scanTemplate();
};
const consumeOpt = (token) => {
    if ($currentToken === token) {
        nextToken();
        return true;
    }
    return false;
};
const consume = (token) => {
    if ($currentToken === token) {
        nextToken();
    }
    else {
        throw missingExpectedToken(token);
    }
};
// #region errors
const invalidStartOfExpression = () => createMappedError(151 /* ErrorNames.parse_invalid_start */, $input);
const invalidSpreadOp = () => createMappedError(152 /* ErrorNames.parse_no_spread */, $input);
const expectedIdentifier = () => createMappedError(153 /* ErrorNames.parse_expected_identifier */, $input);
const invalidMemberExpression = () => createMappedError(154 /* ErrorNames.parse_invalid_member_expr */, $input);
const unexpectedEndOfExpression = () => createMappedError(155 /* ErrorNames.parse_unexpected_end */, $input);
const unconsumedToken = () => createMappedError(156 /* ErrorNames.parse_unconsumed_token */, $tokenRaw(), $index, $input);
const invalidEmptyExpression = () => createMappedError(157 /* ErrorNames.parse_invalid_empty */);
const lhsNotAssignable = () => createMappedError(158 /* ErrorNames.parse_left_hand_side_not_assignable */, $input);
const expectedValueConverterIdentifier = () => createMappedError(159 /* ErrorNames.parse_expected_converter_identifier */, $input);
const expectedBindingBehaviorIdentifier = () => createMappedError(160 /* ErrorNames.parse_expected_behavior_identifier */, $input);
const unexpectedOfKeyword = () => createMappedError(161 /* ErrorNames.parse_unexpected_keyword_of */, $input);
const unexpectedImportKeyword = () => createMappedError(162 /* ErrorNames.parse_unexpected_keyword_import */, $input);
const invalidLHSBindingIdentifierInForOf = (kind) => createMappedError(163 /* ErrorNames.parse_invalid_identifier_in_forof */, $input, kind);
const invalidPropDefInObjLiteral = () => createMappedError(164 /* ErrorNames.parse_invalid_identifier_object_literal_key */, $input);
const unterminatedStringLiteral = () => createMappedError(165 /* ErrorNames.parse_unterminated_string */, $input);
const unterminatedTemplateLiteral = () => createMappedError(166 /* ErrorNames.parse_unterminated_template_string */, $input);
const missingExpectedToken = (token) => createMappedError(167 /* ErrorNames.parse_missing_expected_token */, TokenValues[token & 63 /* Token.Type */], $input)
    ;
const unexpectedCharacter = () => {
    throw createMappedError(168 /* ErrorNames.parse_unexpected_character */, $input);
};
unexpectedCharacter.notMapped = true;
const unexpectedTokenInDestructuring = () => createMappedError(170 /* ErrorNames.parse_unexpected_token_destructuring */, $tokenRaw(), $index, $input)
    ;
const unexpectedTokenInOptionalChain = () => createMappedError(171 /* ErrorNames.parse_unexpected_token_optional_chain */, $tokenRaw(), $index - 1, $input)
    ;
const invalidTaggedTemplateOnOptionalChain = () => createMappedError(172 /* ErrorNames.parse_invalid_tag_in_optional_chain */, $input);
const invalidArrowParameterList = () => createMappedError(173 /* ErrorNames.parse_invalid_arrow_params */, $input);
const defaultParamsInArrowFn = () => createMappedError(174 /* ErrorNames.parse_no_arrow_param_default_value */, $input);
const destructuringParamsInArrowFn = () => createMappedError(175 /* ErrorNames.parse_no_arrow_param_destructuring */, $input);
const restParamsMustBeLastParam = () => createMappedError(176 /* ErrorNames.parse_rest_must_be_last */, $input);
const functionBodyInArrowFn = () => createMappedError(178 /* ErrorNames.parse_no_arrow_fn_body */, $input);
const unexpectedDoubleDot = () => createMappedError(179 /* ErrorNames.parse_unexpected_double_dot */, $index - 1, $input)
    ;
// #endregion
/**
 * Array for mapping tokens to token values. The indices of the values
 * correspond to the token bits 0-38.
 * For this to work properly, the values in the array must be kept in
 * the same order as the token bits.
 * Usage: TokenValues[token & Token.Type]
 */
const TokenValues = [
    $false, $true, $null, $undefined, 'this', '$this', null /* '$host' */, '$parent',
    '(', '{', '.', '..', '...', '?.', '}', ')', ',', '[', ']', ':', ';', '?', '\'', '"',
    '&', '|', '??', '||', '&&', '==', '!=', '===', '!==', '<', '>',
    '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
    2163760 /* Token.TemplateTail */, 2163761 /* Token.TemplateContinuation */,
    'of', '=>'
];
const KeywordLookup = objectAssign(Object.create(null), {
    true: 8193 /* Token.TrueKeyword */,
    null: 8194 /* Token.NullKeyword */,
    false: 8192 /* Token.FalseKeyword */,
    undefined: 8195 /* Token.UndefinedKeyword */,
    this: 12293 /* Token.AccessBoundary */,
    $this: 12292 /* Token.ThisScope */,
    $parent: 12295 /* Token.ParentScope */,
    in: 6562213 /* Token.InKeyword */,
    instanceof: 6562214 /* Token.InstanceOfKeyword */,
    typeof: 139305 /* Token.TypeofKeyword */,
    void: 139306 /* Token.VoidKeyword */,
    of: 4204594 /* Token.OfKeyword */,
});
/**
 * Ranges of code points in pairs of 2 (eg 0x41-0x5B, 0x61-0x7B, ...) where the second value is not inclusive (5-7 means 5 and 6)
 * Single values are denoted by the second value being a 0
 *
 * Copied from output generated with "node build/generate-unicode.js"
 *
 * See also: https://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
 */
const codes = {
    /* [$0-9A-Za_a-z] */
    AsciiIdPart: [0x24, 0, 0x30, 0x3A, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B],
    IdStart: /* IdentifierStart */ [0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B],
    Digit: /* DecimalNumber */ [0x30, 0x3A],
    Skip: /* Skippable */ [0, 0x21, 0x7F, 0xA1]
};
/**
 * Decompress the ranges into an array of numbers so that the char code
 * can be used as an index to the lookup
 */
const decompress = (lookup, $set, compressed, value) => {
    const rangeCount = compressed.length;
    for (let i = 0; i < rangeCount; i += 2) {
        const start = compressed[i];
        let end = compressed[i + 1];
        end = end > 0 ? end : start + 1;
        if (lookup) {
            lookup.fill(value, start, end);
        }
        if ($set) {
            for (let ch = start; ch < end; ch++) {
                $set.add(ch);
            }
        }
    }
};
// CharFuncLookup functions
const returnToken = (token) => () => {
    nextChar();
    return token;
};
// ASCII IdentifierPart lookup
const AsciiIdParts = new Set();
decompress(null, AsciiIdParts, codes.AsciiIdPart, true);
// IdentifierPart lookup
const IdParts = new Uint8Array(0xFFFF);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts, null, codes.IdStart, 1);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts, null, codes.Digit, 1);
// Character scanning function lookup
const CharScanners = new Array(0xFFFF);
CharScanners.fill(unexpectedCharacter, 0, 0xFFFF);
decompress(CharScanners, null, codes.Skip, () => {
    nextChar();
    return null;
});
decompress(CharScanners, null, codes.IdStart, scanIdentifier);
decompress(CharScanners, null, codes.Digit, () => scanNumber(false));
CharScanners[34 /* Char.DoubleQuote */] =
    CharScanners[39 /* Char.SingleQuote */] = () => {
        return scanString();
    };
CharScanners[96 /* Char.Backtick */] = () => {
    return scanTemplate();
};
// !, !=, !==
CharScanners[33 /* Char.Exclamation */] = () => {
    if (nextChar() !== 61 /* Char.Equals */) {
        return 131119 /* Token.Exclamation */;
    }
    if (nextChar() !== 61 /* Char.Equals */) {
        return 6553950 /* Token.ExclamationEquals */;
    }
    nextChar();
    return 6553952 /* Token.ExclamationEqualsEquals */;
};
// =, ==, ===, =>
CharScanners[61 /* Char.Equals */] = () => {
    if (nextChar() === 62 /* Char.GreaterThan */) {
        nextChar();
        return 51 /* Token.Arrow */;
    }
    if ($currentChar !== 61 /* Char.Equals */) {
        return 4194350 /* Token.Equals */;
    }
    if (nextChar() !== 61 /* Char.Equals */) {
        return 6553949 /* Token.EqualsEquals */;
    }
    nextChar();
    return 6553951 /* Token.EqualsEqualsEquals */;
};
// &, &&
CharScanners[38 /* Char.Ampersand */] = () => {
    if (nextChar() !== 38 /* Char.Ampersand */) {
        return 6291480 /* Token.Ampersand */;
    }
    nextChar();
    return 6553884 /* Token.AmpersandAmpersand */;
};
// |, ||
CharScanners[124 /* Char.Bar */] = () => {
    if (nextChar() !== 124 /* Char.Bar */) {
        return 6291481 /* Token.Bar */;
    }
    nextChar();
    return 6553819 /* Token.BarBar */;
};
// ?, ??, ?.
CharScanners[63 /* Char.Question */] = () => {
    if (nextChar() === 46 /* Char.Dot */) {
        const peek = $charCodeAt($index + 1);
        if (peek <= 48 /* Char.Zero */ || peek >= 57 /* Char.Nine */) {
            nextChar();
            return 2162701 /* Token.QuestionDot */;
        }
        return 6291479 /* Token.Question */;
    }
    if ($currentChar !== 63 /* Char.Question */) {
        return 6291479 /* Token.Question */;
    }
    nextChar();
    return 6553754 /* Token.QuestionQuestion */;
};
// ., ...
CharScanners[46 /* Char.Dot */] = () => {
    if (nextChar() <= 57 /* Char.Nine */ && $currentChar >= 48 /* Char.Zero */) {
        return scanNumber(true);
    }
    if ($currentChar === 46 /* Char.Dot */) {
        if (nextChar() !== 46 /* Char.Dot */) {
            return 11 /* Token.DotDot */;
        }
        nextChar();
        return 12 /* Token.DotDotDot */;
    }
    return 65546 /* Token.Dot */;
};
// <, <=
CharScanners[60 /* Char.LessThan */] = () => {
    if (nextChar() !== 61 /* Char.Equals */) {
        return 6554017 /* Token.LessThan */;
    }
    nextChar();
    return 6554019 /* Token.LessThanEquals */;
};
// >, >=
CharScanners[62 /* Char.GreaterThan */] = () => {
    if (nextChar() !== 61 /* Char.Equals */) {
        return 6554018 /* Token.GreaterThan */;
    }
    nextChar();
    return 6554020 /* Token.GreaterThanEquals */;
};
CharScanners[37 /* Char.Percent */] = returnToken(6554156 /* Token.Percent */);
CharScanners[40 /* Char.OpenParen */] = returnToken(2688008 /* Token.OpenParen */);
CharScanners[41 /* Char.CloseParen */] = returnToken(7340047 /* Token.CloseParen */);
CharScanners[42 /* Char.Asterisk */] = returnToken(6554155 /* Token.Asterisk */);
CharScanners[43 /* Char.Plus */] = returnToken(2490855 /* Token.Plus */);
CharScanners[44 /* Char.Comma */] = returnToken(6291472 /* Token.Comma */);
CharScanners[45 /* Char.Minus */] = returnToken(2490856 /* Token.Minus */);
CharScanners[47 /* Char.Slash */] = returnToken(6554157 /* Token.Slash */);
CharScanners[58 /* Char.Colon */] = returnToken(6291477 /* Token.Colon */);
CharScanners[59 /* Char.Semicolon */] = returnToken(6291478 /* Token.Semicolon */);
CharScanners[91 /* Char.OpenBracket */] = returnToken(2688019 /* Token.OpenBracket */);
CharScanners[93 /* Char.CloseBracket */] = returnToken(7340052 /* Token.CloseBracket */);
CharScanners[123 /* Char.OpenBrace */] = returnToken(524297 /* Token.OpenBrace */);
CharScanners[125 /* Char.CloseBrace */] = returnToken(7340046 /* Token.CloseBrace */);

/**
 * Current subscription collector
 */
// eslint-disable-next-line import/no-mutable-exports
let _connectable = null;
const connectables = [];
// eslint-disable-next-line
let connecting = false;
// todo: layer based collection pause/resume?
function pauseConnecting() {
    connecting = false;
}
function resumeConnecting() {
    connecting = true;
}
function currentConnectable() {
    return _connectable;
}
function enterConnectable(connectable) {
    if (connectable == null) {
        throw createMappedError(206 /* ErrorNames.switch_on_null_connectable */);
    }
    if (_connectable == null) {
        _connectable = connectable;
        connectables[0] = _connectable;
        connecting = true;
        return;
    }
    if (_connectable === connectable) {
        throw createMappedError(207 /* ErrorNames.switch_active_connectable */);
    }
    connectables.push(connectable);
    _connectable = connectable;
    connecting = true;
}
function exitConnectable(connectable) {
    if (connectable == null) {
        throw createMappedError(208 /* ErrorNames.switch_off_null_connectable */);
    }
    if (_connectable !== connectable) {
        throw createMappedError(209 /* ErrorNames.switch_off_inactive_connectable */);
    }
    connectables.pop();
    _connectable = connectables.length > 0 ? connectables[connectables.length - 1] : null;
    connecting = _connectable != null;
}
const ConnectableSwitcher = /*@__PURE__*/ objectFreeze({
    get current() {
        return _connectable;
    },
    get connecting() {
        return connecting;
    },
    enter: enterConnectable,
    exit: exitConnectable,
    pause: pauseConnecting,
    resume: resumeConnecting,
});

const R$get = Reflect.get;
const toStringTag = Object.prototype.toString;
const proxyMap = new WeakMap();
/** @internal */
const nowrapClassKey = '__au_nw__';
/** @internal */
const nowrapPropKey = '__au_nw';
function canWrap(obj) {
    switch (toStringTag.call(obj)) {
        case '[object Object]':
            // enable inheritance decoration
            return obj.constructor[nowrapClassKey] !== true;
        case '[object Array]':
        case '[object Map]':
        case '[object Set]':
            // it's unlikely that methods on the following 2 objects need to be observed for changes
            // so while they are valid/ we don't wrap them either
            // case '[object Math]':
            // case '[object Reflect]':
            return true;
        default:
            return false;
    }
}
const rawKey = '__raw__';
function wrap(v) {
    return canWrap(v) ? getProxy(v) : v;
}
function getProxy(obj) {
    // deepscan-disable-next-line
    return proxyMap.get(obj) ?? createProxy(obj);
}
function getRaw(obj) {
    // todo: get in a weakmap if null/undef
    return obj[rawKey] ?? obj;
}
function unwrap(v) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return canWrap(v) && v[rawKey] || v;
}
function doNotCollect(object, key) {
    return key === 'constructor'
        || key === '__proto__'
        // probably should revert to v1 naming style for consistency with builtin?
        // __o__ is shorters & less chance of conflict with other libs as well
        || key === '$observers'
        || key === Symbol.toPrimitive
        || key === Symbol.toStringTag
        // limit to string first
        // symbol can be added later
        // looking up from the constructor means inheritance is supported
        || object.constructor[`${nowrapPropKey}_${safeString(key)}__`] === true;
}
function createProxy(obj) {
    const handler = isArray(obj)
        ? arrayHandler
        : isMap(obj) || isSet(obj)
            ? collectionHandler
            : objectHandler;
    const proxiedObj = new Proxy(obj, handler);
    proxyMap.set(obj, proxiedObj);
    proxyMap.set(proxiedObj, proxiedObj);
    return proxiedObj;
}
const objectHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentConnectable();
        if (!connecting || doNotCollect(target, key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        // todo: static
        connectable.observe(target, key);
        return wrap(R$get(target, key, receiver));
    },
};
const arrayHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        if (!connecting || doNotCollect(target, key) || _connectable == null) {
            return R$get(target, key, receiver);
        }
        switch (key) {
            case 'length':
                _connectable.observe(target, 'length');
                return target.length;
            case 'map':
                return wrappedArrayMap;
            case 'includes':
                return wrappedArrayIncludes;
            case 'indexOf':
                return wrappedArrayIndexOf;
            case 'lastIndexOf':
                return wrappedArrayLastIndexOf;
            case 'every':
                return wrappedArrayEvery;
            case 'filter':
                return wrappedArrayFilter;
            case 'find':
                return wrappedArrayFind;
            case 'findIndex':
                return wrappedArrayFindIndex;
            case 'flat':
                return wrappedArrayFlat;
            case 'flatMap':
                return wrappedArrayFlatMap;
            case 'join':
                return wrappedArrayJoin;
            case 'push':
                return wrappedArrayPush;
            case 'pop':
                return wrappedArrayPop;
            case 'reduce':
                return wrappedReduce;
            case 'reduceRight':
                return wrappedReduceRight;
            case 'reverse':
                return wrappedArrayReverse;
            case 'shift':
                return wrappedArrayShift;
            case 'unshift':
                return wrappedArrayUnshift;
            case 'slice':
                return wrappedArraySlice;
            case 'splice':
                return wrappedArraySplice;
            case 'some':
                return wrappedArraySome;
            case 'sort':
                return wrappedArraySort;
            case 'keys':
                return wrappedKeys;
            case 'values':
            case Symbol.iterator:
                return wrappedValues;
            case 'entries':
                return wrappedEntries;
        }
        _connectable.observe(target, key);
        return wrap(R$get(target, key, receiver));
    },
    // for (let i in array) ...
    ownKeys(target) {
        currentConnectable()?.observe(target, 'length');
        return Reflect.ownKeys(target);
    },
};
function wrappedArrayMap(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.map((v, i) => 
    // do we wrap `thisArg`?
    unwrap(cb.call(thisArg, wrap(v), i, this)));
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedArrayEvery(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.every((v, i) => cb.call(thisArg, wrap(v), i, this));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArrayFilter(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.filter((v, i) => 
    // do we wrap `thisArg`?
    unwrap(cb.call(thisArg, wrap(v), i, this)));
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedArrayIncludes(v) {
    const raw = getRaw(this);
    const res = raw.includes(unwrap(v));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArrayIndexOf(v) {
    const raw = getRaw(this);
    const res = raw.indexOf(unwrap(v));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArrayLastIndexOf(v) {
    const raw = getRaw(this);
    const res = raw.lastIndexOf(unwrap(v));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArrayFindIndex(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.findIndex((v, i) => unwrap(cb.call(thisArg, wrap(v), i, this)));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArrayFind(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.find((v, i) => cb(wrap(v), i, this), thisArg);
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedArrayFlat() {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return wrap(raw.flat());
}
function wrappedArrayFlatMap(cb, thisArg) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return getProxy(raw.flatMap((v, i) => wrap(cb.call(thisArg, wrap(v), i, this))));
}
function wrappedArrayJoin(separator) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return raw.join(separator);
}
function wrappedArrayPop() {
    return wrap(getRaw(this).pop());
}
function wrappedArrayPush(...args) {
    return getRaw(this).push(...args);
}
function wrappedArrayShift() {
    return wrap(getRaw(this).shift());
}
function wrappedArrayUnshift(...args) {
    return getRaw(this).unshift(...args);
}
function wrappedArraySplice(...args) {
    return wrap(getRaw(this).splice(...args));
}
function wrappedArrayReverse(..._args) {
    const raw = getRaw(this);
    const res = raw.reverse();
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedArraySome(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.some((v, i) => unwrap(cb.call(thisArg, wrap(v), i, this)));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArraySort(cb) {
    const raw = getRaw(this);
    const res = raw.sort(cb);
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedArraySlice(start, end) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return getProxy(raw.slice(start, end));
}
function wrappedReduce(cb, initValue) {
    const raw = getRaw(this);
    const res = raw.reduce((curr, v, i) => cb(curr, wrap(v), i, this), initValue);
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedReduceRight(cb, initValue) {
    const raw = getRaw(this);
    const res = raw.reduceRight((curr, v, i) => cb(curr, wrap(v), i, this), initValue);
    observeCollection(_connectable, raw);
    return wrap(res);
}
// the below logic takes inspiration from Vue, Mobx
// much thanks to them for working out this
const collectionHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentConnectable();
        if (!connecting || doNotCollect(target, key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        switch (key) {
            case 'size':
                connectable.observe(target, 'size');
                return target.size;
            case 'clear':
                return wrappedClear;
            case 'delete':
                return wrappedDelete;
            case 'forEach':
                return wrappedForEach;
            case 'add':
                if (isSet(target)) {
                    return wrappedAdd;
                }
                break;
            case 'get':
                if (isMap(target)) {
                    return wrappedGet;
                }
                break;
            case 'set':
                if (isMap(target)) {
                    return wrappedSet;
                }
                break;
            case 'has':
                return wrappedHas;
            case 'keys':
                return wrappedKeys;
            case 'values':
                return wrappedValues;
            case 'entries':
                return wrappedEntries;
            case Symbol.iterator:
                return isMap(target) ? wrappedEntries : wrappedValues;
        }
        return wrap(R$get(target, key, receiver));
    },
};
function wrappedForEach(cb, thisArg) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return raw.forEach((v, key) => {
        cb.call(/* should wrap or not?? */ thisArg, wrap(v), wrap(key), this);
    });
}
function wrappedHas(v) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return raw.has(unwrap(v));
}
function wrappedGet(k) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return wrap(raw.get(unwrap(k)));
}
function wrappedSet(k, v) {
    return wrap(getRaw(this).set(unwrap(k), unwrap(v)));
}
function wrappedAdd(v) {
    return wrap(getRaw(this).add(unwrap(v)));
}
function wrappedClear() {
    return wrap(getRaw(this).clear());
}
function wrappedDelete(k) {
    return wrap(getRaw(this).delete(unwrap(k)));
}
function wrappedKeys() {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    const iterator = raw.keys();
    return {
        next() {
            const next = iterator.next();
            const value = next.value;
            const done = next.done;
            return done
                ? { value: void 0, done }
                : { value: wrap(value), done };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
function wrappedValues() {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    const iterator = raw.values();
    return {
        next() {
            const next = iterator.next();
            const value = next.value;
            const done = next.done;
            return done
                ? { value: void 0, done }
                : { value: wrap(value), done };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
function wrappedEntries() {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    const iterator = raw.entries();
    // return a wrapped iterator which returns observed versions of the
    // values emitted from the real iterator
    return {
        next() {
            const next = iterator.next();
            const value = next.value;
            const done = next.done;
            return done
                ? { value: void 0, done }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                : { value: [wrap(value[0]), wrap(value[1])], done };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
const observeCollection = (connectable, collection) => connectable?.observeCollection(collection);
const ProxyObservable = /*@__PURE__*/ objectFreeze({
    getProxy,
    getRaw,
    wrap,
    unwrap,
    rawKey,
});

class ComputedObserver {
    constructor(obj, get, set, observerLocator, useProxy) {
        this.type = atObserver;
        /** @internal */
        this._value = void 0;
        // todo: maybe use a counter allow recursive call to a certain level
        /** @internal */
        this._isRunning = false;
        /** @internal */
        this._isDirty = false;
        /** @internal */
        this._callback = void 0;
        /** @internal */
        this._coercer = void 0;
        /** @internal */
        this._coercionConfig = void 0;
        this._obj = obj;
        this._wrapped = useProxy ? wrap(obj) : obj;
        this.$get = get;
        this.$set = set;
        this.oL = observerLocator;
    }
    init(value) {
        this._value = value;
        this._isDirty = false;
    }
    getValue() {
        if (this.subs.count === 0) {
            return this.$get.call(this._obj, this._obj, this);
        }
        if (this._isDirty) {
            this.compute();
            this._isDirty = false;
        }
        return this._value;
    }
    // deepscan-disable-next-line
    setValue(v) {
        if (isFunction(this.$set)) {
            if (this._coercer !== void 0) {
                v = this._coercer.call(null, v, this._coercionConfig);
            }
            if (!areEqual(v, this._value)) {
                // setting running true as a form of batching
                this._isRunning = true;
                this.$set.call(this._obj, v);
                this._isRunning = false;
                this.run();
            }
        }
        else {
            throw createMappedError(221 /* ErrorNames.assign_readonly_readonly_property_from_computed */);
        }
    }
    useCoercer(coercer, coercionConfig) {
        this._coercer = coercer;
        this._coercionConfig = coercionConfig;
        return true;
    }
    useCallback(callback) {
        this._callback = callback;
        return true;
    }
    handleChange() {
        this._isDirty = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    handleCollectionChange() {
        this._isDirty = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    subscribe(subscriber) {
        // in theory, a collection subscriber could be added before a property subscriber
        // and it should be handled similarly in subscribeToCollection
        // though not handling for now, and wait until the merge of normal + collection subscription
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.compute();
            this._isDirty = false;
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this._isDirty = true;
            this.obs.clearAll();
        }
    }
    run() {
        if (this._isRunning) {
            return;
        }
        const oldValue = this._value;
        const newValue = this.compute();
        this._isDirty = false;
        if (!areEqual(newValue, oldValue)) {
            // todo: probably should set is running here too
            // to prevent depth first notification
            this._callback?.(newValue, oldValue);
            this.subs.notify(this._value, oldValue);
        }
    }
    compute() {
        this._isRunning = true;
        this.obs.version++;
        try {
            enterConnectable(this);
            return this._value = unwrap(this.$get.call(this._wrapped, this._wrapped, this));
        }
        finally {
            this.obs.clear();
            this._isRunning = false;
            exitConnectable(this);
        }
    }
}
connectable(ComputedObserver);
subscriberCollection(ComputedObserver);

const IDirtyChecker = /*@__PURE__*/ createInterface('IDirtyChecker', x => x.callback(() => {
        throw createError('AURxxxx: There is no registration for IDirtyChecker interface. If you want to use your own dirty checker, make sure you register it.');
    })
    );
const DirtyCheckSettings = {
    /**
     * Default: `6`
     *
     * Adjust the global dirty check frequency.
     * Measures in "timeouts per check", such that (given a default of 250 timeouts per second in modern browsers):
     * - A value of 1 will result in 250 dirty checks per second (or 1 dirty check per second for an inactive tab)
     * - A value of 25 will result in 10 dirty checks per second (or 1 dirty check per 25 seconds for an inactive tab)
     */
    timeoutsPerCheck: 25,
    /**
     * Default: `false`
     *
     * Disable dirty-checking entirely. Properties that cannot be observed without dirty checking
     * or an adapter, will simply not be observed.
     */
    disabled: false,
    /**
     * Default: `false`
     *
     * Throw an error if a property is being dirty-checked.
     */
    throw: false,
    /**
     * Resets all dirty checking settings to the framework's defaults.
     */
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};
class DirtyChecker {
    static register(c) {
        c.register(Registration.singleton(this, this), Registration.aliasTo(this, IDirtyChecker));
    }
    constructor() {
        this.tracked = [];
        /** @internal */
        this._task = null;
        /** @internal */
        this._elapsedFrames = 0;
        this.p = resolve(IPlatform);
        this.check = () => {
            if (DirtyCheckSettings.disabled) {
                return;
            }
            if (++this._elapsedFrames < DirtyCheckSettings.timeoutsPerCheck) {
                return;
            }
            this._elapsedFrames = 0;
            const tracked = this.tracked;
            const len = tracked.length;
            let current;
            let i = 0;
            for (; i < len; ++i) {
                current = tracked[i];
                if (current.isDirty()) {
                    current.flush();
                }
            }
        };
        subscriberCollection(DirtyCheckProperty);
    }
    createProperty(obj, key) {
        if (DirtyCheckSettings.throw) {
            throw createError(`AUR0222: Property '${safeString(key)}' is being dirty-checked.`);
        }
        return new DirtyCheckProperty(this, obj, key);
    }
    addProperty(property) {
        this.tracked.push(property);
        if (this.tracked.length === 1) {
            this._task = this.p.taskQueue.queueTask(this.check, { persistent: true });
        }
    }
    removeProperty(property) {
        this.tracked.splice(this.tracked.indexOf(property), 1);
        if (this.tracked.length === 0) {
            this._task.cancel();
            this._task = null;
        }
    }
}
class DirtyCheckProperty {
    constructor(dirtyChecker, obj, key) {
        this.obj = obj;
        this.key = key;
        this.type = atNone;
        /** @internal */
        this._oldValue = void 0;
        this._dirtyChecker = dirtyChecker;
    }
    getValue() {
        return this.obj[this.key];
    }
    setValue(_v) {
        // todo: this should be allowed, probably
        // but the construction of dirty checker should throw instead
        throw createError(`Trying to set value for property ${safeString(this.key)} in dirty checker`);
    }
    isDirty() {
        return this._oldValue !== this.obj[this.key];
    }
    flush() {
        const oldValue = this._oldValue;
        const newValue = this.getValue();
        this._oldValue = newValue;
        this.subs.notify(newValue, oldValue);
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this._oldValue = this.obj[this.key];
            this._dirtyChecker.addProperty(this);
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this._dirtyChecker.removeProperty(this);
        }
    }
}

class PrimitiveObserver {
    get doNotCache() { return true; }
    constructor(obj, key) {
        this.type = atNone;
        this._obj = obj;
        this._key = key;
    }
    getValue() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
        return this._obj[this._key];
    }
    setValue() { }
    subscribe() { }
    unsubscribe() { }
}

class PropertyAccessor {
    constructor() {
        // the only thing can be guaranteed is it's an object
        // even if this property accessor is used to access an element
        this.type = atNone;
    }
    getValue(obj, key) {
        return obj[key];
    }
    setValue(value, obj, key) {
        obj[key] = value;
    }
}

/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
class SetterObserver {
    constructor(obj, key) {
        // todo(bigopon): tweak the flag based on typeof obj (array/set/map/iterator/proxy etc...)
        this.type = atObserver;
        /** @internal */
        this._value = void 0;
        /** @internal */
        this._observing = false;
        /** @internal */
        this._callback = void 0;
        /** @internal */
        this._coercer = void 0;
        /** @internal */
        this._coercionConfig = void 0;
        this._obj = obj;
        this._key = key;
    }
    getValue() {
        return this._value;
    }
    setValue(newValue) {
        if (this._coercer !== void 0) {
            newValue = this._coercer.call(void 0, newValue, this._coercionConfig);
        }
        if (this._observing) {
            if (areEqual(newValue, this._value)) {
                return;
            }
            oV = this._value;
            this._value = newValue;
            this._callback?.(newValue, oV);
            this.subs.notify(newValue, oV);
        }
        else {
            // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
            // so calling obj[propertyKey] will actually return this.value.
            // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
            // is unmodified and we need to explicitly set the property value.
            // This will happen in one-time, to-view and two-way bindings during bind, meaning that the bind will not actually update the target value.
            // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether bind updated the target or not.
            this._value = this._obj[this._key] = newValue;
            this._callback?.(newValue, oV);
        }
    }
    useCallback(callback) {
        this._callback = callback;
        this.start();
        return true;
    }
    useCoercer(coercer, coercionConfig) {
        this._coercer = coercer;
        this._coercionConfig = coercionConfig;
        this.start();
        return true;
    }
    subscribe(subscriber) {
        if (this._observing === false) {
            this.start();
        }
        this.subs.add(subscriber);
    }
    start() {
        if (this._observing === false) {
            this._observing = true;
            this._value = this._obj[this._key];
            def(this._obj, this._key, {
                enumerable: true,
                configurable: true,
                get: objectAssign(( /* Setter Observer */) => this.getValue(), { getObserver: () => this }),
                set: (/* Setter Observer */ value) => {
                    this.setValue(value);
                },
            });
        }
        return this;
    }
    stop() {
        if (this._observing) {
            def(this._obj, this._key, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: this._value,
            });
            this._observing = false;
            // todo(bigopon/fred): add .removeAllSubscribers()
        }
        return this;
    }
}
subscriberCollection(SetterObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV = void 0;

const propertyAccessor = new PropertyAccessor();
const IObserverLocator = /*@__PURE__*/ createInterface('IObserverLocator', x => x.singleton(ObserverLocator));
const INodeObserverLocator = /*@__PURE__*/ createInterface('INodeObserverLocator', x => x.cachedCallback(handler => {
    {
        handler.getAll(ILogger).forEach(logger => {
            logger.error('Using default INodeObserverLocator implementation. Will not be able to observe nodes (HTML etc...).');
        });
    }
    return new DefaultNodeObserverLocator();
}));
class DefaultNodeObserverLocator {
    handles() {
        return false;
    }
    getObserver() {
        return propertyAccessor;
    }
    getAccessor() {
        return propertyAccessor;
    }
}
class ObserverLocator {
    constructor() {
        /** @internal */ this._adapters = [];
        /** @internal */ this._dirtyChecker = resolve(IDirtyChecker);
        /** @internal */ this._nodeObserverLocator = resolve(INodeObserverLocator);
    }
    addAdapter(adapter) {
        this._adapters.push(adapter);
    }
    getObserver(obj, key) {
        if (obj == null) {
            throw createMappedError(199 /* ErrorNames.observing_null_undefined */, key);
        }
        if (!isObject(obj)) {
            return new PrimitiveObserver(obj, isFunction(key) ? '' : key);
        }
        if (isFunction(key)) {
            return new ComputedObserver(obj, key, void 0, this, true);
        }
        const lookup = getObserverLookup(obj);
        let observer = lookup[key];
        if (observer === void 0) {
            observer = this.createObserver(obj, key);
            if (!observer.doNotCache) {
                lookup[key] = observer;
            }
        }
        return observer;
    }
    getAccessor(obj, key) {
        const cached = obj.$observers?.[key];
        if (cached !== void 0) {
            return cached;
        }
        if (this._nodeObserverLocator.handles(obj, key, this)) {
            return this._nodeObserverLocator.getAccessor(obj, key, this);
        }
        return propertyAccessor;
    }
    getArrayObserver(observedArray) {
        return getArrayObserver(observedArray);
    }
    getMapObserver(observedMap) {
        return getMapObserver(observedMap);
    }
    getSetObserver(observedSet) {
        return getSetObserver(observedSet);
    }
    createObserver(obj, key) {
        if (this._nodeObserverLocator.handles(obj, key, this)) {
            return this._nodeObserverLocator.getObserver(obj, key, this);
        }
        switch (key) {
            case 'length':
                if (isArray(obj)) {
                    return getArrayObserver(obj).getLengthObserver();
                }
                break;
            case 'size':
                if (isMap(obj)) {
                    return getMapObserver(obj).getLengthObserver();
                }
                else if (isSet(obj)) {
                    return getSetObserver(obj).getLengthObserver();
                }
                break;
            default:
                if (isArray(obj) && isArrayIndex(key)) {
                    return getArrayObserver(obj).getIndexObserver(Number(key));
                }
                break;
        }
        let pd = getOwnPropDesc(obj, key);
        // Only instance properties will yield a descriptor here, otherwise walk up the proto chain
        if (pd === void 0) {
            let proto = getProto(obj);
            while (proto !== null) {
                pd = getOwnPropDesc(proto, key);
                if (pd === void 0) {
                    proto = getProto(proto);
                }
                else {
                    break;
                }
            }
        }
        // If the descriptor does not have a 'value' prop, it must have a getter and/or setter
        if (pd !== void 0 && !hasOwnProp.call(pd, 'value')) {
            let obs = this._getAdapterObserver(obj, key, pd);
            if (obs == null) {
                obs = (pd.get?.getObserver ?? pd.set?.getObserver)?.(obj, this);
            }
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            return obs == null
                ? pd.configurable
                    ? this._createComputedObserver(obj, key, pd, true)
                    : this._dirtyChecker.createProperty(obj, key)
                : obs;
        }
        // Ordinary get/set observation (the common use case)
        // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
        return new SetterObserver(obj, key);
    }
    /** @internal */
    _createComputedObserver(obj, key, pd, useProxy) {
        const observer = new ComputedObserver(obj, pd.get, pd.set, this, !!useProxy);
        def(obj, key, {
            enumerable: pd.enumerable,
            configurable: true,
            get: objectAssign((( /* Computed Observer */) => observer.getValue()), { getObserver: () => observer }),
            set: (/* Computed Observer */ v) => {
                observer.setValue(v);
            },
        });
        return observer;
    }
    /** @internal */
    _getAdapterObserver(obj, key, pd) {
        if (this._adapters.length > 0) {
            for (const adapter of this._adapters) {
                const observer = adapter.getObserver(obj, key, pd, this);
                if (observer != null) {
                    return observer;
                }
            }
        }
        return null;
    }
}
const getCollectionObserver = (collection) => {
    let obs;
    if (isArray(collection)) {
        obs = getArrayObserver(collection);
    }
    else if (isMap(collection)) {
        obs = getMapObserver(collection);
    }
    else if (isSet(collection)) {
        obs = getSetObserver(collection);
    }
    return obs;
};
const getProto = Object.getPrototypeOf;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const getObserverLookup = (instance) => {
    let lookup = instance.$observers;
    if (lookup === void 0) {
        def(instance, '$observers', {
            enumerable: false,
            value: lookup = createLookup(),
        });
    }
    return lookup;
};

const IObservation = /*@__PURE__*/ createInterface('IObservation', x => x.singleton(Observation));
class Observation {
    static get inject() { return [IObserverLocator]; }
    constructor(oL) {
        this.oL = oL;
        /** @internal */
        this._defaultWatchOptions = { immediate: true };
    }
    run(fn) {
        const effect = new RunEffect(this.oL, fn);
        // todo: batch effect run after it's in
        effect.run();
        return effect;
    }
    watch(obj, getter, callback, options = this._defaultWatchOptions) {
        // eslint-disable-next-line no-undef-init
        let $oldValue = undefined;
        let stopped = false;
        const observer = this.oL.getObserver(obj, getter);
        const handler = {
            handleChange: (newValue, oldValue) => callback(newValue, $oldValue = oldValue),
        };
        const run = () => {
            if (stopped)
                return;
            callback(observer.getValue(), $oldValue);
        };
        const stop = () => {
            stopped = true;
            observer.unsubscribe(handler);
        };
        observer.subscribe(handler);
        if (options.immediate) {
            run();
        }
        return { run, stop };
    }
}
class RunEffect {
    constructor(oL, fn) {
        this.oL = oL;
        this.fn = fn;
        // to configure this, potentially a 2nd parameter is needed for run
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
            throw createMappedError(225 /* ErrorNames.stopping_a_stopped_effect */);
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
        }
        finally {
            this.obs.clear();
            this.running = false;
            exitConnectable(this);
        }
        // when doing this.fn(this), there's a chance that it has recursive effect
        // continue to run for a certain number before bailing
        // whenever there's a dependency change while running, this.queued will be true
        // so we use it as an indicator to continue to run the effect
        if (this.queued) {
            if (this.runCount > this.maxRunCount) {
                this.runCount = 0;
                throw createMappedError(226 /* ErrorNames.effect_maximum_recursion_reached */);
            }
            this.run();
        }
        else {
            this.runCount = 0;
        }
    }
    stop() {
        this.stopped = true;
        this.obs.clearAll();
    }
}
connectable(RunEffect);

function getObserversLookup(obj) {
    if (obj.$observers === void 0) {
        def(obj, '$observers', { value: {} });
        // todo: define in a weakmap
    }
    return obj.$observers;
}
const noValue = {};
// impl, wont be seen
function observable(targetOrConfig, key, descriptor) {
    if (!SetterNotifier.mixed) {
        SetterNotifier.mixed = true;
        subscriberCollection(SetterNotifier);
    }
    // either this check, or arguments.length === 3
    // or could be both, so can throw against user error for better DX
    if (key == null) {
        // for:
        //    @observable('prop')
        //    class {}
        //
        //    @observable({ name: 'prop', callback: ... })
        //    class {}
        //
        //    class {
        //      @observable() prop
        //      @observable({ callback: ... }) prop2
        //    }
        return ((t, k, d) => deco(t, k, d, targetOrConfig));
    }
    // for:
    //    class {
    //      @observable prop
    //    }
    return deco(targetOrConfig, key, descriptor);
    function deco(target, key, descriptor, config) {
        // class decorator?
        const isClassDecorator = key === void 0;
        config = typeof config !== 'object'
            ? { name: config }
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            : (config || {});
        if (isClassDecorator) {
            key = config.name;
        }
        if (key == null || key === '') {
            throw createMappedError(224 /* ErrorNames.invalid_observable_decorator_usage */);
        }
        // determine callback name based on config or convention.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/strict-boolean-expressions
        const callback = config.callback || `${safeString(key)}Changed`;
        let initialValue = noValue;
        if (descriptor) {
            // we're adding a getter and setter which means the property descriptor
            // cannot have a "value" or "writable" attribute
            delete descriptor.value;
            delete descriptor.writable;
            initialValue = descriptor.initializer?.();
            delete descriptor.initializer;
        }
        else {
            descriptor = { configurable: true };
        }
        // make the accessor enumerable by default, as fields are enumerable
        if (!('enumerable' in descriptor)) {
            descriptor.enumerable = true;
        }
        // todo(bigopon/fred): discuss string api for converter
        const $set = config.set;
        descriptor.get = function g( /* @observable */) {
            const notifier = getNotifier(this, key, callback, initialValue, $set);
            currentConnectable()?.subscribeTo(notifier);
            return notifier.getValue();
        };
        descriptor.set = function s(newValue) {
            getNotifier(this, key, callback, initialValue, $set).setValue(newValue);
        };
        descriptor.get.getObserver = function gO(/* @observable */ obj) {
            return getNotifier(obj, key, callback, initialValue, $set);
        };
        if (isClassDecorator) {
            def(target.prototype, key, descriptor);
        }
        else {
            return descriptor;
        }
    }
}
function getNotifier(obj, key, callbackKey, initialValue, set) {
    const lookup = getObserversLookup(obj);
    let notifier = lookup[key];
    if (notifier == null) {
        notifier = new SetterNotifier(obj, callbackKey, set, initialValue === noValue ? void 0 : initialValue);
        lookup[key] = notifier;
    }
    return notifier;
}
class SetterNotifier {
    constructor(obj, callbackKey, set, initialValue) {
        this.type = atObserver;
        /** @internal */
        this._value = void 0;
        /** @internal */
        this._oldValue = void 0;
        this._obj = obj;
        this._setter = set;
        this._hasSetter = isFunction(set);
        const callback = obj[callbackKey];
        this.cb = isFunction(callback) ? callback : void 0;
        this._value = initialValue;
    }
    getValue() {
        return this._value;
    }
    setValue(value) {
        if (this._hasSetter) {
            value = this._setter(value);
        }
        if (!areEqual(value, this._value)) {
            this._oldValue = this._value;
            this._value = value;
            this.cb?.call(this._obj, this._value, this._oldValue);
            // this._value might have been updated during the callback
            // we only want to notify subscribers with the latest values
            value = this._oldValue;
            this._oldValue = this._value;
            this.subs.notify(this._value, value);
        }
    }
}
SetterNotifier.mixed = false;
/*
          | typescript       | babel
----------|------------------|-------------------------
property  | config           | config
w/parens  | target, key      | target, key, descriptor
----------|------------------|-------------------------
property  | target, key      | target, key, descriptor
no parens | n/a              | n/a
----------|------------------|-------------------------
class     | config           | config
          | target           | target
*/

/**
 * A decorator to signal proxy observation shouldn't make an effort to wrap an object
 */
function nowrap(target, key) {
    if (target == null) {
        // for
        //    @nowrap()
        //    class {}
        // or
        //    class { @nowrap() prop }
        return (t, k) => deco(t, k);
    }
    else {
        // for
        //    @nowrap
        //    class {}
        // or
        //    class {
        //      @nowrap prop
        //    }
        return deco(target, key);
    }
    function deco(target, key) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const isClassDecorator = !key;
        if (isClassDecorator) {
            defineHiddenProp(target, nowrapClassKey, true);
        }
        else {
            // defining on the constructor means inheritance lookup is supported
            defineHiddenProp(target.constructor, `${nowrapPropKey}_${safeString(key)}__`, true);
        }
    }
}
/* eslint-enable */

const ISignaler = createInterface('ISignaler', x => x.singleton(Signaler));
class Signaler {
    constructor() {
        this.signals = createLookup();
    }
    dispatchSignal(name) {
        const listeners = this.signals[name];
        if (listeners === undefined) {
            return;
        }
        let listener;
        for (listener of listeners.keys()) {
            listener.handleChange(undefined, undefined);
        }
    }
    addSignalListener(name, listener) {
        (this.signals[name] ??= new Set()).add(listener);
    }
    removeSignalListener(name, listener) {
        this.signals[name]?.delete(listener);
    }
}

export { AccessBoundaryExpression, AccessGlobalExpression, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, ArrowFunction, AssignExpression, BinaryExpression, BindingBehaviorExpression, BindingContext, BindingIdentifier, BindingObserverRecord, CallFunctionExpression, CallMemberExpression, CallScopeExpression, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, ConnectableSwitcher, CustomExpression, DestructuringAssignmentExpression, DestructuringAssignmentRestExpression, DestructuringAssignmentSingleExpression, DirtyCheckProperty, DirtyCheckSettings, DirtyChecker, ForOfStatement, ICoercionConfiguration, IDirtyChecker, IExpressionParser, INodeObserverLocator, IObservation, IObserverLocator, ISignaler, Interpolation, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, Observation, ObserverLocator, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, ProxyObservable, Scope, SetObserver, SetterObserver, SubscriberRecord, TaggedTemplateExpression, TemplateExpression, UnaryExpression, Unparser, ValueConverterExpression, astAssign, astBind, astEvaluate, astUnbind, astVisit, batch, cloneIndexMap, connectable, copyIndexMap, createIndexMap, disableArrayObservation, disableMapObservation, disableSetObservation, enableArrayObservation, enableMapObservation, enableSetObservation, getCollectionObserver, getObserverLookup, isIndexMap, nowrap, observable, parseExpression, subscriberCollection };
//# sourceMappingURL=index.dev.mjs.map
