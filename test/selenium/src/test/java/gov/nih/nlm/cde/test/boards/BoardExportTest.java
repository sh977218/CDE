package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
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
        mustBeLoggedInAs("boardexport", password);
        
        String board_name = "Board Export Test";

        goToBoard(board_name);
        textPresent("Export Board");
        findElement(By.id("mb.export")).click();
        textPresent("Export downloaded.");
        closeAlert();

        String[] expected = {
            "Name, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By",
            "PTSD Checklist Military (PCLM) - Happening again indicator","Suddenly acting or feeling as if the stressful experience were happening again (as if you were reliving it)?","Value List","1; 2; 3; 4; 5","NINDS: C07394 v3; NINDS Variable Name: PCLMHappeningAgainInd","NINDS","Qualified","","NINDS",
            "Parkinson's Disease Quality of Life (PDQUALIF) - away from social scale","My Parkinson�s symptoms cause me to stay away from social gatherings","Value List","Strongly Agree; Somewhat Agree; Agree; Somewhat disagree; Strongly Disagree","NINDS: C17382 v3; NINDS Variable Name: PDQUALIFAwyFrmSocScale","NINDS","Qualified","","NINDS"
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/BoardExport.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/BoardExport.csv"),
                            Paths.get(tempFolder + "/ExportTest-boardExport.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail("Exception reading boardExport.csv " + e);
        }


        String url = driver.getCurrentUrl();
        String bid = url.substring(url.lastIndexOf("/") + 1);
        String url_string = baseUrl + "/board/" + bid + "/0/500";
        String response = given().when().get(url_string).asString();
        String[] expected2 = {
                "\"name\":\"Board Export Test\",\"description\":\"Test for board export\",\"shareStatus\":\"Public\"",
                "\"name\":\"Acute Hospitalized\"},{\"elements\":[{\"elements\":[{\"elements\":[],\"name\":\"Psychiatric and Psychological"
        };

        for (String s : expected2) {
            Assert.assertTrue(response.contains(s));
        }
    }

}
