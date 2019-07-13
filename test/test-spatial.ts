import * as assert from 'assert';
import { Q } from '../src/index';
import * as geojson from 'geojson';

describe('spatial', () => {
  describe('builders', () => {
    const geo = {} as geojson.Polygon;
    describe('intersects', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.spatial.intersects(geo), {
          type: 'literal',
          value: {
            type: 'spatial',
            op: 'Intersects',
            value: geo,
          },
        });
      });
    });

    describe('contains', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.spatial.contains(geo), {
          type: 'literal',
          value: {
            type: 'spatial',
            op: 'Contains',
            value: geo,
          },
        });
      });
    });

    describe('isDisjointTo', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.spatial.isDisjointTo(geo), {
          type: 'literal',
          value: {
            type: 'spatial',
            op: 'IsDisjointTo',
            value: geo,
          },
        });
      });
    });

    describe('isWithin', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.spatial.isWithin(geo), {
          type: 'literal',
          value: {
            type: 'spatial',
            op: 'IsWithin',
            value: geo,
          },
        });
      });
    });
  });
});
