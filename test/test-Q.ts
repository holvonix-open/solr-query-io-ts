import * as assert from 'assert';
import { Q, TermValue } from '../src/index';
import {
  Term,
  Not,
  Required,
  Prohibited,
  ConstantScore,
  And,
  Or,
} from '../src/index';

describe('Q', () => {
  const lhs = Q.defaultTerm('LHS');
  const rhs = Q.defaultTerm('RHS');
  const rhs2 = Q.defaultTerm('RHS2');
  const rhs3 = Q.defaultTerm('RHS3');
  describe('builders', () => {
    describe('defaultTerm', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.defaultTerm('hello'), {
          type: 'term',
          value: 'hello',
        } as Term);
      });
    });
    describe('term', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.term('name', 'hello'), {
          type: 'term',
          field: 'name',
          value: 'hello',
        } as Term);
      });
    });
    describe('not', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.not(rhs), {
          type: 'not',
          rhs,
        } as Not);
      });
    });
    describe('required', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.required(rhs), {
          type: 'required',
          rhs,
        } as Required);
      });
    });
    describe('prohibited', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.prohibited(rhs), {
          type: 'prohibited',
          rhs,
        } as Prohibited);
      });
    });
    describe('constantScore', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.constantScore(lhs, 7.5), {
          type: 'constant',
          lhs,
          rhs: 7.5,
        } as ConstantScore);
      });
    });
    describe('and', () => {
      it('works with 2', () => {
        assert.deepStrictEqual(Q.and(lhs, rhs), {
          type: 'and',
          lhs,
          rhs,
        } as And);
      });
      it('works with 4', () => {
        assert.deepStrictEqual(Q.and(lhs, rhs, rhs2, rhs3), {
          type: 'and',
          lhs: {
            type: 'and',
            lhs: {
              type: 'and',
              lhs,
              rhs,
            } as And,
            rhs: rhs2,
          } as And,
          rhs: rhs3,
        } as And);
      });
    });
    describe('or', () => {
      it('works with 2', () => {
        assert.deepStrictEqual(Q.or(lhs, rhs), {
          type: 'or',
          lhs,
          rhs,
        } as Or);
      });
      it('works with 4', () => {
        assert.deepStrictEqual(Q.or(lhs, rhs, rhs2, rhs3), {
          type: 'or',
          lhs: {
            type: 'or',
            lhs: {
              type: 'or',
              lhs,
              rhs,
            } as Or,
            rhs: rhs2,
          } as Or,
          rhs: rhs3,
        } as Or);
      });
    });
  });
  describe('toTermString', () => {
    it('leaves simple strings alone', () => {
      assert.deepStrictEqual(Q.toTermString(''), '""');
      assert.deepStrictEqual(Q.toTermString('a'), '"a"');
      assert.deepStrictEqual(Q.toTermString('a b'), '"a b"');
      assert.deepStrictEqual(
        Q.toTermString('ajsncnemf.efjnwefewnf'),
        '"ajsncnemf.efjnwefewnf"'
      );
    });

    it('leaves simple numbers alone', () => {
      assert.deepStrictEqual(Q.toTermString(6), '6');
      assert.deepStrictEqual(Q.toTermString(-1000.245), '-1000.245');
    });

    it('generates appropriate dates', () => {
      assert.deepStrictEqual(
        Q.toTermString(new Date(Date.UTC(2010, 7, 6, 4, 23, 4))),
        '2010-08-06T04:23:04.000Z'
      );
      assert.deepStrictEqual(
        Q.toTermString(new Date(Date.UTC(2010, 7, 6, 4, 23, 4, 53))),
        '2010-08-06T04:23:04.053Z'
      );
    });

    it('generates nested simple values', () => {
      assert.deepStrictEqual(
        Q.toTermString((rhs as unknown) as TermValue),
        '("RHS")'
      );
    });

    it('generates nested complex values', () => {
      assert.deepStrictEqual(
        Q.toTermString(Q.and(lhs, rhs)),
        '(("LHS") AND ("RHS"))'
      );
    });

    it('escapes quotes in strings', () => {
      assert.deepStrictEqual(Q.toTermString('"'), '"\\""');
      assert.deepStrictEqual(Q.toTermString('a"b"'), '"a\\"b\\""');
      assert.deepStrictEqual(
        Q.toTermString('ajsnc"nemf.efjnwefewnf'),
        '"ajsnc\\"nemf.efjnwefewnf"'
      );
    });
  });
  describe('toString', () => {
    it('works on simple terms', () => {
      assert.deepStrictEqual(Q.toString(Q.defaultTerm('hello')), '("hello")');
    });
    it('works on named terms', () => {
      assert.deepStrictEqual(
        Q.toString(Q.term('text', 'hello')),
        '("text":"hello")'
      );
    });
    it('works on named phrases', () => {
      assert.deepStrictEqual(
        Q.toString(Q.term('text', 'hello bye')),
        '("text":"hello bye")'
      );
    });
    it('works on simple phrases', () => {
      assert.deepStrictEqual(
        Q.toString(Q.defaultTerm('hello goodbye')),
        '("hello goodbye")'
      );
    });
    it('works on escaped phrases', () => {
      assert.deepStrictEqual(
        Q.toString(Q.defaultTerm('hello"goodbye')),
        '("hello\\"goodbye")'
      );
    });

    it('works on not', () => {
      assert.deepStrictEqual(Q.toString(Q.not(lhs)), '(NOT ("LHS"))');
    });

    it('works on prohibited', () => {
      assert.deepStrictEqual(Q.toString(Q.prohibited(lhs)), '(-("LHS"))');
    });

    it('works on required', () => {
      assert.deepStrictEqual(Q.toString(Q.required(lhs)), '(+("LHS"))');
    });

    it('works on constant', () => {
      assert.deepStrictEqual(
        Q.toString(Q.constantScore(lhs, 7.5)),
        '(("LHS")^=7.5)'
      );
    });

    it('works on and', () => {
      assert.deepStrictEqual(
        Q.toString(Q.and(lhs, rhs, rhs2, rhs3)),
        '(((("LHS") AND ("RHS")) AND ("RHS2")) AND ("RHS3"))'
      );
    });

    it('works on or', () => {
      assert.deepStrictEqual(
        Q.toString(Q.or(lhs, rhs, rhs2, rhs3)),
        '(((("LHS") OR ("RHS")) OR ("RHS2")) OR ("RHS3"))'
      );
    });
  });
});
