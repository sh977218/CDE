package gov.nih.nlm.form.test;

import org.testng.annotations.Test;


public class FormCommentTest2 extends FormCommentTest {
        
    @Test
    public void formComments() {
        comments("Risk Factor Questionnaire (RFQ) - Physical Activity and Sleep");
    }

    @Test
    public void orgAdminCanRemoveFormComment() {
        orgAdminCanRemoveComment("Form Comment Test", "Qualified");
    }

}
