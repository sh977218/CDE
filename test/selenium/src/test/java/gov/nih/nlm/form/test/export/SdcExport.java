package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class SdcExport extends NlmCdeBaseTest {

    @Test
    public void sdcXmlExport() {
        String response = get(baseUrl + "/form/XySUBn_NZ?type=xml&subtype=sdc").asString();

        Assert.assertTrue(response.contains("<FormDesign xmlns:sdc=\"http://healthIT.gov/sdc\""));
        Assert.assertTrue(response.contains("<Section title=\"CLINICAL\">"));
        Assert.assertTrue(response.contains("<ListItem title=\"Intact\"/>"));
        Assert.assertTrue(response.contains("<Question ID=\"XyEbt94V_\" title=\"Additional Dimension\">"));

    }

    @Test
    public void sdcRender() {
        mustBeLoggedInAs(reguser_username, password);
        goToFormByName("SDC Adrenal");
        clickElement(By.id("export"));
        clickElement(By.id("sdcExport"));
        switchTab(1);
        textPresent("PROMIS SF v1.0 - Phys. Function 10a");
        textPresent("Are you able to get on and off the toilet?");
        textPresent("Hormone production");
        findElement(By.cssSelector(".HeaderGroup .QuestionInSection input[name='7yN4tn_EW']"));
        textPresent("Distance from Closest Margin");

        switchTabAndClose(0);
    }

}
