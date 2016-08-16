package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import org.testng.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

import java.io.File;

public class RedCapExportTest extends BaseFormTest {

    @Test
    public void checkRedCapExportZipFileSize() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Frontal Behavioral Inventory (FBI)");
        enableBetaFeature();
        clickElement(By.id("export"));
        clickElement(By.id("nihRedCap"));
        hangon(10);
        long zipSize = new File(downloadFolder + "Frontal Behavioral Inventory (FBI).zip").length();
        Assert.assertEquals(2894, zipSize);
    }
}
