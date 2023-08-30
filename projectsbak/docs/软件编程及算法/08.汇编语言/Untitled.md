还是一样，完成一下知乎这周的打卡任务，同时希望能帮助到正在学汇编的同学。

本文为王爽老师《汇编语言》第四版的读书笔记，记录的还比较详细，有的懒得手敲文字的地方直接放图片了。

推荐一个up主的配套讲解： 

[https://www.bilibili.com/video/BV1mt411R7Xv?p=143&spm_id_from=pageDriver](https://link.zhihu.com/?target=https%3A//www.bilibili.com/video/BV1mt411R7Xv%3Fp%3D143%26spm_id_from%3DpageDriver)

## Debug

环境：DOSBox 0.74

![img](https://pic4.zhimg.com/80/v2-3b03d0e753e431f89f9649845944eaf7_720w.jpg)



## 一、寄存器

## 全部寄存器：

AX、BX、CX、DX、SI、DI、SP、BP、IP、CS、SS、DS、ES、PSW

共14个。8086CPU的所有寄存器都是16位的。8086CPU是16位结构，有16根数据线。 

![img](https://pic2.zhimg.com/80/v2-34210ba3e19b12c6bd4625a4d7c66425_720w.jpg)



## 通用寄存器

AX、BX、CX、DX

每个可分为 ~H 与 ~L，如 AH 和 AL ，H 表示高八位，L 表示低8位。 

![img](https://pic3.zhimg.com/80/v2-941da800fb318abece9a8e5c9c927296_720w.webp)



### CX和LOOP



![img](https://pic2.zhimg.com/80/v2-b16375d287f9354d2230bca7d43e8bf1_720w.webp)

![img](https://pic2.zhimg.com/80/v2-316d0293f1b4e53987a731f4e012dc9d_720w.webp)



### 二重循环问题的处理

P157

因为LOOP指令都在cx中存放循环次数，因此二重循环时我们每次应当将外层的cx保存起来，而寄存器是有限的，所以更通用的方式是将cx的值保存在一个内存单元中；**一般来说，在需要暂存数据的时候，我们都应该使用栈**；于是我们可以在栈段中单独开辟一个字来暂存cx的值。

### ah 与 中断



![img](https://pic4.zhimg.com/80/v2-e20c2cfb52adb3654a50d02f965b643f_720w.webp)

比如 BIOS 提供的 int 10h 中断例程（其中包含了多个和屏幕输出相关的子程序，P259）： 

![img](https://pic2.zhimg.com/80/v2-e188fd43e12d7bd27428420984641ced_720w.webp)

DOS 提供的 int 21h 中断程序： 

![img](https://pic3.zhimg.com/80/v2-f5ab5ccdf97a158183a0f3e9b38c2d5e_720w.webp)



## 段寄存器

CS、DS、SS、ES

8086CPU不支持将数据直接送入段寄存器。

如把 al 的数据送入内存单元 10000H 中：

```powershell
mov bx,1000H
mov ds,bx
mov [0],al
```

把 1000:0 处存放的字型数据送入ax：

```powershell
mov bx,1000H
mov ds,bx
mov ax,[0]
```

**小端模式(Little-Endian)**，数据的高字节保存在内存的高地址中，而数据的低字节保存在内存的低地址中，所以（以1123H为例，假设该字型数据为 1123H）： 

1000:1 单元存放字型数据的高8位（11H），1000:0 单元存放字型数据的低八位（23H）。

### DS和[address]

8086CPU中的DS寄存器，通常用来存放要访问数据的段地址。 [...]则表示一个内存单元，如 [1] 为内存单元： DS:1

### 段前缀

汇编源程序中，如果在 [] 里用一个常量 idata 直接给出内存单元的偏移地址，就要在 [] 的前面显示地给出段地址所在的段寄存器。例如： `mov al, [0]` 与 `mov al,0` 等价，要表示地址偏移应该写为：`mov al,ds:[0]`，即段前缀的方式： 

![img](https://pic4.zhimg.com/80/v2-785f09c2bbaa0bd482990275790a1c33_720w.webp)

或写为（ [] 中用寄存器）：

```powershell
mov bx,0
mov al,[bx]
```

### CS和IP（指令）

CS：代码段寄存器 IP：指令指针寄存器 

![img](https://pic4.zhimg.com/80/v2-0239f05e718ac8edebd927af493759cb_720w.webp)



### SS和SP（栈）

**任意时刻，SS:SP 指向栈顶元素。** push和pop指令执行时，CPU从 SS 和 SP 中得到栈顶的地址。

栈，LIFO（Last In First Out，后进先出）。8086CPU中，入栈时，栈顶从高地址向低地址方向增长。

### push 指令



![img](https://pic1.zhimg.com/80/v2-4f36ddcd696c3ecde27b82c2585c4c40_720w.webp)



### 栈空间



![img](https://pic1.zhimg.com/80/v2-c7905ee6f0497aa7ba553d9b002b6624_720w.webp)

如果 pop 让栈顶超界了，再用push指令就会覆盖原本不属于我们划定的栈空间的内存。我们当然希望 CPU 可以解决，比如额外搞两个寄存器去记录栈顶上限和下限，每次pop和push的时候进行检测来保证不越界。

但是8086CPU不保证我们对栈的操作不会超界。也就是说，8086CPU只知道栈顶在何处（由SS:SP指示），而不知道我们安排的栈空间有多大。所以只能靠我们自己编程时小心了。

注意，push、pop 等栈操作指令，修改的只是 SP 。也就是说，栈顶的变化范围最大为：0~FFFFH.

（初始时栈空，SP指向栈的最底部单元下面的单元，地址为栈最底部的**字单元**的地址+2. SP16位，2^16 B = 2^6 KB，所以一个栈段的容量最大为 64 KB）

### pop 指令



![img](https://pic2.zhimg.com/80/v2-653cf21c13471c545c786b9b3f53cf1d_720w.webp)

![img](https://pic2.zhimg.com/80/v2-088a31c70a546108b85482bdb3a6ed65_720w.webp)

![img](https://pic3.zhimg.com/80/v2-f1060351d5a48b1de10fbbd686a4a376_720w.webp)



### 段的综述



![img](https://pic1.zhimg.com/80/v2-31583def8e0e85d5b381cc065ea5d0dc_720w.webp)

![img](https://pic1.zhimg.com/80/v2-50c269ff3580977a2ec3a3b195e88880_720w.webp)



## SI 和 DI

si 和 di 是8086CPU 中和 bx 功能相近的寄存器，si 和 di 不能够分成两个 8 位寄存器来使用。

我们用 [bx(si 或 di)] 和 [bx(si 或 di) + idata] 的方式来指明一个内存单元，我们还可以用更为灵活的方式：[bx + si] 和 [bx + di]，[bx + si + idata] 和 [bx + di + idata]

而 `mov ax, [bx + si]` 还可以写为 `mov ax, [bx][si]` ，且以下这几种都和 `mov ax, [bx + si + 200]`等价： 

![img](https://pic1.zhimg.com/80/v2-4e6e071e4b9795974836bcc6b5758a50_720w.webp)



## bx、si、di 和 bp

![img](https://pic3.zhimg.com/80/v2-2a13b39d2e89170e37221dd900d0619a_720w.webp)

![img](https://pic2.zhimg.com/80/v2-7c9a7657c49148c44a4962540cd317dd_720w.webp)

![img](https://pic3.zhimg.com/80/v2-8913cfa5819dc215f2876c6786d8529e_720w.webp)

即 bx 的默认段地址为 ds，bp 则为 ss，若 [] 中有寄存器，则必有 bx 或者 bp （作为基址）

## 标志寄存器 flag



![img](https://pic2.zhimg.com/80/v2-0e80d610089f15287202f418893adbfd_720w.webp)

![img](https://pic2.zhimg.com/80/v2-fd776b913ee9ce815f5bd7d3b5da283d_720w.webp)



### ZF 标志

Zero Flag，零标志位 

![img](https://pic1.zhimg.com/80/v2-ee3850ce12a725cf76649f2218c33ffc_720w.webp)

比如：`mov ax,1 sub ax,1` 的结果为0，ZF就为1

### PF 标志

Parity Flag，奇偶标志位 

![img](https://pic1.zhimg.com/80/v2-7af3ab3f6fbe39a62d6bb789ba98e880_720w.webp)



### SF 标志

Sign Flag，符号标志位，对有符号数运算结果的一种记录 

![img](https://pic3.zhimg.com/80/v2-3f14f7bac3fde90b540ff389976b96de_720w.webp)

![img](https://pic1.zhimg.com/80/v2-3921e067ad8ec2f1c9164e1938e80a20_720w.webp)



### CF 标志

Carry Flag，进位/借位 的标志，无符号数运算记录 

![img](https://pic4.zhimg.com/80/v2-de1290c0cd8bce233e0ed445bb304153_720w.webp)

![img](https://pic3.zhimg.com/80/v2-c76fad4d71b4a0ff822b18d502c951ce_720w.webp)



### OF 标志

Overflow Flag，溢出标志位，有符号数运算记录 

![img](https://pic2.zhimg.com/80/v2-f46ef78b9cde99ca080b2a083204d8e9_720w.webp)



### DF 标志

Direction Flag，方向标志位。在串处理指令中，控制每次操作后 si、di 的增减。 

![img](https://pic1.zhimg.com/80/v2-4867568cc105ebce1cbf9917f2352cb4_720w.webp)

由 cld 和 std 来置 0 或 置 1

## 二、汇编指令记录

## inc 和 dec

inc bx的含义是bx中的内容加1，inc 是 increase 的意思

dec 则是减1，dec 是 decrement 的意思

## and 和 or

and：逻辑与 or：逻辑或 

![img](https://pic4.zhimg.com/80/v2-5bd9c76fb202ced979fdb3b022a5e1d7_720w.webp)

一个技巧（小写变大写）： 因为小写字母的ASCII码比大写字母的ASCII码值大 32 即 20H，所以可以这样：`and al, 11011111B`，即将al 中的 ASCII 码的第 5 位置置为0，变成大写字母。

## [bx+idata]

以下四种等价：

```powershell
mov ax,[bx+200]
mov ax,[200+bx]
mov ax,200[bx]
mov ax,[bx].200
```

## X ptr

![img](https://pic1.zhimg.com/80/v2-8d17259e394f112e79eaaabaf7837d04_720w.webp)

![img](https://pic3.zhimg.com/80/v2-750c51e95443fb0bdd7ea76703226c42_720w.webp)



## div



![img](https://pic2.zhimg.com/80/v2-dca4875d045d30823a1023a8094ac575_720w.webp)

![img](https://pic4.zhimg.com/80/v2-d51be701b0bcab6fcb6dff40806dfe1b_720w.webp)



## mul

![img](https://pic4.zhimg.com/80/v2-f23d4cc03c102876f60f0a2e5d97b0ab_720w.webp)



## db，dw 和 dd

汇编伪指令 db：define byte，定义字节型数据 dw：define word，定义字型数据 dd：define double word，定义双字型数据

比如 `db 1,2,3,4,5,6`，就定义出这六个字节的值为1，2，3，4，5，6，例子： 

![img](https://pic3.zhimg.com/80/v2-7bbac7c1c1e01d12a77d52e72371a386_720w.webp)

同理有 dw 和 dd

## dup

![img](https://pic4.zhimg.com/80/v2-ac5e9efed3d8bfe98f5709feb23e9057_720w.webp)

![img](https://pic3.zhimg.com/80/v2-77ed20dfc83104286c61d8c6c2e879ca_720w.webp)



## 转移指令



![img](https://pic3.zhimg.com/80/v2-79013cd34fdb0ae7f4ebb6d01e210f0e_720w.webp)



### offset

![img](https://pic2.zhimg.com/80/v2-aeacba3c7598ec97b02214b067f11af5_720w.webp)

上图，offset 操作符取得了标号 start 和 s 的偏移的地址 0 和 3 .（第一条指令长度为 3 字节，所以第二个 offset 为3）

### jmp

jmp 为无条件转移指令，可以只修改 IP （段内转移），也可以同时修改 CS 和 IP（段间转移）。 

![img](https://pic3.zhimg.com/80/v2-bb264b7c92490874a3a062ecb36b99d2_720w.webp)



### 段内短转移`jmp short 标号` 和 段内近转移 `jmp near ptr 标号`

根据位移进行转移的jmp指令： 

![img](https://pic1.zhimg.com/80/v2-1e3cd597c07b62b3609c6b987b1a9ad0_720w.webp)

上图的 jmp short s 编译出来的机器码为 EB03 ，03 表示偏移量，因为下一条指令 add ax,1 三个字节，偏移三个字节到达目的位置 s 。 

![img](https://pic1.zhimg.com/80/v2-4691b6fed56ec6c9bf0848404564d808_720w.webp)



### 段间转移 `jmp far ptr 标号`

转移的目的地址在指令中的jmp指令：

前面的两个段内转移指令，其对应的机器指令中并没有转移的目的地址，而是相对于当前 IP 的转移位移。

这里的`jmp far ptr 标号`实现的是段间转移，又称为远转移。功能如下： 

![img](https://pic3.zhimg.com/80/v2-51ba03f18bf7946ea26d0d7fe2595fc6_720w.webp)



### jmp 寄存器



![img](https://pic1.zhimg.com/80/v2-6e423f83b3cc2b9b7a59b2bc382fcc8c_720w.webp)



### `jmp word ptr 内存单元地址` 和 `jmp dword ptr 内存单元地址`

转移地址在内存中的 jmp 指令：

`jmp word ptr 内存单元地址` 属于 段内转移，只改了 IP： 

![img](https://pic4.zhimg.com/80/v2-7c154ef97204087f84543963f108f9eb_720w.webp)



`jmp dword ptr 内存单元地址` 属于 段间转移，改了 CS 和 IP： 

![img](https://pic3.zhimg.com/80/v2-0b1c19c9042796b3ef13a12e68449dd2_720w.webp)



### jcxz

![img](https://pic4.zhimg.com/80/v2-db7e3a8407d6cacbabd8870532255aff_720w.webp)



### loop

![img](https://pic4.zhimg.com/80/v2-46fd411edbda770f3caacb6ba237b497_720w.webp)



### call 和 ret

call 和 ret 指令都是转移指令，它们都修改 IP ，或同时修改 CS 和 IP。它们经常被共同来实现子程序的设计。

### ret 和 retf

![img](https://pic2.zhimg.com/80/v2-8c89eca798c101667a021e0a3156d6c5_720w.webp)



### call

![img](https://pic2.zhimg.com/80/v2-e55bd142b564d3e09463f93000778f21_720w.webp)



`call 标号`： 

![img](https://pic1.zhimg.com/80/v2-fc2d695abee6700613843ccd95a117ec_720w.webp)

`call far ptr 标号`： 

![img](https://pic1.zhimg.com/80/v2-40dbdcdef065c302fea5519b1024d1c0_720w.webp)

`call 寄存器`： 

![img](https://pic3.zhimg.com/80/v2-633de8f42e82934abaa802eb2b37b6be_720w.webp)

`call word ptr 内存单元地址` 和 `call dword ptr 内存单元地址`： 

![img](https://pic1.zhimg.com/80/v2-4101bd8e7168a060a4fe1837d6a04164_720w.webp)

![img](https://pic3.zhimg.com/80/v2-7d5ba791e823286fc1e23f3f56a979f2_720w.webp)



### call 和 ret 的配合使用

![img](https://pic2.zhimg.com/80/v2-73c166829b030dfcf833214590829169_720w.webp)

![img](https://pic4.zhimg.com/80/v2-d82e2ba2cedd160facd04e4608954e4b_720w.webp)

同样，可能涉及到寄存器冲突的问题，于是我们可以用栈来保存寄存器的内容，一个标准框架为： 

![img](https://pic2.zhimg.com/80/v2-c6d1d22be18c8f5d6384be4e2aa47991_720w.webp)



## nop

NOP是英语“No Operation”的缩写。NOP无操作数，所以称为“空操作”。

CPU 遇到 nop 指令，什么都不做，占用一个字节。执行NOP指令只使程序计数器PC加1，所以占用一个机器周期。

实例：MOVLW 0xOF ；送OFH到W MOVWF PORT_B ；W内容写入B口 NOP ；空操作 MOVF PORT_B，W ； 读操作说明：该三条指令是一种对I/O口的B口连续操作的实例，其目的达到写入B口的内容要读出时，应保证写、读之间有个稳定时间，因此加入了空操作指令NOP。

> 来自[https://www.cnblogs.com/shangzhijian/p/4994028.html](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/shangzhijian/p/4994028.html)

## adc 指令

![img](https://pic2.zhimg.com/80/v2-0e3cbe4ff2061f7bb5855275b98eb07d_720w.webp)



## 检测标志位的条件转移指令

所有条件转移指令的转移位移都是 [-128, 127] 

![img](https://pic1.zhimg.com/80/v2-68a59870aa8d0a4ff72b79ec7a264818_720w.webp)

![img](https://pic4.zhimg.com/80/v2-ebfae3db46c502c1169b315d6873d74f_720w.webp)



例子：

```powershell
mov ax,2
mov bx,1
sub bx,ax
adc ax,1
```

由于 sub 记录的 1-2 ，发生了借位，所以CF=1，因此最终的计算：(ax)+1+CF=2+1+1=4.

adc中的CF值和它前面的指令相关，有了adc指令就能方便地进行加法的第二步运算，比如下面的指令和`add ax,bx`等价：

```powershell
add al,bl
adc ah,bh
```

## sbb 指令

![img](https://pic2.zhimg.com/80/v2-d905f7d488b85804935710727a13a1f1_720w.webp)



## cmp 指令

![img](https://pic1.zhimg.com/80/v2-fac2a6b33b5265b52d9374638255eddc_720w.webp)

我们希望得到逻辑上真正结果的正负。对无符号数进行比较之后，可以考察 zf（是否相等） 和 cf （是否借位）寄存器；对有符号数进行比较，我们应该考察 sf（得到实际结果的正负）和 of（得知有没有溢出）。

## 串传送指令

### movsb

把 ds:si 搬到 es:di 里头，然后再对 si 和 di 操作： 

![img](https://pic4.zhimg.com/80/v2-96839e2e59b69bd245741a1a6afde047_720w.webp)

![img](https://pic2.zhimg.com/80/v2-5bfc400a39dc940aa083611f336d5ea5_720w.webp)



### movsw

![img](https://pic2.zhimg.com/80/v2-7925d85bce36feab2ef773ccfd5469ad_720w.webp)



### rep

rep 是 repeat 的意思，意味着循环： 

![img](https://pic2.zhimg.com/80/v2-fa33990fab6d15d8961891f9363b1f49_720w.webp)

![img](https://pic4.zhimg.com/80/v2-0e622ecf29c2bc39c8103ff28a64051b_720w.webp)



### cld 和 std

由于 flag 的 df 位决定着串传送指令执行后，si 和 di 改变的方向，所以CPU设置了 cld 和 std 指令：

cld 指令：将标志寄存器的 df 位 置0； std 指令：将标志寄存器的 df 位 置1；

### sti 和 cli

8086CPU 提供的设置标志寄存器的 IF 位的指令：

sti：设置 IF=1； cli：设置 IF=0；

## pushf 和 popf

pushf 和 popf 为直接访问标志寄存器提供了一种方法。

pushf：将标志寄存器的值压栈。 popf：从栈中弹出数据，送入标志寄存器。

## int 和 iret

int 是 interrupt 的意思，格式为 int n，n 为中断类型码，它的功能是引发中断过程。

可以在程序中使用 int 指令调用任何一个中断的处理程序。可见其与 call 指令类似，都是调用一段程序。 

![img](https://pic2.zhimg.com/80/v2-b83e98093442f8e2ad5a1523f0f9feb9_720w.webp)

call 与 ret 配对，而 int 则于 iret 配对：

int 的过程： 

![img](https://pic4.zhimg.com/80/v2-1466cefb39f35c917ed5414a76f5c54f_720w.webp)

iret 的过程： 

![img](https://pic3.zhimg.com/80/v2-302be75b31bf5e1fb5aa248ed2e00536_720w.webp)

即执行完中断例程后，用 iret 指令恢复 int 指令执行前的标志寄存器和 CS、IP 的值，从而接着执行程序。

## in 和 out

访问端口，见下面 端口 一节。

## shl 和 shr

逻辑移位指令。如果移动位数大于 1 ，必须将移动位数放在 cl 中。

shl： 

![img](https://pic2.zhimg.com/80/v2-6148a31516cdb70c5b3e9acda669d2b9_720w.webp)

![img](https://pic3.zhimg.com/80/v2-236a6fc92ecb836bf98eb759522bd0ca_720w.webp)



shr： 

![img](https://pic1.zhimg.com/80/v2-12390849b368faeb9cc76cd478dfd36c_720w.webp)

![img](https://pic4.zhimg.com/80/v2-75456df06d82a3ea77d7a2404470a6fb_720w.webp)



## 指令系统总结



![img](https://pic2.zhimg.com/80/v2-407e083f54ef42145249567220aae98d_720w.webp)

![img](https://pic2.zhimg.com/80/v2-62cd22b56d41c3b70da72edd96eb5b1d_720w.webp)



## 三、组织数据

## 代码段与多个段的程序

### 数据、代码、栈放入一个段中

问题：混乱； 数据、栈和代码需要的空间超过 64 KB就不能放在一个段中（对于8086CPU，一个段的容量不能大于 64 KB）。

一个安排程序的框架： 

![img](https://pic3.zhimg.com/80/v2-9e42234bfcdf0521b52d1256f569340a_720w.webp)

示例： 

![img](https://pic3.zhimg.com/80/v2-ad8ffc35c2acfc183be3705474bbe7ea_720w.webp)

dw的含义是定义字型数据，dw即“define word”，上图第一个字存在 cs:0 开始的地址（猜测是因为第一行的assume cs:codesg，把代码段的初始地址一开始保存在cs中，但是书本第132页说，assume是伪指令，是编译器执行的，也是仅在源程序中存在的信息，CPU并不知道它们），逐次偏移+2.

end除了通知编译器程序结束外，还可以通知编译器程序的入口在什么地方（上图为start）。

### 数据、代码、栈放入不同的段

示例： 

![img](https://pic1.zhimg.com/80/v2-c20aa79985f7c6e1849b20c1310330c4_720w.webp)

这样划分出三个段就清晰很多了，上图是我写的一段伪代码。

程序从哪开始由 start 指示。当然这里code、data、stack、start都能改成别的字母，只是一个标记而已。

我们想把数据段中的某个数据放入寄存器，则可以这样写：

```powershell
mov ax, data
mov ds, ax
mov bx, ds:[6]
```

（8086CPU不允许一个数值直接送入段寄存器中，这里的data会被编译器处理为一个表示段地址的数值，因此这里还需要用ax寄存器加以转化）

## 数据标号

详见第 16 章。

在以往写为：

```powershell
assume cs:code

code segment
    a: db 1, 2, 3, 4, 5, 6, 7, 8
    b: dw 0
```

使用数据标号，写为：

```powershell
assume cs:code

code segment
    a db 1, 2, 3, 4, 5, 6, 7, 8
    b dw 0
```

去掉 “:” ，同时描述内存地址和单元长度。(有冒号则是仅表示地址的地址标号） 

![img](https://pic4.zhimg.com/80/v2-ff41613740f85dde63e2180b68303f23_720w.webp)

![img](https://pic4.zhimg.com/80/v2-e12cf73d9b4a0712ca9a891bd483e8fb_720w.webp)

![img](https://pic1.zhimg.com/80/v2-93b3f0b5bdf7af55d966b585d2bf670c_720w.webp)

这一块建议仔细阅读 P289 16.2 ，此处不再记录。

## 四、中断

任何一个通用的 CPU 比如 8086，都具备这种能力：在执行完当前正在执行的指令之后，检测到从 CPU 外部发送过来的或内部产生的一种特殊信息，并且可以立刻对所接收到的信息进行处理。

这种特殊的信息就被称为 中断信息。中断的意思是，CPU 不再接着向下执行，而是转去处理中断信息。

中断信息可以来自于 CPU 的内部和外部。

## 内部中断

发生这四种情况，产生相应的中断信息： 

![img](https://pic1.zhimg.com/80/v2-79cfc7be2968077a1a9211b5e0d949ac_720w.webp)



### 中断类型码

中断信息必须包含识别来源的编码。8086 CPU 用称为中断类型码的数据来标识中断信息的来源。

中断类型码为一个字节型数据，可表示256种中断信息的来源。它的作用就是用来定位中断处理程序。

上面 4 种中断源，在 8086 CPU 种的中断类型码如下： 

![img](https://pic1.zhimg.com/80/v2-ca02d34431a5fc5f77bca9af32af88e4_720w.webp)

![img](https://pic1.zhimg.com/80/v2-b7e8a8b46a5c61b08882e33f357fef64_720w.webp)



### 中断向量表 与 中断处理程序

中断向量表在内存中存放，对于 8086PC 机，存于内存地址0处（0000:0000 ~ 0000:03FF）。

中断向量：中断处理程序的入口地址（8086CPU中，这个入口地址包括段地址和偏移地址，所以一个表项两字，高地址字存放段地址，低地址字存放偏移地址）；

中断向量表：中断向量的列表（即中断处理程序入口地址的列表）；

中断处理程序：用来处理中断信息的程序（通过中断类型码来从中断向量表中查找，从而定位中断处理程序，中断处理程序由程序员编写）



![img](https://pic4.zhimg.com/80/v2-a006b1e940d6159a7d6c1fde7f6c0997_720w.webp)

找到这个入口地址的最终目的就是设置 CS 和 IP，使 CPU 执行中断处理程序。

### 中断过程

用中断类型码找到中断向量，并用它设置 CS 和 IP，这个工作是 CPU 的硬件自动完成的。CPU 硬件完成这个工作的过程被称为中断过程。



![img](https://pic4.zhimg.com/80/v2-917f84d9e0444918d52a73433d64cb9f_720w.webp)

![img](https://pic3.zhimg.com/80/v2-5c27f0bd87cbb6ddbe5b2e8afac51e02_720w.webp)

![img](https://pic1.zhimg.com/80/v2-0d627d8613967e1e409ecef483dcc1c0_720w.webp)



### 中断处理程序 和 iret 指令



![img](https://pic1.zhimg.com/80/v2-c13a56e63b4241d841b8c7ad6716140c_720w.webp)

![img](https://pic1.zhimg.com/80/v2-260c5ec9ee4ac30f59d6b69536956ca4_720w.webp)

![img](https://pic4.zhimg.com/80/v2-2bb5eb81915fa607d7e9a212d6a882cb_720w.webp)



### 单步中断



![img](https://pic3.zhimg.com/80/v2-619483bb0a1c8086d61345fd594886d6_720w.webp)

这里标志寄存器入栈之后，可以看到 TF 位被置为0，否则 TF 位还是 1 那执行完单步中断的处理程序之后就又会中断，这不死循环套娃了嘛...

因此可以看到，所谓Debug去调试没啥特殊的，就是利用了单步中断的功能。比如执行某指令（按下某按键）让 TF 置1，从而进入我们自己写的单步中断处理程序。

因此我们也可以看到，CPU 提供单步中断功能的原因就是，为单步跟踪程序的执行过程提供了实现机制。

### 响应中断的特殊情况

有的特殊情况下，执行完当前指令后即使发生中断也不会响应。

最典型的比如 对 ss 寄存器操作，向 ss 寄存器传入数据，ss:sp 指向栈顶，所以对 ss 和 sp 的设置应该连续完成： 

![img](https://pic1.zhimg.com/80/v2-6dc4af1d49fbea1cc957b8a044f101ac_720w.webp)

![img](https://pic4.zhimg.com/80/v2-e258bb12b045e728fb39bcc7227f588b_720w.webp)



### BIOS 和 DOS 所提供的中断例程

中断处理程序 简称为 中断例程（P253）。 

![img](https://pic4.zhimg.com/80/v2-855462217403bf820e11898a05bcda8b_720w.webp)

BIOS 和 DOS 所提供的中断例程 安装在例程中的安装过程： 

![img](https://pic2.zhimg.com/80/v2-5f12c27c8d64c5ba0d2f45ac44574781_720w.webp)



## 外中断

外设的输入是送入相关的接口芯片的端口中（不是直接送入内存和CPU）；CPU向外设的输出也不是直接送入外设，而是先送入端口中，再由相关的芯片送到外设。

CPU还可以向外设输出控制命令，这些命令也是先送到相关芯片的端口中，再由相关芯片根据命令对外设实施控制。

即CPU通过端口和外部设备进行联系。比较典型的外设比如键盘和显示器。

### 外中断信息



![img](https://pic1.zhimg.com/80/v2-68ad6f8b40011a4e94dd6e96580639c4_720w.webp)

PC 系统中，外中断源分为两类： 

![img](https://pic3.zhimg.com/80/v2-340f4346e7092b5d617c5efcb54dc306_720w.webp)

![img](https://pic1.zhimg.com/80/v2-7f41df76ebdbc377d99b0be03db631dc_720w.webp)



### 实际例子：键盘输入

键盘上每个键都相当于一个开关，键盘中有一个芯片对键盘上每一个按键的开关状态进行扫描。

按下 松开 按键都会产生扫描码。按下产生的扫描码被称为通码，松开产生的则为断码。

大致分为三步： 

\1. 键盘产生扫描码，并被送入 60h 端口中。 

\2. 键盘的输入到达 60h 端口中，相关的芯片就会向 CPU 发出中断类型码为 9 的可屏蔽中断信息。 

\3. CPU 检测到该中断信息后，如果 IF=1，则响应中断，引发中断过程，转去执行 int 9 的中断例程。（BIOS 提供了 int 9 中断例程，用来进行基本的键盘输入处理）

这些步骤中，我们能改变的只有 int 9 的中断例程。其余都是硬件系统完成的。

## 五、端口

![img](https://pic4.zhimg.com/80/v2-2b99a1e0fc4dd88a5d7bb03c9dcd956b_720w.webp)

如上图，端口即图中所述三种芯片所提供的接口，用于访问芯片内部的寄存器。

访问端口时，CPU 通过端口地址来定位端口，端口地址通过地址总线来传送。8086CPU 16根访问端口的地址总线，于是最多定位 64 KB 个不同的端口。即端口地址的范围是 0 ~ 65535.

端口的读写指令只有两条：in 和 out，分别用于从端口读取数据和往端口写入数据。

（1）访问内存： 

![img](https://pic2.zhimg.com/80/v2-266eab861f081a7ccdb0b2f5eb21a7d9_720w.webp)

（2）访问端口 

![img](https://pic1.zhimg.com/80/v2-947db0ff75ae9c6a2b755c69735309c4_720w.webp)

![img](https://pic2.zhimg.com/80/v2-339bdfebc5746b9746f5a2050c6ceb51_720w.webp)



## 补充

1. 在汇编源程序中，数据不能以字母开头，所以要在前面加0. 比如 “A000h” 要写为 “0A000h”。（P104）
2. debug中可以用p命令来将循环一次执行完，或者用g命令来直接执行到某处。
3. 在汇编程序中，我们可以用 '...' 的方式指明数据是以字符的形式给出的，编译器将把它们转化为相对应的 ASCII ((American Standard Code for Information Interchange): 美国信息交换标准代码）码（小写字母的ASCII码比大写字母的ASCII码值大 32 即 20H）。 比如 `db 'unIX'` 相当于 `db 75H,6EH,49H,58H`，后者分别是字母unIX的ASCII码。
4. 汇编语言中用3个概念来表达数据的位置： 
   i. 对于直接包含在机器指令中的数据（执行前在CPU的指令缓冲器中），在汇编语言中称为：立即数（idata），在汇编指令中直接给出。 
   ii. 对于指令要处理的数据在寄存器中，在汇编指令中给出相应的寄存器名。 
   iii. 对于指令要处理的数据在内存中，在汇编指令中可用 [X] 的格式给出 EA（偏移地址），SA（段地址）在某个寄存器中。存放段地址的寄存器可以是默认的（ds或者ss）也可以是显式地给出。
5. “-”是编译器识别的运算符号，编译器可以用它来进行两个常数的减法。（P245）比如`mov ax 8-4`
6. bx （以及无寄存器的情况） 的默认段地址为 ds，bp 则为 ss，若 [] 中有寄存器，则必有 bx 或者 bp （作为基址）（见笔记 bx、si、di 和 bp 一节）
7. CMOS RAM 中存储的时间信息： 

![img](https://pic3.zhimg.com/80/v2-a76fd3b1a4623ae6cdfc47fbc24c970e_720w.webp)

8. 数值+30h = 对应字符的 ASCII 值 （0~9 和 “0” ~ "9"） 数值+37h = 对应字符的 ASCII 值（10~15 和 “A” ~ “F”） 可以做一个直接定址表，表中依次存储字符 “0” ~ “F”，我们可以通过数值 0~15 直接查找到对应的字符。