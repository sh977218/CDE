package gov.nih.nlm.form.test.logic;


import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class UpdateSkipLogicWhenEditLabel extends BaseFormTest {

    @Test
    public void updateSkipLogicWhenEditLabelTest() {
        String formName = "Study Discontinuation/Completion";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        togglePrintableLogic();
        textNotPresent("Reason for premature intervention discontinuation");
        findElement(By.xpath("//*[@id='Off study date_0-0']//input")).sendKeys("10152016");
        clickElement(By.xpath("//*[@id='Did participant subject discontinue intervention before planned end of study?_0-2']//" +
                byValueListValueXPath("No")));
        textPresent("Reason for premature intervention discontinuation");
        goToFormDescription();

        startEditQuestionById("question_0-0");
        clickElement(By.xpath("//*[@id='question_0-0']//mat-icon[contains(@class,'changeQuestionLabelIcon')]"));
        textPresent("There is skip logic using this label. It will be updated.");
        clickElement(By.xpath("//*[@id='q_select_name_0']//button"));
        String cssClass = findElement(By.xpath("//*[@id='question_0-4']//mat-icon[contains(@class,'updatedSkipLogicIcon')]")).getAttribute("class");
        Assert.assertEquals(cssClass.contains("fa-spin"), true);
        saveEditQuestionById("question_0-0");
        saveFormEdit();
        newFormVersion();
        goToFormByName(formName);
        togglePrintableLogic();
        textNotPresent("Reason for premature intervention discontinuation");
        findElement(By.xpath("//*[@id='Off study date and time_0-0']//input")).sendKeys("10152016");
        clickElement(By.xpath("//*[@id='Did participant subject discontinue intervention before planned end of study?_0-2']//" +
                byValueListValueXPath("No")));
        textPresent("Reason for premature intervention discontinuation");
    }
}
