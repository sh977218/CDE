package gov.nih.nlm.cde.test;


import com.jayway.restassured.http.ContentType;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class MiscTests extends NlmCdeBaseTest {

    @Test
    public void gridView() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-AECC"));
        hangon(2);
        clickElement(By.id("cde_gridView"));
        textPresent("Pathologic N Stage");
        textPresent("If No, specify reason for ");
        textPresent("AE Ongoing?");
        textPresent("Patient DOB");
        textPresent("pN0");
        textPresent("pN1");
        textPresent("Not Hispanic or Latino");
        textPresent("Hispanic or Latino");
        textPresent("American Indian or Alaska Native");
        textPresent("Female");
        textPresent("3436564");
        textPresent("2182832");
        textPresent("2746311");
        textPresent("2192217");
        textPresent("NHLBI");
        textPresent("SPOREs");
        textPresent("NICHD");
        clickElement(By.id("cde_accordionView"));
        textNotPresent("Pathologic N Stage");
        textNotPresent("If No, specify reason for ");
        textNotPresent("AE Ongoing?");
        textNotPresent("Patient DOB");
        textNotPresent("pN0");
        textNotPresent("pN1");
        textNotPresent("Not Hispanic or Latino");
        textNotPresent("Hispanic or Latino");
        textNotPresent("American Indian or Alaska Native");
        textNotPresent("Female");
        textNotPresent("3436564");
        textNotPresent("2182832");
        textNotPresent("2746311");
        textNotPresent("2192217");
        textNotPresent("NHLBI");
        textNotPresent("SPOREs");
        textNotPresent("NICHD");
    }


    @Test
    public void checkTicketValid() {

        // Test to make sure user isn't logged in
        String response = get(baseUrl + "/user/me").asString();
        Assert.assertEquals("Not logged in.", response);

        // Provide fake ticket and make sure user info is retrieved
        response = get(baseUrl + "/user/me?ticket=valid").asString();
        get(baseUrl + "/user/me?ticket=valid").then().assertThat().contentType(ContentType.JSON);
        Assert.assertTrue(response.contains("_id"));
        Assert.assertTrue(response.contains("ninds"));
    }

    @Test
    public void checkTicketInvalid() {

        // Test to make sure user isn't logged in
        String response = get(baseUrl + "/user/me").asString();
        Assert.assertEquals("Not logged in.", response);

        // Provide fake invalid ticket and make sure user info is NOT retrieved
        response = get(baseUrl + "/user/me?ticket=invalid").asString();
        Assert.assertEquals("Not logged in.", response);
    }

    @Test
    public void checkConnectionTimeout() {

        // Make sure ticket validation times out
        String response = get(baseUrl + "/user/me?ticket=timeout4").asString();
        Assert.assertEquals("Not logged in.", response);

        // Make sure ticket validation doesn't times out
        response = get(baseUrl + "/user/me?ticket=timeout1").asString();
        get(baseUrl + "/user/me?ticket=valid").then().assertThat().contentType(ContentType.JSON);
        Assert.assertTrue(response.contains("_id"));
        Assert.assertTrue(response.contains("ninds"));
    }


    @Test
    public void leavePageWarning() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Intra-arterial Catheter Patient Not Administered Reason");
        clickElement(By.xpath("//*[@id = 'dd_def']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change number 1]");
        clickElement(By.xpath("//*[@id='dd_def']//button[contains(@class,'fa fa-check')]"));

        clickElement(By.linkText("CDEs"));
        shortWait.until(ExpectedConditions.alertIsPresent());
        Alert alert = driver.switchTo().alert();
        Assert.assertTrue(alert.getText().contains("are you sure you want to leave"));
        alert.dismiss();

        clickElement(By.linkText("CDEs"));
        shortWait.until(ExpectedConditions.alertIsPresent());
        alert = driver.switchTo().alert();
        Assert.assertTrue(alert.getText().contains("are you sure you want to leave"));
        alert.accept();
        textPresent("Browse by classification");
    }

}
