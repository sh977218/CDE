package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeChangeRegistrationStatusTest extends NlmCdeBaseTest {
    @Test
    void cdeChangeRegistrationStatus() {
        String cdeName = "Investigator Identifier java.lang.Integer";
        mustBeLoggedInAs(cabigEditor_username, password);
        goToCdeByName(cdeName);
        textPresent("Qualified");
        editRegistrationStatus("Recorded", "09152013", "10312014", "Admin Note 1", "Unresolved Issue 1");
        newCdeVersion();
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);

        textPresent("Recorded");
        textPresent("09/15/2013");
        textPresent("10/31/2014");
        textPresent("Admin Note 1");
        textPresent("Unresolved Issue 1");
    }
}
