package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class OriginalSource extends NlmCdeBaseTest {

    @Test
    public void originalSourceCde() {

        driver.get(baseUrl + "/deView?tinyId=QkIo3YfIyX");
        textPresent("Raw Artifact", By.id("sources_1"));


        textNotPresent("Raw Artifact", By.id("sources_0"));

        String response = get(baseUrl + "/originalSource/cde/NINDS/QkIo3YfIyX").asString();
        Assert.assertTrue(response.contains("Several days"));

    }

}
