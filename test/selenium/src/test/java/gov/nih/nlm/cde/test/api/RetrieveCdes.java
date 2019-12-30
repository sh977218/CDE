package gov.nih.nlm.cde.test.api;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.get;

public class RetrieveCdes extends NlmCdeBaseTest {

    @Test
    public void emptyList() {
        Assert.assertEquals(get(baseUrl + "/server/de/list/xyz").asString(), "[]");
    }

    @Test
    public void viewByVersion() {
        Assert.assertTrue(get(baseUrl + "/deView?tinyId=x&version=y")
                .asString().contains("<title>NIH Common Data Elements (CDE) Repository</title>"));
    }

}
