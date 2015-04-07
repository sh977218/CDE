package gov.nih.nlm.cde.test;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassificationTest2 extends BaseClassificationTest {
    
    @Test
    public void navigateThroughClassiftree() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeByName("McGill Quality of Life Questionnaire (MQOL) - two day total life quality score");
        findElement(By.linkText("Classification")).click();
        findElement(By.id("addClassification")).click(); 
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("NINDS");
        textPresent("Domain", By.id("addClassificationModalBody"));
        textPresent("Population", By.id("addClassificationModalBody"));
        textNotPresent("Amyotrophic Lateral Sclerosis", By.id("addClassificationModalBody"));
        findElement(By.cssSelector("[id='addClassification-Disease'] span.fake-link")).click();
        textPresent("Amyotrophic Lateral Sclerosis", By.id("addClassificationModalBody"));
        textNotPresent("Domain", By.id("addClassificationModalBody"));
        textNotPresent("Population", By.id("addClassificationModalBody"));
        findElement(By.id("resetTree")).click();
        textPresent("Domain", By.id("addClassificationModalBody"));
        textPresent("Population", By.id("addClassificationModalBody"));
        textNotPresent("Amyotrophic Lateral Sclerosis", By.id("addClassificationModalBody"));
        findElement(By.xpath("//button[text() = 'Close']")).click();
        modalGone();
    }

        
    @Test
    public void checkDuplicatesClassification() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Product Problem Discover Performed Observation Outcome Identifier ISO21090.II.v1.0");
        findElement(By.linkText("Classification")).click();
        textNotPresent( "Disease" ) ;
        addClassificationMethod(new String[]{"NINDS","Disease"});
        textPresent( "Disease" ) ;
        addClassificationMethod(new String[]{"NINDS","Disease"});
        List<WebElement> linkList = driver.findElements(By.cssSelector("li[id$='Disease']"));
        Assert.assertTrue(linkList.size() == 1);
    }
    
    
}
