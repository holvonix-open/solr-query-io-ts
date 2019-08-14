import * as t from 'io-ts';
import { date, DateC } from 'io-ts-types/lib/date';
import {
  DateFromISOString,
  DateFromISOStringC,
} from 'io-ts-types/lib/DateFromISOString';
import {
  NumberFromString,
  NumberFromStringC,
} from 'io-ts-types/lib/NumberFromString';
import { Q } from '.';
import {
  LDate,
  LNumber,
  LString,
  MaybeRange,
  OrTerm,
  Primitive,
  PrimitiveType,
  TermValue,
} from './types';

/* tslint:disable:variable-name */
type OneOrMany<T> = T | ReadonlyArray<T>;
const OneOrMany = <T extends t.Type<U, V, unknown>, U, V>(c: T) =>
  t.union([c, t.readonlyArray(c)]);

interface EQ<T> {
  readonly eq?: OneOrMany<T>;
}
const EQ = <T extends t.Type<U, V, unknown>, U, V>(c: T) =>
  t.readonly(
    t.partial({
      eq: OneOrMany<T, U, V>(c),
    })
  );

interface NEQ<T> {
  readonly neq?: OneOrMany<T>;
}
const NEQ = <T extends t.Type<U, V, unknown>, U, V>(c: T) =>
  t.readonly(
    t.partial({
      neq: OneOrMany<T, U, V>(c),
    })
  );

interface LT<T> {
  readonly lt?: OneOrMany<T>;
}
const LT = <T extends t.Type<U, V, unknown>, U, V>(c: T) =>
  t.readonly(
    t.partial({
      lt: OneOrMany<T, U, V>(c),
    })
  );

interface GT<T> {
  readonly gt?: OneOrMany<T>;
}
const GT = <T extends t.Type<U, V, unknown>, U, V>(c: T) =>
  t.readonly(
    t.partial({
      gt: OneOrMany<T, U, V>(c),
    })
  );

interface LTE<T> {
  readonly lte?: OneOrMany<T>;
}
const LTE = <T extends t.Type<U, V, unknown>, U, V>(c: T) =>
  t.readonly(
    t.partial({
      lte: OneOrMany<T, U, V>(c),
    })
  );

interface GTE<T> {
  readonly gte?: OneOrMany<T>;
}
const GTE = <T extends t.Type<U, V, unknown>, U, V>(c: T) =>
  t.readonly(
    t.partial({
      gte: OneOrMany<T, U, V>(c),
    })
  );

const Glob = t.readonly(
  t.partial({
    glob: t.union([t.string, t.readonlyArray(t.string)]),
  })
);
type Glob = t.TypeOf<typeof Glob>;

type BaseSimpleTermValue<T> = EQ<T> & NEQ<T> & LT<T> & GT<T> & LTE<T> & GTE<T>;

const baseSimpleTermValue = <T extends t.Type<U, V, unknown>, U, V>(c: T) => {
  return t.intersection([
    EQ<T, U, V>(c),
    NEQ<T, U, V>(c),
    t.intersection([
      LT<T, U, V>(c),
      GT<T, U, V>(c),
      LTE<T, U, V>(c),
      GTE<T, U, V>(c),
    ]),
  ]);
};

export const SimpleStringTermValue = t.intersection([
  baseSimpleTermValue<t.StringC, string, string>(t.string),
  Glob,
]);
export type SimpleStringTermValue = t.TypeOf<typeof SimpleStringTermValue>;

export const SimpleDateTermValue = t.intersection([
  baseSimpleTermValue<DateC, Date, Date>(date),
  Glob,
]);
export type SimpleDateTermValue = t.TypeOf<typeof SimpleDateTermValue>;
export const SimpleDateTermValueFromStrings: t.Type<
  SimpleDateTermValue,
  BaseSimpleTermValue<string> & Glob
> = t.intersection([
  baseSimpleTermValue<DateFromISOStringC, Date, string>(DateFromISOString),
  Glob,
]);

export const SimpleNumberTermValue = baseSimpleTermValue<
  t.NumberC,
  number,
  number
>(t.number);
export type SimpleNumberTermValue = t.TypeOf<typeof SimpleNumberTermValue>;
export const SimpleNumberTermValueFromStrings: t.Type<
  SimpleNumberTermValue,
  BaseSimpleTermValue<string>
> = baseSimpleTermValue<NumberFromStringC, number, string>(NumberFromString);

const isTArray = <T>(k?: OneOrMany<T>): k is readonly T[] => Array.isArray(k);

function alwaysArray<T>(x?: OneOrMany<T>) {
  return x == null ? [] : isTArray(x) ? x : [x];
}

