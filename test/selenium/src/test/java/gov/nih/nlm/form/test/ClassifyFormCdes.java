package gov.nih.nlm.form.test.properties.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ClassifyFormCdes extends NlmCdeBaseTest {

    @Test
    public void classifyFormCdes() {
        mustBeLoggedInAs("ctepOnlyCurator", password);

        goToFormByName("History Data Source and Reliability");
        clickElement(By.id("classification_tab"));
        clickElement(By.id("classifyAllCdes"));
        clickElement(By.cssSelector("[id='addClassification-ABTC'] span.fake-link"));
        clickElement(By.cssSelector("[id='addClassification-ABTC 0904'] button"));

        // Verify
        goToCdeByName("Data source");
        clickElement(By.id("classification_tab"));
        textPresent("ABTC");
        textPresent("ABTC 0904");

        goToCdeByName("History data reliability type");
        clickElement(By.id("classification_tab"));
        textPresent("ABTC");
        textPresent("ABTC 0904");
    }

}
