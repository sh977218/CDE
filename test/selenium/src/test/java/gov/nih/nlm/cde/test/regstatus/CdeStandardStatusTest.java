package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;

public class CdeStandardStatusTest extends NlmCdeBaseTest {

    protected void adminCantEditStandardCde(String cdeName) {
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeByName(cdeName);
        // CDE is Standard.

        // Can't edit name, def or status
        assertNoElt(By.xpath("//dd[@id='dd_general_name']//i[@class='fa fa-edit']"));
        assertNoElt(By.xpath("//dd[@id='dd_def']//i[@class='fa fa-edit']"));
        assertNoElt(By.xpath("//dd[@id='dd_status']//i[@class='fa fa-edit']"));

        // Can't edit Value Type or add / remove pv
        String prefix = "//*[@id='permissibleValueDiv']//*[@id='";
        String postfix = "']";
        goToPermissibleValues();
        textPresent("Values Allowed");

        findElement(By.cssSelector("#datatypeSelect select[disabled]"));

        Assert.assertEquals(findElements(By.xpath("//td[contains(@id, 'pvAction') and not(*)]")).size(), 3);

        findElement(By.xpath("//*[@id='pvValue_1'][not(//i[contains(@class, 'fa-edit')])]"));

        findElement(By.xpath("//div[not(//button[@id = 'openAddPermissibleValueModelBtn'])]"));
        findElement(By.xpath("//div[not(//a[@id = 'updateOIDBtn'])]"));

        // Can't edit naming
        goToNaming();
        findElement(By.xpath("//*[@id='designation_0' and not(//i[contains(@class, 'fa-edit')])]"));
        findElement(By.xpath("//*[@id='definition_0' and not(//i[contains(@class, 'fa-edit')])]"));
        Assert.assertFalse(driver.findElements(By.xpath("//*[@id='tags_0']//input")).get(0).isEnabled());

        // Can edit classifications
        goToClassification();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("openClassificationModalBtn")));

        // Can't edit Concepts
        goToConcepts();
        assertNoElt(By.id("removeobjectClass-0"));
        assertNoElt(By.id("removeproperty-0"));

        // Can't add Attachments
        goToAttachments();
        assertNoElt(By.cssSelector("i.fa-upload"));
    }


}
