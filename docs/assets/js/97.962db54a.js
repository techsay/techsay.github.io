(window.webpackJsonp=window.webpackJsonp||[]).push([[97],{409:function(v,_,t){"use strict";t.r(_);var d=t(4),p=Object(d.a)({},(function(){var v=this,_=v._self._c;return _("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[_("p",[v._v("https://www.jb51.net/article/224613.htm")]),v._v(" "),_("p",[v._v("https://www.jb51.net/article/179499.htm")]),v._v(" "),_("p",[v._v("https://www.jb51.net/article/230062.htm")]),v._v(" "),_("p",[v._v("1.通用数据传送指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td",[v._v("MOV")]),v._v(" "),_("td",[v._v("move")]),v._v(" "),_("td",[v._v("MOV dest,src ;dest←src，MOV指令把一个字节或字的操作数从源地址src传送至目的地址dest。")])]),v._v(" "),_("tr",[_("td",[v._v("MOVSX")]),v._v(" "),_("td",[v._v("extended move with sign data")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("MOVZX")]),v._v(" "),_("td",[v._v("extended move with zero data")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("PUSH")]),v._v(" "),_("td",[v._v("push")]),v._v(" "),_("td",[v._v("进栈指令")])]),v._v(" "),_("tr",[_("td",[v._v("POP")]),v._v(" "),_("td",[v._v("pop")]),v._v(" "),_("td",[v._v("出栈指令")])]),v._v(" "),_("tr",[_("td",[v._v("PUSHA")]),v._v(" "),_("td",[v._v("push all")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("POPA")]),v._v(" "),_("td",[v._v("pop all")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("PUSHAD")]),v._v(" "),_("td",[v._v("push all data")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("POPAD")]),v._v(" "),_("td",[v._v("pop all data")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("BSWAP")]),v._v(" "),_("td",[v._v("byte swap")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("XCHG")]),v._v(" "),_("td",[v._v("exchange")]),v._v(" "),_("td",[v._v("交换指令，内容交换 xchg ah,al ;ax=7856h")])]),v._v(" "),_("tr",[_("td",[v._v("CMPXCHG")]),v._v(" "),_("td",[v._v("compare and change")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("XADD")]),v._v(" "),_("td",[v._v("exchange and add")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("XLAT")]),v._v(" "),_("td",[v._v("translate")]),v._v(" "),_("td",[v._v("换码指令用于将BX指定的缓冲区中、AL指定的位移处的数据取出赋给AL")])])])]),v._v(" "),_("p",[v._v("2.输入输出端口传送指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td",[v._v("IN")]),v._v(" "),_("td",[v._v("input")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("OUT")]),v._v(" "),_("td",[v._v("output")]),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("3.目的地址传送指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td",[v._v("LEA")]),v._v(" "),_("td",[v._v("load effective addres")]),v._v(" "),_("td",[v._v("有效地址传送指令")])]),v._v(" "),_("tr",[_("td",[v._v("LDS")]),v._v(" "),_("td",[v._v("load DS")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("LES")]),v._v(" "),_("td",[v._v("load ES")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("LFS")]),v._v(" "),_("td",[v._v("load FS")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("LGS")]),v._v(" "),_("td",[v._v("load GS")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("LSS")]),v._v(" "),_("td",[v._v("load SS")]),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("mov bx,0400h")]),v._v(" "),_("p",[v._v("mov si,3ch\nlea bx,[bx+si+0f62h] ;BX=139EH")]),v._v(" "),_("p",[v._v("这里BX得到的是主存单元的有效地址，不是物理地址，也不是该单元的内容。")]),v._v(" "),_("p",[v._v("4.标志传送指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td",[v._v("LAHF")]),v._v(" "),_("td",[v._v("load AH from flag")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("SAHF")]),v._v(" "),_("td",[v._v("save AH to flag")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("PUSHF")]),v._v(" "),_("td",[v._v("push flag")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("POPF")]),v._v(" "),_("td",[v._v("pop flag")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("PUSHD")]),v._v(" "),_("td",[v._v("push dflag")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("POPD")]),v._v(" "),_("td",[v._v("pop dflag")]),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("二、算术运算指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td",[v._v("ADD")]),v._v(" "),_("td",[v._v("add")]),v._v(" "),_("td",[v._v("加法指令 mov al,0f10 ;al=0f10")])]),v._v(" "),_("tr",[_("td",[v._v("ADC")]),v._v(" "),_("td",[v._v("add with carry")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("INC")]),v._v(" "),_("td",[v._v("increase 1")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("AAA")]),v._v(" "),_("td",[v._v("ascii add with adjust")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("DAA")]),v._v(" "),_("td",[v._v("decimal add with adjust")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("SUB")]),v._v(" "),_("td",[v._v("substract")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("SBB")]),v._v(" "),_("td",[v._v("substract with borrow")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("DEC")]),v._v(" "),_("td",[v._v("decrease 1")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("NEC")]),v._v(" "),_("td",[v._v("negative")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("CMP")]),v._v(" "),_("td",[v._v("compare")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("AAS")]),v._v(" "),_("td",[v._v("ascii adjust on substract")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("DAS")]),v._v(" "),_("td",[v._v("decimal adjust on substract")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("MUL")]),v._v(" "),_("td",[v._v("multiplication")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("IMUL")]),v._v(" "),_("td",[v._v("integer multiplication")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("AAM")]),v._v(" "),_("td",[v._v("ascii adjust on multiplication")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("DIV")]),v._v(" "),_("td",[v._v("divide")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("IDIV")]),v._v(" "),_("td",[v._v("integer divide")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("AAD")]),v._v(" "),_("td",[v._v("ascii adjust on divide")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("CBW")]),v._v(" "),_("td",[v._v("change byte to word")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("CWD")]),v._v(" "),_("td",[v._v("change word to double word")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("CWDE")]),v._v(" "),_("td",[v._v("change word to double word with sign to EAX")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("CDQ")]),v._v(" "),_("td",[v._v("change double word to quadrate word")]),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("三、逻辑运算指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td",[v._v("AND")]),v._v(" "),_("td",[v._v("and")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("or")]),v._v(" "),_("td",[v._v("or")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("XOR")]),v._v(" "),_("td",[v._v("xor")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("NOT")]),v._v(" "),_("td",[v._v("not")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("TEST")]),v._v(" "),_("td",[v._v("test")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("SHL")]),v._v(" "),_("td",[v._v("shift left")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("SAL")]),v._v(" "),_("td",[v._v("arithmatic shift left")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("SHR")]),v._v(" "),_("td",[v._v("shift right")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("SAR")]),v._v(" "),_("td",[v._v("arithmatic shift right")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("ROL")]),v._v(" "),_("td",[v._v("rotate left")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("ROR")]),v._v(" "),_("td",[v._v("rotate right")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("RCL")]),v._v(" "),_("td",[v._v("rotate left with carry")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("RCR")]),v._v(" "),_("td",[v._v("rotate right with carry")]),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("四、串指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td",[v._v("MOVS")]),v._v(" "),_("td",[v._v("move string")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("CMPS")]),v._v(" "),_("td",[v._v("compare string")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("SCAS")]),v._v(" "),_("td",[v._v("scan string")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("LODS")]),v._v(" "),_("td",[v._v("load string")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("STOS")]),v._v(" "),_("td",[v._v("store string")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("REP")]),v._v(" "),_("td",[v._v("repeat")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("REPE")]),v._v(" "),_("td",[v._v("repeat when equal")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("REPZ")]),v._v(" "),_("td",[v._v("repeat when zero flag")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("REPNE")]),v._v(" "),_("td",[v._v("repeat when not equal")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("REPNZ")]),v._v(" "),_("td",[v._v("repeat when zero flag")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("REPC")]),v._v(" "),_("td",[v._v("repeat when carry flag")]),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td",[v._v("REPNC")]),v._v(" "),_("td",[v._v("repeat when not carry flag")]),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("----\x3e")]),v._v(" "),_("p",[v._v("五、程序转移指令")]),v._v(" "),_("p",[v._v("1>无条件转移指令(长转移)")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("JMP----\x3ejump")]),v._v(" "),_("p",[v._v("CALL----\x3ecall")]),v._v(" "),_("p",[v._v("RET----\x3ereturn")]),v._v(" "),_("p",[v._v("RETF----\x3ereturn far")]),v._v(" "),_("p",[v._v("2>条件转移指令(短转移,-128到+127的距离内)")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("JAE----\x3ejump when above or equal")]),v._v(" "),_("p",[v._v("JNB----\x3ejump when not below")]),v._v(" "),_("p",[v._v("JB----\x3ejump when below")]),v._v(" "),_("p",[v._v("JNAE----\x3ejump when not above or equal")]),v._v(" "),_("p",[v._v("JBE----\x3ejump when below or equal")]),v._v(" "),_("p",[v._v("JNA----\x3ejump when not above")]),v._v(" "),_("p",[v._v("JG----\x3ejump when greater")]),v._v(" "),_("p",[v._v("JNLE----\x3ejump when not less or equal")]),v._v(" "),_("p",[v._v("JGE----\x3ejump when greater or equal")]),v._v(" "),_("p",[v._v("JNL----\x3ejump when not less")]),v._v(" "),_("p",[v._v("JL----\x3ejump when less")]),v._v(" "),_("p",[v._v("JNGE----\x3ejump when not greater or equal")]),v._v(" "),_("p",[v._v("JLE----\x3ejump when less or equal")]),v._v(" "),_("p",[v._v("JNG----\x3ejump when not greater")]),v._v(" "),_("p",[v._v("JE----\x3ejump when equal")]),v._v(" "),_("p",[v._v("JZ----\x3ejump when has zero flag")]),v._v(" "),_("p",[v._v("JNE----\x3ejump when not equal")]),v._v(" "),_("p",[v._v("JNZ----\x3ejump when not has zero flag")]),v._v(" "),_("p",[v._v("JC----\x3ejump when has carry flag")]),v._v(" "),_("p",[v._v("JNC----\x3ejump when not has carry flag")]),v._v(" "),_("p",[v._v("JNO----\x3ejump when not has overflow flag")]),v._v(" "),_("p",[v._v("JNP----\x3ejump when not has parity flag")]),v._v(" "),_("p",[v._v("JPO----\x3ejump when parity flag is odd")]),v._v(" "),_("p",[v._v("JNS----\x3ejump when not has sign flag")]),v._v(" "),_("p",[v._v("JO----\x3ejump when has overflow flag")]),v._v(" "),_("p",[v._v("JP----\x3ejump when has parity flag")]),v._v(" "),_("p",[v._v("JPE----\x3ejump when parity flag is even")]),v._v(" "),_("p",[v._v("JS----\x3ejump when has sign flag")]),v._v(" "),_("p",[v._v("3>循环控制指令(短转移)")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("LOOP----\x3eloop")]),v._v(" "),_("p",[v._v("LOOPE----\x3eloop equal")]),v._v(" "),_("p",[v._v("LOOPZ----\x3eloop zero")]),v._v(" "),_("p",[v._v("LOOPNE----\x3eloop not equal")]),v._v(" "),_("p",[v._v("LOOPNZ----\x3eloop not zero")]),v._v(" "),_("p",[v._v("JCXZ----\x3ejump when CX is zero")]),v._v(" "),_("p",[v._v("JECXZ----\x3ejump when ECX is zero")]),v._v(" "),_("p",[v._v("4>中断指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("INT----\x3einterrupt")]),v._v(" "),_("p",[v._v("INTO----\x3eoverflow interrupt")]),v._v(" "),_("p",[v._v("IRET----\x3einterrupt return")]),v._v(" "),_("p",[v._v("5>处理器控制指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("HLT----\x3ehalt")]),v._v(" "),_("p",[v._v("WAIT----\x3ewait")]),v._v(" "),_("p",[v._v("ESC----\x3eescape")]),v._v(" "),_("p",[v._v("LOCK----\x3elock")]),v._v(" "),_("p",[v._v("NOP----\x3eno operation")]),v._v(" "),_("p",[v._v("STC----\x3eset carry")]),v._v(" "),_("p",[v._v("CLC----\x3eclear carry")]),v._v(" "),_("p",[v._v("CMC----\x3ecarry make change")]),v._v(" "),_("p",[v._v("STD----\x3eset direction")]),v._v(" "),_("p",[v._v("CLD----\x3eclear direction")]),v._v(" "),_("p",[v._v("STI----\x3eset interrupt")]),v._v(" "),_("p",[v._v("CLI----\x3eclear interrupt")]),v._v(" "),_("p",[v._v("六、伪指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("DW----\x3edefinw word")]),v._v(" "),_("p",[v._v("Proc----\x3eprocedure")]),v._v(" "),_("p",[v._v("ENDP----\x3eend of procedure")]),v._v(" "),_("p",[v._v("SEGMENT----\x3esegment")]),v._v(" "),_("p",[v._v("ASSUME----\x3eassume")]),v._v(" "),_("p",[v._v("ENDS----\x3eend segment")]),v._v(" "),_("p",[v._v("END----\x3eend")]),v._v(" "),_("p",[v._v("汇编指令中文释义")]),v._v(" "),_("p",[v._v("数据传输指令")]),v._v(" "),_("p",[v._v("───────────────────────────────────────")]),v._v(" "),_("p",[v._v("它们在存贮器和寄存器、寄存器和输入输出端口之间传送数据.")]),v._v(" "),_("ol",[_("li",[v._v("通用数据传送指令.")])]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("MOV 传送字或字节.")]),v._v(" "),_("p",[v._v("MOVSX 先符号扩展,再传送.")]),v._v(" "),_("p",[v._v("MOVZX 先零扩展,再传送.")]),v._v(" "),_("p",[v._v("PUSH 把字压入堆栈.")]),v._v(" "),_("p",[v._v("POP 把字弹出堆栈.")]),v._v(" "),_("p",[v._v("PUSHA 把AX,CX,DX,BX,SP,BP,SI,DI依次压入堆栈.")]),v._v(" "),_("p",[v._v("POPA 把DI,SI,BP,SP,BX,DX,CX,AX依次弹出堆栈.")]),v._v(" "),_("p",[v._v("PUSHAD 把EAX,ECX,EDX,EBX,ESP,EBP,ESI,EDI依次压入堆栈.")]),v._v(" "),_("p",[v._v("POPAD 把EDI,ESI,EBP,ESP,EBX,EDX,ECX,EAX依次弹出堆栈.")]),v._v(" "),_("p",[v._v("BSWAP 交换32位寄存器里字节的顺序")]),v._v(" "),_("p",[v._v("XCHG 交换字或字节.( 至少有一个操作数为寄存器,段寄存器不可作为操作数)")]),v._v(" "),_("p",[v._v("CMPXCHG 比较并交换操作数.( 第二个操作数必须为累加器AL/AX/EAX )")]),v._v(" "),_("p",[v._v("XADD 先交换再累加.( 结果在第一个操作数里 )")]),v._v(" "),_("p",[v._v("XLAT 字节查表转换.")]),v._v(" "),_("p",[v._v("── BX 指向一张 256 字节的表的起点, AL 为表的索引值 (0-255,即")]),v._v(" "),_("p",[v._v("0-FFH); 返回 AL 为查表结果. ( [BX+AL]->AL )")]),v._v(" "),_("ol",{attrs:{start:"2"}},[_("li",[v._v("输入输出端口传送指令.")])]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("IN I/O端口输入. ( 语法: IN 累加器, {端口号│DX} )")]),v._v(" "),_("p",[v._v("OUT I/O端口输出. ( 语法: OUT {端口号│DX},累加器 )")]),v._v(" "),_("p",[v._v("输入输出端口由立即方式指定时, 其范围是 0-255; 由寄存器 DX 指定时,")]),v._v(" "),_("p",[v._v("其范围是 0-65535.")]),v._v(" "),_("ol",{attrs:{start:"3"}},[_("li",[v._v("目的地址传送指令.")])]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("LEA 装入有效地址.")]),v._v(" "),_("p",[v._v("例: LEA DX,string ;把偏移地址存到DX.")]),v._v(" "),_("p",[v._v("LDS 传送目标指针,把指针内容装入DS.")]),v._v(" "),_("p",[v._v("例: LDS SI,string ;把段地址:偏移地址存到DS:SI.")]),v._v(" "),_("p",[v._v("LES 传送目标指针,把指针内容装入ES.")]),v._v(" "),_("p",[v._v("例: LES DI,string ;把段地址:偏移地址存到ES:DI.")]),v._v(" "),_("p",[v._v("LFS 传送目标指针,把指针内容装入FS.")]),v._v(" "),_("p",[v._v("例: LFS DI,string ;把段地址:偏移地址存到FS:DI.")]),v._v(" "),_("p",[v._v("LGS 传送目标指针,把指针内容装入GS.")]),v._v(" "),_("p",[v._v("例: LGS DI,string ;把段地址:偏移地址存到GS:DI.")]),v._v(" "),_("p",[v._v("LSS 传送目标指针,把指针内容装入SS.")]),v._v(" "),_("p",[v._v("例: LSS DI,string ;把段地址:偏移地址存到SS:DI.")]),v._v(" "),_("ol",{attrs:{start:"4"}},[_("li",[v._v("标志传送指令.")])]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("LAHF 标志寄存器传送,把标志装入AH.")]),v._v(" "),_("p",[v._v("SAHF 标志寄存器传送,把AH内容装入标志寄存器.")]),v._v(" "),_("p",[v._v("PUSHF 标志入栈.")]),v._v(" "),_("p",[v._v("POPF 标志出栈.")]),v._v(" "),_("p",[v._v("PUSHD 32位标志入栈.")]),v._v(" "),_("p",[v._v("POPD 32位标志出栈.")]),v._v(" "),_("p",[v._v("二、算术运算指令")]),v._v(" "),_("p",[v._v("───────────────────────────────────────")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("ADD 加法.")]),v._v(" "),_("p",[v._v("ADC 带进位加法.")]),v._v(" "),_("p",[v._v("INC 加 1.")]),v._v(" "),_("p",[v._v("AAA 加法的ASCII码调整.")]),v._v(" "),_("p",[v._v("DAA 加法的十进制调整.")]),v._v(" "),_("p",[v._v("SUB 减法.")]),v._v(" "),_("p",[v._v("SBB 带借位减法.")]),v._v(" "),_("p",[v._v("DEC 减 1.")]),v._v(" "),_("p",[v._v("NEC 求反(以 0 减之).")]),v._v(" "),_("p",[v._v("CMP 比较.(两操作数作减法,仅修改标志位,不回送结果).")]),v._v(" "),_("p",[v._v("AAS 减法的ASCII码调整.")]),v._v(" "),_("p",[v._v("DAS 减法的十进制调整.")]),v._v(" "),_("p",[v._v("MUL 无符号乘法.")]),v._v(" "),_("p",[v._v("IMUL 整数乘法.")]),v._v(" "),_("p",[v._v("以上两条,结果回送AH和AL(字节运算),或DX和AX(字运算),")]),v._v(" "),_("p",[v._v("AAM 乘法的ASCII码调整.")]),v._v(" "),_("p",[v._v("DIV 无符号除法.")]),v._v(" "),_("p",[v._v("IDIV 整数除法.")]),v._v(" "),_("p",[v._v("以上两条,结果回送:")]),v._v(" "),_("p",[v._v("商回送AL,余数回送AH, (字节运算);")]),v._v(" "),_("p",[v._v("或 商回送AX,余数回送DX, (字运算).")]),v._v(" "),_("p",[v._v("AAD 除法的ASCII码调整.")]),v._v(" "),_("p",[v._v("CBW 字节转换为字. (把AL中字节的符号扩展到AH中去)")]),v._v(" "),_("p",[v._v("CWD 字转换为双字. (把AX中的字的符号扩展到DX中去)")]),v._v(" "),_("p",[v._v("CWDE 字转换为双字. (把AX中的字符号扩展到EAX中去)")]),v._v(" "),_("p",[v._v("CDQ 双字扩展. (把EAX中的字的符号扩展到EDX中去)")]),v._v(" "),_("p",[v._v("三、逻辑运算指令")]),v._v(" "),_("p",[v._v("───────────────────────────────────────")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("AND 与运算.")]),v._v(" "),_("p",[v._v("or 或运算.")]),v._v(" "),_("p",[v._v("XOR 异或运算.")]),v._v(" "),_("p",[v._v("NOT 取反.")]),v._v(" "),_("p",[v._v("TEST 测试.(两操作数作与运算,仅修改标志位,不回送结果).")]),v._v(" "),_("p",[v._v("SHL 逻辑左移.")]),v._v(" "),_("p",[v._v("SAL 算术左移.(=SHL)")]),v._v(" "),_("p",[v._v("SHR 逻辑右移.")]),v._v(" "),_("p",[v._v("SAR 算术右移.(=SHR) 当值为负时，高位补 1 ；当值为正时，高位补 0")]),v._v(" "),_("p",[v._v("ROL 循环左移.")]),v._v(" "),_("p",[v._v("ROR 循环右移.")]),v._v(" "),_("p",[v._v("RCL 通过进位的循环左移.")]),v._v(" "),_("p",[v._v("RCR 通过进位的循环右移.")]),v._v(" "),_("p",[v._v("以上八种移位指令,其移位次数可达255次.")]),v._v(" "),_("p",[v._v("移位一次时, 可直接用操作码. 如 SHL AX,1.")]),v._v(" "),_("p",[v._v("移位>1次时, 则由寄存器CL给出移位次数.")]),v._v(" "),_("p",[v._v("如 MOV CL,04")]),v._v(" "),_("p",[v._v("SHL AX,CL")]),v._v(" "),_("p",[v._v("四、串指令")]),v._v(" "),_("p",[v._v("───────────────────────────────────────")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("DS:SI 源串段寄存器 :源串变址.")]),v._v(" "),_("p",[v._v("ES:DI 目标串段寄存器:目标串变址.")]),v._v(" "),_("p",[v._v("CX 重复次数计数器.")]),v._v(" "),_("p",[v._v("AL/AX 扫描值.")]),v._v(" "),_("p",[v._v("D标志 0表示重复操作中SI和DI应自动增量; 1表示应自动减量.")]),v._v(" "),_("p",[v._v("Z标志 用来控制扫描或比较操作的结束.")]),v._v(" "),_("p",[v._v("MOVS 串传送.")]),v._v(" "),_("p",[v._v("( MOVSB 传送字符. MOVSW 传送字. MOVSD 传送双字. )")]),v._v(" "),_("p",[v._v("CMPS 串比较.")]),v._v(" "),_("p",[v._v("( CMPSB 比较字符. CMPSW 比较字. )")]),v._v(" "),_("p",[v._v("SCAS 串扫描.")]),v._v(" "),_("p",[v._v("把AL或AX的内容与目标串作比较,比较结果反映在标志位.")]),v._v(" "),_("p",[v._v("LODS 装入串.")]),v._v(" "),_("p",[v._v("把源串中的元素(字或字节)逐一装入AL或AX中.")]),v._v(" "),_("p",[v._v("( LODSB 传送字符. LODSW 传送字. LODSD 传送双字. )")]),v._v(" "),_("p",[v._v("STOS 保存串.")]),v._v(" "),_("p",[v._v("是LODS的逆过程.")]),v._v(" "),_("p",[v._v("REP 当CX/ECX<>0时重复.")]),v._v(" "),_("p",[v._v("REPE/REPZ 当ZF=1或比较结果相等,且CX/ECX<>0时重复.")]),v._v(" "),_("p",[v._v("REPNE/REPNZ 当ZF=0或比较结果不相等,且CX/ECX<>0时重复.")]),v._v(" "),_("p",[v._v("REPC 当CF=1且CX/ECX<>0时重复.")]),v._v(" "),_("p",[v._v("REPNC 当CF=0且CX/ECX<>0时重复.")]),v._v(" "),_("p",[v._v("五、程序转移指令")]),v._v(" "),_("p",[v._v("───────────────────────────────────────")]),v._v(" "),_("p",[v._v("1>无条件转移指令 (长转移)")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("JMP 无条件转移指令")]),v._v(" "),_("p",[v._v("CALL 过程调用")]),v._v(" "),_("p",[v._v("RET/RETF过程返回.")]),v._v(" "),_("p",[v._v("2>条件转移指令 (短转移,-128到+127的距离内)")]),v._v(" "),_("p",[v._v("( 当且仅当(SF XOR OF)=1时,OP1 JA/JNBE 不小于或不等于时转移.")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("JAE/JNB 大于或等于转移.")]),v._v(" "),_("p",[v._v("JB/JNAE 小于转移.")]),v._v(" "),_("p",[v._v("JBE/JNA 小于或等于转移.")]),v._v(" "),_("p",[v._v("以上四条,测试无符号整数运算的结果(标志C和Z).")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("JG/JNLE 大于转移.")]),v._v(" "),_("p",[v._v("JGE/JNL 大于或等于转移.")]),v._v(" "),_("p",[v._v("JL/JNGE 小于转移.")]),v._v(" "),_("p",[v._v("JLE/JNG 小于或等于转移.")]),v._v(" "),_("p",[v._v("以上四条,测试带符号整数运算的结果(标志S,O和Z).")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("JE/JZ 等于转移.")]),v._v(" "),_("p",[v._v("JNE/JNZ 不等于时转移.")]),v._v(" "),_("p",[v._v("JC 有进位时转移.")]),v._v(" "),_("p",[v._v("JNC 无进位时转移.")]),v._v(" "),_("p",[v._v("JNO 不溢出时转移.")]),v._v(" "),_("p",[v._v("JNP/JPO 奇偶性为奇数时转移.")]),v._v(" "),_("p",[v._v('JNS 符号位为 "0" 时转移.')]),v._v(" "),_("p",[v._v("JO 溢出转移.")]),v._v(" "),_("p",[v._v("JP/JPE 奇偶性为偶数时转移.")]),v._v(" "),_("p",[v._v('JS 符号位为 "1" 时转移.')]),v._v(" "),_("p",[v._v("3>循环控制指令(短转移)")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("LOOP CX不为零时循环.")]),v._v(" "),_("p",[v._v("LOOPE/LOOPZ CX不为零且标志Z=1时循环.")]),v._v(" "),_("p",[v._v("LOOPNE/LOOPNZ CX不为零且标志Z=0时循环.")]),v._v(" "),_("p",[v._v("JCXZ CX为零时转移.")]),v._v(" "),_("p",[v._v("JECXZ ECX为零时转移.")]),v._v(" "),_("p",[v._v("4>中断指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("INT 中断指令")]),v._v(" "),_("p",[v._v("INTO 溢出中断")]),v._v(" "),_("p",[v._v("IRET 中断返回")]),v._v(" "),_("p",[v._v("5>处理器控制指令")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("HLT 处理器暂停, 直到出现中断或复位信号才继续.")]),v._v(" "),_("p",[v._v("WAIT 当芯片引线TEST为高电平时使CPU进入等待状态.")]),v._v(" "),_("p",[v._v("ESC 转换到外处理器.")]),v._v(" "),_("p",[v._v("LOCK 封锁总线.")]),v._v(" "),_("p",[v._v("NOP 空操作.")]),v._v(" "),_("p",[v._v("STC 置进位标志位.")]),v._v(" "),_("p",[v._v("CLC 清进位标志位.")]),v._v(" "),_("p",[v._v("CMC 进位标志取反.")]),v._v(" "),_("p",[v._v("STD 置方向标志位.")]),v._v(" "),_("p",[v._v("CLD 清方向标志位.")]),v._v(" "),_("p",[v._v("STI 置中断允许位.")]),v._v(" "),_("p",[v._v("CLI 清中断允许位.")]),v._v(" "),_("p",[v._v("六、伪指令")]),v._v(" "),_("p",[v._v("─────────────────────────────────────")]),v._v(" "),_("table",[_("thead",[_("tr",[_("th",[v._v("指令")]),v._v(" "),_("th",[v._v("指令全称")]),v._v(" "),_("th",[v._v("描述")])])]),v._v(" "),_("tbody",[_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")]),v._v(" "),_("tr",[_("td"),v._v(" "),_("td"),v._v(" "),_("td")])])]),v._v(" "),_("p",[v._v("DW 定义字(2字节).")]),v._v(" "),_("p",[v._v("Proc 定义过程.")]),v._v(" "),_("p",[v._v("ENDP 过程结束.")]),v._v(" "),_("p",[v._v("SEGMENT 定义段.")]),v._v(" "),_("p",[v._v("ASSUME 建立段寄存器寻址.")]),v._v(" "),_("p",[v._v("ENDS 段结束.")]),v._v(" "),_("p",[v._v("END 程序结束.")])])}),[],!1,null,null,null);_.default=p.exports}}]);