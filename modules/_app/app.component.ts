import { Component, OnInit } from '@angular/core';
import 'feedback/stable/2.0/html2canvas.js';
import 'feedback/stable/2.0/feedback.js';
import 'feedback/stable/2.0/feedback.min.css';
import _noop from 'lodash/noop';

import { BackForwardService } from '_app/backForward.service';
import { UserService } from '_app/user.service';
import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'nih-cde',
    template: `
        <cde-navigation></cde-navigation>
    `
})
export class CdeAppComponent implements OnInit {
    name = "Angular 6";

    ngOnInit() {
        let description = '<div id="feedback-welcome"><div class="h3">Report a problem</div>' +
            '<p>What would you like to report?</p>' +
            '<textarea id="feedback-note-tmp"></textarea>' +
            '<br><br>' +
            '<button id="feedback-welcome-next" class="feedback-next-btn  btn btn-outline-dark">Next</button><div id="feedback-welcome-error">Please enter a description.</div><div class="feedback-wizard-close"></div></div>';

        let highlighter = '<div id="feedback-highlighter"><div class="h3">Report a problem</div>' +
            '<p>Is the problem related to a specific part of the page?</p>' +
            '<p>Go ahead and highlight the area!</p>' +
            '<p>Try to draw a rectangle over the affected area. If this window stays in your way you can move it.</p>' +
            '<img src="/system/public/img/feedbackHowtoHighlight.png">' +
            '<div class="feedback-buttons"><button id="feedback-highlighter-next" class="feedback-next-btn  btn btn-outline-dark">Next</button><button id="feedback-highlighter-back" class="feedback-back-btn  btn btn-outline-dark">Back</button></div><div class="feedback-wizard-close"></div></div>';

        let overview = '<div id="feedback-overview"><div class="h3">Report a problem</div><div id="feedback-overview-description"><div id="feedback-overview-description-text">' +
            '<h3>Description</h3><div id="feedback-additional-none"><span>None</span></div></div></div><div id="feedback-overview-screenshot"><h3>Screenshot</h3></div>' +
            '<div class="feedback-buttons"><button id="feedback-submit" class="feedback-submit-btn  btn  btn-success">Submit</button>' +
            '<button id="feedback-overview-back" class="feedback-back-btn  btn btn-outline-dark">Back</button></div><div id="feedback-overview-error">Please enter a description.</div><div class="feedback-wizard-close"></div></div>';

        let submitSuccess = '<div id="feedback-submit-success"><div class="h3">Thank you!</div>' +
            '<p>The issue was successfully submitted.</p>' +
            '<button class="feedback-close-btn  btn btn-outline-dark">OK</button><div class="feedback-wizard-close"></div></div>';

        let submitError = '<div id="feedback-submit-error"><div class="feedback-logo">Feedback</div><p>Sadly an error occured while sending your feedback. Please try again.</p><button class="feedback-close-btn  feedback-btn-blue">OK</button><div class="feedback-wizard-close"></div></div>';

        ($ as any).feedback({
            ajaxURL: '/server/log/feedback/report',
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
            onScreenshotTaken: function () {},
            tpl: {
                description: description,
                highlighter: highlighter,
                overview: overview,
                submitSuccess: submitSuccess,
                submitError: submitError
            },
            onClose: function () {},
            screenshotStroke: true,
            highlightElement: false,
            initialBox: true
        });

        window.addEventListener('load', () => {
            if ((window.location.protocol === 'https:' || window.location.hostname === 'localhost') && 'serviceWorker' in navigator) {
                this.userService.then(user => {
                    PushNotificationSubscriptionService.updateExisting(user._id);
                }, _noop);
            }
        });
    }

    constructor(backForwardService: BackForwardService,
                private userService: UserService,
                iconReg: MatIconRegistry,
                sanitizer: DomSanitizer) {

        iconReg.addSvgIconLiteral("thumb_tack", sanitizer.bypassSecurityTrustHtml("<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
            "\t viewBox=\"0 0 96 96\" style='enable-background:new 0 0 96 96; vertical-align: baseline' xml:space=\"preserve\">\n" +
            "<style type=\"text/css\">.st0{fill:#333333;}</style>" +
            "<g id=\"XMLID_2_\">" +
            "<path id=\"XMLID_6_\" class=\"st0\" d=\"M44.5,44.5V28.4c0-0.3-0.1-0.6-0.3-0.8s-0.5-0.3-0.8-0.3c-0.3,0-0.6,0.1-0.8,0.3\n" +
            "c-0.2,0.2-0.3,0.5-0.3,0.8v16.2c0,0.3,0.1,0.6,0.3,0.8c0.2,0.2,0.5,0.3,0.8,0.3c0.3,0,0.6-0.1,0.8-0.3\n" +
            "C44.4,45.2,44.5,44.9,44.5,44.5z M68.8,57.2c0,0.6-0.2,1.2-0.7,1.6c-0.5,0.5-1,0.7-1.6,0.7H51L49.2,77c0,0.3-0.2,0.5-0.4,0.7\n" +
            "C48.6,77.9,48.3,78,48,78h0c-0.6,0-1-0.3-1.2-1l-2.7-17.5H29.5c-0.6,0-1.2-0.2-1.6-0.7c-0.5-0.5-0.7-1-0.7-1.6c0-3,0.9-5.6,2.8-8\n" +
            "c1.9-2.4,4-3.6,6.4-3.6V27.2c-1.3,0-2.3-0.5-3.2-1.4s-1.4-2-1.4-3.2c0-1.3,0.5-2.3,1.4-3.2c0.9-0.9,2-1.4,3.2-1.4h23.1\n" +
            "c1.3,0,2.3,0.5,3.2,1.4c0.9,0.9,1.4,2,1.4,3.2c0,1.3-0.5,2.3-1.4,3.2s-2,1.4-3.2,1.4v18.5c2.4,0,4.5,1.2,6.4,3.6\n" +
            "C67.8,51.6,68.8,54.3,68.8,57.2z\"/></g></svg>"));

    }
}
