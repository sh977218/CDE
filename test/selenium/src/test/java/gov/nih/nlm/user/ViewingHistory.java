package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class ViewingHistory extends NlmCdeBaseTest {

    @Test
    public void viewingHistory() {
        mustBeLoggedInAs(history_username, password);

        goToCdeByName("Patient Eligibility Ind-2");
        goToCdeByName("Specimen Inflammation Change Type");
        goToCdeByName("Person Mother Onset Menopause Age Value");
        goToCdeByName("Definition Type Definition Type String");
        goToCdeByName("Service Item Display Name java.lang.String");
        goToCdeByName("Apgar Score Created By java.lang.Long");
        goToCdeByName("Target Lesion Sum Short Longest Dimension Measurement");
        goToCdeByName("Form Element End Date");
        goToCdeByName("Treatment Text Other Text");
        goToCdeByName("Specimen Block Received Count");
        goToCdeByName("Malignant Neoplasm Metastatic Involvement Anatomic");

        goToFormByName("Answer Value Display Profile Test");
        goToFormByName("Traumatic Brain Injury - Adverse Events");
        goToFormByName("Patient Health Questionnaire 2 item (PHQ-2) [Reported]");

        goToViewHistory();

        textPresent("Specimen Inflammation Change Type");
        textPresent("Person Mother Onset Menopause Age Value");
        textPresent("Definition Type Definition Type String");
        textPresent("Service Item Display Name java.lang.String");
        textPresent("Apgar Score Created By java.lang.Long");
        textPresent("Target Lesion Sum Short Longest Dimension Measurement");
        textPresent("Form Element End Date");
        textPresent("Treatment Text Other Text");
        textPresent("Specimen Block Received Count");
        textPresent("Malignant Neoplasm Metastatic Involvement Anatomic");

        textNotPresent("Patient Eligibility Ind-2");

        textPresent("Answer Value Display Profile Test");
        textPresent("Traumatic Brain Injury - Adverse Events");
        textPresent("Patient Health Questionnaire 2 item (PHQ-2) [Reported]");

    }
}
