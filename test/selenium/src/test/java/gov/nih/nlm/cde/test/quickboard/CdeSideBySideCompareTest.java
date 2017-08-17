package gov.nih.nlm.cde.test.quickboard;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeSideBySideCompareTest extends NlmCdeBaseTest{

    @Test
    public void cdeSideBySideCompare() {
        mustBeLoggedInAs(testAdmin_username,password);
        addCdeToQuickBoard("cdeCompare1");
        addCdeToQuickBoard("cdeCompare2");
        textPresent("Quick Board (2)");
        goToQuickBoardByModule("cde");
        clickElement(By.id("qb_elt_compare_0"));
        clickElement(By.id("qb_elt_compare_1"));
        clickElement(By.id("qb_compare"));

        textPresent("View Full Detail", By.xpath("//*[@id='qb_compare_viewDetail']//*[contains(@class, 'leftObj')]/a"));
        textPresent("View Full Detail", By.xpath("//*[@id='qb_compare_viewDetail']//*[contains(@class, 'rightObj')]/a"));

        textPresent("TEST", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'leftObj')]//*[contains(@class, 'Steward')]/following-sibling::div[1]"));
        textPresent("TEST", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'rightObj')]//*[contains(@class, 'Steward')]/following-sibling::div[1]"));
        textPresent("Incomplete", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'leftObj')]//*[contains(@class, 'Status')]/following-sibling::div[1]"));
        textPresent("Incomplete", By.xpath("//*[@id='qb_compare_gd']//*[contains(@class, 'rightObj')]//*[contains(@class, 'Status')]/following-sibling::div[1]"));

        textNotPresent("cdeCompare1", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj')]"));
        textPresent("cdeCompare2", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj')]"));
        textPresent("cdeCompare1", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj')]"));
        textNotPresent("cdeCompare2", By.xpath("//*[@id='qb_compare_naming']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj')]"));

        textNotPresent("reference document title 1", By.xpath("//*[@id='qb_compare_referenceDocuments']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj')]"));
        textPresent("reference document title 2", By.xpath("//*[@id='qb_compare_referenceDocuments']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj')]"));
        textPresent("reference document title 1", By.xpath("//*[@id='qb_compare_referenceDocuments']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj')]"));
        textNotPresent("reference document title 2", By.xpath("//*[@id='qb_compare_referenceDocuments']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj')]"));

        textNotPresent("key 1", By.xpath("//*[@id='qb_compare_properties']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj')]"));
        textPresent("key 2", By.xpath("//*[@id='qb_compare_properties']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj')]"));
        textPresent("key 1", By.xpath("//*[@id='qb_compare_properties']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj')]"));
        textNotPresent("key 2", By.xpath("//*[@id='qb_compare_properties']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj')]"));

        textNotPresent("concept name 1", By.xpath("//*[@id='qb_compare_concepts']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'leftObj')]"));
        textPresent("concept name 2", By.xpath("//*[@id='qb_compare_concepts']//*[contains(@class, 'quickBoardContentCompareArray')][1]//*[contains(@class, 'rightObj')]"));
        textPresent("concept name 1", By.xpath("//*[@id='qb_compare_concepts']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'leftObj')]"));
        textNotPresent("concept name 2", By.xpath("//*[@id='qb_compare_concepts']//*[contains(@class, 'quickBoardContentCompareArray')][2]//*[contains(@class, 'rightObj')]"));
        clickElement(By.id("closeModal"));

        clickElement(By.id("qb_de_empty"));
        textPresent("CDE QuickBoard (0)");
    }

}
