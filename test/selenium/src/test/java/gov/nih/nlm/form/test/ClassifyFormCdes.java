package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ClassifyFormCdes extends BaseClassificationTest {

    @Test
    public void classifyFormCdes() {
        mustBeLoggedInAs("ctepOnlyCurator", password);

        goToFormByName("History Data Source and Reliability");
        clickElement(By.id("classification_tab"));
        clickElement(By.id("openClassifyCdesModalBtn"));
        _classifyCdesMethod(new String[]{"CTEP", "ABTC", "ABTC 0904"});

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
