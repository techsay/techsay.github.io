#### vuepress-theme-vdoing

My site is live at https://techsay.github.io/

```scss

安装参考介绍：
https://blog.csdn.net/weixin_42875245/article/details/108559224

先参考官网安装环境，需要用到命令 yarn 或者 npm：

// 创建项目文件夹
mkdir vuepress-starter && cd vuepress-starter
// 进行初始化设置
yarn init  
或者使用
npm init

// 安装theme
npm install vuepress-theme-vdoing -D

```



在package.json中添加



```scss
 "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  }
```



创建docs文件夹

```scss
├── docs
│   ├── .vuepress (可选的)
│   │   ├── components (可选的)
│   │   ├── theme (可选的)
│   │   │   └── Layout.vue
│   │   ├── public (可选的)
│   │   ├── styles (可选的)
│   │   │   ├── index.styl
│   │   │   └── palette.styl
│   │   ├── templates (可选的, 谨慎配置)
│   │   │   ├── dev.html
│   │   │   └── ssr.html
│   │   ├── config.js (可选的)
│   │   └── enhanceApp.js (可选的)
│   │ 
│   ├── README.md
│   ├── guide
│   │   └── README.md
│   └── config.md
│ 
└── package.json
```



调试和编译：

```scss
// 启动测试服务：
npm run dev


// 编译文件命令（html 文件生成到docs/.vuepress/dist中）
npm run build


```



上传平台

```scss
平台： GitHub Pages、Coding Pages、 gitee Pages ，设置分支根目录在 docs路径

复制 docs/.vuepress/dist 中文件到 git 跟路径下 docs 文件中

推送文件到 git
```

