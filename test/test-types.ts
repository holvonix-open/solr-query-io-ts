import * as assert from 'assert';
import * as tt from '../src/types';
import { isRight, isLeft } from 'fp-ts/lib/Either';
import { closedRange } from '../src/Q';

describe('types', () => {
  describe('codec verification', () => {
    describe('Range', () => {
      it('LNumber', () => {
        const r = tt.Range.get(tt.LNumber)!;
        assert.ok(isRight(r.decode(closedRange(100, 300))));
        assert.ok(isLeft(r.decode(closedRange('a', 'bb'))));
        assert.ok(isLeft(r.decode(closedRange(undefined, new Date()))));
      });

      it('LString', () => {
        const r = tt.Range.get(tt.LString)!;
        assert.ok(isLeft(r.decode(closedRange(100, 300))));
        assert.ok(isRight(r.decode(closedRange('a', 'bb'))));
        assert.ok(isLeft(r.decode(closedRange(undefined, new Date()))));
      });

      it('LDate', () => {
        const r = tt.Range.get(tt.LDate)!;
        assert.ok(isLeft(r.decode(closedRange(100, 300))));
        assert.ok(isLeft(r.decode(closedRange('a', 'bb'))));
        assert.ok(isRight(r.decode(closedRange(undefined, new Date()))));
      });
    });
  });
});
