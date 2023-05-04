// nav 配置, 即上方导航栏
export default [
  { text: "首页", link: "/" },
  {
    text: '测试知识库',
    link: '/test/'
  },
  {
    text: "相关链接",
    items: [
      {
        text: "测试百度的链接",
        link: "https://www.baidu.com",
      },
    ],
  },
];
