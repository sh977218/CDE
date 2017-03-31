package gov.nih.nlm.form.test.properties.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PublishForm extends NlmCdeBaseTest {

    @Test
    public void publishForm() {
        mustBeLoggedInAs(reguser_username, password);
        goToFormByName("DNA Elements - Information from the Laboratory");
        clickElement(By.id("export"));
        clickElement(By.id("formPublishExport"));
        findElement(By.name("endpointUrl")).sendKeys(baseUrl + "/sendMockFormData");
        findElement(By.name("publishedFormName")).sendKeys("My Published Form");
        clickElement(By.id("goExport"));
        textPresent("Done. Go to your profile to see all your published forms");
        closeAlert();
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        clickElement(By.linkText("My Published Form"));
        switchTab(1);
        findElement(By.name("q1")).sendKeys("1");
        findElement(By.name("q2")).sendKeys("2");
        findElement(By.name("q3")).sendKeys("Lab Name");
        clickElement(By.id("button_submit"));
        textPresent("Form Submitted");
        switchTabAndClose(0);
        goHome();
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        clickElement(By.xpath("//td[a[. ='My Published Form']]/i[@alt= 'Remove']"));
        textPresent("Saved");
        closeAlert();
        textNotPresent("My Published Form");
    }

}
