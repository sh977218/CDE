package gov.nih.nlm.loader;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import io.restassured.response.Response;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Random;

import static io.restassured.RestAssured.given;

public class ValidationSpellCheckerTest extends NlmCdeBaseTest {
    @Test
    public void csvSpellcheckerFail() throws IOException {
        mustBeLoggedInAs(theOrgAuth_username, password);

        Cookie currentCookie = getCurrentCookie();
        Response resp = given().cookie(currentCookie)
                .contentType(ContentType.JSON)
                .post(baseUrl + "/server/loader/spellcheckCSVLoad");
        Assert.assertEquals(resp.getStatusCode(), 400);
        Assert.assertTrue(resp.getBody().print().contains("No file uploaded for spell check"));


        Random rand = new Random();
        final File tempFile = File.createTempFile("nodatacsv_" + rand.nextInt(10000000), ".csv");
        tempFile.deleteOnExit();

        Response resp2 = given().cookie(currentCookie)
                .contentType("multipart/form-data")
                .multiPart("uploadedFiles", tempFile)
                .post(baseUrl + "/server/loader/spellcheckCSVLoad");
        Assert.assertEquals(resp2.getStatusCode(), 400);
        Assert.assertTrue(resp2.getBody().print().contains("No whitelist specified"));

    }

    @Test
    public void csvSpellcheckerNoData() throws IOException {

        mustBeLoggedInAs(theOrgAuth_username, password);

        Random rand = new Random();
        final File tempFile = File.createTempFile("nodatacsv_" + rand.nextInt(10000000), ".csv");
        tempFile.deleteOnExit();

        Cookie currentCookie = getCurrentCookie();
        Response resp = given().cookie(currentCookie)
                .contentType("multipart/form-data")
                .multiPart("uploadedFiles", tempFile)
                .multiPart("whitelist", "whitelist_name")
                .post(baseUrl + "/server/loader/spellcheckCSVLoad");
        Assert.assertEquals(resp.getStatusCode(), 200);
        Assert.assertTrue(resp.getBody().print().contains("No data found to validate. Was this a valid CSV file?"));
    }

    @Test
    public void csvSpellcheckerComplete() throws IOException {

        mustBeLoggedInAs(theOrgAuth_username, password);

        Random rand = new Random();
        final File tempFile = File.createTempFile("mockcsvspellcheckdata_" + rand.nextInt(10000000), ".csv");
        tempFile.deleteOnExit();
        FileWriter fileWriter = new FileWriter(tempFile, true);

        fileWriter.write(spellCheckString);
        fileWriter.close();

        Cookie currentCookie = getCurrentCookie();
        Response resp = given().cookie(currentCookie)
                .contentType("multipart/form-data")
                .multiPart("uploadedFiles", tempFile)
                .multiPart("whitelist", "whitelist_name")
                .post(baseUrl + "/server/loader/spellcheckCSVLoad");

        Assert.assertEquals(resp.getStatusCode(), 200);
        Assert.assertTrue(resp.getBody().print().contains("Definiton"));
    }

    @Test
    public void csvSpellcheckerWithTerms() throws IOException {
        mustBeLoggedInAs(theOrgAuth_username, password);

        Random rand = new Random();
        final File tempFile = File.createTempFile("spellcheckdata_" + rand.nextInt(10000000), ".csv");
        tempFile.deleteOnExit();
        FileWriter fileWriter = new FileWriter(tempFile, true);
        fileWriter.write(spellCheckTerms);
        fileWriter.close();

        Cookie currentCookie = getCurrentCookie();
        Response resp = given().cookie(currentCookie)
                .contentType("multipart/form-data")
                .multiPart("uploadedFiles", tempFile)
                .multiPart("whitelist", "test_whitelist")
                .post(baseUrl + "/server/loader/spellcheckCSVLoad");

        Assert.assertEquals(resp.getStatusCode(), 200);
        Assert.assertFalse(resp.getBody().print().contains("hellk"));
        Assert.assertTrue(resp.getBody().print().contains("wprld"));
    }

    String spellCheckString = ",\"CDE Name\",\"CDE Definition\"\n" +
            "Test Name One,Test Definition One\n" +
            "Test Name Two,Test Definition Two\n" +
            "Test Name Three,Test Definiton Three\n" +
            "Test Name Four,Test Definiton Four";

    String spellCheckTerms = ",\"CDE Name\",\"CDE Definition\"\n" +
            "Test,hello wprld\n" +
            "Test,hellk world";
}
