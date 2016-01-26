package gov.nih.nlm.cde.test;


import com.jayway.restassured.http.ContentType;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class ModifiedSinceTest extends NlmCdeBaseTest {


    @Test(dependsOnGroups = {"CdeEditTest"})
    public void modifiedSince() {
        String response = get(baseUrl + "/api/cde/modifiedElements?from=2016-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"));
        Assert.assertTrue(response.contains("7yLVoD71kl"));
    }

}
