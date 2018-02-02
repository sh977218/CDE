package gov.nih.nlm.form.test.logic;


import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NoLabelLogicTest extends BaseFormTest {

    @Test
    public void noLabelLogic() {
        String formName = "No Label Logic";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        textPresent("Undifferentiated/Indeterminant/Intersex");
        textPresent("Walking speed value");
        goToFormDescription();
        startEditQuestionById("question_0_1");
        questionEditRemoveUom("question_0_1", "meter per second");
        findElement(By.xpath(locateSkipLogicEditTextareaXpathByQuestionId("question_0_1"))).sendKeys("\"Gender type\" = \"Unknown\"");
        saveEditQuestionById("question_0_1");
        newFormVersion();
        textPresent("Show if: \"Gender type\" = \"Unknown\"");
        goToPreview();
        textPresent("Walking speed value");
        togglePrintableLogic();
        textNotPresent("Walking speed value");
        clickElement(By.xpath("//span[. ='Unknown']"));
        textPresent("Walking speed value");
    }

}
