package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class ClassifyEmptyClassificationCdeTest extends BaseClassificationTest {
    @Test
    public void classifyEmptyClassificationCde() {
        String cde = "Empty Classification CDE";
        String[] categories = new String[]{"NINDS", "Domain", "Additional Instruments"};
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cde);
        goToClassification();
        textNotPresent("Additional Instruments");
        addClassificationMethod(categories);
        textPresent("Additional Instruments");
    }
}
