package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

public class SkipLogicDateTest extends BaseFormTest {

    @Test
    public void skipLogicDateTest() {
        String formName = "Imaging OCT Analysis - Spectralis Report Analysis";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToFormDescription();
        textPresent("Macula volume (OD)");
        startEditQuestionById("question_0-2");
        String inputXpath1 = locateSkipLogicEditTextareaXpathByQuestionId("question_0-2");

        editSkipLogic(inputXpath1, "\"Indicate date of reference scan\"", 2, 2, true, "Unexpected number of tokens in expression 1");
        editSkipLogic(inputXpath1, "=", 6, 1, true, "Unexpected number of tokens in expression 2");
        editSkipLogic(inputXpath1, "\"{{MM/DD/YYYY}}\"", 1, 1, true, "\"{{MM/DD/YYYY}}\" is not a valid date for \"Indicate date of reference scan\".");

        String correctSkipLogicString = "\"Indicate date of reference scan\"=\"10/11/2016\"";

        findElement(By.xpath(inputXpath1)).clear();
        hangon(1);
        findElement(By.xpath(inputXpath1)).sendKeys(correctSkipLogicString);
        textNotPresent("Unexpected number of tokens");
        textNotPresent("is not a valid date for");
        saveEditQuestionById("question_0-2");

        startEditQuestionById("question_0-3");
        findElement(By.xpath(locateSkipLogicEditTextareaXpathByQuestionId("question_0-3")))
                .sendKeys("\"Indicate date of reference scan\" > \"10/11/2016\"");
        saveEditQuestionById("question_0-3");

        startEditQuestionById("question_0-4");
        findElement(By.xpath(locateSkipLogicEditTextareaXpathByQuestionId("question_0-4")))
                .sendKeys("\"Indicate date of reference scan\" < \"10/11/2016\"");
        saveEditQuestionById("question_0-4");

        newFormVersion();

        goToFormByName(formName);
        findElement(By.xpath("//*[*[normalize-space()='Indicate date of reference scan']]//*[text()='If 10/11/2016: ']"));
        findElement(By.xpath("//*[*[normalize-space()='Indicate date of reference scan']]//*[text()='If more than 10/11/2016: ']"));
        findElement(By.xpath("//*[*[normalize-space()='Indicate date of reference scan']]//*[text()='If less than 10/11/2016: ']"));
        findElement(By.xpath("//*[@id='Macula volume (OS)_0-3']"));
        textPresent("left eye");

        togglePrintableLogic();
        textPresent("Display Profile");
        textNotPresent("Macula volume (OD)");
        textNotPresent("Macula volume (OS)");
        textNotPresent("Laterality Type");
        WebElement dateElt = findElement(By.xpath("//*[@id='Indicate date of reference scan_0-1']//input"));

        dateElt.sendKeys("10112016");
        textPresent("Macula volume (OD)");

        dateElt.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB));
        dateElt.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB));
        dateElt.sendKeys("10122016");
        textPresent("Macula volume (OS)");

        dateElt.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB));
        dateElt.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB));
        dateElt.sendKeys("10102016");
        textPresent("Laterality Type");

        dateElt.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB));
        dateElt.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB));
        dateElt.sendKeys("01012017");
        textPresent("Macula volume (OS)");

        dateElt.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB));
        dateElt.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB));
        dateElt.sendKeys("01012015");
        textPresent("Laterality Type");
    }

}