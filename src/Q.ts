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
  NotBase,
  RequiredBase,
  Required,
  Prohibited,
  ProhibitedBase,
  AndBase,
  OrBase,
  Glob,
  LString,
  LDate,
  LNumber,
  RangedPrimitive,
  QueryElement,
} from './types';

import * as util from 'util';

import * as spatial from './spatial';
import * as wkx from 'wkx';

export { spatial };

function LT<T extends Primitive>(value: T['value']): T['type'] {
  if (util.types.isDate(value)) {
    return 'date';
  }
  switch (typeof value) {
    case 'number':
      return 'number';
    case 'string':
      return 'string';
    default:
      throw new RangeError('SQM001: value is not a Date, number, or string');
  }
}

export function L(value: string): Literal<LString>;
export function L(value: number): Literal<LNumber>;
export function L(value: Date): Literal<LDate>;
export function L<T extends Primitive>(value: T['value']): Literal<T> {
  return LL<T>({ type: LT(value), value } as T);
}

export function LL<T extends Primitive>(value: T): Literal<T> {
  return {
    type: 'literal',
    value: value as T & Primitive,
  };
}

export function glob(value: string): Literal<Glob> {
  return LL({
    type: 'glob',
    value,
  });
}

export function defaultTerm(value: TermValue<LString>): Term<LString>;
export function defaultTerm(value: TermValue<LNumber>): Term<LNumber>;
export function defaultTerm(value: TermValue<LDate>): Term<LDate>;
export function defaultTerm(value: TermValue<Spatial>): Term<Spatial>;
export function defaultTerm<T extends Primitive>(value: TermValue<T>): Term<T> {
  return {
    type: 'term',
    value,
  };
}

export function term(
  field: string,
  value: TermValue<LString>
): NamedTerm<LString>;
export function term(
  field: string,
  value: TermValue<LNumber>
): NamedTerm<LNumber>;
export function term(field: string, value: TermValue<LDate>): NamedTerm<LDate>;
export function term(
  field: string,
  value: TermValue<Spatial>
): NamedTerm<Spatial>;
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
): Range<LString>;
export function range(
  closedLower: boolean,
  closedUpper: boolean,
  lower?: number,
  upper?: number
): Range<LNumber>;
export function range(
  closedLower: boolean,
  closedUpper: boolean,
  lower?: Date,
  upper?: Date
): Range<LDate>;
export function range<T extends RangedPrimitive>(
  closedLower: boolean,
  closedUpper: boolean,
  lower?: T['value'],
  upper?: T['value']
): Range<T> {
  return rangeImpl(closedLower, closedUpper, lower, upper);
}

function rangeImpl<T extends RangedPrimitive>(
  closedLower: boolean,
  closedUpper: boolean,
  lower?: T['value'],
  upper?: T['value']
): Range<T> {
  if (lower == null && upper == null) {
    throw new Error('SQM002: unbounded range');
  }
  const typeSource = (lower == null ? upper : lower)!;
  const lt = LT(typeSource);
  if (lower != null && upper != null) {
    if (LT(upper) !== lt) {
      throw new Error('SQM003: range bound types must match');
    }
  }
  return {
    type: 'range',
    valueType: LT(typeSource),
    closedLower,
    closedUpper,
    lower,
    upper,
  };
}

export function openRange(lower?: string, upper?: string): Range<LString>;
export function openRange(lower?: number, upper?: number): Range<LNumber>;
export function openRange(lower?: Date, upper?: Date): Range<LDate>;
export function openRange<T extends RangedPrimitive>(
  lower?: T['value'],
  upper?: T['value']
): Range<T> {
  return rangeImpl(false, false, lower, upper);
}

export function closedRange(lower?: string, upper?: string): Range<LString>;
export function closedRange(lower?: number, upper?: number): Range<LNumber>;
export function closedRange(lower?: Date, upper?: Date): Range<LDate>;
export function closedRange<T extends RangedPrimitive>(
  lower?: T['value'],
  upper?: T['value']
): Range<T> {
  return rangeImpl(true, true, lower, upper);
}

