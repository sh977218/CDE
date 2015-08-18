package gov.nih.nlm.ninds.form;

import java.util.ArrayList;
import java.util.Collection;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Created by huangs8 on 8/11/2015.
 */
public class NindsFormTest {

    public static void main(String[] args) {
        Collection<Form> forms = new CopyOnWriteArraySet<Form>();

        Form form1 = new Form();
        form1.naming.get(0).designation = "abcd";
        form1.referenceDocuments.get(0).uri = "www.";
        form1.cdes = new ArrayList<>();
        form1.cdes.add("cde1");
        form1.cdes.add("cde2");
        form1.cdes.add("cde3");
        CsElt subDisease1 = new CsElt("subdisease 11", null);
        CsElt disease1 = new CsElt("disease 1", null);
        CsElt diseaseRoot1 = new CsElt("Disease", null);
        disease1.elements.add(subDisease1);
        diseaseRoot1.elements.add(disease1);
        form1.classification.get(0).elements.add(diseaseRoot1);
        CsElt subDomain1 = new CsElt("subdomain 11", null);
        CsElt domain1 = new CsElt("domain 1", null);
        CsElt domainRoot1 = new CsElt("Domain", null);
        domain1.elements.add(subDomain1);
        domainRoot1.elements.add(domain1);
        form1.classification.get(0).elements.add(domainRoot1);


        Form form2 = new Form();
        form2.naming.get(0).designation = "abcd";
        form2.referenceDocuments.get(0).uri = "www.";
        form2.cdes = new ArrayList<>();
        form2.cdes.add("cde1");
        form2.cdes.add("cde2");
        form2.cdes.add("cde3");
        CsElt subDisease2 = new CsElt("subdisease 21", null);
        CsElt disease2 = new CsElt("disease 2", null);
        CsElt diseaseRoot2 = new CsElt("Disease", null);
        disease2.elements.add(subDisease2);
        diseaseRoot2.elements.add(disease2);
        form2.classification.get(0).elements.add(diseaseRoot2);
        CsElt subDomain2 = new CsElt("subdomain 21", null);
        CsElt domain2 = new CsElt("domain 2", null);
        CsElt domainRoot2 = new CsElt("Domain", null);
        domain2.elements.add(subDomain2);
        domainRoot2.elements.add(domain2);
        form2.classification.get(0).elements.add(domainRoot2);

        Form form3 = new Form();
        form3.naming.get(0).designation = "abcd";
        form3.referenceDocuments.get(0).uri = "www.";
        form3.cdes = new ArrayList<>();
        form3.cdes.add("cde1");
        form3.cdes.add("cde2");
        form3.cdes.add("cde3");
        CsElt subDisease3 = new CsElt("subdisease 21", null);
        CsElt disease3 = new CsElt("disease 1", null);
        CsElt diseaseRoot3 = new CsElt("Disease", null);
        disease3.elements.add(subDisease3);
        diseaseRoot3.elements.add(disease3);
        form3.classification.get(0).elements.add(diseaseRoot3);
        CsElt subDomain3 = new CsElt("subdomain 21", null);
        CsElt domain3 = new CsElt("domain 3", null);
        CsElt domainRoot3 = new CsElt("Domain", null);
        domain3.elements.add(subDomain3);
        domainRoot3.elements.add(domain3);
        form3.classification.get(0).elements.add(domainRoot3);


        forms.add(form1);
        forms.add(form2);
        forms.add(form3);
        System.out.println("test");
    }
}
