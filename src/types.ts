import * as t from 'io-ts';
import { date } from 'io-ts-types/lib/date';
import * as geojson from '@holvonix-open/geojson-io-ts';

/* tslint:disable:variable-name */

export const SpatialOp = t.keyof({
  Intersects: null,
  IsWithin: null,
  Contains: null,
  IsDisjointTo: null,
});
export type SpatialOp = t.TypeOf<typeof SpatialOp>;

const spatial = <T extends SpatialOp>(s: T) =>
  t.type({
    type: t.literal('spatial'),
    value: t.type({
      geom: geojson.GeometryObjectIO,
      op: t.literal(s),
    }),
  });

export const Intersects = spatial('Intersects');
export type Intersects = t.TypeOf<typeof Intersects>;
export const IsWithin = spatial('IsWithin');
export type IsWithin = t.TypeOf<typeof IsWithin>;
export const Contains = spatial('Contains');
export type Contains = t.TypeOf<typeof Contains>;
export const IsDisjointTo = spatial('IsDisjointTo');
export type IsDisjointTo = t.TypeOf<typeof IsDisjointTo>;

export type TypeOfUnion<T extends t.UnionType<t.Any[]>> = T['types'][number];

export const Spatial = t.union([Intersects, IsWithin, Contains, IsDisjointTo]);
export type SpatialC = TypeOfUnion<typeof Spatial>;
export type Spatial = t.TypeOf<typeof Spatial>;

export const Glob = t.type({
  type: t.literal('glob'),
  value: t.string,
});
export type Glob = t.TypeOf<typeof Glob>;

export const LString = t.type({
  type: t.literal('string'),
  value: t.string,
});
export type LString = t.TypeOf<typeof LString>;

export const LNumber = t.type({
  type: t.literal('number'),
  value: t.number,
});
export type LNumber = t.TypeOf<typeof LNumber>;

export const LDate = t.type({
  type: t.literal('date'),
  value: date,
});
export type LDate = t.TypeOf<typeof LDate>;

export const PrimitiveTypes = [LNumber, LString, LDate, Glob, Spatial];
export const Primitive = t.union([LNumber, LString, LDate, Glob, Spatial]);
export type PrimitiveC = TypeOfUnion<typeof Primitive>;
export type Primitive = t.TypeOf<typeof Primitive>;
export type PrimitiveValueType = Primitive['value'];

function forPrimitives<A, O = A, I = unknown>(
  f: <T extends PrimitiveC>(c: T) => t.Type<A, O, I>
): ReadonlyMap<PrimitiveC, t.Type<A, O, I>> {
  const e = PrimitiveTypes.map<[PrimitiveC, t.Type<A, O, I>]>(x => {
    return [x, f(x)];
  });
  return new Map(e);
}

export const Literal = forPrimitives(<T extends PrimitiveC>(c: PrimitiveC) =>
  t.type({
    type: t.literal('literal'),
    value: c,
  })
);
export type SomeLiteral = t.Type<Literal<Primitive>>;
export const AnyLiteral = t.union(Array.from(Literal).map(x => x[1]) as [
  SomeLiteral,
  SomeLiteral,
  ...SomeLiteral[]
]);
export interface Literal<T extends Primitive> {
  type: 'literal';
  value: T;
}

const IsLDate = (c: unknown): c is typeof LDate => c === LDate;
const IsLString = (c: unknown): c is typeof LString => c === LString;
const IsLNumber = (c: unknown): c is typeof LNumber => c === LNumber;
const IsGlob = (c: unknown): c is typeof Glob => c === Glob;
const IsRangedPrimitiveC = (c: unknown): c is RangedPrimitiveC =>
  IsLDate(c) || IsLNumber(c) || IsLString(c);

