import { Component, Input } from '@angular/core';

@Component({
    selector: 'cde-comment',
    templateUrl: './comment.component.html',
    styles: [`
        .commentDiv {
            background-color: #f5f5f5;
            direction: ltr;
            position: relative;
            width: 240px;
            border: none;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            border-radius: 2px;
            margin-bottom: 10px;
        }
        .rootComment {
            padding: 8px;
            background-color: #f5f5f5;
            direction: ltr;
            position: relative;
            width: 240px;
            border: none;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            border-radius: 2px;
        }
        .commentHeader {
            margin: 0 0 8px 0;
            white-space: nowrap;
        }
        .commentBody {
            border-bottom: 1px solid #ddd;
            background: #fff;
            min-height: 36px;
        }
    `]
})
export class CommentComponent {
    @Input() comment;

}