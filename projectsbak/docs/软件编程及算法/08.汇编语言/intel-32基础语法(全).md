---
title: intel-32基础语法
date: 2023-07-25 09:28:47
permalink: /pages/72fa35/
tags:
  - 
---
## 前言



汇编语言多种多样，不同于其他语言，汇编指令对接的是硬件，所以不同厂家，甚至相同的厂家的不同芯片都有不同的汇编指令集。

因此花时间学完所有的汇编指令显得不必要，只要对主流的汇编语法学习然后融会贯通即可。



常见学习的汇编：

1、8086汇编，intel-16，早期较为基础的汇编指令，也是入门常用的汇编学习版本，大学教材《王爽汇编xx》

2、intel-32位 ，intel的32位芯片

3、intel-64，现在主流的intel芯片版本

4、ARM-64，ARM当前主流的版本



⚠️ 注意：

本篇以C++语法对比介绍intel-32汇编指令集（无特殊说明的，下面介绍的汇编指令均为 intel-32 指令集）



## 基本结构



### Hello World

Hello World 示例对比

1、C++ 显示字符串“ Hello World”

```cpp
#include <iostream> // 引入支持输入输出的库
using namespace std; // 命名空间

int main(){ // 程序开始执行入口函数
    cout << "Hello World"; // cout 输出
    return 0; 
} 
```

