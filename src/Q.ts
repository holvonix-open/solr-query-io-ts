import {
  And,
  Clause,
  ConstantScore,
  Not,
  Or,
  Prohibited,
  Required,
  Term,
  TermValue,
} from './types';

import * as util from 'util';
import reduce from 'lodash.reduce';

export function defaultTerm(value: TermValue): Term {
  return {
    type: 'term',
    value,
  };
}

export function term(field: string, value: TermValue): Term {
  return {
    type: 'term',
    field,
    value,
  };
}
export function not(rhs: Clause): Not {
  return {
    type: 'not',
    rhs,
  };
}
export function required(rhs: Clause): Required {
  return {
    type: 'required',
    rhs,
  };
}
export function prohibited(rhs: Clause): Prohibited {
  return {
    type: 'prohibited',
    rhs,
  };
}
export function constantScore(lhs: Clause, rhs: number): ConstantScore {
  return {
    type: 'constant',
    lhs,
    rhs,
  };
}

type BinaryOp = And | Or;

function binary<T extends BinaryOp>(
  op: T['type'],
  lhs: Clause,
  rhs: Clause,
  ...more: Clause[]
) {
  return reduce(
    more,
    (a, b) => {
      return ({
        type: op,
        lhs: a,
        rhs: b,
      } as unknown) as T;
    },
    {
      type: op,
      lhs,
      rhs,
    } as T
  );
}
export function and(lhs: Clause, rhs: Clause, ...more: Clause[]) {
  return binary<And>('and', lhs, rhs, ...more);
}
export function or(lhs: Clause, rhs: Clause, ...more: Clause[]) {
  return binary<Or>('or', lhs, rhs, ...more);
}

/* istanbul ignore next */
function nope(): never {
  throw new Error('unsupported');
}

export function toTermString(v: TermValue): string {
  switch (typeof v) {
    case 'string':
      return escapeString(v);
    case 'number':
      return `${v}`;
    default:
      if (util.types.isDate(v)) {
        return v.toISOString();
      }
      return toString(v);
  }
}

function escapeString(v: string) {
  return `"${v.replace(/"/g, '\\"')}"`;
}

function queryStringRaw(c: Clause) {
  switch (c.type) {
    case 'term':
      return (
        (c.field ? escapeString(c.field!) + ':' : '') + toTermString(c.value)
      );
    case 'and':
      return `${toString(c.lhs)} AND ${toString(c.rhs)}`;
    case 'constant':
      return `${toString(c.lhs)}^=${c.rhs}`;
    case 'not':
      return `NOT ${toString(c.rhs)}`;
    case 'or':
      return `${toString(c.lhs)} OR ${toString(c.rhs)}`;
    case 'prohibited':
      return `-${toString(c.rhs)}`;
    case 'required':
      return `+${toString(c.rhs)}`;
    default:
      /* istanbul ignore next */
      return nope();
  }
}

export function toString(c: Clause): string {
  return `(${queryStringRaw(c)})`;
}
