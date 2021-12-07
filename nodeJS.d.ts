declare namespace NodeJS {
    interface Global {
        APP_DIR: string;
        assetDir: (...args: string[]) => string;
    }
}
