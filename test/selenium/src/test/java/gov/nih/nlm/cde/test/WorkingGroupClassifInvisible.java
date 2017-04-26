package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.test.classification.ClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class WorkingGroupClassifInvisible extends BaseClassificationTest {

    @Test
    public void wgClassificationsInvisible() {
        mustBeLoggedInAs(wguser_username, password);
        goToCdeByName("Specimen Block Received Count");

        clickElement(By.id("classification_tab"));
        new ClassificationTest()._addClassificationMethod(new String[]{"WG-TEST", "WG Classification", "WG Sub Classif"});
        textPresent("WG Sub Classification");
        logout();
        goToCdeByName("Specimen Block Received Count");
        textNotPresent("WG-TEST", By.id("dd_usedBy"));

        clickElement(By.id("classification_tab"));
        textNotPresent("WG Sub Classification");
    }


}
