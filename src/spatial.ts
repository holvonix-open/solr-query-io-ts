import {
  LSpatial,
  Intersects,
  IsWithin,
  Contains,
  IsDisjointTo,
  Literal,
} from './types';
import * as geojson from '@holvonix-open/geojson-io-ts';

function spatialPredicate<T extends LSpatial['value']['op']>(
  op: T,
  value: geojson.GeometryObject
) {
  return {
    type: 'literal' as const,
    value: {
      type: 'spatial' as const,
      value: {
        op,
        geom: value,
      },
    },
  };
}

export function intersects(value: geojson.GeometryObject): Literal<Intersects> {
  return spatialPredicate('Intersects', value);
}

export function isWithin(value: geojson.GeometryObject): Literal<IsWithin> {
  return spatialPredicate('IsWithin', value);
}

export function contains(value: geojson.GeometryObject): Literal<Contains> {
  return spatialPredicate('Contains', value);
}

export function isDisjointTo(
  value: geojson.GeometryObject
): Literal<IsDisjointTo> {
  return spatialPredicate('IsDisjointTo', value);
}
