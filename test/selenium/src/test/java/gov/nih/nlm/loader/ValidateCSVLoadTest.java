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

public class ValidateCSVLoadTest extends NlmCdeBaseTest{
    @Test
    public void csvValidationFail() {
        mustBeLoggedInAs(theOrgAuth_username, password);

        Cookie currentCookie = getCurrentCookie();
        Response resp = given().cookie(currentCookie)
                .contentType(ContentType.JSON)
                .post(baseUrl + "/server/loader/validateCSVLoad");
        Assert.assertEquals(resp.getStatusCode(), 400);
        Assert.assertTrue(resp.getBody().print().contains("No file uploaded for validation"));

    }

    @Test
    public void csvValidationNoData() throws IOException {

        mustBeLoggedInAs(theOrgAuth_username, password);

        Random rand = new Random();
        final File tempFile = File.createTempFile("nodatacsv_" + rand.nextInt(10000000), ".csv");
        tempFile.deleteOnExit();

        Cookie currentCookie = getCurrentCookie();
        Response resp = given().cookie(currentCookie)
                .contentType("multipart/form-data")
                .multiPart("uploadedFiles", tempFile)
                .post(baseUrl + "/server/loader/validateCSVLoad");
        Assert.assertEquals(resp.getStatusCode(), 200);
        Assert.assertTrue(resp.getBody().print().contains("No data found to validate. Was this a valid CSV file?"));
    }

    @Test
    public void csvValidationComplete() throws IOException {

        mustBeLoggedInAs(theOrgAuth_username, password);

        Random rand = new Random();
        final File tempFile = File.createTempFile("mockcsvloaddata_" + rand.nextInt(10000000), ".csv");
        tempFile.deleteOnExit();
        FileWriter fileWriter = new FileWriter(tempFile, true);

        fileWriter.write(simpleCSVString);
        fileWriter.close();

        Cookie currentCookie = getCurrentCookie();
        Response resp = given().cookie(currentCookie)
                .contentType("multipart/form-data")
                .multiPart("uploadedFiles", tempFile)
                .post(baseUrl + "/server/loader/validateCSVLoad");

        Assert.assertEquals(resp.getStatusCode(), 200);
        Assert.assertTrue(resp.getBody().print().contains("Mismatch between amount of permissible values"));
    }

    String simpleCSVString = ",\"CDE Name\",\"CDE Data Type\",\"CDE Type\",\"Permissible Value (PV) Labels\",\"Permissible Value (PV) Definitions\",\"Permissible Value (PV) \nConcept Identifiers\",\"Permissible Value (PV) Terminology Sources\"\n" +
            " , \n" +
            " , \n" +
            " , \n" +
            " , \n" +
            "2,Ethnicity,Value List,Individual CDE,\"Hispanic or Latino| \n" +
            "Not Hispanic or Latino\",\"Hispanic or Latino: A person of Cuban, Mexican, Puerto Rican, \n" +
            "South or Central American, or other Spanish culture or origin, \n" +
            "regardless of race.  The term Spanish origin can also be used \n" +
            "in addition to Hispanic or Latino.|\n" +
            "\",\"C0086409|\n" +
            "C1518424\",UMLS Metathesaurus";
}
