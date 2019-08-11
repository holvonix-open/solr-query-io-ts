import * as t from 'io-ts';
import * as types from './types';
import { either } from 'fp-ts/lib/Either';

import {
  Primitive,
  Range,
  LSpatial,
  RangedPrimitive,
  QueryElement,
} from './types';

import * as wktio from 'wkt-io-ts';
import { WKT } from 'wkt-io-ts';
import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';

export interface SolrQueryBrand {
  readonly SolrQuery: unique symbol;
}

// tslint:disable-next-line:variable-name
const SolrQuery = t.brand(
  t.string,
  // this is used below, and internally only, where the result is
  // neccessarily the result of Q.toString.
  (_): _ is t.Branded<string, SolrQueryBrand> => true,
  'SolrQuery'
);
export type SolrQuery = t.Branded<string, SolrQueryBrand>;

/* istanbul ignore next */
function nope(): never {
  throw new Error('unsupported');
}

function wkt(g: LSpatial['value']['geom']): WKT {
  const d = wktio.WKTStringFromGeometry.decode(g);
  /* istanbul ignore if */
  if (!isRight(d)) {
    // this shouldn't happen since we validated the geometry earlier
    throw new Error('Cannot parse: ' + PathReporter.report(d).join('; '));
  }
  return d.right;
}

function toLiteralString<T extends Primitive>(
  ct: T['type'],
  c?: T['value']
): string {
  if (c == null) {
    return '*';
  }
  switch (ct) {
    case 'string':
      return quoteString(c as string);
    case 'number':
      return `${c as number}`;
    case 'date':
      return (c as Date).toISOString();
    case 'spatial':
      return quoteString(
        `${(c as LSpatial['value']).op}(${wkt((c as LSpatial['value']).geom)})`
      );
    case 'glob':
      return escapedGlob(c as string);
    /* istanbul ignore next */
    default:
      /* istanbul ignore next */
      return nope();
  }
}

function toRangeString(v: Range<RangedPrimitive>): string {
  return (
    (v.closedLower ? '[' : '{') +
    toLiteralString(v.valueType, v.lower) +
    ' TO ' +
    toLiteralString(v.valueType, v.upper) +
    (v.closedUpper ? ']' : '}')
  );
}

function escapedGlob(v: string) {
  // don't escape * or ?
  return v.replace(/[ +\-&|!(){}\[\]^"~:/\\]/g, '\\$&');
}

function quoteString(v: string) {
  return `"${v.replace(/["\\]/g, '\\$&')}"`;
}

function binaryOp(op: string, operands: QueryElement[]) {
  const elems: string[] = [];
  for (const v of operands) {
    elems.push(toStringImpl(v));
  }
  return `(${elems.join(` ${op} `)})`;
}

function toStringImpl(c: QueryElement): string {
  switch (c.type) {
    case 'range':
      return toRangeString(c);
    case 'term':
      return toStringImpl(c.value);
    case 'namedterm':
      return c.field + ':' + toStringImpl(c.value);
    case 'and':
      return binaryOp('AND', c.operands);
    case 'constant':
      return `(${toStringImpl(c.lhs)})^=${c.rhs}`;
    case 'not':
      return `(NOT ${toStringImpl(c.rhs)})`;
    case 'or':
      return binaryOp('OR', c.operands);
    case 'prohibited':
      return `-${toStringImpl(c.rhs)}`;
    case 'required':
      return `+${toStringImpl(c.rhs)}`;
    case 'literal':
      return toLiteralString(c.value.type, c.value.value);
    /* istanbul ignore next */
    default:
      /* istanbul ignore next */
      return nope();
  }
}

export interface SolrQueryFromElementC extends t.Decoder<unknown, SolrQuery> {}

/**
 * Converts (and validates) an input QueryElement to a string Solr query.
 */
// tslint:disable-next-line:variable-name
export const SolrQueryFromElement: SolrQueryFromElementC = new t.Type<
  SolrQuery,
  SolrQuery,
  unknown
>(
  'solr-query-io-ts:SolrQueryFromElement',
  /* istanbul ignore next */
  (_): _ is SolrQuery => {
    throw new Error();
  },
  (inp, ctx) =>
    either.chain(types.QueryElement.validate(inp, ctx), qe => {
      try {
        return SolrQuery.decode(toStringImpl(qe));
      } catch (err) {
        /* istanbul ignore next */
        return t.failure(inp, ctx);
      }
    }),
  t.identity
).asDecoder();
