const PROXY_CONFIG = [
    {
        context: ['/server', '/nativeRender', '/api'],
        "target": "http://localhost:3001",
        "secure": false
    }
];

module.exports = PROXY_CONFIG;
