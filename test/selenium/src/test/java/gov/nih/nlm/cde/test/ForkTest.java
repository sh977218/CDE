package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ForkTest extends NlmCdeBaseTest {
    
    private void addFork(String changeNote) {
        findElement(By.id("openCreateFork")).click();
        modalHere();
        findElement(By.name("selection.changeNote")).sendKeys(changeNote);
        findElement(By.id("submit")).click();
        modalGone();
        textNotPresent("This Element has no forks");
    }
    
    private void addToCdeName(String toAdd) {
        findElement(By.xpath("//div[@id='nameEdit']//i")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys(toAdd);
        findElement(By.xpath("//div[@id='nameEdit']//button[text() = ' Confirm']")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        saveCde();
    }
    
    @Test
    public void forkMineTheirs() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Adverse Event Ongoing Event Indicator");
        
        // can't edit.
        Assert.assertEquals(driver.findElements(By.xpath("//dd[@id='dd_general_name']//i[@class='fa fa-edit']")).size(), 0);

        findElement(By.linkText("Forks")).click();
        addFork("forking a st cde");

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
        findElement(By.id("ftsearch-input")).sendKeys("\"Adverse Event Ongoing Event Indicator\"");
        findElement(By.cssSelector("i.fa-search")).click();
        textPresent("1 results for");
        textPresent("Adverse Event Ongoing Event Indicator - ST FORKED");       

        
    }
    
    @Test
    public void forkMineMine() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Other Group Patient Identifier Number");
        findElement(By.linkText("Forks")).click();
        textPresent("This Element has no forks");
        addFork("Fork will be retired");
        
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

        addFork("fork will be merged");
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
