# Shared Between Server(Node) and Clients(Angular)
## Library Requirements
* async
  * coded as `async`, compiler substituted to `async-es` for web
* lodash
  * coded as `lodash`, compiler substituted to `lodash-es` for web
* rxjs
   * import from 'rxjs' directly
   * use pipe() with `rxjs/operators`

## Not Allowed Libraries
* angular
* node
* webpack

## Other
* no access to **server** or **modules**
* to access **shared** use absolute paths, such as:
   * `import {} from 'shared/item';`
