import { codeFrameColumns } from "@babel/code-frame";
import { Visitor } from "@babel/core";
import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { isInteger } from "lodash";
import { ASTNode } from "../types/ast";

type SupportedNodeType = t.NumericLiteral | t.Expression;

type SupportedNodeTypeString = SupportedNodeType["type"];

function repeatObject<T>(obj: T, times: number): T[] {
    if (times < 0 || !isInteger(times)) {
        times = 0;
    }
    return Array.from({ length: times }).map((x) => obj);
}

function buildNodeByPath(
    path: NodePath<t.Expression | t.PrivateName | undefined | null>
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
            throw path.buildCodeFrameError("PrivateName is not implemented");
        } else if (path.isIdentifier()) {
            return t.tsTypeReference(path.node);
        } else if (path.isBinaryExpression()) {
            const left = path.get("left");
            const right = path.get("right");
            if (path.node.operator === "+") {
                return t.tsTupleType([
                    t.tsRestType(buildNodeByPath(left)),
                    t.tsRestType(buildNodeByPath(right)),
                ]);
            } else {
                throw path.buildCodeFrameError(
                    `operator ${path.node.operator} is not implemented yet`
                );
            }
        } else {
            throw path.buildCodeFrameError(
                `handler of ${path.type} is not implemented`
            );
        }
    }
    throw path.buildCodeFrameError("path is empty");
}

export default function () {
    const visitor: { visitor: Visitor } = {
        visitor: {
            Statement(path) {
                if (path.isVariableDeclaration()) {
                    if (path.node.kind === "var" || path.node.kind === "let") {
                        throw path.buildCodeFrameError(
                            "cannot declare variables using let or var"
                        );
                    }
                    path.replaceWithMultiple(
                        path.get("declarations").map((x) => {
                            if (t.isIdentifier(x.node.id)) {
                                const init = x.get("init");
                                if (init) {
                                    return t.tSTypeAliasDeclaration(
                                        x.node.id,
                                        null,
                                        buildNodeByPath(init)
                                    );
                                } else {
                                    throw x.buildCodeFrameError(
                                        "variables declared with const must be initialized"
                                    );
                                }
                            } else {
                                throw x.buildCodeFrameError(
                                    `the left hand side of variable declaration should be an identifier, but ${x.node.id.type} found`
                                );
                            }
                        })
                    );
                } else if (path.isTSTypeAliasDeclaration()) {
                    // do nothing
                }
                else {
                    throw path.buildCodeFrameError(`Statement ${path.type} is not implemented yet`);
                }
                path.skip();
            }
        }
    }
    return visitor;
}