package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class FormCdeWithLinkedFormsExportShort extends NlmCdeBaseTest {

    @Test
    public void formCdeWithLinkedFormsExportShort() {
        mustBeLoggedInAs("formLinkedForms", password);
        goToFormByName("Surgical and Procedural Interventions");
        clickElement(By.id("export"));
        clickElement(By.xpath("//*[@mat-menu-item][contains(.,'CDE Dictionary (CSV)')]"));
        checkAlert("Export downloaded.");
        hangon(10);
        String[] expected = {
                "\"Surgical or therapeutic procedure other text\",\"Other, specify\",\"Text\",\"\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C18765 v1; NINDS Variable Name: SurgTherapProcedurOTH\"",
                "myoQ8JBHFe", "XkYXUyHStg", "my57Uyrrtg", "7ymaXyrHYl", "7k0Q1rHYe", "mkDmUyBBFe"
        };

        try {
            hangon(2);
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/FormCdes-myoQ8JBHFe.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/FormCdes-myoQ8JBHFe.csv"),
                            Paths.get(tempFolder + "/ExportTest-FormCdes-myoQ8JBHFe.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s + "\nActual: " + actual);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail("Exception reading FormCdes-myoQ8JBHFe.csv -- " + e);
        }

    }

}
