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
        findElement(By.id("browseOrg-caBIG")).click();
        hangon(1);
        findElement(By.id("pinAll")).click();
        textPresent("Select Board");
        findElement(By.linkText(board_name)).click();
        textPresent("All elements pinned.");
        makePublic(board_name);
        goToBoard(board_name);
        textPresent("Export Board");
        findElement(By.id("mb.export")).click();
        boolean done = false;
        for (int i = 0; !done && i < 15; i++) {
            try {
                textPresent("Export downloaded.");
                done = true;
            } catch (TimeoutException e) {
                System.out.println("No export after : " + 10 * i + "seconds");
            }
        }
        closeAlert();
        if (!done) throw new TimeoutException("Export was too slow.");

        String url = driver.getCurrentUrl();
        String bid = url.substring(url.lastIndexOf("/") + 1);
        String url_string = baseUrl + "/board/" + bid + "/0/500";
        String response = given().when().get(url_string).asString();
        String result = "\"name\":\"Export my board test\",\"description\":\"This test tests export borad.\",\"shareStatus\":\"Public\",";
        Assert.assertTrue(response.contains(result));
    }

}
