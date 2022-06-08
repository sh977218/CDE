package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class CdeSearchJsonExport extends NlmCdeBaseTest {

    @Test
    public void cdeSearchJsonExport() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("results. Sorted by relevance.");
        findElement(By.id("ftsearch-input")).sendKeys("\"Unified Parkinson's\"");
        clickElement(By.id("search.submit"));
        clickElement(By.id("export"));
        clickElement(By.id("jsonExport"));
        textPresent("Search results downloaded as JSON.");
        String fileName = downloadFolder + "/SearchExport.json";
        waitForDownload(fileName);

        String[] expected = {
                "\"tinyId\":\"03UmDCNQ4x7\",\"imported\":\"2015-09-21T18:20:26.298Z\",\"source\":\"NINDS\",\"version\":\"3\"",
                "\"referenceDocuments\":[],\"attachments\":[]",
                "\"archived\":false"
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(fileName)));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/SearchExport.json"),
                            Paths.get(tempFolder + "/ExportTest-searchExport.json"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s + "\nactual: " + actual);
                }
            }
        } catch (IOException e) {
            Assert.fail("Exception reading SearchExport.json");
            throw new RuntimeException(e);
        }
    }

}
