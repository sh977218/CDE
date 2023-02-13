package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;

public class CdeStandardStatusTest extends NlmCdeBaseTest {

    void adminCantEditStandardCde(String cdeName) {
        mustBeLoggedInAs(cabigEditor_username, password);
        goToCdeByName(cdeName);
        // CDE is Standard.

        // Can't edit status or name
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath(xpathRegistrationStatusEditable())));
        goToNaming();
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//mat-icon[. = 'edit']")));

        // Can't edit Value Type or add / remove pv
        goToDataTypeDetails();

        checkElementDoesNotExistByLocator(By.xpath("//*[@itemprop='datatype']//input[not(@disabled)]"));

        Assert.assertTrue(findElements(By.xpath("//td[contains(@id, 'pvAction') and not(*)]")).size() > 0);

        findElement(By.xpath("//*[@id='pvValue_1'][not(//mat-icon[contains(., 'edit')])]"));

        findElement(By.xpath("//div[not(//button[@id = 'openAddPermissibleValueModelBtn'])]"));
        findElement(By.xpath("//div[not(//a[@id = 'updateOIDBtn'])]"));

        // Can't edit naming
        goToNaming();
        findElement(By.xpath("//*[@itemprop='designation_0' and not(//mat-icon[contains(., 'edit')])]"));
        findElement(By.xpath("//*[@itemprop='definition_0' and not(//mat-icon[contains(., 'edit')])]"));
        checkElementDoesNotExistByLocator(By.xpath("//*[@id='tags_0']//input"));

        // can classify
        goToClassification();
        findElement(By.id("openClassificationModalBtn"));

        // Can't edit Concepts
        goToConcepts();
        assertNoElt(By.id("removeobjectClass-0"));
        assertNoElt(By.id("removeproperty-0"));

        // Can't add Attachments
        goToAttachments();
        assertNoElt(By.xpath("mat-icon[contains(., 'cloud_upload')]"));
        logout();

        // Can edit classifications
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeByName(cdeName);
        goToClassification();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("openClassificationModalBtn")));
    }


}
