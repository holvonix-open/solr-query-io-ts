import {
  PrimitiveC,
  LSpatial,
  PrimitiveTypes,
  LDate,
  LString,
  LGlob,
  LNumber,
  RangedPrimitiveC,
  GlobPrimitiveC,
} from './types';
import * as t from 'io-ts';

/* tslint:disable:variable-name */
export function forPrimitives<A, O = A, I = unknown>(
  f: <T extends PrimitiveC>(c: T) => t.Type<A, O, I>
): ReadonlyMap<PrimitiveC, t.Type<A, O, I>> {
  const e = PrimitiveTypes.map<[PrimitiveC, t.Type<A, O, I>]>(x => {
    return [x, f(x)];
  });
  return new Map(e);
}
export function noPrimitive(c: unknown) {
  if (LSpatial.types.indexOf(c as typeof LSpatial['types']['0']) >= 0) {
    throw new RangeError(
      'SQM005: Use `LSpatial` instead of an individual spatial operator.'
    );
  }
  throw new RangeError('SQM004: Unsupported primitive codec');
}
export const IsLDate = (c: unknown): c is typeof LDate => c === LDate;
export const IsLString = (c: unknown): c is typeof LString => c === LString;
export const IsLNumber = (c: unknown): c is typeof LNumber => c === LNumber;
export const IsGlob = (c: unknown): c is typeof LGlob => c === LGlob;
export const IsRangedPrimitiveC = (c: unknown): c is RangedPrimitiveC =>
  IsLDate(c) || IsLNumber(c) || IsLString(c);
export const IsGlobPrimitiveC = (c: unknown): c is GlobPrimitiveC =>
  IsLDate(c) || IsLString(c) || IsGlob(c);
