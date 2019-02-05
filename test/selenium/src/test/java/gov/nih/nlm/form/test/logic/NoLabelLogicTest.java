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
        startEditQuestionById("question_0-1");
        questionEditRemoveUom("question_0-1", "meter per second");
        addSkipLogicById("question_0-1","Gender type","=","Unknown","value list",null);
        saveEditQuestionById("question_0-1");
        newFormVersion();
        textPresent("Show if: \"Gender type\" = \"Unknown\"");
        goToPreview();
        textPresent("Walking speed value");
        togglePrintableLogic();
        textNotPresent("Walking speed value");
        clickElement(By.xpath("//" + byValueListValueXPath("Unknown")));
        textPresent("Walking speed value");
    }

}
