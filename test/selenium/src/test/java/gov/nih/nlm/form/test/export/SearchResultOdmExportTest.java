package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.File;

public class SearchResultOdmExportTest extends NlmCdeBaseTest {
    @Test
    public void searchResultOdmExport() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormSearch();
        clickElement(By.id("search_by_classification_NIDA"));
        clickElement(By.id("export"));
        clickElement(By.id("odmExport"));
        long zipSize = 0;
        for (int i = 0; i < 30; i++) {
            zipSize = new File(downloadFolder + "/SearchExport_ODM.zip").length();
            System.out.println("Wait for zip file to appear: " + i);
            if (zipSize == 9070) {
                i = 30;
            } else {
                hangon(5);
            }
        }
        Assert.assertEquals(zipSize, 9070);
    }
}
