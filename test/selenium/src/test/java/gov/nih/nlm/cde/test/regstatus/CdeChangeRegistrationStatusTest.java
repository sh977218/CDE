package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeChangeRegistrationStatusTest extends NlmCdeBaseTest {
    @Test
    void cdeChangeRegistrationStatus() {
        String cdeName = "Investigator Identifier java.lang.Integer";
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeByName(cdeName);
        textPresent("Qualified");
        editRegistrationStatus("Recorded", "09/15/2013", "10/31/2014", "Admin Note 1", "Unresolved Issue 1");
        newCdeVersion();
        setLowStatusesVisible();
        goToCdeByName(cdeName);

        textPresent("Recorded");
        textPresent("09/15/2013");
        textPresent("10/31/2014");
        textPresent("Admin Note 1");
        textPresent("Unresolved Issue 1");
    }
}
