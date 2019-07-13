import * as geojson from 'geojson';

export interface Term<T extends Primitive> {
  type: 'term';
  value: TermValue<T>;
}

export interface NamedTerm<T extends Primitive> {
  type: 'namedterm';
  field: string;
  value: TermValue<T>;
}

export interface Range<T extends Primitive> {
  type: 'range';
  lower?: T;
  upper?: T;

  closedLower: boolean;
  closedUpper: boolean;
}

export interface AndBase<U> {
  type: 'and';
  operands: U[];
}
export interface And extends AndBase<Clause> {}
export interface AndTerm<T extends Primitive> extends AndBase<TermValue<T>> {}

export interface OrBase<U> {
  type: 'or';
  operands: U[];
}
export interface Or extends OrBase<Clause> {}
export interface OrTerm<T extends Primitive> extends OrBase<TermValue<T>> {}

export interface NotBase<U> {
  type: 'not';
  rhs: U;
}
export interface Not extends NotBase<Clause> {}
export interface NotTerm<T extends Primitive> extends NotBase<TermValue<T>> {}

export interface RequiredBase<U> {
  type: 'required';
  rhs: U;
}
export interface Required extends RequiredBase<Clause> {}
export interface RequiredTerm<T extends Primitive>
  extends RequiredBase<TermValue<T>> {}

export interface ProhibitedBase<U> {
  type: 'prohibited';
  rhs: U;
}
export interface Prohibited extends ProhibitedBase<Clause> {}
export interface ProhibitedTerm<T extends Primitive>
  extends ProhibitedBase<TermValue<T>> {}

export interface ConstantScore {
  type: 'constant';
  lhs: Clause;
  rhs: number;
}

export type SpatialOp = 'Intersects' | 'IsWithin' | 'Contains' | 'IsDisjointTo';
export interface Spatial<T extends SpatialOp> {
  type: 'spatial';
  op: T;
  value: geojson.Geometry;
}
export interface Glob {
  type: 'glob';
  value: string;
}
export type Intersects = Spatial<'Intersects'>;
export type IsWithin = Spatial<'IsWithin'>;
export type Contains = Spatial<'Contains'>;
export type IsDisjointTo = Spatial<'IsDisjointTo'>;

export type Primitive = number | Date | string | Spatial<SpatialOp> | Glob;

export interface Literal<T extends Primitive> {
  type: 'literal';
  value: T;
}

export type Clause =
  | Term<Primitive>
  | NamedTerm<Primitive>
  | ConstantScore
  | And
  | Or
  | Not
  | Required
  | Prohibited
  | TermValue<Primitive>;

export type TermValue<T extends Primitive> =
  | Literal<T>
  | Literal<Glob>
  | NonPrimitiveTermValue<T>;

export type NonPrimitiveTermValue<T extends Primitive> =
  | Range<T>
  | AndTerm<T>
  | OrTerm<T>
  | NotTerm<T>
  | RequiredTerm<T>
  | ProhibitedTerm<T>;
