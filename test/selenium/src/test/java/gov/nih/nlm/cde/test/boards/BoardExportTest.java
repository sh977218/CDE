package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.given;

public class BoardExportTest extends BoardTest {
    @Test
    public void boardExport() {
        String board_name = "Export my board test";
        String board_description = "This test tests export board.";
        mustBeLoggedInAs(exportBoardUser_username, password);
        createBoard(board_name, board_description);
        goToSearch("cde");
        findElement(By.id("browseOrg-caBIG")).click();
        hangon(1);
        clickElement(By.id("pinAll"));
        textPresent("Choose a Board to pin");
        findElement(By.linkText(board_name)).click();
        textPresent("All elements pinned.");
        makePublic(board_name);
        goToBoard(board_name);
        textPresent("Export Board");
        findElement(By.id("mb.export")).click();
        textPresent("Export downloaded.");
        closeAlert();

        String url = driver.getCurrentUrl();
        String bid = url.substring(url.lastIndexOf("/") + 1);
        String url_string = baseUrl + "/board/" + bid + "/0/500";
        String response = given().when().get(url_string).asString();
        String result = "\"name\":\"Export my board test\",\"description\":\"This test tests export board.\",\"shareStatus\":\"Public\",";
        Assert.assertTrue(response.contains(result));
    }

}
