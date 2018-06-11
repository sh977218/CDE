package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class ForkTest extends NlmCdeBaseTest {

    void addFork(String changeNote, String org) {
        clickElement(By.id("openCreateFork"));
        findElement(By.name("selection.changeNote")).sendKeys(changeNote);
        new Select(driver.findElement(By.id("selection.org"))).selectByVisibleText(org);
        clickElement(By.id("submit"));
        modalGone();
        textNotPresent("This Element has no forks");
    }

    void addToCdeName(String toAdd) {
        goToNaming();
        clickElement(By.cssSelector("#dd_name_0 i"));
        findElement(By.cssSelector("#dd_name_0 input")).sendKeys(toAdd);
        clickElement(By.cssSelector("#dd_name_0 .fa-check"));
        newCdeVersion();
    }

}
