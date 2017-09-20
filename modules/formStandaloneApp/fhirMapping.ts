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

export let mappings: any = [
    {
        "form": "59a70c4998032c744f365267",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "multi",
        "format": "json",
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
                "inFn": "function (form, value) { var fe = getById(form, 'abmAnDXu5my'); fe.question.answer = value;"
                + " parseDateTime(fe); fe.question.editable = false; }",
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
