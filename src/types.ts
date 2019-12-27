import * as t from 'io-ts';
import { date } from 'io-ts-types/lib/date';
import * as geojson from '@holvonix-open/geojson-io-ts';
import {
  forPrimitives,
  noPrimitive,
  IsGlobPrimitiveC,
  IsRangedPrimitiveC,
} from './utils';

/* tslint:disable:variable-name */

export const SpatialOp = t.keyof({
  Intersects: null,
  IsWithin: null,
  Contains: null,
  IsDisjointTo: null,
});
export type SpatialOp = t.TypeOf<typeof SpatialOp>;

const spatial = <T extends SpatialOp>(s: T) =>
  t.readonly(
    t.type({
      type: t.literal('spatial'),
      value: t.type({
        geom: geojson.GeometryObjectIO,
        op: t.literal(s),
      }),
    })
  );

export const Intersects = spatial('Intersects');
export type Intersects = t.TypeOf<typeof Intersects>;
export const IsWithin = spatial('IsWithin');
export type IsWithin = t.TypeOf<typeof IsWithin>;
export const Contains = spatial('Contains');
export type Contains = t.TypeOf<typeof Contains>;
export const IsDisjointTo = spatial('IsDisjointTo');
export type IsDisjointTo = t.TypeOf<typeof IsDisjointTo>;

export type TypeOfUnion<T extends t.UnionType<t.Any[]>> = T['types'][number];

export const LSpatial = t.union([Intersects, IsWithin, Contains, IsDisjointTo]);
export type SpatialC = TypeOfUnion<typeof LSpatial>;
export type LSpatial = t.TypeOf<typeof LSpatial>;

export const LGlob = t.readonly(
  t.type({
    type: t.literal('glob'),
    value: t.string,
  })
);
export type LGlob = t.TypeOf<typeof LGlob>;

export const LString = t.readonly(
  t.type({
    type: t.literal('string'),
    value: t.string,
  })
);
export type LString = t.TypeOf<typeof LString>;

export const LNumber = t.readonly(
  t.type({
    type: t.literal('number'),
    value: t.number,
  })
);
export type LNumber = t.TypeOf<typeof LNumber>;

export const LDate = t.readonly(
  t.type({
    type: t.literal('date'),
    value: date,
  })
);
export type LDate = t.TypeOf<typeof LDate>;

export const PrimitiveTypes = [
  LNumber,
  LString,
  LDate,
  LGlob,
  LSpatial,
] as ReadonlyArray<PrimitiveC>;
export const Primitive = t.union([LNumber, LString, LDate, LGlob, LSpatial]);
export type PrimitiveC = TypeOfUnion<typeof Primitive>;
export type Primitive = t.TypeOf<typeof Primitive>;
export type PrimitiveValueType = Primitive['value'];

export type PrimitiveType<T> = T extends number
  ? LNumber
  : T extends string
  ? LString
  : T extends Date
  ? LDate
  : never;

const literal = forPrimitives(<T extends PrimitiveC>(c: PrimitiveC) =>
  t.readonly(
    t.type({
      type: t.literal('literal'),
      value: c,
    })
  )
);
export function Literal<T extends PrimitiveC>(
  c: T
): t.Type<Literal<t.TypeOf<T>>> {
  return (literal.get(c)! as t.Type<Literal<t.TypeOf<T>>>) || noPrimitive(c);
}

export type SomeLiteral = t.Type<Literal<Primitive>>;
export const AnyLiteral = t.union(
  Array.from(literal).map(x => x[1]) as [
    SomeLiteral,
    SomeLiteral,
    ...SomeLiteral[]
  ]
);
export interface Literal<T extends Primitive> {
  readonly type: 'literal';
  readonly value: T;
}

export const GlobPrimitiveTypes = [LGlob, LString, LDate] as ReadonlyArray<
  GlobPrimitiveC
>;
export const GlobPrimitive = t.union([LGlob, LString, LDate]);
export type GlobPrimitiveC = TypeOfUnion<typeof GlobPrimitive>;
export type GlobPrimitive = t.TypeOf<typeof GlobPrimitive>;
export type GlobPrimitiveValueType = GlobPrimitive['value'];

export const RangedPrimitiveTypes = [LNumber, LString, LDate] as ReadonlyArray<
  RangedPrimitiveC
>;
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

