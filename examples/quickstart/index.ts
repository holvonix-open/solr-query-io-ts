import { Q, QueryElement, SolrQueryFromElement, simple } from 'solr-query-io-ts';
import { inspect } from 'util';
import { Right } from 'fp-ts/lib/Either';

// Build up a query using the 'Q' module.
function makeQuery() {
  // (geo:"Intersects(POINT(-122.17381 37.426002))" OR "spicy" OR title:He??o OR product:([100 TO *] AND (NOT 600)))
  const tree = Q.or(
    Q.term(
      'geo',
      Q.spatial.intersects({
        type: 'Point',
        coordinates: [-122.17381, 37.426002],
      })
    ),
    Q.defaultTerm(Q.L('spicy')),
    Q.term('title', Q.glob('He??o')),
    Q.term('product', Q.and(Q.closedRange(100, undefined), Q.not(Q.L(600))))
  );
  // convert to a string.
  return SolrQueryFromElement.decode(tree);
}

console.log(makeQuery());

// Build up a query using the 'simple' module.
// This module is useful for parsing user-provided API input (ex. URL query params).
function makeSimple() {
  // (((NOT "zzz-VERYBAD")) AND ({"zzz-FILES" TO *}) AND (README* OR CHANGE*))
  const tree = {
    gt: 'zzz-FILES',
    neq: ['zzz-VERYBAD'],
    glob: ['README*', 'CHANGE*']
  };
  // convert to a query element.  This result can be passed
  // to SolrQueryFromElement to get a string query.
  return SolrQueryFromElement.decode((simple.LStringTermValueFromSimpleStrings.decode(tree) as Right<QueryElement>).right);
}

console.log(inspect(makeSimple(), false, 100, true));
