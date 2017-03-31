package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.PropertyTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdePropertyTest extends PropertyTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToCdeByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToCdeSearch();
    }


    @Test
    public void richPropText() {
        String cdeName = "Imaging diffusion sixth b value";
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(cdeName, null);
        clickElement(By.id("properties_tab"));
        editPropertyValueByIndex(0, "Hello From Selenium", true);
    }

    @Test
    public void cdeTruncateRichText() {
        truncateRichText("Skull fracture morphology findings type");
    }

    @Test
    public void cdeTruncatePlainText() {
        truncatePlainText("Skull fracture morphology findings type");
    }

    @Test
    public void reorderProperties() {
        reorderPropertyTest("cde for test cde reorder detail tabs");
    }

}
