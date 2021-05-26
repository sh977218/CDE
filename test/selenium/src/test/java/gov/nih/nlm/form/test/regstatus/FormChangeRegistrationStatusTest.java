package gov.nih.nlm.form.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormChangeRegistrationStatusTest extends NlmCdeBaseTest {
    @Test
    void formChangeRegistrationStatus() {
        String formName = "Form Status Test";
        mustBeLoggedInAs(ctepEditor_username, password);
        goToFormByName(formName);
        goToGeneralDetail();
        textPresent("Qualified");
        editRegistrationStatus("Recorded", "09/15/2013", "10/31/2014", "Admin Note 1", "Unresolved Issue 1");
        newFormVersion();

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToGeneralDetail();
        textPresent("Recorded");
        textPresent("09/15/2013");
        textPresent("10/31/2014");
        textPresent("Admin Note 1");
        textPresent("Unresolved Issue 1");
    }
}
