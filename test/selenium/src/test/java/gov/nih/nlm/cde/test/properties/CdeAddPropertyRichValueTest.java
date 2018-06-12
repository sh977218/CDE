package gov.nih.nlm.cde.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeAddPropertyRichValueTest extends NlmCdeBaseTest {

    @Test
    public void cdeAddPropertyRichValue() {
        String cdeName = "Vision (aura) typical symptom type";
        String key = "Great CTX";
        String value = "New <b>Value</b>";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToProperties();
        addNewProperty(key, value, true);
        newCdeVersion();

        goToCdeByName(cdeName);
        goToProperties();
        textPresent("New Value");
    }

}
