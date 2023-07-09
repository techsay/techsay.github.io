(window.webpackJsonp=window.webpackJsonp||[]).push([[84],{396:function(t,s,e){"use strict";e.r(s);var a=e(4),l=Object(a.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h4",{attrs:{id:"前言"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#前言"}},[t._v("#")]),t._v(" 前言")]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("前言")]),t._v(" "),s("p",[t._v("编程语言：")]),t._v(" "),s("p",[t._v("机器语言 ----\x3e 汇编语言  ----\x3e  面向过程语言（比如C）  ----\x3e  面向对象 C++ 等 ---\x3e 。。。")]),t._v(" "),s("p",[t._v("汇编语言作为一门低级语言，其实它的语法更简单，但是代码可读性就会越差，代码的维护性就会越差，维护困难的语言不利于大型项目的开发，程序员的开发难度、项目的维护成本就会加大")]),t._v(" "),s("p",[t._v("这样高级语言的快速发展成为必然")]),t._v(" "),s("p",[t._v("因此，想要学习汇编不能单纯背诵语法，没有实战项目的需要，很快就会忘的一干二净")]),t._v(" "),s("p",[t._v("为啥要学汇编语法？")]),t._v(" "),s("p",[t._v("局部变量是怎么存储的，内存怎么分区的，函数是如何调用的，程序又是如何启动的 等等 ？")]),t._v(" "),s("p",[t._v("当你学完c 或者其他高级语言后，尽管您已经熟练掌握并且开发了较为复杂的软件，但是依然有种对编程语言底层运行机制的陌生感，恰好又想去了解一下，那么就需要学习一下汇编了")]),t._v(" "),s("p",[t._v("每个人学习的动机不同，应该根据自己的学习动机来确定学习的目标")]),t._v(" "),s("p",[t._v("储备")]),t._v(" "),s("p",[t._v("学汇编语法前提是需要有一点编程基础的，只要有过开发经历的同学都可以进行学习，否则建议先了解一下高级语言，或者 c 语言语法\n本文将通过对比c 语言来了解汇编语言，为进一步深入了解其他语言")])]),t._v(" "),s("h4",{attrs:{id:"hello-world"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#hello-world"}},[t._v("#")]),t._v(" Hello World!")]),t._v(" "),s("p",[t._v("按照国际惯例，不管是编程语言，还是编程软件，先来个 Hello World! 吧")]),t._v(" "),s("p",[t._v("网上找一个在线编译的网站，有很多，我随便找一个如下：")]),t._v(" "),s("p",[t._v("打开网站 https://www.nhooo.com/tool/assembly/")]),t._v(" "),s("p",[t._v("映入眼帘的就是默认展示一段 输出 Hello World! 的汇编代码")]),t._v(" "),s("div",{staticClass:"language-assembly extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[t._v("section    .text\n    global _start       ;must be declared for using gcc\n_start:                     ;tell linker entry point\n    mov edx, len    ;message length\n    mov ecx, msg    ;message to write\n    mov ebx, 1      ;file descriptor (stdout)\n    mov eax, 4      ;system call number (sys_write)\n    int 0x80        ;call kernel\n    mov eax, 1      ;system call number (sys_exit)\n    int 0x80        ;call kernel\n\nsection .data\n\nmsg db  'Hello, world!',0xa ;our dear string\nlen equ $ - msg         ;length of our dear string\n")])])]),s("p",[t._v("（运行结果没反应，八成是在线服务不支持了。。。😓，很多在线编译器都关闭了汇编的支持）")]),t._v(" "),s("p",[t._v("接着去一顿搜索，发现有说使用VsCode 比较方便，然后跟着下载安装，给我的一个示例是这样的：")]),t._v(" "),s("div",{staticClass:"language-assembly extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[t._v("data SEGMENT\n    hello  DB 'Hello World!$' ;注意要以$结束\ndata ENDS\ncode SEGMENT\n    ASSUME CS:CODE,DS:DATA\nstart:\n    MOV AX,data  ;将data首地址赋值给AX                \n    MOV DS,AX    ;将AX赋值给DS,使DS指向data\n    LEA DX,hello ;使DX指向hello首地址\n    MOV AH,09h   ;给AH设置参数09H\n    INT 21h      ;执行AH中设置的09H号功能。输出DS指向的DX指向的字符串hello\n    MOV AX,4C00h ;给AH设置参数4C00h\n    int 21h      ;调用4C00h号功能，结束程序\ncode ENDS\nEND start\n")])])]),s("p",[t._v("右键代码文件，运行当前文件，结果正常打印 Hello World!")]),t._v(" "),s("p",[t._v("咋和前面示例语法不一样呢？？？")]),t._v(" "),s("p",[t._v("于是搜索 汇编 Hello World! 示例代码，乖乖")]),t._v(" "),s("p",[t._v("有这样的：")]),t._v(" "),s("div",{staticClass:"language-assembly extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[t._v('[bits 64]\n    global _start\n \n    section .data\n    message db "Hello, World!"\n \n    section .text\n_start:\n    mov rax, 1\n    mov rdx, 13\n    mov rsi, message\n    mov rdi, 1\n    syscall\n \n    mov rax, 60\n    mov rdi, 0\n    syscall\n\n')])])]),s("p",[t._v("还有这样的：")]),t._v(" "),s("div",{staticClass:"language-assembly extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[t._v("bdos    equ    0005H    ; BDOS entry point\nstart:  mvi    c,9      ; BDOS function: output string\n          lxi    d,msg$   ; address of msg\n          call   bdos\n          ret             ; return to CCP\nmsg$:   db    'Hello, world!$'\nend     start\n")])])]),s("p",[t._v("可以说是多姿多彩，百花齐放。。。")]),t._v(" "),s("p",[t._v("眼花缭乱。。。")]),t._v(" "),s("p",[t._v("😓 我菜了的，显示一个字符串都这么复杂，从零到放弃！")]),t._v(" "),s("p",[t._v("明天再说，再见！")])])}),[],!1,null,null,null);s.default=l.exports}}]);