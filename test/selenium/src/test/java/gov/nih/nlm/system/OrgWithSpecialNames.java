package gov.nih.nlm.system;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class OrgWithSpecialNames extends BaseClassificationTest {

    @Test
    public void orgWithSpecialName() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();

        new Select(findElement(By.cssSelector("select"))).selectByVisibleText("org / or Org");

        createClassificationName("org / or Org", new String[]{"Sub / Classification"});

        goToCdeByName("SCI Classification light touch single side score");
        clickElement(By.id("classification_tab"));
        clickElement(By.id("openClassificationModalBtn"));
        textPresent("By recently added");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        textPresent("Sub / Classification");
        clickElement(By.xpath("//button[@id='Sub / Classification-classifyBtn']"));
        textPresent("Classification Added");
        modalGone();
    }

}
