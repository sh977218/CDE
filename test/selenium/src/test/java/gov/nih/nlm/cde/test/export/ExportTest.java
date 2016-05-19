package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import net.lingala.zip4j.core.ZipFile;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class ExportTest extends NlmCdeBaseTest {

    @Test
    public void searchExport() {
        mustBeLoggedOut();
        loadDefaultSettings();

        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent("All Statuses");
        findElement(By.id("ftsearch-input")).sendKeys("\"Unified Parkinson's\"");
        clickElement(By.id("search.submit"));
        findElement(By.id("export")).click();
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        textPresent("Export downloaded.");
        closeAlert();
        closeAlert();

        String[] expected = {
                "Name, Other Names, Value Type, Permissible Values, Nb of Permissible Values, Steward, Used By, Registration Status, Identifiers",
                "\"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - right foot toe tap score\",\"TOE TAPPING\",\"Value List\",\"0; 1; 2; 3; 4\",\"5\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C10003 v3; NINDS Variable Name: RteFtToeTppngScore\",",
                "\"Unified Parkinson's Disease Rating Scale (UPDRS) - hygiene bed scale\",\"Turning in bed and adjusting bed clothes\",\"Value List\",\"0; 1; 2; 3; 4\",\"5\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C09897 v3; NINDS Variable Name: UPDRSHygBedScale\","
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
        findElement(By.id("uom")).click();
        findElement(By.id("administrativeStatus")).click();
        findElement(By.id("source")).click();
        findElement(By.id("updated")).click();
        clickElement(By.id("saveSettings"));
        textPresent("Settings saved!");
        closeAlert();

        clickElement(By.id("export"));
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        textPresent("Export downloaded.");
        closeAlert();
        closeAlert();

        String[] expected2 = {
                "Name, Other Names, Value Type, Permissible Values, Nb of Permissible Values, Unit of Measure, Steward, Used By, Registration Status, Administrative Status, Identifiers, Source, Updated",
                "\"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - right foot toe tap score\",\"TOE TAPPING\",\"Value List\",\"0; 1; 2; 3; 4\",\"5\",\"\",\"NINDS\",\"NINDS\",\"Qualified\",\"\",\"NINDS: C10003 v3; NINDS Variable Name: RteFtToeTppngScore\",\"NINDS\",\"\",",
                "\"Unified Parkinson's Disease Rating Scale (UPDRS) - symptomatic orthostasis indicator\",\"Does the patient have symptomatic orthostasis?\",\"Value List\",\"0; 1\",\"2\",\"\",\"NINDS\",\"NINDS\",\"Qualified\",\"\",\"NINDS: C09927 v3; NINDS Variable Name: UPDRSSymOrtInd\",\"NINDS\",\"\","
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/SearchExport (1).csv")));
            for (String s : expected2) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/SearchExport (1).csv"),
                            Paths.get(tempFolder + "/ExportTest-searchExport.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s);
                }
            }
        } catch (IOException e) {
            Assert.fail("Exception reading SearchExport.csv");
        }
    }

}
