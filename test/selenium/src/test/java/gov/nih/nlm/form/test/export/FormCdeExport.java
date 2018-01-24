package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

public class FormCdeExport extends NlmCdeBaseTest {

    @Test
    public void formCdeExport() {
        mustBeLoggedInAs(test_username, password);
        goToFormByName("Form In Form Num Questions");
        clickElement(By.id("export"));
        clickElement(By.id("formCdesExport"));
        checkAlert("Export downloaded");

        String[] expected = {
                "Traumatic brain injury symptom category\tTBI symptom or sign category\tValue List\tPhysical; Sleep; Cognitive; Emotional; Other\tNINDS\tNINDS\tQualified\tNINDS: C01056 v3; NINDS Variable Name: TBISympCat",
                "Insomnia Severity Index (ISI) - difficulty falling asleep measurement\tDifficulty falling asleep\tValue List\t0; 1; 2; 3; 4\tNINDS\tNINDS\tQualified\tNINDS: C09377 v3; NINDS Variable Name: ISIDifFalAslpMeasr",
                "Insomnia Severity Index (ISI) - Total score\tTotal Score\tNumber\t\tNINDS\tNINDS\tQualified\tNINDS: C21126 v1; NINDS Variable Name: ISITotalScore"
        };
        try {
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/FormCdes-Xy910Dz6f.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/FormCdes-Xy910Dz6f.csv"),
                            Paths.get(tempFolder + "/ExportTest-FormCdes-Xy910Dz6f.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s);
                }
            }
        } catch (IOException e) {
            Assert.fail("Exception reading SearchExport.csv");
        }


    }

}
