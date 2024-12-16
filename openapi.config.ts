const { generateService } = require("@umijs/openapi");

generateService({
    requestLibPath: "import request from '@/libs/request'",
    // schemaPath: "http://localhost:8101/api/v2/api-docs",
    // 暂时让后端上云了
    schemaPath: "http://116.198.200.68:8101/api/v2/api-docs",
    serversPath: "./src",
});

//这边也在报错