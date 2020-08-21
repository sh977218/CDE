package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class FormCdeWithLinkedFormExportLong extends NlmCdeBaseTest {

    @Test
    public void formCdeWithLinkedFormsExportLong() {
        mustBeLoggedInAs("formLinkedForms", password);
        goToFormByName("Stroke Types and Subtypes");
        clickElement(By.id("export"));
        clickElement(By.xpath("//*[@mat-menu-item][contains(.,'CDE Dictionary (CSV)')]"));
        checkAlert("Export downloaded.");

        String[] expected = {
            "\"Baltimore-Washington Cooperative Young Stroke Study (BWCYSS) - standard sub type\",\"\",\"Text\",\"\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C14228 v3; NINDS Variable Name: BWCYSSStandardSubTyp\",\"QkX81HrFx\","
        };

        try {
            hangon(2);
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/FormCdes-QkX81HrFx.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/FormCdes-QkX81HrFx.csv"),
                            Paths.get(tempFolder + "/ExportTest-FormCdes-QkX81HrFx.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s + "\nActual: " + actual);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail("Exception reading FormCdes-QkX81HrFx.csv -- " + e);
        }

    }

}

