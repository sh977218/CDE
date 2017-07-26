package gov.nih.nlm.form.test.description;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormEditSectionTest extends NlmCdeBaseTest {
    @Test
    public void formEditSection() {
        String formName = "Form Edit Section And Question Test";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        String sectionId = "section_0";
        String newSectionName = "New Main Section";
        String newSectionInstruction = "New Section Instruction";
        boolean isInstructionHtml = false;
        String newSectionCardinalityType = "Set Number of Times";
        String newSectionCardinality = "1";
        editSection(sectionId, newSectionName, newSectionInstruction, isInstructionHtml, newSectionCardinalityType, newSectionCardinality);
    }

}
