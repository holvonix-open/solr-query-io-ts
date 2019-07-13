export interface Term {
  type: 'term';
  field?: string;
  value?: TermValue;
}

export interface Range {
  type: 'range';
  lower?: Primitive;
  upper?: Primitive;

  closedLower: boolean;
  closedUpper: boolean;
}

export interface And {
  type: 'and';
  lhs: Clause;
  rhs: Clause;
}

export interface Or {
  type: 'or';
  lhs: Clause;
  rhs: Clause;
}

export interface Not {
  type: 'not';
  rhs: Clause;
}

export interface Required {
  type: 'required';
  rhs: Clause;
}

export interface Prohibited {
  type: 'prohibited';
  rhs: Clause;
}

export interface ConstantScore {
  type: 'constant';
  lhs: Clause;
  rhs: number;
}

export type Clause = Term | TermValue | ConstantScore;

export type Primitive = number | Date | string;

export type TermValue =
  | Primitive
  | Range
  | And
  | Or
  | Not
  | Required
  | Prohibited;
