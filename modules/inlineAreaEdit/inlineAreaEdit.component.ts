import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';

@Component({
    selector: 'cde-inline-area-edit',
    templateUrl: './inlineAreaEdit.component.html',
})
export class InlineAreaEditComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() model!: string;
    @Input() isAllowed = false;
    @Input() bypassSanitize = false;
    @Input() enableTextTruncate = true;
    @Output() modelChange = new EventEmitter<string>();
    @Input() defFormat: 'html' | '' = '';
    @Output() defFormatChange = new EventEmitter<string>();
    editMode?: boolean;
    value!: string;
    localFormat: 'html' | '' = '';

    constructor(private elementRef: ElementRef) {}

    ngOnInit(): void {
        this.value = this.model;
        this.localFormat = this.defFormat;
    }

    ngAfterViewInit() {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = 'https://cdn.ckeditor.com/4.14.1/standard-all/ckeditor.js';
        this.elementRef.nativeElement.appendChild(s);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.model) {
            this.value = this.model;
        }
    }

    confirmSave() {
        const invalidImgSrcs = this.hasInvalidImgSrc(this.value);
        if (invalidImgSrcs && invalidImgSrcs.length) {
            alert(
                'Error. Img src may only be a relative url starting with /server/system/data/:\n ' +
                    invalidImgSrcs.join('\n')
            );
            return;
        }
        this.editMode = false;
        this.defFormatChange.emit(this.localFormat);
        this.modelChange.emit(this.value);
    }

    discard() {
        this.value = this.model;
        this.localFormat = this.defFormat;
        this.editMode = false;
    }

    edit() {
        this.editMode = true;
    }

    setHtml(html: boolean) {
        this.localFormat = html ? 'html' : '';
    }

    hasInvalidImgSrc(html: string) {
        const imgRegex = /<img[^>]+src="([^">]+)"/gi;
        const srcRegex = /src="([^">]+)"/gi;
        const imgTags = html.match(imgRegex);
        if (imgTags) {
            return imgTags.reduce((previousValue: string[], imgTag) => {
                const src = imgTag.match(srcRegex);
                const invalidSrc = src?.filter(url => !url.startsWith('src="/server/system/data/')) || [];
                return [...previousValue, ...invalidSrc];
            }, []);
        }
        return false;
    }
}
