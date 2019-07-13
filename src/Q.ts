import {
  And,
  AndTerm,
  Clause,
  ConstantScore,
  Not,
  NotTerm,
  Literal,
  Or,
  OrTerm,
  Primitive,
  ProhibitedTerm,
  RequiredTerm,
  NamedTerm,
  Term,
  TermValue,
  Range,
  Spatial,
  SpatialOp,
  NotBase,
  RequiredBase,
  Required,
  Prohibited,
  ProhibitedBase,
  AndBase,
  OrBase,
  Glob,
} from './types';

import * as util from 'util';

import * as spatial from './spatial';
import * as wkt from 'terraformer-wkt-parser';

export { spatial };

export function L<T extends Primitive>(value: T): Literal<T> {
  return {
    type: 'literal',
    value,
  };
}
export function glob(value: string): Literal<Glob> {
  return L({
    type: 'glob',
    value,
  });
}

export function defaultTerm(value: TermValue<string>): Term<string>;
export function defaultTerm(value: TermValue<Date>): Term<Date>;
export function defaultTerm(value: TermValue<number>): Term<number>;
export function defaultTerm(
  value: TermValue<Spatial<SpatialOp>>
): Term<Spatial<SpatialOp>>;
export function defaultTerm<T extends Primitive>(value: TermValue<T>): Term<T> {
  return {
    type: 'term',
    value,
  };
}

export function term(
  field: string,
  value: TermValue<string>
): NamedTerm<string>;
export function term(field: string, value: TermValue<Date>): NamedTerm<Date>;
export function term(
  field: string,
  value: TermValue<number>
): NamedTerm<number>;
export function term(
  field: string,
  value: TermValue<Spatial<SpatialOp>>
): NamedTerm<Spatial<SpatialOp>>;
export function term<T extends Primitive>(
  field: string,
  value: TermValue<T>
): NamedTerm<T> {
  return {
    type: 'namedterm',
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

export function not<T extends Primitive>(rhs: TermValue<T>): NotTerm<T>;
export function not(rhs: Clause): Not;
export function not<U>(rhs: U): NotBase<U> {
  return {
    type: 'not',
    rhs,
  };
}

export function required<T extends Primitive>(
  rhs: TermValue<T>
): RequiredTerm<T>;
export function required(rhs: Clause): Required;
export function required<U>(rhs: U): RequiredBase<U> {
  return {
    type: 'required',
    rhs,
  };
}

export function prohibited<T extends Primitive>(
  rhs: TermValue<T>
): ProhibitedTerm<T>;
export function prohibited(rhs: Clause): Prohibited;
export function prohibited<U>(rhs: U): ProhibitedBase<U> {
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

export function and(...more: Array<TermValue<string>>): AndTerm<string>;
export function and(...more: Array<TermValue<number>>): AndTerm<number>;
export function and(...more: Array<TermValue<Date>>): AndTerm<Date>;
export function and(...more: Array<TermValue<Primitive>>): AndTerm<Primitive>;
export function and(
  ...more: Array<TermValue<Spatial<SpatialOp>>>
): AndTerm<Spatial<SpatialOp>>;
export function and<T>(...more: Clause[]): And;
export function and<U>(...more: U[]): AndBase<U> {
  return {
    type: 'and',
    operands: more,
  };
}

export function or(...more: Array<TermValue<string>>): OrTerm<string>;
export function or(...more: Array<TermValue<number>>): OrTerm<number>;
export function or(...more: Array<TermValue<Date>>): OrTerm<Date>;
export function or(...more: Array<TermValue<Primitive>>): OrTerm<Primitive>;
export function or(
  ...more: Array<TermValue<Spatial<SpatialOp>>>
): OrTerm<Spatial<SpatialOp>>;
export function or(...more: Clause[]): Or;
export function or<U>(...more: U[]): OrBase<U> {
  return {
    type: 'or',
    operands: more,
  };
}

/* istanbul ignore next */
function nope(): never {
  throw new Error('unsupported');
}

function toLiteralString(c?: Primitive): string {
  switch (typeof c) {
    case 'undefined':
      return '*';
    case 'string':
      return quoteString(c);
    case 'number':
      return `${c}`;
    default:
      if (util.types.isDate(c)) {
        return c.toISOString();
      }
  }
  switch (c.type) {
    case 'spatial':
      return quoteString(`${c.op}(${wkt.convert(c.value)})`);
    case 'glob':
      return escapedGlob(c.value);
    /* istanbul ignore next */
    default:
      /* istanbul ignore next */
      return nope();
  }
}

function toRangeString<T extends Primitive>(v: Range<T>): string {
  return (
    (v.closedLower ? '[' : '{') +
    toLiteralString(v.lower) +
    ' TO ' +
    toLiteralString(v.upper) +
    (v.closedUpper ? ']' : '}')
  );
}

function escapedGlob(v: string) {
  // don't escape * or ?
  return v.replace(/[ +\-&|!(){}\[\]^"~:/\\]/g, '\\$&');
}

function quoteString(v: string) {
  return `"${v.replace(/["\\]/g, '\\$&')}"`;
}

function binaryOp(op: string, operands: Clause[]) {
  const elems: string[] = [];
  for (const v of operands) {
    elems.push(toStringImpl(v));
  }
  return `(${elems.join(` ${op} `)})`;
}

function toStringImpl(c: Clause): string {
  switch (c.type) {
    case 'range':
      return toRangeString(c);
    case 'term':
      return toStringImpl(c.value);
    case 'namedterm':
      return c.field + ':' + toStringImpl(c.value);
    case 'and':
      return binaryOp('AND', c.operands);
    case 'constant':
      return `(${toStringImpl(c.lhs)})^=${c.rhs}`;
    case 'not':
      return `(NOT ${toStringImpl(c.rhs)})`;
    case 'or':
      return binaryOp('OR', c.operands);
    case 'prohibited':
      return `-${toStringImpl(c.rhs)}`;
    case 'required':
      return `+${toStringImpl(c.rhs)}`;
    case 'literal':
      return toLiteralString(c.value);
    /* istanbul ignore next */
    default:
      /* istanbul ignore next */
      return nope();
  }
}

export function toString(c: Clause): string {
  return toStringImpl(c);
}
