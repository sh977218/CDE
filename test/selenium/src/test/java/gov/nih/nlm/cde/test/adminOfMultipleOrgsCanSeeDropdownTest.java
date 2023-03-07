package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class adminOfMultipleOrgsCanSeeDropdownTest extends BaseClassificationTest {

    @Test
    public void adminOfMultipleOrgsCanSeeDropdown() {
        String org = "caBIG";
        String classification = "caNanoLab";
        mustBeLoggedInAs(classificationMgtUser_username, password);
        gotoClassificationMgt();
        selectOrgClassification(org);
        expandOrgClassification(org);
        textPresent(classification);
        clickElement(By.xpath("(//button[mat-icon[normalize-space() = 'more_vert']])[1]"));
        clickElement(By.xpath("//button[mat-icon[normalize-space() = 'transform']]"));
        clickElement(By.xpath("//button[contains(.,'Close')]"));
    }

}