const range = forRangedPrimitives(<T extends RangedPrimitiveC>(c: T) =>
  t.readonly(
    t.intersection([
      t.type({
        type: t.literal('range'),
        valueType: c.type.props.type,
        closedLower: t.boolean,
        closedUpper: t.boolean,
      }),
      t.partial({
        lower: c.type.props.value,
        upper: c.type.props.value,
      }),
    ])
  )
);
export function Range<T extends RangedPrimitiveC>(
  c: T
): t.Type<Range<t.TypeOf<T>>> {
  return (range.get(c)! as t.Type<Range<t.TypeOf<T>>>) || noPrimitive(c);
}
export type SomeRange = t.Type<Range<RangedPrimitive>>;
export const AnyRange = t.union(
  Array.from(range).map(x => x[1]) as [SomeRange, SomeRange, ...SomeRange[]]
);
export interface Range<T extends RangedPrimitive> {
  readonly type: 'range';
  readonly valueType: T['type'];
  readonly lower?: T['value'];
  readonly upper?: T['value'];

  readonly closedLower: boolean;
  readonly closedUpper: boolean;
}

export type MaybeGlob<T extends Primitive> = T extends GlobPrimitive
  ? Literal<LGlob>
  : never;

export type MaybeRange<T extends Primitive> = T extends RangedPrimitive
  ? Range<T>
  : never;

export type TermValue<T extends Primitive> =
  | Literal<T>
  | MaybeGlob<T>
  | MaybeRange<T>
  | NonPrimitiveTermValue<T>;
const termValue = forPrimitives<TermValue<t.TypeOf<PrimitiveC>>>(
  <T extends PrimitiveC>(c: T): t.Type<TermValue<t.TypeOf<PrimitiveC>>> =>
    t.recursion(`TermValue<${c.name}>`, () => {
      let ret: t.Type<TermValue<t.TypeOf<T>>> | undefined = undefined;
      if (IsGlobPrimitiveC(c)) {
        ret = Literal(LGlob) as t.Type<TermValue<t.TypeOf<T>>>;
      }
      if (IsRangedPrimitiveC(c)) {
        ret = (ret ? t.union([ret, Range(c)]) : Range(c)) as t.Type<
          TermValue<t.TypeOf<T>>
        >;
      }
      if (ret) {
        ret = t.union([Literal(c), NonPrimitiveTermValue(c), ret]);
      } else {
        ret = t.union([Literal(c), NonPrimitiveTermValue(c)]) as t.Type<
          TermValue<t.TypeOf<T>>
        >;
      }
      return ret! as t.Type<TermValue<t.TypeOf<PrimitiveC>>>;
    })
);
export function TermValue<T extends PrimitiveC>(
  c: T
): t.Type<TermValue<t.TypeOf<T>>> {
  return (
    (termValue.get(c)! as t.Type<TermValue<t.TypeOf<T>>>) || noPrimitive(c)
  );
}

export interface AndBase<U> {
  readonly type: 'and';
  readonly operands: U[];
}
const AndBase = <U extends t.Any>(c: U) =>
  t.readonly(
    t.type({
      type: t.literal('and'),
      operands: t.array(c),
    })
  );
export interface And extends AndBase<Clause> {}
export const And = t.recursion<And>('And', (): t.Type<And> => AndBase(Clause));
export interface AndTerm<T extends Primitive> extends AndBase<TermValue<T>> {}
const andTerm = forPrimitives(
  <U extends PrimitiveC>(c: U): t.Type<AndTerm<t.TypeOf<U>>> =>
    t.recursion(
      `AndTerm<${c.name}>`,
      () => AndBase(TermValue(c)) as t.Type<AndTerm<t.TypeOf<U>>>
    )
);
export function AndTerm<T extends PrimitiveC>(
  c: T
): t.Type<AndTerm<t.TypeOf<T>>> {
  return (andTerm.get(c)! as t.Type<AndTerm<t.TypeOf<T>>>) || noPrimitive(c);
}

export interface OrBase<U> {
  readonly type: 'or';
  readonly operands: U[];
}
const OrBase = <U extends t.Any>(c: U) =>
  t.readonly(
    t.type({
      type: t.literal('or'),
      operands: t.array(c),
    })
  );
