export interface Term {
  type: 'term';
  field?: string;
  value: TermValue;
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

export type Clause =
  | Term
  | And
  | Or
  | Not
  | Required
  | Prohibited
  | ConstantScore;

export type Primitive = number | Date | string;

export type TermValue = Primitive | And | Or | Not | Required | Prohibited;
