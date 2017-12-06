package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class SkipLogicDateTest extends BaseFormTest {

    @Test
    public void skipLogicDateTest() {
        String formName = "Imaging OCT Analysis - Spectralis Report Analysis";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToFormDescription();
        textPresent("Macula volume (OD)");
        startEditQuestionSectionById("question_0_2");
        String inputXpath1 = locateSkipLogicEditTextareaXpathByQuestionId("question_0_2");

        editSkipLogic(inputXpath1, "\"Indicate date of reference scan\"", 2, 2, true, "Unexpected number of tokens in expression 1");
        editSkipLogic(inputXpath1, "=", 6, 1, true, "Unexpected number of tokens in expression 2");
        editSkipLogic(inputXpath1, "\"{{MM/DD/YYYY}}\"", 1, 1, true, "\"{{MM/DD/YYYY}}\" is not a valid date for \"Indicate date of reference scan\".");

        String correctSkipLogicString = "\"Indicate date of reference scan\"=\"10/11/2016\"";

        findElement(By.xpath(inputXpath1)).clear();
        hangon(1);
        findElement(By.xpath(inputXpath1)).sendKeys(correctSkipLogicString);
        textNotPresent("Unexpected number of tokens");
        textNotPresent("is not a valid date for");
        saveEditQuestionSectionById("question_0_2");

        startEditQuestionSectionById("question_0_3");
        findElement(By.xpath(locateSkipLogicEditTextareaXpathByQuestionId("question_0_3"))).sendKeys("\"Indicate date of reference scan\">\"10/11/2016\"");
        saveEditQuestionSectionById("question_0_3");

        startEditQuestionSectionById("question_0_4");
        findElement(By.xpath(locateSkipLogicEditTextareaXpathByQuestionId("question_0_4"))).sendKeys("\"Indicate date of reference scan\"<\"10/11/2016\"");
        saveEditQuestionSectionById("question_0_4");

        newFormVersion();

        goToFormByName(formName);
        textPresent("If 10/11/2016:",
                By.xpath("//*[*[normalize-space()='Indicate date of reference scan']]//*//span[text()='If 10/11/2016: ']"));
        textPresent("If more than 10/11/2016:",
                By.xpath("//*[*[normalize-space()='Indicate date of reference scan']]//*//span[text()='If more than 10/11/2016: ']"));
        textPresent("If less than 10/11/2016:",
                By.xpath("//*[@id='Indicate date of reference scan_1']/div[4]/div/div/div/cde-native-question/div/fieldset/div[1]"));
        findElement(By.xpath("//*[@id='Macula volume (OS)_1']"));
        textPresent("left eye");

        clickElement(By.id("selectRenderButton"));
        clickElement(By.xpath("(//*[@id='selectRenderButton']/following-sibling::div)/button[normalize-space(text()) = 'Printable Logic:']/input"));
        textPresent("Display Profile");
        textNotPresent("Macula volume (OD)");
        textNotPresent("Macula volume (OS)");
        textNotPresent("Laterality Type");
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys("10/11/2016");
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys(Keys.TAB);
        textPresent("Macula volume (OD)");

        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).clear();
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys("10/12/2016");
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys(Keys.TAB);
        textPresent("Macula volume (OS)");

        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).clear();
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys("10/10/2016");
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys(Keys.TAB);
        textPresent("Laterality Type");

        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).clear();
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys("01/01/2017");
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys(Keys.TAB);
        textPresent("Macula volume (OS)");

        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).clear();
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys("01/01/2015");
        findElement(By.xpath("//*[@id='Indicate date of reference scan_1']//input")).sendKeys(Keys.TAB);
        textPresent("Laterality Type");
    }

}