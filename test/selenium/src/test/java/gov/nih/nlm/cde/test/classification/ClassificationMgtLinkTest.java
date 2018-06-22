package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class ClassificationMgtLinkTest extends NlmCdeBaseTest {

    @Test
    public void classificationMgtLink() {
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        textPresent("Headache");
    }
}
