package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.common.test.CommentTest;
import org.testng.annotations.Test;

public class FormCommentTest extends CommentTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }
    
    @Test
    public void formComments() {
        comments("Risk Factor Questionnaire (RFQ) - Physical Activity and Sleep");
    }

    @Test
    public void orgAdminCanRemoveFormComment() {
        orgAdminCanRemoveComment("VA Toxicity Scale", null);
    }

    @Test
    public void siteAdminCanRemoveFormComment() {
        siteAdminCanRemoveComment("ER Destination", null);
    }

    @Test
    public void approvingCommentsForm() {
        approvingComments("Vital Signs and Tests", null);
    }  
}
