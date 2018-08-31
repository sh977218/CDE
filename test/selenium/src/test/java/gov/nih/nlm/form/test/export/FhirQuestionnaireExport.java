package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class FhirQuestionnaireExport extends BaseFormTest {
    @Test
    public void questionnaireExport() {
        mustBeLoggedInAs(reguser_username, password);
        String response = get(baseUrl + "/formById/58497234bb2d48e00466acd7?subtype=fhirQuestionnaire").asString();
        String[] expectedResults = {
                "/deView?tinyId=OtsN78xANu1",
                "{\"valueCoding\":{\"code\":\"Unknown\",\"userSelected\":false}",
                "\"linkId\":\"0-2\"",
                "\"enableWhen\":[",
                "\"hasAnswer\":false"
        };
        for (String expectedResult : expectedResults) {
            Assert.assertTrue(response.contains(expectedResult), "missing: " + expectedResult + "\n Actual: \n " + response);
        }

        String responseValidate = get(baseUrl + "/formById/58497234bb2d48e00466acd7?subtype=fhirQuestionnaire&validate").asString();
        String[] expectedResultsValidate = {
                "\"valid\":true"
        };
        for (String expectedResult : expectedResultsValidate) {
            Assert.assertTrue(responseValidate.contains(expectedResult), "missing: " + expectedResult + "\n Actual: \n " + responseValidate);
        }
    }
}
