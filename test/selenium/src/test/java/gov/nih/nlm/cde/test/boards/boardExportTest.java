package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WebDriver;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;
import java.util.concurrent.TimeUnit;

import static com.jayway.restassured.RestAssured.given;

public class BoardExportTest extends BoardTest {
    @Test
    public void boardExport() {
        String board_name = "Export my board test";
        String board_description = "This test tests export borad.";
        mustBeLoggedInAs(exportBoardUser_username, password);
        createBoard(board_name, board_description);
        goToSearch("cde");
        findElement(By.id("classifications-text-caBIG")).click();
        hangon(1);
        findElement(By.id("pinAll")).click();
        textPresent("Select Board");
        findElement(By.linkText(board_name)).click();
        textPresent("All elements pinned.");
        gotoMyBoards(board_name);
        textPresent("Export Board");
        findElement(By.id("mb.export")).click();
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

        String url = driver.getCurrentUrl();
        String bid = url.substring(url.lastIndexOf("/") + 1);
        String url_string = baseUrl + "/board/" + bid + "/0/500";
        System.out.println("url_string:" + url_string);

        String response = given().contentType("application/json; charset=UTF-16").when().get(url_string).asString();

        String result = "\"Diagnosis Change Date java.util.Date\"" +
                "\"Performed Study Activity Negation Occurrence Flag ISO21090.BL.v1.0\"" +
                "\"Person Other Premalignant Non-Melanomatous Lesion Indicator\"" +
                "\"Common Toxicity Criteria Adverse Event Dysphagia Grade\"" +
                "\"Animal Cancer Model Cell Line Name java.lang.String\"";
        System.out.println("********response***********");
        System.out.println(response);
        System.out.println("**************************");
        Assert.assertTrue(response.contains(result));
    }

}