export const GlobPrimitiveTypes = [Glob, LString, LDate];
export const GlobPrimitive = t.union([Glob, LString, LDate]);
export type GlobPrimitiveC = TypeOfUnion<typeof GlobPrimitive>;
const IsGlobPrimitiveC = (c: unknown): c is GlobPrimitiveC =>
  IsLDate(c) || IsLString(c) || IsGlob(c);

export const RangedPrimitiveTypes = [LNumber, LString, LDate];
export const RangedPrimitive = t.union([LNumber, LString, LDate]);
export type RangedPrimitiveC = TypeOfUnion<typeof RangedPrimitive>;
export type RangedPrimitive = t.TypeOf<typeof RangedPrimitive>;
export type RangedPrimitiveValueType = RangedPrimitive['value'];

function forRangedPrimitives<A, O, I>(
  f: <T extends RangedPrimitiveC>(c: T) => t.Type<A, O, I>
): ReadonlyMap<RangedPrimitiveC, t.Type<A, O, I>> {
  const e = RangedPrimitiveTypes.map<[RangedPrimitiveC, t.Type<A, O, I>]>(x => {
    return [x, f(x)];
  });
  return new Map(e);
}

export const Range = forRangedPrimitives(<T extends RangedPrimitiveC>(c: T) =>
  t.intersection([
    t.type({
      type: t.literal('range'),
      valueType: c.props.type,
      closedLower: t.boolean,
      closedUpper: t.boolean,
    }),
    t.partial({
      lower: c.props.value,
      upper: c.props.value,
    }),
  ])
);
export type SomeRange = t.Type<Range<RangedPrimitive>>;
export const AnyRange = t.union(Array.from(Range).map(x => x[1]) as [
  SomeRange,
  SomeRange,
  ...SomeRange[]
]);
export interface Range<T extends RangedPrimitive> {
  type: 'range';
  valueType: T['type'];
  lower?: T['value'];
  upper?: T['value'];

  closedLower: boolean;
  closedUpper: boolean;
}

export type MaybeGlob<T extends Primitive> = T extends LString
  ? Literal<Glob>
  : T extends LDate
  ? Literal<Glob>
  : T extends Glob
  ? Literal<Glob>
  : never;

export type MaybeRange<T extends Primitive> = T extends LString
  ? Range<T>
  : T extends LDate
  ? Range<T>
  : T extends LNumber
  ? Range<T>
  : never;

export type TermValue<T extends Primitive> =
  | Literal<T>
  | MaybeGlob<T>
  | MaybeRange<T>
  | NonPrimitiveTermValue<T>;
export const TermValue = forPrimitives<TermValue<t.TypeOf<PrimitiveC>>>(
  <T extends PrimitiveC>(c: T): t.Type<TermValue<t.TypeOf<PrimitiveC>>> =>
    t.recursion(`TermValue<${c.name}>`, () => {
      let ret: t.Type<TermValue<t.TypeOf<PrimitiveC>>> | undefined = undefined;
      if (IsGlobPrimitiveC(c)) {
        ret = Literal.get(Glob)! as t.Type<TermValue<t.TypeOf<PrimitiveC>>>;
      }
      if (IsRangedPrimitiveC(c)) {
        ret = (ret ? t.union([ret, Range.get(c)!]) : Range.get(c)!) as t.Type<
          TermValue<t.TypeOf<PrimitiveC>>
        >;
      }
      if (ret) {
        ret = t.union([
          Literal.get(c)!,
          NonPrimitiveTermValue.get(c)!,
          ret,
        ]) as t.Type<TermValue<t.TypeOf<PrimitiveC>>>;
      } else {
        ret = t.union([
          Literal.get(c)!,
          NonPrimitiveTermValue.get(c)!,
        ]) as t.Type<TermValue<t.TypeOf<PrimitiveC>>>;
      }
      return ret!;
    })
);

export interface AndBase<U> {
  type: 'and';
  operands: U[];
}
const AndBase = <U extends t.Any>(c: U) =>
  t.type({
    type: t.literal('and'),
    operands: t.array(c),
  });
