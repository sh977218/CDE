export function chunkArray(myArray: any[], chunkSize: number) {
    let index: number;
    const arrayLength = myArray.length;
    const tempArray: any[] = [];

    for (index = 0; index < arrayLength; index += chunkSize) {
        const myChunk = myArray.slice(index, index + chunkSize);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }

    return tempArray;
}
