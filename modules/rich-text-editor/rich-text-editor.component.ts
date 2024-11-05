import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeEvent, CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {
    ClassicEditor,
    AccessibilityHelp,
    Autoformat,
    AutoLink,
    Autosave,
    BalloonToolbar,
    BlockToolbar,
    Bold,
    Essentials,
    FindAndReplace,
    Heading,
    Italic,
    Link,
    Image,
    ImageInsertViaUrl,
    ImageResize,
    ImageEditing,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    Paragraph,
    SelectAll,
    ShowBlocks,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextPartLanguage,
    TextTransformation,
    Title,
    Undo,
    EditorConfig,
} from 'ckeditor5';

@Component({
    selector: 'cde-rich-text-editor',
    templateUrl: './rich-text-editor.component.html',
    styleUrls: ['./rich-text-editor.component.scss'],
    imports: [CKEditorModule, FormsModule],
    standalone: true,
})
export class RichTextEditorComponent {
    _value = '';
    @Input() set value(v: string) {
        this._value = v || '';
    }

    @Output() valueChanged = new EventEmitter<string>();

    public Editor = ClassicEditor;

    public config: EditorConfig = {
        toolbar: {
            items: [
                'undo',
                'redo',
                '|',
                'showBlocks',
                'findAndReplace',
                'selectAll',
                '|',
                'heading',
                '|',
                'bold',
                'italic',
                '|',
                'link',
                'insertImage',
                'insertTable',
                '|',
                'accessibilityHelp',
            ],
        },
        plugins: [
            AccessibilityHelp,
            Autoformat,
            AutoLink,
            Autosave,
            BalloonToolbar,
            BlockToolbar,
            Bold,
            Essentials,
            FindAndReplace,
            Heading,
            Italic,
            Link,
            Image,
            ImageInsertViaUrl,
            ImageResize,
            ImageEditing,
            ImageCaption,
            ImageStyle,
            ImageToolbar,
            Paragraph,
            SelectAll,
            ShowBlocks,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            TextPartLanguage,
            TextTransformation,
            Title,
            Undo,
        ],
        balloonToolbar: ['bold', 'italic', '|', 'link'],
        blockToolbar: ['bold', 'italic', '|', 'link', 'insertTable'],
        heading: {
            options: [
                {
                    model: 'paragraph',
                    title: 'Paragraph',
                    class: 'ck-heading_paragraph',
                },
                {
                    model: 'heading1',
                    view: 'h1',
                    title: 'Heading 1',
                    class: 'ck-heading_heading1',
                },
                {
                    model: 'heading2',
                    view: 'h2',
                    title: 'Heading 2',
                    class: 'ck-heading_heading2',
                },
                {
                    model: 'heading3',
                    view: 'h3',
                    title: 'Heading 3',
                    class: 'ck-heading_heading3',
                },
                {
                    model: 'heading4',
                    view: 'h4',
                    title: 'Heading 4',
                    class: 'ck-heading_heading4',
                },
                {
                    model: 'heading5',
                    view: 'h5',
                    title: 'Heading 5',
                    class: 'ck-heading_heading5',
                },
                {
                    model: 'heading6',
                    view: 'h6',
                    title: 'Heading 6',
                    class: 'ck-heading_heading6',
                },
            ],
        },
        link: {
            addTargetToExternalLinks: false,
            defaultProtocol: 'https://',
            decorators: {
                toggleDownloadable: {
                    mode: 'manual',
                    label: 'Downloadable',
                    attributes: {
                        download: 'file',
                    },
                },
            },
        },
        image: {
            toolbar: [
                'imageStyle:alignLeft',
                'imageStyle:alignRight',
                'imageStyle:alignCenter',
                'imageStyle:side',
                '|',
                'imageTextAlternative',
            ],
        },
        menuBar: {
            isVisible: true,
        },
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
        },
    };

    public onChange({ editor }: ChangeEvent) {
        const data = editor.getData();
        this.valueChanged.emit(data);
    }
}
