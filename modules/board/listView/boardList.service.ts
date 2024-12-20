import { EventEmitter, Injectable } from '@angular/core';
import { Board } from 'shared/board.model';

@Injectable({ providedIn: 'root' })
export class BoardListService {
    board!: Board;
    currentPage!: number;
    reload = new EventEmitter<void>();
    totalItems!: number;
}
