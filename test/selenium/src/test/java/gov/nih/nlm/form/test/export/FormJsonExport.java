package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormJsonExport extends NlmCdeBaseTest {

    @Test
    public void jsonExport() {
        mustBeLoggedInAs(reguser_username, password);
        String form = "Adverse Event Tracking Log";
        goToFormByName(form);
        hangon(1);
        clickElement(By.id("export"));
        hangon(1);
        clickElement(By.id("nihJson"));
        switchTab(1);

        String[] toCompare = {
                "{\"title\":\"CRF\",\"uri\":\"https://commondataelements.ninds.nih.gov/Doc/EPI/F1126_Adverse_Event_Tracking_Log.docx\"}",
                "\"permissibleValue\":\"Yes\"",
                "\"valueMeaningName\":\"Yes\"",
                "\"registrationState\":{\"registrationStatus\":\"Qualified\"}",
                "\"stewardOrg\":{\"name\":\"NINDS\"}",
                "\"designations\":[{\"tags\":[],\"designation\":\"Adverse Event Tracking Log\""
        };

        String response = findElement(By.cssSelector("HTML body pre")).getAttribute("innerHTML");

        for (String s : toCompare) {
            Assert.assertTrue(response.contains(s), "String:\n" + s + "\nis not with in\n" + response + "\n");
        }

        switchTabAndClose(0);
    }


}
