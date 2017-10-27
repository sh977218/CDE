import { Component, OnInit } from "@angular/core";
import "feedback/stable/2.0/html2canvas.js";
import "feedback/stable/2.0/feedback.js";
import "feedback/stable/2.0/feedback.min.css";

@Component({
    selector: "nih-cde",
    template: `
        <cde-navigation></cde-navigation>
        <router-outlet></router-outlet>
        <cde-alert></cde-alert>
    `
})
export class CdeAppComponent implements OnInit {
    name = "Angular 2";

    ngOnInit() {
        let initButton = '<div id="feedback-button"><button class="feedback-btn feedback-btn-gray hidden-xs">Report a problem!</button></div>';
        let description = '<div id="feedback-welcome"><div class="h3">Report a problem</div>' +
            '<p>What would you like to report?</p>' +
            '<textarea id="feedback-note-tmp"></textarea>' +
            '<br><br>' +
            '<button id="feedback-welcome-next" class="feedback-next-btn btn btn-info">Next</button><div id="feedback-welcome-error">Please enter a description.</div><div class="feedback-wizard-close"></div></div>';

        let highlighter = '<div id="feedback-highlighter"><div class="h3">Report a problem</div>' +
            '<p>Is the problem related to a specific part of the page?</p>' +
            '<p>Go ahead and highlight the area!</p>' +
            '<p>Try to draw a rectangle over the affected area. If this window stays in your way you can move it.</p>' +
            '<img src="/system/public/img/feedbackHowtoHighlight.png">' +
            '<div class="feedback-buttons"><button id="feedback-highlighter-next" class="feedback-next-btn btn btn-info">Next</button><button id="feedback-highlighter-back" class="feedback-back-btn btn btn-default">Back</button></div><div class="feedback-wizard-close"></div></div>';

        let overview = '<div id="feedback-overview"><div class="h3">Report a problem</div><div id="feedback-overview-description"><div id="feedback-overview-description-text">' +
            '<h3>Description</h3><div id="feedback-additional-none"><span>None</span></div></div></div><div id="feedback-overview-screenshot"><h3>Screenshot</h3></div>' +
            '<div class="feedback-buttons"><button id="feedback-submit" class="feedback-submit-btn btn btn-success">Submit</button>' +
            '<button id="feedback-overview-back" class="feedback-back-btn btn btn-default">Back</button></div><div id="feedback-overview-error">Please enter a description.</div><div class="feedback-wizard-close"></div></div>';

        let submitSuccess = '<div id="feedback-submit-success"><div class="h3">Thank you!</div>' +
            '<p>The issue was successfully submitted.</p>' +
            '<button class="feedback-close-btn btn btn-info">OK</button><div class="feedback-wizard-close"></div></div>';

        let submitError = '<div id="feedback-submit-error"><div class="feedback-logo">Feedback</div><p>Sadly an error occured while sending your feedback. Please try again.</p><button class="feedback-close-btn feedback-btn-blue">OK</button><div class="feedback-wizard-close"></div></div>';

        ($ as any).feedback({
            ajaxURL: '/feedback/report',
            html2canvasURL: '/static/formdata.js',
            postBrowserInfo: true,
            postHTML: false,
            postURL: true,
            proxy: undefined,
            letterRendering: false,
            initButtonText: 'Report a problem!',
            strokeStyle: 'black',
            shadowColor: 'black',
            shadowOffsetX: 1,
            shadowOffsetY: 1,
            shadowBlur: 10,
            lineJoin: 'bevel',
            lineWidth: 3,
            feedbackButton: '.feedback-btn',
            showDescriptionModal: true,
            isDraggable: true,
            onScreenshotTaken: function () {
            },
            tpl: {
                initButton: initButton,
                description: description,
                highlighter: highlighter,
                overview: overview,
                submitSuccess: submitSuccess,
                submitError: submitError
            },
            onClose: function () {
            },
            screenshotStroke: true,
            highlightElement: false,
            initialBox: true
        });
    }
}
