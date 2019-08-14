import * as assert from 'assert';
import * as query from '../src/query';
import * as simple from '../src/simple';
import * as tt from '../src/types';
import { PathReporter } from 'io-ts/lib/PathReporter';
import {
  createCoreRegistry,
  loadIoTsTypesFuzzers,
  ExampleGenerator,
  fuzzContext,
} from 'io-ts-fuzzer';
import { Either, isRight, either } from 'fp-ts/lib/Either';
import { Errors, Decoder, Type } from 'io-ts';

describe('simple', () => {
  function qtos<T extends tt.QueryElement>(
    t1: Decoder<unknown, T>
  ): Decoder<unknown, query.SolrQuery> {
    // tslint:disable-next-line:no-any
    return new Type<query.SolrQuery, any, unknown>(
      'qtos',
      (_): _ is query.SolrQuery => true,
      (inp, ctx) =>
        either.chain(t1.validate(inp, ctx), i =>
          query.SolrQueryFromElement.validate(i, ctx)
        ),
      () => {
        throw new Error();
      }
    ).asDecoder();
  }
  async function fuzzRegistry() {
    const ret = createCoreRegistry();
    ret.register(...(await loadIoTsTypesFuzzers()));
    return ret;
  }
  function verifyEncoder(
    gg: ExampleGenerator<unknown>,
    // tslint:disable-next-line:no-any
    c: Decoder<any, unknown>,
    // tslint:disable-next-line:no-any
    c2: Decoder<any, unknown>
  ) {
    for (let index = 0; index < 300; index++) {
      const p = gg.encode([index, fuzzContext({ maxRecursionHint: 20 })]);
      const u = c.decode(p);
      const d1 = d(u);
      const d2 = d(c2.decode(d1));
      assert.deepStrictEqual(d1, d2);
    }
  }
  const d = <B>(v: Either<Errors, B>) => {
    if (isRight(v)) {
      return v.right;
    }
    throw new Error(PathReporter.report(v).join(';'));
  };

  describe('LStringTermValueFromSimpleStrings', () => {
    describe('converts fuzzed', () => {
      it('succeeds on good input', async () => {
        const gg = (await fuzzRegistry()).exampleGenerator(
          simple.SimpleStringTermValue
        );
        verifyEncoder(
          gg,
          simple.LStringTermValueFromSimpleStrings,
          tt.TermValue(tt.LString)
        );
      });
    });

    describe('cases', () => {
      const qtosPipe = qtos(simple.LStringTermValueFromSimpleStrings);
      it('simple empty', () => {
        const a = {
          eq: ['e1', 'e2'],
          neq: ['ne1', 'ne2'],
          glob: ['*', '?'],
          gt: ['a', 'z'],
          gte: ['B', 'Y'],
          lt: ['c', 'g'],
          lte: ['D', 'K'],
        };
        assert.deepStrictEqual(
          d(qtosPipe.decode(a)),
          '(("e1" OR "e2") AND ((NOT "ne1") OR (NOT "ne2")) AND ({"a" TO *} OR {"z" TO *}) AND ({* TO "c"} OR {* TO "g"}) AND (["B" TO *] OR ["Y" TO *]) AND ([* TO "D"] OR [* TO "K"]) AND (* OR ?))'
        );
      });
    });
  });

  describe('LNumberTermValueFromSimpleStrings', () => {
    describe('converts fuzzed', () => {
      it('all', async () => {
        const gg = (await fuzzRegistry()).exampleGenerator(
          simple.SimpleNumberTermValueFromStrings
        );
        verifyEncoder(
          gg,
          simple.LNumberTermValueFromSimpleStrings,
          tt.TermValue(tt.LNumber)
        );
      });
    });

    describe('cases', () => {
      const qtosPipe = qtos(simple.LNumberTermValueFromSimpleStrings);
      it('simple empty', () => {
        const a = {};
        assert.deepStrictEqual(d(qtosPipe.decode(a)), '()');
      });

      it('simple eq', () => {
        const a = {
          eq: '45',
        };
        assert.deepStrictEqual(d(qtosPipe.decode(a)), '((45))');
      });

      it('simple eq 1 item', () => {
        const a = {
          eq: ['-985.4'],
        };
        assert.deepStrictEqual(d(qtosPipe.decode(a)), '((-985.4))');
      });

      it('simple eq 3 items', () => {
        const a = {
          eq: ['0.45', '-3', '934'],
        };
        assert.deepStrictEqual(d(qtosPipe.decode(a)), '((0.45 OR -3 OR 934))');
      });

      it('simple neq 3 items', () => {
        const a = {
          neq: ['70', '40', '34'],
        };
        assert.deepStrictEqual(
          d(qtosPipe.decode(a)),
          '(((NOT 70) OR (NOT 40) OR (NOT 34)))'
        );
      });

      it('combo eq+neq', () => {
        const a = {
          eq: '34',
          neq: ['96', '85', '93'],
        };
        assert.deepStrictEqual(
          d(qtosPipe.decode(a)),
          '((34) AND ((NOT 96) OR (NOT 85) OR (NOT 93)))'
        );
      });

      it('empty all items', () => {
        const a = {
          eq: [],
          neq: [],
          glob: [],
          gt: [],
          gte: [],
          lt: [],
          lte: [],
        };
        assert.deepStrictEqual(d(qtosPipe.decode(a)), '()');
      });

      it('has all items', () => {
        const a = {
          eq: ['39', '59'],
          neq: ['0.34', '34'],
          glob: ['*', '?'], // ignored!
          gt: ['95', '23'],
          gte: ['93', '835'],
          lt: ['9355', '22'],
          lte: ['93', '86'],
        };
        assert.deepStrictEqual(
          d(qtosPipe.decode(a)),
          '((39 OR 59) AND ((NOT 0.34) OR (NOT 34)) AND ({95 TO *} OR {23 TO *}) AND ({* TO 9355} OR {* TO 22}) AND ([93 TO *] OR [835 TO *]) AND ([* TO 93] OR [* TO 86]))'
        );
      });
    });
  });

  describe('LDateTermValueFromSimpleStrings', () => {
    describe('converts fuzzed', () => {
      it('all', async () => {
        const gg = (await fuzzRegistry()).exampleGenerator(
          simple.SimpleDateTermValueFromStrings
        );
        verifyEncoder(
          gg,
          simple.LDateTermValueFromSimpleStrings,
          tt.TermValue(tt.LDate)
        );
      });
    });

    describe('cases', () => {
      const qtosPipe = qtos(simple.LDateTermValueFromSimpleStrings);
      it('simple empty', () => {
        const a = {};
        assert.deepStrictEqual(d(qtosPipe.decode(a)), '()');
      });

      it('simple eq', () => {
        const a = {
          eq: '2019-02-23T09:34:23.924Z',
        };
        assert.deepStrictEqual(
          d(qtosPipe.decode(a)),
          '((2019-02-23T09:34:23.924Z))'
        );
      });

      it('simple eq 1 item', () => {
        const a = {
          eq: ['2019-02-23T09:34:23.924Z'],
        };
        assert.deepStrictEqual(
          d(qtosPipe.decode(a)),
          '((2019-02-23T09:34:23.924Z))'
        );
      });

      it('simple eq 3 items', () => {
        const a = {
          eq: [
            '2019-02-23T09:34:23.924Z',
            '2009-02-23T09:34:23.924Z',
            '2029-02-23T09:34:23.924Z',
          ],
        };
        assert.deepStrictEqual(
          d(qtosPipe.decode(a)),
          '((2019-02-23T09:34:23.924Z OR 2009-02-23T09:34:23.924Z OR 2029-02-23T09:34:23.924Z))'
        );
      });

      it('simple neq 3 items', () => {
        const a = {
          neq: [
            '2019-02-23T09:34:23.924Z',
            '2009-02-23T09:34:23.924Z',
            '2029-02-23T09:34:23.924Z',
          ],
        };
        assert.deepStrictEqual(
          d(qtosPipe.decode(a)),
          '(((NOT 2019-02-23T09:34:23.924Z) OR (NOT 2009-02-23T09:34:23.924Z) OR (NOT 2029-02-23T09:34:23.924Z)))'
        );
      });

      it('combo eq+neq', () => {
        const a = {
          eq: '2019-02-23T09:34:23.924Z',
          neq: [
            '2219-02-23T09:34:23.924Z',
            '2319-02-23T09:34:23.924Z',
            '2419-02-23T09:34:23.924Z',
          ],
        };
        assert.deepStrictEqual(
          d(qtosPipe.decode(a)),
          '((2019-02-23T09:34:23.924Z) AND ((NOT 2219-02-23T09:34:23.924Z) OR (NOT 2319-02-23T09:34:23.924Z) OR (NOT 2419-02-23T09:34:23.924Z)))'
        );
      });

      it('empty all items', () => {
        const a = {
          eq: [],
          neq: [],
          glob: [],
          gt: [],
          gte: [],
          lt: [],
          lte: [],
        };
        assert.deepStrictEqual(d(qtosPipe.decode(a)), '()');
      });

      it('has all items', () => {
        const a = {
          eq: ['2019-02-23T09:34:23.924Z', '2019-02-23T09:34:23.964Z'],
          neq: ['2019-02-25T09:34:23.924Z', '2019-02-23T09:36:23.924Z'],
          glob: ['20??-02-23T09:34:23.924Z', '2019-02-23T09:34:*'],
          gt: ['2019-02-23T09:34:23.924Z', '2019-02-23T11:34:23.924Z'],
          gte: ['2019-02-23T09:44:23.924Z', '2019-02-23T09:34:43.924Z'],
          lt: ['2019-02-13T09:34:23.924Z', '2019-02-23T09:34:23.904Z'],
          lte: ['2019-02-23T09:34:26.924Z', '2019-02-23T09:34:27.924Z'],
        };
        assert.deepStrictEqual(
          d(qtosPipe.decode(a)),
          '((2019-02-23T09:34:23.924Z OR 2019-02-23T09:34:23.964Z) AND ((NOT 2019-02-25T09:34:23.924Z) OR (NOT 2019-02-23T09:36:23.924Z)) AND ({2019-02-23T09:34:23.924Z TO *} OR {2019-02-23T11:34:23.924Z TO *}) AND ({* TO 2019-02-13T09:34:23.924Z} OR {* TO 2019-02-23T09:34:23.904Z}) AND ([2019-02-23T09:44:23.924Z TO *] OR [2019-02-23T09:34:43.924Z TO *]) AND ([* TO 2019-02-23T09:34:26.924Z] OR [* TO 2019-02-23T09:34:27.924Z]) AND (20??\\-02\\-23T09\\:34\\:23.924Z OR 2019\\-02\\-23T09\\:34\\:*))'
        );
      });
    });
  });
});
