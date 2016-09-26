package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ForkMineTheirsTest extends ForkTest {
    @Test
    public void forkMineTheirs() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Adverse Event Ongoing Event Indicator");

        // can't edit.
        assertNoElt(By.xpath("//dd[@id='dd_general_name']//i[@class='fa fa-edit']"));

        showAllTabs();
        clickElement(By.id("forks_tab"));
        hangon(1);
        addFork("forking a st cde", "CTEP");

        clickElement(By.id("fork-0"));
        switchTab(1);
        textPresent("You are editing a fork");

        addToCdeName(" - ST FORKED");
        switchTabAndClose(0);

        driver.get(driver.getCurrentUrl());
        showAllTabs();
        clickElement(By.id("forks_tab"));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("accept_fork_0")));

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Adverse Event Ongoing Event Indicator");
        showAllTabs();
        clickElement(By.id("forks_tab"));
        clickElement(By.id("accept_fork_0"));
        textPresent("Fork merged");

        Assert.assertEquals("Adverse Event Ongoing Event Indicator - ST FORKED", findElement(By.id("dd_general_name")).getText());
        Assert.assertEquals("Standard", findElement(By.id("dd_status")).getText());
        waitForESUpdate();
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("\"Adverse Event Ongoing Event Indicator\"");
        clickElement(By.cssSelector("i.fa-search"));
        textPresent("1 results for");
        textPresent("Adverse Event Ongoing Event Indicator - ST FORKED");
    }
}
