package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SearchFromHome extends NlmCdeBaseTest {

    @Test
    public void searchCdesFromHome() {
        goHome();
        clickElement(By.xpath("//button[normalize-space()='Search All CDEs']"));
        findElement(By.xpath("//input[@placeholder='Search by topic, keyword, or organization']")).sendKeys("Height Measurement");
        clickElement(By.id("search.submit"));
        textPresent("Height Measurement Feet");
    }

    @Test
    public void searchFormsFromHome() {
        goHome();
        clickElement(By.xpath("//button[contains(.,'Search Forms')]"));
        findElement(By.xpath("//button[contains(.,'Search Forms')][contains(@class,'active')]"));
        findElement(By.xpath("//input[@placeholder='Search by topic, keyword, or organization']")).sendKeys("Blood Pressure");
        clickElement(By.id("search.submit"));
        textPresent("Vital Signs");
    }

}
