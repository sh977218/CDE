export function nextTick(): Promise<void> {
    return new Promise(resolve => {
        process.nextTick(() => {
            resolve();
        });
    });
}

export function toBase64(input: string): string {
    return Buffer.from(input).toString('base64');
}
