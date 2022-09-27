package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class CdeEditTest extends NlmCdeBaseTest {

    @Test
    public void editCdeSinceModified() {
        mustBeLoggedInAs(ctepEditor_username, password);
        String cdeName = "Mediastinal Lymph Node Physical Examination Specify";
        String cdeDesignationChange = "[designation change number 1]";
        String cdeDefinitionChange = "[definition change number 1]";
        goToCdeByName(cdeName);
        goToNaming();
        Assert.assertEquals(driver.getTitle(), "Data Element: " + cdeName);
        editDesignationByIndex(0, cdeDesignationChange, null);
        editDefinitionByIndex(0, cdeDefinitionChange, false);

        goToPermissibleValues();
        propertyEditText("uom", "myUom");
        newCdeVersion("Change note for change number 1");

        goToCdeByName(cdeName);
        textPresent(cdeDesignationChange);
        textPresent(cdeDefinitionChange);

        goToPermissibleValues();
        textPresent("myUom");

        goToIdentifiers();
        Assert.assertEquals(findElement(By.cssSelector("[itemprop='version']")).getText(), "1.1");

        // Test history
        goToHistory();
        textPresent(cdeName);
        textPresent("Change note for change number 1");
        selectHistoryAndCompare(1, 2);
        textPresent(cdeName + cdeDesignationChange, By.xpath("//*[@id='Designation_0']"));
        textPresent(cdeDefinitionChange, By.xpath("//*[@id='Definition_0']"));
        clickElement(By.id("closeHistoryCompareModal"));

        // View Prior Version
        clickElement(By.xpath("//*[@id='prior-1']//mat-icon[normalize-space() = 'open_in_new']"));
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

    @Test(dependsOnMethods = {"editCdeSinceModified"})
    public void modifiedSinceAPI() {
        String response = get(baseUrl + "/api/de/modifiedElements?from=2016-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"));
        Assert.assertTrue(response.contains("64YoxVrtASF"));
    }

    @Test
    public void modifiedSinceAPIWrongFormat() {
        get(baseUrl + "/api/de/modifiedElements?from=2016-25-01").then().statusCode(300);
    }


}
