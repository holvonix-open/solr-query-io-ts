## [3.0.2](https://github.com/holvonix-open/solr-query-io-ts/compare/v3.0.1...v3.0.2) (2019-08-10)


### 📖 Documentation

* update deepscan badge ([75520db](https://github.com/holvonix-open/solr-query-io-ts/commit/75520db))


### 🧦 Miscellaneous

* **deps-dev:** bump @holvonix-open/release-config-js ([#20](https://github.com/holvonix-open/solr-query-io-ts/issues/20)) ([448314e](https://github.com/holvonix-open/solr-query-io-ts/commit/448314e))
* **deps-dev:** bump io-ts-fuzzer from 4.1.1 to 4.1.3 ([#22](https://github.com/holvonix-open/solr-query-io-ts/issues/22)) ([6c83971](https://github.com/holvonix-open/solr-query-io-ts/commit/6c83971))

## [3.0.1](https://github.com/holvonix-open/solr-query-io-ts/compare/v3.0.0...v3.0.1) (2019-08-10)


### 📖 Documentation

* add min size badge [skip-release] ([14e4a8f](https://github.com/holvonix-open/solr-query-io-ts/commit/14e4a8f))
* clarify license ([3f57cfc](https://github.com/holvonix-open/solr-query-io-ts/commit/3f57cfc))

# [3.0.0](https://github.com/holvonix-open/solr-query-io-ts/compare/v2.0.1...v3.0.0) (2019-08-10)


### 🌟🚀 Features

* introduce SolrQueryFromElement which generates a Solr query string from QueryElements, with input validation ([ca1ef0e](https://github.com/holvonix-open/solr-query-io-ts/commit/ca1ef0e))


### 🐛 Bug Fixes

* migrate to wkt-io-ts which will validate the geojson and WKT ([023db16](https://github.com/holvonix-open/solr-query-io-ts/commit/023db16))
* upgrade deps ([4904890](https://github.com/holvonix-open/solr-query-io-ts/commit/4904890))


### 💄 Polish

* rename to solr-query-io-ts ([f590ac5](https://github.com/holvonix-open/solr-query-io-ts/commit/f590ac5))


### ⚠️ BREAKING CHANGES

* move package to solr-query-io-ts from solr-query-maker
* `Q.toString` has been removed and replaced with `SolrQueryFromElement.decode` which validates its input
* @holvonix-open/geojson-io-ts v5+ requires 2-dimensional positions and non-empty arrays

## [2.0.1](https://github.com/holvonix-open/solr-query-io-ts/compare/v2.0.0...v2.0.1) (2019-08-10)


### 🐛 Bug Fixes

* **deps:** bump fp-ts and various dev-deps ([e259b6d](https://github.com/holvonix-open/solr-query-io-ts/commit/e259b6d))


### 🧦 Miscellaneous

* this is a library, prod deps are chores by default ([552d48c](https://github.com/holvonix-open/solr-query-io-ts/commit/552d48c))

# [2.0.0](https://github.com/holvonix-open/solr-query-io-ts/compare/v1.0.3...v2.0.0) (2019-08-08)


### 🌟🚀 Features

* define Primitive (incl. Glob and Spatial ops), Range, Literal, Clause and all operator types as `io-ts` codecs for greater type safety. ([df42e51](https://github.com/holvonix-open/solr-query-io-ts/commit/df42e51))
* support node 12 ([1059032](https://github.com/holvonix-open/solr-query-io-ts/commit/1059032))


### 💄 Polish

* update package.json to our convention; prettify everything ([1c215a6](https://github.com/holvonix-open/solr-query-io-ts/commit/1c215a6))


### 📖 Documentation

* add quick start example ([44f6c26](https://github.com/holvonix-open/solr-query-io-ts/commit/44f6c26))


### 🔧 Build / Continuous Integration

* use release-config-js ([4ed22d5](https://github.com/holvonix-open/solr-query-io-ts/commit/4ed22d5))


### 🧦 Miscellaneous

* **ci:** build only master branch ([f08752f](https://github.com/holvonix-open/solr-query-io-ts/commit/f08752f))
* no automerge ([2d60926](https://github.com/holvonix-open/solr-query-io-ts/commit/2d60926))


### ⚠️ BREAKING CHANGES

* `Primitive` is now always an object, with an explicit type for its enclosed value.
* `Range<T>` limited to range-able types only - namely numbers, strings, and dates and carries the type of its bounds (`valueType`).
* `Spatial` is no longer a generic type, but instead has `op` and `geom` properties inside its `value`.
* All composite query elements are now made of object Primitives and no longer include JavaScript primitives.
* `Clause` type now enforces that its child terms have a single primitive type.
* `Glob` literals only allowed for strings and dates.
* Bare `TermValue`s are no longer `Clause`s.  A new type `QueryElement` is the union of `Clause` and all `TermValue` types.

## [1.0.3](https://github.com/holvonix-open/solr-query-io-ts/compare/v1.0.2...v1.0.3) (2019-08-01)


### Bug Fixes

* **build:** fix broken build scripts ([3aa5fed](https://github.com/holvonix-open/solr-query-io-ts/commit/3aa5fed))

## [1.0.2](https://github.com/holvonix-open/solr-query-io-ts/compare/v1.0.1...v1.0.2) (2019-08-01)


### Bug Fixes

* return to node 10 ([b6af885](https://github.com/holvonix-open/solr-query-io-ts/commit/b6af885))

## [1.0.1](https://github.com/holvonix-open/solr-query-io-ts/compare/v1.0.0...v1.0.1) (2019-08-01)


### Bug Fixes

* permit node8,yarn1 ([28bf719](https://github.com/holvonix-open/solr-query-io-ts/commit/28bf719))

# [1.0.0](https://github.com/holvonix-open/solr-query-io-ts/compare/v0.10.0...v1.0.0) (2019-07-22)


### Features

* **1.0.0:** Promote to v1! ([e6b8bf4](https://github.com/holvonix-open/solr-query-io-ts/commit/e6b8bf4))


### BREAKING CHANGES

* **1.0.0:** Promote to full v1.

# [0.10.0](https://github.com/holvonix-open/solr-query-io-ts/compare/v0.9.1...v0.10.0) (2019-07-20)


### Features

* **ci:** semantic release ([043f485](https://github.com/holvonix-open/solr-query-io-ts/commit/043f485))
