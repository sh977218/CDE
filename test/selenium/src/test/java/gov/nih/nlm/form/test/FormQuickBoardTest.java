package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormQuickBoardTest extends NlmCdeBaseTest {

    @Test
    public void formMoreElementsNoSideBySideCompare() {
        addFormToQuickBoard("Family History - SMA");
        addFormToQuickBoard("Anatomical Functional Imaging");
        addFormToQuickBoard("Tinnitus Functional Index (TFI)");
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_elt_compare_2"));
        clickElement(By.id("qb_form_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

    @Test
    public void cdeLessElementsNoSideBySideCompare() {
        addFormToQuickBoard("Family History - SMA");
        addFormToQuickBoard("Anatomical Functional Imaging");
        addFormToQuickBoard("Tinnitus Functional Index (TFI)");
        textPresent("Quick Board (3)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_form_compare"));
        textPresent("You may only compare 2 elements side by side.");
        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }

    @Test
    public void formExpandAllQuickBoard() {
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


/*
    @Test
*/
    public void formSideBySideCompare1() {
        addFormToQuickBoard("compareForm1");
        addFormToQuickBoard("compareForm2");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_form_compare"));


        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj')]"));
        textPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj')]"));
        textPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj')]"));
        textPresent("Visible Tumor Anterior-Posterior Orientation Size 3 ", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'leftObj')]"));
        textPresent("Visible Tumor Anterior-Posterior Orientation Size 3 ", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'rightObj')]"));
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][4]//*[contains(@class, 'leftObj')]"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }


/*
    @Test
*/
    public void formSideBySideCompare2() {
        addFormToQuickBoard("compareForm3");
        addFormToQuickBoard("compareForm4");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_form_compare"));

        textPresent("Adverse Event Ongoing Event Indicator", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj')]"));
        textPresent("Visible Tumor Anterior-Posterior Orientation Size 3 ", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj')]"));
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'leftObj')]"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }


/*
    @Test
*/
    public void formSideBySideCompare3() {
        addFormToQuickBoard("compareForm1");
        addFormToQuickBoard("compareForm2");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_form_compare"));


        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj')]"));
        textPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj')]"));
        textPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj')]"));
        textPresent("Visible Tumor Anterior-Posterior Orientation Size 3 ", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'leftObj')]"));
        textPresent("Visible Tumor Anterior-Posterior Orientation Size 3 ", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][3]//*[contains(@class, 'rightObj')]"));
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='qb_compare_questions']//*[contains(@class, 'quickBoardContentCompareArray')][4]//*[contains(@class, 'leftObj')]"));

        clickElement(By.id("qb_form_empty"));
        textPresent("Form QuickBoard (0)");
    }
}