export interface And extends AndBase<Clause> {}
export const And = t.recursion<And>('And', (): t.Type<And> => AndBase(Clause));
export interface AndTerm<T extends Primitive> extends AndBase<TermValue<T>> {}
export const AndTerm = forPrimitives(
  <U extends PrimitiveC>(c: U): t.Type<AndTerm<t.TypeOf<U>>> =>
    t.recursion(
      `AndTerm<${c.name}>`,
      () => AndBase(TermValue.get(c)!) as t.Type<AndTerm<t.TypeOf<U>>>
    )
);

export interface OrBase<U> {
  type: 'or';
  operands: U[];
}
const OrBase = <U extends t.Any>(c: U) =>
  t.type({
    type: t.literal('or'),
    operands: t.array(c),
  });
export interface Or extends OrBase<Clause> {}
export const Or = t.recursion<Or>('Or', (): t.Type<Or> => OrBase(Clause));
export interface OrTerm<T extends Primitive> extends OrBase<TermValue<T>> {}
export const OrTerm = forPrimitives(
  <U extends PrimitiveC>(c: U): t.Type<OrTerm<t.TypeOf<U>>> =>
    t.recursion(
      `OrTerm<${c.name}>`,
      () => OrBase(TermValue.get(c)!) as t.Type<OrTerm<t.TypeOf<U>>>
    )
);

export interface NotBase<U> {
  type: 'not';
  rhs: U;
}
const NotBase = <U extends t.Any>(c: U) =>
  t.type({
    type: t.literal('not'),
    rhs: c,
  });
export interface Not extends NotBase<Clause> {}
export const Not = t.recursion<Not>('Not', (): t.Type<Not> => NotBase(Clause));
export interface NotTerm<T extends Primitive> extends NotBase<TermValue<T>> {}
export const NotTerm = forPrimitives(
  <U extends PrimitiveC>(c: U): t.Type<NotTerm<t.TypeOf<U>>> =>
    t.recursion(
      `NotTerm<${c.name}>`,
      () => NotBase(TermValue.get(c)!) as t.Type<NotTerm<t.TypeOf<U>>>
    )
);

export interface RequiredBase<U> {
  type: 'required';
  rhs: U;
}
const RequiredBase = <U extends t.Any>(c: U) =>
  t.type({
    type: t.literal('required'),
    rhs: c,
  });
export interface Required extends RequiredBase<Clause> {}
export const Required = t.recursion<Required>(
  'Required',
  (): t.Type<Required> => RequiredBase(Clause)
);
export interface RequiredTerm<T extends Primitive>
  extends RequiredBase<TermValue<T>> {}
export const RequiredTerm = forPrimitives(
  <U extends PrimitiveC>(c: U): t.Type<RequiredTerm<t.TypeOf<U>>> =>
    t.recursion(
      `RequiredTerm<${c.name}>`,
      () => RequiredBase(TermValue.get(c)!) as t.Type<RequiredTerm<t.TypeOf<U>>>
    )
);

export interface ProhibitedBase<U> {
  type: 'prohibited';
  rhs: U;
}
const ProhibitedBase = <U extends t.Any>(c: U) =>
  t.type({
    type: t.literal('prohibited'),
    rhs: c,
  });
export interface Prohibited extends ProhibitedBase<Clause> {}
export const Prohibited = t.recursion<Prohibited>(
  'Prohibited',
  (): t.Type<Prohibited> => ProhibitedBase(Clause)
);
export interface ProhibitedTerm<T extends Primitive>
  extends ProhibitedBase<TermValue<T>> {}
export const ProhibitedTerm = forPrimitives(
  <U extends PrimitiveC>(c: U): t.Type<ProhibitedTerm<t.TypeOf<U>>> =>
    t.recursion(
      `ProhibitedTerm<${c.name}>`,
      () =>
        ProhibitedBase(TermValue.get(c)!) as t.Type<ProhibitedTerm<t.TypeOf<U>>>
    )
);

