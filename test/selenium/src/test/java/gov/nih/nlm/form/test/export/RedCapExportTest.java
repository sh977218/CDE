package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

import java.io.File;

public class RedCapExportTest extends BaseFormTest {

    @Test
    public void checkRedCapExportZipFileSize() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("Frontal Behavioral Inventory (FBI)");
        enableBetaFeature();
        clickElement(By.id("export"));
        clickElement(By.id("nihRedCap"));
        System.out.println("downloadFolder:" + downloadFolder);
        long aa = new File(downloadFolder + "Frontal Behavioral Inventory (FBI).zip").length();
        System.out.println("time:" + aa);
        hangon(10);
    }
}
