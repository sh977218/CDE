package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.common.test.CommentTest;
import org.testng.annotations.Test;

public class FormCommentTest extends CommentTest {

    @Override
    public void goToEltByName(String name) {
        goToFormByName(name);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }
    
    @Test
    public void formComments() {
        comments("Skin Cancer Patient");
    }

    @Test
    public void orgAdminCanRemoveFormComment() {
        orgAdminCanRemoveComment("Form Comment Test");
    }

    @Test
    public void siteAdminCanRemoveFormComment() {
        siteAdminCanRemoveComment("Form Property Test");
    }

}
