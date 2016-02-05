package gov.nih.nlm.form.test;

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
        goToFormByName("SDC Adrenal");
        findElement(By.id("export")).click();
        switchTab(1);
        textPresent("Hormone production");
        findElement(By.cssSelector(".HeaderGroup .QuestionInSection input[name='7yN4tn_EW']"));
        textPresent("Distance from Closest Margin");
        switchTabAndClose(0);
    }

}
