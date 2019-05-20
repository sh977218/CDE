package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PublishForm extends BaseFormTest {

    @Test
    public void publishForm() {
        String formName = "DNA Elements - Information from the Laboratory";
        String publishedFormName = "My Published Form Demo";
        mustBeLoggedInAs(reguser_username, password);
        goToFormByName(formName);
        clickElement(By.id("export"));
        clickElement(By.id("formPublishExport"));
        findElement(By.name("publishedFormUrl")).sendKeys(baseUrl + "/sendMockFormData");
        findElement(By.name("publishedFormName")).sendKeys(publishedFormName);
        clickElement(By.id("goExport"));
        checkAlert("Done. Go to your profile to see all your published forms");
        goToMyPublishedForms();
        clickElement(By.linkText(publishedFormName));
        switchTab(1);
        findElement(By.name("0-0")).sendKeys("1");
        findElement(By.name("0-1")).sendKeys("2");
        findElement(By.name("0-2")).sendKeys("Lab Name");
        clickElement(By.xpath("//" + byValueListValueXPath("Female Gender")));
        clickElement(By.id("button_submit"));
        textPresent("Form Submitted");
        switchTabAndClose(0);
        goHome();
        goToMyPublishedForms();
        clickElement(By.xpath("//*[a[normalize-space(.) ='" + publishedFormName + "']]/mat-icon[normalize-space() = 'delete_outline']"));
        checkAlert("Saved");
        textNotPresent(publishedFormName);
    }
}
