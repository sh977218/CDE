package gov.nih.nlm.form.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormChangeRegistrationStatusTest extends NlmCdeBaseTest {
    @Test
    void cdeChangeRegistrationStatus() {
        String formName = "Form Status Test";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToFormByName(formName);
        textPresent("Qualified");
        editRegistrationStatus("Recorded", "09/15/2013", "10/31/2014", "Admin Note 1", "Unresolved Issue 1");
        textPresent("Data Element saved.");
        closeAlert();
        setLowStatusesVisible();
        goToFormByName(formName);

        textPresent("Recorded");
        textPresent("09/15/2013");
        textPresent("10/31/2014");
        textPresent("Admin Note 1");
        textPresent("Unresolved Issue 1");
    }
}
