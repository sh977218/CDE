package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class Compare2Test extends NlmCdeBaseTest {

    @Test
    public void compareMeWithMlt() {
        goToCdeByName("Common Toxicity Criteria Adverse Event Iron Excess Grade");
        findElement(By.linkText("More Like This")).click();
        findElement(By.id("compareMe")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compareMe")));
        findElement(By.linkText("Common Toxicity Criteria Adverse Event Platelet Count Grade")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("compare_0")));
        findElement(By.id("compare_0")).click();
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compare_0")));
        findElement(By.linkText("Quick Board ( 2 )")).click();
        wait.until(ExpectedConditions.elementToBeClickable(By.id("qb.compare")));
        // IDK why sometimes the following click doesn't seem to work. Wait above should be enough, but no.
        hangon(1);
        clickElement(By.id("qb.compare"));
        textPresent("in CTC category Blood/Bone Marrow");
        textPresent("CTC Adverse Event Platelets Grade");
    }

    @Test
    public void cantEditInCompare() {
        mustBeLoggedInAs(ctepCurator_username, password);
        addToCompare("Person Birth Date", "Patient Ethnic Group Category");
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("editStatus")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("addNamePair")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//a[@title='Remove']")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("fa-edit")));

    }
}
