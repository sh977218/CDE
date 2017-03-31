package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import net.lingala.zip4j.core.ZipFile;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.nio.file.Files;
import java.nio.file.Paths;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class CdeSearchXmlExport extends NlmCdeBaseTest {

    @Test
    public void cdeSearchXmlExport() {
        mustBeLoggedInAs(test_username, password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-CTEP"));
        textPresent("All Statuses");
        clickElement(By.id("export"));
        clickElement(By.id("xmlExport"));
        textPresent("export is being generated");
        textPresent("Export downloaded.");
        closeAlert();
        closeAlert();

        String[] expected = {
                "</definition><languageCode>EN-US</languageCode><tags><tag>Health",
                "<name>Common Toxicity Criteria Adverse Event Iron Excess Grade</name>",
                "<datatype>Value List</datatype>",
                "<registrationStatus>Qualified</registrationStatus></registrationState>"
        };

        try {
            ZipFile zipFile = new ZipFile(downloadFolder + "/SearchExport_XML.zip");
            zipFile.extractFile("1dVwh5_NWd9.xml", downloadFolder + "/1dVwh5_NWd9.xml");
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/1dVwh5_NWd9.xml/1dVwh5_NWd9.xml")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/SearchExport_XML.zip"),
                            Paths.get(tempFolder + "/SearchExport_XML.zip"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s + " \n---- Actual: " + actual);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            Assert.fail("Error reading SearchExport_XML.zip " + e);
        }
    }


}
