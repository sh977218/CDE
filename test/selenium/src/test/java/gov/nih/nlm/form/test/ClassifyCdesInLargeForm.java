package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class ClassifyCdesInLargeForm extends NlmCdeBaseTest {

    @Test
    public void classifyCdesInLargeForm() {
        String formName = "VA Toxicity Scale";
        mustBeLoggedInAs("ctepOnlyCurator", password);

        goToFormByName(formName);
        goToClassification();
        _addClassificationByTree("CTEP", new String[]{"ABTC", "ABTC 0904"});

        // Verify
        String cdeName1 = "Veterans Affairs Toxicity Scale - gastrointenstinal problem often score";
        goToCdeByName(cdeName1);
        goToClassification();
        textPresent("ABTC");
        textPresent("ABTC 0904");
    }

}
