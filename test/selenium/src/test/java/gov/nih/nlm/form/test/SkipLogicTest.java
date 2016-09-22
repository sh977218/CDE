package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SkipLogicTest extends BaseFormTest {

    @Test
    public void singlePermissibleValue() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Cancer Screening Test";
        goToFormByName(formName);
        clickElement(By.linkText("native"));
        textNotPresent("Female Patient Screening");
        textNotPresent("Breast Carcinoma Estrogen Receptor Status");
        findElement(By.xpath("//div[label[text()='Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score']]/following-sibling::div//input")).sendKeys("200");
        textPresent("Patient Gender Category");
        new Select(findElement(By.xpath("//div[label[text()='Patient Gender Category']]/following-sibling::div//select")))
                .selectByVisibleText("Female Gender");
        textPresent("Female Patient Screening");
    }

    @Test
    public void editSkipLogicTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String formName = "PROMIS SF v1.0-Fatigue 8a";
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("How often did you have to push yourself to get things done because of your fatigue?");
        clickElement(By.id("question_accordion_3_2"));
        textPresent("Sometimes");

        editSkipLogic("//*[@id='dd_q_skipLogic_3']/div/input[1]", "\"How much were you bothered by your fatigue on average?\"", 3, 1, true, "Unexpected number of tokens in expression 1");
        editSkipLogic("//*[@id='dd_q_skipLogic_3']/div/input[1]", "=", 3, 1, true, "Unexpected number of tokens in expression 2");
        editSkipLogic("//*[@id='dd_q_skipLogic_3']/div/input[1]", "\"1\"", 5, 1, false, "Unexpected number of tokens in expression 2");

        editSkipLogic("//*[@id='dd_q_skipLogic_3']/div/input[1]", "AND", 2, 1, true, "Unexpected number of tokens in expression 4");
        editSkipLogic("//*[@id='dd_q_skipLogic_3']/div/input[1]", " \"To what degree did your fatigue interfere with your physical functioning?\"", 2, 2, true, "Unexpected number of tokens in expression 5");
        editSkipLogic("//*[@id='dd_q_skipLogic_3']/div/input[1]", "=", 3, 1, true, "Unexpected number of tokens in expression 6");
        editSkipLogic("//*[@id='dd_q_skipLogic_3']/div/input[1]", "\"1\"", 5, 1, false, "Unexpected number of tokens in expression 2");

        saveForm();
        goToFormByName(formName);
        checkSkipLogicRender();
    }


    public void editSkipLogic(String inputXpath, String textToBePresent, int expectedNumSuggested, int clickNth, boolean displayError, String errorMessage) {
        findElement(By.xpath(inputXpath)).sendKeys(Keys.SPACE);
        textPresent(textToBePresent);
        int actualNumSuggested = findElements(By.xpath("(//*[contains(@id,'typeahead-')]/a)")).size();
        Assert.assertEquals(actualNumSuggested, expectedNumSuggested);
        clickElement(By.xpath("(//*[contains(@id,'typeahead-')]/a)[" + clickNth + "]"));
        if (displayError) textPresent(errorMessage);
        else textNotPresent(errorMessage);
    }

    public void checkSkipLogicRender() {
        clickElement(By.id("nativeFormRenderLink"));
        textNotPresent("How often did you have to push yourself to get things done because of your fatigue?");
        new Select(findElement(By.xpath("//*[@id='How much were you bothered by your fatigue on average?_0']/select"))).selectByVisibleText("Not at all");
        new Select(findElement(By.xpath("//*[@id='To what degree did your fatigue interfere with your physical functioning?_1']/select"))).selectByVisibleText("A little bit");
        textPresent("How often did you have to push yourself to get things done because of your fatigue?");
    }
}
