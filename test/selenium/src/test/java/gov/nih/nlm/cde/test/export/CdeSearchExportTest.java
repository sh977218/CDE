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
        mustBeLoggedOut();
        loadDefaultSettings();

        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("All Statuses");
        findElement(By.id("ftsearch-input")).sendKeys("\"Unified Parkinson's\"");
        clickElement(By.id("search.submit"));
        clickElement(By.id("export"));
        clickElement(By.id("csvExport"));
        checkAlert("Export downloaded.");

        String[] expected = {
                "Name, Question Texts, Value Type, Permissible Values, Nb of Permissible Values, Steward, Used By, Registration Status, Identifiers",
                "\"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - light headedness on stand score\",\"LIGHT HEADEDNESS ON STANDING\",\"Value List\",\"0; 1; 2; 3; 4\",\"5\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C09971 v3; NINDS Variable Name: MDSUPDRSLiteHeadStndngScore\"",
                "\"Unified Parkinson's Disease Rating Scale (UPDRS) - symptomatic orthostasis indicator\",\"Does the patient have symptomatic orthostasis?\",\"Value List\",\"0; 1\",\"2\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C09927 v3; NINDS Variable Name: UPDRSSymOrtInd\""
        };


        String fileLoc = downloadFolder + "/SearchExport.csv";
        try {
            String actual = new String(Files.readAllBytes(Paths.get(fileLoc)));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(fileLoc),
                            Paths.get(tempFolder + "/ExportTest-searchExport.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s);
                }
            }
        } catch (IOException e) {
            Assert.fail("Exception reading " + fileLoc);
            throw new RuntimeException(e);
        }
        clickElement(By.id("searchSettings"));
        clickElement(By.id("uom"));
        clickElement(By.id("naming"));
        clickElement(By.id("pvCodeNames"));
        clickElement(By.id("administrativeStatus"));
        clickElement(By.id("source"));
        clickElement(By.id("updated"));
        clickElement(By.xpath("//*[@id='identifiers']//input"));
        clickElement(By.xpath("//span[contains(@class,'select2-results')]/ul//li[text()='NINDS Variable Name']"));
        clickElement(By.id("saveSettings"));
        checkAlert("Settings saved!");

        try {
            clickElement(By.id("export"));
            textPresent("CSV Export");
            clickElement(By.id("csvExport"));
        } catch (TimeoutException e) {
            clickElement(By.id("export"));
            textPresent("CSV Export");
            clickElement(By.id("csvExport"));
        }

        checkAlert("Export downloaded.");

        String[] expected2 = {
                "Name, Question Texts, Other Names, Value Type, Permissible Values, Code Names, Nb of Permissible Values, Unit of Measure, Steward, Used By, Registration Status, Administrative Status, NINDS Variable Name, Source, Updated",
                "\"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - light headedness on stand score\",\"LIGHT HEADEDNESS ON STANDING\",\"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - light headedness on stand score\",\"Value List\",\"0; 1; 2; 3; 4\",\"Normal: No dizzy or foggy feelings; Slight: Dizzy or foggy feelings occur. However, they do not cause me troubles doing things; Mild: Dizzy or foggy feelings cause me to hold on to something, but I do not need to sit or lie back down; Moderate: Dizzy or foggy feelings cause me to sit or lie down to avoid fainting or falling; Severe: Dizzy or foggy feelings cause me to fall or faint.\",\"5\",\"\",\"NINDS\",\"NINDS\",\"Qualified\",\"\",\"MDSUPDRSLiteHeadStndngScore\",\"NINDS\",\"\",\n",
                "\"Unified Parkinson's Disease Rating Scale (UPDRS) - right hand movements scale\",\"Hand Movements Patient opens and closes hands in rapid succession.\",\"Unified Parkinson's Disease Rating Scale (UPDRS) - right hand movements scale\",\"Value List\",\"0; 1; 2; 3; 4\",\"Normal; Mild slowing and reduction in amplitude; Moderately impaired. Definite and early fatiguing. May have occasional arrests in movement; Severely impaired. Frequent hesitation in initiating movements or arrests in ongoing movement; Can barely perform the task\",\"5\",\"\",\"NINDS\",\"NINDS\",\"Qualified\",\"\",\"UPDRSRtHndMovScale\",\"NINDS\",\"\""
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
