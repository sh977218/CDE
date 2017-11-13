import { AfterViewChecked, Component } from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { TourService } from 'home/tour.service';
import { FormService } from 'nativeRender/form.service';

@Component({
    selector: 'cde-home',
    styles: [`
        .bordered-tab {
            background-color: #fff;
            border: 1px solid;
            border-color: #fff #ddd #ddd;
            border-radius: 0 0 4px 4px;
            min-height: 300px;
        }
        .featuredHeading {
            font-size: large;
            padding: 5px;
        }
        .sectionPage {
            /*min-height: 100vh;*/
        }
        .slideContent {
            display: block;
            margin: auto;
            height: 500px;
            max-height: 50vh;
        }
        .contentStartedFrom::before {
            content: 'Ready to get started?';
        }
        .morePages {
            border-left: 2px dashed #0275d8;
            bottom: -150px;
            height: 300px;
            left: 50%;
            margin-left: -1px;
            position: absolute;
            text-align: center;
            width: 2px;
        }
        .morePagesXsUnder {
            bottom: -300px;
            height: 600px;
            z-index: -1;
        }
        @media (min-width: 768px) {
            .morePagesXsUnder {
                bottom: -150px;
                height: 300px;
                z-index: auto;
            }
        }
        .morePagesUnder {
            bottom: -300px;
            height: 600px;
            left: 50%;
            z-index: -1;
        }
        .morePagesUnderFrom {
            bottom: -150px;
            height: 450px;
            left: 50%;
            z-index: -1;
        }
        .morePagesUnderTo {
            bottom: -300px;
            height: 450px;
            left: 50%;
            z-index: -1;
        }
        .morePagesFromCircle::before {
            background-color: #0275d8;
            border-radius: 10px;
            color: #0275d8;
            content: "";
            height: 10px;
            left: 50%;
            margin-left: -6px;
            position: absolute;
            top: 0;
            width: 10px;
        }
        .morePagesFromText::before {
            color: #0275d8;
            font-weight: 600;
            height: 20px;
            left: 50%;
            margin-left: -125px;
            margin-top: -20px;
            position: absolute;
            text-align: center;
            text-decoration: underline;
            top: 0;
            width: 250px;
        }
        .morePagesToText::after {
            bottom: 0;
            color: #0275d8;
            font-weight: 600;
            height: 20px;
            left: 50%;
            margin-left: -125px;
            position: absolute;
            text-align: center;
            text-decoration: underline;
            width: 250px;
        }
        .morePagesToCircle::after {
            background-color: #0275d8;
            border-radius: 10px;
            bottom: 0;
            color: #0275d8;
            content: "";
            height: 10px;
            left: 50%;
            margin-left: -6px;
            position: absolute;
            width: 10px;
        }
        .morePagesText {
            bottom: 10%;
            color: #0275d8;
            font-weight: 600;
            height: 20px;
            left: 50%;
            margin-left: -125px;
            position: absolute;
            text-align: center;
            text-decoration: underline;
            width: 250px;
        }
        .morePagesText::after {
            border-left: 2px dashed #0275d8;
            content: "";
            height: 200px;
            left: 50%;
            margin-left: -1px;
            position: absolute;
            text-align: center;
            top: 100%;
            width: 2px;
            z-index: -1;
        }
        /*@media (max-height: 449px),*/
        /*(min-height: 450px) and (max-height: 475px) and (min-width: 220px),*/
        /*(min-height: 475px) and (max-height: 499px) and (min-width: 240px),*/
        /*(min-height: 500px) and (max-height: 524px) and (min-width: 280px),*/
        /*(min-height: 525px) and (max-height: 549px) and (min-width: 320px),*/
        /*(min-height: 550px) and (max-height: 574px) and (min-width: 360px),*/
        /*(min-height: 575px) and (max-height: 599px) and (min-width: 400px),*/
        /*(min-height: 600px) and (max-height: 624px) and (min-width: 430px),*/
        /*(min-height: 625px) and (max-height: 649px) and (min-width: 460px),*/
        /*(min-height: 650px) and (max-height: 674px) and (min-width: 490px),*/
        /*(min-height: 675px) and (max-height: 770px) and (min-width: 575px){*/
            /*.morePagesText {*/
                /*color: white;*/
                /*z-index: -1;*/
            /*}*/
        /*}*/
        .nativeRender {
            margin-bottom: 0;
        }
        @media (min-width: 768px) {
            .nativeRender {
                margin-bottom: 200px;
            }
        }
        .carousel-caption {
            background-color: rgba(255, 255, 255, .8);
            color: #000;
            text-shadow: none;
        }
        .carousel-caption h3 {
            font-weight: 900;
        }
        :host >>> .carousel-control-next, :host >>> .carousel-control-prev {
            display: none;
            /*background-color: #eee;*/
            /*width: 10%;*/
        }
        :host >>> .carousel-indicators li {
            background-color: #fff;
            border: 1px solid #0275d8;
        }
        :host >>> .carousel-indicators li.active {
            background-color: #0275d8;
        }
    `],
    templateUrl: 'home.component.html'
})
export class HomeComponent implements AfterViewChecked {
    // cdeFormSelection = 'formOnly';
    currentFragment: string;
    // currentTab: string;
    // elt: CdeForm;
    // currentFormFeature: any;
    // featuredItems = {
    //     Forms: [
    //         {tinyId: '7kBFB4TUM', name: 'BRICS NINR SF-36'},
    //         {tinyId: '7JlBFjBiMf', name: 'Demography NCI Standard Template'},
    //         {tinyId: 'mJP_B1HrFg', name: 'Patient Health Questionnaire - 9 (PHQ-9) Depression Scale'},
    //         {tinyId: '7kjmoQ8xQ', name: 'Patient-Reported Outcomes with LASIK Pre-Operative Questionnaire'},
    //         {tinyId: 'mJsGoMU1m', name: 'PHQ-9 quick depression assessment panel [Reported.PHQ]'},
    //         {tinyId: '71_l5EnuFUl', name: 'PROMIS Parent Proxy SF v1.0 - Mobility 8a'},
    //         {tinyId: 'XySUBn_NZ', name: 'SDC Adrenal'},
    //     ]
    // };
    // formFeatures = [
    //     {feature: 'Matrix', description: 'Multiple choice answers are listed on columns.', tinyId: '71pwc60mQ'},
    //     {feature: 'Scores', description: 'Calculations such as scoring automate the math.', tinyId: 'mJsGoMU1m'},
    //     {feature: 'Table', description: 'Questions can be asked multiple times.', tinyId: 'XJtA5M63ix'},
    //     {feature: 'Follow-up Logic', description: 'Some answers have their own questions.', tinyId: 'XySUBn_NZ'},
    //     {feature: 'Dynamic Logic', description: 'Fill out the form to get another question.',  tinyId: 'mJsGoMU1m'},
    //     {feature: 'Validation', description: 'Fields marked with red are required.', tinyId: 'myGNFiSjMG'},
    // ];
    // formFeatureDescription: string;
    // newItems = {CDEs: null, Forms: null};
    // statsType = 'Forms';
    // topItems = {CDEs: null, Forms: null};

