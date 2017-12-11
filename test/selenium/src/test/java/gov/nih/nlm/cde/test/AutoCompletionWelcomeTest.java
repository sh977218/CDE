package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AutoCompletionWelcomeTest extends NlmCdeBaseTest {

    @Test
    public void AutoCompletionWelcome() {
        goToSearch("cde");
        findElement(By.id("ftsearch-input")).sendKeys("ff broc");
        Assert.assertEquals(findElement(By.xpath("//div[@id='searchDiv']//ngb-highlight[1]")).getText(), "ffq broccoli");

        goToSearch("form");
        findElement(By.id("ftsearch-input")).sendKeys("prom iso");
        Assert.assertEquals(findElement(By.xpath("//div[@id='searchDiv']//ngb-highlight[1]")).getText(), "promis isolation");
    }

}