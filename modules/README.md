# Clients(Angular)
## Allowed Libraries
* angular
   * to remove `@angular/common/http` and `Observables` in favor of `fetch()`
* async
  * coded as `async`, compiler substituted to `async-es` for web
* lodash
  * coded as `lodash`, compiler substituted to `lodash-es` for web

## Not Allowed Libraries
* node
* rxjs
   * use pipe() with `rxjs/operators`
* webpack

## Other
* no access to **server**
* to access **shared** use absolute paths, such as:
   * `import {} from 'shared/item';`