export interface ConstantScore {
  type: 'constant';
  lhs: Clause;
  rhs: number;
}
export const ConstantScore = t.recursion<ConstantScore>(
  'ConstantScore',
  (): t.Type<ConstantScore> =>
    t.type({
      type: t.literal('constant'),
      lhs: Clause,
      rhs: t.number,
    })
);

export type NonPrimitiveTermValue<T extends Primitive> =
  | AndTerm<T>
  | OrTerm<T>
  | NotTerm<T>
  | RequiredTerm<T>
  | ProhibitedTerm<T>;
export const NonPrimitiveTermValue = forPrimitives(
  <T extends PrimitiveC>(c: T): t.Type<NonPrimitiveTermValue<t.TypeOf<T>>> =>
    t.recursion(
      `NonPrimitiveTermValue<${c.name}>`,
      () =>
        t.union([
          AndTerm.get(c)!,
          OrTerm.get(c)!,
          NotTerm.get(c)!,
          RequiredTerm.get(c)!,
          ProhibitedTerm.get(c)!,
        ]) as t.Type<NonPrimitiveTermValue<t.TypeOf<T>>>
    )
);

export interface NamedTerm<T extends Primitive> {
  type: 'namedterm';
  field: string;
  value: TermValue<T>;
}
export const NamedTerm = forPrimitives(<T extends PrimitiveC>(c: T) =>
  t.type({
    type: t.literal('namedterm'),
    field: t.string,
    value: TermValue.get(c)!,
  })
);
export type SomeNamedTerm = t.Type<NamedTerm<Primitive>>;
export const AnyNamedTerm = t.union(Array.from(NamedTerm).map(x => x[1]) as [
  SomeNamedTerm,
  SomeNamedTerm,
  ...SomeNamedTerm[]
]);
export type AnyNamedTerm = t.TypeOf<typeof AnyNamedTerm>;

export interface Term<T extends Primitive> {
  type: 'term';
  value: TermValue<T>;
}
export const Term = forPrimitives(<T extends PrimitiveC>(c: T) =>
  t.type({
    type: t.literal('term'),
    value: TermValue.get(c)!,
  })
);
export type SomeTerm = t.Type<Term<Primitive>>;
export const AnyTerm = t.union(Array.from(Term).map(x => x[1]) as [
  SomeTerm,
  SomeTerm,
  ...SomeTerm[]
]);
export type AnyTerm = t.TypeOf<typeof AnyTerm>;

export type Clause =
  | Term<LString>
  | Term<LNumber>
  | Term<LDate>
  | Term<Spatial>
  | NamedTerm<LString>
  | NamedTerm<LNumber>
  | NamedTerm<LDate>
  | NamedTerm<Spatial>
  | ConstantScore
  | And
  | Or
  | Not
  | Required
  | Prohibited;

export const Clause = t.recursion<Clause>(
  'Clause',
  () =>
    t.union([
      Term.get(LString)!,
      Term.get(LNumber)!,
      Term.get(LDate)!,
      Term.get(Spatial)!,
      NamedTerm.get(LString)!,
      NamedTerm.get(LNumber)!,
      NamedTerm.get(LDate)!,
      NamedTerm.get(Spatial)!,
      ConstantScore,
      And,
      Or,
      Not,
      Required,
      Prohibited,
    ]) as t.Type<Clause>
);

export const AnyTermValue = t.union([
  TermValue.get(LNumber)!,
  TermValue.get(LDate)!,
  TermValue.get(LString)!,
  TermValue.get(Spatial)!,
]);
export type AnyTermValue = t.TypeOf<typeof AnyTermValue>;

export const QueryElement = t.union([Clause, AnyTermValue]);
export type QueryElement = t.TypeOf<typeof QueryElement>;