[C++在线编译（菜鸟工具）](https://c.runoob.com/compile/12/)



2、intel32汇编语言显示字符串“ Hello World”

```nasm
section .text
   global _start   

_start:          
   mov  edx,len   
   mov  ecx,msg    
   mov  ebx,1      
   mov  eax,4       
   int  0x80       

   mov  eax,1      
   int  0x80     

section .data
msg db 'Hello, world!', 0xa  
len equ $ - msg    
```

[链接：intel32汇编在线编译](https://www.jc2182.com/runcode.html?filename=helloword&type=21&module=jiaocheng)

 上面结果都是打印一个  'Hello, world!' 但是，

显然汇编语法较为复杂，下面将先从结构上介绍他们的区别。

（具体 ax、bx、cx、dx、int 等指令后面再介绍）

### 语法结构

改造C++  Hello World示例语法：

```cpp
#include <iostream> // 引入支持输入输出的库
using namespace std; // 命名空间

// 1、data段: 被定义不可修改的数据常量
const string msg = "Hello World";

// 2、text段：程序代码
int main();

int main(){ // 3、程序入口函数
	
    cout << msg; // cout 输出
		// 4、程序返回
    return 0; // ret
} 
```



汇编代码： Hello World

```assembly
; 1、data段: 被定义不可修改的数据常量
section	.data
msg db 'Hello, world!', 0xa  ;要打印的字符串
len equ $ - msg     ;字符串的长度，尾地址（$）- 起始地址（msg[0]）= 字符串长度 

; 2、text段：程序代码
section	.text
   global _start     ;必须为链接器(ld)声明

_start:	            ; 3、程序入口函数：告诉链接器入口点
   mov	edx,len     ;消息长度
   mov	ecx,msg     ;写消息
   mov	ebx,1       ;文件描述符 (stdout)
   mov	eax,4       ;系统调用号 (sys_write)
   int	0x80        ;调用内核

   mov	eax,1       ;系统调用号 (sys_exit)
   ; 4、程序中断 
   int	0x80        ;调用内核
```



对比两段代码（大概类比，方便记忆）：

**1、data段:** 

被定义不可修改的数据常量，其中数据 **msg db ***** 等同于C++ 常量  **const string msg**



**2、text段：声明**

程序代码，比如入口函数声明 **global _start** 等同于C++ main函数声明 **int main();** 



**3、text段：程序实现**

程序入口函数

代码实现  **_start:** 等同于 C++ main函数 实现  **int main(){ *** }**



**4、text段：执行中断或退出**

一个程序的函数通常会在使用完后中断退出

mov	eax,1   ;系统调用sys_exit，相当main函数的退出，也即是进程退出

返回：

```cpp
mov	eax,4
int	0x80 ;调用内核中断

上面两句相当于函数（过程）的返回吧，
return ：C++中当前函数执行完毕
```



**5、屏幕输出**

cout ： c++屏幕输出

mov	ebx,1       ;文件描述符 (stdout)



**6、注释**

intel32汇编语言 **行**注释以分号（;）开头

```nasm
; 注释信息
```

C++中**行**注释 

```cpp
// 注释信息
```

(还有其他多种注释方法)



### intel32程序三个段结构

### 1、data段

**数据（data）段**被用于声明初始化的数据或常数。此数据在运行时不会更改。您可以在段中声明各种常量值，文件名或缓冲区大小等。

声明数据段的语法是-

```nasm
section.data
```



### 2、bss 段

在**bss段**用于声明变量。声明bss段的语法是-

```nasm
section .bss           ;未初始化的数据
   num resb 8
```



### 3、text段

**代码段**被用于保持实际的代码。该段必须以全局声明**_start**开头，该声明告诉内核程序从何处开始执行。

声明代码段的语法是-

```nasm
section.text
   global _start
_start:
```





## 寄存器

### 常见寄存器

| 寄存器                           | 16位 | 32位    | 64位    |
| -------------------------------- | ---- | ------- | ------- |
| 累加寄存器 `accumulator`         | AX   | **E**AX | **R**AX |
| 基址寄存器 `base`                | BX   | **E**BX | **R**BX |
| 计数寄存器 `count`               | CX   | **E**CX | **R**CX |
| 数据寄存器 `data`                | DX   | **E**DX | **R**DX |
| 堆栈基指针 `Base Pointer `       | BP   | **E**BP | **R**BP |
| 变址寄存器 `Source Index`        | SI   | **E**SI | **R**SI |
| 堆栈顶指针 `Stack Pointer`       | SP   | **E**SP | **R**SP |
| 指令寄存器 `Instruction Pointer` | IP   | **E**IP | **R**IP |

```
AH&AL＝AX(accumulator)：累加寄存器 
BH&BL＝BX(base)：基址寄存器 
CH&CL＝CX(count)：计数寄存器 
DH&DL＝DX(data)：数据寄存器 
SP（Stack Pointer）：堆栈指针寄存器 
BP（Base Pointer）：基址指针寄存器 
SI（Source Index）：源变址寄存器 
DI（Destination Index）：目的变址寄存器 
IP（Instruction Pointer）：指令指针寄存器 
CS（Code Segment）代码段寄存器 
DS（Data Segment）：数据段寄存器 
SS（Stack Segment）：堆栈段寄存器 
ES（Extra Segment）：附加段寄存器 
```

⚠️

1、你会发现寄存器指令名称基本是在16位基础上衍生而来，比如32位 EAX是在16 位AX前加E，64 位 RAX是在16 位AX前加R

2、H是高位缩写，L是低位缩写。比如 AX 由AH 高位和AL低位组合，这是为兼容8位寄存器而来

3、篇头demo中下面代码什么意思？

```nasm
_start:	            ; 3、程序入口函数：告诉链接器入口点
   mov	edx,len     ;消息长度
   mov	ecx,msg     ;写消息
   mov	ebx,1       ;文件描述符 (stdout)
   mov	eax,4       ;系统调用号 (sys_write)
   int	0x80        ;调用内核
```

拆分解释一下：

```nasm
; 程序入口函数：告诉链接器入口点，加这个好理解，就是main函数
_start:	            
   
   ;比如C语法中 int a = 1; 就默认处理好了变量a的数据长度，通常是4字节，代码底层帮你申请了对应大小的空间，通常使用 alloc 分配。
   ;而在汇编中可以通过 dx 告诉编译器当前对象的需要分配的内存大小，
   mov	edx,len     ;消息长度
   
   ; int a = 1 中，赋值1给变量a的过程在汇编中可以使用 cx 这个指令
   ; mov 赋值，msg 数据， cx 指向真实的物理地址，将内容写入的地方
   mov	ecx,msg     ;写消息
   
   ;这个就是打印指令，也即是输出指令，cout、print、等等类似
   ;在bx寄存器中写入1就是输出信息
   mov	ebx,1       ;文件描述符 (stdout)
   
   ;ax中写入100（4）即是相当于函数的返回指令，告诉CPU下面函数过程要做的动作是执行后返回
   mov	eax,4       ;系统调用号 (sys_write)
   
   ;int 不是c中的int，而是 Interrupt，中断的意思，而0x80是intel-32中调用linux中系统命令，可以理解为system_call，也就是系统函数调用
   int	0x80        ;调用内核
```



## 汇编命令

列举几个汇编命令：

| 指令                                   | 作用                                                         |      |
| -------------------------------------- | ------------------------------------------------------------ | ---- |
| ORG                                    | 在程序执行的时候，会告诉编译器将这些指令转载到内存的哪个位置 |      |
| JMP （jump）                           | 跳转。类似于C中的 go to                                      |      |
| entry（）                              | JMP 指令的跳转目的地                                         |      |
| DB（data byte）                        | 向文件中直接写入一个字节的指令                               |      |
| DW（data word）                        | 写入一个字，两个字节                                         |      |
| DD（data double-word）                 | 写入两个字，4个字节                                          |      |
| RESB（reserve byte）                   | 与 DB相反，指定的地址清空，保留备用                          |      |
| RESW（reserve data double-word）       | 与 DW相反                                                    |      |
| MOV（move）                            | 移动、赋值，等等动作                                         |      |
| ADD（add）                             | 加法指令                                                     |      |
| CMP（compare）                         | 比较指令。                                                   |      |
| INT（Interrupt）                       | 中断指令，用来调用BIOS中函数的指令                           |      |
| HLT（halt）                            | 停止。让CPU进入待机状态，只要外部发生变化，CPU就会醒过来。   |      |
| JC（jump if carry）                    | 标志，INF调用函数后，没有错，进位标志为0，有错，进位标志为1  |      |
| JNC（jump if not carry）               | 判断指令：进位为0就跳转                                      |      |
| JAE（jump if above or equal）          | 判断指令：大于等于时跳转                                     |      |
| JBE（jump if below or equal）          | 判断指令：小于等于则跳转                                     |      |
| RET（return）                          | 返回                                                         |      |
| XCHG （exchange）                      | 交换指令                                                     |      |
| push                                   | 栈：进栈，或叫压栈指令                                       |      |
| pop                                    | 栈：出栈指令                                                 |      |
| sub、sbb、dec、neg、cmp                | 减法指令                                                     |      |
| mul、imul                              | 乘法指令                                                     |      |
| div、idiv                              | 除法指令                                                     |      |
| not、and、or、xor、test                | 逻辑运算指令                                                 |      |
| ROL、ROR、RCL、RCR                     | 循环移位指令                                                 |      |
| LOOP、LOOPE/LOOPZ、LOOPNE/LOOPNZ、JCXZ | 循环指令                                                     |      |
| 其他详见汇编指令梳理篇章               |                                                              |      |
|                                        |                                                              |      |



## 变量

### define：变量内存分配、创建（alloc）

NASM提供了各种定义指令来为变量保留存储空间。

define assembler指令用于分配存储空间。

在C++中：

```cpp
int a = 3;  
double b = 1.345;
byte z = 22;  
char x = 'x'; 
```

而汇编中，变量示例：

```nasm
str          DB      'xyz'
num          DW      354534
neg_num      DW      -323
big_num      DQ      119287337644
real_num     DD      1.23456
real_num2    DQ      123.456
```

其中内存分配的define指令:

| 指令   | 目的         | 储存空间     |
| :----- | :----------- | :----------- |
| **DB** | 定义字节     | 分配1个字节  |
| **DW** | 定义字       | 分配2个字节  |
| **DD** | 定义双字     | 分配4个字节  |
| **DQ** | 定义四字     | 分配8个字节  |
| **DT** | 定义十个字节 | 分配10个字节 |



### 示例：输出字符串 xyz

```nasm
section .text
   global _start          ;链接器入口声明
        
_start:                   ;链接器执行入口
   mov  edx,3             ;定义长度
   mov  ecx,str1          ;写入数据
   mov  ebx,1             ;基地址(base)寄存器, 在内存寻址时存放基地址
   mov  eax,4             ;输出信息
   int  0x80              ;中断

   mov  eax,1             ;退出exit
   int  0x80              ;中断

section .data
str1 DB 'xyz'
```

结果:

```t4
xyz
```



> 1、字符的每个字节以十六进制形式存储为其ASCII值
>
> 2、数据类型转换为其等效的16位二进制数，并以十六进制数形式存储
>
> 3、使用小尾存储顺序（高字节存放内存高位，低字节在低位）
>
> 4、负数以补码形式表示



### reserve：变量内存释放（release）

相应的，上面define给对应内存分配空间，而reserve相反，是给对应内存地址清理空间，可以理解为 release

reserve指令用于为未初始化的数据保留空间。reserve指令采用单个操作数，该操作数指定要保留的空间单位数。每个define指令都有一个相关的reserve指令。

保留指令有五种基本形式-

| 指令     | 目的         |
| :------- | :----------- |
| **RESB** | 保留一个字节 |
| **RESW** | 保留字       |
| **RESD** | 保留双字     |
| **RESQ** | 保留四字     |
| **REST** | 保留十个字节 |



### 示例：申请空间并打印

```nasm
section	.text
   global _start     ;必须为链接器(ld)声明
   
_start:	            ;告诉链接器入口点
	  
	  ;1、打印固定字符串 “我的年龄：”
    mov	edx,len     ;设置数据长度
    mov	ecx,msg     ;赋值数据
    mov	ebx,1       ;打印信息
    mov	eax,4       ;执行函数标记4
    int	0x80        ;调用内核call函数执行

	  ;2、打印存储后的数据 “9”
    mov  eax,'9'
    mov  [sum], eax ;将数据9存储到申请的内存中
    
    mov	edx,1     
    mov	ecx,sum  ;从 sum中取数据存入
    mov	ebx,1       
    mov	eax,4      
    int	0x80        
		
		;3、退出
    mov	eax,1       ;退出进程sys_exit
    int	0x80        ;调用内核call函数执行退出

section	.data
msg db '我的年龄：',0xA,0xD   ;换行 0xA,0xD 。要打印的字符串
len equ $ - msg     ;字符串的长度

segment .bss
sum resb 1  ;申请1字节空间
```

结果

```
我的年龄：
9
```



## 常量

在C++中我们使用过 const、#define 等 定义一个常量，汇编中类似



### 常量定义

| intel 32汇编指令   | C++                              | 含义             |
| ------------------ | -------------------------------- | ---------------- |
| EQU （equ）        | const （比如：const int a = 1;） | 不可变常量赋值   |
| %assign            | static                           | 静态变量，可修改 |
| %define            | #define                          | 单行宏，代码替换 |
| %macro - %endmacro |                                  | 多行宏，代码替换 |

多行宏:

```nasm
%macro  宏名称 参数数量                      
        push    ebp                
        mov     ebp,esp                
        sub     esp,%1               
%endmacro
```

指令区分大小写



### 示例

1、C++示例：

```cpp
#include <iostream>
using namespace std;

// 常量
const int i_x = 3;
// 宏
#define s_y "hello"
// 静态变量
static double d_z = 1.20;

int main()
{
    cout << "不可修改 i_x = " << i_x << endl;
    cout << "不可修改 s_y = " << s_y << endl;
  
    d_z = d_z + 3.14;
    cout << "可修改 d_z = " << d_z << endl;
}
```

结果

```cpp
不可修改 i_x = 3
不可修改 s_y = hello
可修改 d_z = 4.34
```

### 汇编EQU示例

将通用指令固定数据定义为常量，方便使用

```nasm

sys_exit  	equ 1 ;退出
sys_write 	equ 4 ;函数过程写
sdt_in      equ 0 ;输入
sdt_out    	equ 1 ;输出
sys_call    equ 0x80 ;调用

section  .text
   global _start    
        
_start:            
   mov eax, sys_write         
   mov ebx, sdt_out         
   mov ecx, msg1         
   mov edx, len1 
   int sys_call                
          
   mov eax,sys_exit   
   int sys_call     

section  .data
msg1 db '我是第一行信息!',0xA,0xD   ;换行 0xA,0xD
len1 equ $ - msg1                        
```



### 汇编宏示例

将上面示例使用**宏**修改：

```nasm

;使用字符串变量
%macro  set_string 1                      
        mov ecx, %1          
        mov edx, len1                 
%endmacro

;调用并输出
%macro  run_out 0                      
        mov eax, 4         
         mov ebx, 1 
         int 0x80               
%endmacro

;退出
%macro  return 0                      
        mov eax,1   
         int 0x80              
%endmacro

section  .text
   global _start    
        
_start:      

   set_string msg1 
   run_out
                  
          
   return     

section  .data
msg1 db '使用宏修改!'
len1 equ $ - msg1 
```



退出的汇编代码直接使用 return 替换，这样更容易记忆。





## 算术指令



###  INC 指令

INC指令用于将操作数加1。它对可以在寄存器或内存中的单个操作数起作用。

INC指令具有以下语法-

```nasm
INC destination
```



目标操作数可以是8位，16位或32位操作数。

例

```nasm
INC EBX      ;  32-bit 寄存器 自增1
INC DL       ;  8-bit 寄存器 自增1
INC [count]  ;  变量count  自增1
```





### DEC指令

DEC指令用于将操作数减1。它对可以在寄存器或内存中的单个操作数起作用。

DEC指令具有以下语法-

```nasm
DEC destination
```



操作数目的地可以是8位，16位或32位操作数。

```nasm
segment .data
   count dw  0
   value db  15
        
segment .text
   inc [count]
   dec [value]
        
   mov ebx, count
   inc word [ebx]
        
   mov esi, value
   dec byte [esi]
```





### ADD和SUB指令

**ADD**和**SUB**指令用于对字节，字和双字大小的二进制数据进行简单的加/减，即分别用于添加或减去8位，16位或32位操作数。

ADD和SUB指令具有以下语法-

```nasm
ADD/SUB destination, source
```



ADD / SUB指令可以发生在-

- 寄存器 to 寄存器
- 内存 to 寄存器
- 寄存器 to 内存
- 寄存器 to 常量数据
- 内存 to 常量数据

但是，像其他指令一样，使用ADD / SUB指令也无法进行存储器到存储器的操作。ADD或SUB操作设置或清除溢出和进位标志。

下面的示例将要求用户输入两位数字，分别将这些数字存储在EAX和EBX寄存器中，将这些值相加，将结果存储在“ res ”存储位置中，最后显示结果。

```nasm
SYS_EXIT  equ 1
SYS_READ  equ 3
SYS_WRITE equ 4
STDIN     equ 0
STDOUT    equ 1

segment .data 

   msg1 db "Enter a digit ", 0xA,0xD 
   len1 equ $- msg1 

   msg2 db "Please enter a second digit", 0xA,0xD 
   len2 equ $- msg2 

   msg3 db "The sum is: "
   len3 equ $- msg3

segment .bss

   num1 resb 2 
   num2 resb 2 
   res resb 1    

section .text
   global _start    ;must be declared for using gcc
        
_start:             ;tell linker entry point
   mov eax, SYS_WRITE         
   mov ebx, STDOUT         
   mov ecx, msg1         
   mov edx, len1 
   int 0x80                

   mov eax, SYS_READ 
   mov ebx, STDIN  
   mov ecx, num1 
   mov edx, 2
   int 0x80            

   mov eax, SYS_WRITE        
   mov ebx, STDOUT         
   mov ecx, msg2          
   mov edx, len2         
   int 0x80

   mov eax, SYS_READ  
   mov ebx, STDIN  
   mov ecx, num2 
   mov edx, 2
   int 0x80        

   mov eax, SYS_WRITE         
   mov ebx, STDOUT         
   mov ecx, msg3          
   mov edx, len3         
   int 0x80

   ; moving the first number to eax register and second number to ebx
   ; and subtracting ascii '0' to convert it into a decimal number
        
   mov eax, [num1]
   sub eax, '0'
        
   mov ebx, [num2]
   sub ebx, '0'

   ; add eax and ebx
   add eax, ebx
   ; add '0' to to convert the sum from decimal to ASCII
   add eax, '0'

   ; storing the sum in memory location res
   mov [res], eax

   ; print the sum 
   mov eax, SYS_WRITE        
   mov ebx, STDOUT
   mov ecx, res         
   mov edx, 1        
   int 0x80

exit:    
   
   mov eax, SYS_EXIT   
   xor ebx, ebx 
   int 0x80
```



[尝试一下](https://www.jc2182.com/runcode.html?filename=jisuan1&type=21&module=jiaocheng)

编译并执行上述代码后，将产生以下结果-

```t4
Enter a digit:
3
Please enter a second digit:
4
The sum is:
7
```



具有硬编码变量的程序-

```nasm
section .text
   global _start    ;must be declared for using gcc
        
_start:             ;tell linker entry point
   mov  eax,'3'
   sub     eax, '0'
        
   mov  ebx, '4'
   sub     ebx, '0'
   add  eax, ebx
   add  eax, '0'
        
   mov  [sum], eax
   mov  ecx,msg 
   mov  edx, len
   mov  ebx,1   ;file descriptor (stdout)
   mov  eax,4   ;system call number (sys_write)
   int  0x80    ;call kernel
        
   mov  ecx,sum
   mov  edx, 1
   mov  ebx,1   ;file descriptor (stdout)
   mov  eax,4   ;system call number (sys_write)
   int  0x80    ;call kernel
        
   mov  eax,1   ;system call number (sys_exit)
   int  0x80    ;call kernel
        
section .data
   msg db "The sum is:", 0xA,0xD 
   len equ $ - msg   
   segment .bss
   sum resb 1
```



[尝试一下](https://www.jc2182.com/runcode.html?filename=jisuan2&type=21&module=jiaocheng)

编译并执行上述代码后，将产生以下结果-

```t4
The sum is:
7
```





⚠️  认真阅读发现，前面我们示例都是个位数的运算，如果直接换成个位以上的数运算就会得到错误的结果，原因就是溢出，下面在  乘法 中介绍 “进位” 相关的处理

### MUL 乘法指令

> 1、mul乘法指令是无符号计算的，也就是不支持负数（imul支持负数）
>
> 2、mul是单指令，也就是后面只能跟一个参数（imul支持多参）

32 位模式下，MUL（无符号数乘法）指令有三种类型：

> 1、执行 8 位操作数与 AL 寄存器的乘法；
> 2、执行 16 位操作数与 AX 寄存器的乘法；
> 3、执行 32 位操作数与 EAX 寄存器的乘法。

乘积溢出

> MUL 指令中的单操作数是乘数。乘积结果存放的空间是被乘数和乘数大小的两倍，因此不会发生溢岀
>
> 比如，两个8位二进制数的乘积不会超过16位。两个16位乘积不会超过32位等等（除法会溢出）



MUL无符号、单指令乘法表：

MUL: 无符号乘 ;影响 OF、CF 标志位 ;

指令格式: ;MUL r/m ;参数是乘数 ;

如果参数是 r8/m8, 将把 AL 做乘数, 结果放在 AX ;（8位）

如果参数是 r16/m16, 将把 AX 做乘数, 结果放在 EAX ;（16位）

如果参数是 r32/m32, 将把 EAX 做乘数, 结果放在 EDX:EAX （32位）

| 被乘数 | 乘数        | 乘积存放位置 | 解析                                                         | 标记位                                                       |
| ------ | ----------- | ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| AL     | reg8/mem8   | AX           | MUL操作数是8位寄存器，自动将AL当作被乘数。结果存放AX         |                                                              |
| AX     | reg16/mem16 | DX:AX        | MUL操作数是16位寄存器，自动将AX当作被乘数。结果的低位放在AX，高位在DX | CF = 1 标记位1表示DX有高位数据。CF = 0 表示DX没有高位数据，AX中已经显示全 |
| EAX    | reg16/mem32 | EDX:EAX      | MUL操作数是32位寄存器，自动将EAX当作被乘数。结果的低位在EAX，高位在EDX |                                                              |




#### 1、8位汇编

**8086芯片 intel-8  位汇编个位乘法**

MUL（乘法）指令，在C语法中，使用 int a = 2 * 3; 能很方便的计算乘法，而在汇编中却没有这么方便，而只有学习汇编，你才能更深入理解 2 * 3 底层到底是如何实现的

示例：乘积小于10处理

```nasm

;调用并输出
%macro  run_out 0                      
        mov eax, 4         
        mov ebx, 1 
        int 0x80               
%endmacro

;退出
%macro  return 0                      
        mov eax,1   
        int 0x80              
%endmacro


;乘法：乘积小于10处理 （ num1，num2）
%macro  mul_oper 2                      
         mov  al, %1
         sub  al, '0'

         mov  bl, %2
         sub  bl, '0'
         
         mul  bl  ;这里乘法指令是一种【隐含寻址】方式，下面备注介绍
         add  al, '0'

         mov  [res], al
         mov  ecx,res 
         mov  edx,1                  
%endmacro

section  .text
   global _start    
        
_start:      
   mul_oper '3','3' ;计算3*3结果
   run_out      
   return     

segment .bss
res resb 1
```



**隐含寻址**
有些指令的操作码不仅包含了操作的性质，还隐含了部分操作数的地址，如乘法指令MUL，在这条指令中只需指明乘数的地址，而被乘数以及乘积的地址是隐含且固定的。这种将一个操作数隐含在指令码中的寻址方式称为隐含寻址。

例如：

```nasm
mul  bl ;mul bl的功能把AL中的内容与BL的内容相乘，乘积送到AX寄存器中

;因此上面示例中我们将另一个送入al，然后会自动隐式从 al 取值
```





### IMUL 乘法指令

imul乘法指令支持符号运算，支持多参数

> 1、支持正负符号
>
> 2、支持2，3个参数，但是三个参数的最后一个必须是立即数



类似的：

```nasm
; a 16 bit multiplication:
  mov ax, [factor1]
  mov bx, [factor2]
  imul bx              ; 32-bit result in DX:AX
  ; or  imul  word [factor2]

  ; a 32 bit multiplication:
  mov eax, [factor1]
  mov ebx, [factor2] 
  imul ebx             ; 64-bit result in EDX:EAX
```

在386或更高版本上

```nasm
	mov   ecx, [factor1]
  imul  ecx, [factor2]    ; result in ecx, no other registers affected
  imul  ecx, ecx          ; and square the result
  
----------------------------  
  
  movsx   ecx, word [factor1]
  movsx   eax, word [factor2]  ; sign-extend inputs to 32-bit
  imul    eax, ecx             ; 32-bit multiply, result in EAX
  imul    eax, eax             ; and square the result
  
----------------------------
  imul  cx, bx, 123        ; requires 186
----------------------------
	imul  ecx, ebx, -123      ; requires 386
```





### DIV / IDIV指令



#### 示例：6/3=2

```nasm
section .text
   global _start    ;must be declared for using gcc
        
_start:             ;tell linker entry point
   mov  ax,'6'
   sub     ax, '0'
        
   mov  bl, '3'
   sub     bl, '0'
   div  bl
   add  ax, '0'
        
   mov  [res], ax
   mov  ecx,msg 
   mov  edx, len
   mov  ebx,1   ;file descriptor (stdout)
   mov  eax,4   ;system call number (sys_write)
   int  0x80    ;call kernel
        
   mov  ecx,res
   mov  edx, 1
   mov  ebx,1   ;file descriptor (stdout)
   mov  eax,4   ;system call number (sys_write)
   int  0x80    ;call kernel
        
   mov  eax,1   ;system call number (sys_exit)
   int  0x80    ;call kernel
        
section .data
msg db "The result is:", 0xA,0xD 
len equ $- msg   
segment .bss
res resb 1
```

[在线运行上面示例：](https://www.jc2182.com/runcode.html?filename=jisuan4&type=21&module=jiaocheng)



### DIV / IDIV （x86 - 32位）

#### DIV 无符号除法

> DIV 	寄存器或内存(8位)
> DIV 	寄存器或内存(16位)
> DIV 	寄存器或内存(32位)



| 被除数  | 除数      | 商   | 余数 |
| ------- | --------- | ---- | ---- |
| AX      | reg/mem8  | AL   | AH   |
| DX:AX   | reg/mem16 | AX   | DX   |
| EDX:EAX | reg/mem32 | EAX  | EDX  |

比例

```nasm
mov ax, 0043h      ; 被除数
mov bl, 5          ; 除数
div bl             ; AL = 08h, AH = O3h
```



⚠️ 

1、除数不能为0，需要判断

2、商或余数存储超过对应空间大小就会抛出异常

3、不占用的寄存器需要清空



```nasm
DX 包含的是被除数的高位部分，因此在执行 DIV 指令之前，必须将其清零：

mov dx, 0             ; 清除被除数高16位
mov ax, 8003h         ; 被除数的低16位
mov ex, 100h          ; 除数
div ex                ; AX = 0080h, DX = 0003h

```





#### IDIV 有符号数除法

有符号除法与无符号几乎相同，但是在计算前必须对被除数进行符号扩展。

| **指令** | **全称**                                   | **说明**               |
| -------- | ------------------------------------------ | ---------------------- |
| cbw      | **c**onvert **b**yte to **w**ord           | 将AL的符号位扩展到AH   |
| cwd      | **c**onvert **w**ord to **d**oubleword     | 将AX的符号位扩展到DX   |
| cdq      | **c**onvert **d**oubleword to **q**uadword | 将EAX的符号位扩展到EDX |



```nasm
.data
wordval sword -101
 
.code
main PROC
    nop
    mov dx, 0
    mov ax, wordval
    cwd;   DX:AX=FFFF:FF9B，这样的才能保证被除数是负101，否则会被解释为正65435。
    mov bx, 2
    idiv bx
    invoke ExitProcess,0
main ENDP

```



## 逻辑

常见逻辑指令 and、or、xor、not、test（测试计算数据）等等



###  逻辑指令

格式：

| 指令     | 格式                  |
| :------- | :-------------------- |
| **AND**  | AND 操作数1，操作数2  |
| **OR**   | OR 操作数1，操作数2   |
| **XOR**  | XOR 操作数1，操作数2  |
| **TEST** | TEST 操作数1，操作数2 |
| **NOT**  | NOT 操作数1           |





### AND 指令

实现按位与运算

1、将寄存器清空

```nasm
AND     AH, 00H     ; 高位AH清空
```

2、检查奇偶数

```nasm
AND     AL, 01H     ; 与上 0000 0001
```

格式示例：

| and 【寄存器or内存】【寄存器or内存or立即数】 ✅ |
| ---------------------------------------------- |
| and 【内存】【内存】 ❌                         |
| 运算结果会修改对应的标志：                     |
| CF，OF，PF，SF和ZF标志                         |



以下程序说明了这一点-

```nasm
section .text
   global _start            
        
_start:                     
   mov   ax,   6h           ;设置数据6（二进制 0110 ），下面开始判断它的奇偶
   and   ax, 1              ;通过 0001 & 0110 = 0，此时标记位 ZF=0
   jz    even_f             ; jz: ZF 等于 0 成立，跳转 偶数过程 even_f
   ;jnz   odd_f               jnz: ZF 不等于 0 成立，跳转 奇数过程 odd_f
   jmp   exit               ; jmp 无条件跳转到 exit

even_f:  ;偶数打印
  
   mov   eax, 4             
   mov   ebx, 1             
   mov   ecx, even_msg      
   mov   edx, len1          
   int   0x80               

odd_f:  ;奇数打印
   
   mov   eax, 4             
   mov   ebx, 1             
   mov   ecx, odd_msg       
   mov   edx, len2          
   int   0x80

exit: ;退出
   
   mov   eax,1             
   int   0x80              

section   .data
even_msg  db  '是偶数!' 
len1  equ  $ - even_msg 
   
odd_msg db  '是奇数!'    
len2  equ  $ - odd_msg
```



跳转相关的标志位: 【⚠️ 关于标志位详细介绍后面篇章有介绍】

| 11    | 10   | 9    | 8    | 7     | 6    | 5     | 4     | 3     | 2     | 1     | 0     |
| ----- | ---- | ---- | ---- | ----- | ---- | ----- | ----- | ----- | ----- | ----- | ----- |
| OF    | DF   | IF   | TF   | SF    | ZF   |       | AF    |       | PF    |       | CF    |
| 溢 出 | 方向 | 中断 | 调试 | 符 号 | 非零 | 未 用 | 辅 助 | 未 用 | 奇 偶 | 未 用 | 进 位 |

部分跳转指令和标记位关系：

| 程序控制类               | 无条件转移              | JMP                   | 不影响标志位            |      |
| ------------------------ | ----------------------- | --------------------- | ----------------------- | ---- |
| 条 件 转 移              | 单个 标志 位            | JS/JNS                | SF=1/0,则转移到目的地址 |      |
| JZ/ JNZ                  | ZF=1/0,则转移到目的地址 |                       |                         |      |
| JP/JNP                   | PF=1/0,则转移到目的地址 |                       |                         |      |
| JB/JNB                   | CF=1/0,则转移到目的地址 |                       |                         |      |
| JO/JNO                   | OF=1/0,则转移到目的地址 |                       |                         |      |
| 若干 标志 位的 逻辑 组合 | JA                      | 两个无符号数比较，A>B |                         |      |



### OR 指令

OR 指令用于通过执行按位或运算来支持逻辑表达式。

例如

4 or 3 结果 = 7

```nasm
 mov    al, 4             ;0100
 mov    bl, 3             ;0011
 or     al, bl            ;0100 | 0011 = 0111 
 add    al, byte '0'      ;格式化
```



### XOR 指令

异或运算：位不同为1，相同为0

例如，

4 xor 3 结果 = 7

```nasm
 mov    al, 4             ;0100
 mov    bl, 3             ;0011
 or     al, bl            ;0100 xor 0011 = 0111 
 add    al, byte '0'      ;格式化
```



清零操作：

将操作数与自身进行XOR会将操作数更改为0。这用于清除寄存器。

```nasm
XOR     EAX, EAX
```



### TEST 指令

TEST 指令与AND运算的工作原理相同，但与AND指令不同的是，它不会更改第一个操作数。

因此，可以使用test测试某个逻辑运算的结果：

```nasm
AND    AL, 01H ;会修改AL的值

TEST    AL, 01H ;不会修改AL的值
```



### NOT 指令

NOT 指令实现按位NOT运算。NOT操作将操作数中的位取反。操作数可以在寄存器中，也可以在存储器中。

NOT 是单操作，接受一个参数

例如，

```nasm
 mov    al, 4             ;0100
 mov    bl, 3             ;0011
 or     al, bl            ;al = 0100 | 0011 = 0111 
 not    al 			          ;al = 0000 0111 取反 = 1111 1000
```

 

## 条件

前面示例已经介绍过一些条件指令，比如 jmp 无条件跳转



###  条件

条件令可以更改程序中的控制流，分为有条件和无条件：

**无条件跳转** - JMP 就是最常见的，类似 go to

**有条件跳转** - 通过条件判断是否或者如何处理控制流向



### 无条件跳转

语法格式

```nasm
JMP     label
```



JMP指令：直接跳转到指定的过程，不做任何判断

```nasm
_start:                     
   ...
   jmp   exit               ; jmp 无条件跳转到 exit

exit: ;退出
   
   mov   eax,1             
   int   0x80 
```





### 条件跳转

如果在条件跳转中满足某些指定条件，则控制流将转移到目标指令。

| 指令        | 描述                      | 标志测试   |
| :---------- | :------------------------ | :--------- |
| **JE/JZ**   | 跳转等于或跳转零          | ZF         |
| **JNE/JNZ** | 跳转不等于或跳转不为零    | ZF         |
| **JG/JNLE** | 跳转大于或跳转不小于/等于 | OF，SF，ZF |
| **JGE/JNL** | 跳转大于/等于或不小于跳转 | OF，SF     |
| **JL/JNGE** | 跳转小于或不大于/等于     | OF，SF     |
| **JLE/JNG** | 跳少/等于或跳不大于       | OF，SF，ZF |

以下是对用于逻辑运算的无符号数据使用的条件跳转指令-

| 指令        | 描述                      | 标志测试 |
| :---------- | :------------------------ | :------- |
| **JE/JZ**   | 跳转等于或跳转零          | ZF       |
| **JNE/JNZ** | 跳转不等于或跳转不为零    | ZF       |
| **JA/JNBE** | 跳转向上或不低于/等于     | CF，ZF   |
| **JAE/JNB** | 高于/等于或不低于         | CF       |
| **JB/JNAE** | 跳到以下或跳到不高于/等于 | CF       |
| **JBE/JNA** | 跳到下面/等于或不跳到上方 | AF，CF   |

以下条件跳转指令有特殊用途，并检查标志的值-

| 指令        | 描述                         | 标志测试 |
| :---------- | :--------------------------- | :------- |
| **JXCZ**    | 如果CX为零则跳转             | 没有     |
| **JC**      | 如果携带则跳                 | CF       |
| **JNC**     | 如果不携带则跳转             | CF       |
| **JO**      | 溢出时跳转                   | OF       |
| **JNO**     | 如果没有溢出则跳转           | OF       |
| **JP/JPE**  | 跳校验或偶校验               | PF       |
| **JNP/JPO** | 跳转无奇偶校验或跳转奇偶校验 | PF       |
| **JS**      | 跳跃符号（负值）             | SF       |
| **JNS**     | 跳转无符号（正值）           | SF       |



根据 CX、ECX 寄存器的值跳转: 

JCXZ(CX 为 0 则跳转)、JECXZ(ECX 为 0 则跳转);



### 示例

CMP 比较是否相同的指令，通过相减等于0表示相同，否则不相同。



```nasm
CMP     AL, BL  ;比较他们是否相同,相同 ZF=0
JE      equal		;使用je：判断ZF标记等于0跳转

CMP     AL, BH
JNE     not_equal   ;使用jne：判断ZF标记不等于0跳转

not_equal: 
...

equal: 
...
```





##  过程

可以理解为c 语言的函数

前面示例 jmp、je等条件指令 跳转的就是 过程或子例程

过程的语法：

```nasm
proc_name:				 ;过程名称
   procedure body  ;过程主体
   ...
   ret							;过程的结束由return语句指示
```



示例：

```nasm
section .text
   global _start      
        
_start:    
   jmp name_1
   
 name_2:
   mov  edx,4           
   mov  ecx, names+8     
   mov  ebx,1          
   mov  eax,4          
   int  0x80  
   jmp exit

 name_1:
   mov  edx,4           
   mov  ecx, names+4     
   mov  ebx,1          
   mov  eax,4          
   int  0x80      
   jmp name_2
   
exit:
   mov  eax,1           
   int  0x80            

section .data
global names
names:
DW  'Lucy', 'Andy', 'Pete'
```





## 循环

c语法中 while 等能很方便实现循环功能

在汇编中可以通过loop 和jmp 等实现



###  循环 loop

loop指令的格式是：loop 标号

通常我们用loop指令来实现循环功能，cx中存放循环次数。

CPU执行loop指令的时候，要进行两步操作：

> 1、(cx)=(cx)-1；
> 2、判断CX中的值，不为零则转至标号处执行程序，如果为零则向下执行。

示例：

循环判断5次，每次都对ax 加一，最后cx=0时循环结束，

```nasm
	mov ax,5
	mov cx,5
loop_1:		
	inc ax
			
	loop loop_1
```

1、标号：loop_1

在汇编语言中，标号代表一个地址，程序中有一个标号loop_1。它实际上标识了一个 地址，

这个地址处有一条指令：inc ax

2、loop loop_1：

CPU执行loop s的时候，要进行两步操作：

① (cx)=(cx)-1；（loop 自动计算的）

②判断cx中的值，不为0则转至标号s所标识的地址处执行，为零则执行下一条指令。

3、在这段程序中第一次执行loop loop_1前，cx=5，ax=5 

第一次执行后，cx=4，ax=6

最后一次 cx=0，ax=10

4、用CX和loop指令相配合实现循环功能的3个要点：

> 1、在 CX中存放循环次数；
> 2、loop指令中的标号所标识地址要在前面；
> 3、要循环执行的程序段，要写在标号和loop指令的中间



### 例子

从9到0打印：

```nasm
section .text
   global _start      
        
_start:               
   mov ecx,10				;index 起始值
   mov eax, '9'			;起始值
        
loop_dec:
   mov [num], eax
   mov eax, 4
   mov ebx, 1
   push ecx
        
   mov ecx, num        
   mov edx, 1        
   int 0x80
        
   mov eax, [num]
   sub eax, '0'
   dec eax					;递减
   add eax, '0'
   pop ecx
   loop loop_dec		;循环，每次自动对 ecx 自减，直到0结束循环
        
   mov eax,1             
   int 0x80              
section .bss
num resb 1
```

结果:

```nasm
9876543210
```



## ASCII数值

当数字显示在屏幕上或从键盘输入时，它们是ASCII形式存储的，也就是 输入‘1’ 实际是 49

比如：

```nasm
mov  eax,'0'
```

此时，eax 真实数据并非十进制数据0，而是 0的 ASCII 值 48 或者 30 . 

所以计算的时候，ASCII 十进制 的话 要先 - 48 得到真实的0

下面观察一组0-9数据表：


| Bin(二进制) | Oct(八进制) | Dec(ASCII 十进制) | Hex(ASCII 十六进制) | Dec(十进制数值) | 解释 |
| ----------- | ----------- | ----------- | ------------- | --------- | ---- |
|  0011 0000 | 060 | 48 | 0x30 | 0 | 字符0 |
| 0011 0001 | 061 | 49 | 0x31 | 1 | 字符1 |
| 0011 0010 | 062 | 50 | 0x32 | 2 | 字符2 |
| 0011 0011 | 063 | 51 | 0x33 | 3 | 字符3 |
| 0011 0100 | 064 | 52 | 0x34 | 4 | 字符4 |
| 0011 0101 | 065 | 53 | 0x35 | 5 | 字符5 |
| 0011 0110 | 066 | 54 | 0x36 | 6 | 字符6 |
| 0011 0111 | 067 | 55 | 0x37 | 7 | 字符7 |
| 0011 1000 | 070 | 56 | 0x38 | 8 | 字符8 |
| 0011 1001 | 071 | 57 | 0x39 | 9 | 字符9 |



### ASCII数值操作

假设输入的数值16进制结果 以ASCII 十进制 数理解如下操作：

1、最终输出eax结果：d

```nasm
mov  eax,'2'	;eax = 50
mov  ebx,'2'	;ebx = 50
add  eax, ebx	;eax = 50 + 50 = 100 

;此时打印eax的值不是4，打印的是 ASCII 100 对应的值d
```

2、最终输出eax结果：菱形符号控制符号，不能正常输出

```nasm
mov  eax,2	;eax = 2
mov  ebx,2	;ebx = 2
add  eax, ebx	;eax = 2 + 2 = 4 

;此时打印eax的值不是4，打印的是 ASCII 4 对应的值菱形符号控制符号
```

3、最终输出eax结果：4

```nasm
mov  eax,'2'	;eax = 50
mov  ebx,2	;ebx = 2
add  eax, ebx	;eax = 50 + 2 = 52 

;此时打印eax的值是 ASCII 52 对应的值4
```

4、最终输出eax结果：4

```nasm
mov  eax,'2'	;eax = 50
sub  eax,'0'	;eax = 50 - 48 = 2

mov  ebx,'2'	;ebx = 50
sub  ebx,'0'	;ebx = 50 - 48 = 2

add  eax, ebx	;eax = 2 + 2 = 4
add  eax, '0' ;eax = 48 + 4 = 52 

;此时打印eax的值是 ASCII 52 对应的值4
```



下面从网络上收集了ASCII  0 -159 对应的数据

**ASCII码**大致由三部分组成：

### 1、ASCII 可打印字符对照表

数字 32–126 分配给了能在键盘上找到的字符，当您查看或打印文档时就会出现。注：十进制32代表空格 ，十进制数字 127 代表 DELETE 命令。下面是**ASCII码和相应数字**的对照表

| ASCII 码 | 字符     |      |      | ASCII 码 | 字符     |      |      | ASCII 码 | 字符     |      |      | ASCII 码 | 字符     |      |
| -------- | -------- | ---- | ---- | -------- | -------- | ---- | ---- | -------- | -------- | ---- | ---- | -------- | -------- | ---- |
| 十进位   | 十六进位 |      |      | 十进位   | 十六进位 |      |      | 十进位   | 十六进位 |      |      | 十进位   | 十六进位 |      |
| 032      | 20       |      |      | 056      | 38       | 8    |      | 080      | 50       | P    |      | 104      | 68       | h    |
| 033      | 21       | !    |      | 057      | 39       | 9    |      | 081      | 51       | Q    |      | 105      | 69       | i    |
| 034      | 22       | "    |      | 058      | 3A       | :    |      | 082      | 52       | R    |      | 106      | 6A       | j    |
| 035      | 23       | #    |      | 059      | 3B       | ;    |      | 083      | 53       | S    |      | 107      | 6B       | k    |
| 036      | 24       | $    |      | 060      | 3C       | <    |      | 084      | 54       | T    |      | 108      | 6C       | l    |
| 037      | 25       | %    |      | 061      | 3D       | =    |      | 085      | 55       | U    |      | 109      | 6D       | m    |
| 038      | 26       | &    |      | 062      | 3E       | >    |      | 086      | 56       | V    |      | 110      | 6E       | n    |
| 039      | 27       | '    |      | 063      | 3F       | ?    |      | 087      | 57       | W    |      | 111      | 6F       | o    |
| 040      | 28       | (    |      | 064      | 40       | @    |      | 088      | 58       | X    |      | 112      | 70       | p    |
| 041      | 29       | )    |      | 065      | 41       | A    |      | 089      | 59       | Y    |      | 113      | 71       | q    |
| 042      | 2A       | *    |      | 066      | 42       | B    |      | 090      | 5A       | Z    |      | 114      | 72       | r    |
| 043      | 2B       | +    |      | 067      | 43       | C    |      | 091      | 5B       | [    |      | 115      | 73       | s    |
| 044      | 2C       | ,    |      | 068      | 44       | D    |      | 092      | 5C       | \    |      | 116      | 74       | t    |
| 045      | 2D       | -    |      | 069      | 45       | E    |      | 093      | 5D       | ]    |      | 117      | 75       | u    |
| 046      | 2E       | .    |      | 070      | 46       | F    |      | 094      | 5E       | ^    |      | 118      | 76       | v    |
| 047      | 2F       | /    |      | 071      | 47       | G    |      | 095      | 5F       | _    |      | 119      | 77       | w    |
| 048      | 30       | 0    |      | 072      | 48       | H    |      | 096      | 60       | `    |      | 120      | 78       | x    |
| 049      | 31       | 1    |      | 073      | 49       | I    |      | 097      | 61       | a    |      | 121      | 79       | y    |
| 050      | 32       | 2    |      | 074      | 4A       | J    |      | 098      | 62       | b    |      | 122      | 7A       | z    |
| 051      | 33       | 3    |      | 075      | 4B       | K    |      | 099      | 63       | c    |      | 123      | 7B       | {    |
| 052      | 34       | 4    |      | 076      | 4C       | L    |      | 100      | 64       | d    |      | 124      | 7C       | \|   |
| 053      | 35       | 5    |      | 077      | 4D       | M    |      | 101      | 65       | e    |      | 125      | 7D       | }    |
| 054      | 36       | 6    |      | 078      | 4E       | N    |      | 102      | 66       | f    |      | 126      | 7E       | ~    |
| 055      | 37       | 7    |      | 079      | 4F       | O    |      | 103      | 67       | g    |      | 127      | 7F       | DEL  |



### 2、ASCII 非打印控制字符

ASCII 表上的数字 0–31 分配给了控制字符，用于控制像打印机等一些外围设备。例如，12 代表换页/新页功能。此命令指示打印机跳到下一页的开头。

| 进制 | 十六进制 | 字符 |      | 十进制 | 十六进制 | 字符 |
| ---- | -------- | ---- | ---- | ------ | -------- | ---- |
| 0	| 00	| 空	 	|  | 16	|    10	|    数据链路转意|    
|    1	|    01	|    头标开始	 |    |    	17	|    11	|    设备控制 1|    
|    2	|    02	|    正文开始	 |    |    	18	|    12	|    设备控制 2|    
|    3	|    03	|    正文结束	|    |     	19|    	13	|    设备控制 3|    
|    4	|    04	|    传输结束	|    |     	20|    	14	|    设备控制 4|    
|    5	|    05	|    查询	|    |     	21|    	15	|    反确认|    
|    6	|    06	|    确认	|    |     	22	|    16	|    同步空闲|    
|    7	|    07	|    震铃	|    |     	23|    	17	|    传输块结束|    
|    8	|    08	|    backspace |    |    	 	24|    	18	|    取消|    
|    9	|    09	|    水平制表符|    |    	 	25|    	19|    	媒体结束|    
|    10	|    0A	|    换行/新行|    |    	 	26|    	1A	|    替换|    
|    11	|    0B	|    竖直制表符	|    |     	27	|    1B	|    转意|    
|    12	|    0C	|    换页/新页	|    |     	28	|    1C	|    文件分隔符|    
|    13|    	0D	|    回车	 |    |    	29	|    1D	|    组分隔符|    
|    14|    	0E	|    移出	|    |     	30	|    1E	|    记录分隔符|    
|    15	|    0F	|    移入	|    |     	31	|    1F	|    单元分隔符|    



### 3、扩展 ASCII 可打印字符



| 十进制 | 十六进制 | 字符  |      | 十进制 | 十六进制 | 字符 |      |
| ------ | -------- | ----- | ---- | ------ | -------- | ---- | ---- |
| 32     | 20       | space |      | 80     | 50       | P    |      |
| 33     | 21       | !     |      | 81     | 51       | Q    |      |
| 34     | 22       | "     |      | 82     | 52       | R    |      |
| 35     | 23       | #     |      | 83     | 53       | S    |      |
| 36     | 24       | $     |      | 84     | 54       | T    |      |
| 37     | 25       | %     |      | 85     | 55       | U    |      |
| 38     | 26       | &     |      | 86     | 56       | V    |      |
| 39     | 27       | '     |      | 87     | 57       | w    |      |
| 40     | 28       | (     |      | 88     | 58       | X    |      |
| 41     | 29       | )     |      | 89     | 59       | Y    |      |
| 42     | 2A       | *     |      | 90     | 5A       | Z    |      |
| 43     | 2B       | +     |      | 91     | 5B       | [    |      |
| 44     | 2C       | ,     |      | 92     | 5C       | /    |      |
| 45     | 2D       | -     |      | 93     | 5D       | ]    |      |
| 46     | 2E       | .     |      | 94     | 5E       | ^    |      |
| 47     | 2F       | /     |      | 95     | 5F       | _    |      |
| 48     | 30       | 0     |      | 96     | 60       | `    |      |
| 49     | 31       | 1     |      | 97     | 61       | a    |      |
| 50     | 32       | 2     |      | 98     | 62       | b    |      |
| 51     | 33       | 3     |      | 99     | 63       | c    |      |
| 52     | 34       | 4     |      | 100    | 64       | d    |      |
| 53     | 35       | 5     |      | 101    | 65       | e    |      |
| 54     | 36       | 6     |      | 102    | 66       | f    |      |
| 55     | 37       | 7     |      | 103    | 67       | g    |      |
| 56     | 38       | 8     |      | 104    | 68       | h    |      |
| 57     | 39       | 9     |      | 105    | 69       | i    |      |
| 58     | 3A       | :     |      | 106    | 6A       | j    |      |
| 59     | 3B       | ;     |      | 107    | 6B       | k    |      |
| 60     | 3C       | <     |      | 108    | 6C       | l    |      |
| 61     | 3D       | =     |      | 109    | 6D       | m    |      |
| 62     | 3E       | >     |      | 110    | 6E       | n    |      |
| 63     | 3F       | ?     |      | 111    | 6F       | o    |      |
| 64     | 40       | @     |      | 112    | 70       | p    |      |
| 65     | 41       | A     |      | 113    | 71       | q    |      |
| 66     | 42       | B     |      | 114    | 72       | r    |      |
| 67     | 43       | C     |      | 115    | 73       | s    |      |
| 68     | 44       | D     |      | 116    | 74       | t    |      |
| 69     | 45       | E     |      | 117    | 75       | u    |      |
| 70     | 46       | F     |      | 118    | 76       | v    |      |
| 71     | 47       | G     |      | 119    | 77       | w    |      |
| 72     | 48       | H     |      | 120    | 78       | x    |      |
| 73     | 49       | I     |      | 121    | 79       | y    |      |
| 74     | 4A       | J     |      | 122    | 7A       | z    |      |
| 75     | 4B       | K     |      | 123    | 7B       | {    |      |
| 76     | 4C       | L     |      | 124    | 7C       |      |      |
| 77     | 4D       | M     |      | 125    | 7D       | }    |      |
| 78     | 4E       | N     |      | 126    | 7E       | ~    |      |
| 79     | 4F       | O     |      | 127    | 7F       | DEL  |      |



###  数值数据



```nasm
section .text
   global _start        ;must be declared for using gcc
        
_start:                 ;tell linker entry point
   mov  eax,'5'
   sub     eax, '0'
        
   mov  ebx, '6'
   sub     ebx, '0'
   add  eax, ebx
   add  eax, '0'
        
   mov  [sum], eax
   mov  ecx,msg 
   mov  edx, len
   mov  ebx,1            ;file descriptor (stdout)
   mov  eax,4            ;system call number (sys_write)
   int  0x80             ;call kernel
        
   mov  ecx,sum
   mov  edx, 1
   mov  ebx,1            ;file descriptor (stdout)
   mov  eax,4            ;system call number (sys_write)
   int  0x80             ;call kernel
        
   mov  eax,1            ;system call number (sys_exit)
   int  0x80             ;call kernel
        
section .data
msg db "The sum is:", 0xA,0xD 
len equ $ - msg   
segment .bss
sum resb 1
```

结果：（显然结果不是我们想看到的）

```t4
The sum is:
；
```

TODO：

1、每次运算都要对每个寄存器处理有一定消耗

2、能计算个位，但是没法进行进位，比如不能正确表示出11



### ASCII表示

在ASCII表示中，十进制数字存储为ASCII字符字符串，运算需要使用正确的汇编指令进行处理

输入‘0’，结果其实是

```
30H
```

输入十进制值0123存储为：

```t4
30 		31     32      33H
```

其中，30H是0的ASCII值，31H是1的ASCII值，依此类推。

所以要输出一个11需要这样：

```nasm
section .text
   global _start        
        
_start:   
   mov     ax, 3131H	 ;设置 ax值 11
   
   mov     [res], ax

   mov  edx,2           ;长度2
   mov  ecx,res         ;赋值
   mov  ebx,1           
   mov  eax,4           
   int  0x80            
        
   mov  eax,1           
   int  0x80            
                      
section .bss
res resb 2  
```



所以在本篇汇编中是不能完全直接使用 add 、sub直接加减的

**1、处理ASCII运算的指令**

| ASCII运算的指令 （未压缩）                  | 解释              |
| --------------------------------- | ----------------- |
| AAA（⚠️ 都是单指令，后不接操作数） | 加法后ASCII调整   |
| AAS                               | 减法后的ASCII调整 |
| AAM                               | 乘法后ASCII调整   |
| AAD                               | 除法前ASCII调整   |

2、处理对象

这些指令处理的是 ax（eax 等），不需要指定，类似 ‘隐含寻址’

3、使用方式

```nasm
;加法运算
add     ax, '6'
aaa

;减法运算
sub     ax, '6'
aas
```



示例：

计算 5+6=11

```nasm
section .text
   global _start        
        
_start:                 ;tell linker entry point
   ;初始化操作，清空ax中的 高地位数据
   sub     al, ah
   sub     ah, ah
   
   ;运算
   mov     ax, '5'			;ax = 00 35H
   
   add     ax, '6'			;ax = 00 35H + 00 36H = 00 6BH
   aaa		;调整ax中值（不是其它寄存器）
   ;⚠️ 使用add后接着使用aaa表示格式化，将上面加法后ASCII值进行调整
   ;调整前 00 6BH ，处理后 ax = 01 01H，高低位各一个1表示 11的值
   
   or      al, 30h			;ax = 01 31H
   or      ah, 30h			;ax = 31 31H
   
   mov     [res], ax		;res = 11

   mov  edx,2           ;11占两个字节，如果设置1个字节的长度的话返回的是1不是11
   mov  ecx,res         ;写入结果
   mov  ebx,1           
   mov  eax,4           
   int  0x80            
        
   mov  eax,1           
   int  0x80           
                      
section .bss
res resb 2  
```

结果：

```t4
11
```



### 压缩

对于一个十进制数1234

1、1234 的 ASCII十六进制表示：

```
31 32 33 34 H
```

对应的未压缩十进制表示：

```
01 02 03 04
```

2、所以前面上一个示例中 aaa 的结果就是未压缩十进制表示

```
01 01
```



3、对应压缩后十进制表示：

```
12 34
```



从上可以看到，压缩后可以减少一半的存储空间。

**压缩后数据运算指令**：（⚠️ 不支持 ）


| ASCII运算的指令 （压缩）                  | 解释              |
| --------------------------------- | ----------------- |
| DAA  | 加法后的十进制调整 |
| DAS  | 减后的十进制调整   |
| 乘法 | 不支持 |
| 除法 | 不支持 |

对比加法运算后 aaa（未压缩） 和 daa （压缩）结果

1、aaa

```nasm
mov     ax, '5'			;ax = 00 35H
add     ax, '6'			;ax = 00 6BH
aaa 								;ax = 01 01H
```

2、daa

```nasm
mov     ax, '5'			;ax = 00 35H
add     ax, '6'			;ax = 00 6BH
daa 								;ax = 00 11H
```



**示例**：

```nasm
section .text
   global _start        ;must be declared for using gcc

_start:                 ;tell linker entry point

   mov     esi, 4       ;pointing to the rightmost digit
   mov     ecx, 5       ;num of digits
   clc				; 清除标志位 CF的值，即CF=0
add_num:  
   mov  al, [num1 + esi]
   adc  al, [num2 + esi]
   aaa
   pushf
   or   al, 30h
   popf
        
   mov  [sum + esi], al
   dec  esi
   num  add_num
        
   mov  edx,len         ;message length
   mov  ecx,msg         ;message to write
   mov  ebx,1           ;file descriptor (stdout)
   mov  eax,4           ;system call number (sys_write)
   int  0x80            ;call kernel
        
   mov  edx,5           ;message length
   mov  ecx,sum         ;message to write
   mov  ebx,1           ;file descriptor (stdout)
   mov  eax,4           ;system call number (sys_write)
   int  0x80            ;call kernel
        
   mov  eax,1           ;system call number (sys_exit)
   int  0x80            ;call kernel

section .data
msg db 'The Sum is:',0xa        
len equ $ - msg                 
num1 db '12345'
num2 db '23456'
sum db '     '
```



[尝试一下](https://www.jc2182.com/runcode.html?filename=num3&type=21&module=jiaocheng)

编译并执行上述代码后，将产生以下结果-

```t4
The Sum is:
35801
```

--------



## 标志位



前面在介绍逻辑章节的时候使用到了标志位，此节详细介绍每一个标志位（intel 16、32位）。

CPU内部的寄存器中有一种特殊的寄存器，被称为标志寄存器，具有以下三种作用，：

> （1）用来存储相关指令的某些执行结果；
>
> （2）用来为CPU执行相关指令提供行为依据；
>
> （3）用来控制CPU的相关工作方式。

### **状态字**(PSW)

程序运行中一些记录信息，根据CPU不同，存储状态信息的寄存器也不同，有16位，32位，64位等等



### **标志寄存器**(flag)

标志，顾名思义就是记录一些状态当前的信息，方便做判断，

flag寄存器是按位起作用的，每一位都有专门的含义，8086 CPU的flag寄存器的结构：

| 位（高-低） | flag（计算结果标志位）         | 含义（计算后的标记）                       |      |
| ----------- | ------------------------------ | ------------------------------------------ | ---- |
| 15          |                                |                                            |      |
| 14          |                                |                                            |      |
| 13          |                                |                                            |      |
| 12          |                                |                                            |      |
| 11          | OF（**有符号运算**是否有溢出） | if (结果溢出) { of=1} else { of=0 }        |      |
| 10          | DF（递增递减方向）             | si、di递增 df=0，si、di递减df=1            |      |
| 9           | IF（中断允许）                 | 允许并响应外部中断时if=1，反之屏蔽         |      |
| 8           | TF（调试）                     | tf=1表示处理器每次只执行一条指令，调试模式 |      |
| 7           | SF（非负）                     | if (结果负数) { sf=1} else { sf=0 }        |      |
| 6           | ZF（非0）                      | if (计算结果为0) { zf=1} else { zf=0 }     |      |
| 5           |                                |                                            |      |
| 4           | AF（辅助进位）                 | af=1表示运算过程中**最后四位**有进位       |      |
| 3           |                                |                                            |      |
| 2           | PF（奇偶）                     | if (计算结果为偶数) { pf=1} else { pf=0 }  |      |
| 1           |                                |                                            |      |
| 0           | CF（**无符号运算**是否有借位） | 结果显示不下产生了借位，cf=1               |      |

其中1、3、5、12、13、14、15位在8086 CPU中没有使用



### **OF标志**

**有符号**运算**溢出**标志位。

记录了**有符号**运算的结果是否发生了溢出，如果发生溢出OF=1,如果没有OF=0；



### **DF标志**

方向标志位。

在串处理指令中，每次操作后，如果DF=0，si、di递增，如果DF=1，si、di递减；

DF的值是由程序员进行设定的 cld命令是将DF设置为0，std命令是将DF设置为1；



### **IF标志**

中断允许标志位。

它用来控制是否允许接收外部中断请求。

若IF=1，能响应外部中断，反之则屏蔽外部中断;

### **TF标志**

调试标志位。

当TF=1时，处理器每次只执行一条指令，即单步执行;

### SF标志

flag的第7位是SF，符号标志位。

它记录相关指令执行后，其结果是否为负。如果结果为负，sf=1；如果非负，sf=0。

计算机中通常用**补码**来表示有符号数据（负数）。

运算后可以通过它来得知结果的正负。

```nasm
mov ax,1
sub ax,2
;1-2<0,此时sf=1
```



### ZF标志

flag的第6位是ZF，零标志位

它记录相关指令执行后，结果为0，ZF=1(记录下是0这样的肯定信息)，结果不为0，ZF=0(表示结果非0)。

```nasm
mov ax,5
sub ax,5
;指令执行后，结果为0，则ZF=1

mov ax,5
and ax,0
;指令执行后，结果为0，则ZF=1

mov ax,5
sub ax,1
;指令执行后，结果为4，不为0，则ZF=0

mov ax,1
or ax,0
;指令执行后，结果为1，不为0，则ZF=0
```



### **AF标志**

辅助进位标志位。

运算过程中看最后四位，不论长度为多少。最后四位向前有进位或者借位，AF=1,否则AF=0;



### PF标志

flag的第2位是PF，奇偶标志位。

记录指令执行后结果所有的二进制位中1的个数。为偶数，PF=1；为奇数，PF=0。

```nasm
mov al,1
add al,2
;执行结果为00000011B，有2个1，偶数,则PF=1

mov al,1
or al,0
;执行后结果为00000001B，有1个1，奇数,则PF=1
```



### CF标志

flag的第0位是CF，**无符号**运算**进位**标志位。

是**无符号运算**记录了运算结果的最高有效位向更高位的进位值，或从更高位的借位值。

对于位数为N的无符号数，其对应的二进制信息的最高位，即第N-1位，就是它的最高有效位，假想存在第N位是相对于最高有效位的更高位。

```nasm
mov al,98h
add al,al      ;98H + 98H = 01 30H; al 只有两个字节，所以执行后(al)=30H，cf=1，cf记录了从最高有效位向更高位的进位值
add al,al      ;30H + 30H = 60H; 执行后(al)=60H，cf=0，cf记录了从最高有效位向更高位的进位值

sub al,al      ;执行后(al)=0，cf=0，cf记录了向更高位的借位值
```



### 1.1 abc指令

adc是带进位加法指令，利用了CF位上记录的进位值。

格式：adc 操作对象1，操作对象2

功能：操作对象1=操作对象1+操作对象2+CF。

```nasm
mov ax,2
mov bx,1
sub bx,ax
adc ax,1
执行后 (ax)=4，相当于计算(ax)+1+CF=2+1+1+4

mov ax,1
add ax,ax
adc ax,3
执行后(ax)=5，相当于执行(ax)+3+CF=2+3+0=5

mov al,98H
add al,al
adx al,3
执行后 (al)=34H，相当于执行(ax)+3+CF=30H+3+1=34H
```

由adc指令前面的指令，决定在执行adc指令的时候加上的CF的值的含义。也就是说关键在于所加上的CF值是被什么指令设置的。

**1、进位值**

如果是被**add**指令设置的，那么它的含义就是进位值。

加法运算分两步进行：

①低位相加

②高位相加加上低位相加产生的进位值。

CPU提供adc指令的目的，就是来进行加法的第二步运算的。adc指令和add指令相配合就可以对更大的数据进行加法运算。

**2、借位值**

如果CF的值是被**sub**指令设置的，那么它的含义就是借位值；



编程：计算1EF000H+201000H,结果存放在AX(高16位)和BX(低16位)中。

```nasm
mov ax,001EH
mov bx,0F000H
add bx,1000H
adc ax,0020H
;编程：1EF0001000H+2010001EF0H,结果存放在AX(高16位)、BX(次16位)中和cx(低16位)。
```

计算分三步进行：

```
（1）先将低16位相加，完成后，CF中记录本次相加的进位值。
（2）再将次高16位和CF（来自低16位的进位值）相加，完成后，CF中记录本次相加的进位值。
（3）最后高16位和CF（来自次高16位的进位值）相加，完成后，CF中记录本次相加的进位值。
```

```nasm
mov ax,001EH
mov bx,0F000H
mov cx,1000H
add cx,1EF0H
add bx,1000H
adc ax,0020H
```

编程：对两个128位数据进行相加

```nasm
assume cs:code,ds:data
    data segment
            db 16 dup(88H)
            db 16 dup(11H)
    data ends
    code segment
    start:
            mov ax,data
            mov ds,ax
            mov si,0
            mov di,16
            mov cx,8
            call add128
            mov ax,4C00H
            int 21H
    add128:
            push ax
            push cx
            push si
            push di
            sub ax,ax;将CF设置为0
        s:
            mov ax,[si]
            adc ax,[di]
            mov [si],ax
            inc si;不能用add si,2代替
            inc si;因为会影响cf位
            inc di;而loop和inc不会影响
            inc di
            loop s
             pop di
             pop si
             pop cx
             pop ax
             ret
    code ends
end start
```



### 1.2 sbb指令

sbb是带借位减法指令，利用了CF位上记录的借位值。

格式：sbb 操作对象1,操作对象2

功能：操作对象1=操作对象1-操作对象2-CF

利用sbb指令我们可以对任意大的数据进行减法运算。

sbb和adc是基于同样的思想设计的两条指令，在应用思路上sbb和adc类似。

编程：计算003E1000H-00202000H，结果放在ax，bx中

```nasm
mov bx,1000H
mov ax,003EH
sub bx,2000H
sbb ax,0020H
```



### 1.3 cmp指令

cmp是比较指令，功能上相当于减法指令，只是不保存结果。

格式：cmp 操作对象1,操作对象2

功能：计算操作对象1-操作对象2但不保存结果，仅仅是根据计算结果对标志寄存器进行设置。

cmp指令运算执行后通过做减法将对标志寄存器产生影响，其他相关指令通过识别这些被影响的标志寄存器位来得知比较结果。

```nasm
cmp ax,ax
;执行后结果为0，ZF=1,PF=1,SF=0,CF=0,OF=0

mov ax,8
mov bx,3
cmp ax,bx
;执行后ax、bx的值不变，ZF=0,PF=1,SF=0,CF=0,OF=0
;通过cmp指令执行后，相关标志位的值就可以看出比较的结果。 
;指令"cmp ax,bx”的逻辑含义是比较ax和bx中的值
```



**判断结果大小**

指令"cmp ax,bx”的逻辑含义是比较ax和bx中的值，如果执行后：

| cmp ax,bx 比较后的标志状态 | 含义     |
| -------------------------- | -------- |
| ZF=1                       | ax = bx  |
| ZF=0                       | ax != bx |
| CF=1                       | ax < bx  |
| CF=0                       | ax >= bx |
| CF=0 & ZF=0                | ax > bx  |
| CF=1 & ZF=1                | ax <= bx |



**判断结果正负**

⚠️ sf记录的是ah中的8位二进制信息所表示的数据的正负, 而cmp并不修改寄存器的值，单纯地考察SF的值不可能知道结果的正负

| OF          | 0: 没有溢出，1:溢出 |
| ----------- | ------------------- |
| SF          | 1:表示负数，0 正数  |
| OF=0 & SF=1 | （ah）<（bh）       |
| OF=0 & SF=0 | （ah）≥（bh）       |
| OF=1 & SF=1 | （ah）＞（bh）      |
| OF=1 & SF=0 | （ah）<（bh）       |



1、**无溢出**时通过sf标记**可判断**结果的**正负**

如果SF=1或SF=0，OF=0，逻辑上真正结果的正负=实际结果的正负。

of=0，说明没有溢出，逻辑上真正结果的正负=实际结果的正负；

若sf=1，实际结果为负，所以逻辑上真正的结果为负，所以（ah）<（bh）

若sf=0，实际结果非负，所以逻辑上真正的结果非负，所以（ah）≥（bh）

2、**有溢出**时通过sf标记 **判断**结果的**正负****

如果SF=1或SF=0，OF=1，逻辑上真正结果的负正≠实际结果的正负。

of=1，说明有溢出，逻辑上真正结果的正负≠实际结果的正负；

若sf=1，实际结果为负，而又有溢出，这说明是由于溢出导致了实际结果为负，简单分析一下，就可以看出，如果因为溢出导致了实际结果为负，那么逻辑上真正的结果必然为正，则说明（ah）＞（bh）。

若sf=0，实际结果非负，而of=1说明有溢出，则结果非0，所以，实际结果为正。实际结果为正，而又有溢出，这说明是由于溢出导致了导致了实际结果非负，简单分析一下就可以看出，如果因为溢出导致了实际结果为正，那么逻辑上真正的结果必然为负，则说明（ah）<（bh）。



### 1.4 条件转移指令

条件转移指令需根据比较指令、并配合标志综合使用，

比如与cmp相配使用，根据cmp指令的比较结果(cmp指令执行后相关标志位的值)进行工作的指令。

cmp指令可以同时进行两种比较，无符号数比较和有符号数比较，所以根据cmp指令的比较结果进行转移的指令也分为两种：

```html
1、无符号比较

根据无符号数的比较结果进行转移的条件转移指令，它们检测ZF、CF的值；

2、有符号比较

根据有符号数的比较结果进行转移的条件转移指令，它们检测SF、OF、ZF的值。

```

| 跳转指令 | 跳转条件 | 标志位      |
| -------- | -------- | ----------- |
| JE       | =        | ZF=1        |
| JNE      | !=       | ZF=0        |
| JB       | <        | CF=1        |
| JNB      | >=       | CF=0        |
| JA       | >        | CF=0 & ZF=0 |
| JNA      | <=       | CF=1 & ZF=1 |



```nasm
 ;编程：如果(ah)=(bh)则(ah)=(ah)+(ah)，否则(ah)=(ah)+(bh)。

  cmp ah,bh
  je s                       ;ZF=1则跳转
  add ah,bh
  jmp short ok
    s: add ah,bh
   ok: ret 

 ;je检测的是ZF的位置，不管je前面是什么指令，只要CPU执行je指令时，ZF=1那么就发生转移。
		mov ax,0
    mov ax,0
    je s
    inc ax
s:
    inc ax
    
  ;执行后(ax)=1，add ax,0使得ZF=1，所以je指令将进行转移。 
```


编程:统计data段中数值为8的字节的个数，用ax保存统计结果。

方案一

```nasm
assume cs:code
    data segment
            db 8,11,8,1,8,5,63,38
    data ends
    code segment
    start:
            mov ax,data
            mov ds,ax
            mov bx,0;ds:bx指向第一个字节
            mov ax,0;初始化累加器
            mov cx,0
        s:
            cmp byte ptr [bx],8;和8进行比较
            jne next;如果不相等转到next，继续循环
            inc ax;如果相等就计数值加1
        next:
            inc bx
            loop s;执行后：(ax)=3
            mov ax,4c00h
            int 21h
    code ends
end segment
```

 方案二

```nasm
assume cs:code
    data segment
            db 8,11,8,1,8,5,63,38
    data ends
    code segment
    start:
            mov ax,data
            mov ds,ax
            mov bx,0;ds:bx指向第一个字节
            mov ax,0;初始化累加器
            mov cx,0
        s:
            cmp byte ptr [bx],8;和8进行比较
            je ok;如果不相等转到ok，继续循环
            jmp short next;如果不想等就转到next，继续循环
        ok:
            inc ax;如果相等就计数值加1
        next:
            inc bx
            loop s;执行后：(ax)=3
            mov ax,4c00h
            int 21h
    code ends
end segment 
```

编程:统计data段中数值大于8的字节的个数，用ax保存统计结果。

```nasm
assume cs:code
    data segment
            db 8,11,8,1,8,5,63,38
    data ends
    code segment
    start:
            mov ax,data
            mov ds,ax
            mov bx,0;ds:bx指向第一个字节
            mov ax,0;初始化累加器
            mov cx,0
        s:
            cmp byte ptr [bx],8;和8进行比较
            jna next;如果大于8转到next，继续循环
            inc ax;如果大于就计数值加1
        next:
            inc bx
            loop s;执行后：(ax)=3
            mov ax,4c00h
            int 21h
    code ends
end segment
```



### 1.5 串传送指令

**1、DF标志:方向标志位**

在串处理指令中，控制每次操作后si(一般指向原始偏移地址)、di(一般指向目标偏移地址)的增减。

```
DF=0：每次操作后si、di递增；

DF=1：每次操作后so、di递减。
```

2、movsb串传送指令
movsb(mov string byte)串传送指令

以字节为单位传送

格式：movsb

执行movsb相当于以下操作：

    （1）((es)*16+(di))=((ds)*16+(si))
    
    （2）如果DF=0，则(si)=(si)+1,(di)=(di)+1;
    	
    	如果DF=1，则(si)=(si)-1，(di)=(di)-1。
    	movsb功能：将ds:si指向的内存单元中的字节送入es:di中，然后根据标志寄存器DF位的值将si和di递增1或递减1。

2、movsw串传送指令

以字为单位传送。

将ds:si指向的内存单元中的字送入es:di中，然后根据标志寄存器DF位的值将si和di递增2或递减2。

movsb和movsw进行的是串传送操作中的一个步骤，一般和rep配合使用，格式：rep movsb，rep的作用是根据cx 的值，重复执行后面的串传送指令。由于每执行一次movsb指令si和di都会递增或递减指向后一个单元或前个单元，则rep movsb就可以循环实现(cx)个字符的传送。

使用串传送指令进行数据的传送，需要提供：

```
1、传送的原始位置；

2、传送的目的位置；

3、传送的长度；

4、传送的方向。
```

由于flag的DF位决定着串传送指令执行后，si和di改变的方向，8086CPU提供两条指令对DF位进行设置：

```
（1）cld指令：将标志寄存器的DF位设置为0；

（2）std指令：将标志寄存器的DF位设置为1。
```



### **1.6 pushf和popf指令**

pushf的功能是将标志寄存器的值压栈，

popf是从栈中弹出数据，送入标志寄存器中。

**pushf和popf为直接访问标志寄存器提供了一种方法**。

下面的程序执行后ax的值是多少？

```nasm
mov ax,0
push ax
popf
mov ax,0fff0h
add ax,0010h
pushf
pop ax
and al,11000101b
and ah,00001000b
```



### **1.7 Debug**

标志寄存器在Debug中的表示

| 标志 | 值为1的标记 | 值为。的标记 |
| ---- | ----------- | ------------ |
| OF   | OV          | NV           |
| SF   | NG          | PL           |
| ZF   | ZR          | NZ           |
| PF   | PE          | PO           |
| CF   | CY          | NC           |
| DF   | DN          | UP           |



## 字符串

可以使用 section .data 显式存储字符串，

或者 section  .bss 段定义字符串变量再赋值



###  字符串

我们可以使用表示位置计数器当前值的$位置计数器符号来显式存储字符串长度

```nasm
msg  db  'Hello, world!',0xa ;我们常见的字符
len  equ  $ - msg            ;长度
;$指向字符串变量msg的最后一个字符之后的字节。因此，$ - msg给出字符串的长度
```



### 字符串指令

对于16位地址，使用SI和DI寄存器，对于32位地址，使用ESI和EDI寄存器。

下表提供了各种版本的字符串指令和假定的操作数空间:

| 基本指令 | 操作的寄存器 | 字节运算 | 字运算 | 双字运算 | 说明                                                         |
| :------- | :----------- | :------- | :----- | :------- | ------------------------------------------------------------ |
| **MOVS** | ES:DI，DS:SI | MOVSB    | MOVSW  | MOVSD    | 该指令将1字节，字或双字数据从存储位置移到另一个位置          |
| **LODS** | DS:SI        | LODSB    | LODSW  | LODSD    | 该指令从存储器加载。如果操作数是一个字节，则将其加载到AL寄存器中；如果操作数是一个字，则将其加载到AX寄存器中，并将双字加载到EAX寄存器中 |
| **STOS** | ES:DI，AX    | STOSB    | STOS   | STOSD    | 该指令将数据从寄存器（AL，AX或EAX）存储到存储器              |
| **CMPS** | DS:SI，ES:DI | CMPSB    | CMPSW  | CMPSD    | 该指令比较内存中的两个数据项。数据可以是字节大小，字或双字   |
| **SCAS** | ES:DI，AX    | SCASB    | SCASW  | SCASD    | 该指令将寄存器（AL，AX或EAX）的内容与内存中项目的内容进行比较 |



下面介绍一些会用到的指令

### **标志位重置指令**

| CLD  | 将方向标志位DF清零 |
| ---- | ------------------ |
| STD  | 将方向标志位DF置1  |



### REP重复执行指令

1、REP（Repeat）汇编指令是一种重复执行指令的控制指令，它通常和其他指令组合使用，用于在处理字符串或数组时进行重复操作。REP指令可以和多个其他指令搭配使用，如MOV、STOS等。其语法如下：

```
rep instruction ;比如 rep MOVSB
```

其中，instruction是要重复执行的指令。

2、REP指令会将ECX寄存器中的值作为计数器，循环执行instruction指定的操作。

每次循环都会将ECX减1，直到ECX的值为0为止（类似loop）

3、对于不同的操作码，REP有三种形式：

| REPE、REP   | Repeat while Equal     | 比较结果相同时继续执行，不相同退出循环 |
| ----------- | ---------------------- | -------------------------------------- |
| REPNE、REPN | Repeat while Not Equal | 比较结果不相同时继续执行，相同退出循环 |
| REPZ        | Repeat while Zero      | 结果 =0 时继续执行，结果 !=0 退出循环  |



### MOVS指令

MOVS指令用于将数据项（字节，字或双字）从源字符串SI 到目标字符串DI :

```nasm
section .text
   global _start 
        
_start:              
   mov  ecx, len       ;s1长度
   mov  esi, s1        ;将s1的字符串送入 si 寄存器中
   mov  edi, s2        ;开辟 s2空间并指定到 di 寄存器
   cld					       ;方向标志位DF清零
   rep  movsb	         ;源字符串SI 送到目标字符串DI
        
   mov  edx,20          ;s2长度
   mov  ecx,s2          ;s2信息
   mov  ebx,1           ;stdout
   mov  eax,4           ;sys_write
   int  0x80            ;call 
        
   mov  eax,1           ;system call number (sys_exit)
   int  0x80            ;call kernel
        
section .data
s1 db 'Hello, world!'
len equ $-s1

section  .bss
s2 resb 20              
```

结果：

```t4
Hello, world!
```





### LODS指令

该指令从存储器加载。如果操作数是一个字节，则将其加载到AL寄存器中；如果操作数是一个字，则将其加载到AX寄存器中，并将双字加载到EAX寄存器中

示例：

将secret加密显示，加密方式：单字节增加2位

```nasm
section .text
   global _start       
        
_start:                 
   mov    ecx, 6      ;secret字符串长度，同时也是loop循环的次数
   mov    esi, s1      	;将s1的字符串送入 si 寄存器中
   mov    edi, s2      	;开辟 s2空间并指定到 di 寄存器
      
loop_encrypt: 			;加密（循环6次）
   lodsb				;将si中的'secret'加载到AL（AX或EAX）寄存器
   add al, 02		;al内容偏移2（混淆）
   stosb 				;该指令将数据从寄存器AL（AX或EAX）存储到存储器
   loop    loop_encrypt          
   
   cld					       ;方向标志位DF清零
   rep  movsb	         ;源字符串SI 送到目标字符串DI
        
   mov     edx,20        
   mov     ecx,s2       
   mov     ebx,1        
   mov     eax,4        
   int     0x80         
        
   mov     eax,1        
   int     0x80         
        
section .data
s1 db 'secret key'
len equ $-s1

section .bss
s2 resb 10             
```

结果：

```t4
ugetgv
```

同样如果想要将密文ugetgv解密，转换片段：

```nasm
encrypt_code: 			;解密（循环6次）
   lodsb				;将si中的密文'ugetgv'加载到AL（AX或EAX）寄存器
   sub al, 02		;al内容偏移2（还原）
   stosb 				;该指令将数据从寄存器AL（AX或EAX）存储到存储器
   loop    encrypt_code          
```

结果还原为'secret'



### STOS指令

STOS指令将数据项从AL（对于字节-STOSB），AX（对于字-STOSW）或EAX（对于双字-STOSD）到目标字符串，该目标字符串由内存中的ES:DI指向。

上面示例已经使用了stosb

将大写字符串转换为其小写值转换片段：

```nasm
   
lower_case:
   lodsb
   or      al, 20h
   stosb
   loop    lower_case    
   
   cld
   rep  movsb
 
```



### REP、REPE 重复指令

REP前缀在字符串指令（例如-REP MOVSB）之前设置时，会根据放置在CX寄存器中的计数器使该指令重复。REP执行该指令，将CX减1，然后检查CX是否为零。重复指令处理，直到CX为零为止。

方向标志（DF）确定操作的方向。

```
- 使用CLD（清除方向标志，DF = 0）使操作从左到右。
- 使用STD（设置方向标志，DF = 1）使操作从右到左。
```

REP前缀也有以下变化:

```
- REP:这是无条件的重复。重复该操作，直到CX为零为止。
- REPE或REPZ:这是有条件的重复。当零标志指示等于/零时，它将重复操作。当ZF表示不等于零或CX为零时，它将停止。
- REPNE或REPNZ:这也是有条件的重复。当零标志指示不等于/零时，它将重复操作。当ZF指示等于/零或CX减为零时，它将停止。
```



### CMPS指令

**CMPS**指令:

比较两个字符串。该指令比较DS:SI和ES:DI寄存器所指向的两个数据项，即一个字节，一个字或一个双字，并相应地设置标志。

**REPE**: 

比较结果相同时继续执行，不相同退出循环，

1、循环次数同loop使用cx寄存器值

2、不同的是，cx递减到0前满足退出循环条件的时候就结束了，不会继续循环，比loop 损耗小

**JECXZ**：

根据 CX、ECX 寄存器的值跳转:  JCXZ(CX 为 0 则跳转)、JECXZ(ECX 为 0 则跳转);

```nasm
section .text
   global _start           
        
_start: 
   mov esi, s1
   mov edi, s2
   mov ecx, lens2
   
   cld
   repe  cmpsb              ;重复执行cmpsb命令，直到 cx=0或者 比较结果不相同 结束
   jecxz  equal             ;CX 为 0 则跳转
	 jmp nequal

nequal: 
   ;不相同时逻辑
   mov eax, 4
   mov ebx, 1
   mov ecx, msg_neq
   mov edx, len_neq
   int 80h
   jmp exit
        
equal: ;相同时逻辑
   mov eax, 4
   mov ebx, 1
   mov ecx, msg_eq
   mov edx, len_eq
   int 80h
   jmp exit
        
exit: ;退出
   mov eax, 1
   mov ebx, 0
   int 80h
        
section .data
s1 db 'Hello, world!',0      ;源字符
lens1 equ $-s1

s2 db 'Hello, world!', 0     ;比较字符
lens2 equ $-s2

msg_eq db '相同的字符串!', 0xa
len_eq  equ $-msg_eq

msg_neq db '不相同的字符串!'
len_neq equ $-msg_neq
```

结果

```t4
相同的字符串!
```





### SCAS指令

SCAS指令用于搜索字符串中的特定字符或一组字符。要搜索的数据项应该在AL（对于SCASB），AX（对于SCASW）或EAX（对于SCASD）寄存器中。要搜索的字符串应在内存中，并由ES:DI（或EDI）寄存器指向。查看以下程序以了解概念-

```nasm
section .text
   global _start        ;must be declared for using gcc
        
_start:                 ;tell linker entry point

   mov ecx,len
   mov edi,my_string
   mov al , 'e'
   cld
   repne scasb
   je found ; when found
   ; If not not then the following code
        
   mov eax,4
   mov ebx,1
   mov ecx,msg_notfound
   mov edx,len_notfound
   int 80h
   jmp exit
        
found:
   mov eax,4
   mov ebx,1
   mov ecx,msg_found
   mov edx,len_found
   int 80h
        
exit:
   mov eax,1
   mov ebx,0
   int 80h
        
section .data
my_string db 'hello world', 0
len equ $-my_string  

msg_found db '包含该字符串!', 0xa
len_found equ $-msg_found

msg_notfound db '不包含该字符串!'
len_notfound equ $-msg_notfound   
```

结果-：

```t4
包含该字符串!
```



##  数组

C++语法中数组示例：

```cpp
int marks[6] = {34,  45,  56,  67,  75, 89};
```



###  数组

我们已经讨论过，汇编程序的数据定义指令用于为变量分配存储空间。变量也可以用一些特定的值初始化。初始化值可以以十六进制，十进制或二进制形式指定。例如，我们可以通过以下两种方式之一来定义单词变量“months”-

```nasm
MONTHS  DW      12			;十进制表示12月
MONTHS  DW      0CH			;十六进制表示12月
MONTHS  DW      0110B		;二进制表示12月
```

**1、连续数据定义**

分配连续内存空间，初始化值0

```nasm
List1   DW  0, 0 , 0 , 0 , 0 , 0 
```

定义一维数字数组（连续的相同类型）。

```nasm
List1 DW  34,  45,  56,  67,  75, 89
;分配了2x6 = 12个字节的连续存储空间
```

定义相同内容时可以使用 times 

```nasm
List1 TIMES 6 DW 0
```

定义6个8

```nasm
List1 TIMES 6 DW 8
```



**2、访问数据**

第一个数字的符号地址为List1，第二个数字的符号地址为List1 + 2，依此类推。

比如访问 56 

```
[List1 + 4]
```

访问第二个名称：

```nasm
section .text
   global _start        ;must be declared for linker (ld)
        
_start:    
   
   mov  edx,4           ;message length
   mov  ecx, names+4      ;message to write
   mov  ebx,1           ;file descriptor (stdout)
   mov  eax,4           ;system call number (sys_write)
   int  0x80      
   
   mov  eax,1           ;system call number (sys_exit)
   int  0x80            ;call kernel

section .data
global names
names:
DW  'Lucy', 'Andy', 'Pete'
```

结果

```
Andy
```



## 堆栈

内存结构：

堆栈是内存中类似数组的连续内存数据结构，通常会固定一段存储空间。

可以在其中存储数据并从称为“堆栈顶部”的位置删除数据。

入栈：

需要存储的数据被“推送”到堆栈中

出栈：

要检索的数据从堆栈中“弹出”。

LIFO：

堆栈是一种LIFO（后进先出）数据结构，即首先存储的数据最后被检索。

PUSH和POP：

汇编语言为堆栈操作提供了两条指令：PUSH和POP。

语法如下：

```nasm
PUSH    operand
POP     address/register
```



堆栈段中保留的内存空间用于实现堆栈。寄存器SS和ESP（或SP）用于实现堆栈。

SS栈顶指针寄存器：

指向堆栈段的开头，也就是起始地址，通常是最高位开始

SP（或ESP）偏移量：

SS起始地址上，再偏移SP的偏移量，就是栈顶的位置，也就是最后存储的一条数据位置。



比如：

从1-5将数据存储到堆栈（0x01-0x09）的存储空间上：

| 堆栈示意地址 | 插入的数据 | 位置                                                |
| ------------ | ---------- | --------------------------------------------------- |
| 0x09         | 1          | SS:存放栈顶的段地址（最高位为起始地址）             |
| 0x08         | 2          |                                                     |
| 0x07         | 3          |                                                     |
| 0x06         | 4          |                                                     |
| 0x05         | 5          | SS: SP：sp偏移量结合的位置为栈顶（最后数据5的位置） |
| 0x04         |            |                                                     |
| 0x03         |            |                                                     |
| 0x02         |            |                                                     |
| 0x01         |            |                                                     |

pop的顺序依次是：5，4，3，2，1 ，和push是相反的

```
- 只能将字或双字保存到堆栈中，而不是字节。
- 堆栈朝反方向增长，即朝着较低的存储器地址增长
- 堆栈的顶部指向插入堆栈中的最后一个项目。它指向插入的最后一个字的低字节。
```



使用场景，比如：

```nasm
MOV     AX, 1
MOV     BX, 2

; 将AX和BX寄存器内容保存在堆栈中
PUSH    AX
PUSH    BX

;将寄存器用着其他用途
MOV     AX, 3
MOV     BX, 4
...

;使用完之后恢复寄存器原始值,最后push的BX要最先pop才行。
POP     BX ;BX=2
POP     AX ;AX=1
```



以下程序显示整个ASCII字符集。主程序调用一个名为display的过程，该过程显示ASCII字符集。

```nasm
section .text
   global _start        
        
_start: 
	 ;call 指令表示执行一段代码，需要ret 配合返回并继续执行后续代码
   call init_count ;从'5' 开始递增打印20个ASCII字符
   call next  ;循环打印
   call exit
   
init_count:     
   mov    ecx, 20 
	 ret
next:
   push    ecx
   call display  ;调用显示代码块
        
   pop     ecx  
   mov  dx, [achar]
   cmp  byte [achar], 0dh
   inc  byte [achar]
   loop    next
   ret
   
 display:
   mov     eax, 4
   mov     ebx, 1
   mov     ecx, achar
   mov     edx, 1
   int     80h  
   ret
   
exit:
   mov  eax,1           ;system call number (sys_exit)
   int  0x80            ;call kernel

section .data
achar db '5' 
```

结果：

```tex
56789:;<=>?@ABCDEFGH
```

## 递归

递归过程是一个调用自身的过程。

上一个示例中我们使用到了 call 指令； call 指令表示执行一段代码，需要ret 配合返回并继续执行后续代码



###  递归

示例：直接递归（方法内调用自己）

3阶乘c示意代码：

```cpp
int a=3,b=3;

fun mul_fun {
	if (b <= 1) return; // 结束
	b--;
	a = a*b;
	mul_fun();
}
```

汇编示例：

```nasm
section .text
   global _start      
        
_start:               

   mov bx, 3
	 mov ax, 3
   call  mul_fun

mul_fun: ;阶乘递归
    cmp   bl, 1
    JLE	  p_total ;<= 1时结束，跳转到打印方法
    dec bl
    mul bl ;ax = al * bl
    call mul_fun
        
p_total: ;打印
   add   ax, 30h
   mov  [fact], ax
   
   mov    edx,1            ;message length
   mov    ecx,fact       ;message to write
   mov    ebx,1          ;file descriptor (stdout)
   mov    eax,4          ;system call number (sys_write)
   int    0x80           ;call kernel
    
   mov    eax,1          ;system call number (sys_exit)
   int    0x80           ;call kernel

section .bss
fact resb 1
```

结果：

```nasm
6
```

