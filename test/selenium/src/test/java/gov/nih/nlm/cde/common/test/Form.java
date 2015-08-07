package gov.nih.nlm.cde.common.test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

/**
 * Created by huangs8 on 8/4/2015.
 */
public class Form {
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

    public class Naming {
        String designation;
        String definition;
        String definitionFormat;
        String languageCode;
        Context context;
    }

    public class Context {
        String contextName;
        String acceptability;
    }

    public class Property {
        String key;
        String value;
        String valueFormat;
    }

    public class Id {
        String source;
        String id;
        String version;
    }

    public class Copyright {
        String authority;
        String text;
    }

    public class Attachment {
        String fileid;
        String filename;
        String filetype;
        Date uploadDate;
        String comment;
        UploadedBy uploadedBy;
        Integer filesize;
        Boolean isDefault;
        Boolean pendingApproval;
        Boolean scanned;
    }

    public class UploadedBy {
        String userId;
        String username;
    }

    public class Comment {
        String text;
        String user;
        String username;
        Date created;
        Boolean pendingApproval;
    }

    public class CreatedBy {
        String userId;
        String username;
    }

    public class UpdatedBy {
        String userId;
        String username;
    }

    public class FormElement {
        String elementType;
        String label;
        String instructions;
        String cardinality;
        String repeatsFor;
        String showIfExpression;
        Section section;
        Question question;
        ArrayList<FormElement> formElements = new ArrayList<FormElement>();
        SkipLogic skipLogic;
    }

    public class SkipLogic {
        String action;
        String condition;
    }

    public class Section {
    }

    public class Question {
        Cde cde;
        String datatype;
        ArrayList<String> uoms = new ArrayList<String>();
        Boolean required;
        Boolean multiselect;
        OtherPleaseSpecify otherPleaseSpecify;
        ArrayList<PermissibleValue> answers = new ArrayList<PermissibleValue>();
    }

    public class Cde {
        String tinyId;
        String version;
        ArrayList<PermissibleValue> permissibleValues = new ArrayList<PermissibleValue>();

    }

    public class PermissibleValue {
        String permissibleValue;
        String valueMeaningName;
        String valueMeaningCode;
        String valueMeaningDefinition;
        String codeSystemName;
        String codeSystemVersion;
    }

    public class OtherPleaseSpecify {
        Boolean value = false;
    }

    public static class Classification {
        String stewardOrg = "NINDS";
        Boolean workingGroup;
        ArrayList<CsElt> elements = new ArrayList<CsElt>();
    }

    public static class CsElt {
        ArrayList<CsElt> elements = new ArrayList<CsElt>();
        String name;
    }

    public static class ReferenceDocument implements Comparable {
        String docType;
        String document;
        String referenceDocumentId;
        String text;
        String uri;
        String providerOrg;
        String title;
        String languageCode;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            ReferenceDocument that = (ReferenceDocument) o;

            if (docType != null ? !docType.equals(that.docType) : that.docType != null) return false;
            if (document != null ? !document.equals(that.document) : that.document != null) return false;
            if (referenceDocumentId != null ? !referenceDocumentId.equals(that.referenceDocumentId) : that.referenceDocumentId != null)
                return false;
            if (text != null ? !text.equals(that.text) : that.text != null) return false;
            if (uri != null ? !uri.equals(that.uri) : that.uri != null) return false;
            if (providerOrg != null ? !providerOrg.equals(that.providerOrg) : that.providerOrg != null) return false;
            if (title != null ? !title.equals(that.title) : that.title != null) return false;
            return !(languageCode != null ? !languageCode.equals(that.languageCode) : that.languageCode != null);

        }

        @Override
        public int hashCode() {
            int result = docType != null ? docType.hashCode() : 0;
            result = 31 * result + (document != null ? document.hashCode() : 0);
            result = 31 * result + (referenceDocumentId != null ? referenceDocumentId.hashCode() : 0);
            result = 31 * result + (text != null ? text.hashCode() : 0);
            result = 31 * result + (uri != null ? uri.hashCode() : 0);
            result = 31 * result + (providerOrg != null ? providerOrg.hashCode() : 0);
            result = 31 * result + (title != null ? title.hashCode() : 0);
            result = 31 * result + (languageCode != null ? languageCode.hashCode() : 0);
            return result;
        }

        @Override
        public int compareTo(Object o) {
            ReferenceDocument referenceDocument = (ReferenceDocument) o;
            return ((ReferenceDocument) o).uri.compareTo(this.uri);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Form form = (Form) o;
        if (this.naming.designation.equalsIgnoreCase(form.naming.designation)
                && equalCdes(this.cdes, form.cdes)
                && equalReferenceDocuments(this.referenceDocuments, form.referenceDocuments)) {
            this.classification.get(0).elements.add(form.disease);
            if (!form.subDisease.equals(form.disease)) {
                ArrayList<CsElt> diseases = this.classification.get(0).elements;
                for (int i = 0; i < diseases.size(); i++) {
                    if (diseases.get(i).name.equals(form.disease)) {
                        diseases.get(i).elements.add(form.subDisease);
                    }
                }
            }
            return true;
        }
        return false;
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
}
