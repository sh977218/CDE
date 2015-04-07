package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class SdcExport extends NlmCdeBaseTest {

    @Test
    public void sdcExport() {
        goToFormByName("Apathy Scale (AS)");

        String url = findElement(By.id("sdcExport")).getAttribute("href");

        String response = get(url).asString();
        
        Assert.assertTrue(response.contains("<sdc:form_package xmlns:sdc=\"http://nlm.nih.gov/sdc/for\" xmlns:mfi13=\"http://www.iso.org/19763/13/2013\"><sdc:form_design><sdc:designation><sdc:Context>SDC Pilot Project</sdc:Context><sdc:sign acceptability=\"preferred\">Apathy Scale (AS)</sdc:sign>"));


    }


}
