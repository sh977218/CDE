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

public class PinAllTest extends BoardTest {

    @Test
    public void pinAllLessThan20() {
        String board_name = "Pin All Test Board";
        String board_description = "Pin All less than 20 board.";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        createBoard(board_name, board_description);
        goToCdeSearch();

        findElement(By.id("li-blank-SPOREs")).click();
        hangon(3);

        int searchResultNum_int = Integer.parseInt(findElement(By.id("searchResultNum")).getText().trim());
        findElement(By.id("pinAll")).click();
        textPresent("Select Board");
        findElement(By.linkText(board_name)).click();
        textPresent("All elements pinned.");
        gotoMyBoards();

        // find nb of cdes for the board.
        int num_cde_after_pinAll_int =
                Integer.valueOf(findElement(By.xpath("//*[@data-id = 'boardDiv_"
                        + board_name + "']//*[contains(@id, 'dd_numb_')]")).getText());
        Assert.assertEquals(searchResultNum_int, num_cde_after_pinAll_int);
        removeBoard(board_name);
    }

    @Test
    public void pinAllMoreThan20() {
        String board_name = "Pin All More Than 20 Test Board";
        String board_description = "This board is only for pin all more than 20 test.";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        createBoard(board_name, board_description);
        goToCdeSearch();
        findElement(By.id("li-blank-CTEP")).click();
        hangon(3);
        findElement(By.id("li-blank-Qualified")).click();
        hangon(3);
        int searchResultNum_int = Integer.parseInt(findElement(By.id("searchResultNum")).getText().trim());
        Assert.assertTrue(searchResultNum_int > 20);
        findElement(By.id("pinAll")).click();
        textPresent("Select Board");
        findElement(By.linkText(board_name)).click();
        textPresent("All elements pinned.");
        gotoMyBoards();
        int num_cde_after_pinAll_int =
                Integer.valueOf(findElement(By.xpath("//*[@data-id = 'boardDiv_"
                        + board_name + "']//*[contains(@id, 'dd_numb_')]")).getText());
        Assert.assertEquals(searchResultNum_int, num_cde_after_pinAll_int);
        removeBoard(board_name);
    }

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
        String bid = url.substring(url.lastIndexOf("/"));
        String response = given().contentType("application/json; charset=UTF-16").when().get(baseUrl + "/board/" + bid + "/0/500").asString();

        String result = "\"Diagnosis Change Date java.util.Date\"" +
                "\"Performed Study Activity Negation Occurrence Flag ISO21090.BL.v1.0\"" +
                "\"Person Other Premalignant Non-Melanomatous Lesion Indicator\"" +
                "\"Common Toxicity Criteria Adverse Event Dysphagia Grade\"" +
                "\"Animal Cancer Model Cell Line Name java.lang.String\"";
        Assert.assertTrue(response.contains(result));
    }


}
