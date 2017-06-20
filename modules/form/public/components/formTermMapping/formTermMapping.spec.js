const u = require('../../../../../test/protractor/tests/testUtils');

describe('formTermMapping', () => {

    it ('should display mesh descriptors', done => {
        // Socioeconomic Status
        browser.get("/formView?tinyId=XyMzLyBHYl");

        u.textPresent("D003710 - Demography");
        u.textPresent("D000328 - Adult");

        element.all(by.id("addTermMap")).then(items => {
           expect(items.length).toBe(0);

           element.all(by.xpath("//i[@title='Remove Mesh Term']")).then(items2 => {
              expect(items2.length).toBe(0);
              done();
           });
        });
    });

});