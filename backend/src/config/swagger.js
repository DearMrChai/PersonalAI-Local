import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PersonalAI API',
      version: '1.0.0',
      description: '本地个人AI助手后端接口文档',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
  },
  apis: ['./src/routes/*.js'], // 指向你的路由文件
};

export const swaggerSpec = swaggerJSDoc(options);