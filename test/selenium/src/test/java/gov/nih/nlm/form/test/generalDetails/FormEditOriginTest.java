package gov.nih.nlm.form.test.generalDetails;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormEditOriginTest extends NlmCdeBaseTest {
    @Test
    public void formEditOrigin() {
        String formName = "Measures of Gas Exchange";
        String origin = "new origin";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToGeneralDetail();
        textNotPresent(origin);
        editOrigin(origin, false);
    }
}
