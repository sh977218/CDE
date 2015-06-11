package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ForkMineMineTest extends ForkTest {

    @Test
    public void forkMineMine() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Other Group Patient Identifier Number");
        findElement(By.linkText("Forks")).click();
        textPresent("This Element has no forks");
        addFork("Fork will be retired", "CTEP");

        findElement(By.id("fork-0")).click();
        switchTab(1);
        textPresent("You are editing a fork");
        Assert.assertEquals("Incomplete", findElement(By.id("dd_status")).getText());
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Retired");
        findElement(By.id("saveRegStatus")).click();
        closeAlert();
        switchTabAndClose(0);
        findElement(By.id("accept_fork_0")).click();
        textPresent("Unable to accept. This fork may have been updated. Refresh page and try again.");
        closeAlert();
        driver.get(driver.getCurrentUrl());
        findElement(By.linkText("Forks")).click();
        textPresent("This Element has no forks");

        addFork("fork will be merged", "CTEP");
        findElement(By.id("fork-0")).click();
        switchTab(1);

        addToCdeName(" - FORKED");
        switchTabAndClose(0);

        driver.get(driver.getCurrentUrl());
        findElement(By.linkText("Forks")).click();
        findElement(By.id("accept_fork_0")).click();

        Assert.assertEquals("Other Group Patient Identifier Number - FORKED", findElement(By.id("dd_general_name")).getText());

        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("\"Other Group Patient Identifier Number\"");
        findElement(By.cssSelector("i.fa-search")).click();
        textPresent("1 results for");
        textPresent("Other Group Patient Identifier Number - FORK");
    }
}
