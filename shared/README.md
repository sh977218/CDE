# Shared Between Server(Node) and Clients(Angular)
## Not Allowed Libraries
* angular
* async
   * use `async/*`
* lodash
   * use `lodash/*`
* node
* rxjs
   * use pipe() with `rxjs/operators`
* webpack

## Other
* to access **shared** use relative paths, such as:
   * `import {} from 'shared/item';`