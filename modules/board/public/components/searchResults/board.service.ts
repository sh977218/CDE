import { EventEmitter, Injectable } from "@angular/core";

@Injectable()
export class BoardService {
    board: any;
    currentPage: number;
    reload: EventEmitter<any> = new EventEmitter();
    totalItems: number;

    constructor() {}
}