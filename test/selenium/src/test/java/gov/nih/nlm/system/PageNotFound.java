package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PageNotFound extends NlmCdeBaseTest {

    @Test
    public void pageNotFound () {
        driver.get(baseUrl + "/abc");
        findElement(By.xpath("//h1[contains(., '404 Page Not Found')]"));

        driver.get(baseUrl + "/deView?tinyId=abc");
        findElement(By.xpath("//h1[contains(., '404 Page Not Found')]"));
    }

}
