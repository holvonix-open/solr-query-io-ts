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
  Spatial,
  SpatialOp,
} from './types';

import * as util from 'util';
import reduce from 'lodash.reduce';

import * as spatial from './spatial';
import * as wkt from 'terraformer-wkt-parser';

export { spatial };

export function defaultTerm(value?: TermValue<string>): Term<string>;
export function defaultTerm(value?: TermValue<Date>): Term<Date>;
export function defaultTerm(value?: TermValue<number>): Term<number>;
export function defaultTerm(
  value?: TermValue<Spatial<SpatialOp>>
): Term<Spatial<SpatialOp>>;
export function defaultTerm<T extends Primitive>(value: TermValue<T>): Term<T> {
  return {
    type: 'term',
    value,
  };
}

export function term(field: string, value?: TermValue<string>): Term<string>;
export function term(field: string, value?: TermValue<Date>): Term<Date>;
export function term(field: string, value?: TermValue<number>): Term<number>;
export function term(
  field: string,
  value?: TermValue<Spatial<SpatialOp>>
): Term<Spatial<SpatialOp>>;
export function term<T extends Primitive>(
  field: string,
  value?: TermValue<T>
): Term<T> {
  return {
    type: 'term',
    field,
    value,
  };
}

export function range(
  closedLower: boolean,
  closedUpper: boolean,
  lower?: string,
  upper?: string
): Range<string>;
export function range(
  closedLower: boolean,
  closedUpper: boolean,
  lower?: Date,
  upper?: Date
): Range<Date>;
export function range(
  closedLower: boolean,
  closedUpper: boolean,
  lower?: number,
  upper?: number
): Range<number>;
export function range<T extends Primitive>(
  closedLower: boolean,
  closedUpper: boolean,
  lower?: T,
  upper?: T
): Range<T> {
  return rangeImpl(closedLower, closedUpper, lower, upper);
}

function rangeImpl<T extends Primitive>(
  closedLower: boolean,
  closedUpper: boolean,
  lower?: T,
  upper?: T
): Range<T> {
  return {
    type: 'range',
    closedLower,
    closedUpper,
    lower,
    upper,
  };
}

export function openRange(lower?: string, upper?: string): Range<string>;
export function openRange(lower?: number, upper?: number): Range<number>;
export function openRange(lower?: Date, upper?: Date): Range<Date>;
export function openRange<T extends Primitive>(lower?: T, upper?: T): Range<T> {
  return rangeImpl(false, false, lower, upper);
}

export function closedRange(lower?: string, upper?: string): Range<string>;
export function closedRange(lower?: number, upper?: number): Range<number>;
export function closedRange(lower?: Date, upper?: Date): Range<Date>;
export function closedRange<T extends Primitive>(
  lower?: T,
  upper?: T
): Range<T> {
  return rangeImpl(true, true, lower, upper);
}

export function not<T extends Primitive>(rhs: Clause<T>): Not<T> {
  return {
    type: 'not',
    rhs,
  };
}
export function required<T extends Primitive>(rhs: Clause<T>): Required<T> {
  return {
    type: 'required',
    rhs,
  };
}
export function prohibited<T extends Primitive>(rhs: Clause<T>): Prohibited<T> {
  return {
    type: 'prohibited',
    rhs,
  };
}
export function constantScore<T extends Primitive>(
  lhs: Clause<T>,
  rhs: number
): ConstantScore<T> {
  return {
    type: 'constant',
    lhs,
    rhs,
  };
}

type BinaryOp<U extends Primitive> = And<U> | Or<U>;

function binary<T extends BinaryOp<U>, U extends Primitive>(
  op: T['type'],
  lhs: Clause<U>,
  rhs: Clause<U>,
  ...more: Array<Clause<U>>
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

export function and(
  lhs: Clause<string>,
  rhs: Clause<string>,
  ...mode: Array<Clause<string>>
): And<string>;
export function and(
  lhs: Clause<number>,
  rhs: Clause<number>,
  ...mode: Array<Clause<number>>
): And<number>;
export function and(
  lhs: Clause<Date>,
  rhs: Clause<Date>,
  ...mode: Array<Clause<Date>>
): And<Date>;
export function and(
  lhs: Clause<Primitive>,
  rhs: Clause<Primitive>,
  ...mode: Array<Clause<Primitive>>
): And<Primitive>;
export function and(
  lhs: Clause<Spatial<SpatialOp>>,
  rhs: Clause<Spatial<SpatialOp>>,
  ...mode: Array<Clause<Spatial<SpatialOp>>>
): And<Spatial<SpatialOp>>;

export function and<T extends Primitive>(
  lhs: Clause<T>,
  rhs: Clause<T>,
  ...more: Array<Clause<T>>
): And<T> {
  return binary('and', lhs, rhs, ...more);
}

export function or(
  lhs: Clause<string>,
  rhs: Clause<string>,
  ...mode: Array<Clause<string>>
): Or<string>;
export function or(
  lhs: Clause<number>,
  rhs: Clause<number>,
  ...mode: Array<Clause<number>>
): Or<number>;
export function or(
  lhs: Clause<Date>,
  rhs: Clause<Date>,
  ...mode: Array<Clause<Date>>
): Or<Date>;
export function or(
  lhs: Clause<Spatial<SpatialOp>>,
  rhs: Clause<Spatial<SpatialOp>>,
  ...mode: Array<Clause<Spatial<SpatialOp>>>
): Or<Spatial<SpatialOp>>;
export function or(
  lhs: Clause<Primitive>,
  rhs: Clause<Primitive>,
  ...mode: Array<Clause<Primitive>>
): Or<Primitive>;

export function or<T extends Primitive>(
  lhs: Clause<T>,
  rhs: Clause<T>,
  ...more: Array<Clause<T>>
): Or<T> {
  return binary('or', lhs, rhs, ...more);
}

/* istanbul ignore next */
function nope(): never {
  throw new Error('unsupported');
}

function toRangeString<T extends Primitive>(v: Range<T>): string {
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

export function toString(c?: Clause<Primitive>): string {
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
  }
  switch (c.type) {
    case 'spatial':
      return toString(`${c.op}(${wkt.convert(c.value)})`);
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
