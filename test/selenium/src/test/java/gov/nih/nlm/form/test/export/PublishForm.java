package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PublishForm extends BaseFormTest {

    @Test
    public void publishForm() {
        String formName = "DNA Elements - Information from the Laboratory";
        mustBeLoggedInAs(reguser_username, password);
        goToFormByName(formName);
        clickElement(By.id("export"));
        clickElement(By.id("formPublishExport"));
        findElement(By.name("publishedFormUrl")).sendKeys(baseUrl + "/sendMockFormData");
        findElement(By.name("publishedFormName")).sendKeys("My Published Form");
        clickElement(By.id("goExport"));
        checkAlert("Done. Go to your profile to see all your published forms");
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        clickElement(By.linkText("My Published Form"));
        switchTab(1);
        findElement(By.name("0-0")).sendKeys("1");
        findElement(By.name("0-1")).sendKeys("2");
        findElement(By.name("0-2")).sendKeys("Lab Name");
        clickElement(By.xpath("//" + byValueListValueXPath("Female Gender")));
        clickElement(By.id("button_submit"));
        textPresent("Form Submitted");
        switchTabAndClose(0);
        goHome();
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        clickElement(By.xpath("//*[a[normalize-space(.) ='My Published Form']]/mat-icon[. = 'delete_outline'"));
        checkAlert("Saved");
        textNotPresent("My Published Form");
    }

}
