package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class FormAddFormInsideFormTest extends QuestionTest {
    @Test
    public void addFormInsideFormTest() {
        String formName = "Study Drug Compliance";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToFormDescription();
        addFormToSection("Vessel Imaging Angiography", 0);
        textPresent("Embedded Form: Vessel Imaging Angiography");
        textPresent("Study ID number");
        String newFormLabel = "new inner form label";
        startEditSectionById("form_0-0");
        clickElement(By.xpath("//*[@id='form_0-0']//*[@class='section_label']//mat-icon"));
        findElement(By.xpath("//*[@id='form_0-0']//*[@class='section_label']//input")).clear();
        findElement(By.xpath("//*[@id='form_0-0']//*[@class='section_label']//input")).sendKeys(newFormLabel);
        clickElement(By.xpath("//*[@id='form_0-0']//*[@class='section_label']//button[contains(text(),'Confirm')]"));
        saveFormEdit();
        newFormVersion();

        goToFormByName(formName);
        textPresent(newFormLabel);
        textPresent("Symptomology");
        clickElement(By.id("selectRenderButton"));
        clickElement(By.id("button_lforms"));
        switchTab(1);
        textPresent(newFormLabel);
        textPresent("Symptomology");
        switchTabAndClose(0);

        goToFormDescription();
        clickElement(By.partialLinkText("View Form"));
        switchTab(1);
        textPresent("Vessel Imaging Angiography", By.cssSelector("h1"));
        switchTabAndClose(0);

        String odmResponse = get(baseUrl + "/form/71zmIkrBtl?type=xml&subtype=odm").asString();
        Assert.assertTrue(odmResponse.contains("Symptomology"), "Actual: " + odmResponse);

    }

}