    constructor(private http: Http, private route: ActivatedRoute, private formService: FormService) {
        // this.getForm(this.formFeatures[0]);
    }

    ngAfterViewChecked() {
        this.route.fragment.subscribe(fragment => {
            if (fragment && this.currentFragment !== fragment) {
                setTimeout(function () {
                    document.querySelector('#' + fragment).scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }, 100);
                this.currentFragment = fragment;
            }
        });
    }

    // getForm(feature) {
    //     this.formService.getForm(feature.tinyId, undefined, (err, elt) => {
    //         if (!err) {
    //             FormService.areDerivationRulesSatisfied(elt);
    //             this.elt = elt;
    //         }
    //     });
    //     this.currentFormFeature = feature;
    //     this.formFeatureDescription = feature.description;
    // }
    //
    // getStats(tab = null) {
    //     if (!tab)
    //         tab = this.currentTab;
    //     else
    //         this.currentTab = tab;
    //
    //     if (tab === 'tabFeatured')
    //         this.cdeFormSelection = 'formOnly';
    //     else if (tab === 'tabTop')
    //         this.cdeFormSelection = 'cdeOnly';
    //     else
    //         this.cdeFormSelection = 'both';
    //
    //     let type;
    //     if (this.statsType === 'CDEs')
    //         type = 'cde';
    //     else if (this.statsType === 'Forms')
    //         type = 'form';
    //     else
    //         return;
    //
    //     if (tab === 'tabTop') {
    //         if (this.topItems['CDEs'] === null)
    //             this.http.get('/statsTopViews/cde').map(res => res.json()).subscribe(
    //                 res => {
    //                     this.topItems['CDEs'] = res;
    //                 },
    //                 error => {
    //                 }
    //             );
    //     } else if (tab === 'tabNew') {
    //         if (this.newItems[this.statsType] === null)
    //             this.http.get('/statsNew/' + type).map(res => res.json()).subscribe(
    //                 res => {
    //                     this.newItems[this.statsType] = res;
    //                 },
    //                 error => {
    //                 }
    //             );
    //     }
    // }

    takeATour() {
        TourService.takeATour();
    }
}
