package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormTest extends NlmCdeBaseTest {

    private static final String testFormName = "CtepTestForm1";

    @Test
    public void createForm() {
        loginAs(ctepCurator_username, ctepCurator_password);
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("Form")).click();
        findElement(By.name("form.name")).sendKeys(testFormName);
        findElement(By.name("form.instructions")).sendKeys("Instructions for Ctep Form 1");
        new Select(findElement(By.name("form.stewardOrg.name"))).selectByVisibleText("CTEP");
        findElement(By.id("form.submit")).click();
        goToFormByName(testFormName);
        Assert.assertTrue(findElement(By.id("dd_name")).getText().equals(testFormName));
        Assert.assertTrue(findElement(By.id("dd_owner")).getText().equals("CTEP"));
        Assert.assertTrue(findElement(By.id("dd_instructions")).getText().equals("Instructions for Ctep Form 1"));
        Assert.assertTrue(findElement(By.id("dd_createdBy")).getText().equals(ctepCurator_username));
        Assert.assertEquals(findElement(By.id("dt_createdBy")).getLocation().y, findElement(By.id("dd_createdBy")).getLocation().y);
        logout();
    }

    @Test(dependsOnMethods = {"createForm"})
    public void addRemoveCart() {
        loginAs(ctepCurator_username, ctepCurator_password);
        driver.get(baseUrl + "/");
        findElement(By.id("formsLink")).click();
        findElement(By.name("search.name")).sendKeys(testFormName);
        findElement(By.id("search.submit")).click();
        findElement(By.partialLinkText(testFormName)).click();
        Assert.assertTrue(textPresent("Cart (0)"));
        findElement(By.linkText("Add to Cart")).click();
        Assert.assertTrue(textPresent("Cart (1)"));
        findElement(By.id("cartLink")).click();
        findElement(By.partialLinkText(testFormName)).click();
        findElement(By.linkText("Remove from Cart")).click();
        Assert.assertTrue(textPresent("Cart (0)"));
        logout();
    }

    @Test(dependsOnMethods = {"createForm"})
    public void addSection() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToFormByName(testFormName);
        addSection("Section 1 of the form");
        addSection("Section 2 - Beyond the Intro");
        goToFormByName(testFormName);
        Assert.assertTrue(textPresent("Section 1 of the form"));
        logout();
    }

    @Test(dependsOnMethods = {"addSection"})
    public void addQuestions() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToFormByName(testFormName);
        findElement(By.xpath("//div[@id = 'newQuestionDiv-0']/a")).click();
        findElement(By.xpath("//div[@id = 'newQuestionDiv-0']/div/input")).sendKeys("Radiogra");
        findElement(By.xpath("//div[@id = 'newQuestionDiv-0']/div/ul/li")).click();
        findElement(By.xpath("//div[@id = 'newQuestionDiv-0']/div/button[@class = 'icon-ok']")).click();
        findElement(By.xpath("//div[@id = 'newQuestionDiv-1']/a")).click();
        findElement(By.xpath("//div[@id = 'newQuestionDiv-1']/div/input")).sendKeys("Genotyp");
        findElement(By.xpath("//div[@id = 'newQuestionDiv-1']/div/ul/li")).click();
        findElement(By.xpath("//div[@id = 'newQuestionDiv-1']/div/button[@class = 'icon-ok']")).click();
        findElement(By.xpath("//div[@id = 'newQuestionDiv-1']/a")).click();
        findElement(By.xpath("//div[@id = 'newQuestionDiv-1']/div/input")).sendKeys("Alkal");
        findElement(By.xpath("//div[@id = 'newQuestionDiv-1']/div/ul/li")).click();
        findElement(By.xpath("//div[@id = 'newQuestionDiv-1']/div/button[@class = 'icon-ok']")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        goToFormByName(testFormName);
        Assert.assertTrue(textPresent("Radiograph Evidence Type"));
        Assert.assertTrue(findElement(By.linkText("Genotype Therapy Basis Mutation Analysis Indicator")).getLocation().y
                < findElement(By.linkText("Laboratory Procedure Alkaline Phosphatase Result Date")).getLocation().y);
        logout();
    }

    @Test
        (dependsOnMethods = {"addQuestions"})
    public void reorderQuestions() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToFormByName(testFormName);
        findElement(By.id("downQuestion-1-0")).click();
        Assert.assertTrue(findElement(By.linkText("Genotype Therapy Basis Mutation Analysis Indicator")).getLocation().y
                > findElement(By.linkText("Laboratory Procedure Alkaline Phosphatase Result Date")).getLocation().y);
        findElement(By.id("upQuestion-1-1")).click();
        Assert.assertTrue(findElement(By.linkText("Genotype Therapy Basis Mutation Analysis Indicator")).getLocation().y
                < findElement(By.linkText("Laboratory Procedure Alkaline Phosphatase Result Date")).getLocation().y);
        findElement(By.id("downQuestion-1-0")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        goToFormByName(testFormName);
        Assert.assertTrue(findElement(By.linkText("Genotype Therapy Basis Mutation Analysis Indicator")).getLocation().y
                > findElement(By.linkText("Laboratory Procedure Alkaline Phosphatase Result Date")).getLocation().y);
        logout();
    }
    
    @Test(dependsOnMethods = {"addSection", "removeQuestion"})
    public void reorderSections() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToFormByName(testFormName);
        Assert.assertTrue(findElement(By.id("Section 1 of the form")).getLocation().y
                < findElement(By.id("Section 2 - Beyond the Intro")).getLocation().y);
        findElement(By.id("sectionDown-0")).click();
        Assert.assertTrue(findElement(By.id("Section 1 of the form")).getLocation().y
                > findElement(By.id("Section 2 - Beyond the Intro")).getLocation().y);
        findElement(By.id("sectionUp-1")).click();
        Assert.assertTrue(findElement(By.id("Section 1 of the form")).getLocation().y
                < findElement(By.id("Section 2 - Beyond the Intro")).getLocation().y);
        findElement(By.id("sectionDown-0")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        goToFormByName(testFormName);
        Assert.assertTrue(findElement(By.id("Section 1 of the form")).getLocation().y
                > findElement(By.id("Section 2 - Beyond the Intro")).getLocation().y);                
        logout();
    }
    
    @Test
        (dependsOnMethods = {"addQuestions"})
    public void removeQuestion() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToFormByName(testFormName);
        findElement(By.id("removeQuestion-0-0")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        goToFormByName(testFormName);
        Assert.assertTrue(textPresent("Section 1"));
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Radiograph Evidence Type") < 0);
        logout();
    }

    private void addSection(String sectionName) {
        findElement(By.id("addSection")).click();
        findElement(By.xpath("//h3[@id = 'Untitled Section']/inline-edit/span/span[1]/i")).click();
        findElement(By.xpath("//h3[@id = 'Untitled Section']/inline-edit/span/span[2]/input")).clear();
        findElement(By.xpath("//h3[@id = 'Untitled Section']/inline-edit/span/span[2]/input")).sendKeys(sectionName);
        findElement(By.xpath("//h3[@id = 'Untitled Section']/inline-edit/span/span[2]/button[@class = 'icon-ok']")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
    }

}
