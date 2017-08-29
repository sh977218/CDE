export let blankEncounter = {
    "resourceType": "Encounter",
    "id": null,
    "status": "finished",
    "class": {"code": "outpatient"},
    "type": [{"coding": [{"system": "http://snomed.info/sct", "code": "185349003"}], "text": "Outpatient Encounter"}],
    "period": {"start": null, "end": null},
    "subject": {
        "reference": null
    },
    "serviceProvider": {"reference": "Organization/23d90c98-3185-44d4-a5c1-e6921cf05ec7"}
};

export let blankObservation = {
    "resourceType": "Observation",
    "id": null,
    "status": "final",
    "category": [
        {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/observation-category",
                    "code": "vital-signs"
                }
            ]
        }
    ],
    "code": {
        "coding": [
            {
                "system": "http://loinc.org",
                "code": "8302-2",
                "display": "Body Height"
            }
        ],
        "text": "Body Height"
    },
    "subject": {
        "reference": null
    },
    "context": {
        "reference": null
    },
    "effectiveDateTime": null,
    "issued": null
};

export let mappings = [
    {
        "form": "599f0e0998032c744f2f1ed9",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "multi",
        "format": "json",
        "mapping": [
            {
                "resource": "Observation",
                "resourceName": "*",
                "resourceObj": "function (res) { return res.subject; }",
                "resourceProperty": "reference",
                "inFn": null,
                "outFn": "function (form) { return 'Patient/' + patient.id; }"
            },
            {
                "resource": "Observation",
                "resourceName": "*",
                "resourceObj": "function (res) { return res.context; }",
                "resourceProperty": "reference",
                "inFn": null,
                "outFn": "function (form) { return 'Encounter/' + encounter.raw.id; }"
            },
            {
                "resource": "Observation",
                "resourceName": "*",
                "resourceObj": "function (res) { return res; }",
                "resourceProperty": "effectiveDateTime",
                "inFn": "function (form, value) { form.formElements[0].formElements[0].question.answer = value;"
                + " parseDateTime(form.formElements[0].formElements[0]); }",
                "outFn": "function (form) { return encounter.date; }"
            },
            {
                "resource": "Observation",
                "resourceName": "*",
                "resourceObj": "function (res) { return res; }",
                "resourceProperty": "issued",
                "inFn": null,
                "outFn": "function (form) { return encounter.date; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Height",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "value",
                "inFn": "function (form, value) { form.formElements[0].formElements[5].question.answer = value; }",
                "outFn": "function (form) { return form.formElements[0].formElements[5].question.answer; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Height",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "unit",
                "inFn": "function (form, value) {"
                + " if (value === 'cm') form.formElements[0].formElements[6].question.answer = 'Centimeters';"
                + " if (value === 'inch') form.formElements[0].formElements[6].question.answer = 'Inches';"
                + " if (value === 'm') form.formElements[0].formElements[6].question.answer = 'meters';"
                + " if (value === 'foot') form.formElements[0].formElements[6].question.answer = 'feet'; }",
                "outFn": "function (form) { var value = form.formElements[0].formElements[6].question.answer;"
                + " if (value === 'Centimeters') return 'cm';"
                + " if (value === 'Inches') return 'inch';"
                + " if (value === 'meters') return 'm';"
                + " if (value === 'feet') return 'foot'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Height",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "system",
                "inFn": null,
                "outFn": "function (form) { return 'http://unitsofmeasure.org/'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Height",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "code",
                "inFn": null,
                "outFn": "function (form) { var value = form.formElements[0].formElements[6].question.answer;"
                + " if (value === 'Centimeters') return 'cm';"
                + " if (value === 'Inches') return 'inch';"
                + " if (value === 'meters') return 'm';"
                + " if (value === 'feet') return 'foot'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Weight",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "value",
                "inFn": "function (form, value) { form.formElements[0].formElements[3].question.answer = value; }",
                "outFn": "function (form) { return form.formElements[0].formElements[3].question.answer; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Weight",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "unit",
                "inFn": "function (form, value) {"
                + " if (value === 'kg') form.formElements[0].formElements[4].question.answer = 'Kilograms';"
                + " if (value === 'lb') form.formElements[0].formElements[4].question.answer = 'Pounds'; }",
                "outFn": "function (form) { var value = form.formElements[0].formElements[4].question.answer;"
                + " if (value === 'Kilograms') return 'kg';"
                + " if (value === 'Pounds') return 'lb'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Weight",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "system",
                "inFn": null,
                "outFn": "function (form) { return 'http://unitsofmeasure.org/'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Weight",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "code",
                "inFn": null,
                "outFn": "function (form) { var value = form.formElements[0].formElements[4].question.answer;"
                + " if (value === 'Kilograms') return 'kg';"
                + " if (value === 'Pounds') return 'lb'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Mass Index",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "value",
                "inFn": "function (form, value) { form.formElements[0].formElements[7].question.answer = value; }",
                "outFn": "function (form) { return form.formElements[0].formElements[7].question.answer; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Mass Index",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "unit",
                "inFn": "function (form, value) { form.formElements[0].formElements[8].question.answer = value; }",
                "outFn": "function (form) { return form.formElements[0].formElements[8].question.answer; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Mass Index",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "system",
                "inFn": null,
                "outFn": "function (form) { return 'http://unitsofmeasure.org/'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Body Mass Index",
                "resourceObj": "function (res) { return res.valueQuantity; }",
                "resourceProperty": "code",
                "inFn": null,
                "outFn": "function (form) { return form.formElements[0].formElements[8].question.answer; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Blood Pressure",
                "resourceObj": "function (res) { return res.component.filter(component => component.code.coding.filter("
                + "c => c.display === 'Systolic Blood Pressure').length > 0)[0].valueQuantity; }",
                "resourceProperty": "value",
                "inFn": "function (form, value) { form.formElements[0].formElements[1].question.answer = value; }",
                "outFn": "function (form) { return form.formElements[0].formElements[1].question.answer; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Blood Pressure",
                "resourceObj": "function (res) { return res.component.filter(component => component.code.coding.filter("
                + "c => c.display === 'Systolic Blood Pressure').length > 0)[0].valueQuantity; }",
                "resourceProperty": "unit",
                "inFn": null,
                "outFn": "function (form) { return 'mmHg'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Blood Pressure",
                "resourceObj": "function (res) { return res.component.filter(component => component.code.coding.filter("
                + "c => c.display === 'Systolic Blood Pressure').length > 0)[0].valueQuantity; }",
                "resourceProperty": "system",
                "inFn": null,
                "outFn": "function (form) { return 'http://unitsofmeasure.org/'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Blood Pressure",
                "resourceObj": "function (res) { return res.component.filter(component => component.code.coding.filter("
                + "c => c.display === 'Systolic Blood Pressure').length > 0)[0].valueQuantity; }",
                "resourceProperty": "code",
                "inFn": null,
                "outFn": "function (form) { return 'mmHg'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Blood Pressure",
                "resourceObj": "function (res) { return res.component.filter(component => component.code.coding.filter("
                + "c => c.display === 'Diastolic Blood Pressure').length > 0)[0].valueQuantity; }",
                "resourceProperty": "value",
                "inFn": "function (form, value) { form.formElements[0].formElements[2].question.answer = value; }",
                "outFn": "function (form) { return form.formElements[0].formElements[2].question.answer; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Blood Pressure",
                "resourceObj": "function (res) { return res.component.filter(component => component.code.coding.filter("
                + "c => c.display === 'Diastolic Blood Pressure').length > 0)[0].valueQuantity; }",
                "resourceProperty": "unit",
                "inFn": null,
                "outFn": "function (form) { return 'mmHg'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Blood Pressure",
                "resourceObj": "function (res) { return res.component.filter(component => component.code.coding.filter("
                + "c => c.display === 'Diastolic Blood Pressure').length > 0)[0].valueQuantity; }",
                "resourceProperty": "system",
                "inFn": null,
                "outFn": "function (form) { return 'http://unitsofmeasure.org/'; }"
            },
            {
                "resource": "Observation",
                "resourceName": "Blood Pressure",
                "resourceObj": "function (res) { return res.component.filter(component => component.code.coding.filter("
                + "c => c.display === 'Diastolic Blood Pressure').length > 0)[0].valueQuantity; }",
                "resourceProperty": "code",
                "inFn": null,
                "outFn": "function (form) { return 'mmHg'; }"
            },
        ]
    }
];
