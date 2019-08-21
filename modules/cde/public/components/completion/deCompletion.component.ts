import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { DeCompletionService } from 'cde/public/components/completion/deCompletion.service';

@Component({
    selector: 'cde-de-completion',
    templateUrl: './deCompletion.component.html',
})
export class DeCompletionComponent implements OnInit {
    @Output() add: EventEmitter<any> = new EventEmitter<any>();
    adding!: boolean;

    ngOnInit() {
        this.adding = !!this.add.observers.length;
    }

    constructor(public deCompletionService: DeCompletionService) {}
}
