package gov.nih.nlm.ninds.form;

import java.util.*;

/**
 * Created by huangs8 on 8/4/2015.
 */
public class Form implements Comparable {
    Naming naming = new Naming();
    String stewardOrg = "NINDS";
    String version;
    ArrayList<Property> properties = new ArrayList<Property>();
    ArrayList<Id> ids = new ArrayList<Id>();
    Boolean isCopyrighted = false;
    Copyright copyright = new Copyright();
    String origin;
    ArrayList<Attachment> attachments = new ArrayList<Attachment>();
    ArrayList<Comment> comments = new ArrayList<Comment>();
    ArrayList<String> history = new ArrayList<String>();
    Date created;
    CreatedBy createdBy = new CreatedBy();
    Date updated;
    UpdatedBy updatedBy = new UpdatedBy();
    Date imported;
    ArrayList<FormElement> formElements = new ArrayList<FormElement>();
    Boolean archived;
    ArrayList<Classification> classification = new ArrayList<Classification>();
    ArrayList<ReferenceDocument> referenceDocuments = new ArrayList<ReferenceDocument>();

    ArrayList<String> cdes = new ArrayList<String>();
    CsElt disease = new CsElt();
    CsElt subDisease = new CsElt();

    public Form() {
        Classification c = new Classification();
        c.stewardOrg = "NINDS";
        classification.add(c);
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Form form = (Form) o;
        if (equalNaming(this.naming, form.naming)
                && equalCdes(this.cdes, form.cdes)
                && equalReferenceDocuments(this.referenceDocuments, form.referenceDocuments)) {
            this.classification.get(0).elements.add(form.disease);
            HashSet<CsElt> diseases = this.classification.get(0).elements;
            for (CsElt ce : diseases) {
                if (ce.name.equals(form.disease)) {
                    ce.elements.add(form.subDisease);
                }
            }
            return true;
        }
        return false;
    }


    private Boolean equalNaming(Naming n1, Naming n2) {
        return n1.designation.equalsIgnoreCase(n2.designation) ? true : false;
    }

    private Boolean equalReferenceDocuments(List rd1, List rd2) {
        if (rd1.size() != rd2.size())
            return false;
        else {
            Collections.sort(rd1);
            Collections.sort(rd2);
            for (int i = 0; i < rd1.size(); i++) {
                if (!rd1.get(i).equals(rd1.get(i)))
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
                ", disease=" + disease +
                ", subDisease=" + subDisease +
                '}';
    }

    @Override
    public int compareTo(Object o) {
        Form form = (Form) o;
        return this.naming.designation.compareTo(form.naming.designation);
    }
}
