package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ForkMineMineTest extends ForkTest {

    @Test
    @RecordVideo
    public void forkMineMine() {
        System.out.println("Number of tabs before forkMineMine" + driver.getWindowHandles().size());
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Other Group Patient Identifier Number");
        showAllTabs();
        clickElement(By.id("forks_tab"));
        textPresent("This element has no forks");
        addFork("Fork will be retired", "CTEP");

        clickElement(By.id("fork-0"));
        switchTab(1);
        textPresent("You are editing a fork");
        Assert.assertEquals("Incomplete", findElement(By.id("dd_status")).getText());
        showAllTabs();
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Retired");
        clickElement(By.id("saveRegStatus"));
        closeAlert();
        switchTabAndClose(0);
        clickElement(By.id("accept_fork_0"));
        textPresent("Unable to accept. This fork may have been updated. Refresh page and try again.");
        closeAlert();
        driver.get(driver.getCurrentUrl());
        showAllTabs();
        clickElement(By.id("forks_tab"));
        textPresent("This element has no forks");

        addFork("fork will be merged", "CTEP");
        clickElement(By.id("fork-0"));
        switchTab(1);

        addToCdeName(" - FORKED");
        switchTabAndClose(0);

        driver.get(driver.getCurrentUrl());
        showAllTabs();
        clickElement(By.id("forks_tab"));
        clickElement(By.id("accept_fork_0"));

        Assert.assertEquals("Other Group Patient Identifier Number - FORKED", findElement(By.id("dd_general_name")).getText());

        waitForESUpdate();

        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("\"Other Group Patient Identifier Number\"");
        clickElement(By.cssSelector("i.fa-search"));
        textPresent("1 results for");
        textPresent("Other Group Patient Identifier Number - FORK");
    }
}
