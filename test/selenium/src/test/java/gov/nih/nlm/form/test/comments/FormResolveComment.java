package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormResolveComment extends NlmCdeBaseTest {

    @Test
    public void formResolveCommentTest() {
        String formName = "Antithrombotics and Risk Factor Controlling Medications";
        mustBeLoggedInAs(test_username, password);
        goToFormByName(formName);
        resolveComment("another comment about Naming");
    }

}
