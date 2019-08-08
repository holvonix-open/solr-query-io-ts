# [2.0.0](https://github.com/holvonix-open/solr-query-maker/compare/v1.0.3...v2.0.0) (2019-08-08)


### 🌟🚀 Features

* define Primitive (incl. Glob and Spatial ops), Range, Literal, Clause and all operator types as `io-ts` codecs for greater type safety. ([df42e51](https://github.com/holvonix-open/solr-query-maker/commit/df42e51))
* support node 12 ([1059032](https://github.com/holvonix-open/solr-query-maker/commit/1059032))


### 💄 Polish

* update package.json to our convention; prettify everything ([1c215a6](https://github.com/holvonix-open/solr-query-maker/commit/1c215a6))


### 📖 Documentation

* add quick start example ([44f6c26](https://github.com/holvonix-open/solr-query-maker/commit/44f6c26))


### 🔧 Build / Continuous Integration

* use release-config-js ([4ed22d5](https://github.com/holvonix-open/solr-query-maker/commit/4ed22d5))


### 🧦 Miscellaneous

* **ci:** build only master branch ([f08752f](https://github.com/holvonix-open/solr-query-maker/commit/f08752f))
* no automerge ([2d60926](https://github.com/holvonix-open/solr-query-maker/commit/2d60926))


### ⚠️ BREAKING CHANGES

* `Primitive` is now always an object, with an explicit type for its enclosed value.
* `Range<T>` limited to range-able types only - namely numbers, strings, and dates and carries the type of its bounds (`valueType`).
* `Spatial` is no longer a generic type, but instead has `op` and `geom` properties inside its `value`.
* All composite query elements are now made of object Primitives and no longer include JavaScript primitives.
* `Clause` type now enforces that its child terms have a single primitive type.
* `Glob` literals only allowed for strings and dates.
* Bare `TermValue`s are no longer `Clause`s.  A new type `QueryElement` is the union of `Clause` and all `TermValue` types.

## [1.0.3](https://github.com/holvonix-open/solr-query-maker/compare/v1.0.2...v1.0.3) (2019-08-01)


### Bug Fixes

* **build:** fix broken build scripts ([3aa5fed](https://github.com/holvonix-open/solr-query-maker/commit/3aa5fed))

## [1.0.2](https://github.com/holvonix-open/solr-query-maker/compare/v1.0.1...v1.0.2) (2019-08-01)


### Bug Fixes

* return to node 10 ([b6af885](https://github.com/holvonix-open/solr-query-maker/commit/b6af885))

## [1.0.1](https://github.com/holvonix-open/solr-query-maker/compare/v1.0.0...v1.0.1) (2019-08-01)


### Bug Fixes

* permit node8,yarn1 ([28bf719](https://github.com/holvonix-open/solr-query-maker/commit/28bf719))

# [1.0.0](https://github.com/holvonix-open/solr-query-maker/compare/v0.10.0...v1.0.0) (2019-07-22)


### Features

* **1.0.0:** Promote to v1! ([e6b8bf4](https://github.com/holvonix-open/solr-query-maker/commit/e6b8bf4))


### BREAKING CHANGES

* **1.0.0:** Promote to full v1.

# [0.10.0](https://github.com/holvonix-open/solr-query-maker/compare/v0.9.1...v0.10.0) (2019-07-20)


### Features

* **ci:** semantic release ([043f485](https://github.com/holvonix-open/solr-query-maker/commit/043f485))
