'use strict';

const config = require('config');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var path = require('path');

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname, '/api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);
swaggerDoc.host = config.publicUrl.substr(config.publicUrl.indexOf('//') + 2);
swaggerDoc.schemes = config.publicUrl.substr(0, config.publicUrl.indexOf('://'));

exports.init = function(app) {
    // Initialize the Swagger middleware
    swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(middleware.swaggerMetadata());

        // Validate Swagger requests
        app.use(middleware.swaggerValidator());

        // Route validated requests to appropriate controller
        app.use(middleware.swaggerRouter(options));

        // Serve the Swagger documents and Swagger UI
        app.use(middleware.swaggerUi());
    });
};

