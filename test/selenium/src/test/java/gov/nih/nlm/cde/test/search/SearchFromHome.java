package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SearchFromHome extends NlmCdeBaseTest {

    @Test
    public void searchCdesFromHome() {
        goHome();
        findElement(By.xpath("//input[@placeholder='Search CDEs']"));
        findElement(By.id("ftsearch-input")).sendKeys("Height Measurement");
        clickElement(By.id("search.submit"));
        textPresent("Height Measurement Feet");
    }

    @Test
    public void searchFormsFromHome() {
        goHome();
        findElement(By.xpath("//input[@placeholder='Search CDEs']"));
        clickElement(By.xpath("//mat-icon[. = 'keyboard_arrow_down']"));
        clickElement(By.xpath("//button/span[. = 'Forms']"));
        findElement(By.xpath("//input[@placeholder='Search Forms']"));
        findElement(By.id("ftsearch-input")).sendKeys("Blood Pressure");
        clickElement(By.id("search.submit"));
        textPresent("Vital Signs");
    }

}
