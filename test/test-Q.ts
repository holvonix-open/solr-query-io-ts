import * as assert from 'assert';
import * as Terraformer from 'terraformer';
import { Q } from '../src/index';

describe('Q', () => {
  const lhs = Q.defaultTerm(Q.L('LHS'));
  const rhs = Q.defaultTerm(Q.L('RHS'));
  const rhs2 = Q.defaultTerm(Q.L('RHS2'));
  const rhs3 = Q.defaultTerm(Q.L('RHS3'));
  const rhsNumber = Q.defaultTerm(Q.L(101));
  describe('builders', () => {
    describe('defaultTerm', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.defaultTerm(Q.L('hello')), {
          type: 'term',
          value: Q.L('hello'),
        });
      });
    });
    describe('term', () => {
      it('works with value', () => {
        assert.deepStrictEqual(Q.term('name', Q.L('hello')), {
          type: 'namedterm',
          field: 'name',
          value: Q.L('hello'),
        });
      });
      it('works with wildcard', () => {
        assert.deepStrictEqual(Q.term('name', Q.glob('*')), {
          type: 'namedterm',
          field: 'name',
          value: Q.glob('*'),
        });
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
        });
      });
      it('works with wildcards', () => {
        assert.deepStrictEqual(Q.range(true, false, 1), {
          type: 'range',
          closedLower: true,
          closedUpper: false,
          lower: 1,
          upper: undefined,
        });
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
        });
      });
      it('works with wildcards', () => {
        assert.deepStrictEqual(Q.closedRange(1), {
          type: 'range',
          closedLower: true,
          closedUpper: true,
          lower: 1,
          upper: undefined,
        });
        assert.deepStrictEqual(Q.closedRange(undefined, 1), {
          type: 'range',
          closedLower: true,
          closedUpper: true,
          upper: 1,
          lower: undefined,
        });
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
        });
      });
      it('works with wildcards', () => {
        assert.deepStrictEqual(Q.openRange(1), {
          type: 'range',
          closedLower: false,
          closedUpper: false,
          lower: 1,
          upper: undefined,
        });
        assert.deepStrictEqual(Q.openRange(undefined, 1), {
          type: 'range',
          closedLower: false,
          closedUpper: false,
          upper: 1,
          lower: undefined,
        });
      });
    });

    describe('not', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.not(rhs), {
          type: 'not',
          rhs,
        });
      });
    });
    describe('required', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.required(rhs), {
          type: 'required',
          rhs,
        });
      });
    });
    describe('prohibited', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.prohibited(rhs), {
          type: 'prohibited',
          rhs,
        });
      });
    });
    describe('constantScore', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.constantScore(lhs, 7.5), {
          type: 'constant',
          lhs,
          rhs: 7.5,
        });
      });
    });
    describe('and', () => {
      it('works with 2 clauses', () => {
        assert.deepStrictEqual(Q.and(lhs, rhs), {
          type: 'and',
          operands: [lhs, rhs],
        });
      });
      it('works with 4 clauses', () => {
        assert.deepStrictEqual(Q.and(lhs, rhs, rhs2, rhsNumber), {
          type: 'and',
          operands: [lhs, rhs, rhs2, rhsNumber],
        });
      });

      it('works with 4 terms', () => {
        assert.deepStrictEqual(
          Q.and(Q.L('h'), Q.L('ekfief'), Q.L('hb'), Q.L('hm')),
          {
            type: 'and',
            operands: [Q.L('h'), Q.L('ekfief'), Q.L('hb'), Q.L('hm')],
          }
        );
      });

      it('works with 4 mixed terms/clauses', () => {
        assert.deepStrictEqual(Q.and(lhs, rhs, rhs2, Q.L('h')), {
          type: 'and',
          operands: [lhs, rhs, rhs2, Q.L('h')],
        });
      });
    });
    describe('or', () => {
      it('works with 2 clauses', () => {
        assert.deepStrictEqual(Q.or(lhs, rhs), {
          type: 'or',
          operands: [lhs, rhs],
        });
      });
      it('works with 4 clauses', () => {
        assert.deepStrictEqual(Q.or(lhs, rhs, rhs2, rhsNumber), {
          type: 'or',
          operands: [lhs, rhs, rhs2, rhsNumber],
        });
      });

      it('works with 4 terms', () => {
        assert.deepStrictEqual(
          Q.or(Q.L('h'), Q.L('ekfief'), Q.L('hb'), Q.L('hm')),
          {
            type: 'or',
            operands: [Q.L('h'), Q.L('ekfief'), Q.L('hb'), Q.L('hm')],
          }
        );
      });

      it('works with 4 mixed terms/clauses', () => {
        assert.deepStrictEqual(Q.or(lhs, rhs, rhs2, Q.L('h')), {
          type: 'or',
          operands: [lhs, rhs, rhs2, Q.L('h')],
        });
      });
    });
  });
  describe('toString', () => {
    it('escapes simple string literals', () => {
      assert.deepStrictEqual(Q.toString(Q.L('')), '""');
      assert.deepStrictEqual(Q.toString(Q.L('a')), '"a"');
      assert.deepStrictEqual(Q.toString(Q.L('a b')), '"a b"');
      assert.deepStrictEqual(
        Q.toString(Q.L('ajsncn*mf.ef\\jnwefewnf')),
        '"ajsncn*mf.ef\\\\jnwefewnf"'
      );
    });

    it('escapes wildcard literals', () => {
      assert.deepStrictEqual(Q.toString(Q.glob('')), '');
      assert.deepStrictEqual(Q.toString(Q.glob('a')), 'a');
      assert.deepStrictEqual(Q.toString(Q.glob('a b')), 'a\\ b');
      assert.deepStrictEqual(
        Q.toString(Q.glob('Hello Wor?d*')),
        'Hello\\ Wor?d*'
      );
      assert.deepStrictEqual(
        Q.toString(Q.glob('He +-&|!(){}[]^"~:/\\llo W??o!!!r?d*')),
        'He\\ \\+\\-\\&\\|\\!\\(\\)\\{\\}\\[\\]\\^\\"\\~\\:\\/\\\\llo\\ W??o\\!\\!\\!r?d*'
      );
    });

    it('generates wildcards', () => {
      assert.deepStrictEqual(Q.toString(Q.glob('*')), '*');
    });

    it('leaves simple numbers alone', () => {
      assert.deepStrictEqual(Q.toString(Q.L(6)), '6');
      assert.deepStrictEqual(Q.toString(Q.L(-1000.245)), '-1000.245');
    });

    it('generates appropriate dates', () => {
      assert.deepStrictEqual(
        Q.toString(Q.L(new Date(Date.UTC(2010, 7, 6, 4, 23, 4)))),
        '2010-08-06T04:23:04.000Z'
      );
      assert.deepStrictEqual(
        Q.toString(Q.L(new Date(Date.UTC(2010, 7, 6, 4, 23, 4, 53)))),
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
      assert.deepStrictEqual(Q.toString(Q.L('"')), '"\\""');
      assert.deepStrictEqual(Q.toString(Q.L('a"b"')), '"a\\"b\\""');
      assert.deepStrictEqual(
        Q.toString(Q.L('ajsnc"nemf.efjnwefewnf')),
        '"ajsnc\\"nemf.efjnwefewnf"'
      );
    });
    it('works on simple terms', () => {
      assert.deepStrictEqual(
        Q.toString(Q.defaultTerm(Q.L('hello'))),
        '"hello"'
      );
    });
    it('works on named terms', () => {
      assert.deepStrictEqual(
        Q.toString(Q.term('text', Q.L('hello'))),
        'text:"hello"'
      );
    });

    it('works on named wildcards', () => {
      assert.deepStrictEqual(Q.toString(Q.term('text', Q.glob('*'))), 'text:*');
    });
    it('works on named phrases', () => {
      assert.deepStrictEqual(
        Q.toString(Q.term('text', Q.L('hello bye'))),
        'text:"hello bye"'
      );
    });
    it('works on simple phrases', () => {
      assert.deepStrictEqual(
        Q.toString(Q.defaultTerm(Q.L('hello goodbye'))),
        '"hello goodbye"'
      );
    });
    it('works on escaped phrases', () => {
      assert.deepStrictEqual(
        Q.toString(Q.defaultTerm(Q.L('hello"goodb\\ye'))),
        '"hello\\"goodb\\\\ye"'
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
        '("LHS" AND "RHS" AND "RHS2" AND "RHS3")'
      );
    });

    it('works on and literals', () => {
      assert.deepStrictEqual(
        Q.toString(Q.and(Q.L('A'), Q.L('B'))),
        '("A" AND "B")'
      );
    });

    it('works on or terms', () => {
      assert.deepStrictEqual(
        Q.toString(Q.or(lhs, rhs, rhs2, rhs3)),
        '("LHS" OR "RHS" OR "RHS2" OR "RHS3")'
      );
    });

    it('works on or literals', () => {
      assert.deepStrictEqual(
        Q.toString(Q.or(Q.L('A'), Q.L('B'))),
        '("A" OR "B")'
      );
    });

    it('works on or mixed terms', () => {
      assert.deepStrictEqual(
        Q.toString(Q.or(lhs, rhs, rhs2, rhsNumber)),
        '("LHS" OR "RHS" OR "RHS2" OR 101)'
      );
    });

    describe('spatial', () => {
      const obj = new Terraformer.Polygon([
        [[10.0, 0.0], [101.0, 21.0], [60.0, 1.024], [10.0, 0.0]],
        [[0, 0], [-10, -10], [20, 30], [0, 0]],
      ]);
      it('intersects', () => {
        assert.deepStrictEqual(
          Q.toString(Q.term('geo', Q.spatial.intersects(obj))),
          'geo:"Intersects(POLYGON ((10 0, 101 21, 60 1.024, 10 0), (0 0, -10 -10, 20 30, 0 0)))"'
        );
      });
      it('contains', () => {
        assert.deepStrictEqual(
          Q.toString(Q.term('geo', Q.spatial.contains(obj))),
          'geo:"Contains(POLYGON ((10 0, 101 21, 60 1.024, 10 0), (0 0, -10 -10, 20 30, 0 0)))"'
        );
      });
      it('isDisjointTo', () => {
        assert.deepStrictEqual(
          Q.toString(Q.term('geo', Q.spatial.isDisjointTo(obj))),
          'geo:"IsDisjointTo(POLYGON ((10 0, 101 21, 60 1.024, 10 0), (0 0, -10 -10, 20 30, 0 0)))"'
        );
      });
      it('isWithin', () => {
        assert.deepStrictEqual(
          Q.toString(Q.term('geo', Q.spatial.isWithin(obj))),
          'geo:"IsWithin(POLYGON ((10 0, 101 21, 60 1.024, 10 0), (0 0, -10 -10, 20 30, 0 0)))"'
        );
      });
    });

    it('works on complex tree 1', () => {
      const q = Q.or(
        Q.term(
          'geo',
          Q.spatial.intersects({
            type: 'Point',
            coordinates: [-122.17381, 37.426002],
          })
        ),
        Q.defaultTerm(Q.L('spicy')),
        Q.term('product', Q.and(Q.closedRange(100, undefined), Q.not(Q.L(600))))
      );

      assert.deepStrictEqual(
        Q.toString(q),
        '(geo:"Intersects(POINT (-122.17381 37.426002))" OR "spicy" OR product:([100 TO *] AND (NOT 600)))'
      );
    });
    it('works on complex tree 2', () => {
      assert.deepStrictEqual(
        Q.toString(
          Q.or(
            lhs,
            rhs,
            rhs2,
            Q.term(
              'product',
              Q.or(Q.closedRange(100, undefined), Q.not(Q.L(60)))
            )
          )
        ),
        '("LHS" OR "RHS" OR "RHS2" OR product:([100 TO *] OR (NOT 60)))'
      );
    });
  });
});
