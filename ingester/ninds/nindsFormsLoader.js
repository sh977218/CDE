/**
 * Created by huangs8 on 7/31/2015.
 */
var request = require('request');
request = request.defaults({jar: true});
var cheerio = require('cheerio');
var util = {};
require('./util.js').makeUtil(util);

var enterUrl = "http://www.commondataelements.ninds.nih.gov/CRF.aspx";
var url = "http://www.commondataelements.ninds.nih.gov/CRF.aspx";
var formval;
var forms = [];


util.parseThs = function (keys, tr0) {
    var ths = tr0.children;
    for (var i = 1; i < ths.length - 1; i++) {
        var th = ths[i];
        keys.push(util.replaceChars($(th).text()));
    }
}

util.parseTds = function (form, keys, tds) {
    for (var i = 0; i < tds.length; i++) {
        var td = tds[i];
        form[keys[i]] = util.replaceChars($(td).text());
    }
}

util.parseWebsite = function (form) {
    request.post(url, {
            followAllRedirects: true, headers: {
                'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)'
            }, form: formval
        },
        function (error, response, body) {
            $ = cheerio.load(body);
            var trs = $('#ContentPlaceHolder1_dgCRF tr');
            var tr0 = trs[0];
            var keys = [];
            util.parseThs(keys, tr0);
            for (var i = 1; i < trs.length; i++) {
                var form = {};
                var tr = trs[i];
                var tds = $(tr).find('td');
                util.parseTds(form, keys, tds);
                forms.push(form);
            }
            console.log(forms.length);
        })
}
util.enterWebsite = function () {
    request.get(enterUrl,
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

            formval['ctl00$ScriptManager1'] = "ctl00$ContentPlaceHolder1$updatePanel2|ctl00$ContentPlaceHolder1$lbtnFirst";
            formval['__EVENTTARGET'] = "ctl00$ContentPlaceHolder1$lbtnFirst";
            util.parseWebsite();


            formval['ctl00$ScriptManager1'] = "ctl00$ContentPlaceHolder1$updatePanel2|ctl00$ContentPlaceHolder1$lbtnNext";
            formval['__EVENTTARGET'] = "ctl00$ContentPlaceHolder1$lbtnNext";
            util.parseWebsite();

        })
}


util.enterWebsite();
var looper = [];
for (var k = 0; k < 25; k++) {
    looper.push(k.toString());
}

async.eachSeries(looper, util.parseWebsite, function (err) {
    // global callback for async.eachSeries
    if (err) {
        console.log(err)
    } else {
        console.log('All Needle requests successful and saved');
    }
});