export interface Or extends OrBase<Clause> {}
export const Or = t.recursion<Or>('Or', (): t.Type<Or> => OrBase(Clause));
export interface OrTerm<T extends Primitive> extends OrBase<TermValue<T>> {}
const orTerm = forPrimitives(
  <U extends PrimitiveC>(c: U): t.Type<OrTerm<t.TypeOf<U>>> =>
    t.recursion(
      `OrTerm<${c.name}>`,
      () => OrBase(TermValue(c)) as t.Type<OrTerm<t.TypeOf<U>>>
    )
);
export function OrTerm<T extends PrimitiveC>(
  c: T
): t.Type<OrTerm<t.TypeOf<T>>> {
  return (orTerm.get(c)! as t.Type<OrTerm<t.TypeOf<T>>>) || noPrimitive(c);
}

export interface NotBase<U> {
  readonly type: 'not';
  readonly rhs: U;
}
const NotBase = <U extends t.Any>(c: U) =>
  t.readonly(
    t.type({
      type: t.literal('not'),
      rhs: c,
    })
  );
export interface Not extends NotBase<Clause> {}
export const Not = t.recursion<Not>('Not', (): t.Type<Not> => NotBase(Clause));
export interface NotTerm<T extends Primitive> extends NotBase<TermValue<T>> {}
const notTerm = forPrimitives(
  <U extends PrimitiveC>(c: U): t.Type<NotTerm<t.TypeOf<U>>> =>
    t.recursion(
      `NotTerm<${c.name}>`,
      () => NotBase(TermValue(c)) as t.Type<NotTerm<t.TypeOf<U>>>
    )
);
export function NotTerm<T extends PrimitiveC>(
  c: T
): t.Type<NotTerm<t.TypeOf<T>>> {
  return (notTerm.get(c)! as t.Type<NotTerm<t.TypeOf<T>>>) || noPrimitive(c);
}

export interface RequiredBase<U> {
  readonly type: 'required';
  readonly rhs: U;
}
const RequiredBase = <U extends t.Any>(c: U) =>
  t.readonly(
    t.type({
      type: t.literal('required'),
      rhs: c,
    })
  );
export interface Required extends RequiredBase<Clause> {}
export const Required = t.recursion<Required>(
  'Required',
  (): t.Type<Required> => RequiredBase(Clause)
);
export interface RequiredTerm<T extends Primitive>
  extends RequiredBase<TermValue<T>> {}
const requiredTerm = forPrimitives(
  <U extends PrimitiveC>(c: U): t.Type<RequiredTerm<t.TypeOf<U>>> =>
    t.recursion(
      `RequiredTerm<${c.name}>`,
      () => RequiredBase(TermValue(c)) as t.Type<RequiredTerm<t.TypeOf<U>>>
    )
);
export function RequiredTerm<T extends PrimitiveC>(
  c: T
): t.Type<RequiredTerm<t.TypeOf<T>>> {
  return (
    (requiredTerm.get(c)! as t.Type<RequiredTerm<t.TypeOf<T>>>) ||
    noPrimitive(c)
  );
}

export interface ProhibitedBase<U> {
  readonly type: 'prohibited';
  readonly rhs: U;
}
const ProhibitedBase = <U extends t.Any>(c: U) =>
  t.readonly(
    t.type({
      type: t.literal('prohibited'),
      rhs: c,
    })
  );
export interface Prohibited extends ProhibitedBase<Clause> {}
export const Prohibited = t.recursion<Prohibited>(
  'Prohibited',
  (): t.Type<Prohibited> => ProhibitedBase(Clause)
);
export interface ProhibitedTerm<T extends Primitive>
  extends ProhibitedBase<TermValue<T>> {}
const prohibitedTerm = forPrimitives(
  <U extends PrimitiveC>(c: U): t.Type<ProhibitedTerm<t.TypeOf<U>>> =>
    t.recursion(
      `ProhibitedTerm<${c.name}>`,
      () => ProhibitedBase(TermValue(c)) as t.Type<ProhibitedTerm<t.TypeOf<U>>>
    )
);
export function ProhibitedTerm<T extends PrimitiveC>(
  c: T
): t.Type<ProhibitedTerm<t.TypeOf<T>>> {
  return (
    (prohibitedTerm.get(c)! as t.Type<ProhibitedTerm<t.TypeOf<T>>>) ||
    noPrimitive(c)
  );
}

