package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class OrgWithSpecialNames extends NlmCdeBaseTest {

    @Test
    public void orgWithSpecialName() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        createOrgClassification("org / or Org", new String[]{"Sub / Classification"});
        goToCdeByName("SCI Classification light touch single side score");
        goToClassification();
        clickElement(By.id("openClassificationModalBtn"));
        textPresent("By recently added");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        classifySubmit(new String[]{"Sub / Classification"}, "Classification added");
    }

}
