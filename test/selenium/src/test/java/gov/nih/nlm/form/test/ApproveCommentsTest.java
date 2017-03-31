
package gov.nih.nlm.form.test;

import org.testng.annotations.Test;

public class ApproveCommentsTest extends FormCommentTest {

    @Test
    public void approvingCommentsForm() {
        approvingComments("Vital Signs and Tests", null, anonymousFormCommentUser_username);
    }

}
