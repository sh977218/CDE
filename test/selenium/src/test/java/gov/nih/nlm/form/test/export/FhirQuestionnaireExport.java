package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class FhirQuestionnaireExport extends BaseFormTest {
    @Test
    public void questionnaireExport() {
        mustBeLoggedInAs(reguser_username, password);
        hangon(5);
        String response = get(baseUrl + "/formById/58497234bb2d48e00466acd7?subtype=fhirQuestionnaire").asString();
        hangon(5);
        String[] expectedResults = {
                "/schema/form",
                "/deView?tinyId=OtsN78xANu1",
                "\"valueString\":\"Unknown\"",
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
