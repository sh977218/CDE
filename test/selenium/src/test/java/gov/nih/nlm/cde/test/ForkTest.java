package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class ForkTest extends NlmCdeBaseTest {

    void addFork(String changeNote, String org) {
        findElement(By.id("openCreateFork")).click();
        findElement(By.name("selection.changeNote")).sendKeys(changeNote);
        new Select(driver.findElement(By.id("selection.org"))).selectByVisibleText(org);
        findElement(By.id("submit")).click();
        modalGone();
        textNotPresent("This Element has no forks");
    }
    
    void addToCdeName(String toAdd) {
        findElement(By.xpath("//div[@id='nameEdit']//i")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys(toAdd);
        findElement(By.xpath("//div[@id='nameEdit']//button[text() = ' Confirm']")).click();
        newCdeVersion();
    }
    
}
