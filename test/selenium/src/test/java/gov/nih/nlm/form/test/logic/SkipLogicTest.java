package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SkipLogicTest extends BaseFormTest {

    @Test
    public void editSkipLogicTest() {
        mustBeLoggedOut();
        String formName = "PROMIS SF v1.0-Fatigue 8a";
        goToFormByName(formName);
        String inputXpath = locateSkipLogicEditTextareaXpathByQuestionId("question_3_2");
        clickElement(By.id("description_tab"));
        textPresent("How often did you have to push yourself to get things done because of your fatigue?");
        scrollToViewById("question_3_2");
        textPresent("Never", By.xpath("//*[@id='question_3_2']//*[contains(@class,'answerList')]"));
        textPresent("Rarely", By.xpath("//*[@id='question_3_2']//*[contains(@class,'answerList')]"));
        textPresent("Sometimes", By.xpath("//*[@id='question_3_2']//*[contains(@class,'answerList')]"));
        textPresent("Often", By.xpath("//*[@id='question_3_2']//*[contains(@class,'answerList')]"));
        textPresent("Always", By.xpath("//*[@id='question_3_2']//*[contains(@class,'answerList')]"));

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        scrollToViewById("question_3_2");
        textPresent("How often did you have to push yourself to get things done because of your fatigue?");
        textPresent("Never", By.xpath("//*[@id='question_3_2']//*[contains(@class,'answerList')]"));
        textPresent("Rarely", By.xpath("//*[@id='question_3_2']//*[contains(@class,'answerList')]"));
        textPresent("Sometimes", By.xpath("//*[@id='question_3_2']//*[contains(@class,'answerList')]"));
        textPresent("Often", By.xpath("//*[@id='question_3_2']//*[contains(@class,'answerList')]"));
        textPresent("Always", By.xpath("//*[@id='question_3_2']//*[contains(@class,'answerList')]"));

        startEditQuestionSectionById("question_3_2");
        editSkipLogic(inputXpath, "\"How much were you bothered by your fatigue on average?\"", 2, 1, true, "Unexpected number of tokens in expression 1");
        editSkipLogic(inputXpath, "=", 3, 1, true, "Unexpected number of tokens in expression 2");
        editSkipLogic(inputXpath, "\"1\"", 5, 1, false, "Unexpected number of tokens in expression 2");

        editSkipLogic(inputXpath, "AND", 2, 1, true, "Unexpected number of tokens in expression 4");

        editSkipLogic(inputXpath, "\"To what degree did your fatigue interfere with your physical functioning?\"", 2, 2, true, "Unexpected number of tokens in expression 5");
        editSkipLogic(inputXpath, "=", 3, 1, true, "Unexpected number of tokens in expression 6");
        editSkipLogic(inputXpath, "\"2\"", 5, 2, false, "Unexpected number of tokens in expression 2");

        saveEditQuestionSectionById("question_3_2");
        saveForm();

        goToFormByName(formName);
        textNotPresent("How often did you have to push yourself to get things done because of your fatigue?");
        clickElement(By.xpath("//*[@id='How much were you bothered by your fatigue on average?_0']//*[text()[contains(., 'Not at all')]]"));
        clickElement(By.xpath("//*[@id='To what degree did your fatigue interfere with your physical functioning?_1']//*[text()[contains(., 'A little bit')]]"));
        textPresent("How often did you have to push yourself to get things done because of your fatigue?");
        clickElement(By.xpath("//*[@id='To what degree did your fatigue interfere with your physical functioning?_1']//*[text()[contains(., 'Not at all')]]"));
        textNotPresent("How often did you have to push yourself to get things done because of your fatigue?");
    }

}