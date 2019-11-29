package gov.nih.nlm.cde.test.history;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeHistoryCompareTest extends NlmCdeBaseTest {
    @Test
    public void cdeHistoryCompare() {
        String cdeName = "Eyes affect productivity";
        goToCdeByName(cdeName);
        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("0", By.xpath("//*[@id='Value List_0']//div[contains(@class,'arrayObjAdd')]//div[contains(@class,'permissibleValue')]/span"));
        textPresent("1", By.xpath("//*[@id='Value List_1']//div[contains(@class,'arrayObjAdd')]//div[contains(@class,'permissibleValue')]/span"));
        textPresent("2", By.xpath("//*[@id='Value List_2']//div[contains(@class,'arrayObjAdd')]//div[contains(@class,'permissibleValue')]/span"));
        textPresent("3", By.xpath("//*[@id='Value List_3']//div[contains(@class,'arrayObjAdd')]//div[contains(@class,'permissibleValue')]/span"));
        textPresent("4", By.xpath("//*[@id='Value List_4']//div[contains(@class,'arrayObjAdd')]//div[contains(@class,'permissibleValue')]/span"));
        textPresent("5", By.xpath("//*[@id='Value List_5']//div[contains(@class,'arrayObjAdd')]//div[contains(@class,'permissibleValue')]/span"));
        textPresent("6", By.xpath("//*[@id='Value List_6']//div[contains(@class,'arrayObjAdd')]//div[contains(@class,'permissibleValue')]/span"));
        textPresent("7", By.xpath("//*[@id='Value List_7']//div[contains(@class,'arrayObjAdd')]//div[contains(@class,'permissibleValue')]/span"));
        textPresent("8", By.xpath("//*[@id='Value List_8']//div[contains(@class,'arrayObjAdd')]//div[contains(@class,'permissibleValue')]/span"));
        textPresent("9", By.xpath("//*[@id='Value List_9']//div[contains(@class,'arrayObjAdd')]//div[contains(@class,'permissibleValue')]/span"));
        textPresent("10", By.xpath("//*[@id='Value List_10']//div[contains(@class,'arrayObjAdd')]//div[contains(@class,'permissibleValue')]/span"));
        textPresent("0 -Eye problem(s) had no effect on my work", By.xpath("//*[@id='Value List_11']//div[contains(@class,'arrayObjRemove')]//div[contains(@class,'valueMeaningName')]/span"));
        textPresent("1", By.xpath("//*[@id='Value List_12']//div[contains(@class,'arrayObjRemove')]//div[contains(@class,'valueMeaningName')]/span"));
        textPresent("2", By.xpath("//*[@id='Value List_13']//div[contains(@class,'arrayObjRemove')]//div[contains(@class,'valueMeaningName')]/span"));
        textPresent("3", By.xpath("//*[@id='Value List_14']//div[contains(@class,'arrayObjRemove')]//div[contains(@class,'valueMeaningName')]/span"));
        textPresent("4", By.xpath("//*[@id='Value List_15']//div[contains(@class,'arrayObjRemove')]//div[contains(@class,'valueMeaningName')]/span"));
        textPresent("5", By.xpath("//*[@id='Value List_16']//div[contains(@class,'arrayObjRemove')]//div[contains(@class,'valueMeaningName')]/span"));
        textPresent("6", By.xpath("//*[@id='Value List_17']//div[contains(@class,'arrayObjRemove')]//div[contains(@class,'valueMeaningName')]/span"));
        textPresent("7", By.xpath("//*[@id='Value List_18']//div[contains(@class,'arrayObjRemove')]//div[contains(@class,'valueMeaningName')]/span"));
        textPresent("8", By.xpath("//*[@id='Value List_19']//div[contains(@class,'arrayObjRemove')]//div[contains(@class,'valueMeaningName')]/span"));
        textPresent("9", By.xpath("//*[@id='Value List_20']//div[contains(@class,'arrayObjRemove')]//div[contains(@class,'valueMeaningName')]/span"));
        textPresent("10 -Eye problem(s) completely prevented me from working", By.xpath("//*[@id='Value List_21']//div[contains(@class,'arrayObjRemove')]//div[contains(@class,'valueMeaningName')]/span"));

    }
}
