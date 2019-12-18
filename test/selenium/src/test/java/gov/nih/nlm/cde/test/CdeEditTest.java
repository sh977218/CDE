package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class CdeEditTest extends NlmCdeBaseTest {

    @Test
    public void editCde() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Mediastinal Lymph Node Physical Examination Specify";
        String cdeDesignationChange = "[designation change number 1]";
        String cdeDefinitionChange = "[definition change number 1]";
        goToCdeByName(cdeName);
        goToNaming();
        Assert.assertEquals(driver.getTitle(), "Data Element: " + cdeName);
        editDesignationByIndex(0, cdeDesignationChange,null);
        editDefinitionByIndex(0, cdeDefinitionChange, false);

        goToPermissibleValues();
        clickElement(By.xpath("//*[@id = 'uom']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.xpath("//*[@id = 'uom']//input")).sendKeys("myUom");
        clickElement(By.xpath("//*[@id = 'uom']//button/mat-icon[normalize-space() = 'check']"));
        textPresent("myUom", By.id("uom"));

        newCdeVersion("Change note for change number 1");

        goToCdeByName(cdeName);
        textPresent(cdeDesignationChange);
        textPresent(cdeDefinitionChange);

        goToPermissibleValues();
        textPresent("myUom");

        goToIdentifiers();
        Assert.assertEquals("1.1", findElement(By.id("dd_version_nlm")).getText());

        // Test history
        goToHistory();
        textPresent(cdeName);
        textPresent("Change note for change number 1");
        selectHistoryAndCompare(1, 2);
        textPresent(cdeName + cdeDesignationChange, By.xpath("//*[@id='Designation_0']"));
        textPresent(cdeDefinitionChange, By.xpath("//*[@id='Definition_0']"));
        clickElement(By.id("closeHistoryCompareModal"));

        // View Prior Version
        clickElement(By.xpath("//*[@id='prior-1']//mat-icon[normalize-space() = 'visibility']"));
        switchTab(1);
        textPresent("Warning: this data element is archived.");
        clickElement(By.linkText("view the current version here"));
        textPresent(cdeDesignationChange);
        textPresent(cdeDefinitionChange);

        goToPermissibleValues();
        textPresent("myUom");

        // CDE Audit
        openAuditDataElement(cdeName);
        textPresent(cdeName + cdeDesignationChange);
        textPresent("the free text field to specify the other type of mediastinal lymph node dissection." + cdeDefinitionChange);

        switchTabAndClose(0);
    }

    @Test(dependsOnMethods = {"editCde"})
    public void modifiedSinceAPI() {
        String response = get(baseUrl + "/server/cde/api/cde/modifiedElements?from=2016-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"));
        Assert.assertTrue(response.contains("64YoxVrtASF"));
    }

    @Test
    public void modifiedSinceAPIWrongFormat() {
        get(baseUrl + "/server/cde/api/cde/modifiedElements?from=2016-25-01").then().statusCode(300);
    }


}
