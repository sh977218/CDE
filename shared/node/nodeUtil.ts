export function toBase64(input: string): string {
    return Buffer.from(input).toString('base64');
}
