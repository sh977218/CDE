package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ClassifyCdesInFormTest extends NlmCdeBaseTest {

    @Test
    public void classifyCdesInForm() {
        String formName = "History Data Source and Reliability";
        mustBeLoggedInAs("ctepOnlyCurator", password);

        goToFormByName(formName);
        clickElement(By.id("classification_tab"));
        _addClassificationByTree("CTEP", new String[]{"ABTC", "ABTC 0904"});

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
