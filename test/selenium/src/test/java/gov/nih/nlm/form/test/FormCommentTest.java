package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.common.test.CommentTest;

public class FormCommentTest extends CommentTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name, status);
    }

    @Override
    public void goToEltSearch() {
        goToFormSearch();
    }
}
