export class HelperObjectsService {
    static trackByKey(index: number, item: any): string {
        return item.key;
    }

    static trackByName(index: number, item: any): string {
        return item.name;
    }
}