export function not(rhs: TermValue<LString>): NotTerm<LString>;
export function not(rhs: TermValue<LNumber>): NotTerm<LNumber>;
export function not(rhs: TermValue<LDate>): NotTerm<LDate>;
export function not(rhs: TermValue<Spatial>): NotTerm<Spatial>;
export function not(rhs: Clause): Not;
export function not<U>(rhs: U): NotBase<U> {
  return {
    type: 'not',
    rhs,
  };
}

export function required(rhs: TermValue<LString>): RequiredTerm<LString>;
export function required(rhs: TermValue<LNumber>): RequiredTerm<LNumber>;
export function required(rhs: TermValue<LDate>): RequiredTerm<LDate>;
export function required(rhs: TermValue<Spatial>): RequiredTerm<Spatial>;
export function required(rhs: Clause): Required;
export function required<U>(rhs: U): RequiredBase<U> {
  return {
    type: 'required',
    rhs,
  };
}

export function prohibited(rhs: TermValue<LString>): ProhibitedTerm<LString>;
export function prohibited(rhs: TermValue<LNumber>): ProhibitedTerm<LNumber>;
export function prohibited(rhs: TermValue<LDate>): ProhibitedTerm<LDate>;
export function prohibited(rhs: TermValue<Spatial>): ProhibitedTerm<Spatial>;
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

export function and(...more: Array<TermValue<LString>>): AndTerm<LString>;
export function and(...more: Array<TermValue<LNumber>>): AndTerm<LNumber>;
export function and(...more: Array<TermValue<LDate>>): AndTerm<LDate>;
export function and(...more: Array<TermValue<Spatial>>): AndTerm<Spatial>;
export function and<T>(...more: Clause[]): And;
export function and<U>(...more: U[]): AndBase<U> {
  return {
    type: 'and',
    operands: more,
  };
}

export function or(...more: Array<TermValue<LString>>): OrTerm<LString>;
export function or(...more: Array<TermValue<LNumber>>): OrTerm<LNumber>;
export function or(...more: Array<TermValue<LDate>>): OrTerm<LDate>;
export function or(...more: Array<TermValue<Spatial>>): OrTerm<Spatial>;
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

function wkt(g: Spatial['value']['geom']): string {
  return wkx.Geometry.parseGeoJSON(g).toWkt();
}

function toLiteralString<T extends Primitive>(
  ct: T['type'],
  c?: T['value']
): string {
  if (c == null) {
    return '*';
  }
  switch (ct) {
    case 'string':
      return quoteString(c as string);
    case 'number':
      return `${c as number}`;
    case 'date':
      return (c as Date).toISOString();
    case 'spatial':
      return quoteString(
        `${(c as Spatial['value']).op}(${wkt((c as Spatial['value']).geom)})`
      );
    case 'glob':
      return escapedGlob(c as string);
    /* istanbul ignore next */
    default:
      /* istanbul ignore next */
      return nope();
  }
}

function toRangeString(v: Range<RangedPrimitive>): string {
  return (
    (v.closedLower ? '[' : '{') +
    toLiteralString(v.valueType, v.lower) +
    ' TO ' +
    toLiteralString(v.valueType, v.upper) +
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

function binaryOp(op: string, operands: QueryElement[]) {
  const elems: string[] = [];
  for (const v of operands) {
    elems.push(toStringImpl(v));
  }
  return `(${elems.join(` ${op} `)})`;
}

function toStringImpl(c: QueryElement): string {
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
      return toLiteralString(c.value.type, c.value.value);
    /* istanbul ignore next */
    default:
      console.error(util.inspect(c, false, 1000, true));
      /* istanbul ignore next */
      return nope();
  }
}

export function toString(c: QueryElement): string {
  return toStringImpl(c);
}
