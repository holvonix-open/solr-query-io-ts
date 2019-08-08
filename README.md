# solr-query-maker - Build Solr search queries, including spatial predicates

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/solr-query-maker.svg)](https://www.npmjs.com/package/solr-query-maker)
[![Build Status](https://travis-ci.com/holvonix-open/solr-query-maker.svg?branch=master)](https://travis-ci.com/holvonix-open/solr-query-maker)
[![GitHub last commit](https://img.shields.io/github/last-commit/holvonix-open/solr-query-maker.svg)](https://github.com/holvonix-open/solr-query-maker/commits)
[![codecov](https://codecov.io/gh/holvonix-open/solr-query-maker/branch/master/graph/badge.svg)](https://codecov.io/gh/holvonix-open/solr-query-maker)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=holvonix-open/solr-query-maker)](https://dependabot.com)
[![DeepScan grade](https://deepscan.io/api/teams/4465/projects/6353/branches/52803/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=4465&pid=6353&bid=52803)
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Quick Start

After `yarn add solr-query-maker`:

```typescript
import { Q } from 'solr-query-maker';

// Returns the value of the `q` URL parameter for searching.
function makeQuery() {
  // (geo:"Intersects(POINT(-122.17381 37.426002))" OR "spicy" OR title:He??o OR product:([100 TO *] AND (NOT 600)))
  return Q.toString(
    Q.or(
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
    )
  );
}

console.log(makeQuery());
```

## License

Read the [LICENSE](LICENSE) for details.  
The entire [NOTICE](NOTICE) file serves as the NOTICE that must be included
under Section 4d of the License.

```

# solr-query-maker

This product contains software originally developed by Holvonix LLC.
Original Repository: https://github.com/holvonix-open/solr-query-maker

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

Third-party dependencies may have their own licenses.

```
