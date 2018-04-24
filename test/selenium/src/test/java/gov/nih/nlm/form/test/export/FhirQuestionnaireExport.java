package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class FhirQuestionnaireExport extends BaseFormTest {
    @Test
    public void questionnaireExport() {
        mustBeLoggedInAs(reguser_username, password);
        String response = get(baseUrl + "/formById/590cc0da5b9fd620f835b547?subtype=fhirQuestionnaire").asString();
        String[] expectedResults = {
                "/schema/form",
                "/deView?tinyId=c15vK97pK5X",
                "\"valueString\":\"Female\"",
                "\"linkId\":\"0-2\"",
        };
        for (String expectedResult : expectedResults) {
            Assert.assertTrue(response.contains(expectedResult), "missing: " + expectedResult + "\n Actual: \n " + response);
        }
    }
}
