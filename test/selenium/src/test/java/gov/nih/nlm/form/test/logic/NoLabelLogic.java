package gov.nih.nlm.form.test.logic;


import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NoLabelLogic extends BaseFormTest {

    @Test
    public void noLabelLogic() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("No Label Logic");
        textPresent("Undifferentiated/Indeterminant/Intersex");
        textPresent("Walking speed value");
        clickElement(By.id("description_tab"));
        clickElement(By.cssSelector("#question_0_1 .fa-pencil"));
        findElement(By.xpath(locateSkipLogicEditTextareaXpathByQuestionId("question_0_1"))).sendKeys("\"Gender type\" = \"Unknown\"");
        newFormVersion();
        textPresent("Show if: \"Gender type\" = \"Unknown\"");
        clickElement(By.id("general_tab"));
        textPresent("Walking speed value");
        clickElement(By.xpath("//label[contains(., 'Printable Logic')]"));
        textNotPresent("Walking speed value");
        clickElement(By.xpath("//input[@value='Unknown']"));
        textPresent("Walking speed value");
    }

}
