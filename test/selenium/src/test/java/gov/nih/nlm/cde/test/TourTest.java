package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;

public class TourTest extends NlmCdeBaseTest {

	void getNext(String expectedText) {
		hangon(1);
		clickElement(By.xpath("//button[@data-role='next']"));
		textPresent(expectedText);
		hangon(1);
	}

}
