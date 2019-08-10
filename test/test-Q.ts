import * as assert from 'assert';
import * as Q from '../src/Q';

describe('Q', () => {
  const lhs = Q.defaultTerm(Q.L('LHS'));
  const rhs = Q.defaultTerm(Q.L('RHS'));
  const rhs2 = Q.defaultTerm(Q.L('RHS2'));
  const rhsNumber = Q.defaultTerm(Q.L(101));
  describe('builders', () => {
    describe('L', () => {
      it('creates numbers', () => {
        assert.deepStrictEqual(Q.L(7.8), {
          type: 'literal',
          value: {
            type: 'number',
            value: 7.8,
          },
        });
      });
      it('creates strings', () => {
        assert.deepStrictEqual(Q.L('hello'), {
          type: 'literal',
          value: {
            type: 'string',
            value: 'hello',
          },
        });
      });
      it('creates Dates', () => {
        const d = new Date();
        assert.deepStrictEqual(Q.L(d), {
          type: 'literal',
          value: {
            type: 'date',
            value: d,
          },
        });
      });
      it('rejects invalid types', () => {
        assert.throws(
          () => Q.L(({ hi: 'hello' } as unknown) as string),
          /SQM001/
        );
      });
      it('rejects null', () => {
        assert.throws(() => Q.L((null as unknown) as string), /SQM001/);
      });
      it('rejects undefined', () => {
        assert.throws(() => Q.L((undefined as unknown) as string), /SQM001/);
      });
    });
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
          valueType: 'number',
          lower: 1,
          upper: 100,
        });
      });
      it('works with wildcards', () => {
        assert.deepStrictEqual(Q.range(true, false, 1), {
          type: 'range',
          closedLower: true,
          closedUpper: false,
          valueType: 'number',
          lower: 1,
          upper: undefined,
        });
      });

      it('rejects invalid types', () => {
        assert.throws(
          () => Q.range(false, true, ({ hi: 'hello' } as unknown) as string),
          /SQM001/
        );
      });
      it('rejects mismatch types', () => {
        assert.throws(
          () => Q.range(false, true, 'a', (5 as unknown) as string),
          /SQM003/
        );
      });
      it('rejects dual null', () => {
        assert.throws(
          () =>
            Q.range(
              false,
              true,
              (null as unknown) as string,
              (null as unknown) as string
            ),
          /SQM002/
        );
      });
      it('rejects dual undefined', () => {
        assert.throws(
          () => Q.range(false, true, (undefined as unknown) as string),
          /SQM002/
        );
      });
    });

    describe('closedRange', () => {
      it('works with values', () => {
        assert.deepStrictEqual(Q.closedRange(1, 100), {
          type: 'range',
          closedLower: true,
          closedUpper: true,
          valueType: 'number',
          lower: 1,
          upper: 100,
        });
      });
      it('works with wildcards', () => {
        assert.deepStrictEqual(Q.closedRange(1), {
          type: 'range',
          closedLower: true,
          closedUpper: true,
          valueType: 'number',
          lower: 1,
          upper: undefined,
        });
        assert.deepStrictEqual(Q.closedRange(undefined, 1), {
          type: 'range',
          closedLower: true,
          closedUpper: true,
          valueType: 'number',
          upper: 1,
          lower: undefined,
        });
      });

      it('rejects invalid types', () => {
        assert.throws(
          () => Q.closedRange(({ hi: 'hello' } as unknown) as string),
          /SQM001/
        );
      });
      it('rejects mismatch types', () => {
        assert.throws(
          () => Q.closedRange('a', (5 as unknown) as string),
          /SQM003/
        );
      });
      it('rejects dual null', () => {
        assert.throws(
          () =>
            Q.closedRange(
              (null as unknown) as string,
              (null as unknown) as string
            ),
          /SQM002/
        );
      });
      it('rejects dual undefined', () => {
        assert.throws(
          () => Q.closedRange((undefined as unknown) as string),
          /SQM002/
        );
      });
    });

    describe('openRange', () => {
      it('works with values', () => {
        assert.deepStrictEqual(Q.openRange(1, 100), {
          type: 'range',
          closedLower: false,
          closedUpper: false,
          valueType: 'number',
          lower: 1,
          upper: 100,
        });
      });
      it('works with wildcards', () => {
        assert.deepStrictEqual(Q.openRange(1), {
          type: 'range',
          closedLower: false,
          closedUpper: false,
          valueType: 'number',
          lower: 1,
          upper: undefined,
        });
        assert.deepStrictEqual(Q.openRange(undefined, 1), {
          type: 'range',
          closedLower: false,
          closedUpper: false,
          valueType: 'number',
          upper: 1,
          lower: undefined,
        });
      });
      it('rejects invalid types', () => {
        assert.throws(
          () => Q.openRange(({ hi: 'hello' } as unknown) as string),
          /SQM001/
        );
      });
      it('rejects mismatch types', () => {
        assert.throws(
          () => Q.openRange('a', (5 as unknown) as string),
          /SQM003/
        );
      });
      it('rejects dual null', () => {
        assert.throws(
          () =>
            Q.openRange(
              (null as unknown) as string,
              (null as unknown) as string
            ),
          /SQM002/
        );
      });
      it('rejects dual undefined', () => {
        assert.throws(
          () => Q.openRange((undefined as unknown) as string),
          /SQM002/
        );
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
    });
  });
});
