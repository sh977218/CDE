import { EventEmitter, Injectable } from '@angular/core';
import { Board } from 'shared/models.model';

@Injectable()
export class BoardListService {
    board!: Board;
    currentPage!: number;
    reload = new EventEmitter<void>();
    totalItems!: number;

    constructor() {}
}
