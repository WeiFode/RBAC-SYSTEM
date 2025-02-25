# RBAC Admin - RBAC权限管理系统

## 📦 项目预览图

![RBAC Admin](./src/public/1.png)
![RBAC Admin](./src/public/2.png)
![RBAC Admin](./src/public/3.png)
![RBAC Admin](./src/public/4.png)
![RBAC Admin](./src/public/5.png)
![RBAC Admin](./src/public/6.png)
![RBAC Admin](./src/public/7.png)

## 🚀🛠 技术功能

- **Next.js**
- **TypeScript**
- **动态菜单页面渲染**: app无需定义路由文件夹，只需在components下组件化开发
- **Next-Auth与高阶函数HOC结合使用**: 会话管理功能， CSRF 保护，token鉴权，提高安全性
- **用户管理**: 内含部门，用户，角色关联关系
- **角色管理**: 角色与菜单关联关系。
- **菜单管理**: 菜单与权限+角色关联关系
- **字典管理**: 方便管理各类配置项。

- Next.js 14
- React 18
- TypeScript
- Ant Design
- Tailwind CSS
- Next-Auth
- React Query
- iconify-icons

## 🚦 快速开始

1. 克隆仓库:
   ```bash
   git clone https://https://github.com/lwf123456789/RBAC-SYSTEM.git
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 运行开发服务器:
   ```bash
   npm run dev
   ```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
RBAC-SYSTEM/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├────├****          # API 路由(客户端先去请求服务端，服务端去请求后端，解决跨域)
│   │   ├────├auth/...[...nextauth] # next-auth配置和登录操作配置
│   │   ├── layout.tsx   # 根布局
│   │   ├── page.tsx     # 根页面（默认页面/初次渲染/首次加载）
│   ├── components/      # React 组件
│   │   ├── Header/      # 头部组件
│   │   ├── Sidebar/     # 侧边栏组件
│   │   ├── Layouts/     # 布局组件
│   │   ├── Pagination/  # tailwind自定义封装分页组件
│   │   └── system/      # 系统管理相关组件（动态菜单页面就按照这样的格式）
│   ├── contexts/        # React 上下文
│   ├── hooks/           # 自定义hooks封装
│   ├── data/            # 静态数据
│   ├── styles/          # 全局样式
│   ├── types/           # TypeScript 类型定义
│   └── utils/           # 工具函数
├── public/              # 静态资源
├── .babelrc             # Babel 配置
├── .eslintrc.json       # ESLint 配置
├── next.config.mjs      # Next.js 配置
├── package.json         # 项目依赖和脚本
└── tsconfig.json        # TypeScript 配置
```

## 📞 联系我们

如有任何问题或建议，可以联系 [linwei688668@gmail.com](mailto:linwei688668@gmail.com)。