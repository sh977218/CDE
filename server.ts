// ./src/server.ts
// Polyfills
import 'angular2-universal-polyfills';
import 'ts-helpers';

// Node modules
import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';

// Angular
import { enableProdMode } from '@angular/core';
import { createEngine } from 'angular2-express-engine';

import { MainModule } from './node.module';

enableProdMode();

const app = express();
const ROOT = path.join(path.resolve(__dirname, '..'));
const PORT = process.env.PORT || 3000;

// Express views
app.engine('.html', createEngine({
    precompile: true,
    ngModule: MainModule
}));
app.set('views', path.join(ROOT, 'dist/client'));
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(helmet());

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'assets'), {maxAge: 30}));
app.use(express.static(path.join(ROOT, 'dist/client'), {index: false}));

// Routes with html5pushstate
app.get('*', (req, res) => res.render('index', {req, res}));

// Server
app.listen(PORT, () => {
    console.log(`Listening on: http://localhost`);
});