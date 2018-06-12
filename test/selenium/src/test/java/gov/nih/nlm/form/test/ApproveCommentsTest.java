package gov.nih.nlm.form.test;

import org.testng.annotations.Test;

public class ApproveCommentsTest extends FormCommentTest {

    @Test
    public void approveFormComments() {
        approveComments("Vital Signs and Tests", null, anonymousFormCommentUser_username);
    }

}
