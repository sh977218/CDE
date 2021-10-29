package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class FormJsonExport extends NlmCdeBaseTest {

    @Test
    public void jsonExport() {
        String[] expected = {
                "{\"title\":\"CRF\",\"uri\":\"https://commondataelements.ninds.nih.gov/Doc/EPI/F1126_Adverse_Event_Tracking_Log.docx\"}",
                "\"permissibleValue\":\"Yes\"",
                "\"valueMeaningName\":\"Yes\"",
                "\"registrationState\":{\"registrationStatus\":\"Qualified\",\"administrativeStatus\":\"Published\"}",
                "\"stewardOrg\":{\"name\":\"NINDS\"}",
                "\"designations\":[{\"tags\":[],\"designation\":\"Adverse Event Tracking Log\""
        };

        mustBeLoggedInAs(reguser_username, password);
        String form = "Adverse Event Tracking Log";
        goToFormByName(form);
        hangon(1);

        downloadAsFile();
        clickElement(By.id("export"));
        hangon(1);
        clickElement(By.xpath("//*[@mat-menu-item][contains(.,'JSON File, NIH/CDE Schema')]"));
        checkAlert("Export downloaded.");
        String fileName = downloadFolder + "/m1_5_1HBYl.json";
        waitForDownload(fileName);

        try {
            String actual = new String(Files.readAllBytes(Paths.get(fileName)));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(fileName),
                            Paths.get(tempFolder + "/FormJsonExport-m1_5_1HBYl.json"),
                            REPLACE_EXISTING
                    );
                    Assert.fail("missing line in export : " + s + "\nactual: " + actual);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail("Exception reading m1_5_1HBYl.json -- " + e);
        }

        downloadAsTab();
        clickElement(By.id("export"));
        hangon(1);
        clickElement(By.xpath("//*[@mat-menu-item][contains(.,'JSON File, NIH/CDE Schema')]"));
        switchTab(1);

        String response = findElement(By.cssSelector("HTML body pre")).getAttribute("innerHTML");

        for (String s2 : expected) {
            Assert.assertTrue(response.contains(s2), "String:\n" + s2 + "\nis not with in\n" + response + "\n");
        }

        switchTabAndClose(0);
    }


}
