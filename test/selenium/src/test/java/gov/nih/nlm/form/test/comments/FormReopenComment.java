package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormReopenComment extends NlmCdeBaseTest {

    @Test
    public void formResolveCommentTest() {
        String formName = "Brain Motor Control Assessment";
        mustBeLoggedInAs(test_username, password);
        goToFormByName(formName);
        reopenComment("This comment needs to reopen");
    }

}
