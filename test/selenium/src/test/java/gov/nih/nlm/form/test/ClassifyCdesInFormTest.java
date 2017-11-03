package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ClassifyCdesInFormTest extends NlmCdeBaseTest {

    @Test
    public void classifyCdesInForm() {
        String formName = "History Data Source and Reliability";
        mustBeLoggedInAs("ctepOnlyCurator", password);

        goToFormByName(formName);
        goToClassification();
        _addClassificationByTree("CTEP", new String[]{"ABTC", "ABTC 0904"});

        // Verify
        String cdeName1 = "Data source";
        goToCdeByName(cdeName1);
        goToClassification();
        textPresent("ABTC");
        textPresent("ABTC 0904");

        String cdeName2 = "History data reliability type";
        goToCdeByName(cdeName2);
        goToClassification();
        textPresent("ABTC");
        textPresent("ABTC 0904");
    }

}
