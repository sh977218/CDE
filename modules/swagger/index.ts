'use strict';
import { readFileSync } from 'fs';
import { Express } from 'express';

const config = require('config');
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const path = require('path');

// swaggerRouter configuration
const options = {
  swaggerUi: '/swagger.json',
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
const spec = readFileSync(path.join((global as any).APP_DIR, 'modules/swagger/api/swagger.yaml'), 'utf8');
const swaggerDoc = jsyaml.safeLoad(spec);
swaggerDoc.host = config.publicUrl.substr(config.publicUrl.indexOf('//') + 2);
swaggerDoc.schemes = [config.publicUrl.substr(0, config.publicUrl.indexOf('://'))];

export function init(app: Express) {
    // Initialize the Swagger middleware
    swaggerTools.initializeMiddleware(swaggerDoc, (middleware: any) => {
        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(middleware.swaggerMetadata());

        // Validate Swagger requests
        app.use(middleware.swaggerValidator());

        // Route validated requests to appropriate controller
        app.use(middleware.swaggerRouter(options));

        // Serve the Swagger documents and Swagger UI
        app.use(middleware.swaggerUi());
    });
}
