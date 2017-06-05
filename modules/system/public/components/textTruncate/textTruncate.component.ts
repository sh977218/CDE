import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: "cde-text-truncate",
    templateUrl: "./textTruncate.component.html",
    styles: [`
        .collapseText {
            display: block;
            overflow: hidden;
            max-height: 165px;
            box-shadow: 0 9px 7px -5px #969696;
        }

        .expandText {
            overflow: hidden;
            display: inline-block;
        }
    `]
})

export class TextTruncateComponent implements OnInit {

    @Input() text: string;
    @Input() textType: string = "plainText";
    @Input() threshold: number = 500;
    @Input() customMoreLabel: string;
    @Input() customLessLabel: string;

    open: boolean;
    _class: string = "collapseText";

    toggleShow () {
        this.open = this.open;
        // $element.empty();
        this._class = (this._class === "collapseText") ? "expandText" : "collapseText";
        // var THRESHOLD = parseInt($scope.threshold);
        // Truncation.applyTruncation(THRESHOLD, $scope, $element);
        // if ($scope.textType === 'plainText')
        //     $($element.find('span')[0]).text($scope.text); //jshint ignore:line
    }

    ngOnInit () {
        //     $($element.find('span')[0]).text($scope.text); //jshint ignore:line
    }


}