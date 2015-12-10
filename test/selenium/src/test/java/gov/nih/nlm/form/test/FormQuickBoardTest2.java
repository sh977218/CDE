package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormQuickBoardTest2 extends NlmCdeBaseTest {

    @Test
    public void formExpandAllQuickBoard() {
        mustBeLoggedInAs(test_username, password);
        addFormToQuickBoard("Glasgow Outcome Scale (GOS) and Glasgow Outcome Scale - Extended (GOSE)");
        addFormToQuickBoard("Center for Epidemiologic Studies-Depression Scale (CES-D)");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_form_openCloseAll"));
        textPresent("The Glasgow Outcome Scale was developed to define broad outcome categories for people who sustain acute brain damage from head injury or non-traumatic brain insults. (Examples of CDEs included: GOS date and time of administration; GOS Total; and GOS-Extended Total)");
        textPresent("The Center for Epidemiologic Studies Depression Scale (CES-D) is a widely used screening scale for depression. It consists of six subscales of depressed mood, feelings of guilt and worthlessness, feelings of helplessness and hopelessness, psychomotor retardation, loss of appetite, and sleep disturbance. The CES-D queries a patient's depression symptoms in the last week, with each question is scored on a 4-point Likert scale ranging from 0 (rarely/none of the time) to 3 (most/all of the time). Scores for items 4, 8, 12, and 16 are reversed before summing all items to yield a total score. A score of 16 or higher has been used to indicate highly depressive symptoms.");
        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

    @Test
    public void formSideBySideCompare2() {
        mustBeLoggedInAs(test_username, password);
        addFormToQuickBoard("compareForm1");
        addFormToQuickBoard("emptyForm");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_form_compare"));

        textPresent("Tumor Characteristics: T1 Sig", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj Label')]"));
        textPresent("Pain location anatomic site", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj Label')]"));
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'leftObj Label')]"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }


    @Test
    public void formSideBySideCompare3() {
        mustBeLoggedInAs(test_username, password);
        addFormToQuickBoard("compareForm3");
        addFormToQuickBoard("compareForm4");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_form_compare"));

        textPresent("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj Label')]"));
        textPresent("Adverse Event Ongoing Event Indicator", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj Label')]"));
        textPresent("Adverse Event Ongoing Event Indicator", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj Label')]"));
        textPresent("Noncompliant Reason Text", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'leftObj Label')]"));
        textPresent("Noncompliant Reason Text", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'rightObj Label')]"));
        textPresent("Race Category Text", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][4]//*[contains(@class, 'leftObj Label')]"));
        textPresent("Race Category Text", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][4]//*[contains(@class, 'leftObj Label')]"));
        textPresent("Ethnic Group Category Text", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][5]//*[contains(@class, 'leftObj Label')]"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }
}

