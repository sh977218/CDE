package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class WorkingGroupClassificationInvisibleTest extends BaseClassificationTest {

    @Test
    public void wgClassificationInvisible() {
        String cdeName = "Specimen Block Received Count";
        mustBeLoggedInAs(wguser_username, password);
        goToCdeByName(cdeName);

        clickElement(By.id("classification_tab"));
        addClassificationByTree("WG-TEST", new String[]{"WG Classif", "WG Sub Classif"});
        textPresent("WG Sub Classif");
        logout();
        goToCdeByName(cdeName);
        textNotPresent("WG-TEST", By.id("dd_usedBy"));

        clickElement(By.id("classification_tab"));
        textNotPresent("WG Sub Classif");
    }


}
