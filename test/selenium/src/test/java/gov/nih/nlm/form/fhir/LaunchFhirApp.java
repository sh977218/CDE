package gov.nih.nlm.form.fhir;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.Test;

public class LaunchFhirApp extends NlmCdeBaseTest {

    // TODO Re-enable
//    @Test
//    public void launchFhirApp() {
//        String key = baseUrl.contains("dev-2")?"CDECI4":"CDECI3";
//
//        String appUrl = "https://sandbox.logicahealth.org/" + key + "/apps";
//
//        driver.get(appUrl);
//
//        findElement(By.cssSelector("input[name='username']")).sendKeys("verav77266@nwesmail.com");
//        findElement(By.cssSelector("input[name='password']")).sendKeys("koko123!");
//        clickElement(By.id("kc-login"));
//        textPresent("My Sandboxes");
//
//        hangon(5);
//
//        clickElement(By.xpath("//span[. = '" + key + "']"));
//
//        Actions action = new Actions(driver);
//        action.moveToElement(findElement(By.cssSelector("div[title='CDE Forms']"))).build().perform();
//
//        hangon(1);
//
//        clickElement(By.xpath("//div[@title='CDE Forms']//button[contains(., 'Launch')]"));
//        findElement(By.cssSelector("div.no-patient-button"));
//        hangon(1);
//        clickElement(By.cssSelector("div.no-patient-button"));
//        clickElement(By.xpath("//button[. = 'Launch without a patient']"));
//
//        switchTab(1);
//
//        try {
//            clickElement(By.cssSelector("input.btn-success"));
//        } catch (Exception e) {
//            // swallow because hspc auth seems to be hit or miss
//        }
//        clickElement(By.xpath("//button[contains(., 'Vital Signs')]"));
//        textPresent("Body Height");
//        textPresent("Body Weight");
//
//    }

}