function filterOrs<T extends Primitive>(...clauses: Array<OrTerm<T>>) {
  return clauses.filter(x => x.operands.length > 0);
}

function baseSimpleTermValueOperands<T extends string | number | Date>(
  n: BaseSimpleTermValue<T>
) {
  type P = PrimitiveType<T>;
  const clauses: Array<OrTerm<P>> = [];
  clauses.push(Q.or(...alwaysArray(n.eq).map(x => Q.L(x))));
  clauses.push(Q.or(...alwaysArray(n.neq).map(x => Q.not(Q.L(x)))));
  clauses.push(
    Q.or(
      ...alwaysArray(n.gt).map(x => Q.openRange(x, undefined) as MaybeRange<P>)
    )
  );
  clauses.push(
    Q.or(
      ...alwaysArray(n.lt).map(x => Q.openRange(undefined, x) as MaybeRange<P>)
    )
  );
  clauses.push(
    Q.or(
      ...alwaysArray(n.gte).map(
        x => Q.closedRange(x, undefined) as MaybeRange<P>
      )
    )
  );
  clauses.push(
    Q.or(
      ...alwaysArray(n.lte).map(
        x => Q.closedRange(undefined, x) as MaybeRange<P>
      )
    )
  );
  return clauses;
}

function convertGlobSimpleTermValue<T extends string | Date>(n: Glob) {
  type P = PrimitiveType<T>;
  return Q.or(...alwaysArray(n.glob).map(x => Q.glob(x) as TermValue<P>));
}

const LNumberTermValueFromSimpleTermValueType = SimpleNumberTermValue.pipe(
  new t.Type<TermValue<LNumber>, SimpleNumberTermValue, SimpleNumberTermValue>(
    'solr-query-io-ts:LNumberTermValueFromSimpleTermValueType-pipe',
    TermValue(LNumber).is,
    (inp, ctx) => {
      return t.success(
        Q.and(...filterOrs(...baseSimpleTermValueOperands(inp)))
      );
    },
    /* istanbul ignore next */
    () => {
      throw new Error();
    }
  )
);
export const LNumberTermValueFromSimpleTermValue = LNumberTermValueFromSimpleTermValueType.asDecoder();

const LStringTermValueFromSimpleTermValueType = SimpleStringTermValue.pipe(
  new t.Type<TermValue<LString>, SimpleStringTermValue, SimpleStringTermValue>(
    'solr-query-io-ts:LStringTermValueFromSimpleTermValueType-pipe',
    TermValue(LString).is,
    (inp, ctx) => {
      return t.success(
        Q.and(
          ...filterOrs(
            ...baseSimpleTermValueOperands(inp),
            convertGlobSimpleTermValue<string>(inp)
          )
        )
      );
    },
    /* istanbul ignore next */
    () => {
      throw new Error();
    }
  )
);
export const LStringTermValueFromSimpleTermValue = LStringTermValueFromSimpleTermValueType.asDecoder();

const LDateTermValueFromSimpleTermValueType = SimpleDateTermValue.pipe(
  new t.Type<TermValue<LDate>, SimpleDateTermValue, SimpleDateTermValue>(
    'solr-query-io-ts:LDateTermValueFromSimpleTermValueType-pipe',
    TermValue(LDate).is,
    (inp, ctx) => {
      return t.success(
        Q.and(
          ...filterOrs(
            ...baseSimpleTermValueOperands(inp),
            convertGlobSimpleTermValue<Date>(inp)
          )
        )
      );
    },
    /* istanbul ignore next */
    () => {
      throw new Error();
    }
  )
);
export const LDateTermValueFromSimpleTermValue = LDateTermValueFromSimpleTermValueType.asDecoder();

export interface LNumberTermValueFromSimpleStringsC
  extends t.Decoder<unknown, TermValue<LNumber>> {}
export const LNumberTermValueFromSimpleStrings: LNumberTermValueFromSimpleStringsC = SimpleNumberTermValueFromStrings.pipe(
  LNumberTermValueFromSimpleTermValueType
).asDecoder();

export interface LStringTermValueFromSimpleStringsC
  extends t.Decoder<unknown, TermValue<LString>> {}
export const LStringTermValueFromSimpleStrings: LStringTermValueFromSimpleStringsC = SimpleStringTermValue.pipe(
  LStringTermValueFromSimpleTermValueType
).asDecoder();

export interface LDateTermValueFromSimpleStringsC
  extends t.Decoder<unknown, TermValue<LDate>> {}
export const LDateTermValueFromSimpleStrings: LDateTermValueFromSimpleStringsC = SimpleDateTermValueFromStrings.pipe(
  LDateTermValueFromSimpleTermValueType
).asDecoder();
