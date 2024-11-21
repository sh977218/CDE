var mapping = [
    {value: "Never", code: "LA6270-8"},
    {value: "Rarely", code: "LA10066-1"},
    {value: "Sometimes", code: "LA10082-8"},
    {value: "Often", code: "LA10044-8"},
    {value: "Always", code: "LA9933-8"},
    {value: "Not at all", code: "LA6568-5"},
    {value: "A little bit", code: "LA13863-8"},
    {value: "Somewhat", code: "LA13909-9"},
    {value: "Quite a bit", code: "LA13902-4"},
    {value: "Very much", code: "LA13914-9"},
    {value: "Almost never", code: "LA13866-1"},
    {value: "Almost always", code: "LA13865-3"},
    {value: "Usually", code: "LA14747-2"},
    {value: "Without any difficulty", code: "LA13921-4"},
    {value: "With a little difficulty", code: "LA13918-0"},
    {value: "With some difficulty", code: "LA13920-6"},
    {value: "With much difficulty", code: "LA13919-8"},
    {value: "Unable to do", code: "LA13912-3"},
    {value: "Very little", code: "LA13947-9"},
    {value: "Quite a lot", code: "LA11911-7"},
    {value: "Cannot do", code: "LA13868-7"},
    {value: "With no trouble", code: "LA13953-7"},
    {value: "With a little trouble", code: "LA13954-5"},
    {value: "With some trouble", code: "LA13955-2"},
    {value: "With a lot of trouble", code: "LA13956-0"},
    {value: "Not able to do", code: "LA13957-8"}
];

exports.getMapping = function (value) {
    var result;
    mapping.forEach(function (_m) {
        if (value.toLowerCase().trim() === _m.value.toLowerCase()) {
            result = _m;
        }
    });
    return result;
};

