package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SkipLogicSectionNoLabelTest extends BaseFormTest {
    String formName = "Section in Section Form";

    @Test
    public void editEmptySectionLabelSkipLogicTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToFormDescription();
        startEditSectionById("section_1");
        clickElement(By.xpath("//*[@id='section_1']//*[contains(@class,'skipLogicEditTextarea')]//mat-icon[.='edit']"));
        textPresent("Add Condition");
    }

}