package gov.nih.nlm.form.fhir;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.Test;

public class LaunchFhirApp extends NlmCdeBaseTest {

    @Test
    public void launchFhirApp() {
        String appUrl = baseUrl.contains("dev-2")?"https://sandbox.hspconsortium.org/CDECI2/apps"
                :"https://sandbox.hspconsortium.org/CDECI1/apps";


        driver.get(appUrl);

        findElement(By.cssSelector("input[name='email']")).sendKeys("giyucado@web2mailco.com");
        findElement(By.cssSelector("input[name='password']")).sendKeys("koko123!");
        clickElement(By.xpath("//button/div/div/span[. = 'LogIn']"));
        textPresent("My Sandboxes");

        hangon(5);

        driver.get(appUrl);
        Actions action = new Actions(driver);
        action.moveToElement(findElement(By.cssSelector("div[title='CDE Forms']"))).build().perform();

        hangon(1);

        clickElement(By.xpath("//div[@title='CDE Forms']//button[contains(., 'Launch')]"));
        findElement(By.cssSelector("div.no-patient-button"));
        hangon(1);
        clickElement(By.cssSelector("div.no-patient-button"));

        switchTab(1);

        try {
            clickElement(By.cssSelector("input.btn-success"));
        } catch (Exception e) {
            // swallow because hspc auth seems to be hit or miss
        }
        clickElement(By.xpath("//button[contains(., 'Vital Signs')]"));
        textPresent("Body Height");
        textPresent("Body Weight");

    }

}
