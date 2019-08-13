import * as assert from 'assert';
import * as Q from '../src/Q';
import * as query from '../src/query';
import * as tt from '../src/types';
import { PathReporter } from 'io-ts/lib/PathReporter';
import {
  createCoreRegistry,
  loadIoTsTypesFuzzers,
  ExampleGenerator,
  fuzzContext,
  experimental,
  Fuzzer,
} from 'io-ts-fuzzer';
import { PolygonIO, Polygon, PositionIO } from '@holvonix-open/geojson-io-ts';
import { Either, isRight } from 'fp-ts/lib/Either';
import { Errors, union, string, number } from 'io-ts';
import { nonEmptyArray } from 'io-ts-types/lib/nonEmptyArray';
import { date } from 'io-ts-types/lib/date';

const coordFuzzers = [
  experimental.nonEmptyArrayFuzzer(PositionIO),
  experimental.nonEmptyArrayFuzzer(nonEmptyArray(PositionIO)),
];

describe('query', () => {
  const qToString = (a: unknown) => {
    return d(query.SolrQueryFromElement.decode(a));
  };
  const d = <B>(v: Either<Errors, B>) => {
    if (isRight(v)) {
      return v.right;
    }
    assert.fail(PathReporter.report(v).join(';'));
    throw new Error();
  };
  const lhs = Q.defaultTerm(Q.L('LHS'));
  const rhs = Q.defaultTerm(Q.L('RHS'));
  const rhs2 = Q.defaultTerm(Q.L('RHS2'));
  const rhs3 = Q.defaultTerm(Q.L('RHS3'));
  const rhsNumber = Q.defaultTerm(Q.L(101));
  describe('SolrQueryFromElement', () => {
    describe('converts fuzzed', () => {
      async function fuzzRegistry() {
        const ret = createCoreRegistry();
        ret.register(...(await loadIoTsTypesFuzzers()));
        ret.register(...(coordFuzzers as Fuzzer[]));
        return ret;
      }
      function verifyEncoder(gg: ExampleGenerator<tt.QueryElement>) {
        for (let index = 0; index < 300; index++) {
          const p = gg.encode([index, fuzzContext({ maxRecursionHint: 15 })]);
          qToString(p);
        }
      }
      it('literals', async () => {
        const gg = (await fuzzRegistry()).exampleGenerator(tt.AnyLiteral);
        verifyEncoder(gg as ExampleGenerator<tt.QueryElement>);
      });
      it('ranges', async () => {
        const gg = (await fuzzRegistry()).exampleGenerator(tt.AnyRange);
        verifyEncoder(gg as ExampleGenerator<tt.QueryElement>);
      });
      it('named terms', async () => {
        const gg = (await fuzzRegistry()).exampleGenerator(tt.AnyNamedTerm);
        verifyEncoder(gg as ExampleGenerator<tt.QueryElement>);
      }).timeout(5000);
      it('terms', async () => {
        const gg = (await fuzzRegistry()).exampleGenerator(tt.AnyTerm);
        verifyEncoder(gg as ExampleGenerator<tt.QueryElement>);
      }).timeout(5000);
      it('clauses', async () => {
        const gg = (await fuzzRegistry()).exampleGenerator(tt.Clause);
        verifyEncoder(gg as ExampleGenerator<tt.QueryElement>);
      }).timeout(5000);
      it('query elements', async () => {
        const gg = (await fuzzRegistry()).exampleGenerator(tt.QueryElement);
        verifyEncoder(gg as ExampleGenerator<tt.QueryElement>);
      }).timeout(5000);
    });

    describe('throws on bad fuzzed', () => {
      async function fuzzRegistry() {
        const ret = createCoreRegistry();
        ret.register(...(await loadIoTsTypesFuzzers()));
        ret.register(...(coordFuzzers as Fuzzer[]));
        return ret;
      }
      function verifyEncoderThrows(gg: ExampleGenerator<tt.QueryElement>) {
        for (let index = 0; index < 300; index++) {
          const p = gg.encode([index, fuzzContext({ maxRecursionHint: 20 })]);
          assert.throws(() => qToString(p), /Invalid value/);
        }
      }
      it('primitives', async () => {
        const gg = (await fuzzRegistry()).exampleGenerator(
          union([tt.LSpatial, tt.LNumber, tt.LDate, tt.LString, tt.LGlob])
        );
        verifyEncoderThrows(gg as ExampleGenerator<tt.QueryElement>);
      });
      it('strings, numbers, and dates', async () => {
        const gg = (await fuzzRegistry()).exampleGenerator(
          union([string, number, date])
        );
        verifyEncoderThrows(gg as ExampleGenerator<tt.QueryElement>);
      });
    });

    it('escapes simple string literals', () => {
      assert.deepStrictEqual(qToString(Q.L('')), '""');
      assert.deepStrictEqual(qToString(Q.L('a')), '"a"');
      assert.deepStrictEqual(qToString(Q.L('a b')), '"a b"');
      assert.deepStrictEqual(
        qToString(Q.L('ajsncn*mf.ef\\jnwefewnf')),
        '"ajsncn*mf.ef\\\\jnwefewnf"'
      );
    });

    it('escapes wildcard literals', () => {
      assert.deepStrictEqual(qToString(Q.glob('')), '');
      assert.deepStrictEqual(qToString(Q.glob('a')), 'a');
      assert.deepStrictEqual(qToString(Q.glob('a b')), 'a\\ b');
      assert.deepStrictEqual(
        qToString(Q.glob('Hello Wor?d*')),
        'Hello\\ Wor?d*'
      );
      assert.deepStrictEqual(
        qToString(Q.glob('He +-&|!(){}[]^"~:/\\llo W??o!!!r?d*')),
        'He\\ \\+\\-\\&\\|\\!\\(\\)\\{\\}\\[\\]\\^\\"\\~\\:\\/\\\\llo\\ W??o\\!\\!\\!r?d*'
      );
    });

    it('generates wildcards', () => {
      assert.deepStrictEqual(qToString(Q.glob('*')), '*');
    });

    it('leaves simple numbers alone', () => {
      assert.deepStrictEqual(qToString(Q.L(6)), '6');
      assert.deepStrictEqual(qToString(Q.L(-1000.245)), '-1000.245');
    });

    it('generates appropriate dates', () => {
      assert.deepStrictEqual(
        qToString(Q.L(new Date(Date.UTC(2010, 7, 6, 4, 23, 4)))),
        '2010-08-06T04:23:04.000Z'
      );
      assert.deepStrictEqual(
        qToString(Q.L(new Date(Date.UTC(2010, 7, 6, 4, 23, 4, 53)))),
        '2010-08-06T04:23:04.053Z'
      );
    });

    it('generates wildcard ranges', () => {
      assert.deepStrictEqual(
        qToString({
          type: 'range',
          valueType: 'number',
          closedLower: true,
          closedUpper: true,
          lower: 4,
        }),
        '[4 TO *]'
      );
      assert.deepStrictEqual(
        qToString({
          type: 'range',
          valueType: 'number',
          closedLower: true,
          closedUpper: true,
          upper: 4,
        }),
        '[* TO 4]'
      );
    });

    it('generates numeric ranges', () => {
      assert.deepStrictEqual(
        qToString({
          type: 'range',
          valueType: 'number',
          closedLower: true,
          closedUpper: true,
          lower: 4,
          upper: 15,
        }),
        '[4 TO 15]'
      );
      assert.deepStrictEqual(
        qToString({
          type: 'range',
          valueType: 'number',
          closedLower: false,
          closedUpper: true,
          lower: 4,
          upper: 15,
        }),
        '{4 TO 15]'
      );
      assert.deepStrictEqual(
        qToString({
          type: 'range',
          valueType: 'number',
          closedLower: true,
          closedUpper: false,
          lower: 4,
          upper: 15,
        }),
        '[4 TO 15}'
      );
      assert.deepStrictEqual(
        qToString({
          type: 'range',
          valueType: 'number',
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
        qToString({
          type: 'range',
          valueType: 'string',
          closedLower: true,
          closedUpper: true,
          lower: 'b',
          upper: 'cat',
        }),
        '["b" TO "cat"]'
      );
      assert.deepStrictEqual(
        qToString({
          type: 'range',
          valueType: 'string',
          closedLower: false,
          closedUpper: true,
          lower: 'b',
          upper: 'cat',
        }),
        '{"b" TO "cat"]'
      );
      assert.deepStrictEqual(
        qToString({
          type: 'range',
          valueType: 'string',
          closedLower: true,
          closedUpper: false,
          lower: 'b',
          upper: 'cat',
        }),
        '["b" TO "cat"}'
      );
      assert.deepStrictEqual(
        qToString({
          type: 'range',
          valueType: 'string',
          closedLower: false,
          closedUpper: false,
          lower: 'b',
          upper: 'cat',
        }),
        '{"b" TO "cat"}'
      );
    });

    it('escapes quotes in strings', () => {
      assert.deepStrictEqual(qToString(Q.L('"')), '"\\""');
      assert.deepStrictEqual(qToString(Q.L('a"b"')), '"a\\"b\\""');
      assert.deepStrictEqual(
        qToString(Q.L('ajsnc"nemf.efjnwefewnf')),
        '"ajsnc\\"nemf.efjnwefewnf"'
      );
    });
    it('works on simple terms', () => {
      assert.deepStrictEqual(qToString(Q.defaultTerm(Q.L('hello'))), '"hello"');
    });
    it('works on named terms', () => {
      assert.deepStrictEqual(
        qToString(Q.term('text', Q.L('hello'))),
        'text:"hello"'
      );
    });

    it('works on named wildcards', () => {
      assert.deepStrictEqual(qToString(Q.term('text', Q.glob('*'))), 'text:*');
    });
    it('works on named phrases', () => {
      assert.deepStrictEqual(
        qToString(Q.term('text', Q.L('hello bye'))),
        'text:"hello bye"'
      );
    });
    it('works on simple phrases', () => {
      assert.deepStrictEqual(
        qToString(Q.defaultTerm(Q.L('hello goodbye'))),
        '"hello goodbye"'
      );
    });
    it('works on escaped phrases', () => {
      assert.deepStrictEqual(
        qToString(Q.defaultTerm(Q.L('hello"goodb\\ye'))),
        '"hello\\"goodb\\\\ye"'
      );
    });

    it('works on not', () => {
      assert.deepStrictEqual(qToString(Q.not(lhs)), '(NOT "LHS")');
    });

    it('works on prohibited', () => {
      assert.deepStrictEqual(qToString(Q.prohibited(lhs)), '-"LHS"');
    });

    it('works on required', () => {
      assert.deepStrictEqual(qToString(Q.required(lhs)), '+"LHS"');
    });

    it('works on constant', () => {
      assert.deepStrictEqual(
        qToString(Q.constantScore(lhs, 7.5)),
        '("LHS")^=7.5'
      );
    });

    it('works on and', () => {
      assert.deepStrictEqual(
        qToString(Q.and(lhs, rhs, rhs2, rhs3)),
        '("LHS" AND "RHS" AND "RHS2" AND "RHS3")'
      );
    });

    it('works on and literals', () => {
      assert.deepStrictEqual(
        qToString(Q.and(Q.L('A'), Q.L('B'))),
        '("A" AND "B")'
      );
    });

    it('works on or terms', () => {
      assert.deepStrictEqual(
        qToString(Q.or(lhs, rhs, rhs2, rhs3)),
        '("LHS" OR "RHS" OR "RHS2" OR "RHS3")'
      );
    });

    it('works on or literals', () => {
      assert.deepStrictEqual(
        qToString(Q.or(Q.L('A'), Q.L('B'))),
        '("A" OR "B")'
      );
    });

    it('works on or mixed terms', () => {
      assert.deepStrictEqual(
        qToString(Q.or(lhs, rhs, rhs2, rhsNumber)),
        '("LHS" OR "RHS" OR "RHS2" OR 101)'
      );
    });

    describe('spatial', () => {
      const p: Polygon = {
        type: 'Polygon',
        coordinates: [
          [[10.0, 0.0], [101.0, 21.0], [60.0, 1.024], [10.0, 0.0]],
          [[0, 0], [-10, -10], [20, 30], [0, 0]],
        ],
      };
      const obj = d(PolygonIO.decode(p));
      it('throws on bad geojson', () => {
        const bad: Polygon = {
          type: 'PolygonZ' as 'Polygon',
          coordinates: [
            [[10.0, 0.0], [101.0, 21.0], [60.0, 1.024], [10.0, 0.0]],
            [[0, 0], [-10, -10], [20, 30], [0, 0]],
          ],
        };
        assert.throws(
          () => qToString(Q.term('geo', Q.spatial.intersects(bad))),
          /Invalid value/
        );
      });
      it('intersects', () => {
        assert.deepStrictEqual(
          qToString(Q.term('geo', Q.spatial.intersects(obj))),
          'geo:"Intersects(POLYGON((10 0,101 21,60 1.024,10 0),(0 0,-10 -10,20 30,0 0)))"'
        );
      });
      it('contains', () => {
        assert.deepStrictEqual(
          qToString(Q.term('geo', Q.spatial.contains(obj))),
          'geo:"Contains(POLYGON((10 0,101 21,60 1.024,10 0),(0 0,-10 -10,20 30,0 0)))"'
        );
      });
      it('isDisjointTo', () => {
        assert.deepStrictEqual(
          qToString(Q.term('geo', Q.spatial.isDisjointTo(obj))),
          'geo:"IsDisjointTo(POLYGON((10 0,101 21,60 1.024,10 0),(0 0,-10 -10,20 30,0 0)))"'
        );
      });
      it('isWithin', () => {
        assert.deepStrictEqual(
          qToString(Q.term('geo', Q.spatial.isWithin(obj))),
          'geo:"IsWithin(POLYGON((10 0,101 21,60 1.024,10 0),(0 0,-10 -10,20 30,0 0)))"'
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
        qToString(q),
        '(geo:"Intersects(POINT(-122.17381 37.426002))" OR "spicy" OR product:([100 TO *] AND (NOT 600)))'
      );
    });

    it('works on GeometryCollections', () => {
      const q = Q.term(
        'geo',
        Q.spatial.intersects({
          type: 'GeometryCollection',
          geometries: [
            {
              type: 'Point',
              coordinates: [-122.17381, 37.426002],
            },
            {
              type: 'Polygon',
              coordinates: [
                [
                  [-122.17381, 37.426002],
                  [12.181, 39.426002],
                  [-122.17381, 37.426002],
                ],
              ],
            },
          ],
        })
      );

      assert.deepStrictEqual(
        qToString(q),
        'geo:"Intersects(GEOMETRYCOLLECTION(POINT(-122.17381 37.426002),POLYGON((-122.17381 37.426002,12.181 39.426002,-122.17381 37.426002))))"'
      );
    });

    it('works on complex tree 2', () => {
      assert.deepStrictEqual(
        qToString(
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
