package gov.nih.nlm.cde.test.generalDetails;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeEditOriginTest extends NlmCdeBaseTest {
    @Test
    public void cdeEditOrigin() {
        String cdeName = "Atherosclerosis Risk in Communities transient ischemic attack/stroke form (ARIC TIA) - speech loss slurred symptom indicator";
        String origin = "new origin";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToCdeSummary();
        textNotPresent(origin);
        editOrigin(origin, false);
    }
}
