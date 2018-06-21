import { Component, Input } from '@angular/core';

@Component({
    selector: 'cde-comment',
    templateUrl: './comment.component.html',
    styles: [`
        .comment {
            background-color: #f5f5f5;
            direction: ltr;
            position: relative;
            width: 240px;
            border: none;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            border-radius: 2px;
            margin-bottom: 10px;
        }
        .comment-arrow-outer {
            border-top: none;
            border-bottom: 24px solid transparent;
            border-left: none;
            border-right: 24px solid #ddd;
            left: -25px;
            top: -1px;
            z-index: -1;
            height: 0;
            position: absolute;
            width: 0;
        }
        .comment-arrow-inner {
            cursor: default;
            border-top: none;
            border-bottom: 26px solid transparent;
            border-left: none;
            border-right: 26px solid #fff;
            left: -22px;
            z-index: 501;
            top: 0;
            height: 0;
            position: absolute;
            width: 0;
        }
        .currentTabComment {
            margin-left: -50px;
        }
        .rootComment {
            background-color: #f5f5f5;
            direction: ltr;
            position: relative;
            width: 240px;
            border: none;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            border-radius: 2px;
        }
        .commentBody {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            background: #fff;
            min-height: 36px;
        }
        .commentHeader {
            margin: 0 0 8px 0;
            height: 38px;
            white-space: nowrap;
        }
    `]
})
export class CommentComponent {
    @Input() comment;

}