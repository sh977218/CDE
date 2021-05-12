package gov.nih.nlm.form.test.description;

import gov.nih.nlm.form.test.BaseFormTest;
import org.testng.annotations.Test;

public class FormEditSectionTest extends BaseFormTest {
    @Test
    public void formEditSection() {
        String formName = "Form Edit Section And Question Test";
        mustBeLoggedInAs(testEditor_username, password);
        goToFormByName(formName);
        goToFormDescription();
        editSection("section_0", "New Main Section", "New Section Instruction", false, "1");
    }
}
