package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassificationMgtTest extends NlmCdeBaseTest {

    @Test
    public void viewOrgClassifications() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Classifications")).click();
        hangon(1);
        new Select(findElement(By.cssSelector("select"))).selectByValue("caBIG");
        Assert.assertTrue(textPresent("gov.nih.nci.cananolab.domain.characterization.invitro"));
        Assert.assertTrue(textNotPresent("Common Terminology Criteria for Adverse Events v3.0"));
        hangon(1);
        new Select(findElement(By.cssSelector("select"))).selectByValue("CTEP");
        Assert.assertTrue(textPresent("Common Terminology Criteria for Adverse Events v3.0"));
        Assert.assertTrue(textNotPresent("gov.nih.nci.cananolab.domain.characterization.invitro"));        
    }

    @Test
    public void createClassifications() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Classifications")).click();
        hangon(1);
        new Select(findElement(By.cssSelector("select"))).selectByValue("CTEP");
        findElement(By.id("addClassification")).click();
        modalHere();
        findElement(By.name("conceptSystem")).sendKeys("DISE");
        findElement(By.xpath("//div[@class='form-group']/ul/li[2]")).click();
        findElement(By.name("concept")).sendKeys("Made up disease");
        findElement(By.id("saveClassification")).click();
        Assert.assertTrue(textPresent("Classification Added"));
        hangon(1);
        Assert.assertTrue(textPresent("Made up disease"));
    }

    @Test
    public void removeClassification() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        goToCdeByName("Person Birth Date");
        findElement(By.linkText("Classification")).click();
        Assert.assertTrue(textPresent("NonHodgkins Lymphoma"));
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Classifications")).click();
        hangon(1);
        new Select(findElement(By.cssSelector("select"))).selectByValue("CTEP");

        findElement(By.xpath("//div[span[contains(., 'NonHodgkins Lymphoma')]]/a")).click();
        findElement(By.xpath("//div[span[contains(., 'NonHodgkins Lymphoma')]]//a[@title='OK']")).click();
        Assert.assertTrue(textPresent("Classification Removed"));

        hangon(1);
        Assert.assertTrue(textNotPresent("NonHodgkins Lymphoma"));
        goToCdeByName("Person Birth Date");
        findElement(By.linkText("Classification"));
        Assert.assertTrue(textNotPresent("NonHodgkins Lymphoma"));

    }
    
    
}
