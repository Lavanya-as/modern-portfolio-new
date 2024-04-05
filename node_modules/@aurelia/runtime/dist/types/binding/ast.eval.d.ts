import { IConnectable } from '../observation';
import { Scope } from '../observation/scope';
import { type IsExpressionOrStatement, type IAstEvaluator } from './ast';
import { IConnectableBinding } from './connectable';
export declare function astEvaluate(ast: IsExpressionOrStatement, s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown;
export declare function astAssign(ast: IsExpressionOrStatement, s: Scope, e: IAstEvaluator | null, val: unknown): unknown;
export declare function astBind(ast: IsExpressionOrStatement, s: Scope, b: IAstEvaluator & IConnectableBinding): void;
export declare function astUnbind(ast: IsExpressionOrStatement, s: Scope, b: IAstEvaluator & IConnectableBinding): void;
//# sourceMappingURL=ast.eval.d.ts.map