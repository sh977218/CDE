package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class AddDeleteClassificationTest extends BaseClassificationTest {
    
    @Test
    public void addDeleteClassificationMgt() {
        String org = "NINDS";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        createClassificationName(org, new String[]{"_a"});        
        createClassificationName(org, new String[]{"_a"});
        List<WebElement> linkList = driver.findElements(By.xpath("//span[text()=\"_a\"]"));
        Assert.assertEquals(linkList.size(), 1);
        createClassificationName(org, new String[]{"_a","_a_a"});        
        createClassificationName(org, new String[]{"_a","_a_a"});
        linkList = driver.findElements(By.xpath("//span[text()=\"_a_a\"]"));
        Assert.assertEquals(linkList.size(), 1);
        createClassificationName(org, new String[]{"_a","_a_a","_a_a_a"});
        createClassificationName(org, new String[]{"_a","_a_b"});
        createClassificationName(org, new String[]{"_a","_a_c"});          
        deleteMgtClassification("classification-_a,_a_a", "_a_a");
        checkElementDoesNotExistByCSS("[id='okRemoveClassificationModal']");
        scrollToTop();
    }
    
}
