(window.webpackJsonp=window.webpackJsonp||[]).push([[94],{403:function(n,e,i){"use strict";i.r(e);var t=i(4),v=Object(t.a)({},(function(){var n=this,e=n._self._c;return e("ContentSlotsDistributor",{attrs:{"slot-key":n.$parent.slotKey}},[e("p",[n._v("文档：")]),n._v(" "),e("p",[n._v("https://cs140e.sergio.bz/docs/ARMv8-A-Programmer-Guide.pdf")]),n._v(" "),e("p",[n._v("翻译： https://zhuanlan.zhihu.com/p/453356511")]),n._v(" "),e("p",[e("a",{attrs:{href:"https://cuiyonghua.blog.csdn.net/article/details/130967646?spm=1001.2101.3001.6650.5&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-5-130967646-blog-131444672.235%5Ev38%5Epc_relevant_anti_t3_base&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-5-130967646-blog-131444672.235%5Ev38%5Epc_relevant_anti_t3_base&utm_relevant_index=10",target:"_blank",rel:"noopener noreferrer"}},[n._v("ARM64、x86基础知识介绍和区别"),e("OutboundLink")],1)]),n._v(" "),e("p",[n._v("一. 概述\nCPU的两大架构：ARM和X86。")]),n._v(" "),e("p",[n._v("ARM：ARM64是CPU构架的一种，通常用于手机、平板等CPU，目前笔记本电脑也会采用ARM64构架的CPU。\nx86：x86是CPU构架的一种，通常用于笔记本电脑、台式电脑、服务器、超级计算机。\n二. ARM\n手机和PC端CPU的ARM架构\nARM是一种CPU架构，常用在手机上，套用一句话：ARM不生产芯片，只提供一个芯片设计的Idea。\n可以说，作为一家不生产芯片的芯片厂商，ARM却在全球范围内支撑起了各种嵌入式设备、智能手机、平板电脑、智能穿戴和物联网设备的运行，只是ARM每年都会从构建上述设备体内的上亿颗处理器中“抽成”，严格遵守薄利多销的运营模式。")]),n._v(" "),e("p",[n._v("手机CPU的主流品牌，绝大数是采用ARM架构，当然现在ARM也进军PC市场。")]),n._v(" "),e("p",[n._v("高通骁龙(snapdragon)\n三星(Exynos)\n联发科(Helio)\n华为(麒麟)\n苹果 (A11，A7，A6)\nIntel\nNvidia\n安卓apk/lib 目录下的几个文件夹：\narm64-v8a\narmeabi-v7a\nIOS模拟器")]),n._v(" "),e("p",[n._v("4s-5: i386\n5s-7s Plus: x86_64\n真机(iOS设备):\narmv6: iPhone、iPhone 2、iPhone 3G、iPod Touch(第一代)、iPod Touch(第二代)\narmv7: iPhone 3Gs、iPhone 4、iPhone 4s、iPad、iPad 2\narmv7s: iPhone 5、iPhone 5c (静态库只要支持了armv7,就可以在armv7s的架构上运行)\narm64(注:无armv64): iPhone 5s、iPhone 6、iPhone 6 Plus、iPhone 6s、iPhone 6s Plus、 iPhone 7 、iPhone 7 Plus、iPad Air、iPad Air2、iPad mini2、iPad mini3、iPad mini4、iPad Pro\n三. x86\n电脑CPU的x86架构\n主流品牌：")]),n._v(" "),e("p",[n._v("Inter(英特尔)\nAMD\n比如操作系统区分")]),n._v(" "),e("p",[n._v("Windows 10 (Multiple Editions) (x64) - DVD (Chinese-Simplified)\nWindows 10 (Multiple Editions) (x86) - DVD (Chinese-Simplified)\nX86架构源于英特尔几十年前出品的CPU型号8086（包括后续型号8088/80286/80386/80486/80586）。\n8086以及8088被当时的IBM采用，制造出了名噪一时的IBM PC机，从此个人电脑风靡一时。\n你如果年龄不是很小，可能听说过早年的386电脑、486电脑乃至586电脑的说法，就是从这来的。后来英特尔注册了奔腾品牌，不再沿用686、786……这样的命名，但后来的奔腾、奔腾2、奔腾3、奔腾4，以及我们熟悉的酷睿架构，都是从当初的80X86一脉相承下来的架构，只是不断优化、扩充功能、提升性能而已。而其他X86处理器厂商，比如AMD、威盛、全美达（已退出X86领域）等，其产品也都兼容X86架构。\nX64是X86_X64的简称之所以叫X86，是因为实在应用得过于广泛导致X86直接成为了其代名词。")]),n._v(" "),e("p",[n._v("X32和X64------这两个概念你可以大致的认为它们是居于X86之下（之内）的两个子概念。")]),n._v(" "),e("p",[n._v("它们指的不是CPU架构，而是CPU寄存器、运算器能访问、处理的数据位宽，以及与此相关的一整套CPU设计规范。\nX32 CPU------32位的CPU（32bit的CPU）; X64 CPU------64位的CPU（64bit的CPU）\n简单的说，X32的X86CPU只能处理32位的数据、运行32位的操作系统；\nX64的 CPU则可以处理64位以及32位的数据、运行32位以及64位的操作系统------X64向下兼容X32。")]),n._v(" "),e("p",[n._v("奔腾直到奔腾4早期型号的CPU，都是X32的X86架构；")]),n._v(" "),e("p",[n._v("从后期的奔腾4 CPU开始直至今天的酷睿i架构的CPU，都是X64的X86架构。")]),n._v(" "),e("p",[n._v("当然，AMD的处理器目前也都是X64的X86架构。")]),n._v(" "),e("p",[n._v("四. ARM与X86架构对比\nX86：复杂指令集CISC：高性能，速度快。完成量大。(内存、硬盘)易扩展。但是功耗很大。多应用于台式电脑；\nARM：精简指令集RISC：低功耗，耗电少。效率高。(存储、内存等)难扩展。多应用于手机、电脑")]),n._v(" "),e("p",[n._v("X86和ARM的处理器除了最本质的复杂指令集（CISC)和精简指令集（RISC）的区别之外，下面我们再从以下几个方面对比下ARM和X86架构。")]),n._v(" "),e("p",[n._v("一、制造工艺\nARM和Intel处理器的一大区别是ARM从来只是设计X86低功耗处理器，Intel的强项是设计超高性能的台式机和服务器处理器。")]),n._v(" "),e("p",[n._v("二、64位计算\n对于64位计算，ARM和Intel也有一些显著区别。Intel并没有开发64位版本的x86指令集。64位的指令集名为x86-64（有时简称为x64），实际上是AMD设计开发的。Intel想做64位计算，它知道如果从自己的32位x86架构进化出64位架构，新架构效率会很低，于是它搞了一个新64位处理器项目名为IA64。由此制造出了Itanium系列处理器。")]),n._v(" "),e("p",[n._v("同时AMD知道自己造不出能与IA64兼容的处理器，于是它把x86扩展一下，加入了64位寻址和64位寄存器。最终出来的架构，就是 AMD64，成为了64位版本的x86处理器的标准。IA64项目并不算得上成功，现如今基本被放弃了。Intel最终采用了AMD64。Intel当前给出的移动方案，是采用了AMD开发的64位指令集（有些许差别）的64位处理器。")]),n._v(" "),e("p",[n._v("而ARM在看到移动设备对64位计算的需求后，于2011年发布了ARMv8 64位架构，这是为了下一代ARM指令集架构工作若干年后的结晶。为了基于原有的原则和指令集，开发一个简明的64位架构，ARMv8使用了两种执行模式，AArch32和AArch64。顾名思义，一个运行32位代码，一个运行64位代码（详情戳）。ARM设计的巧妙之处，是处理器在运行中可以无缝地在两种模式间切换。这意味着64位指令的解码器是全新设计的，不用兼顾32位指令，而处理器依然可以向后兼容。")]),n._v(" "),e("p",[n._v("三、异构计算\nARM的big.LITTLE架构是一项Intel一时无法复制的创新。在big.LITTLE架构里，处理器可以是不同类型的。传统的双核或者四核处理器中包含同样的2个核或者4个核。一个双核Atom处理器中有两个一模一样的核，提供一样的性能，拥有相同的功耗。ARM通过big.LITTLE向移动设备推出了**异构计算。这意味着处理器中的核可以有不同的性能和功耗。当设备正常运行时，使用低功耗核，而当你运行一款复杂的游戏时，使用的是高性能的核。")]),n._v(" "),e("p",[n._v("————————————————\n原文链接：https://blog.csdn.net/cui_yonghua/article/details/130967646")])])}),[],!1,null,null,null);e.default=v.exports}}]);