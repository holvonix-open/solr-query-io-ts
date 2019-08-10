import { Q, SolrQueryFromElement } from 'solr-query-io-ts';

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
  return SolrQueryFromElement.decode(tree);
}

console.log(makeQuery());