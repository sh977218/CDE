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

        textPresent("Yes",
                By.xpath("//*[*[text()='Was genetic testing performed?']]//*[*[text()='Test Name']]" +
                        "//*[*[text()='Was participant fasting prior to sample collection?']]"));
    }

}