package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class FormAddFormInsideFormTest extends QuestionTest {
    @Test
    public void addFormInsideFormTest() {
        String formName = "Study Drug Compliance";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToFormDescription();
        addFormToSection("Vessel Imaging Angiography", 0);
        textPresent("Embedded Form: Vessel Imaging Angiography");
        String newFormLabel = "new inner form label";
        startEditQuestionSectionById("inform_0_0");
        clickElement(By.xpath("//*[@id='innerForm_label_edit_icon_Vessel Imaging Angiography']//i"));
        findElement(By.xpath("//*[@id='innerForm_label_edit_icon_Vessel Imaging Angiography']//form/input")).clear();
        findElement(By.xpath("//*[@id='innerForm_label_edit_icon_Vessel Imaging Angiography']//form/input")).sendKeys(newFormLabel);
        clickElement(By.xpath("//*[@id='innerForm_label_edit_icon_Vessel Imaging Angiography']//form//button[contains(text(),'Confirm')]"));
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

        String odmResponse = get(baseUrl + "/form/71zmIkrBtl?type=xml&subtype=odm").asString();
        Assert.assertEquals(odmResponse.contains("Symptomology"), true, "Actual: " + odmResponse);

        String sdcResponse = get(baseUrl + "/form/71zmIkrBtl?type=xml&subtype=sdc").asString();
        Assert.assertEquals(sdcResponse.contains(newFormLabel), true, "Actual: " + sdcResponse);
        Assert.assertEquals(sdcResponse.contains("Symptomology"), true, "Actual: " + sdcResponse);
    }

}
