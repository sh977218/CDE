package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PageNotFound extends NlmCdeBaseTest {

    @Test
    public void pageNotFound () {
        driver.get(baseUrl + "/abc");
        findElement(By.xpath("//img[contains (., '404 - We could not']"));

        driver.get(baseUrl + "/deView?tinyId=abc");
        findElement(By.xpath("//img[contains (., '404 - We could not']"));

    }

}
