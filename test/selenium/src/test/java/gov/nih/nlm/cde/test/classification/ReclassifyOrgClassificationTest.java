package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class ReclassifyOrgClassificationTest extends NlmCdeBaseTest {

    @Test
    public void reclassifyOrgClassification() {
        String oldClassification = "OldClassification";
        String newClassification = "OldFormClassification";
        String cdeName = "Gastrointestinal therapy water flush status";
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        nonNativeSelect("", "Start by choosing your Organization", "org / or Org");

        String[] categories = new String[]{oldClassification};
        clickMoreVertIcon(categories);
        clickElement(By.xpath("//button/mat-icon[normalize-space() = 'transform']"));
        textPresent("Classify CDEs in Bulk");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        classifySubmit(new String[]{newClassification}, "");

        goToCdeByName(cdeName);
        goToClassification();
        textPresent(newClassification);
        textPresent(oldClassification);

        goToUserMenu();
        clickElement(By.id("user_audit"));
        clickElement(By.xpath("//div[. = 'Classification Audit Log']"));
        textPresent("Gastrointestinal therapy water flush status");
        textPresent("org / or Org > OldFormClassification");
    }

}
