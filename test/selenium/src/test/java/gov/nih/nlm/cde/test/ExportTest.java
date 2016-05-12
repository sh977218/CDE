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
// TODO Change this
        clickElement(By.id("searchSettings"));
        findElement(By.id("uom")).click();
        findElement(By.id("administrativeStatus")).click();
        findElement(By.id("source")).click();
        findElement(By.id("updated")).click();
        findElement(By.id("tinyId")).click();
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
                "Name, Other Names, Value Type, Permissible Values, Nb of Permissible Values, Unit of Measure, Steward, Used By, Registration Status, Administrative Status, Identifiers, Source, Updated, NLM ID",
                "\"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - right foot toe tap score\",\"TOE TAPPING\",\"Value List\",\"0; 1; 2; 3; 4\",\"5\",\"\",\"NINDS\",\"NINDS\",\"Qualified\",\"\",\"NINDS: C10003 v3; NINDS Variable Name: RteFtToeTppngScore\",\"NINDS\",\"\",\"hP7Onn6rACw\",",
                "\"Unified Parkinson's Disease Rating Scale (UPDRS) - symptomatic orthostasis indicator\",\"Does the patient have symptomatic orthostasis?\",\"Value List\",\"0; 1\",\"2\",\"\",\"NINDS\",\"NINDS\",\"Qualified\",\"\",\"NINDS: C09927 v3; NINDS Variable Name: UPDRSSymOrtInd\",\"NINDS\",\"\",\"faEJq9G70j3\","
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/SearchExport (1).csv")));
            for (String s : expected2) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/SearchExport (1).csv"),
                            Paths.get(tempFolder + "/ExportTest-searchExport.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s +  "\n" + "-----\nActual Export: " + actual); //I added this in to better log in. Hope it doesn't break anything
                }
            }
        } catch (IOException e) {
            Assert.fail("Exception reading SearchExport.csv");
        }
    }

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

    @Test
    public void cdeQuickBoardExport() {
        mustBeLoggedOut();
        loadDefaultSettings();

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
                "Name, Other Names, Value Type, Permissible Values, Nb of Permissible Values, Steward, Used By, Registration Status, Identifiers",
                "\"Scale for the Assessment of Positive Symptoms (SAPS) - voice conversing  scale\",\"Like voices commenting, voices conversing are considered a Schneiderian first-rank symptom. They involve hearing two or more voices talking with one another, usually discussing something about the subject. As in the case of voices commenting, they should be scored independently of other auditory hallucinations.  Have you heard two or more voices talking with each other?  What did they say?\",\"Value List\",\"0; 1; 2; 3; 4; 5\",\"6\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C09512 v3; NINDS Variable Name: SAPSVocConvrsngScale\"",
                "\"Intravesical Protocol Agent Administered Specify\",\"No explain\",\"CHARACTER\",\"\",\"\",\"CTEP\",\"CTEP\",\"Qualified\",\"caDSR: 2399243 v1",
                "\"User Login Name java.lang.String\",\"\",\"java.lang.String\",\"\",\"\",\"caCORE\",\"caBIG; caCORE\",\"Qualified\",\"caDSR: 2223533 v3"
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/QuickBoardExport.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/QuickBoardExport.csv"),
                            Paths.get(tempFolder + "/ExportTest-quickBoardExport.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s + "-----\nActual Export: " + actual);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail("Exception reading QuickBoardExport.csv " + e);
        }

    }

}
