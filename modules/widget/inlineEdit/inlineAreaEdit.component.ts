import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import _cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'cde-inline-area-edit',
    templateUrl: './inlineAreaEdit.component.html',
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
    @Input() model!: string;
    @Input() inputType = 'text';
    @Input() isAllowed = false;
    @Output() modelChange = new EventEmitter<string>();
    @Input() defFormat = '';
    @Output() defFormatChange = new EventEmitter<string>();
    editMode?: boolean;
    value!: string;
    localFormat?: string;

    constructor(private elementRef: ElementRef) {}

    ngOnInit(): void {
        this.value = _cloneDeep(this.model);
        this.localFormat = _cloneDeep(this.defFormat);
    }

    ngAfterViewInit() {
        let s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = 'https://cdn.ckeditor.com/4.7.0/standard-all/ckeditor.js';
        this.elementRef.nativeElement.appendChild(s);
    }

    confirmSave() {
        if (InlineAreaEditComponent.isInvalidHtml(this.value)) {
            alert('Error. Img src may only be a relative url starting with /data');
        } else {
            this.editMode = false;
            this.defFormatChange.emit(this.localFormat);
            this.modelChange.emit(this.value);
        }
    }

    discard() {
        this.value = _cloneDeep(this.model);
        this.localFormat = _cloneDeep(this.defFormat);
        this.editMode = false;
    }

    edit() {
        this.editMode = true;
    }

    static isInvalidHtml(html: string) {
        let srcs = html.match(/src\s*=\s*["'](.+?)["']/ig);
        if (srcs) {
            for (let i = 0; i < srcs.length; i++) {
                let src = srcs[i];
                let urls = src.match(/\s*["'](.+?)["']/ig);
                if (urls) {
                    for (let j = 0; j < urls.length; j++) {
                        let url = urls[j].replace(/["]/g, "").replace(/[']/g, "");
                        if (url.indexOf('/data/') !== 0 && url.indexOf((window as any).publicUrl + '/data/') !== 0) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    setHtml(html: boolean) {
        this.localFormat = html ? 'html' : '';
    }
}
