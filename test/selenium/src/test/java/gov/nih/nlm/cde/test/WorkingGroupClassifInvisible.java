package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class WorkingGroupClassifInvisible extends BaseClassificationTest {

    @Test
    public void wgClassificationsInvisible() {
        mustBeLoggedInAs(wguser_username, password);
        goToCdeByName("Specimen Block Received Count");

        clickElement(By.id("classification_tab"));
        _addClassificationMethod(new String[]{"WG-TEST", "WG Classif", "WG Sub Classif"});
        textPresent("WG Sub Classif");
        logout();
        goToCdeByName("Specimen Block Received Count");
        textNotPresent("WG-TEST", By.id("dd_usedBy"));

        clickElement(By.id("classification_tab"));
        textNotPresent("WG Sub Classif");
    }


}
