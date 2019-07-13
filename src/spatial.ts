import {
  Spatial,
  SpatialOp,
  Intersects,
  IsWithin,
  Contains,
  IsDisjointTo,
} from './types';
import * as geojson from 'geojson';

export function spatialPredicate<T extends SpatialOp>(
  op: T,
  value: geojson.Geometry
): Spatial<T> {
  return {
    type: 'spatial',
    op,
    value,
  };
}

export function intersects(value: geojson.Geometry): Intersects {
  return spatialPredicate('Intersects', value);
}

export function isWithin(value: geojson.Geometry): IsWithin {
  return spatialPredicate('IsWithin', value);
}

export function contains(value: geojson.Geometry): Contains {
  return spatialPredicate('Contains', value);
}

export function isDisjointTo(value: geojson.Geometry): IsDisjointTo {
  return spatialPredicate('IsDisjointTo', value);
}
