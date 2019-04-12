package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class LogoutCannotSeeCdeDraftTest extends NlmCdeBaseTest {

    @Test
    public void logoutCannotSeeCdeDraft() {
        String cdeName = "Draft Cde Test";
        goToCdeByName(cdeName);
        textNotPresent("Delete Draft");
    }

}
