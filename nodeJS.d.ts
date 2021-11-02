declare namespace NodeJS {
    interface Global {
        APP_DIR: string;
        appDir: (...args: string[]) => string;
    }
}
