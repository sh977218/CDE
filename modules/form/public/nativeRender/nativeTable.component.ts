import { Component, Input, OnInit } from "@angular/core";
import { NativeRenderService } from "./nativeRender.service";

@Component({
    selector: "cde-native-table",
    templateUrl: "./nativeTable.component.html"
})
export class NativeTableComponent implements OnInit {
    @Input() formElement: any;

    firstQuestion: any;
    sectionNumber: number;
    tableForm: any = {
        s: [{q: [{cspan: 1}]}],
        q: [{type: "label", style: {}}]
    };
    entry: any;
    rowNameCounter: number = 0;

    constructor(public nativeRenderService: NativeRenderService) {
    }

    ngOnInit() {
        this.render();
    }

    render() {
        this.entry = this.tableForm.s[0].q[0];
        this.getRows();
        this.sectionNumber = 0;
        let ret = this.renderSection(this.formElement, 0, "");
        this.setDepth(ret.r + 1);

        this.entry.cspan = 1;
        this.entry.rspan = ret.r + 1;
        this.entry.style = {backgroundColor: "#ddd"};
        this.tableForm.q[0].style = {backgroundColor: "#f2f2f2"};
    }

    getRows() {
        this.tableForm.rows = [];
        if (!this.formElement.repeat)
            throw "Not a table";
        if (this.formElement.repeat[0] === "F") {
            this.firstQuestion = NativeRenderService.getFirstQuestion(this.formElement);
            this.firstQuestion.question.answers.forEach(a => {
                this.tableForm.rows.push({label: this.nativeRenderService.getPvLabel(a)});
            });

            this.entry.label = this.firstQuestion.label;
        } else {
            let maxValue = parseInt(this.formElement.repeat);
            let format = "#.";
            if (this.nativeRenderService.profile)
                format = this.nativeRenderService.profile.repeatFormat;
            if (!format)
                format = "";
            for (let i = 0; i < maxValue; i++) {
                this.tableForm.rows.push({label: format.replace(/\#/, (i + 1).toString())});
            }
        }
    }

    renderSection(s, level, sectionName, r = 1, c = 0) {
        let sectionStyle = this.getSectionStyle(this.sectionNumber++);
        let section = {header: true, cspan: c, label: s.label, style: sectionStyle.sectionStyle};
        if (level === 0)
            section.label = "";
        this.tableForm.s[level].q.push(section);
        let tcontent = this.getSectionLevel(level + 1);
        let retr = 0;
        s.formElements && s.formElements.forEach(f =>  {
            let ret = this.renderFormElement(f, tcontent, level, retr, r, c, sectionStyle, sectionName);
            retr = ret.retr;
            c = ret.c;
        });
        r += retr;
        section.cspan = c;
        return {r: r, c: c};
    }
    renderFormElement(f, tcontent, level, retr, r, c, sectionStyle, sectionName) {
        if (f.elementType === "section" || f.elementType === "form") {
            if (!f.repeat) {
                let ret = this.renderSection(f, level + 1, sectionName);
                c += ret.c;
                retr = Math.max(retr, ret.r);
            } else if (f.repeat[0] === "F") {
                NativeRenderService.getFirstQuestion(f).question.answers.forEach((a, i) => {
                    let ret = this.renderSection(f, level + 1, sectionName + i + "-");
                    c += ret.c;
                    retr = Math.max(retr, ret.r);
                });
            } else {
                let maxValue = parseInt(f.repeat);
                for (let i = 0; i < maxValue; i++) {
                    let ret = this.renderSection(f, level + 1, sectionName + i + "-");
                    c += ret.c;
                    retr = Math.max(retr, ret.r);
                }
            }
        }
        else if (f.elementType === "question" && f !== this.firstQuestion) {
            c++;
            tcontent.q.push({rspan: r, label: f.label, style: sectionStyle.questionStyle});
            this.tableForm.q.push({
                type: NativeTableComponent.getQuestionType(f),
                name: "-" + sectionName + f.questionId,
                question: f.question,
                style: sectionStyle.answerStyle
            });
            this.tableForm.rows.forEach((r, i) => {
                if (f.question.uoms && f.question.uoms.length === 1)
                    this.nativeRenderService.elt.formInput[i + "-" + sectionName + f.questionId + "_uom"] = f.question.uoms[0];
            });
            f.question.answers.forEach(a => {
                a.subQuestions && a.subQuestions.forEach(sf => {
                    let ret = this.renderFormElement(sf, tcontent, level, retr, r, c, sectionStyle, sectionName);
                    retr = ret.retr;
                    c = ret.c;
                });
            });
        }
        return {retr: retr, c: c};
    }
    setDepth(r) {
        this.tableForm.s.forEach((s, level) => {
            s.q.forEach(q => {
                if (!q.header)
                    q.rspan = r - level;
            });
        });
    }
    getSectionLevel(level) {
        if (this.tableForm.s.length <= level)
            this.tableForm.s[level] = {q: []};
        return this.tableForm.s[level];
    }

    theme: Array<any> = [
        {
            sectionStyle: {backgroundColor: "#d7f3da"},
            questionStyle: {backgroundColor: "#d7f3da"},
            answerStyle: {backgroundColor: "#f6fff9"}
        },
        {
            sectionStyle: {backgroundColor: "#dad7f3"},
            questionStyle: {backgroundColor: "#dad7f3"},
            answerStyle: {backgroundColor: "#f9f6ff"}
        },
        {
            sectionStyle: {backgroundColor: "#f3dad7"},
            questionStyle: {backgroundColor: "#f3dad7"},
            answerStyle: {backgroundColor: "#fff9f6"}
        },
        {
            sectionStyle: {backgroundColor: "#f1f3d8"},
            questionStyle: {backgroundColor: "#f1f3d8"},
            answerStyle: {backgroundColor: "#fcfff5"}
        },
        {
            sectionStyle: {backgroundColor: "#d8f1f3"},
            questionStyle: {backgroundColor: "#d8f1f3"},
            answerStyle: {backgroundColor: "#f5fcff"}
        },
        {
            sectionStyle: {backgroundColor: "#f3d8f1"},
            questionStyle: {backgroundColor: "#f3d8f1"},
            answerStyle: {backgroundColor: "#fff5fc"}
        },
    ];
    getSectionStyle(i) {
        return this.theme[i % this.theme.length];
    }

    static getQuestionType(fe) {
        switch (fe.question.datatype) {
            case "Value List":
                if (fe.question.multiselect)
                    return "mlist";
                else
                    return "list";
            case "Date":
                return "date";
            case "Number":
                return "number";
            default:
                return "text";
        }
    }
}