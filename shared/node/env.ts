export function getEnvironmentHost(config: any, host: string): string | undefined {
    switch (config.publicUrl) {
        case config.urlProd:
            if (!host) {
                return undefined;
            }
            if (host.startsWith(removeProtocol(config.urlProd))) {
                return 'blue';
            }
            if (host.startsWith(removeProtocol(config.urlProdGreen))) {
                return 'green';
            }
            return;
        case config.urlQa:
            if (!host) {
                return undefined;
            }
            if (host.startsWith(removeProtocol(config.urlQa))) {
                return 'qa-blue';
            }
            if (host.startsWith(removeProtocol(config.urlQaGreen))) {
                return 'qa-green';
            }
            return;
        default:
            return 'dev';
    }
}

function removeProtocol(url: string): string {
    return url.substr(url.indexOf('//') + 2);
}
