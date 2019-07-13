export interface Term<T extends Primitive> {
  type: 'term';
  field?: string;
  value?: TermValue<T>;
}

export interface Range<T extends Primitive> {
  type: 'range';
  lower?: T;
  upper?: T;

  closedLower: boolean;
  closedUpper: boolean;
}

export interface And<T extends Primitive> {
  type: 'and';
  lhs: Clause<T>;
  rhs: Clause<T>;
}

export interface Or<T extends Primitive> {
  type: 'or';
  lhs: Clause<T>;
  rhs: Clause<T>;
}

export interface Not<T extends Primitive> {
  type: 'not';
  rhs: Clause<T>;
}

export interface Required<T extends Primitive> {
  type: 'required';
  rhs: Clause<T>;
}

export interface Prohibited<T extends Primitive> {
  type: 'prohibited';
  rhs: Clause<T>;
}

export interface ConstantScore<T extends Primitive> {
  type: 'constant';
  lhs: Clause<T>;
  rhs: number;
}

export type Primitive = undefined | number | Date | string;

export type Clause<T extends Primitive> =
  | Term<T>
  | TermValue<T>
  | ConstantScore<T>;

export type NonPrimitiveClause<T extends Primitive> =
  | Term<T>
  | NonPrimitiveTermValue<T>
  | ConstantScore<T>;

export type TermValue<T extends Primitive> = T | NonPrimitiveTermValue<T>;

export type NonPrimitiveTermValue<T extends Primitive> =
  | Range<T>
  | And<T>
  | Or<T>
  | Not<T>
  | Required<T>
  | Prohibited<T>;
