package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class ClassifyCdesInLargeForm extends NlmCdeBaseTest {

    @Test
    public void classifyCdesInLargeForm() {
        String formName = "Magnetic Resonance Spectroscopy (MRS)";
        mustBeLoggedInAs(ctepOnlyEditor, password);

        goToFormByName(formName);
        goToClassification();
        _addClassificationByTree("CTEP", new String[]{"ABTC", "ABTC 0904"});

        // Verify
        String cdeName1 = "Spectroscopy water suppression method oth";
        goToCdeByName(cdeName1);
        goToClassification();
        textPresent("ABTC");
        textPresent("ABTC 0904");
    }

}
