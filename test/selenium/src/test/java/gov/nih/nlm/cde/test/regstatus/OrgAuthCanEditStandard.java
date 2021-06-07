package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class OrgAuthCanEditStandard extends NlmCdeBaseTest {

    @Test
    public void orgAuthCanEditStandard() {
        mustBeLoggedInAs(theOrgAuth_username, password);
        goToCdeByName("Patient Visual Change Chief Complaint Indicator");
        findElement(By.cssSelector("mat-icon[title = 'Edit']"));
    }

}
