package gov.nih.nlm.form.test;

import org.testng.annotations.Test;

public class SiteAdminFormCommentTest extends FormCommentTest {

    @Test
    public void siteAdminCanRemoveFormComment() {
        siteAdminCanRemoveComment("STOP Questionnaire", null);
    }

}
