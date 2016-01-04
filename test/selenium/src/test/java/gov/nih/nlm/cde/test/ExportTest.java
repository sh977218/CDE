package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import net.lingala.zip4j.core.ZipFile;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static java.nio.file.StandardCopyOption.*;

public class ExportTest extends NlmCdeBaseTest {

    @Test
    public void searchExport() {
        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent("All Statuses");
        findElement(By.id("ftsearch-input")).sendKeys("\"Parkinson's\"");
        findElement(By.id("export")).click();
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        closeAlert();
        findElement(By.id("export")).click();
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        closeAlert();
        textPresent("server is busy processing");
        closeAlert();
        textPresent("Export downloaded.");
        closeAlert();

        String[] expected = {
                "Name, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By\n\"",
                "\"Scale for Outcomes in PD Autonomic (SCOPA-AUT) - urinate night indicator\",\"In the past month, have you had to pass urine at night?\",\"Value List\",\"Never; Sometimes; Regularly; Often; use catheter\",\"NINDS: C10354 v3; NINDS Variable Name: SCOPAAUTUrinateNightInd\",\"NINDS\",\"Qualified\",\"\",\"NINDS\",\n",
                "\"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - anxious mood score\",\"ANXIOUS MOOD\",\"Value List\",\"0; 1; 2; 3; 4\",\"NINDS: C09962 v3; NINDS Variable Name: MDSUPDRSAnxsMoodScore\",\"NINDS\",\"Qualified\",\"\",\"NINDS\",\n"
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/SearchExport.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/SearchExport.csv"),
                            Paths.get(tempFolder + "/ExportTest-searchExport.csv"), REPLACE_EXISTING);
//                    Files.setPosixFilePermissions(Paths.get(tempFolder + "/ExportTest-searchExport.csv"), filePerms);
                }
                Assert.assertTrue(actual.contains(s), "missing line in export : " + s);
            }
        } catch (IOException e) {
            Assert.fail("Exception reading SearchExport.csv");
        }

    }

    @Test (dependsOnMethods = {"searchExport"})
    public void allExport() throws TimeoutException {
        goToCdeSearch();

        findElement(By.id("export")).click();
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        closeAlert();
        findElement(By.id("export")).click();
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        closeAlert();
        textPresent("server is busy processing");
        closeAlert();
        boolean done = false;
        for (int i = 0; !done && i < 15; i++) {
            try {
                textPresent("Export downloaded.");
                done = true;
            } catch (TimeoutException e) {
                System.out.println("No export after : " + 10 * i + "seconds");
            }
        }
        closeAlert();
        if (!done) throw new TimeoutException("Export was too slow.");

        String[] expected = {
                "Name, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By",
                "\"Excisional Biopsy Colorectal Pathology Comment java.lang.String\",\"\",\"java.lang.String\",\"\",\"caDSR: 2784102 v1\",\"caBIG\",\"Qualified\",\"\",\"",
                "\"Risk Factor Questionnaire (RFQ) - metal dust or fume 1 worked around text\",\"If Yes, specify other solvent-based adhesives used.\",\"Text\"",
                "\"Identifier Primary Flag java.lang.Boolean\",\"\",\"java.lang.Boolean\",\"\",\"caDSR: 2735267 v1\",\"caBIG\",\"Qualified\",\"\",\"caBIG\","
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/SearchExport (1).csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/SearchExport (1).csv"),
                            Paths.get(tempFolder + "/ExportTest-allExport.csv"), REPLACE_EXISTING);
//                    Files.setPosixFilePermissions(Paths.get(tempFolder + "/ExportTest-allExport.csv"), filePerms);
                }
                Assert.assertTrue(actual.contains(s), "missing line in export : " + s);
            }
        } catch (IOException e) {
            Assert.fail("Exception reading SearchExport.csv");
        }
    }

    @Test
    public void searchXmlExport() {
        goToCdeSearch();
        findElement(By.id("browseOrg-CTEP")).click();
        textPresent("All Statuses");
        findElement(By.id("export")).click();
        findElement(By.id("xmlExport")).click();
        textPresent("export is being generated");
        closeAlert();
        textPresent("Export downloaded.");
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
//                    Files.setPosixFilePermissions(Paths.get(tempFolder + "/SearchExport_XML.zip"), filePerms);
                }
                Assert.assertTrue(actual.contains(s), "missing line in export : " + s);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Assert.fail("Error reading SearchExport_XML.zip " + e);
        }
    }


    @Test
    public void quickBoardExport() {
        goToSearch("cde");
        clickElement(By.id("browseOrg-caBIG"));
        hangon(1);
        addCdeToQuickBoard("Intravesical Protocol Agent Administered Specify");
        addCdeToQuickBoard("Scale for the Assessment of Positive Symptoms (SAPS) - voice conversing scale");
        addCdeToQuickBoard("User Login Name java.lang.String");

        textPresent("Quick Board (3)");
        goToQuickBoardByModule("cde");
        textPresent("Export Quick Board");

        clickElement(By.id("qb_cde_export"));
        textPresent("Export downloaded.");
        closeAlert();
        findElement(By.id("qb_cde_empty")).click();

        String[] expected = {
                "Name, Other Names, Value Domain, Permissible Values, Identifiers, Steward, Registration Status, Administrative Status, Used By",
                "\"Scale for the Assessment of Positive Symptoms (SAPS) - voice conversing  scale\",\"Like voices commenting, voices conversing are cons",
                "\"Intravesical Protocol Agent Administered Specify\",\"No explain\",\"CHARACTER\",\"\",\"caDSR: 2399243 v1\"",
                "\"User Login Name java.lang.String\",\"\",\"java.lang.String\",\"\",\"caDSR: 2223533 v3\",\"caCORE\",\"Qualified\",\"\",\"caBIG; caCORE\","
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/QuickBoardExport.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/QuickBoardExport.csv"),
                            Paths.get(tempFolder + "/ExportTest-quickBoardExport.csv"), REPLACE_EXISTING);
//                    Files.setPosixFilePermissions(Paths.get(tempFolder + "/ExportTest-quickBoardExport.csv"), filePerms);
                }
                Assert.assertTrue(actual.contains(s), "missing line in export : " + s);
            }
        } catch (IOException e) {
            Assert.fail("Exception reading QuickBoardExport.csv " + e);
        }

    }

}
