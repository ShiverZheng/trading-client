# trading-client

### ESLint
使用 Airbnb规范

在`.vsocde/settings.json`中配置ESLint：实现自动格式化代码，不需要额外使用Prettier
```json
{
    "eslint.run": "onType",
    "eslint.options": {
        "configFile": ".eslintrc.yml",
        "extensions": [".js", ".ts", ".jsx", ".tsx"]
    },
    "editor.codeActionsOnSave": {
        "source.fixAll": true
    }
}