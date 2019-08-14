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
  LSpatial,
  NotBase,
  RequiredBase,
  Required,
  Prohibited,
  ProhibitedBase,
  AndBase,
  OrBase,
  LGlob,
  LString,
  LDate,
  LNumber,
  RangedPrimitive,
  PrimitiveType,
  RangedPrimitiveValueType,
} from './types';

import * as util from 'util';

import * as spatial from './spatial';

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
export function L<T>(value: T): Literal<PrimitiveType<T>>;
export function L<T extends Primitive>(value: T['value']): Literal<T> {
  return LL<T>({ type: LT(value), value } as T);
}

export function LL<T extends Primitive>(value: T): Literal<T> {
  return {
    type: 'literal',
    value: value as T & Primitive,
  };
}

export function glob(value: string): Literal<LGlob> {
  return LL({
    type: 'glob',
    value,
  });
}

export function defaultTerm(value: TermValue<LString>): Term<LString>;
export function defaultTerm(value: TermValue<LNumber>): Term<LNumber>;
export function defaultTerm(value: TermValue<LDate>): Term<LDate>;
export function defaultTerm(value: TermValue<LSpatial>): Term<LSpatial>;
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
  value: TermValue<LSpatial>
): NamedTerm<LSpatial>;
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
export function range<T extends RangedPrimitiveValueType>(
  closedLower: boolean,
  closedUpper: boolean,
  lower?: T,
  upper?: T
): Range<PrimitiveType<T>>;
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
export function openRange<T extends RangedPrimitiveValueType>(
  lower?: T,
  upper?: T
): Range<PrimitiveType<T>>;
export function openRange<T extends RangedPrimitive>(
  lower?: T['value'],
  upper?: T['value']
): Range<T> {
  return rangeImpl(false, false, lower, upper);
}

export function closedRange(lower?: string, upper?: string): Range<LString>;
export function closedRange(lower?: number, upper?: number): Range<LNumber>;
export function closedRange(lower?: Date, upper?: Date): Range<LDate>;
export function closedRange<T extends RangedPrimitiveValueType>(
  lower?: T,
  upper?: T
): Range<PrimitiveType<T>>;
export function closedRange<T extends RangedPrimitive>(
  lower?: T['value'],
  upper?: T['value']
): Range<T> {
  return rangeImpl(true, true, lower, upper);
}

export function not(rhs: TermValue<LString>): NotTerm<LString>;
export function not(rhs: TermValue<LNumber>): NotTerm<LNumber>;
export function not(rhs: TermValue<LDate>): NotTerm<LDate>;
export function not(rhs: TermValue<LSpatial>): NotTerm<LSpatial>;
export function not<T>(
  rhs: TermValue<PrimitiveType<T>>
): NotTerm<PrimitiveType<T>>;
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
export function required(rhs: TermValue<LSpatial>): RequiredTerm<LSpatial>;
export function required<T>(
  rhs: TermValue<PrimitiveType<T>>
): RequiredTerm<PrimitiveType<T>>;
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
export function prohibited(rhs: TermValue<LSpatial>): ProhibitedTerm<LSpatial>;
export function prohibited<T>(
  rhs: TermValue<PrimitiveType<T>>
): ProhibitedTerm<PrimitiveType<T>>;
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
export function and(...more: Array<TermValue<LSpatial>>): AndTerm<LSpatial>;
export function and<T>(
  ...more: Array<TermValue<PrimitiveType<T>>>
): AndTerm<PrimitiveType<T>>;
export function and(...more: Clause[]): And;
export function and<U>(...more: U[]): AndBase<U> {
  return {
    type: 'and',
    operands: more,
  };
}

export function or(...more: Array<TermValue<LString>>): OrTerm<LString>;
export function or(...more: Array<TermValue<LNumber>>): OrTerm<LNumber>;
export function or(...more: Array<TermValue<LDate>>): OrTerm<LDate>;
export function or(...more: Array<TermValue<LSpatial>>): OrTerm<LSpatial>;
export function or<T>(
  ...more: Array<TermValue<PrimitiveType<T>>>
): OrTerm<PrimitiveType<T>>;
export function or(...more: Clause[]): Or;
export function or<U>(...more: U[]): OrBase<U> {
  return {
    type: 'or',
    operands: more,
  };
}
