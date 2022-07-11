import { Visitor } from '@babel/core';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { buildTypeApplicationNode } from '../helpers/helpers';
import { HelperTypeEnum } from '../helpers/helpers.enum';
import { repeatObject } from '../utils/general';

type HelperTypeSwitchStore = Partial<Record<HelperTypeEnum, boolean>>;

class Transformer {

  helperTypesSwitch: HelperTypeSwitchStore = {};
  buildTsTypeNodeByPath(
    path: NodePath<
      | t.Expression
      | t.FunctionDeclaration
      | t.PrivateName
      | t.BlockStatement
      | t.ReturnStatement
      | t.IfStatement
      | undefined
      | null
    >
  ): t.TSType {
    if (path.hasNode()) {
      if (path.isStringLiteral()) {
        return t.tsLiteralType(path.node);
      } else if (path.isNumericLiteral()) {
        const value = path.node.value;
        return t.tsTupleType(
          repeatObject(t.tsLiteralType(t.numericLiteral(1)), value)
        );
      } else if (path.isPrivateName()) {
        throw path.buildCodeFrameError('PrivateName is not implemented');
      } else if (path.isIdentifier()) {
        return t.tsTypeReference(path.node);
      } else if (path.isBinaryExpression()) {
        const left = path.get('left');
        const right = path.get('right');
        const typeArgs = [left, right].map((arg) => {
          return this.buildTsTypeNodeByPath(arg);
        });
        if (path.node.operator === '+') {
          return t.tsTupleType([
            t.tsRestType(this.buildTsTypeNodeByPath(left)),
            t.tsRestType(this.buildTsTypeNodeByPath(right)),
          ]);
        } else if (path.node.operator === '-') {
          return buildTypeApplicationNode(HelperTypeEnum.SUB, typeArgs);
        } else if (path.node.operator === '<=') {
          return buildTypeApplicationNode(HelperTypeEnum.LTE, typeArgs);
        } else if (path.node.operator === '>') {
          return buildTypeApplicationNode(HelperTypeEnum.NOT, [buildTypeApplicationNode(HelperTypeEnum.LTE, typeArgs)]);
        } else if (path.node.operator === '<') {
          return buildTypeApplicationNode(HelperTypeEnum.LT, typeArgs);
        } else if (path.node.operator === '>=') {
          return buildTypeApplicationNode(HelperTypeEnum.NOT, [buildTypeApplicationNode(HelperTypeEnum.LT, typeArgs)]);
        } else if (path.node.operator === '===') {
          return buildTypeApplicationNode(HelperTypeEnum.EQUALS, typeArgs);
        } else if (path.node.operator === '!==') {
          return buildTypeApplicationNode(HelperTypeEnum.NOT, [
            buildTypeApplicationNode(HelperTypeEnum.EQUALS, typeArgs)
          ]);
        } else {
          throw path.buildCodeFrameError(
            `operator ${path.node.operator} is not implemented yet`
          );
        }
      } else if (path.isLogicalExpression()) {
        const left = path.get('left');
        const right = path.get('right');
        const typeArgs = [left, right].map((arg) => {
          return this.buildTsTypeNodeByPath(arg);
        });
        if (path.node.operator === '&&') {
          return buildTypeApplicationNode(HelperTypeEnum.AND, typeArgs);
        } else if (path.node.operator === '||') {
          return buildTypeApplicationNode(HelperTypeEnum.OR, typeArgs);
        } else {
          throw path.buildCodeFrameError(
            `operator ${path.node.operator} is not implemented yet`
          );
        }
      } else if (path.isUnaryExpression()) {
        const typeArgs = [this.buildTsTypeNodeByPath(path.get('argument'))];
        if (path.node.operator === '!') {
          return buildTypeApplicationNode(HelperTypeEnum.NOT, typeArgs);
        } else {
          throw path.buildCodeFrameError(
            `operator ${path.node.operator} is not implemented yet`
          );
        }
      } else if (path.isBlockStatement()) {
        const body = path.get('body');
        if (body.length === 0) {
          // regard empty block as undefined
          return t.tsUndefinedKeyword();
        } else if (body.length === 1) {
          const stat = body[0]!;
          return this.buildTsTypeNodeByPath(stat);
        } else {
          throw path.buildCodeFrameError(
            'block cannot have more statements than 1'
          );
        }
      } else if (path.isReturnStatement()) {
        return this.buildTsTypeNodeByPath(path.get('argument'));
      } else if (path.isConditionalExpression()) {
        const test = this.buildTsTypeNodeByPath(path.get('test'));
        const consequent = this.buildTsTypeNodeByPath(path.get('consequent'));
        const alternate = this.buildTsTypeNodeByPath(path.get('alternate'));
        return t.tsConditionalType(test, t.tsLiteralType(t.booleanLiteral(true)), consequent, alternate);
      } else if (path.isCallExpression()) {
        const callee = path.get('callee');
        const args = path.get('arguments') as NodePath<t.Expression>[];
        if (callee.isExpression()) {
          if (callee.isIdentifier()) {
            const typeCallee = this.buildTsTypeNodeByPath(callee) as t.TSTypeReference;
            const typeArgs = args.map((arg) => {
              return this.buildTsTypeNodeByPath(arg);
            });
            if (typeArgs.length) {
              typeCallee.typeParameters =
                t.tsTypeParameterInstantiation(typeArgs);
            }
            return typeCallee;
          } else {
            throw callee.buildCodeFrameError('only identifier is supported');
          }
        } else {
          throw callee.buildCodeFrameError('only expression it supported');
        }
      } else {
        throw path.buildCodeFrameError(
          `handler of ${path.type} is not implemented`
        );
      }
    }
    throw path.buildCodeFrameError('path is empty');
  }
  buildTypeParamDeclaration(
    paths: NodePath<t.Identifier | t.RestElement | t.Pattern>[]
  ): t.TSTypeParameterDeclaration | null {
    if (paths.length === 0) {
      return null;
    }
    const h = paths as NodePath<t.Identifier>[];
    return t.tsTypeParameterDeclaration(
      h.map((x) => {
        return t.tsTypeParameter(null, null, x.node.name);
      })
    );
  }
  buildStatement(path: NodePath<t.Statement>): t.Statement[] {
    if (path.isVariableDeclaration()) {
      if (path.node.kind === 'var' || path.node.kind === 'let') {
        throw path.buildCodeFrameError(
          'cannot declare variables using let or var'
        );
      }
      return path.get('declarations').map((x) => {
        if (t.isIdentifier(x.node.id)) {
          const init = x.get('init');
          if (init) {
            return t.tSTypeAliasDeclaration(
              x.node.id,
              null,
              this.buildTsTypeNodeByPath(init)
            );
          } else {
            throw x.buildCodeFrameError(
              'variables declared with const must be initialized'
            );
          }
        } else {
          throw x.buildCodeFrameError(
            `the left hand side of variable declaration should be an identifier, but ${x.node.id.type} found`
          );
        }
      });
    } else if (path.isTSTypeAliasDeclaration()) {
      return [path.node];
    } else if (path.isFunctionDeclaration()) {
      const id = path.get('id');
      if (!id.isIdentifier()) {
        throw path.buildCodeFrameError('only identifiers are supported');
      }
      const param = path.get('params');
      const body = path.get('body');
      return [
        t.tsTypeAliasDeclaration(
          id.node,
          this.buildTypeParamDeclaration(param),
          this.buildTsTypeNodeByPath(body)
        ),
      ];
    } else {
      throw path.buildCodeFrameError(
        `Statement ${path.type} is not implemented yet`
      );
    }
  }

};

export default function () {
  let transformer = new Transformer();
  const visitor: {
    visitor: Visitor;
    pre: () => void;
    post: () => void;
  } = {
    pre() {
      transformer = new Transformer();
    },
    visitor: {
      Statement(path) {
        const statements = transformer.buildStatement(path);
        path.replaceWithMultiple(statements);
        path.skip();
      },
    },
    post() {

    },
  };
  return visitor;
}
