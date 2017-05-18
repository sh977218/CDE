package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

public class SectionInSectionTest extends BaseFormTest {

    private QuestionTest questionTest = new QuestionTest();

    //@Test
    public void sectionInSection() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Section in Section Form";
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        // Add 2nd Section
        questionTest.addQuestionToSection("Smoking History Ind", 0);
        questionTest.addQuestionToSection("First-Line Therapy Chemotherapy Regimen Name", 1);
        WebElement sourceElt = findElement(By.xpath("//div[@id=\"section_view_1\"]//i[contains(@class,\"section-move-handle\")]"));
        WebElement targetElt = findElement(By.xpath("//div[@id=\"section_drop_area_0\"]//*[@id=\"question_accordion_0_0\"]"));
        (new Actions(driver)).dragAndDrop(sourceElt, targetElt).perform();
        hangon(1);

        String cardXPath = "//*[contains(@class,'dragQuestions')]//dd[@id='dd_card_0']";
        Assert.assertEquals("Exactly 1", findElement(By.xpath(cardXPath)).getText().trim());
        findElement(By.xpath(cardXPath + "//i")).click();
        new Select(findElement(By.xpath(cardXPath + "//select"))).selectByVisibleText("1 or more");
        findElement(By.xpath(cardXPath + "//button[contains(text(),'Confirm')]")).click();

        saveForm();
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        findElement(By.xpath("//div[@id='section_drop_area_0']//div[@id='section_drop_area_child']//span[text()=\"First-Line Therapy Chemotherapy Regimen Name\"]"));

        clickElement(By.id("general_tab"));
        findElement(By.xpath("//div[@id='formRenderSection_Medical History']//div[@id='formRenderSection_Treatment Details']//label[text()='First-Line Therapy Chemotherapy Regimen Name']"));
        Assert.assertTrue(driver.findElements(By.xpath("//*[text()='Treatment Details']")).size() == 1);
        clickElement(By.xpath("//*[text()=' Add One']"));
        Assert.assertTrue(driver.findElements(By.xpath("//*[text()='Treatment Details']")).size() == 2);
    }


}
