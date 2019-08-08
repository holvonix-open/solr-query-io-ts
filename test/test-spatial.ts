import * as assert from 'assert';
import { Q } from '../src/index';
import { Polygon } from '@holvonix-misc/geojson-iots';

describe('spatial', () => {
  describe('builders', () => {
    const geom = {} as Polygon;
    describe('intersects', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.spatial.intersects(geom), {
          type: 'literal',
          value: {
            type: 'spatial',
            value: {
              op: 'Intersects',
              geom,
            },
          },
        });
      });
    });

    describe('contains', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.spatial.contains(geom), {
          type: 'literal',
          value: {
            type: 'spatial',
            value: {
              op: 'Contains',
              geom,
            },
          },
        });
      });
    });

    describe('isDisjointTo', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.spatial.isDisjointTo(geom), {
          type: 'literal',
          value: {
            type: 'spatial',
            value: {
              op: 'IsDisjointTo',
              geom,
            },
          },
        });
      });
    });

    describe('isWithin', () => {
      it('works', () => {
        assert.deepStrictEqual(Q.spatial.isWithin(geom), {
          type: 'literal',
          value: {
            type: 'spatial',
            value: {
              op: 'IsWithin',
              geom,
            },
          },
        });
      });
    });
  });
});
