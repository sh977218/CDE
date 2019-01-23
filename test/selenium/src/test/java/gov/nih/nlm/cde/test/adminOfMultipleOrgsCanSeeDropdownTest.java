package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class adminOfMultipleOrgsCanSeeDropdownTest extends BaseClassificationTest {

    @Test
    public void adminOfMultipleOrgsCanSeeDropdown() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        gotoClassificationMgt();
        clickElement(By.xpath("//mat-icon[normalize-space() = 'transform']"));
        clickElement(By.cssSelector("mat-select"));
        selectMatSelectDropdownByText("caBIG");
        textPresent("caNanoLab");
        clickElement(By.id("cancelNewClassifyItemBtn"));
    }

}
