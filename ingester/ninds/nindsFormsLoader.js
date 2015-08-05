/**
 * Created by huangs8 on 7/31/2015.
 */
var request = require('request');
request = request.defaults({jar: true});
var cheerio = require('cheerio');
var async = require('async');
var util = {};
require('./util.js').makeUtil(util);

var url = "http://www.commondataelements.ninds.nih.gov/CRF.aspx";
var formval;
var forms = [];
var tasks = [];
for (var k = 1; k < 27; k++) {
    tasks.push(k.toString());
}

var parseForm = function (index, callbackDone) {
    if (index == 1) {
        formval['ctl00$ScriptManager1'] = "ctl00$ContentPlaceHolder1$updatePanel2|ctl00$ContentPlaceHolder1$lbtnFirst";
        formval['__EVENTTARGET'] = "ctl00$ContentPlaceHolder1$lbtnFirst";
    }
    else {
        formval['ctl00$ScriptManager1'] = "ctl00$ContentPlaceHolder1$updatePanel2|ctl00$ContentPlaceHolder1$lbtnNext";
        formval['__EVENTTARGET'] = "ctl00$ContentPlaceHolder1$lbtnNext";
    }
    request.post(url, {
            followAllRedirects: true, headers: {
                'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)'
            }, form: formval
        },
        function (error, response, body) {
            $ = cheerio.load(body);
            var viewStateStr = '|__VIEWSTATE|';
            var viewStateStart = body.indexOf(viewStateStr);
            var viewStateEnd = body.substring(viewStateStart + viewStateStr.length, body.length).indexOf('|');
            formval['__VIEWSTATE'] = body.substring(viewStateStart + viewStateStr.length, viewStateStart + viewStateEnd);
            var eventValidationStr = '|__EVENTVALIDATION|';
            var eventValidationStart = body.indexOf(eventValidationStr);
            var eventValidationEnd = body.substring(eventValidationStart + eventValidationStr.length, body.length).indexOf('|');
            formval['__EVENTVALIDATION'] = body.substring(eventValidationStart + eventValidationStr.length, eventValidationStart + eventValidationEnd);

            var trs = $('#ContentPlaceHolder1_dgCRF tr');

            // looping through each row in the table, each row represent one form
            for (var i = 1; i < trs.length; i++) {
                var form = {};
                var tr = trs[i];
                var tds = $(tr).find('td');

                // looping through each cell in the row and parse into form
                for (var j = 0; j < tds.length; j++) {
                    var td = tds[j];
                    if (j == 0)
                        form['CRF Module/Guideline'] = util.replaceChars($(td).text());
                    if (j == 1)
                        form['Description'] = util.replaceChars($(td).text());
                    if (j == 2)
                        form['© or TM'] = util.replaceChars($(td).text());
                    if (j == 3)
                        form['Download'] = util.replaceChars($(td).text());
                    if (j == 4)
                        form['CDEs'] = util.replaceChars($(td).text());
                    if (j == 5)
                        form['Version'] = util.replaceChars($(td).text());
                    if (j == 6)
                        form['Version Date'] = util.replaceChars($(td).text());
                    if (j == 7)
                        form['Disease Name'] = util.replaceChars($(td).text());
                    if (j == 8)
                        form['SubDisease Name'] = util.replaceChars($(td).text());
                }
                forms.push(form);
            }
            callbackDone();
        })
}
var enterWebsite = function () {
    request.get(url,
        {
            followAllRedirects: true, headers: {
            'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)'
        }
        },
        function (error, response, body) {
            $ = cheerio.load(body);
            var __VIEWSTATE = $('#__VIEWSTATE').attr('value');
            var __VIEWSTATEGENERATOR = $('#__VIEWSTATEGENERATOR').attr('value');
            var __EVENTVALIDATION = $('#__EVENTVALIDATION').attr('value');
            formval = {
                ctl00$ContentPlaceHolder1$ddlDisease: "",
                ctl00$ContentPlaceHolder1$ddlSubDisease: "",
                ctl00$ContentPlaceHolder1$ddlDomain: "",
                ctl00$ContentPlaceHolder1$ddlSubDomain: "",
                ctl00$ContentPlaceHolder1$ddlCopyright: "",
                ctl00$ContentPlaceHolder1$txtKeyword: "",
                ctl00$ContentPlaceHolder1$btnSearch: "Search",
                ctl00$ContentPlaceHolder1$ddlPageSize: 100,
                ctl00$ContentPlaceHolder1$warnFormBuilder: "",
                __EVENTTARGET: "",
                __EVENTARGUMENT: "",
                __LASTFOCUS: "",
                __EVENTVALIDATION: __EVENTVALIDATION,
                __VIEWSTATE: __VIEWSTATE,
                __VIEWSTATEGENERATOR: __VIEWSTATEGENERATOR,
                __ASYNCPOST: true
            }
            async.eachSeries(tasks, parseForm, function (err) {
                // global callback for async.eachSeries
                if (err) {
                    console.log(err)
                } else {
                    console.log('All Needle requests successful and saved');
                    console.log(forms.length);
                }
            });

        })
}

enterWebsite();




