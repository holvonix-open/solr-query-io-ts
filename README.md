# solr-query-io-ts - Build Solr search queries, including spatial predicates

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/solr-query-io-ts.svg)](https://www.npmjs.com/package/solr-query-io-ts)
[![Build Status](https://travis-ci.com/holvonix-open/solr-query-io-ts.svg?branch=master)](https://travis-ci.com/holvonix-open/solr-query-io-ts)
[![GitHub last commit](https://img.shields.io/github/last-commit/holvonix-open/solr-query-io-ts.svg)](https://github.com/holvonix-open/solr-query-io-ts/commits)
[![codecov](https://codecov.io/gh/holvonix-open/solr-query-io-ts/branch/master/graph/badge.svg)](https://codecov.io/gh/holvonix-open/solr-query-io-ts)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=holvonix-open/solr-query-io-ts)](https://dependabot.com)
[![DeepScan grade](https://deepscan.io/api/teams/4465/projects/6803/branches/58839/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=4465&pid=6803&bid=58839)
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)
[![npm bundle size](https://img.shields.io/bundlephobia/min/solr-query-io-ts.svg)](https://bundlephobia.com/result?p=solr-query-io-ts)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Quick Start

After `yarn add solr-query-io-ts`:

```typescript
import {
  Q,
  QueryElement,
  SolrQueryFromElement,
  simple,
} from 'solr-query-io-ts';
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
    glob: ['README*', 'CHANGE*'],
  };
  // convert to a query element.  This result can be passed
  // to SolrQueryFromElement to get a string query.
  return SolrQueryFromElement.decode(
    (simple.LStringTermValueFromSimpleStrings.decode(tree) as Right<
      QueryElement
    >).right
  );
}

console.log(inspect(makeSimple(), false, 100, true));
```

## License

Read the [LICENSE](LICENSE) for details.  
The entire [NOTICE](NOTICE) file serves as the NOTICE that must be included
under Section 4d of the License.

```

# solr-query-io-ts

This product contains software originally developed by Holvonix LLC.
Original Repository: https://github.com/holvonix-open/solr-query-io-ts

Copyright (c) 2019 Holvonix LLC. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this software except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Dependencies may have their own licenses.

```
