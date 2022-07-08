package gov.nih.nlm.board;

import gov.nih.nlm.board.cde.BoardTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ShowGridViewTest extends BoardTest {
    @Test
    public void showGridView() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Test Board";

        pinCdeToBoardWithModal("Prostate Cancer American Joint Committee on Cancer (AJCC) Edition 7 Pathologic Regional Lymph Node N Stage", boardName);
        pinCdeToBoardWithModal("Fluorescence in situ Hybridization Anaplastic Lymphoma Kinase Calculation Standard Deviation Value", boardName);
        pinCdeToBoardWithModal("Recurrent Malignant Neoplasm Patient No Cisplatin Interval Month Count", boardName);
        pinCdeToBoardWithModal("Prior BMSCT Administered Indicator", boardName);
        pinCdeToBoardWithModal("Generalized Activities of Daily Living Pain Restricted Scale", boardName);
        closeAlert();
        hangon(1);
        goToBoard(boardName);
        textPresent("CODE_FOR");

        clickElement(By.id("list_gridView"));

        textPresent("Fluorescence in situ");
        textPresent("Anaplastic Lymp");
        textPresent("ALK Standard Deviation");
        textPresent("Pathologic N Stage");
        textPresent("pN0");
        textPresent("3436564");
        textPresent("3028594");
        textPresent("Prior BMSCT Administered Indicator");
        textPresent("Generalized Activities of Daily Living Pain");
        textPresent("Platinum free");
        textPresent("3535434");
    }

}
