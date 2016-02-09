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
        mustBeLoggedOut();
        clickElement(By.id("searchSettings"));
        clickElement(By.id("loadDefaultSettings"));
        textPresent("Default settings loaded");
        closeAlert();
        clickElement(By.id("saveSettings"));
        textPresent("Settings saved!");
        closeAlert();

        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent("All Statuses");
        findElement(By.id("ftsearch-input")).sendKeys("\"Unified Parkinson's\"");
        findElement(By.id("export")).click();
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        closeAlert();
        textPresent("Export downloaded.");
        closeAlert();

        String[] expected = {
                "Name, Value Type, Other Names, Permissible Values, Unit of Measure, Steward, Used By, Registration Status, Administrative Status, Source, Updated, Identifiers\n",
                "\"Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - right foot toe tap score","Value List","TOE TAPPING","0; 1; 2; 3; 4","","NINDS","NINDS","Qualified","","NINDS","","NINDS: C10003 v3; NINDS Variable Name: RteFtToeTppngScore",
                "Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - finger tap left hand score","Value List","FINGER TAPPING","0; 1; 2; 3; 4","","NINDS","NINDS","Qualified","","NINDS","","NINDS: C09998 v3; NINDS Variable Name: MDSUPDRSFingerTppngLftHndScore"
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

        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent("All Statuses");
        findElement(By.id("ftsearch-input")).sendKeys("\"Unified Parkinson's\"");
        findElement(By.id("export")).click();
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        closeAlert();
        textPresent("Export downloaded.");
        closeAlert();

        String[] expected2 = {
                "Name, Value Type, Other Names, Permissible Values, Unit of Measure, Steward, Used By, Registration Status, Administrative Status, Source, Updated, Identifiers",
                "Movement Disorder Society - Unified Parkinson's Disease Rating Scale (MDS UPDRS) - right foot toe tap score","Value List","TOE TAPPING","0; 1; 2; 3; 4","","NINDS","NINDS","Qualified","","NINDS","","NINDS: C10003 v3; NINDS Variable Name: RteFtToeTppngScore",
                "Unified Parkinson's Disease Rating Scale (UPDRS) - Heart rate seated measurement","Number","Symptomatic orthostasis: Pulse: seated","","","NINDS","NINDS","Qualified","","NINDS","","NINDS: C18605 v1; NINDS Variable Name: UPDRSHRSeatedMeasr"

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
                    Assert.fail("missing line in export : " + s);
                }
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
                "\"Intravesical Protocol Agent Administered Specify\",\"No explain\",\"CHARACTER\",\"\",\"caDSR: 2399243 v1;",
                "\"User Login Name java.lang.String\",\"\",\"java.lang.String\",\"\",\"caDSR: 2223533 v3\",\"caCORE\",\"Qualified\",\"\",\"caBIG; caCORE\","
        };

        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/QuickBoardExport.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/QuickBoardExport.csv"),
                            Paths.get(tempFolder + "/ExportTest-quickBoardExport.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail("Exception reading QuickBoardExport.csv " + e);
        }

    }

}
