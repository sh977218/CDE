package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.File;

public class RedCapExportTest extends BaseFormTest {

    @Test
    public void checkRedCapExportZipFileSize() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("Frontal Behavioral Inventory (FBI)");
        clickElement(By.id("export"));
        clickElement(By.xpath("//*[@mat-menu-item][contains(.,'REDCap')]"));
        // I think jszip doesn't actually compress, just packages. It's OK.
        long expectedZipSize = 9285;
        long zipSize = 0;
        for (int i = 0; i < 30; i++) {
            zipSize = new File(downloadFolder + "/Frontal Behavioral Inventory (FBI).zip").length();
            System.out.println("Wait for zip file to appear: " + i);
            if (zipSize == expectedZipSize) {
                i = 30;
            } else {
                hangon(5);
            }
        }
        Assert.assertEquals(zipSize, expectedZipSize);
    }
}
