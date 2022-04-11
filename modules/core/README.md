 # Shared Client Code
 ## Allowed Libraries
 * async
   * coded as `async`, compiler substituted to `async-es` for web
 * lodash
   * coded as `lodash`, compiler substituted to `lodash-es` for web

 ## Not Allowed Libraries
 * angular
 * node
 * rxjs
    * use pipe() with `rxjs/operators`
 * webpack

 ## Other
 * no access to **server** or **modules**
 * to access **shared** use absolute paths, such as:
    * `import {} from 'shared/item';`
