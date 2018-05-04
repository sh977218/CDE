package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.Test;

public class EditSkipLogic extends BaseFormTest {

    @Test
    public void editSkipLogicTest() {
        mustBeLoggedOut();
        String formName = "PROMIS SF v1.0-Fatigue 8a";
        goToFormByName(formName);
        goToFormDescription();
        scrollToInfiniteById("question_3-2");
        textPresent("How often did you have to push yourself to get things done because of your fatigue?");
        textPresent("Never", By.xpath("//*[@id='question_3-2']//*[contains(@class,'answerList')]"));
        textPresent("Rarely", By.xpath("//*[@id='question_3-2']//*[contains(@class,'answerList')]"));
        textPresent("Sometimes", By.xpath("//*[@id='question_3-2']//*[contains(@class,'answerList')]"));
        textPresent("Often", By.xpath("//*[@id='question_3-2']//*[contains(@class,'answerList')]"));
        textPresent("Always", By.xpath("//*[@id='question_3-2']//*[contains(@class,'answerList')]"));

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToFormDescription();
        scrollToInfiniteById("question_3-2");
        textPresent("How often did you have to push yourself to get things done because of your fatigue?");
        textPresent("Never", By.xpath("//*[@id='question_3-2']//*[contains(@class,'answerList')]"));
        textPresent("Rarely", By.xpath("//*[@id='question_3-2']//*[contains(@class,'answerList')]"));
        textPresent("Sometimes", By.xpath("//*[@id='question_3-2']//*[contains(@class,'answerList')]"));
        textPresent("Often", By.xpath("//*[@id='question_3-2']//*[contains(@class,'answerList')]"));
        textPresent("Always", By.xpath("//*[@id='question_3-2']//*[contains(@class,'answerList')]"));

        startEditQuestionById("question_3-2");
        (new Actions(driver)).moveToElement(findElement(By.id("question_3-2"))).perform(); // scroll into view
        String inputXpath = locateSkipLogicEditTextareaXpathByQuestionId("question_3-2");

        editSkipLogic(inputXpath, "\"How much were you bothered by your fatigue on average?\"", 2, 1, true,
                "Unexpected number of tokens in expression 1");
        editSkipLogic(inputXpath, "=", 6, 1, true, "Unexpected number of tokens in expression 2");
        editSkipLogic(inputXpath, "\"1 (Not at all)\"", 5, 1, false, "Unexpected number of tokens in expression 2");

        editSkipLogic(inputXpath, "AND", 2, 1, true, "Unexpected number of tokens in expression 4");

        editSkipLogic(inputXpath, "\"To what degree did your fatigue interfere with your physical functioning?\"", 2, 2,
                true, "Unexpected number of tokens in expression 5");
        editSkipLogic(inputXpath, "=", 6, 1, true, "Unexpected number of tokens in expression 6");
        editSkipLogic(inputXpath, "\"2 (A little bit)\"", 5, 2, false, "Unexpected number of tokens in expression 6");

        editSkipLogic(inputXpath, "OR", 2, 2, true, "Unexpected number of tokens in expression 8");

        editSkipLogic(inputXpath, "\"To what degree did your fatigue interfere with your physical functioning?\"", 2, 2,
                true, "Unexpected number of tokens in expression 9");
        editSkipLogic(inputXpath, "=", 6, 1, true, "Unexpected number of tokens in expression 10");
        editSkipLogic(inputXpath, "\"3 (Somewhat)\"", 5, 3, false, "Unexpected number of tokens in expression 10");

        saveEditQuestionById("question_3-2");
        newFormVersion();

        goToFormByName(formName);
        textPresent("How often did you have to push yourself to get things done because of your fatigue?",
                By.xpath("//*[*[normalize-space()='To what degree did your fatigue interfere with your physical functioning?']]//*[normalize-space()='How often did you have to push yourself to get things done because of your fatigue?']"));
        clickElement(By.cssSelector("input[name='3-2_fake1']"));
        findElement(By.cssSelector("input[name='3-2']:checked"));
        findElement(By.cssSelector("input[name='3-2_fake1']:checked"));

        togglePrintableLogic();
        textNotPresent("How often did you have to push yourself to get things done because of your fatigue?");
        clickElement(By.xpath("//*[@id='How much were you bothered by your fatigue on average?_3-0']//" + byValueListValueXPath("Not at all")));
        clickElement(By.xpath("//*[@id='To what degree did your fatigue interfere with your physical functioning?_3-1']//" + byValueListValueXPath("A little bit")));
        textPresent("How often did you have to push yourself to get things done because of your fatigue?");
        clickElement(By.xpath("//*[@id='To what degree did your fatigue interfere with your physical functioning?_3-1']//" + byValueListValueXPath("Not at all")));
        textNotPresent("How often did you have to push yourself to get things done because of your fatigue?");
        clickElement(By.xpath("//*[@id='How much were you bothered by your fatigue on average?_3-0']//" + byValueListValueXPath("A little bit")));
        clickElement(By.xpath("//*[@id='To what degree did your fatigue interfere with your physical functioning?_3-1']//" + byValueListValueXPath("A little bit")));
        textNotPresent("How often did you have to push yourself to get things done because of your fatigue?");
        clickElement(By.xpath("//*[@id='To what degree did your fatigue interfere with your physical functioning?_3-1']//" + byValueListValueXPath("Somewhat")));
        textPresent("How often did you have to push yourself to get things done because of your fatigue?");
    }

}