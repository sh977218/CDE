package gov.nih.nlm.cde.test;


public class ExportTest extends NlmCdeBaseTest {
    @Test
    public void cdeExport() {
        goToSearch("cde");
        findElement(By.id("exportSearch")).click();

    }
}
