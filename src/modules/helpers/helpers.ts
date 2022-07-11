
import * as t from '@babel/types';
export function buildTypeApplicationNode(typename: string, typeArgs: t.TSType[]): t.TSTypeReference {
    return t.tsTypeReference(t.identifier('SUB'), t.tsTypeParameterInstantiation(typeArgs));
}