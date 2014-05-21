var config = {};
config.vsac = {
    host: 'vsac.nlm.nih.gov'
    , port: '443'
    , ticket: {
        path: '/vsac/ws/Ticket'
    }
    , valueSet: {
        path: '/vsac/ws/RetrieveValueSet'
    }
};

config.umls = {
    licenseCode: "NLM-4110134256"
};

config.internalIP = "130.14.";

module.exports = config;




