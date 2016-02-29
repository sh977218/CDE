
package gov.nih.nlm.cde.test.comments;

import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class CdeCommentTest2 extends CdeCommentTest {
    @Test(priority = 2)
    public void siteAdminCanRemoveCdeComment() {
        siteAdminCanRemoveComment("Genbank", null);
    }

}
