package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class FormAddFormInsideFormTest extends BaseFormTest {
    QuestionTest questionTest = new QuestionTest();

    @Test
    public void addFormInsideFormTest() {
        String formName = "Vital Signs";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("Show Question Search Area");
        startAddingForms();
        questionTest.addFormToSection("Vessel Imaging Angiography", 0);
        textPresent("Embedded Form: Vessel Imaging Angiography");
        String newFormLabel = "new inner form label";
        clickElement(By.id("innerForm_labek_edit_icon_Vessel Imaging Angiography"));
        findElement(By.xpath("//*[@id='innerForm_labek_edit_icon_Vessel Imaging Angiography']//form/input")).sendKeys(newFormLabel);
        clickElement(By.xpath("//*[@id='innerForm_labek_edit_icon_Vessel Imaging Angiography']//form//button[contains(text(),'Confirm')]"));
        saveForm();

        goToFormByName(formName);
        textPresent("This form is large and is not automatically displayed.");
        clickElement(By.id("renderPreviewButton"));
        textPresent("new inner form label");
        textPresent("Symptomology");

        clickElement(By.id("nativeFormRenderLink"));
        textPresent("Embedded Form: new inner form label");
        textPresent("Symptomology");

        String odmResponse = get(baseUrl + "/form/m1j_L1HHte?type=xml&subtype=odm").asString();
        Assert.assertEquals(odmResponse.contains("new inner form label"), true);
        Assert.assertEquals(odmResponse.contains("Symptomology"), true);

        String sdcResponse = get(baseUrl + "/form/m1j_L1HHte?type=xml&subtype=sdc").asString();
        Assert.assertEquals(sdcResponse.contains("new inner form label"), true);
        Assert.assertEquals(sdcResponse.contains("Symptomology"), true);
    }

}
