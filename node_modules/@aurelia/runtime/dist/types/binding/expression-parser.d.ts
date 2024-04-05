import { ForOfStatement, Interpolation, AnyBindingExpression, IsBindingBehavior } from './ast';
export interface IExpressionParser extends ExpressionParser {
}
export declare const IExpressionParser: import("@aurelia/kernel").InterfaceSymbol<IExpressionParser>;
export declare class ExpressionParser {
    parse(expression: string, expressionType: 'IsIterator'): ForOfStatement;
    parse(expression: string, expressionType: 'Interpolation'): Interpolation;
    parse(expression: string, expressionType: Exclude<ExpressionType, 'IsIterator' | 'Interpolation'>): IsBindingBehavior;
    parse(expression: string, expressionType: ExpressionType): AnyBindingExpression;
}
declare const enum Precedence {
    Variadic = 61,
    Assign = 62,
    Conditional = 63,
    NullishCoalescing = 128,
    LogicalOR = 192,
    LogicalAND = 256,
    Equality = 320,
    Relational = 384,
    Additive = 448,
    Multiplicative = 512,
    Binary = 513,
    LeftHandSide = 514,
    Primary = 515,
    Unary = 516
}
declare const etNone: "None";
declare const etInterpolation: "Interpolation";
declare const etIsIterator: "IsIterator";
declare const etIsChainable: "IsChainable";
declare const etIsFunction: "IsFunction";
declare const etIsProperty: "IsProperty";
declare const etIsCustom: "IsCustom";
export type ExpressionType = typeof etNone | typeof etInterpolation | typeof etIsIterator | typeof etIsChainable | typeof etIsFunction | typeof etIsProperty | typeof etIsCustom;
export declare function parseExpression(input: string, expressionType?: ExpressionType): AnyBindingExpression;
export declare function parse(minPrecedence: Precedence, expressionType: ExpressionType): AnyBindingExpression;
export {};
//# sourceMappingURL=expression-parser.d.ts.map