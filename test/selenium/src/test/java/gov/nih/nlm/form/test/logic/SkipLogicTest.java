package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SkipLogicTest extends BaseFormTest {

    @Test
    public void singlePermissibleValue() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Cancer Screening Test";
        goToFormByName(formName);
        textNotPresent("Female Patient Screening");
        textNotPresent("Breast Carcinoma Estrogen Receptor Status");
        findElement(By.xpath("//div[div/label[text()='Frontal Systems Behavior Scale (FrSBE) - Disinhibition " +
                "subscale T score']]/following-sibling::div//input")).sendKeys("200");
        textPresent("Patient Gender Category");
        clickElement(By.xpath("//div[div/label[text()='Patient Gender Category']]/following-sibling::div//*[text()[contains(., 'Female Gender')]]"));
        textPresent("Female Patient Screening");
    }

    @Test
    public void editSkipLogicTest() {
        mustBeLoggedOut();
        String formName = "PROMIS SF v1.0-Fatigue 8a";
        goToFormByName(formName);
        String inputXpath = locateSkipLogicEditTextareaXpathByQuestionId("question_3_2");
        clickElement(By.id("description_tab"));
        textPresent("How often did you have to push yourself to get things done because of your fatigue?");
        textPresent("Never Rarely Sometimes Often Always", By.xpath("//*[@id='question_3_2']//[contains(@class,'answerList')]"));

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("How often did you have to push yourself to get things done because of your fatigue?");
        textPresent("Never Rarely Sometimes Often Always", By.xpath("//*[@id='question_3_2']//[contains(@class,'answerList')]"));

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


    private void editSkipLogic(String inputXpath, String textToBePresent, int expectedNumSuggested, int clickNth,
                               boolean displayError, String errorMessage) {
        findElement(By.xpath(inputXpath)).sendKeys(Keys.SPACE);
        textPresent(textToBePresent, By.xpath("(//*[contains(@id,'typeahead-')]/a)[" + clickNth + "]"));
        int actualNumSuggested = findElements(By.xpath("(//*[contains(@id,'typeahead-')]/a)")).size();
        Assert.assertEquals(actualNumSuggested, expectedNumSuggested);
        clickElement(By.xpath("(//*[contains(@id,'typeahead-')]/a)[" + clickNth + "]"));
        if (displayError) textPresent(errorMessage);
        else textNotPresent(errorMessage);
    }

    @Test
    public void skipLogicDateTest() {
        mustBeLoggedInAs(ninds_username, password);
        String formName = "Imaging OCT Analysis - Spectralis Report Analysis";
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("Macula volume (OD)");

        startEditQuestionSectionById("question_0_2");
        String inputXpath1 = locateSkipLogicEditTextareaXpathByQuestionId("question_0_2");

        editSkipLogic(inputXpath1, "\"Indicate date of reference scan\"", 2, 2, true, "Unexpected number of tokens in expression 1");
        editSkipLogic(inputXpath1, "=", 3, 1, true, "Unexpected number of tokens in expression 2");
        editSkipLogic(inputXpath1, "\"{{MM/DD/YYYY}}\"", 1, 1, true, "\"{{MM/DD/YYYY}}\" is not a valid date for \"Indicate date of reference scan\".");

        String correctSkipLogicString = "\"Indicate date of reference scan\"=\"10/11/2016\"";

        findElement(By.xpath(inputXpath1)).clear();
        hangon(1);
        findElement(By.xpath(inputXpath1)).sendKeys(correctSkipLogicString);
        clickElement(By.id("dd_datatype_2"));
        textNotPresent("Unexpected number of tokens");
        textNotPresent("is not a valid date for");

        clickElement(By.id("question_accordion_0_3"));
        textPresent("Optical coherence tomography (OCT) oculus sinister (OS) macula volume measurement");
        findElement(By.xpath("//*[@id='dd_q_skipLogic_3']/div/input[2]")).sendKeys("\"Indicate date of reference scan\">\"10/11/2016\"");

        clickElement(By.id("question_accordion_0_4"));
        textPresent("Optical coherence tomography retinal nerve fiber layer thickness laterality type");
        findElement(By.xpath("//*[@id='dd_q_skipLogic_4']/div/input[2]")).sendKeys("\"Indicate date of reference scan\"<\"10/11/2016\"");

        saveEditQuestionSectionById("question_0_2");
        saveForm();

        goToFormByName(formName);
        textPresent("Display Profile");
        textNotPresent("Macula volume (OD)");
        textNotPresent("Macula volume (OS)");
        textNotPresent("Laterality Type");
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys("10/11/2016");
        textPresent("Macula volume (OD)");

        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).clear();
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys("10/12/2016");
        textPresent("Macula volume (OS)");

        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).clear();
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys("10/10/2016");
        textPresent("Laterality Type");

        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).clear();
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys("2017");
        textPresent("Macula volume (OS)");

        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).clear();
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys("2015");
        textPresent("Laterality Type");

    }

    @Test
    public void updateSkipLogicWhenEditLabel() {
        String formName = "Study Discontinuation/Completion";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        textNotPresent("Reason for premature intervention discontinuation");
        clickElement(By.xpath("//*[@id='Off study date_0']//button"));
        findElement(By.xpath("//*[@id='Off study date_0']//input")).sendKeys("10/15/2016");
        clickElement(By.xpath("//button[text()='Done']"));
        clickElement(By.xpath("//*[@id='Did participant subject discontinue intervention before planned end of study?_2']//label[text()[contains(., 'No')]]"));
        textPresent("Reason for premature intervention discontinuation");
        clickElement(By.id("description_tab"));

        startEditQuestionSectionById("question_0_0");
        clickElement(By.xpath("//*[@id='question_0_0']//i[contains(@class,'changeQuestionLabelIcon')]"));
        textPresent("Some show if rules reference this label. They will be updated.");
        clickElement(By.xpath("//*[@id='q_select_name_0']//button"));
        String cssClass = findElement(By.xpath("//*[@id='question_0_4']//i[contains(@class,'updatedSkipLogicIcon')]")).getAttribute("class");
        Assert.assertEquals(cssClass.contains("fa-spin"), true);
        saveEditQuestionSectionById("question_0_0");

        saveForm();
        goToFormByName(formName);
        textNotPresent("Reason for premature intervention discontinuation");
        clickElement(By.xpath("//*[@id='Off study date and time_0']//button"));
        findElement(By.xpath("//*[@id='Off study date and time_0']//input")).sendKeys("10/15/2016");
        clickElement(By.xpath("//button[text()='Done']"));
        clickElement(By.xpath("//*[@id='Off study intervention prematurely indicator_2']//label[text()[contains(., 'No')]]"));
        textPresent("Reason for premature intervention discontinuation");

    }

}