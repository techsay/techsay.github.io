(window.webpackJsonp=window.webpackJsonp||[]).push([[68],{319:function(e,t,a){"use strict";a.r(t);var n=a(4),_=function(e){e.options.__data__block__={mermaid_382ee16d:"graph LR;\n  A--\x3eB--\x3eC--\x3enull\n  \n",mermaid_382ee189:"graph LR\n\t\tnull_l --\x3e A\n\t\tA --\x3e B\n\t\tB --\x3e C & A\n    C --\x3e D & B\n    D --\x3e C & null_r\n    \n",mermaid_382ee1a5:"graph LR\n\t\tA --\x3e B\n\t\tB --\x3e C\n    C --\x3e D\n    D --\x3e E\n    E --\x3e A\n",mermaid_382ee1a9:"graph LR\n\t\tA --\x3e B\n\t\tB --\x3e C\n    C --\x3e D\n    D --\x3e E\n    E --\x3e C\n",mermaid_382ee1e0:"graph LR\n\t\tA --\x3e B\n\t\tB --\x3e E\n    C --\x3e D\n    D --\x3e E\n    E --\x3e F\n    F --\x3e null\n",mermaid_382ee1e4:"graph LR\n\t\tA --\x3e B\n\t\tB --\x3e E\n    C --\x3e D\n    D --\x3e E\n    E --\x3e F\n    F --\x3e G\n    G --\x3e E\n"}},r=Object(n.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h3",{attrs:{id:"链表"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#链表"}},[e._v("#")]),e._v(" 链表")]),e._v(" "),t("div",{staticClass:"custom-block tip"},[t("p",{staticClass:"custom-block-title"},[e._v("链表")]),e._v(" "),t("p",[e._v("1、物理存储上可以非连续的")]),e._v(" "),t("p",[e._v("2、数据元素的逻辑顺序通过链表中的指针链接次序，实现的一种线性存储结构。")])]),e._v(" "),t("details",{staticClass:"custom-block details"},[t("summary",[e._v("查看详情")]),e._v(" "),t("p",[e._v("链表由一系列节点（链表中每一个元素称为节点）组成，节点在运行时动态生成 （malloc），每个节点包括两个部分：")]),e._v(" "),t("p",[e._v("一个是存储数据元素的"),t("strong",[e._v("数据域")])]),e._v(" "),t("p",[e._v("另一个是存储下一个节点地址的"),t("strong",[e._v("指针域")])]),e._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[e._v("//定义结点结构体\ntypedef struct Node\n{\n    //数据域\n    int num;\t\t//序号\n    //指针域\n    struct Node *next; //下一个节点\n    struct Node *pre; //前一个节点\n}Nod;\n")])])])]),e._v(" "),t("h4",{attrs:{id:"单向链表"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#单向链表"}},[e._v("#")]),e._v(" "),t("strong",[e._v("单向链表")]),e._v("：")]),e._v(" "),t("p",[e._v("链表最大的作用是通过节点把离散的数据链接在一起，常见单向链表是通过一个指针开始，向某一个方向移动，最终指向 null")]),e._v(" "),t("Mermaid",{attrs:{id:"mermaid_382ee16d",graph:e.$dataBlock.mermaid_382ee16d}}),t("p",[t("strong",[e._v("双向链表")]),e._v("：")]),e._v(" "),t("p",[e._v("​\t双向链表与单向链表的区别就是节点中有两个节点指针，分别指向前后两个节点，一个往前移动，一个往后移动。")]),e._v(" "),t("Mermaid",{attrs:{id:"mermaid_382ee189",graph:e.$dataBlock.mermaid_382ee189}}),t("p",[t("strong",[e._v("环")]),e._v("：")]),e._v(" "),t("p",[e._v("1、整体是个环：圆形链表，首尾相连")]),e._v(" "),t("Mermaid",{attrs:{id:"mermaid_382ee1a5",graph:e.$dataBlock.mermaid_382ee1a5}}),t("p",[e._v("2、后部分是环，指针从起点开始移动，最终会回到中间的某个节点，形成环")]),e._v(" "),t("Mermaid",{attrs:{id:"mermaid_382ee1a9",graph:e.$dataBlock.mermaid_382ee1a9}}),t("p",[t("strong",[e._v("链表相交：")])]),e._v(" "),t("p",[e._v("两条链表相交，一般指的是 两条 单向链表，相交的话说明尾部存在相同的连续节点")]),e._v(" "),t("p",[e._v("示例：")]),e._v(" "),t("p",[e._v("1、 相交-无环")]),e._v(" "),t("Mermaid",{attrs:{id:"mermaid_382ee1e0",graph:e.$dataBlock.mermaid_382ee1e0}}),t("p",[e._v("1、 相交-有环")]),e._v(" "),t("Mermaid",{attrs:{id:"mermaid_382ee1e4",graph:e.$dataBlock.mermaid_382ee1e4}}),t("p",[t("strong",[e._v("单链表表示")])]),e._v(" "),t("p",[e._v("返回头节点即可： Node *headNode;")])],1)}),[],!1,null,null,null);"function"==typeof _&&_(r);t.default=r.exports}}]);