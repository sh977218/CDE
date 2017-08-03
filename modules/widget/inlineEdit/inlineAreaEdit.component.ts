import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output } from "@angular/core";

import * as _ from "lodash";

@Component({
    selector: "cde-inline-area-edit",
    templateUrl: "./inlineAreaEdit.component.html",
    styles: [`
        button {
            display: inline-block;
            margin-bottom: 0;
            font-weight: normal;
            text-align: center;
            vertical-align: middle;
            cursor: pointer;
            border: 1px solid #cccccc;
            white-space: nowrap;
            color: #333333;
            background-color: #ffffff;
            padding: 5px 10px;
            font-size: 12px;
            line-height: 1.5;
            border-radius: 3px;
        }
    `]
})
export class InlineAreaEditComponent implements OnInit, AfterViewInit {
    @Input() model;
    @Input() inputType: string = "text";
    @Input() isAllowed: boolean = false;
    @Input() defFormat: String = "";
    @Output() modelChange = new EventEmitter<string>();
    @Output() defFormatChange = new EventEmitter<string>();
    @Output() save = new EventEmitter<string>();

    public editMode: boolean;
    public value: string;
    public localFormat: string;

    constructor(private elementRef: ElementRef) {
    };

    ngOnInit(): void {
        this.value = _.cloneDeep(this.model);
        this.localFormat = _.cloneDeep(this.defFormat);
    }

    ngAfterViewInit() {
        let s = document.createElement("script");
        s.type = "text/javascript";
        s.src = "https://cdn.ckeditor.com/4.7.0/standard-all/ckeditor.js";
        this.elementRef.nativeElement.appendChild(s);
    }

    setHtml(html) {
        this.localFormat = html ? 'html' : '';
    }

    edit() {
        this.editMode = true;
    }

    discard() {
        this.value = _.cloneDeep(this.model);
        this.localFormat = _.cloneDeep(this.defFormat);
        this.editMode = false;
    }

    static isInvalidHtml(html) {
        let srcs = html.match(/src\s*=\s*["'](.+?)["']/ig);
        if (srcs) {
            for (let i = 0; i < srcs.length; i++) {
                let src = srcs[i];
                let urls = src.match(/\s*["'](.+?)["']/ig);
                if (urls) {
                    for (let j = 0; j < urls.length; j++) {
                        let url = urls[j].replace(/["]/g, "").replace(/[']/g, "");
                        if (url.indexOf("/data/") !== 0 && url.indexOf((window as any).publicUrl + "/data/") !== 0) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    confirmSave() {
        if (InlineAreaEditComponent.isInvalidHtml(this.value)) {
            alert('Error. Img src may only be a relative url starting with /data');
        } else {
            this.editMode = false;
            this.defFormat = this.localFormat;
            this.modelChange.emit(this.value);
            this.defFormatChange.emit(this.localFormat);
            this.save.emit();
        }
    }

}