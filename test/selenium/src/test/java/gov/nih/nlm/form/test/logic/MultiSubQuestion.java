package gov.nih.nlm.form.test.properties.test.logic;

import gov.nih.nlm.form.test.properties.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class MultiSubQuestion extends BaseFormTest {

    @Test
    public void multiSubQuestionTest() {
        mustBeLoggedInAs(ninds_username, password);
        String formName = "Multi SubQuestion";
        goToFormByName(formName);

        textPresent("Yes",
                By.xpath("//div[label[text()='Was genetic testing performed?']]//div[label[text()='Test Name']]" +
                        "//div[label[text()='Was participant fasting prior to sample collection?']]"));
    }

}