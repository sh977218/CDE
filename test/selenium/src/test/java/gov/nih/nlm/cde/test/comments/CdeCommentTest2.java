
package gov.nih.nlm.cde.test.comments;

import org.testng.annotations.Test;

public class CdeCommentTest2 extends CdeCommentTest {
    @Test
    public void siteAdminCanRemoveCdeComment() {
        siteAdminCanRemoveComment("Genbank", null);
    }


}
