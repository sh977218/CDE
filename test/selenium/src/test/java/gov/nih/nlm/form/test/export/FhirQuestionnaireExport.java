package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class FhirQuestionnaireExport extends BaseFormTest {
    @Test
    public void odmExport() {
        mustBeLoggedInAs(reguser_username, password);
        String response = get(baseUrl + "/formById/5ade4d7f0dd7102890f863fb?subtype=fhirQuestionnaire").asString();
        String[] expectedResults = {
                "\"system\": \"http://localhost:3001/schema/form\"",
                "\"definition\": \"http://localhost:3001/deView?tinyId=c15vK97pK5X\"",
                "\"valueString\": \"Cannot evaluate\"",
                "\"linkId\": \"0-2\"",
                "\"question\": \"0-0\"",
        };
        for (String expectedResult : expectedResults) {
            Assert.assertTrue(response.contains(expectedResult), "missing: " + expectedResult + "\n Actual: \n " + response);
        }
        for (int i = 0; i < expectedResults.length - 2; i++) {
            String twoLines = expectedResults[i] + "\n" + expectedResults[i + 1];
            Assert.assertTrue(response.replaceAll("\\s+", "").contains(twoLines.replaceAll("\\s+", "")),
                    "missing: " + twoLines);
        }
    }
}
