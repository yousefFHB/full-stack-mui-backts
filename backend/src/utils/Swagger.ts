import swaggerJSDoc from "swagger-jsdoc";
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "mui-app-ts",
            version: "1.0.0",
            description: "mui-app-ts API",
        },
        servers: [
            { url: "http://localhost:5000" }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/Modules/**/docs.ts']
}
export const swaggerSpec = swaggerJSDoc(options);