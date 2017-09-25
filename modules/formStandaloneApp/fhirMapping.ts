export let blankEncounter = {
    "resourceType": "Encounter",
    "id": null,
    "status": "finished",
    "class": {"code": "outpatient"},
    "type": [{"coding": [{"system": "http://snomed.info/sct", "code": "185349003"}], "text": "Outpatient Encounter"}],
    "period": {"start": null, "end": null},
    "serviceProvider": {
        "reference": null
    },
    "subject": {
        "reference": null
    }
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
        "coding": [],
        "text": ""
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

export let mappings: any = [
    {
        "form": "59a70c4998032c744f365267",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "multi",
        "format": "json",
        "encounterFn": "function (form, encounter) { var fe = getById(form, 'abmAnDXu5my');"
        + " fe.question.answer = encounter.date; parseDateTime(fe); fe.question.editable = false; }",
        "mapping": [
            {
                "resource": "Observation",
                "resourceSystem": "LOINC",
                "resourceCode": "*",
                "resourcePropertyObj": "function (res) { return res.subject; }",
                "resourceProperty": "reference",
                "inFn": null,
                "outFn": "function (form) { return 'Patient/' + patient.id; }"
            },
            {
                "resource": "Observation",
                "resourceSystem": "LOINC",
                "resourceCode": "*",
                "resourcePropertyObj": "function (res) { return res.context; }",
                "resourceProperty": "reference",
                "inFn": null,
                "outFn": "function (form) { return 'Encounter/' + encounter.raw.id; }"
            },

            {
                "resource": "Observation",
                "resourceSystem": "LOINC",
                "resourceCode": "*",
                "resourcePropertyObj": null,
                "resourceProperty": "effectiveDateTime",
                "inFn": null,
                "outFn": "function (form) { return encounter.date; }"
            },

            {
                "resource": "Observation",
                "resourceSystem": "LOINC",
                "resourceCode": "*",
                "resourcePropertyObj": null,
                "resourceProperty": "issued",
                "inFn": null,
                "outFn": "function (form) { return encounter.date; }"
            },
            {
                "resource": "Observation",
                "resourceSystem": "LOINC",
                "resourceCode": "8302-2",
                "resourcePropertyObj": null,
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getByCode(form), 'UNITS'); }"
            },
            {
                "resource": "Observation",
                "resourceSystem": "LOINC",
                "resourceCode": "29463-7",
                "resourcePropertyObj": null,
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getByCode(form), 'UNITS'); }"
            },
            {
                "resource": "Observation",
                "resourceSystem": "LOINC",
                "resourceCode": "39156-5",
                "resourcePropertyObj": null,
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getByCode(form), 'UNITS'); }"
            },
            {
                "resource": "Observation",
                "resourceSystem": "LOINC",
                "resourceCode": "55284-4",
                "resourceComponentSystem": "LOINC",
                "resourceComponentCode": "8480-6",
                "resourcePropertyObj": "function (res) { return getComponent(res); }",
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getSubByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getSubByCode(form), 'UNITS'); }"
            },
            {
                "resource": "Observation",
                "resourceSystem": "LOINC",
                "resourceCode": "55284-4",
                "resourceComponentSystem": "LOINC",
                "resourceComponentCode": "8462-4",
                "resourcePropertyObj": "function (res) { return getComponent(res); }",
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getSubByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getSubByCode(form), 'UNITS'); }"
            }
        ]
    }
];
