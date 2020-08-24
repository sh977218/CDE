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
        hangon(2);
        clickElement(By.id("export"));
        clickElement(By.xpath("//*[@mat-menu-item][contains(.,'CDE Dictionary (CSV)')]"));
        checkAlert("Export downloaded");

        String[] expected = {
                "\"Traumatic brain injury symptom other text\",\"Other, Specify:\",\"Text\",\"\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C18400 v3; NINDS Variable Name: TBISympOthrTxt\",",
                "\"Person Gender Text Type\",\"Patient gender; Gender; Gender of a Person; Recipient gender:; What is your gender?; Newborn Gender\",\"Value List\",\"Female; Male; Unknown; Unspecified\",\"caBIG\",\"caBIG; DCP; NHLBI; SPOREs; TEST; CCR; CDC/PHIN; ECOG-ACRIN; NICHD; AECC; LCC; USC/NCCC; NHC-NCI; PBTC; CITN; OHSU Knight; DCI\",\"Standard\",\"caDSR: 2200604 v3\",",
                "\"Insomnia Severity Index (ISI) - worry distress measurement\",\"How worried distressed are you about your current sleep problem?\",\"Value List\",\"0; 1; 2; 3; 4\",\"NINDS\",\"NINDS\",\"Qualified\",\"NINDS: C09382 v3; NINDS Variable Name: ISIWorDistMeasr\""
        };
        try {
            hangon(2);
            String actual = new String(Files.readAllBytes(Paths.get(downloadFolder + "/FormCdes-Xy910Dz6f.csv")));
            for (String s : expected) {
                if (!actual.contains(s)) {
                    Files.copy(
                            Paths.get(downloadFolder + "/FormCdes-Xy910Dz6f.csv"),
                            Paths.get(tempFolder + "/ExportTest-FormCdes-Xy910Dz6f.csv"), REPLACE_EXISTING);
                    Assert.fail("missing line in export : " + s + "\nActual: " + actual);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail("Exception reading FormCdes-Xy910Dz6f.csv -- " + e);
        }
    }

}
