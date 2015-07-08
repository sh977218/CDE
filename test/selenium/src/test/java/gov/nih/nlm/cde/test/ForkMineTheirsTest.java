package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ForkMineTheirsTest extends ForkTest {
    @Test
    public void forkMineTheirs() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Adverse Event Ongoing Event Indicator");

        // can't edit.
        Assert.assertEquals(driver.findElements(By.xpath("//dd[@id='dd_general_name']//i[@class='fa fa-edit']")).size(), 0);

        findElement(By.linkText("Forks")).click();
        addFork("forking a st cde", "CTEP");

        findElement(By.id("fork-0")).click();
        switchTab(1);
        textPresent("You are editing a fork");

        addToCdeName(" - ST FORKED");
        switchTabAndClose(0);

        driver.get(driver.getCurrentUrl());
        findElement(By.linkText("Forks")).click();
        Assert.assertFalse(driver.findElement(By.id("accept_fork_0")).isDisplayed());

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Adverse Event Ongoing Event Indicator");
        findElement(By.linkText("Forks")).click();
        findElement(By.id("accept_fork_0")).click();
        textPresent("Fork merged");

        Assert.assertEquals("Adverse Event Ongoing Event Indicator - ST FORKED", findElement(By.id("dd_general_name")).getText());
        Assert.assertEquals("Standard", findElement(By.id("dd_status")).getText());

        goToCdeSearch();
        waitForESUpdate();
        findElement(By.id("ftsearch-input")).sendKeys("\"Adverse Event Ongoing Event Indicator\"");
        findElement(By.cssSelector("i.fa-search")).click();
        textPresent("1 results for");
        textPresent("Adverse Event Ongoing Event Indicator - ST FORKED");
    }
}
