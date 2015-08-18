package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.concurrent.TimeUnit;

import static com.jayway.restassured.RestAssured.*;

public class ExportTest extends NlmCdeBaseTest {

    @Test
    public void searchExport() {
        String query = "{\"resultPerPage\":20,\"selectedOrg\":\"CTEP\",\"selectedElements\":[],\"selectedElementsAlt\":[],\"includeAggregations\":true,\"selectedStatuses\":[\"Preferred Standard\",\"Standard\",\"Qualified\",\"Recorded\",\"Candidate\",\"Incomplete\"],\"searchToken\":\"id8567429b\"}";

        String response = given().contentType("application/json; charset=UTF-16").body(query).when().post(baseUrl + "/elasticSearchExport/cde").asString();//.then().assertThat().contentType(ContentType.JSON);

        Assert.assertTrue(response.contains("\"Ethnic Group Category Text\",\"Ethnicity; Patient Ethnicity; Ethnicity; Newborn's Ethnicity\",\"Value List\",\"Not Hispanic or Latino; Hispanic or Latino; Unknown; Not reported\",\"caDSR: 2192217 v2\",\"caBIG\",\"Standard\",\"\",\"NIDCR; caBIG; CCR; CTEP; NICHD; AECC; LCC; USC/NCCC; NHC-NCI; PBTC; CITN; OHSU Knight; DCP; DCI; Training\","));

        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent("All Statuses");
        findElement(By.id("ftsearch-input")).sendKeys("\"Parkinson's\"");
        findElement(By.id("exportSearch")).click();
        textPresent("export is being generated");
        closeAlert();
        findElement(By.id("exportSearch")).click();
        textPresent("export is being generated");
        closeAlert();
        textPresent("server is busy processing");
        closeAlert();
        wait.withTimeout(10, TimeUnit.SECONDS);
        boolean done = false;
        for (int i = 0; !done && i < 15; i++) {
            try {
                textPresent("Export downloaded.");
                done = true;
            } catch (TimeoutException e) {
                System.out.println("No export after : " + 10 * i + "seconds");
            }
        }
        wait.withTimeout(defaultTimeout, TimeUnit.SECONDS);
        closeAlert();
        if (!done) throw new TimeoutException("Export was too slow.");
    }

    @Test
    public void quickBoardExport() {
        goToSearch("cde");
        findElement(By.id("browseOrg-caBIG")).click();
        hangon(1);
        findElement(By.id("addToCompare_0")).click();
        findElement(By.id("addToCompare_1")).click();
        findElement(By.id("addToCompare_2")).click();
        findElement(By.id("addToCompare_3")).click();
        findElement(By.id("addToCompare_4")).click();
        findElement(By.id("addToCompare_5")).click();
        findElement(By.id("addToCompare_6")).click();

        textPresent("Quick Board ( 7 )");
        goToQuickBoard();

        textPresent("Export Quick Board");

        findElement(By.id("qb.export")).click();
        wait.withTimeout(10, TimeUnit.SECONDS);
        boolean done = false;
        for (int i = 0; !done && i < 15; i++) {
            try {
                textPresent("Export downloaded.");
                done = true;
            } catch (TimeoutException e) {
                System.out.println("No export after : " + 10 * i + "seconds");
            }
        }
        wait.withTimeout(defaultTimeout, TimeUnit.SECONDS);
        closeAlert();
        findElement(By.id("qb.empty")).click();
        if (!done) throw new TimeoutException("Export was too slow.");
    }

}
