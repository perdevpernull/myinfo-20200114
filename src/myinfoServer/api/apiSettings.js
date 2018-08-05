function apiSettingsV1(req, res, next) {
    switch (req.method) {
        case "GET":
            console.log(`GET settings`);
            break;
        case "PUT":
            console.log(`PUT`);
            break;
        default:
            console.log(`default`);
            break; 
    };
};

export {apiSettingsV1};