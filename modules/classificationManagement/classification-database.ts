import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClassificationNode } from 'classificationManagement/classification-node';

@Injectable({ providedIn: 'root' })
export class ClassificationDatabase {
    dataChange = new BehaviorSubject<ClassificationNode[]>([]);

    get data(): ClassificationNode[] {
        return this.dataChange.value;
    }

    initialize(TREE_DATA: any) {
        // Build the tree nodes from Json object. The result is a list of `ClassificationNode` with nested
        // file node as children.
        const data = this.buildFileTree(TREE_DATA);

        // Notify the change.
        this.dataChange.next(data);
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `ClassificationNode`.
     */
    buildFileTree(data: ClassificationNode[]): ClassificationNode[] {
        return data;
    }

    /** Add an item to to-do list */
    insertItem(parent: ClassificationNode, name: string) {
        if (parent.elements) {
            parent.elements.push({ name, elements: [] } as ClassificationNode);
            this.dataChange.next(this.data);
        }
    }

    updateItem(node: ClassificationNode | undefined, name: string) {
        if (node) {
            node.name = name;
            this.dataChange.next(this.data);
        }
    }

    deleteItem(parent: ClassificationNode, name: string) {
        if (parent.elements) {
            parent.elements = parent.elements.filter(e => e.name !== name);
            this.dataChange.next(this.data);
        }
    }
}
