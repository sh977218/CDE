
package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class AssignVsacIdTest extends NlmCdeBaseTest {
    @Test
    public void assignVsacId() {
        String cdeName = "Patient Ethnic Group Category";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        textPresent("No Value Set specified.");
        clickElement(By.id("updateOIDBtn"));
        findElement(By.name("vsacId")).sendKeys("invalidId");
        clickElement(By.id("vsacIdCheck"));
        checkAlert("Error: No data retrieved from VSAC for invalidId");
        scrollToViewById("updateOIDBtn");
        clickElement(By.id("updateOIDBtn"));
        findElement(By.name("vsacId")).clear();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.837");
        clickElement(By.id("vsacIdCheck"));
        // check that version got fetched.
        textPresent("2135-2");
        textPresent("2186-5");
        newCdeVersion("Adding vsac Id");

        textPresent("Latest");
        textPresent("2135-2");
        textPresent("CDCREC");
        WebElement tbody = driver.findElement(By.id("vsacTableBody"));
        List<WebElement> vsacLines = tbody.findElements(By.tagName("tr"));
        Assert.assertEquals(vsacLines.size(), 3);
        textPresent("Match");
    }

}