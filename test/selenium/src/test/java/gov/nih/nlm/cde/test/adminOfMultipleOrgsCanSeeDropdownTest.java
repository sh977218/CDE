package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class adminOfMultipleOrgsCanSeeDropdownTest extends BaseClassificationTest {

    @Test
    public void adminOfMultipleOrgsCanSeeDropdown() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        gotoClassificationMgt();
        clickElement(By.cssSelector("mat-select"));
        selectMatSelectDropdownByText("caBIG");
        textPresent("caNanoLab");
        clickElement(By.xpath("(//mat-icon[normalize-space() = 'more_vert'])[1]"));
        clickElement(By.xpath("//mat-icon[normalize-space() = 'transform']"));
        clickElement(By.id("cancelNewClassifyItemBtn"));
    }

}
