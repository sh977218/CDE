package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static com.jayway.restassured.RestAssured.given;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class BoardExportTest extends BoardTest {
    @Test
    public void boardExport() {
        String board_name = "Board Export Test";
        String board_description = "Test for board export";
        mustBeLoggedInAs("boardexport", password);

        goToBoard(board_name);
        textPresent("Export Board");
        findElement(By.id("mb.export")).click();
        textPresent("Export downloaded.");
        closeAlert();

        String[] expected = {
                "Name, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By",
                "\"Scale for the Assessment of Positive Symptoms (SAPS) - voice conversing  scale\",\"Like voices commenting, voices conversing are cons",
                "\"Intravesical Protocol Agent Administered Specify\",\"No explain\",\"CHARACTER\",\"\",\"caDSR: 2399243 v1;",
                "\"User Login Name java.lang.String\",\"\",\"java.lang.String\",\"\",\"caDSR: 2223533 v3\",\"caCORE\",\"Qualified\",\"\",\"caBIG; caCORE\","
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/QuickBoardExport.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/QuickBoardExport.csv"),
                            Paths.get(tempFolder + "/ExportTest-quickBoardExport.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail("Exception reading QuickBoardExport.csv " + e);
        }


        String url = driver.getCurrentUrl();
        String bid = url.substring(url.lastIndexOf("/") + 1);
        String url_string = baseUrl + "/board/" + bid + "/0/500";
        String response = given().when().get(url_string).asString();
        String result = "\"name\":\"Export my board test\",\"description\":\"This test tests export board.\",\"shareStatus\":\"Public\",";
        Assert.assertTrue(response.contains(result));
    }

}
