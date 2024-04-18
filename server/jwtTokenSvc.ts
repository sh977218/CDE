import { config } from 'server';

const jwt = require('jsonwebtoken');

export function generateJwtToken(username: string) {
    return jwt.sign({ sub: username }, config.siteKey, { algorithm: 'HS256', expiresIn: '8h' });
}

export function validateJWToken(token: string) {
    return jwt.verify(token, config.siteKey);
}
