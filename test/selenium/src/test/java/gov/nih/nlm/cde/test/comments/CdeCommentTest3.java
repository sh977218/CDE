package gov.nih.nlm.cde.test.comments;

import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class CdeCommentTest3 extends CdeCommentTest {
        
    @Test
    public void cdeComments() {
        comments("Hospital Confidential Institution Referred From");
    }

    @Test(dependsOnMethods = {"cdeComments"})
    public void modifiedSinceAPI() {
        String response = get(baseUrl + "/api/cde/modifiedElements?from=2016-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"));
        Assert.assertTrue(response.contains("Hemf6zdy6o4"));
    }

    @Test
    public void orgAdminCanRemoveCdeComment() {
        orgAdminCanRemoveComment("Local Excision Colorectal Lateral Surgical Margin Identifier java.lang.Long", null);
    }

}
