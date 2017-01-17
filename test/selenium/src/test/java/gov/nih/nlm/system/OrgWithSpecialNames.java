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

        createClassificationName("org / or Org", new String[]{"Sub / Classif"});

        goToCdeByName("SCI Classification light touch single side score");
        clickElement(By.linkText("Classification"));
        clickElement(By.id("addClassification"));
        hangon(1);
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        textPresent("Sub / Classif");
        clickElement(By.xpath("//div[@id=\"addClassificationModalBody\"]//button[contains(text(),'Classify')]"));
        textPresent("Classification Added");
        findElement(By.id("closeModal")).click();
        modalGone();
    }

}
