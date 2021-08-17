package gov.nih.nlm.board.cde;

import gov.nih.nlm.system.EltIdMaps;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static io.restassured.RestAssured.given;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class BoardExportTest extends BoardTest {

    @Test
    public void boardExport() {
        String board_name = "Board Export Test";
        goToBoard(board_name);
        loadDefaultTableViewSettings();
        textPresent("Export Board");
        clickElement(By.id(("export")));
        clickElement(By.id(("csvExport")));
        checkAlert("Export downloaded.");
        hangon(10);

        String[] expected = {
                "Name, Question Texts, Value Type, Permissible Values, Nb of Permissible Values, Steward, Used By, Registration Status, Identifiers",
                "\"PTSD Checklist Military (PCLM) - Happening again indicator\",\"Suddenly acting or feeling as if the stressful experience were happening again (as if you were reliving it)?\",\"Value List\",\"1; 2; 3; 4; 5\",\"5\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C07394 v3; NINDS Variable Name: PCLMHappeningAgainInd\"",
                "\"Parkinson's Disease Quality of Life (PDQUALIF) - away from social scale\",\"My Parkinson�s symptoms cause me to stay away from social gatherings\",\"Value List\",\"Strongly Agree; Somewhat Agree; Agree; Somewhat disagree; Strongly Disagree\",\"5\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C17382 v3; NINDS Variable Name: PDQUALIFAwyFrmSocScale\""
        };
        
        waitForDownload("BoardExport.csv");

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/BoardExport.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/BoardExport.csv"),
                            Paths.get(tempFolder + "/ExportTest-boardExport.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s + " --- ACTUAL: " + actual);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail("Exception reading boardExport.csv " + e);
        }


        String url_string = baseUrl + "/server/board/" + EltIdMaps.eltMap.get(board_name) + "/0/500";
        String response = given().when().get(url_string).asString();
        String[] expected2 = {
                "\"name\":\"Board Export Test\",\"description\":\"Test for board export\",\"shareStatus\":\"Public\"",
                "\"name\":\"Acute Hospitalized\",\"elements\":[{\"name\":\"Classification\",\"elements\":[{\"name\":\"Supplemental\""
        };
        for (String s : expected2) {
            Assert.assertTrue(response.contains(s), "Actual Export: " + response);
        }
    }

}