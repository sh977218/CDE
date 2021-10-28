package gov.nih.nlm.system;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class OrgWithSpecialNames extends BaseClassificationTest {

    @Test
    public void orgWithSpecialName() {
        String org = "org / or Org";
        String[] categories = new String[]{};
        String classification = "Sub / Classification";
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        selectOrgClassification(org);
        expandOrgClassification(org);
        addClassificationUnderPath(categories, classification);
        goToCdeByName("SCI Classification light touch single side score");
        goToClassification();
        clickElement(By.id("openClassificationModalBtn"));
        textPresent("By recently added");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText(org);
        classifySubmit(new String[]{"Sub / Classification"}, "Classification added");
    }

}
