package gov.nih.nlm.ninds.form;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CDEUtility {
    public CDEUtility() {
    }

    public void checkDataQuality(MongoOperations mongoOperation) {
        List dataTypeList = mongoOperation.getCollection("ninds").distinct("cdes.dataType");
        if (dataTypeList.size() > Constants.MAX_DATATYPE_SIZE) {
            System.out.println("data type is not good. size: " + dataTypeList.size());
            System.out.println(Arrays.toString(dataTypeList.toArray()));
            System.exit(1);
        }
        List inputRestrictionsList = mongoOperation.getCollection("ninds").distinct("cdes.inputRestrictions");
        if (inputRestrictionsList.size() > Constants.MAX_INPUT_RESTRICTIONS_SIZE) {
            System.out.println("inputRestrictionsList is not good. size: " + inputRestrictionsList.size());
            System.out.println(Arrays.toString(inputRestrictionsList.toArray()));
            System.exit(1);
        }
        List distinctDiseaseNameList = mongoOperation.getCollection("ninds").distinct("diseaseName");
        if (distinctDiseaseNameList.size() > Constants.DISEASE_NUM) {
            System.out.println("distinct diseaseName is not good. size: ");
            System.out.println(Arrays.toString(distinctDiseaseNameList.toArray()));
            System.exit(1);
        }
        Query searchNoDiseaseExistFormQuery = new Query(Criteria.where("diseaseName").exists(false));
        MyForm noDiseaseExistForm = mongoOperation.findOne(searchNoDiseaseExistFormQuery, MyForm.class);
        if (noDiseaseExistForm != null) {
            System.out.println("some form has do not disease name. form: " + noDiseaseExistForm);
            System.exit(1);
        }
        Query searchNoDomainExistFormQuery = new Query(Criteria.where("domainName").exists(false));
        MyForm noDomainExistForm = mongoOperation.findOne(searchNoDomainExistFormQuery, MyForm.class);
        if (noDomainExistForm != null) {
            System.out.println("some form has do not domain name. form: " + noDomainExistForm);
            System.exit(1);
        }
        Query searchNoSubDomainExistFormQuery = new Query(Criteria.where("subDomainName").exists(false));
        MyForm noSubDomainExistForm = mongoOperation.findOne(searchNoDiseaseExistFormQuery, MyForm.class);
        if (noSubDomainExistForm != null) {
            System.out.println("some form has do not subDomain name. form: " + noSubDomainExistForm);
            System.exit(1);
        }
    }

    public String cleanFormName(String s) {
        String result = s.replace("\"", " ").replace("©", "").replace("™", "").trim();
        String[] badStrings = {
                "For additional information please visit NINDS-Coriell",
                "Note: Also refer to Outcomes and End Points for additional measures recommended for assessing neurological impairment and functional status.",
                "The CDEs for this CRF Module are included directly below for the individual RFQ CRFs."};
        for (String badString : badStrings) {
            result = result.replace(badString, "").trim();
        }
        return result;
    }

    public String cleanSubDomain(String s) {
        String result = s;
        String[] badStrings = {
                "The NINDS strongly encourages researchers to use these NIH-developed materials for NINDS-sponsored research, when appropriate. Utilization of these resources will enable greater consistency for NINDS-sponsored research studies. These tools are free of charge.",
                "See \"CRF Search\" to find all Imaging forms under Subdomain option.",
                "See \"CRF Search\" to find all Non-Imaging forms under Subdomain option.",
                "See \"CRF Search\" to find Surgeries and Other Procedures forms under Subdomain option.",
                "See \"CRF Search\" to find all History of Disease/Injury Event forms under Subdomain option.",
                "See \"CRF Search\" to find all Classification forms under Subdomain option.",
                "See \"CRF Search\" to find all Second Insults forms under Subdomain option.",
                "See \"CRF Search\" to find all Discharge forms under Subdomain option.",
                "Note: The General CDE Standards contain additional useful CRF Modules and CDEs for this sub-domain.",
                "Note: Also refer to Outcomes and End Points for additional measures recommended for assessing neurological impairment and functional status.",
        };
        for (String badString : badStrings) {
            result = result.replace(badString, "").trim();
        }
        return result;
    }

    public void getCdesList(WebDriver driver, MyForm form) {
        String selector = "//tbody[tr/td/div[text() = 'CDE ID']]/tr";

        List<WebElement> trs = driver.findElements(By.xpath(selector));

        List<WebElement> headerTds = trs.get(1).findElements(By.xpath("td"));
        List<String> headers = new ArrayList();
        for (WebElement hTd : headerTds) {
            headers.add(hTd.getText().replace("\"", " ").trim());
        }

        for (int i = 2; i < trs.size(); i++) {
            Cde cde = new Cde();
            WebElement tr = trs.get(i);
            List<WebElement> tds = tr.findElements(By.xpath("td"));
            for (int j = 0; j < headers.size(); j++) {
                String text = tds.get(j).getText().replace("\"", " ").trim();
                try {
                    String cdeField = Constants.FIELD_PROPERTY_MAP.get(headers.get(j));
                    Field field = cde.getClass().getDeclaredField(cdeField);
                    field.set(cde, text);
                } catch (Exception e) {
                    // do something here.
                }
            }
            form.getCdes().add(cde);
        }
    }

    public void switchTabAndClose(WebDriver driver, int i) {
        ArrayList<String> tabs;
        tabs = new ArrayList<String>(driver.getWindowHandles());
        driver.close();
        driver.switchTo().window(tabs.get(i));
    }


    public void switchTab(WebDriver driver, int i) {
        ArrayList<String> tabs;
        tabs = new ArrayList<String>(driver.getWindowHandles());
        driver.switchTo().window(tabs.get(i));
    }
}
