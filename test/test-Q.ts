import * as assert from 'assert';
import { Q, Range } from '../src/index';
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
      it('works with value', () => {
        assert.deepStrictEqual(Q.term('name', 'hello'), {
          type: 'term',
          field: 'name',
          value: 'hello',
        } as Term);
      });
      it('works with wildcard', () => {
        assert.deepStrictEqual(Q.term('name'), {
          type: 'term',
          field: 'name',
          value: undefined,
        } as Term);
      });
    });

    describe('range', () => {
      it('works with values', () => {
        assert.deepStrictEqual(Q.range(true, true, 1, 100), {
          type: 'range',
          closedLower: true,
          closedUpper: true,
          lower: 1,
          upper: 100,
        } as Range);
      });
      it('works with wildcards', () => {
        assert.deepStrictEqual(Q.range(true, false, 1), {
          type: 'range',
          closedLower: true,
          closedUpper: false,
          lower: 1,
          upper: undefined,
        } as Range);
      });
    });

    describe('closedRange', () => {
      it('works with values', () => {
        assert.deepStrictEqual(Q.closedRange(1, 100), {
          type: 'range',
          closedLower: true,
          closedUpper: true,
          lower: 1,
          upper: 100,
        } as Range);
      });
      it('works with wildcards', () => {
        assert.deepStrictEqual(Q.closedRange(1), {
          type: 'range',
          closedLower: true,
          closedUpper: true,
          lower: 1,
          upper: undefined,
        } as Range);
        assert.deepStrictEqual(Q.closedRange(undefined, 1), {
          type: 'range',
          closedLower: true,
          closedUpper: true,
          upper: 1,
          lower: undefined,
        } as Range);
      });
    });

    describe('openRange', () => {
      it('works with values', () => {
        assert.deepStrictEqual(Q.openRange(1, 100), {
          type: 'range',
          closedLower: false,
          closedUpper: false,
          lower: 1,
          upper: 100,
        } as Range);
      });
      it('works with wildcards', () => {
        assert.deepStrictEqual(Q.openRange(1), {
          type: 'range',
          closedLower: false,
          closedUpper: false,
          lower: 1,
          upper: undefined,
        } as Range);
        assert.deepStrictEqual(Q.openRange(undefined, 1), {
          type: 'range',
          closedLower: false,
          closedUpper: false,
          upper: 1,
          lower: undefined,
        } as Range);
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
  describe('toString', () => {
    it('leaves simple strings alone', () => {
      assert.deepStrictEqual(Q.toString(''), '""');
      assert.deepStrictEqual(Q.toString('a'), '"a"');
      assert.deepStrictEqual(Q.toString('a b'), '"a b"');
      assert.deepStrictEqual(
        Q.toString('ajsncnemf.efjnwefewnf'),
        '"ajsncnemf.efjnwefewnf"'
      );
    });

    it('generates wildcards', () => {
      assert.deepStrictEqual(Q.toString(), '*');
    });

    it('leaves simple numbers alone', () => {
      assert.deepStrictEqual(Q.toString(6), '6');
      assert.deepStrictEqual(Q.toString(-1000.245), '-1000.245');
    });

    it('generates appropriate dates', () => {
      assert.deepStrictEqual(
        Q.toString(new Date(Date.UTC(2010, 7, 6, 4, 23, 4))),
        '2010-08-06T04:23:04.000Z'
      );
      assert.deepStrictEqual(
        Q.toString(new Date(Date.UTC(2010, 7, 6, 4, 23, 4, 53))),
        '2010-08-06T04:23:04.053Z'
      );
    });

    it('generates wildcard ranges', () => {
      assert.deepStrictEqual(
        Q.toString({
          type: 'range',
          closedLower: true,
          closedUpper: true,
          lower: 4,
        }),
        '[4 TO *]'
      );
      assert.deepStrictEqual(
        Q.toString({
          type: 'range',
          closedLower: true,
          closedUpper: true,
          upper: 4,
        }),
        '[* TO 4]'
      );
    });

    it('generates numeric ranges', () => {
      assert.deepStrictEqual(
        Q.toString({
          type: 'range',
          closedLower: true,
          closedUpper: true,
          lower: 4,
          upper: 15,
        }),
        '[4 TO 15]'
      );
      assert.deepStrictEqual(
        Q.toString({
          type: 'range',
          closedLower: false,
          closedUpper: true,
          lower: 4,
          upper: 15,
        }),
        '{4 TO 15]'
      );
      assert.deepStrictEqual(
        Q.toString({
          type: 'range',
          closedLower: true,
          closedUpper: false,
          lower: 4,
          upper: 15,
        }),
        '[4 TO 15}'
      );
      assert.deepStrictEqual(
        Q.toString({
          type: 'range',
          closedLower: false,
          closedUpper: false,
          lower: 4,
          upper: 15,
        }),
        '{4 TO 15}'
      );
    });

    it('generates string ranges', () => {
      assert.deepStrictEqual(
        Q.toString({
          type: 'range',
          closedLower: true,
          closedUpper: true,
          lower: 'b',
          upper: 'cat',
        }),
        '["b" TO "cat"]'
      );
      assert.deepStrictEqual(
        Q.toString({
          type: 'range',
          closedLower: false,
          closedUpper: true,
          lower: 'b',
          upper: 'cat',
        }),
        '{"b" TO "cat"]'
      );
      assert.deepStrictEqual(
        Q.toString({
          type: 'range',
          closedLower: true,
          closedUpper: false,
          lower: 'b',
          upper: 'cat',
        }),
        '["b" TO "cat"}'
      );
      assert.deepStrictEqual(
        Q.toString({
          type: 'range',
          closedLower: false,
          closedUpper: false,
          lower: 'b',
          upper: 'cat',
        }),
        '{"b" TO "cat"}'
      );
    });

    it('escapes quotes in strings', () => {
      assert.deepStrictEqual(Q.toString('"'), '"\\""');
      assert.deepStrictEqual(Q.toString('a"b"'), '"a\\"b\\""');
      assert.deepStrictEqual(
        Q.toString('ajsnc"nemf.efjnwefewnf'),
        '"ajsnc\\"nemf.efjnwefewnf"'
      );
    });
    it('works on simple terms', () => {
      assert.deepStrictEqual(Q.toString(Q.defaultTerm('hello')), '"hello"');
    });
    it('works on named terms', () => {
      assert.deepStrictEqual(
        Q.toString(Q.term('text', 'hello')),
        'text:"hello"'
      );
    });

    it('works on named wildcards', () => {
      assert.deepStrictEqual(Q.toString(Q.term('text')), 'text:*');
    });
    it('works on named phrases', () => {
      assert.deepStrictEqual(
        Q.toString(Q.term('text', 'hello bye')),
        'text:"hello bye"'
      );
    });
    it('works on simple phrases', () => {
      assert.deepStrictEqual(
        Q.toString(Q.defaultTerm('hello goodbye')),
        '"hello goodbye"'
      );
    });
    it('works on escaped phrases', () => {
      assert.deepStrictEqual(
        Q.toString(Q.defaultTerm('hello"goodbye')),
        '"hello\\"goodbye"'
      );
    });

    it('works on not', () => {
      assert.deepStrictEqual(Q.toString(Q.not(lhs)), '(NOT "LHS")');
    });

    it('works on prohibited', () => {
      assert.deepStrictEqual(Q.toString(Q.prohibited(lhs)), '-"LHS"');
    });

    it('works on required', () => {
      assert.deepStrictEqual(Q.toString(Q.required(lhs)), '+"LHS"');
    });

    it('works on constant', () => {
      assert.deepStrictEqual(
        Q.toString(Q.constantScore(lhs, 7.5)),
        '("LHS")^=7.5'
      );
    });

    it('works on and', () => {
      assert.deepStrictEqual(
        Q.toString(Q.and(lhs, rhs, rhs2, rhs3)),
        '((("LHS" AND "RHS") AND "RHS2") AND "RHS3")'
      );
    });

    it('works on or', () => {
      assert.deepStrictEqual(
        Q.toString(Q.or(lhs, rhs, rhs2, rhs3)),
        '((("LHS" OR "RHS") OR "RHS2") OR "RHS3")'
      );
    });

    it('works on complex tree', () => {
      assert.deepStrictEqual(
        Q.toString(
          Q.or(
            lhs,
            rhs,
            rhs2,
            Q.term(
              'product',
              Q.or(Q.closedRange(100, 94903), Q.not(Q.defaultTerm('junk')))
            )
          )
        ),
        '((("LHS" OR "RHS") OR "RHS2") OR product:([100 TO 94903] OR (NOT "junk")))'
      );
    });
  });
});
