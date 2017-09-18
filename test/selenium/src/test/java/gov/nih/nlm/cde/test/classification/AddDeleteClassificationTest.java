package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class AddDeleteClassificationTest extends NlmCdeBaseTest {

    @Test
    public void addDeleteClassificationMgt() {
        String org = "NINDS";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        createOrgClassification(org, new String[]{"_a"});
        List<WebElement> linkList = driver.findElements(By.xpath("//*[@id='_a']"));
        Assert.assertEquals(linkList.size(), 1);
        createOrgClassification(org, new String[]{"_a", "_a_a"});
        linkList = driver.findElements(By.xpath("//*[@id='_a,_a_a']"));
        Assert.assertEquals(linkList.size(), 1);
        createOrgClassification(org, new String[]{"_a", "_a_a", "_a_a_a"});
        createOrgClassification(org, new String[]{"_a", "_a_b"});
        createOrgClassification(org, new String[]{"_a", "_a_c"});
        deleteOrgClassification(org, new String[]{"_a", "_a_a"});
        checkElementDoesNotExistByCSS("[id='okRemoveClassificationModal']");
        scrollToTop();
    }

}
