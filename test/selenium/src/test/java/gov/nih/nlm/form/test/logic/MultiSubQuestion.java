package gov.nih.nlm.form.test.logic;


import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class MultiSubQuestion extends BaseFormTest {

    @Test
    public void multiSubQuestionTest() {
        mustBeLoggedInAs(ninds_username, password);
        String formName = "Multi SubQuestion";
        goToFormByName(formName);
        textPresent("Was participant fasting prior to sample collection?",
                By.xpath("//*[*[normalize-space()='Was genetic testing performed?']]//*[*[normalize-space()='Test Name']]//*[*[normalize-space()='Was participant fasting prior to sample collection?']]"));
    }

}
