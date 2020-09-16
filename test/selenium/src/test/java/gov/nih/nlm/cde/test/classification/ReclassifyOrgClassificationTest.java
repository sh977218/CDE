package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class ReclassifyOrgClassificationTest extends NlmCdeBaseTest {

    @Test
    public void reclassifyOrgClassification() {
        String oldClassification = "OldClassification";
        String newClassification = "NewClassification";
        String cdeName = "Gastrointestinal therapy water flush status";
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        clickElement(By.cssSelector("mat-select"));
        selectMatSelectDropdownByText("org / or Org");

        String[] categories = new String[]{"OldClassification"};
        clickMoreVertIcon(categories);
        clickElement(By.xpath("//button/mat-icon[normalize-space() = 'transform']"));
        textPresent("Classify CDEs in Bulk");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        classifySubmit(new String[]{"NewClassification"}, "");

        goToCdeByName(cdeName);
        goToClassification();
        textPresent(newClassification);
        textPresent(oldClassification);

        clickElement(By.id("username_link"));
        clickElement(By.id("user_audit"));
        clickElement(By.xpath("//div[. = 'Classification Audit Log']"));
        textPresent("Gastrointestinal therapy water flush status");
        textPresent("org / or Org > NewClassification");
    }

}
