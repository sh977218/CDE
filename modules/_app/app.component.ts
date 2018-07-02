import { Component, OnInit } from '@angular/core';
import 'feedback/stable/2.0/html2canvas.js';
import 'feedback/stable/2.0/feedback.js';
import 'feedback/stable/2.0/feedback.min.css';
import _noop from 'lodash/noop';

import { BackForwardService } from '_app/backForward.service';
import { UserService } from '_app/user.service';
import { PushNotificationSubscriptionService } from '_app/pushNotificationSubscriptionService';

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

    constructor(backForwardService: BackForwardService, private userService: UserService) {}
}
