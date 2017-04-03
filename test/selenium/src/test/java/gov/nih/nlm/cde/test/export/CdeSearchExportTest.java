package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class CdeSearchExportTest extends NlmCdeBaseTest {

    @Test
    public void cdeSearchExport() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        loadDefaultSettings();

        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("All Statuses");
        findElement(By.id("ftsearch-input")).sendKeys("\"Unified Parkinson's\"");
        clickElement(By.id("search.submit"));
        clickElement(By.id("export"));
        clickElement(By.id("csvExport"));
        textPresent("export is being generated");
        textPresent("Export downloaded.");
        closeAlert();
        closeAlert();

        String[] expected = {
                "Name, Question Texts, Value Type, Permissible Values, Nb of Permissible Values, Steward, Used By, Registration Status, Identifiers",
                "\"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - light headedness on stand score\",\"LIGHT HEADEDNESS ON STANDING\",\"Value List\",\"0; 1; 2; 3; 4\",\"5\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C09971 v3; NINDS Variable Name: MDSUPDRSLiteHeadStndngScore\"",
                "\"Unified Parkinson's Disease Rating Scale (UPDRS) - symptomatic orthostasis indicator\",\"Does the patient have symptomatic orthostasis?\",\"Value List\",\"0; 1\",\"2\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C09927 v3; NINDS Variable Name: UPDRSSymOrtInd\""
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/SearchExport.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/SearchExport.csv"),
                            Paths.get(tempFolder + "/ExportTest-searchExport.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s);
                }
            }
        } catch (IOException e) {
            Assert.fail("Exception reading SearchExport.csv");
        }
        clickElement(By.id("searchSettings"));
        clickElement(By.id("uom"));
        clickElement(By.id("naming"));
        clickElement(By.id("administrativeStatus"));
        clickElement(By.id("source"));
        clickElement(By.id("updated"));
        clickElement(By.id("saveSettings"));
        textPresent("Settings saved!");
        closeAlert();

        try {
            clickElement(By.id("export"));
            textPresent("CSV Export");
            clickElement(By.id("csvExport"));
        } catch (TimeoutException e) {
            clickElement(By.id("export"));
            textPresent("CSV Export");
            clickElement(By.id("csvExport"));
        }

        textPresent("export is being generated");
        textPresent("Export downloaded.");
        closeAlert();
        closeAlert();

        String[] expected2 = {
                "Name, Question Texts, Other Names, Value Type, Permissible Values, Nb of Permissible Values, Unit of Measure, Steward, Used By, Registration Status, Administrative Status, Identifiers, Source, Updated",
                "\"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - light headedness on stand score\",\"LIGHT HEADEDNESS ON STANDING\",\"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - light headedness on stand score\",\"Value List\",\"0; 1; 2; 3; 4\",\"5\",\"\",\"NINDS\",\"NINDS\",\"Qualified\",\"\",\"NINDS: C09971 v3; NINDS Variable Name: MDSUPDRSLiteHeadStndngScore\",\"NINDS\",\"\",\n",
                "\"Unified Parkinson's Disease Rating Scale (UPDRS) - right hand movements scale\",\"Hand Movements Patient opens and closes hands in rapid succession.\",\"Unified Parkinson's Disease Rating Scale (UPDRS) - right hand movements scale\",\"Value List\",\"0; 1; 2; 3; 4\",\"5\",\"\",\"NINDS\",\"NINDS\",\"Qualified\",\"\",\"NINDS: C09909 v3; NINDS Variable Name: UPDRSRtHndMovScale\",\"NINDS\",\"\""
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/SearchExport (1).csv")));
            for (String s : expected2) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/SearchExport (1).csv"),
                            Paths.get(tempFolder + "/ExportTest-searchExport.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s + "\n---Actual: " + actual);
                }
            }
        } catch (IOException e) {
            Assert.fail("Exception reading SearchExport.csv");
        }
    }

}
