
package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import net.lingala.zip4j.core.ZipFile;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class ExportTestXML extends NlmCdeBaseTest {
@Test
public void cdeSearchXmlExport() {
        goToCdeSearch();
        findElement(By.id("browseOrg-CTEP")).click();
        textPresent("All Statuses");
        findElement(By.id("export")).click();
        findElement(By.id("xmlExport")).click();
        textPresent("export is being generated");
        textPresent("Export downloaded.");
        closeAlert();
        closeAlert();

        String[] expected = {
        "</definition><languageCode>EN-US</languageCode><context><contextName>Health",
        "<name>Common Toxicity Criteria Adverse Event Iron Excess Grade</name><datatype>Value List</datatype>",
        "<registrationStatus>Qualified</registrationStatus></registrationState></element>"
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
        Assert.fail("missing line in export : " + s);
        }
        }
        } catch (Exception e) {
        e.printStackTrace();
        Assert.fail("Error reading SearchExport_XML.zip " + e);
        }
        }
}