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
        startEditQuestionSectionById("question_0_1");
        findElement(By.xpath(locateSkipLogicEditTextareaXpathByQuestionId("question_0_1"))).sendKeys("\"Gender type\" = \"Unknown\"");
        saveEditQuestionSectionById("question_0_1");
        newFormVersion();
        textPresent("Show if: \"Gender type\" = \"Unknown\"");
        goToPreview();
        textPresent("Walking speed value");
        clickElement(By.id("dropdownMenuButton"));
        clickElement(By.xpath("(//*[@id='dropdownMenuButton']/following-sibling::div)/button[normalize-space(text()) = 'Printable Logic:']/input"));
        textNotPresent("Walking speed value");
        clickElement(By.xpath("//span[. ='Unknown']"));
        textPresent("Walking speed value");
    }

}
