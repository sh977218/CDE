import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { DeCompletionService } from 'cde/completion/deCompletion.service';
import { MatIconModule } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';
import { PinToBoardModule } from 'board/pin-to-board.module';

@Component({
    selector: 'cde-de-completion',
    templateUrl: './deCompletion.component.html',
    imports: [MatIconModule, NgIf, PinToBoardModule, NgForOf],
    standalone: true,
})
export class DeCompletionComponent implements OnInit {
    @Output() add: EventEmitter<any> = new EventEmitter<any>();
    adding!: boolean;

    ngOnInit() {
        this.adding = !!this.add.observers.length;
    }

    constructor(public deCompletionService: DeCompletionService) {}
}
