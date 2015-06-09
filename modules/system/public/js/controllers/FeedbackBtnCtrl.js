angular.module('systemModule').controller('FeedbackBtnCtrl', ['$scope', function($scope) {

    var description = '<div id="feedback-welcome"><div class="h3">Report a problem</div>' +
        '<p>What is the trouble you are having?</p>' +
        '<textarea id="feedback-note-tmp"></textarea>' +
        '<br><br>' +
        '<button id="feedback-welcome-next" class="feedback-next-btn btn btn-info">Next</button><div id="feedback-welcome-error">Please enter a description.</div><div class="feedback-wizard-close"></div></div>';

    var highlighter = '<div id="feedback-highlighter"><div class="h3">Report a problem</div>' +
        '<p>Is the problem related to a specific part of the page?</p>' +
        '<p>Go ahead and highlight the area!</p>' +
        '<button class="feedback-sethighlight feedback-active"><div class="ico"></div>' +
        '<span>Highlight</span></button>' +
        '<button class="feedback-setblackout"><div class="ico"></div>' +
        '<span>Black out</span></button>' +
        '<div class="feedback-buttons"><button id="feedback-highlighter-next" class="feedback-next-btn btn btn-info">Next</button><button id="feedback-highlighter-back" class="feedback-back-btn btn btn-default">Back</button></div><div class="feedback-wizard-close"></div></div>';


        $scope.feedbackOptions = {
        html2canvasURL: "/cde/public/assets/js/html2canvas.js",
        ajaxURL:                '',
        postBrowserInfo:        true,
        postHTML:               true,
        postURL:                true,
        proxy:                  undefined,
        letterRendering:        false,
        initButtonText:         'Report a problem!',
        strokeStyle:            'black',
        shadowColor:            'black',
        shadowOffsetX:          1,
        shadowOffsetY:          1,
        shadowBlur:             10,
        lineJoin:               'bevel',
        lineWidth:              3,
        feedbackButton:         '.feedback-btn',
        showDescriptionModal:   true,
        isDraggable:            true,
        onScreenshotTaken:      function(){},
        tpl: {
            description:    description,
            highlighter: highlighter,
            overview:       '<div id="feedback-overview"><div class="feedback-logo">Feedback</div><div id="feedback-overview-description"><div id="feedback-overview-description-text"><h3>Description</h3><h3 class="feedback-additional">Additional info</h3><div id="feedback-additional-none"><span>None</span></div><div id="feedback-browser-info"><span>Browser Info</span></div><div id="feedback-page-info"><span>Page Info</span></div><div id="feedback-page-structure"><span>Page Structure</span></div></div></div><div id="feedback-overview-screenshot"><h3>Screenshot</h3></div><div class="feedback-buttons"><button id="feedback-submit" class="feedback-submit-btn feedback-btn-blue">Submit</button><button id="feedback-overview-back" class="feedback-back-btn feedback-btn-gray">Back</button></div><div id="feedback-overview-error">Please enter a description.</div><div class="feedback-wizard-close"></div></div>',
            submitSuccess:  '<div id="feedback-submit-success"><div class="feedback-logo">Feedback</div><p>Thank you for your feedback. We value every piece of feedback we receive.</p><p>We cannot respond individually to every one, but we will use your comments as we strive to improve your experience.</p><button class="feedback-close-btn feedback-btn-blue">OK</button><div class="feedback-wizard-close"></div></div>',
            submitError:    '<div id="feedback-submit-error"><div class="feedback-logo">Feedback</div><p>Sadly an error occured while sending your feedback. Please try again.</p><button class="feedback-close-btn feedback-btn-blue">OK</button><div class="feedback-wizard-close"></div></div>'
        },
        onClose:                function() {},
        screenshotStroke:       true,
        highlightElement:       true,
        initialBox:             true
    };
}]);