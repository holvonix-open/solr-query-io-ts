import * as assert from 'assert';
import * as tt from '../src/types';
import { isRight, isLeft } from 'fp-ts/lib/Either';
import { closedRange } from '../src/Q';
import * as t from 'io-ts';
import { Q } from '../src';
import { Polygon } from '@holvonix-open/geojson-io-ts';

describe('types', () => {
  const geo: Polygon = {
    type: 'Polygon',
    coordinates: [[[20, 30], [0, 0], [20, 30]]],
  };
  describe('codec verification', () => {
    describe('Range', () => {
      it('LNumber', () => {
        const r = tt.Range(tt.LNumber);
        assert.ok(isRight(r.decode(closedRange(100, 300))));
        assert.ok(isLeft(r.decode(closedRange('a', 'bb'))));
        assert.ok(isLeft(r.decode(closedRange(undefined, new Date()))));
      });

      it('LString', () => {
        const r = tt.Range(tt.LString);
        assert.ok(isLeft(r.decode(closedRange(100, 300))));
        assert.ok(isRight(r.decode(closedRange('a', 'bb'))));
        assert.ok(isLeft(r.decode(closedRange(undefined, new Date()))));
      });

      it('LDate', () => {
        const r = tt.Range(tt.LDate);
        assert.ok(isLeft(r.decode(closedRange(100, 300))));
        assert.ok(isLeft(r.decode(closedRange('a', 'bb'))));
        assert.ok(isRight(r.decode(closedRange(undefined, new Date()))));
      });

      it('throws on invalid primitive', () => {
        assert.throws(
          () => tt.Range((t.string as unknown) as typeof tt.LString),
          /SQM004/
        );
      });
      it('throws on non-ranged primitive', () => {
        assert.throws(
          () => tt.Range((tt.LSpatial as unknown) as typeof tt.LString),
          /SQM004/
        );
      });
      it('throws on spatial subtype', () => {
        assert.throws(
          () => tt.Range((tt.Intersects as unknown) as typeof tt.LString),
          /SQM005/
        );
      });
    });

    describe('Literal', () => {
      it('LNumber', () => {
        const r = tt.Literal(tt.LNumber);
        assert.ok(isRight(r.decode(Q.L(2))));
        assert.ok(isLeft(r.decode(Q.L('2'))));
        assert.ok(isLeft(r.decode(Q.glob('2'))));
        assert.ok(isLeft(r.decode(Q.L(new Date()))));
        assert.ok(isLeft(r.decode(Q.spatial.contains(geo))));
        assert.ok(isLeft(r.decode(closedRange('a', 'bb'))));
        assert.ok(isLeft(r.decode(closedRange(undefined, new Date()))));
      });

      it('LString', () => {
        const r = tt.Literal(tt.LString);
        assert.ok(isLeft(r.decode(Q.L(2))));
        assert.ok(isRight(r.decode(Q.L('2'))));
        assert.ok(isLeft(r.decode(Q.glob('2'))));
        assert.ok(isLeft(r.decode(Q.L(new Date()))));
        assert.ok(isLeft(r.decode(Q.spatial.contains(geo))));
        assert.ok(isLeft(r.decode(closedRange('a', 'bb'))));
        assert.ok(isLeft(r.decode(closedRange(undefined, new Date()))));
      });

      it('LGlob', () => {
        const r = tt.Literal(tt.LGlob);
        assert.ok(isLeft(r.decode(Q.L(2))));
        assert.ok(isLeft(r.decode(Q.L('2'))));
        assert.ok(isRight(r.decode(Q.glob('2'))));
        assert.ok(isLeft(r.decode(Q.L(new Date()))));
        assert.ok(isLeft(r.decode(Q.spatial.contains(geo))));
        assert.ok(isLeft(r.decode(closedRange('a', 'bb'))));
        assert.ok(isLeft(r.decode(closedRange(undefined, new Date()))));
      });

      it('LSpatial', () => {
        const r = tt.Literal(tt.LSpatial);
        assert.ok(isLeft(r.decode(Q.L(2))));
        assert.ok(isLeft(r.decode(Q.L('2'))));
        assert.ok(isLeft(r.decode(Q.glob('2'))));
        assert.ok(isLeft(r.decode(Q.L(new Date()))));
        assert.ok(isRight(r.decode(Q.spatial.contains(geo))));
        assert.ok(isLeft(r.decode(closedRange('a', 'bb'))));
        assert.ok(isLeft(r.decode(closedRange(undefined, new Date()))));
      });

      it('LDate', () => {
        const r = tt.Literal(tt.LDate);
        assert.ok(isLeft(r.decode(Q.L(2))));
        assert.ok(isLeft(r.decode(Q.L('2'))));
        assert.ok(isLeft(r.decode(Q.glob('2'))));
        assert.ok(isRight(r.decode(Q.L(new Date()))));
        assert.ok(isLeft(r.decode(Q.spatial.contains(geo))));
        assert.ok(isLeft(r.decode(closedRange('a', 'bb'))));
        assert.ok(isLeft(r.decode(closedRange(undefined, new Date()))));
      });

      it('throws on invalid primitive', () => {
        assert.throws(
          () => tt.Literal((t.string as unknown) as typeof tt.LString),
          /SQM004/
        );
      });
      it('throws on spatial subtype', () => {
        assert.throws(
          () => tt.Literal((tt.Intersects as unknown) as typeof tt.LString),
          /SQM005/
        );
      });
    });

    describe('TermValue', () => {
      it('throws on invalid primitive', () => {
        assert.throws(
          () => tt.TermValue((t.string as unknown) as typeof tt.LString),
          /SQM004/
        );
      });
      it('throws on spatial subtype', () => {
        assert.throws(
          () => tt.TermValue((tt.Intersects as unknown) as typeof tt.LString),
          /SQM005/
        );
      });
    });

    describe('NonPrimitiveTermValue', () => {
      it('throws on invalid primitive', () => {
        assert.throws(
          () =>
            tt.NonPrimitiveTermValue(
              (t.string as unknown) as typeof tt.LString
            ),
          /SQM004/
        );
      });
      it('throws on spatial subtype', () => {
        assert.throws(
          () =>
            tt.NonPrimitiveTermValue(
              (tt.Intersects as unknown) as typeof tt.LString
            ),
          /SQM005/
        );
      });
    });

    describe('Term', () => {
      it('throws on invalid primitive', () => {
        assert.throws(
          () => tt.Term((t.string as unknown) as typeof tt.LString),
          /SQM004/
        );
      });
      it('throws on spatial subtype', () => {
        assert.throws(
          () => tt.Term((tt.Intersects as unknown) as typeof tt.LString),
          /SQM005/
        );
      });
    });

    describe('NamedTerm', () => {
      it('throws on invalid primitive', () => {
        assert.throws(
          () => tt.NamedTerm((t.string as unknown) as typeof tt.LString),
          /SQM004/
        );
      });
      it('throws on spatial subtype', () => {
        assert.throws(
          () => tt.NamedTerm((tt.Intersects as unknown) as typeof tt.LString),
          /SQM005/
        );
      });
    });

    describe('AndTerm', () => {
      it('throws on invalid primitive', () => {
        assert.throws(
          () => tt.AndTerm((t.string as unknown) as typeof tt.LString),
          /SQM004/
        );
      });
      it('throws on spatial subtype', () => {
        assert.throws(
          () => tt.AndTerm((tt.Intersects as unknown) as typeof tt.LString),
          /SQM005/
        );
      });
    });

    describe('OrTerm', () => {
      it('throws on invalid primitive', () => {
        assert.throws(
          () => tt.OrTerm((t.string as unknown) as typeof tt.LString),
          /SQM004/
        );
      });
      it('throws on spatial subtype', () => {
        assert.throws(
          () => tt.OrTerm((tt.Intersects as unknown) as typeof tt.LString),
          /SQM005/
        );
      });
    });

    describe('NotTerm', () => {
      it('throws on invalid primitive', () => {
        assert.throws(
          () => tt.NotTerm((t.string as unknown) as typeof tt.LString),
          /SQM004/
        );
      });
      it('throws on spatial subtype', () => {
        assert.throws(
          () => tt.NotTerm((tt.Intersects as unknown) as typeof tt.LString),
          /SQM005/
        );
      });
    });

    describe('RequiredTerm', () => {
      it('throws on invalid primitive', () => {
        assert.throws(
          () => tt.RequiredTerm((t.string as unknown) as typeof tt.LString),
          /SQM004/
        );
      });
      it('throws on spatial subtype', () => {
        assert.throws(
          () =>
            tt.RequiredTerm((tt.Intersects as unknown) as typeof tt.LString),
          /SQM005/
        );
      });
    });

    describe('ProhibitedTerm', () => {
      it('throws on invalid primitive', () => {
        assert.throws(
          () => tt.ProhibitedTerm((t.string as unknown) as typeof tt.LString),
          /SQM004/
        );
      });
      it('throws on spatial subtype', () => {
        assert.throws(
          () =>
            tt.ProhibitedTerm((tt.Intersects as unknown) as typeof tt.LString),
          /SQM005/
        );
      });
    });
  });
});
