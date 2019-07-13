import {
  And,
  Clause,
  ConstantScore,
  Not,
  Or,
  Primitive,
  Prohibited,
  Required,
  Term,
  TermValue,
  Range,
} from './types';

import * as util from 'util';
import reduce from 'lodash.reduce';

export function defaultTerm(value: TermValue): Term {
  return {
    type: 'term',
    value,
  };
}

export function term(field: string, value?: TermValue): Term {
  return {
    type: 'term',
    field,
    value,
  };
}

export function range(
  closedLower: boolean,
  closedUpper: boolean,
  lower?: Primitive,
  upper?: Primitive
): Range {
  return {
    type: 'range',
    closedLower,
    closedUpper,
    lower,
    upper,
  };
}

export function openRange(lower?: Primitive, upper?: Primitive): Range {
  return range(false, false, lower, upper);
}

export function closedRange(lower?: Primitive, upper?: Primitive): Range {
  return range(true, true, lower, upper);
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

function toRangeString(v: Range): string {
  return (
    (v.closedLower ? '[' : '{') +
    toString(v.lower) +
    ' TO ' +
    toString(v.upper) +
    (v.closedUpper ? ']' : '}')
  );
}

function escapeString(v: string) {
  return `"${v.replace(/"/g, '\\"')}"`;
}

export function toString(c?: Clause): string {
  switch (typeof c) {
    case 'undefined':
      return '*';
    case 'string':
      return escapeString(c);
    case 'number':
      return `${c}`;
    default:
      if (util.types.isDate(c)) {
        return c.toISOString();
      }
      switch (c.type) {
        case 'range':
          return toRangeString(c);
        case 'term':
          return (c.field ? c.field! + ':' : '') + toString(c.value);
        case 'and':
          return `(${toString(c.lhs)} AND ${toString(c.rhs)})`;
        case 'constant':
          return `(${toString(c.lhs)})^=${c.rhs}`;
        case 'not':
          return `(NOT ${toString(c.rhs)})`;
        case 'or':
          return `(${toString(c.lhs)} OR ${toString(c.rhs)})`;
        case 'prohibited':
          return `-${toString(c.rhs)}`;
        case 'required':
          return `+${toString(c.rhs)}`;
        /* istanbul ignore next */
        default:
          /* istanbul ignore next */
          return nope();
      }
  }
}
