# Shared Between Server(Node) and Clients(Angular)
## Not Allowed Libraries
* angular
* async
   * use `async/*`
* lodash
   * use `lodash/*` (must be in cde.d.ts until the types are fixed)
* node
* rxjs
   * use pipe() with `rxjs/operators`
* webpack

## Other
* no access to **server** or **modules**
* to access **shared** use absolute paths, such as:
   * `import {} from 'shared/item';`
