package gov.nih.nlm.ninds.form;

import java.util.*;

/**
 * Created by huangs8 on 8/4/2015.
 */
public class Form implements Comparable {
    ArrayList<Naming> naming = new ArrayList<Naming>();
    StewardOrg stewardOrg = new StewardOrg("NINDS");
    String version;
    ArrayList<Property> properties = new ArrayList<Property>();
    ArrayList<Id> ids = new ArrayList<Id>();
    Boolean isCopyrighted = false;
    Copyright copyright = new Copyright();
    String origin = "";
    ArrayList<Attachment> attachments = new ArrayList<Attachment>();
    ArrayList<Comment> comments = new ArrayList<Comment>();
    ArrayList<String> history = new ArrayList<String>();
    String created = "";
    CreatedBy createdBy = new CreatedBy();
    String updated = "";
    UpdatedBy updatedBy = new UpdatedBy();
    String imported = "";
    ArrayList<FormElement> formElements = new ArrayList<FormElement>();
    Boolean archived = false;
    ArrayList<Classification> classification = new ArrayList<Classification>();
    ArrayList<ReferenceDocument> referenceDocuments = new ArrayList<ReferenceDocument>();

    ArrayList<String> cdes = new ArrayList<String>();

    public Form() {
        this.naming.add(new Naming());
        Classification c = new Classification();
        classification.add(c);
        ReferenceDocument rd = new ReferenceDocument();
        referenceDocuments.add(rd);
    }


    @Override
    public boolean equals(Object o) {
        Form element = (Form) o;
        if (equalNaming(element.naming, this.naming)
                && equalCdes(element.cdes, this.cdes)
                && equalReferenceDocuments(element.referenceDocuments, this.referenceDocuments)) {
            mergeDiseaseAndDomain(element.classification.get(0).elements, this.classification.get(0).elements);
            return true;
        }
        return false;
    }

    private void mergeDiseaseAndDomain(Set s1, Set s2) {
        CsElt disease = null;
        CsElt domain = null;
        CsElt newDisease = null;
        CsElt newDomain = null;
        Iterator it = s1.iterator();
        while (it.hasNext()) {
            CsElt next = (CsElt) it.next();
            if (next.name.equals("Disease"))
                disease = next;
            if (next.name.equals("Domain"))
                domain = next;
        }
        Iterator newIt = s2.iterator();
        while (newIt.hasNext()) {
            CsElt next = (CsElt) newIt.next();
            if (next.name.equals("Disease"))
                newDisease = next;
            if (next.name.equals("Domain"))
                newDomain = next;
        }
        if (disease != null && newDisease != null)
            disease.elements.add(newDisease.elements.iterator().next());
        if (domain != null && newDomain != null)
            domain.elements.add(newDomain.elements.iterator().next());
    }

    private Boolean equalNaming(List n1, List n2) {
        if (n1.size() != n2.size())
            return false;
        else {
            Collections.sort(n1);
            Collections.sort(n2);
            for (int i = 0; i < n1.size(); i++) {
                if (!n1.get(i).equals(n2.get(i)))
                    return false;
            }
            return true;
        }
    }

    private Boolean equalReferenceDocuments(List rd1, List rd2) {
        if (rd1.size() != rd2.size())
            return false;
        else {
            Collections.sort(rd1);
            Collections.sort(rd2);
            for (int i = 0; i < rd1.size(); i++) {
                if (!rd1.get(i).equals(rd2.get(i)))
                    return false;
            }
            return true;
        }
    }

    private Boolean equalCdes(ArrayList<String> cdes1, ArrayList<String> cdes2) {
        if (cdes1.size() != cdes2.size())
            return false;
        else {
            Collections.sort(cdes1);
            Collections.sort(cdes2);
            for (int i = 0; i < cdes1.size(); i++) {
                if (!cdes1.get(i).equalsIgnoreCase(cdes2.get(i)))
                    return false;
            }
            return true;
        }
    }


    @Override
    public String toString() {
        return "Form{" +
                "naming=" + naming +
                ", stewardOrg='" + stewardOrg + '\'' +
                ", version='" + version + '\'' +
                ", properties=" + properties +
                ", ids=" + ids +
                ", isCopyrighted=" + isCopyrighted +
                ", copyright=" + copyright +
                ", origin='" + origin + '\'' +
                ", attachments=" + attachments +
                ", comments=" + comments +
                ", history=" + history +
                ", created=" + created +
                ", createdBy=" + createdBy +
                ", updated=" + updated +
                ", updatedBy=" + updatedBy +
                ", imported=" + imported +
                ", formElements=" + formElements +
                ", archived=" + archived +
                ", classification=" + classification +
                ", referenceDocuments=" + referenceDocuments +
                ", cdes=" + cdes +
                '}';
    }

    @Override
    public int compareTo(Object o) {
        Form form = (Form) o;
        return form.naming.get(0).designation.compareTo(this.naming.get(0).designation);
    }

    @Override
    public int hashCode() {
        int result = naming != null ? naming.hashCode() : 0;
        result = 31 * result + (stewardOrg != null ? stewardOrg.hashCode() : 0);
        result = 31 * result + (version != null ? version.hashCode() : 0);
        result = 31 * result + (properties != null ? properties.hashCode() : 0);
        result = 31 * result + (ids != null ? ids.hashCode() : 0);
        result = 31 * result + (isCopyrighted != null ? isCopyrighted.hashCode() : 0);
        result = 31 * result + (copyright != null ? copyright.hashCode() : 0);
        result = 31 * result + (origin != null ? origin.hashCode() : 0);
        result = 31 * result + (attachments != null ? attachments.hashCode() : 0);
        result = 31 * result + (comments != null ? comments.hashCode() : 0);
        result = 31 * result + (history != null ? history.hashCode() : 0);
        result = 31 * result + (created != null ? created.hashCode() : 0);
        result = 31 * result + (createdBy != null ? createdBy.hashCode() : 0);
        result = 31 * result + (updated != null ? updated.hashCode() : 0);
        result = 31 * result + (updatedBy != null ? updatedBy.hashCode() : 0);
        result = 31 * result + (imported != null ? imported.hashCode() : 0);
        result = 31 * result + (formElements != null ? formElements.hashCode() : 0);
        result = 31 * result + (archived != null ? archived.hashCode() : 0);
        result = 31 * result + (classification != null ? classification.hashCode() : 0);
        result = 31 * result + (referenceDocuments != null ? referenceDocuments.hashCode() : 0);
        result = 31 * result + (cdes != null ? cdes.hashCode() : 0);
        return result;
    }
}