export interface ConstantScore {
  readonly type: 'constant';
  readonly lhs: Clause;
  readonly rhs: number;
}
export const ConstantScore = t.recursion<ConstantScore>(
  'ConstantScore',
  (): t.Type<ConstantScore> =>
    t.readonly(
      t.type({
        type: t.literal('constant'),
        lhs: Clause,
        rhs: t.number,
      })
    )
);

export type NonPrimitiveTermValue<T extends Primitive> =
  | AndTerm<T>
  | OrTerm<T>
  | NotTerm<T>
  | RequiredTerm<T>
  | ProhibitedTerm<T>;
const nonPrimitiveTermValue = forPrimitives(
  <T extends PrimitiveC>(c: T): t.Type<NonPrimitiveTermValue<t.TypeOf<T>>> =>
    t.recursion(
      `NonPrimitiveTermValue<${c.name}>`,
      () =>
        t.union([
          AndTerm(c),
          OrTerm(c),
          NotTerm(c),
          RequiredTerm(c),
          ProhibitedTerm(c),
        ]) as t.Type<NonPrimitiveTermValue<t.TypeOf<T>>>
    )
);
export function NonPrimitiveTermValue<T extends PrimitiveC>(
  c: T
): t.Type<NonPrimitiveTermValue<t.TypeOf<T>>> {
  return (
    (nonPrimitiveTermValue.get(c)! as t.Type<
      NonPrimitiveTermValue<t.TypeOf<T>>
    >) || noPrimitive(c)
  );
}

export interface NamedTerm<T extends Primitive> {
  readonly type: 'namedterm';
  readonly field: string;
  readonly value: TermValue<T>;
}
const namedTerm = forPrimitives(
  <T extends PrimitiveC>(c: T) =>
    t.readonly(
      t.type({
        type: t.literal('namedterm'),
        field: t.string,
        value: TermValue(c),
      })
    ) as t.Type<NamedTerm<t.TypeOf<T>>>
);
export function NamedTerm<T extends PrimitiveC>(
  c: T
): t.Type<NamedTerm<t.TypeOf<T>>> {
  return (
    (namedTerm.get(c)! as t.Type<NamedTerm<t.TypeOf<T>>>) || noPrimitive(c)
  );
}
export type SomeNamedTerm = t.Type<NamedTerm<Primitive>>;
export const AnyNamedTerm = t.union(
  Array.from(namedTerm).map(x => x[1]) as [
    SomeNamedTerm,
    SomeNamedTerm,
    ...SomeNamedTerm[]
  ]
);
export type AnyNamedTerm = t.TypeOf<typeof AnyNamedTerm>;

export interface Term<T extends Primitive> {
  readonly type: 'term';
  readonly value: TermValue<T>;
}
const term = forPrimitives(
  <T extends PrimitiveC>(c: T) =>
    t.readonly(
      t.type({
        type: t.literal('term'),
        value: TermValue(c),
      })
    ) as t.Type<Term<t.TypeOf<T>>>
);
export function Term<T extends PrimitiveC>(c: T): t.Type<Term<t.TypeOf<T>>> {
  return (term.get(c)! as t.Type<Term<t.TypeOf<T>>>) || noPrimitive(c);
}
export type SomeTerm = t.Type<Term<Primitive>>;
export const AnyTerm = t.union(
  Array.from(term).map(x => x[1]) as [SomeTerm, SomeTerm, ...SomeTerm[]]
);
export type AnyTerm = t.TypeOf<typeof AnyTerm>;

export type Clause =
  | Term<LString>
  | Term<LNumber>
  | Term<LDate>
  | Term<LSpatial>
  | NamedTerm<LString>
  | NamedTerm<LNumber>
  | NamedTerm<LDate>
  | NamedTerm<LSpatial>
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
      Term(LString),
      Term(LNumber),
      Term(LDate),
      Term(LSpatial),
      NamedTerm(LString),
      NamedTerm(LNumber),
      NamedTerm(LDate),
      NamedTerm(LSpatial),
      ConstantScore,
      And,
      Or,
      Not,
      Required,
      Prohibited,
    ]) as t.Type<Clause>
);

export const AnyTermValue = t.union([
  TermValue(LString),
  TermValue(LNumber),
  TermValue(LDate),
  TermValue(LSpatial),
]);
export type AnyTermValue = t.TypeOf<typeof AnyTermValue>;

export const QueryElement = t.union([Clause, AnyTermValue]);
export type QueryElement = t.TypeOf<typeof QueryElement>;
