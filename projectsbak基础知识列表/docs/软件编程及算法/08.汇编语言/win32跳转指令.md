---
title: win32跳转指令
date: 2023-07-28 11:27:11
permalink: /pages/ddd41b/
tags:
  - 
---
# [学 Win32 汇编[28\] - 跳转指令: JMP、JECXZ、JA、JB、JG、JL、JE、JZ、JS、JC、JO、JP 等](https://www.cnblogs.com/del/archive/2010/04/16/1713886.html)


跳转指令分三类:
一、无条件跳转: JMP;
二、根据 CX、ECX 寄存器的值跳转: JCXZ(CX 为 0 则跳转)、JECXZ(ECX 为 0 则跳转);
三、根据 EFLAGS 寄存器的标志位跳转, 这个太多了.

根据标志位跳转的指令:

------

```
JE   ;等于则跳转
JNE  ;不等于则跳转

JZ   ;为 0 则跳转
JNZ  ;不为 0 则跳转

JS   ;为负则跳转
JNS  ;不为负则跳转

JC   ;进位则跳转
JNC  ;不进位则跳转

JO   ;溢出则跳转
JNO  ;不溢出则跳转

JA   ;无符号大于则跳转
JNA  ;无符号不大于则跳转
JAE  ;无符号大于等于则跳转
JNAE ;无符号不大于等于则跳转

JG   ;有符号大于则跳转
JNG  ;有符号不大于则跳转
JGE  ;有符号大于等于则跳转
JNGE ;有符号不大于等于则跳转

JB   ;无符号小于则跳转
JNB  ;无符号不小于则跳转
JBE  ;无符号小于等于则跳转
JNBE ;无符号不小于等于则跳转

JL   ;有符号小于则跳转
JNL  ;有符号不小于则跳转
JLE  ;有符号小于等于则跳转
JNLE ;有符号不小于等于则跳转

JP   ;奇偶位置位则跳转
JNP  ;奇偶位清除则跳转
JPE  ;奇偶位相等则跳转
JPO  ;奇偶位不等则跳转
```


跳转相关的标志位:

| 11    | 10   | 9    | 8    | 7     | 6    | 5     | 4     | 3     | 2     | 1     | 0     |
| ----- | ---- | ---- | ---- | ----- | ---- | ----- | ----- | ----- | ----- | ----- | ----- |
| OF    | DF   | IF   | TF   | SF    | ZF   |       | AF    |       | PF    |       | CF    |
| 溢 出 |      |      |      | 符 号 | 零   | 未 用 | 辅 助 | 未 用 | 奇 偶 | 未 用 | 进 位 |

------


**JMP 测试**

------

```
; Test28_1.asm;
.386
.model flat, stdcall

include    windows.inc
include    kernel32.inc
include    masm32.inc
include    debug.inc
includelib kernel32.lib
includelib masm32.lib
includelib debug.lib

.code
main proc
    PrintText '1'
    jmp @F
    PrintText '2'
    PrintText '3'
@@: PrintText '4'
    ret
main endp
end main

;测试结果应该是:
;1
;4
;以下都应该是这样.
```


**JE 测试**

------

```
; Test28_2.asm;
.386
.model flat, stdcall

include    windows.inc
include    kernel32.inc
include    masm32.inc
include    debug.inc
includelib kernel32.lib
includelib masm32.lib
includelib debug.lib

.code
main proc
    PrintText '1'
    mov eax, 123
    cmp eax, 123
    je @F
    PrintText '2'
    PrintText '3'
@@: PrintText '4'
    ret
main endp
end main
```


**JZ 测试**

------

```
; Test28_3.asm;
.386
.model flat, stdcall

include    windows.inc
include    kernel32.inc
include    masm32.inc
include    debug.inc
includelib kernel32.lib
includelib masm32.lib
includelib debug.lib

.code
main proc
    PrintText '1'
    xor eax, eax
    jz @F
    PrintText '2'
    PrintText '3'
@@: PrintText '4'
    ret
main endp
end main
```


**JS 测试**

------

```
; Test28_4.asm;
.386
.model flat, stdcall

include    windows.inc
include    kernel32.inc
include    masm32.inc
include    debug.inc
includelib kernel32.lib
includelib masm32.lib
includelib debug.lib

.code
main proc
    PrintText '1'
    xor eax, eax
    dec eax
    js @F
    PrintText '2'
    PrintText '3'
@@: PrintText '4'
    ret
main endp
end main
```


**JC 测试**

------

```
; Test28_5.asm;
.386
.model flat, stdcall

include    windows.inc
include    kernel32.inc
include    masm32.inc
include    debug.inc
includelib kernel32.lib
includelib masm32.lib
includelib debug.lib

.code
main proc
    PrintText '1'
    mov al, 0FFh
    add al, 1
    jc @F
    PrintText '2'
    PrintText '3'
@@: PrintText '4'
    ret
main endp
end main
```


**JO 测试**

------

```
; Test28_6.asm;
.386
.model flat, stdcall

include    windows.inc
include    kernel32.inc
include    masm32.inc
include    debug.inc
includelib kernel32.lib
includelib masm32.lib
includelib debug.lib

.code
main proc
    PrintText '1'
    mov al, -128
    sub al, 1
    jo @F
    PrintText '2'
    PrintText '3'
@@: PrintText '4'
    ret
main endp
end main
```


**JA 测试**

------

```
; Test28_7.asm;
.386
.model flat, stdcall

include    windows.inc
include    kernel32.inc
include    masm32.inc
include    debug.inc
includelib kernel32.lib
includelib masm32.lib
includelib debug.lib

.code
main proc
    PrintText '1'
    mov eax, 22
    cmp eax, 11
    ja @F
    PrintText '2'
    PrintText '3'
@@: PrintText '4'
    ret
main endp
end main
```


**JG 测试**

------

```
; Test28_8.asm;
.386
.model flat, stdcall

include    windows.inc
include    kernel32.inc
include    masm32.inc
include    debug.inc
includelib kernel32.lib
includelib masm32.lib
includelib debug.lib

.code
main proc
    PrintText '1'
    mov eax, 1
    cmp eax, -1
    jg @F
    PrintText '2'
    PrintText '3'
@@: PrintText '4'
    ret
main endp
end main
```


**JP 测试**

------

```
; Test28_9.asm;
.386
.model flat, stdcall

include    windows.inc
include    kernel32.inc
include    masm32.inc
include    debug.inc
includelib kernel32.lib
includelib masm32.lib
includelib debug.lib

.code
main proc
    PrintText '1'
    mov al, 00001110b
    inc al
    jp @F
    PrintText '2'
    PrintText '3'
@@: PrintText '4'
    ret
main endp
end main
```


**JECXZ 测试**

------

```
; Test28_10.asm;
.386
.model flat, stdcall

include    windows.inc
include    kernel32.inc
include    masm32.inc
include    debug.inc
includelib kernel32.lib
includelib masm32.lib
includelib debug.lib

.code
main proc
    PrintText '1'
    xor ecx, ecx
    jecxz @F
    PrintText '2'
    PrintText '3'
@@: PrintText '4'
    ret
main endp
end main
```