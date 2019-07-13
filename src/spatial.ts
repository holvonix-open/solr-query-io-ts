import {
  Spatial,
  SpatialOp,
  Intersects,
  IsWithin,
  Contains,
  IsDisjointTo,
  Literal,
} from './types';
import * as geojson from 'geojson';

export function spatialPredicate<T extends SpatialOp>(
  op: T,
  value: geojson.Geometry
): Literal<Spatial<T>> {
  return {
    type: 'literal',
    value: {
      type: 'spatial',
      op,
      value,
    },
  };
}

export function intersects(value: geojson.Geometry): Literal<Intersects> {
  return spatialPredicate('Intersects', value);
}

export function isWithin(value: geojson.Geometry): Literal<IsWithin> {
  return spatialPredicate('IsWithin', value);
}

export function contains(value: geojson.Geometry): Literal<Contains> {
  return spatialPredicate('Contains', value);
}

export function isDisjointTo(value: geojson.Geometry): Literal<IsDisjointTo> {
  return spatialPredicate('IsDisjointTo', value);
}
