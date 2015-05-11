package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ViewingHistory extends NlmCdeBaseTest {

    private void checkUserHistory(String cdeName) {
        goToCdeByName(cdeName);
        hangon(2);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        textPresent("User Profile");
        textPresent(cdeName);
    }

    @Test
    public void viewingHistory() {
        mustBeLoggedInAs(history_username, password);
        goToCdeByName("Patient Eligibility Ind-2");
        hangon(4);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        textPresent("Patient Eligibility Ind-2");

        // now see 10 other CDEs
        checkUserHistory("Specimen Inflammation Change Type");
        checkUserHistory("Person Mother Onset Menopause Age Value");
        checkUserHistory("Definition Type Definition Type String");
        checkUserHistory("Service Item Display Name java.lang.String");
        checkUserHistory("Apgar Score Created By java.lang.Long");
        checkUserHistory("Target Lesion Sum Short Longest Dimension Measurement");
        checkUserHistory("Form Element End Date");
        checkUserHistory("Treatment Text Other Text");
        checkUserHistory("Specimen Block Received Count");
        checkUserHistory("Malignant Neoplasm Metastatic Involvement Anatomic");

        textNotPresent("Patient Eligibility Ind-2");
    }
}
