package gov.nih.nlm.cde.test.api;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.get;

public class RetrieveForms extends NlmCdeBaseTest {

    @Test
    public void emptyFormList() {
        Assert.assertEquals(get(baseUrl + "/server/form/list/xyz").asString(), "[]");
    }

    @Test
    public void formListWithResults() {

        String response = get(baseUrl + "/server/form/list/7yxcZJrrte,QJW5Z1BrYl").asString();

        Assert.assertTrue(response.contains("AED Resistance Log"));
        Assert.assertTrue(response.contains("ALS Depression Inventory (ADI-12)"));

    }

}
