export let mappings: any = [
    {
        "form": "myIn0ClU4",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "*",
        "format": "json",
        "mapping": [
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
                "resourceCode": "18262-6",
                "resourcePropertyObj": null,
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getByCode(form), 'UNITS'); }"
            }
        ]
    },
    {
        "form": "XkYu_yWI4",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "*",
        "format": "json",
        "mapping": [
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
                "resourceCode": "2085-9",
                "resourcePropertyObj": null,
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getByCode(form), 'UNITS'); }"
            }
        ]
    },
    {
        "form": "7kMIzyWU4",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "*",
        "format": "json",
        "mapping": [
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
                "resourceCode": "2093-3",
                "resourcePropertyObj": null,
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getByCode(form), 'UNITS'); }"
            }
        ]
    },
    {
        "form": "XkNeXJWI4",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "*",
        "format": "json",
        "mapping": [
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
                "resourceCode": "2571-8",
                "resourcePropertyObj": null,
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getByCode(form), 'UNITS'); }"
            }
        ]
    },
    {
        "form": "QJsozRgLN",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "*",
        "format": "json",
        "encounterFn": "function (form, encounter) { var fe = getById(form, 'mJ2HQCxI4');"
        + " fe.question.answer = encounter.date; parseDateTime(fe); fe.question.editable = false; }",
        "mapping": []
    },
    {
        "form": "7k_orCeLV",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "*",
        "format": "json",
        "mapping": [
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
    },
    {
        "form": "XJNUPRg8N",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "*",
        "format": "json",
        "mapping": [
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
                "resourceCode": "29463-7",
                "resourcePropertyObj": null,
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getByCode(form), 'UNITS'); }"
            }
        ]
    },
    {
        "form": "XJ_UuReU4",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "*",
        "format": "json",
        "mapping": [
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
                "resourceCode": "8302-2",
                "resourcePropertyObj": null,
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getByCode(form), 'UNITS'); }"
            }
        ]
    },
    {
        "form": "7JqAORlIN",
        "type": "external",
        "system": "http://hl7.org/fhir",
        "code": "*",
        "format": "json",
        "mapping": [
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
                "resourceCode": "39156-5",
                "resourcePropertyObj": null,
                "resourceProperty": "valueQuantity",
                "inFn": "function (form, value) { setValueQuantity(getByCode(form), value); }",
                "outFn": "function (form) { return getValueQuantity(getByCode(form), 'UNITS'); }"
            }
        ]
    }
];
