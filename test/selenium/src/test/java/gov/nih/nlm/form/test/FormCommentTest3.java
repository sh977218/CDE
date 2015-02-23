
package gov.nih.nlm.form.test;

import org.testng.annotations.Test;

public class FormCommentTest3 extends FormCommentTest {
    @Test
    public void siteAdminCanRemoveFormComment() {
        siteAdminCanRemoveComment("STOP Questionnaire", null);
    }

    @Test
    public void approvingCommentsForm() {
        approvingComments("Vital Signs and Tests", null, anonymousFormCommentUser_username);
    }    
}
