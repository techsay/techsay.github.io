

## iOS - 老生常谈内存管理

原文链接：https://juejin.cn/column/6962574638752727048

本文转载自掘金 [“师大小海腾”](https://juejin.cn/user/782508012091645)

如有转载侵权请联系 357786223@qq.com 删除

## 导读

这段时间通过以下资料学习了 Objective-C 的内存管理：

- 书籍：《Objective-C 高级编程：iOS 与 OS X 多线程和内存管理》
- Apple 官方文档：[Advanced Memory Management Programming Guide](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.apple.com%2Flibrary%2Farchive%2Fdocumentation%2FCocoa%2FConceptual%2FMemoryMgmt%2FArticles%2FMemoryMgmt.html%23%2F%2Fapple_ref%2Fdoc%2Fuid%2F10000011i)
- Apple 官方文档：[Transitioning to ARC Release Notes](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.apple.com%2Flibrary%2Farchive%2Freleasenotes%2FObjectiveC%2FRN-TransitioningToARC%2FIntroduction%2FIntroduction.html%23%2F%2Fapple_ref%2Fdoc%2Fuid%2FTP40011226-CH1-SW11)
- Apple 维护的 Runtime 开源库：[opensource.apple.com/tarballs/ob…](https://link.juejin.cn/?target=https%3A%2F%2Fopensource.apple.com%2Ftarballs%2Fobjc4%2F)

并总结了以下文章：

- [iOS - 老生常谈内存管理（一）：引用计数](https://juejin.cn/post/6844904129676967950)

- [iOS - 老生常谈内存管理（二）：从 MRC 说起](https://juejin.cn/post/6844904129676984334)

- [iOS - 老生常谈内存管理（三）：ARC 面世](https://juejin.cn/post/6844904130431942670)

- [iOS - 老生常谈内存管理（四）：内存管理方法源码分析](https://juejin.cn/post/6844904131719593998)

- [iOS - 老生常谈内存管理（五）：Tagged Pointer](https://juejin.cn/post/6844904132940136462)

- [iOS - 老生常谈内存管理（六）：聊聊 autorelease 和 @autoreleasepool](https://juejin.cn/post/6844904094503567368)

  

文章大纲：

[图片地址](https://ask.qcloudimg.com/http-save/yehe-6828465/1ny97w7ukg.png)

![img](https://ask.qcloudimg.com/http-save/yehe-6828465/1ny97w7ukg.png)

以下列举了部分有关内存管理的问题。如果你对以下问题存在疑惑，或者只有模糊的答案，那么本系列文章可以给予你帮助。

- iOS 的内存管理方案有哪些？
- 讲讲 iOS 的内存管理机制
- 引用计数机制是怎么工作的？
- 引用计数存储在哪里？以前存储在哪？现在呢？
- 能聊聊 isa 吗？什么是 nonpointer ？
- SideTable 你有了解过吗，它是用来干嘛的？
- 引用计数具体是怎么管理的，你能说说内存管理方法的实现吗？
- 聊聊 MRC 下的内存管理规则吧？
- MRC 下什么时候需要给对象发送 release 消息？什么时候使用 autorelease？
- 为什么不要在初始化方法和 dealloc 中使用访问器方法？
- 为什么初始化方法中需要 self = [super init]？
- 你能讲一下 super 的原理吗？
- ARC 的内存管理规则？
- ARC 下没有 retain / release 等方法了吗？
- Toll-Free Bridged 了解过吗？详细描述一下。
- 所有权修饰符有哪些？
- weak 变量在对象被销毁后是如何置为 nil 的，Runtime 是怎样实现它的？
- Runtime 为 weak 变量赋值的过程？
- 既然 __weak 更安全，那么为什么已经有了 __weak 还要保留 __unsafe_unretained ？
- 循环引用是怎么产生的？MRC 下是如何避免循环引用问题的？
- ARC 下哪些情况会产生循环引用？如何解决？
- 释放 NSAutoreleasePool 对象，使用 [pool release] 与 [pool drain] 的区别？
- @autoreleasepool 你了解多少？
- @autoreleasepool 的实现原理？
- 什么时候需要自己创建 @autoreleasepool？
- ARC 环境下，方法里的局部对象什么时候释放？
- ARC 环境下，autorelease 对象在什么时候释放？
- ARC 环境下，需不需要手动添加 @autoreleasepool？
- Tagged Pointer 是什么？
- 如何判断 Tagged Pointer ？

## 内存管理（一）：引用计数



## 简单聊聊 GC 与 RC

随着各个平台的发展，现在被广泛采用的内存管理机制主要有 GC 和 RC 两种。

- GC (Garbage Collection)：垃圾回收机制，定期查找不再使用的对象，释放对象占用的内存。
- RC (Reference Counting)：引用计数机制。采用引用计数来管理对象的内存，当需要持有一个对象时，使它的引用计数 +1；当不需要持有一个对象的时候，使它的引用计数 -1；当一个对象的引用计数为 0，该对象就会被销毁。

`Objective-C`支持三种内存管理机制：`ARC`、`MRC`和`GC`，但`Objective-C`的`GC`机制有平台局限性，仅限于`MacOS`开发中，`iOS`开发用的是`RC`机制，从`MRC`到现在的`ARC`。

>  **备注：** 苹果在引入`ARC`的时候称将在`MacOS`中弃用`GC`机制。  OS X Mountain Lion v10.8 中不推荐使用`GC`机制，并且将在 OS X 的未来版本中删除`GC`机制。`ARC`是推荐的替代技术。为了帮助现有应用程序迁移，Xcode 4.3 及更高版本中的`ARC`[迁移工具](https://cloud.tencent.com/product/msp?from=20065&from_column=20065)支持将使用`GC`的 OS X 应用程序迁移到`ARC`。  注意：对于面向 Mac App Store 的应用，Apple 强烈建议你尽快使用`ARC`替换`GC`，因为 Mac App Store Guidelines 禁止使用已弃用的技术，否则不会通过审核，详情请参阅 [Mac App Store Review Guidelines](https://links.jianshu.com/go?to=http%3A%2F%2Fdeveloper.apple.com%2Fappstore%2Fmac%2Fresources%2Fapproval%2Fguidelines.html)。 

## Reference Counting

作为一名 iOS 开发者，引用计数机制是我们必须掌握的知识。那么，引用计数机制下是怎样工作的呢？它存在什么优势？

### 办公室里的照明问题

在《Objective-C 高级编程：iOS 与 OS X 多线程和内存管理》这本书中举了一个 “办公室里的照明问题” 的例子，很好地说明了引用计数机制。

假设办公室里的照明设备只有一个。上班进入办公室的人需要照明，所以要把灯打开。而对于下班离开办公室的人来说，已经不需要照明了，所以要把灯关掉。

![img](https://ask.qcloudimg.com/http-save/yehe-6828465/izj1a4bxna.png?imageView2/2/w/2560/h/7000)

若是很多人上下班，每个人都开灯或者关灯，那么办公室的情况又将如何呢？最早下班的人如果关了灯，那就会像下图那样，办公室里还没走的所有人都将处于一片黑暗之中。

![img](https://ask.qcloudimg.com/http-save/yehe-6828465/gei5j0tfln.png?imageView2/2/w/2560/h/7000)

解决这一问题的办法就是使办公室在还有至少一人的情况下保持开灯状态，而在无人时保持关灯状态。

（1）最早进入办公室的人开灯。 （2）之后进入办公室的人，需要照明。 （3）下班离开办公室的人，不需要照明。 （4）最后离开办公室的人关灯（此时已无人需要照明）。

为判断是否还有人在办公室里，这里导入计数功能来计算 “需要照明的人数”。下面让我们来看看这一功能是如何运作的吧。

（1）第一个人进入办公室，“需要照明的人数” 加 1。计数值从 0 变成了 1，因此要开灯。 （2）之后每当有人进入办公室，“需要照明的人数” 就加 1。如计数值从 1 变成 2。 （3）每当有人下班离开办公室，“需要照明的人数” 就减 1。如计数值从 2 变成 1。 （4）最后一个人下班离开办公室，“需要照明的人数” 减 1。计数值从 1 变成了 0，因此要关灯。

这样就能在不需要照明的时候保持关灯状态。办公室中仅有的照明设备得到了很好的管理，如下图所示：

![img](https://ask.qcloudimg.com/http-save/yehe-6828465/s03luc67wp.png?imageView2/2/w/2560/h/7000)

在 Objective-C 中，“对象” 相当于办公室里的照明设备。在现实世界中办公室里的照明设备只有一个，但在 Objective-C 的世界里，虽然计算机的资源有限，但一台计算机可以同时处理好几个对象。

此外，“对象的使用环境” 相当于上班进入办公室的人。虽然这里的 “环境” 有时也指在运行中的程序代码、变量、变量作用域、对象等，但在概念上就是使用对象的环境。上班进入办公室的人对办公室照明设备发出的动作，与 Objective-C 中的对应关系则如下表所示：

| 对照明设备所做的动作 | 对 Objective-C 对象所做的动作 |
| :------------------- | :---------------------------- |
| 开灯                 | 生成对象                      |
| 需要照明             | 持有对象                      |
| 不需要照明           | 释放对象                      |
| 关灯                 | 废弃对象                      |

使用计数功能计算需要照明的人数，使办公室的照明得到了很好的管理。同样，使用引用计数功能，对象也就能够得到很好的管理，这就是 Objective-C 的内存管理。如下图所示：

![img](https://ask.qcloudimg.com/http-save/yehe-6828465/hjixtqlaki.png?imageView2/2/w/2560/h/7000)

## 引用计数的存储

以上我们对 “引用计数” 这一概念做了初步了解，Objective-C 中的 “对象” 通过引用计数功能来管理它的内存生命周期。那么，对象的引用计数是如何存储的呢？它存储在哪个数据结构里？

首先，不得不提一下`isa`。

### isa

-  `isa`指针用来维护 “对象” 和 “类” 之间的关系，并确保对象和类能够通过`isa`指针找到对应的方法、实例变量、属性、协议等；
- 在 arm64 架构之前，`isa`就是一个普通的指针，直接指向`objc_class`，存储着`Class`、`Meta-Class`对象的内存地址。`instance`对象的`isa`指向`class`对象，`class`对象的`isa`指向`meta-class`对象；
- 从 arm64 架构开始，对`isa`进行了优化，用`nonpointer`表示，变成了一个共用体（`union`）结构，还使用位域来存储更多的信息。将 64 位的内存数据分开来存储着很多的东西，其中的 33 位才是拿来存储`class`、`meta-class`对象的内存地址信息。要通过位运算将`isa`的值`& ISA_MASK`掩码，才能得到`class`、`meta-class`对象的内存地址。

```javascript
// objc.h
struct objc_object {
    Class isa;  // 在 arm64 架构之前
};

// objc-private.h
struct objc_object {
private:
    isa_t isa;  // 在 arm64 架构开始
};

union isa_t 
{
    isa_t() { }
    isa_t(uintptr_t value) : bits(value) { }

    Class cls;
    uintptr_t bits;

#if SUPPORT_PACKED_ISA

    // extra_rc must be the MSB-most field (so it matches carry/overflow flags)
    // nonpointer must be the LSB (fixme or get rid of it)
    // shiftcls must occupy the same bits that a real class pointer would
    // bits + RC_ONE is equivalent to extra_rc + 1
    // RC_HALF is the high bit of extra_rc (i.e. half of its range)

    // future expansion:
    // uintptr_t fast_rr : 1;     // no r/r overrides
    // uintptr_t lock : 2;        // lock for atomic property, @synch
    // uintptr_t extraBytes : 1;  // allocated with extra bytes

# if __arm64__  // 在 __arm64__ 架构下
#   define ISA_MASK        0x0000000ffffffff8ULL  // 用来取出 Class、Meta-Class 对象的内存地址
#   define ISA_MAGIC_MASK  0x000003f000000001ULL
#   define ISA_MAGIC_VALUE 0x000001a000000001ULL
    struct {
        uintptr_t nonpointer        : 1;  // 0：代表普通的指针，存储着 Class、Meta-Class 对象的内存地址
                                          // 1：代表优化过，使用位域存储更多的信息
        uintptr_t has_assoc         : 1;  // 是否有设置过关联对象，如果没有，释放时会更快
        uintptr_t has_cxx_dtor      : 1;  // 是否有C++的析构函数（.cxx_destruct），如果没有，释放时会更快
        uintptr_t shiftcls          : 33; // 存储着 Class、Meta-Class 对象的内存地址信息
        uintptr_t magic             : 6;  // 用于在调试时分辨对象是否未完成初始化
        uintptr_t weakly_referenced : 1;  // 是否有被弱引用指向过，如果没有，释放时会更快
        uintptr_t deallocating      : 1;  // 对象是否正在释放
        uintptr_t has_sidetable_rc  : 1;  // 如果为1，代表引用计数过大无法存储在 isa 中，那么超出的引用计数会存储在一个叫 SideTable 结构体的 RefCountMap（引用计数表）散列表中
        uintptr_t extra_rc          : 19; // 里面存储的值是对象本身之外的引用计数的数量，retainCount - 1
#       define RC_ONE   (1ULL<<45)
#       define RC_HALF  (1ULL<<18)
    };
......  // 在 __x86_64__ 架构下
};
```

复制

如果`isa`非`nonpointer`，即 arm64 架构之前的`isa`指针。由于它只是一个普通的指针，存储着`Class`、`Meta-Class`对象的内存地址，所以它本身不能存储引用计数，所以以前对象的引用计数都存储在一个叫`SideTable`结构体的`RefCountMap`（引用计数表）散列表中。

如果`isa`是`nonpointer`，则它本身可以存储一些引用计数。从以上`union isa_t`的定义中我们可以得知，`isa_t`中存储了两个引用计数相关的东西：`extra_rc`和`has_sidetable_rc`。

- extra_rc：里面存储的值是对象本身之外的引用计数的数量，这 19 位如果不够存储，`has_sidetable_rc`的值就会变为 1；
- has_sidetable_rc：如果为 1，代表引用计数过大无法存储在`isa`中，那么超出的引用计数会存储`SideTable`的`RefCountMap`中。

所以，如果`isa`是`nonpointer`，则对象的引用计数存储在它的`isa_t`的`extra_rc`中以及`SideTable`的`RefCountMap`中。

>  **备注**： 

- 以上`isa_t`结构来自老版本的`objc4`源码，从`objc4-750`版本开始，`isa_t`中的`struct`的内容定义成了宏并写在`isa.h`文件里，不过其数据结构不变，这里不影响。
- 更多关于`isa`的知识，以及以上提到的一些细节，可以查看[《深入浅出 Runtime（二）：数据结构》](https://links.jianshu.com/go?to=https%3A%2F%2Fjuejin.im%2Fpost%2F5e54f7c5f265da57187c4d0b)。

### SideTable

以上提到了一个数据结构`SideTable`，我们进入`objc4`源码查看它的定义。

```javascript
// NSObject.mm
struct SideTable {
    spinlock_t slock;        // 自旋锁
    RefcountMap refcnts;     // 引用计数表（散列表）
    weak_table_t weak_table; // 弱引用表（散列表）
    ......
}
```

复制

`SideTable`存储在`SideTables()`中，`SideTables()`本质也是一个散列表，可以通过对象指针来获取它对应的（引用计数表或者弱引用表）在哪一个`SideTable`中。在非嵌入式系统下，`SideTables()`中有 64 个`SideTable`。以下是`SideTables()`的定义：

```javascript
// NSObject.mm
static objc::ExplicitInit<StripedMap<SideTable>> SideTablesMap;

static StripedMap<SideTable>& SideTables() {
    return SideTablesMap.get();
}
```

复制

所以，查找对象的引用计数表需要经过两次哈希查找：

- ① 第一次根据当前对象的内存地址，经过哈希查找从`SideTables()`中取出它所在的`SideTable`；
- ② 第二次根据当前对象的内存地址，经过哈希查找从`SideTable`中的`refcnts`中取出它的引用计数表。

>  **Q：为什么不是一个`SideTable`，而是使用多个`SideTable`组成`SideTables()`结构？** 

如果只有一个`SideTable`，那我们在内存中分配的所有对象的引用计数或者弱引用都放在这个`SideTable`中，那我们对对象的引用计数进行操作时，为了多线程安全就要加锁，就存在效率问题。 系统为了解决这个问题，就引入 “分离锁” 技术方案，提高访问效率。把对象的引用计数表分拆多个部分，对每个部分分别加锁，那么当所属不同部分的对象进行引用操作的时候，在多线程下就可以并发操作。所以，使用多个`SideTable`组成`SideTables()`结构。

>  **备注：** 关于引用计数具体是怎么管理的，请参阅`《iOS - 老生常谈内存管理（四）：内存管理方法源码分析》`。 



## 内存管理（二）：从 MRC 说起



## 前言

 `MRC`全称`Manual Reference Counting`，也称为`MRR`（`manual retain-release`），手动引用计数内存管理，即开发者需要手动控制对象的引用计数来管理对象的内存。

   在`MRC`年代，我们经常需要写`retain`、`release`、`autorelease`等方法来手动管理对象内存，然而这些方法在`ARC`是禁止调用的，调用会引起编译报错。

   下面我们从`MRC`说起，聊聊`iOS`内存管理。

## 简介

### 关于内存管理

  应用程序内存管理是在程序运行时分配内存，使用它并在使用完后释放它的过程。编写良好的程序将使用尽可能少的内存。在 Objective-C 中，它也可以看作是在许多数据和代码之间分配有限内存资源所有权的一种方式。掌握内存管理知识，我们就可以很好地管理对象生命周期并在不再需要它们时释放它们，从而管理应用程序的内存。

   虽然通常在单个对象级别上考虑内存管理，但实际上我们的目标是管理对象图，要保证在内存中只保留需要用到的对象，确保没有发生内存泄漏。

   下图是苹果官方文档给出的 “内存管理对象图”，很好地展示了一个对象 “创建——持有——释放——销毁” 的过程。

![img](https://ask.qcloudimg.com/http-save/7220648/dngt4zsa6b.png?imageView2/2/w/2560/h/7000)

Objective-C 在`iOS`中提供了两种内存管理方法：

1. `MRC`，也是本篇文章要讲解的内容，我们通过跟踪自己持有的对象来显式管理内存。这是使用一个称为 “引用计数” 的模型来实现的，由 Foundation 框架的 NSObject 类与运行时环境一起提供。
2. `ARC`，系统使用与`MRC`相同的引用计数系统，但是它会在编译时为我们插入适当的内存管理方法调用。使用`ARC`，我们通常就不需要了解本文章中描述的`MRC`的内存管理实现，尽管在某些情况下它可能会有所帮助。但是，作为一名合格的`iOS`开发者，掌握这些知识是很有必要的。

### 良好的做法可防止与内存相关的问题

- 不正确的内存管理导致的问题主要有两种： ① 释放或覆盖仍在使用的数据 这会导致内存损坏，并且通常会导致应用程序崩溃，甚至损坏用户数据。 ② 不释放不再使用的数据会导致内存泄漏 内存泄漏是指没有释放已分配的不再被使用的内存。内存泄漏会导致应用程序不断增加内存使用量，进而可能导致系统性能下降或应用程序被终止。
- 但是，从引用计数的角度考虑内存管理通常会适得其反，因为你会倾向于根据实现细节而不是实际目标来考虑内存管理。相反，你应该从对象所有权和对象图的角度考虑内存管理。
- Cocoa 使用简单的命名约定来指示你何时持有由方法返回的对象。（请参阅 `《内存管理策略》` 章节）
- 尽管内存管理基本策略很简单，但是你可以采取一些措施来简化内存管理，并帮助确保程序保持可靠和健壮，同时最大程度地减少其资源需求。（请参阅 `《实用内存管理》` 章节）
- 自动释放池块提供了一种机制，你可以通过该机制向对象发送 “延迟”`release`消息。这在需要放弃对象所有权但又希望避免立即释放对象的情况下很有用（例如从方法返回对象时）。在某些情况下，你可能会使用自己的自动释放池块。（请参阅 `《使用 Autorelease Pool Blocks》` 章节）

### 使用分析工具调试内存问题

为了在编译时发现代码问题，可以使用 Xcode 内置的 Clang Static Analyzer。

 如果仍然出现内存管理问题，则可以使用其他工具和技术来识别和诊断问题。

- [《Technical Note TN2239, iOS Debugging Magic》](https://links.jianshu.com/go?to=https%253A%252F%252Fdeveloper.apple.com%252Flibrary%252Farchive%252Ftechnotes%252Ftn2239%252F_index.html%2523%252F%252Fapple_ref%252Fdoc%252Fuid%252FDTS40010638) 中描述了许多工具和技术，尤其是使用`NSZombie`（僵尸对象）来帮助查找过度释放的对象。
- 您可以使用 Instruments 来跟踪引用计数事件并查找内存泄漏。请参阅 [《Instruments Help》](https://links.jianshu.com/go?to=https%253A%252F%252Fhelp.apple.com%252Finstruments%252Fmac%252Fcurrent%252F%2523%252F)。

## 内存管理策略

NSObject 协议中定义的内存管理方法与遵守这些方法命名约定的自定义方法的组合提供了用于引用计数环境中的内存管理的基本模型。NSObject 类还定义了一个`dealloc`方法，该方法在对象被销毁时自动调用。

### 基本内存管理规则

  在`MRC`下，我们要严格遵守引用计数内存管理规则。

   内存管理模型基于对象所有权。任何对象都可以拥有一个或多个所有者。只要一个对象至少拥有一个所有者，它就会继续存在。如果对象没有所有者，则运行时系统会自动销毁它。为了确保你清楚自己何时拥有和不拥有对象的所有权，Cocoa 设置了以下策略：

#### 四条规则

- **创建并持有对象** 使用 `alloc/new/copy/mutableCopy` 等方法（或者以这些方法名开头的方法）创建的对象我们直接持有，其`RC`（引用计数，以下使用统一使用`RC`）初始值为 1，我们直接使用即可，在不需要使用的时候调用一下`release`方法进行释放。

```js
    id obj = [NSObject alloc] init]; // 创建并持有对象，RC = 1
    /*
     * 使用该对象，RC = 1
     */
    [obj release]; // 在不需要使用的时候调用 release，RC = 0，对象被销毁
```

复制

  如果我们通过自定义方法 **创建并持有对象**，则方法名应该以 `alloc/new/copy/mutableCopy` 开头，且应该遵循驼峰命名法规则，返回的对象也应该由这些方法创建，如：

```js
- (id)allocObject
{
    id obj = [NSObject alloc] init];
    retain obj;
}
```

复制

  可以通过`retainCount`方法查看对象的引用计数值。

```js
    NSLog(@"%ld", [obj retainCount]);
```

复制

- **可以使用 retain 持有对象** 我们可以使用`retain`对一个对象进行持有。使用上述方法以外的方法创建的对象，我们并不持有，其`RC`初始值也为 1。但是需要注意的是，如果要使用（持有）该对象，需要先进行`retain`，否则可能会导致程序`Crash`。原因是这些方法内部是给对象调用了`autorelease`方法，所以这些对象会被加入到自动释放池中。

  ① 情况一：iOS 程序中不手动指定`@autoreleasepool`

   当`RunLoop`迭代结束时，会自动给自动释放池中的对象调用`release`方法。所以如果我们使用前不进行`retain`，如果`RunLoop`迭代结束，对象调用`release`方法其`RC`值就会变成 0，该对象就会被销毁。如果我们这时候访问已经被销毁的对象，程序就会`Crash`。

```js
    /* 正确的用法 */

    id obj = [NSMutableArray array]; // 创建对象但并不持有，对象加入自动释放池，RC = 1

    [obj retain]; // 使用之前进行 retain，对对象进行持有，RC = 2
    /*
     * 使用该对象，RC = 2
     */
    [obj release]; // 在不需要使用的时候调用 release，RC = 1
    /*
     * RunLoop 可能在某一时刻迭代结束，给自动释放池中的对象调用 release，RC = 0，对象被销毁
     * 如果这时候 RunLoop 还未迭代结束，该对象还可以被访问，不过这是非常危险的，容易导致 Crash
     */
```

复制

  ② 情况二：手动指定`@autoreleasepool`

   这种情况就更加明显了，如果`@autoreleasepool`作用域结束，就会自动给`autorelease`对象调用`release`方法。如果这时候我们再访问该对象，程序就会崩溃`EXC_BAD_ACCESS`。

```js
    /* 错误的用法 */

    id obj;
    @autoreleasepool {
        obj = [NSMutableArray array]; // 创建对象但并不持有，对象加入自动释放池，RC = 1
    } // @autoreleasepool 作用域结束，对象 release，RC = 0，对象被销毁
    NSLog(@"%@",obj); // EXC_BAD_ACCESS
```

复制

```js
    /* 正确的用法 */

    id obj;
    @autoreleasepool {
        obj = [NSMutableArray array]; // 创建对象但并不持有，对象加入自动释放池，RC = 1
        [obj retain]; // RC = 2
    } // @autoreleasepool 作用域结束，对象 release，RC = 1
    NSLog(@"%@",obj); // 正常访问
    /*
     * 使用该对象，RC = 1
     */
    [obj release]; // 在不需要使用的时候调用 release，RC = 0，对象被销毁
```

复制

  如果我们通过自定义方法 **创建但并不持有对象**，则方法名就不应该以 `alloc/new/copy/mutableCopy` 开头，且返回对象前应该要先通过`autorelease`方法将该对象加入自动释放池。如：

```js
- (id)object
{
    id obj = [NSObject alloc] init];
    [obj autorelease];
    retain obj;
}
```

复制

  这样调用方在使用该方法创建对象的时候，他就会知道他不持有该对象，于是他会在使用该对象前进行`retain`，并在不需要该对象时进行`release`。

>  **备注**：`release`和`autorelease`的区别： 

- 调用`release`，对象的`RC`会立即 -1；
- 调用`autorelease`，对象的`RC`不会立即 -1，而是将对象添加进自动释放池，它会在一个恰当的时刻自动给对象调用`release`，所以`autorelease`相当于延迟了对象的释放。
- **不再需要自己持有的对象时释放** 在不需要使用（持有）对象的时候，需要调用一下`release`或者`autorelease`方法进行释放（或者称为 “放弃对象使用权”），使其`RC`-1，防止内存泄漏。当对象的`RC`为 0 时，就会调用`dealloc`方法销毁对象。
- **不能释放非自己持有的对象** 从以上我们可以得知，持有对象有两种方式，一是通过 `alloc/new/copy/mutableCopy` 等方法创建对象，二是通过`retain`方法。如果自己是持有者，那么在不需要该对象的时候需要调用一下`release`方法进行释放。但是，如果自己不是持有者，就不能对对象进行`release`，否则会发生程序崩溃`EXC_BAD_ACCESS`，如下两种情况：

```js
    id obj = [[NSObject alloc] init]; // 创建并持有对象，RC = 1
    [obj release]; // 如果自己是持有者，在不需要使用的时候调用 release，RC = 0
    /*
     * 此时对象已被销毁，不应该再对其进行访问
     */
    [obj release]; // EXC_BAD_ACCESS，这时候自己已经不是持有者，再 release 就会 Crash
    /*
     * 再次 release 已经销毁的对象（过度释放），或是访问已经销毁的对象都会导致崩溃
     */
```

复制

```js
    id obj = [NSMutableArray array]; // 创建对象，但并不持有对象，RC = 1
    [obj release]; // EXC_BAD_ACCESS 虽然对象的 RC = 1，但是这里并不持有对象，所以导致 Crash
```

复制

  还有一种情况，这是不容易发现问题的情况。下面程序运行居然不会崩溃？这是为什么呢？这里要介绍两个概念，`野指针`和`僵尸对象`。

> 

- **野指针：** 在 C 中是指没有进行初始化的指针，该指针指向一个随机的空间，它的值是个垃圾值；在 OC 中是指指向的对象已经被回收了的指针（网上很多都是这样解释，但我认为它应该叫 “悬垂指针” 才对）。
- **僵尸对象：** 指已经被销毁的对象。

  如下这种情况，当我们通过`野指针`去访问`僵尸对象`的时候，可能会有问题，也可能没有问题。对象所占内存在“解除分配(deallocated)”之后，只是放回可用内存池。如果僵尸对象所占内存还没有分配给别人，这时候访问没有问题，如果已经分配给了别人，再次访问就会崩溃。

```js
    Person *person = [[Person alloc] init]; // 创建并持有对象，RC = 1
    [person release]; // 如果自己是持有者，在不需要使用的时候调用 release，RC = 0
    [person release]; // 这时候 person 指针为野指针，对象为僵尸对象
    [person release]; // 可能这时候僵尸对象所占的空间还没有分配给别人，所以可以正常访问
```

复制

  以上几个例子都可以用一句话总结：不能释放非自己持有的对象。

>  以上就是内存管理基本的四条规则，你对照上篇文章中讲的《办公室里的照明问题》，是不是就比较好理解了，你细品，你细细的品！ 

#### 一个简单的例子

Person 对象是使用`alloc`方法创建的，因此在不需要该对象时发送一条`release`消息。

```js
{
    Person *aPerson = [[Person alloc] init];
    // ...
    NSString *name = aPerson.fullName;
    // ...
    [aPerson release];
}
```

复制

#### 使用 autorelease 发送延迟 release

当你需要发送延迟`release`消息时，可以使用`autorelease`，通常用在从方法返回对象时。例如，你可以像这样实现 fullName 方法：

```js
- (NSString *)fullName {
    NSString *string = [[[NSString alloc] initWithFormat:@"%@ %@",
                                          self.firstName, self.lastName] autorelease];
    return string;
}
```

复制

根据内存管理规则，你通过`alloc`方法创建并持有对象，要在不需要该对象时发送一条`release`消息。但是如果你在方法中使用`release`，则`return`之前就会销毁 NSString 对象，该方法将返回无效对象。使用`autorelease`，就会延迟`release`，在 NSString 对象被释放之前返回。

你还可以像这样实现 fullName 方法：

```js
- (NSString *)fullName {
    NSString *string = [NSString stringWithFormat:@"%@ %@",
                                 self.firstName, self.lastName];
    return string;
}
```

复制

根据内存管理规则，你不持有 NSString 对象，因此你不用担心它的释放，直接`return`即可。stringWithFormat 方法内部会给 NSString 对象调用`autorelease`方法。

相比之下，以下实现是错误的：

```js
- (NSString *)fullName {
    NSString *string = [[NSString alloc] initWithFormat:@"%@ %@",
                                         self.firstName, self.lastName];
    return string;
}
```

复制

在 fullName 方法内部我们通过`alloc`方法创建对象并持有，然而并没有释放对象。而该方法名不以 `alloc/new/copy/mutableCopy` 等开头。在调用方看来，通过该方法获得的对象并不持有，因此他会进行`retain`并在他不需要该对象时`release`，在他看来这样使用该对象没有内存问题。然而这时候该对象的引用计数为 1，并没有销毁，就发生了内存泄漏。

#### 你不持有通过引用返回的对象

Cocoa 中的一些方法指定通过引用返回对象（它们采用`ClassName **`或`id *`类型的参数）。常见的就是使用`NSError`对象，该对象包含有关错误的信息（如果发生错误），如`initWithContentsOfURL:options:error:`（`NSData`）和`initWithContentsOfFile:encoding:error:`（`NSString`）方法等。

在这些情况下，也遵从内存管理规则。当你调用这些方法时，你不会创建该`NSError`对象，因此你不持有该对象，也无需释放它，如以下示例所示：

```js
    NSString *fileName = <#Get a file name#>;
    NSError *error;
    NSString *string = [[NSString alloc] initWithContentsOfFile:fileName
                            encoding:NSUTF8StringEncoding error:&error];
    if (string == nil) {
        // Deal with error...
    }
    // ...
    [string release];
```

复制

### 实现 dealloc 以放弃对象的所有权

NSObject 类定义了一个`dealloc`方法，该方法会在一个对象没有所有者（`RC`=0）并且它的内存被回收时由系统自动调用 —— 在 Cocoa 术语中称为`freed`或`deallocated`。

 `dealloc`方法的作用是销毁对象自身的内存，并释放它持有的任何资源，包括任何实例变量的所有权。

以下举了一个在 Person 类中实现 `dealloc`方法的示例：

```js
@interface Person : NSObject
@property (retain) NSString *firstName;
@property (retain) NSString *lastName;
@property (assign, readonly) NSString *fullName;
@end
 
@implementation Person
// ...
- (void)dealloc
    [_firstName release];
    [_lastName release];
    [super dealloc];
}
```

复制

>  **注意：** 

- 切勿直接调用另一个对象`dealloc`的方法；
- 你必须在实现结束时调用`[super dealloc]`；
- 你不应该将系统资源的管理与对象生命周期联系在一起，请参阅`《不要使用 dealloc 管理稀缺资源》`章节；
- 当应用程序终止时，可能不会向对象发送`dealloc`消息。因为进程的内存在退出时会自动清除，所以让操作系统清理资源比调用所有对象的`dealloc`方法更有效。

### Core Foundation 使用相似但不同的规则

Core Foundation 对象有类似的内存管理规则（请参阅 [《 Core Foundation 内存管理编程指南》](https://links.jianshu.com/go?to=https%253A%252F%252Fdeveloper.apple.com%252Flibrary%252Farchive%252Fdocumentation%252FCoreFoundation%252FConceptual%252FCFMemoryMgmt%252FCFMemoryMgmt.html%2523%252F%252Fapple_ref%252Fdoc%252Fuid%252F10000127i)）。但是，Cocoa 和 Core Foundation 的命名约定不同。特别是 Core Foundation 的创建对象的规则（请参阅 [《The Create Rule》](https://links.jianshu.com/go?to=https%253A%252F%252Fdeveloper.apple.com%252Flibrary%252Farchive%252Fdocumentation%252FCoreFoundation%252FConceptual%252FCFMemoryMgmt%252FConcepts%252FOwnership.html%2523%252F%252Fapple_ref%252Fdoc%252Fuid%252F20001148-103029)）不适用于返回 Objective-C 对象的方法。例如以下的代码片段，你不负责放弃 myInstance 的所有权。因为在 Cocoa 中使用 `alloc/new/copy/mutableCopy` 等方法（或者以这些方法名开头的方法）创建的对象，我们才需要对其进行释放。

```js
    MyClass * myInstance = [MyClass createInstance];
```

复制

## 实用内存管理

尽管内存管理基本策略很简单，但是你可以采取一些措施来简化内存管理，并帮助确保程序保持可靠和健壮，同时最大程度地减少其资源需求。

### 使用访问器方法让内存管理更轻松

如果类中有对象类型的属性，则你必须确保在使用过程中该属性赋值的对象不被释放。因此，在赋值对象时，你必须持有对象的所有权，让其引用计数加 1。还必须要把当前持有的旧对象的引用计数减 1。

有时它可能看起来很乏味或繁琐，但如果你始终使用访问器方法，那么内存管理出现问题的可能性会大大降低。如果你在整个代码中对实例变量使用`retain`和`release`，这肯定是错误的做法。

以下在 Counter 类中定义了一个`NSNumber`对象属性。

```js
@interface Counter : NSObject
@property (nonatomic, retain) NSNumber *count;
@end;
```

复制

`@property`会自动生成`setter`和`getter`方法的声明，通常，你应该使用`@synthesize`让编译器合成方法。但如果我们了解访问器方法的实现是有益的。

>  `@synthesize`会自动生成`setter`和`getter`方法的实现以及下划线实例变量，详细的解释将在下一篇`ARC`文章中讲到。 

`getter`方法只需要返回合成的实例变量，所以不用进行`retain`和`release`。

```js
- (NSNumber *)count {
    return _count;
}
```

复制

`setter`方法中，如果其他所有人都遵循相同的规则，那么其他人很可能随时让新对象 newCount 的引用计数减 1，从而导致 newCount 被销毁，所以你必须对其`retain`使其引用计数加 1。你还必须对旧对象`release`以放弃对它的持有。所以，先对新对象进行`retain`，再对旧对象进行`release`，然后再进行赋值操作。（在`Objective-C`中允许给`nil`发送消息，且这样会直接返回不做任何事情。所以就算是第一次调用，_count 变量为`nil`，对其进行 `release`也没事。可以参阅[《深入浅出 Runtime（三）：消息机制》](https://links.jianshu.com/go?to=https%253A%252F%252Fjuejin.im%252Fpost%252F5e5508eb51882549546af20f)）

>  **注意：** 你必须先对新对象进行`retain`，再对旧对象进行`release`。顺序颠倒的话，如果新旧对象是同一对象，则可能会发生意外导致对象`dealloc`。 

```js
- (void)setCount:(NSNumber *)newCount {
    [newCount retain];
    [_count release];
    // Make the new assignment.
    _count = newCount;
}
```

复制

以上是苹果官方的做法，该做法在性能上略有不足，如果新旧对象是同一个对象，就存在不必要的方法调用。

更好的做法如下：先判断新旧对象是否是同一个对象，如果是的话就什么都不做；如果新旧对象不是同一个对象，则对旧对象进行`release`，对新对象进行`retain`并赋值给合成的实例变量。

```js
- (void)setCount:(NSNumber *)newCount {
    if (_count != newCount) {
        [_count release];
        _count = [newCount retain];
    }
}
```

复制

#### 使用访问器方法设置属性值

假设我们要重置以上`count`属性的值。有以下两种方法：

```js
- (void)reset {
    NSNumber *zero = [[NSNumber alloc] initWithInteger:0];
    [self setCount:zero];
    [zero release];
}
```

复制

```js
- (void)reset {
    NSNumber *zero = [NSNumber numberWithInteger:0];
    [self setCount:zero];
}
```

复制

对于简单的情况，我们还可以像下面这样直接操作`_count`变量，但这样做迟早会发生错误（例如，当你忘记`retain`或`release`，或者实例变量的内存管理语义（即属性关键字）发生更改时）。

```js
- (void)reset {
    NSNumber *zero = [[NSNumber alloc] initWithInteger:0];
    [_count release];
    _count = zero;
}
```

复制

另外请注意，如果使用`KVO`，则以这种方式更改变量不会触发`KVO`监听方法。关于`KVO`我做了比较全面的总结，可以参阅[《iOS - 关于 KVO 的一些总结》](https://links.jianshu.com/go?to=https%253A%252F%252Fjuejin.im%252Fpost%252F5e60fd2df265da572d12c8a7)。

#### 不要在初始化方法和 dealloc 中使用访问器方法

你不应该在初始化方法和`dealloc`中使用访问器方法来设置实例变量，而是应该直接操作实例变量。

例如，我们要在初始化 Counter 对象时，初始化它的`count`属性。正确的做法如下：

```js
- init {
    self = [super init];
    if (self) {
        _count = [[NSNumber alloc] initWithInteger:0];
    }
    return self;
}
```

复制

```js
- initWithCount:(NSNumber *)startingCount {
    self = [super init];
    if (self) {
        _count = [startingCount copy];
    }
    return self;
}
```

复制

由于 Counter 类具有实例变量，因此还必须实现`dealloc`方法。在该方法中通过向它们发送`release`消息来放弃任何实例变量的所有权，并在最后调用`super`的实现：

```js
- (void)dealloc {
    [_count release];
    [super dealloc];
}
```

复制

以上是苹果官方的做法。推荐做法如下，在`release`之后再对 _count 赋值`nil`。

>  **备注**： 先解释一下`nil`和`release`的作用：`nil`是将一个对象的指针置为空，只是切断了指针和内存中对象的联系，并没有释放对象内存；而`release`才是真正释放对象内存的操作。 之所以在`release`之后再对 _count 赋值`nil`，是为了防止 _count 在被销毁之后再次被访问而导致`Crash`。 

```js
- (void)dealloc {
    [_count release];
    _count = nil;
    [super dealloc];
}
```

复制

我们也可以在`dealloc`通过`self.count = nil;`一步到位，因为通常它相当于`[_count release];`和`_count = nil;`两步操作。但是苹果说了，不建议我们在`dealloc`中使用访问器方法。

```js
- (void)dealloc {
    self.count = nil;
    [super dealloc];
}
```

复制

>  **Why？**为什么初始化方法中需要`self = [super init]`？

- 先大概解释一下`self`和`super`。`self`是对象指针，指向当前消息接收者。`super`是编译器指令，使用`super`调用方法是从当前消息接收者类的父类中开始查找方法的实现，但消息接收者还是子类。有关`self`和`super`的详细解释可以参阅[《深入浅出 Runtime（四）：super 的本质》](https://links.jianshu.com/go?to=https%253A%252F%252Fjuejin.im%252Fpost%252F5e55106ff265da57480f3c52)。
- 调用`[super init]`，是子类去调用父类的`init`方法，先完成父类的初始化工作。要注意调用过程中，父类的`init`方法中的`self`还是子类。
- 执行`self = [super init]`，如果父类初始化成功，接下来就进行子类的初始化；如果父类初始化失败，则`[super init]`会返回`nil`并赋值给`self`，接下来`if (self)`语句的内容将不被执行，子类的`init`方法也返回`nil`。这样做可以防止因为父类初始化失败而返回了一个不可用的对象。如果你不是这样做，你可能你会得到一个不可用的对象，并且它的行为是不可预测的，最终可能会导致你的程序发生`Crash`。

>  **Why？**为什么不要在初始化方法和 dealloc 中使用访问器方法？

- 在初始化方法和

  ```
  dealloc
  ```

  中，对象的存在与否还不确定，它可能还未初始化完毕，所以给对象发消息可能不会成功，或者导致一些问题的发生。 

  - 进一步解释，假如我们在`init`中使用`setter`方法初始化实例变量。在`init`中，我们会调用`self = [super init]`对父类的东西先进行初始化，即子类先调用父类的`init`方法（注意： 调用的父类的`init`方法中的`self`还是子类对象）。如果父类的`init`中使用`setter`方法初始化实例变量，且子类重写了该`setter`方法，那么在初始化父类的时候就会调用子类的`setter`方法。而此时只是在进行父类的初始化，子类初始化还未完成，所以可能会发生错误。
  - 在销毁子类对象时，首先是调用子类的`dealloc`，最后调用`[super dealloc]`（这与`init`相反）。如果在父类的`dealloc`中调用了`setter`方法且该方法被子类重写，就会调用到子类的`setter`方法，但此时子类已经被销毁，所以这也可能会发生错误。
  - 在**《Effective Objective-C 2.0 编写高质量iOS与OS X代码的52个有效方法》书中的第 31 条 ——  在 dealloc 方法中只释放引用并解除监听** 一文中也提到：在 dealloc 里不要调用属性的存取方法，因为有人可能会覆写这些方法，并于其中做一些无法在回收阶段安全执行的操作。此外，属性可能正处于 “键值观测”（Key-Value Observation，KVO）机制的监控之下，该属性的观察者（observer）可能会在属性值改变时 “保留” 或使用这个即将回收的对象。这种做法会令运行期系统的状态完全失调，从而导致一些莫名其妙的错误。
  - 综上，错误的原因由继承和子类重写访问器方法引起。在初始化方法和 dealloc 中使用访问器方法的话，如果存在继承且子类重写了访问器方法，且在方法中做了一些其它操作，就很有可能发生错误。虽然一般情况下我们可能不会同时满足以上条件而导致错误，但是为了避免错误的发生，我们还是规范编写代码比较好。

- 性能下降。特别是，如果属性是`atomic`的。

- 可能产生副作用。如使用`KVO`的话会触发`KVO`等。

 不过，有些情况我们必须破例。比如：

- 待初始化的实例变量声明在父类中，而我们又无法在子类中访问此实例变量的话，那么我们在初始化方法中只能通过`setter`来对实例变量赋值。

### 使用弱引用来避免 Retain Cycles

`retain`对象会创建对该对象的强引用（即引用计数 +1）。一个对象在`release`它的所有强引用之后（即引用计数 =0）才会`dealloc`。如果两个对象相互`retain`强引用，或者多个对象，每个对象都强引用下一个对象直到回到第一个，就会出现 “`Retain Cycles`（循环引用）” 问题。循环引用会导致它们中的任何对象都无法`dealloc`，就产生了内存泄漏。

举个例子，Document 对象中有一个属性 Page 对象，每个 Page 对象都有一个属性，用于存储它所在的 Document。如果 Document 对象具有对 Page 对象的强引用，并且 Page 对象具有对 Document 对象的强引用，则它们都不能被销毁。

“`Retain Cycles`” 问题的解决方案是使用弱引用。弱引用是非持有关系，对象`do not retain`它引用的对象。

>  在`MRC`中，这里的 “弱引用” 是指`do not retain`，而不是`ARC`中的`weak`。 

但是，为了保持对象图完好无损，必须在某处有强引用（如果只有弱引用，则 Page 对象和 Paragraph 对象可能没有任何所有者，因此将被销毁）。因此，Cocoa 建立了一个约定，即父对象应该对其子对象保持强引用（`retain`），而子对象应该对父对象保持弱引用（`do not retain`）。

因此，Document 对象具有对其 Page 对象的强引用，但 Page 对象对 Document 对象是弱引用，如下图所示：

![img](https://ask.qcloudimg.com/http-save/7220648/9m512uw474.png?imageView2/2/w/2560/h/7000)

Cocoa 中弱引用的示例包括但不限于 table data sources、outline view items、notification observers 以及其他 targets 和 delegates。

当你向只持有弱引用的对象发送消息时，需要小心。如果在对象销毁后向其发送消息就会`Crash`。你必须定义好什么时候对象是有效的。在大多数情况下，弱引用对象知道其它对象对它的弱引用，就像循环引用的情况一样，你要负责在弱引用对象销毁时通知其它对象。例如，当你向通知中心注册对象时，通知中心会存储对该对象的弱引用，并在发布相应的通知时向其发送消息。在对象要销毁时，你需要在通知中心注销它，以防止通知中心向已销毁的对象发送消息。同样，当 delegate 对象销毁时，你需要向委托对象发送`setDelegate: nil`消息来删除 delegate 引用。这些消息通常在对象的 dealloc 方法中发送。

### 避免导致你正在使用的对象被销毁

Cocoa 的所有权策略指定，对象作为方法参数传入，其在调用的方法的整个范围内保持有效，也可以作为方法的返回值返回，而不必担心它被释放。对于应用程序来说，对象的 getter 方法返回缓存的实例变量或计算值并不重要。重要的是对象在你需要的时间内保持有效。

此规则偶尔会有例外情况，主要分为两类。

1. 从一个基本集合类中删除对象时。

```js
    heisenObject = [array objectAtIndex:n];
    [array removeObjectAtIndex:n];
    // heisenObject could now be invalid.
```

复制

当一个对象从一个基本集合类中移除时，它将被发送一条`release`（而不是`autorelease`）消息。如果集合是移除对象的唯一所有者，则移除的对象（示例中的 heisenObject）将立即被销毁。

1. 当 “父对象” 被销毁时。

```js
    id parent = <#create a parent object#>;
    // ...
    heisenObject = [parent child] ;
    [parent release]; // Or, for example: self.parent = nil;
    // heisenObject could now be invalid.
```

复制

在某些情况下，你通过父对象获得子对象，然后直接或间接`release`父对象。如果`release`父对象导致它被销毁，并且父对象是子对象的唯一所有者，则子对象（示例中的 heisenObject）将同时被销毁（假设在父对象的`dealloc`方法中，子对象被发送一个`release`而不是一个`autorelease`消息）。

为了防止这些情况发生，在得到 heisenObject 时`retain`它，并在完成后`release`它。例如：

```js
    heisenObject = [[array objectAtIndex:n] retain];
    [array removeObjectAtIndex:n];
    // Use heisenObject...
    [heisenObject release];
```

复制

### 不要使用 dealloc 来管理稀缺资源

你通常不应该在`dealloc`方法中管理稀缺资源，如文件描述符，网络连接和缓冲区或缓存等。特别是，你不应该设计类，以便在你想让系统调用`dealloc`时就调用它。由于`bug`或应用程序崩溃，`dealloc`的调用可能会被延迟或未调用。

相反，如果你有一个类的实例管理稀缺的资源，你应该在你不再需要这些资源时让该实例释放这些资源。然后，你通常会`release`该实例，紧接着它`dealloc`。如果该实例的`dealloc`没有被及时调用或者未调用，你也不会遇到稀缺资源不被及时释放或者未释放的问题，因为此前你已经释放了资源。

如果你尝试在`dealloc`上进行资源管理，则可能会出现问题。例如：

1. 依赖对象图的释放机制。 对象图的释放机制本质上是无序的。尽管通常你希望可以按照特定的顺序释放，但是会让程序变得很脆弱。如果对象被`autorelease`而不是`release`，则释放顺序可能会改变，这可能会导致意外的结果。
2. 不回收稀缺资源。 内存泄漏是应该被修复的`bug`，但它们通常不会立即致命。然而，如果在你希望释放稀缺资源时没有释放，则可能会遇到更严重的问题。例如，如果你的应用程序用完了文件描述符，则用户可能无法保存数据。
3. 释放资源的操作被错误的线程执行。 如果一个对象在一个意外的时间调用了`autorelease`，它将在它碰巧进入的任何一个线程的自动释放池块中被释放。对于只能从一个线程触及的资源来说，这很容易致命。

### 集合持有它们包含的对象

将对象添加到集合（例如`array`，`dictionary`或`set`）时，集合将获得对象的所有权。当从集合中移除对象或集合本身被销毁时，集合将放弃对象的所有权。因此，例如，如果要创建一个存储`numbers`的数组，可以执行以下任一操作：

```js
    NSMutableArray *array = <#Get a mutable array#>;
    NSUInteger i;
    // ...
    for (i = 0; i < 10; i++) {
        NSNumber *convenienceNumber = [NSNumber numberWithInteger:i];
        [array addObject:convenienceNumber];
    }
```

复制

在这种情况下，`NSNumber`对象不是通过`alloc`等创建，因此无需调用`release`。也不需要对`NSNumber`对象进行`retain`，因为数组会这样做。

```js
    NSMutableArray *array = <#Get a mutable array#>;
    NSUInteger i;
    // ...
    for (i = 0; i < 10; i++) {
        NSNumber *allocedNumber = [[NSNumber alloc] initWithInteger:i];
        [array addObject:allocedNumber];
        [allocedNumber release];
    }
```

复制

在这种情况下，你就需要对`NSNumber`对象进行`release`。数组会在`addObject:`时对`NSNumber`对象进行`retain`，因此在数组中它不会被销毁。

要理解这一点，可以站在实现集合类的人的角度。你要确保在集合中它们不会被销毁，所以你在它们添加进集合时给它们发送一个`retain`消息。如果删除了它们，则必须给它们发送一个`release`消息。在集合的`dealloc`方法中，应该向集合中所有剩余的对象发送一条`release`消息。

### 所有权策略是通过使用 Retain Counts 实现的

所有权策略通过引用计数实现的，引用计数也称为“`retain count`”。每个对象都有一个`retain count`。

- 创建对象时，其`retain count`为 1。
- 向对象发送`retain`消息时，其`retain count`将 +1。
- 向对象发送`release`消息时，其`retain count`将 -1。
- 向对象发送`autorelease`消息时，其`retain count`在当前自动释放池块结束时 -1。
- 如果对象的`retain count`减少到 0，它将`dealloc`。

>  **重要提示：** 不应该显式询问对象的`retain count`是多少。结果往往会产生误导，因为你可能不知道哪些系统框架对象`retain`了你关注的对象。在调试内存管理问题时，你只需要遵守内存管理规则就行了。 **备注：** 关于这些方法的具体实现，请参阅`《iOS - 老生常谈内存管理（四）：源码分析内存管理方法》`。 

## 使用 Autorelease Pool Blocks

自动释放池块提供了一种机制，让你可以放弃对象的所有权，但避免立即释放它（例如从方法返回对象时）。通常，你不需要创建自己的自动释放池块，但在某些情况下，你必须这样做或者这样做是有益的。

### 关于 Autorelease Pool Blocks

Autorelease Pool Blocks 使用`@autoreleasepool`标记，示例如下：

```js
    @autoreleasepool {
        // Code that creates autoreleased objects.
    }
```

复制

在`@autoreleasepool`的末尾，在块中接收到`autorelease`消息的对象将被发送一条`release`消息。对象在块内每接收一次`autorelease`消息，就会被发送一条`release`消息。

 与任何其他代码块一样，`@autoreleasepool`可以嵌套，但是你通常不会这样做。

```js
    @autoreleasepool {
        // . . .
        @autoreleasepool {
            // . . .
        }
        . . .
    }
```

复制

在`MRC`下还可以使用`NSAutoreleasePool`创建自动释放池。不过建议使用`@autoreleasepool`，苹果说它比`NSAutoreleasePool`快大约六倍。

```js
    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    // Code benefitting from a local autorelease pool.
    [pool release]; // [pool drain]
```

复制

Cocoa 总是希望代码在`@autoreleasepool`中执行，否则`autorelease`对象不会被`release`，导致内存泄漏。如果你在`@autoreleasepool`之外发送`autorelease`消息，Cocoa 会打印一个合适的错误消息。AppKit 和 UIKit 框架会在`RunLoop`每次事件循环迭代中创建并处理`@autoreleasepool`，因此，你通常不必自己创建`@autoreleasepool`，甚至不需要知道创建`@autoreleasepool`的代码怎么写。

但是，有三种情况可能会使用你自己的`@autoreleasepool`：

- ① 如果你编写的程序不是基于 UI 框架的，比如说[命令行工具](https://cloud.tencent.com/product/cli?from=20065&from_column=20065)；
- ② 如果你编写的循环中创建了大量的临时对象； 你可以在循环内使用`@autoreleasepool`在每次循环结束时销毁这些对象。这样可以减少应用程序的最大内存占用。
- ③ 如果你创建了辅助线程。 一旦线程开始执行，就必须创建自己的`@autoreleasepool`；否则，你的应用程序将存在内存泄漏。（有关详细信息，请参阅`《Autorelease Pool Blocks 和线程》`章节。

>  关于`@autoreleasepool`的底层原理，可以参阅[《iOS - 聊聊 autorelease 和 @autoreleasepool》](https://links.jianshu.com/go?to=https%253A%252F%252Fjuejin.im%252Fpost%252F5e6fac36e51d4526e75003ef)。 

### 使用 Local Autorelease Pool Blocks 来减少峰值内存占用量

许多程序创建`autorelease`的临时对象。这些对象将添加到程序的内存占用空间，直到块结束。在许多情况下，允许临时对象累积直到当前事件循环迭代结束时，而不会导致过多的开销。但是，在某些情况下，你可能会创建大量临时对象，这些对象会大大增加内存占用，并且你希望更快地销毁这些对象。在这时候，你就可以创建自己的`@autoreleasepool`。在块结束时，临时对象被`release`，这可以让它们尽快`dealloc`，从而减少程序的内存占用。

以下示例演示了如何在 for 循环中使用 local autorelease pool block。

```js
    NSArray *urls = <# An array of file URLs #>;
    for (NSURL *url in urls) {
 
        @autoreleasepool {
            NSError *error;
            NSString *fileContents = [NSString stringWithContentsOfURL:url
                                             encoding:NSUTF8StringEncoding error:&error];
            /* Process the string, creating and autoreleasing more objects. */
        }
    }
```

复制

for 循环一次处理一个文件。在`@autoreleasepool`内发送`autorelease`消息的任何对象（例如 fileContents）在块结束时`release`。

在`@autoreleasepool`之后，你应该将块中任何`autorelease`对象视为 “已销毁”。不要向该对象发送消息或将其返回给你的方法调用者。如果你需要某个`autorelease`的临时对象在`@autoreleasepool`结束之后依然可用，可以通过在块内对该对象发送`retain`消息，然后在块之后将对其发送`autorelease`，如下示例所示：

```js
– (id)findMatchingObject:(id)anObject {
 
    id match;
    while (match == nil) {
        @autoreleasepool {
 
            /* Do a search that creates a lot of temporary objects. */
            match = [self expensiveSearchForObject:anObject];
 
            if (match != nil) {
                [match retain]; /* Keep match around. */
            }
        }
    }
 
    return [match autorelease];   /* Let match go and return it. */
}
```

复制

在`@autoreleasepool`中给`match`对象发送一条`retain`消息，并在`@autoreleasepool`之后给其发送一条`autorelease`消息，延长了`match`对象的生命周期，允许它在`while`循环外接收消息，并且可以返回给`findMatchingObject:`方法的调用方。

### Autorelease Pool Blocks 和线程

Cocoa 应用程序中的每个线程都维护自己的 autorelease pool blocks 栈。如果你写的是一个仅基于 Foundation 的程序或者如果你使用子线程，则需要创建自己的`@autoreleasepool`。

 如果你的应用程序或线程长期存在并且可能会产生大量的`autorelease`对象，则应使用`@autoreleasepool`（如 AppKit 和 UIKit 就在主线程创建了`@autoreleasepool`）；否则，`autorelease`对象会不断累积，导致你的内存占用量不断增加。如果你在子线程上没有进行 Cocoa 调用，则不需要使用`@autoreleasepool`。

>  **注意：** 如果你使用`pthread`（`POSIX thread`）而不是使用`NSThread`创建子线程，那么你就不能使用 Cocoa 除非 Cocoa 处于多线程模式。Cocoa 只有在`detach`它的第一个`NSThread`对象之后才会进入多线程模式。要想在`pthread`创建的子线程上使用 Cocoa，你的应用程序必须先`detach`至少一个可以立即退出的`NSThread`对象。你可以使用`NSThread`的类方法`isMultiThreaded`测试 Cocoa 是否处于多线程模式。



## 内存管理（三）：ARC 面世



## 前言

 `ARC`全称`Automatic Reference Counting`，自动引用计数内存管理，是苹果在 iOS 5、OS X Lion 引入的新的内存管理技术。`ARC`是一种编译器功能，它通过`LLVM`编译器和`Runtime`协作来进行自动管理内存。`LLVM`编译器会在编译时在合适的地方为 OC 对象插入`retain`、`release`和`autorelease`代码来自动管理对象的内存，省去了在`MRC`手动引用计数下手动插入这些代码的工作，减轻了开发者的工作量，让开发者可以专注于应用程序的代码、对象图以及对象间的关系上。   本文通过讲解`MRC`到`ARC`的转变、`ARC`规则以及使用注意，来帮助大家掌握`iOS`的内存管理。   下图是苹果官方文档给出的从`MRC`到`ARC`的转变。

![img](https://ask.qcloudimg.com/http-save/7220648/pwjejvzedm.png?imageView2/2/w/2560/h/7000)

## 摘要

`ARC`的工作原理是在编译时添加相关代码，以确保对象能够在必要时存活，但不会一直存活。从概念上讲，它通过为你添加适当的内存管理方法调用来遵循与`MRC`相同的内存管理规则。

为了让编译器生成正确的代码，`ARC`限制了一些方法的使用以及你使用桥接(`toll-free bridging`)的方式，请参阅`《Managing Toll-Free Bridging》`章节。`ARC`还为对象引用和属性声明引入了新的生命周期修饰符。

`ARC`在`Xcode 4.2 for OS X v10.6 and v10.7 (64-bit applications)`以及`iOS 4 and iOS 5`应用程序中提供支持。但`OS X v10.6 and iOS 4`不支持`weak`弱引用。

Xcode 提供了一个[迁移工具](https://cloud.tencent.com/product/msp?from=20065&from_column=20065)，可以自动将`MRC`代码转换为`ARC`代码（如删除`retain`和`release`调用），而不用重新再创建一个项目（选择 Edit > Convert > To Objective-C ARC）。迁移工具会将项目中的所有文件转换为使用`ARC`的模式。如果对于某些文件使用`MRC`更方便的话，你可以选择仅在部分文件中使用`ARC`。

## ARC 概述

`ARC`会分析对象的生存期需求，并在编译时自动插入适当的内存管理方法调用的代码，而不需要你记住何时使用`retain`、`release`、`autorelease`方法。编译器还会为你生成合适的`dealloc`方法。一般来说，如果你使用`ARC`，那么只有在需要与使用`MRC`的代码进行交互操作时，传统的 Cocoa 命名约定才显得重要。

Person 类的完整且正确的实现可能如下所示：

```javascript
@interface Person : NSObject
@property NSString *firstName;
@property NSString *lastName;
@property NSNumber *yearOfBirth;
@property Person *spouse;
@end
 
@implementation Person
@end
```

复制

（默认情况下，对象属性是`strong`。关于`strong`请参阅`《所有权修饰符》`章节。）

使用`ARC`，你可以这样实现 contrived 方法，如下所示：

```javascript
- (void)contrived {
    Person *aPerson = [[Person alloc] init];
    [aPerson setFirstName:@"William"];
    [aPerson setLastName:@"Dudney"];
    [aPerson setYearOfBirth:[[NSNumber alloc] initWithInteger:2011]];
    NSLog(@"aPerson: %@", aPerson);
}
```

复制

`ARC`会负责内存管理，因此 Person 和 NSNumber 对象都不会泄露。

你还可以这样安全地实现 Person 的 takeLastNameFrom: 方法，如下所示：

```javascript
- (void)takeLastNameFrom:(Person *)person {
    NSString *oldLastname = [self lastName];
    [self setLastName:[person lastName]];
    NSLog(@"Lastname changed from %@ to %@", oldLastname, [self lastName]);
}
```

复制

`ARC`会确保在 NSLog 语句之前不释放 oldLastName 对象。

### ARC 实施新规则

`ARC`引入了一些在使用其他编译器模式时不存在的新规则。这些规则旨在提供完全可靠的内存管理模型。有时候，它们直接地带来了最好的实践体验，也有时候它们简化了代码，甚至在你丝毫没有关注内存管理问题的时候帮你解决了问题。在`ARC`下必须遵守以下规则，如果违反这些规则，就会编译错误。

- 不能使用 retain / release / retainCount / autorelease
- 不能使用 NSAllocateObject / NSDeallocateObject
- 须遵守内存管理的方法命名规则
- 不能显式调用 dealloc
- 使用 @autoreleasepool 块替代 NSAutoreleasePool
- 不能使用区域（NSZone）
- 对象型变量不能作为 C 语言结构体（struct / union）的成员
- 显式转换 “id” 和 “void *” —— 桥接

#### 不能使用 retain / release / retainCount / autorelease

在`ARC`下，禁止开发者手动调用这些方法，也禁止使用`@selector(retain)`，`@selector(release)`等，否则编译不通过。但你仍然可以对 Core Foundation 对象使用`CFRetain`、`CFRelease`等相关函数（请参阅`《Managing Toll-Free Bridging》`章节）。

#### 不能使用 NSAllocateObject / NSDeallocateObject

在`ARC`下，禁止开发者手动调用这些函数，否则编译不通过。 你可以使用`alloc`创建对象，而`Runtime`会负责`dealloc`对象。

#### 须遵守内存管理的方法命名规则

在`MRC`下，通过 `alloc / new / copy / mutableCopy` 方法创建对象会直接持有对象，我们定义一个 “创建并持有对象” 的方法也必须以 `alloc / new / copy / mutableCopy` 开头命名，并且必须返回给调用方所应当持有的对象。如果在`ARC`下需要与使用`MRC`的代码进行交互，则也应该遵守这些规则。

为了允许与`MRC`代码进行交互操作，`ARC`对方法命名施加了约束： 访问器方法的方法名不能以`new`开头。这意味着你不能声明一个名称以`new`开头的属性，除非你指定一个不同的`getterName`：

```javascript
// Won't work:
@property NSString *newTitle;
 
// Works:
@property (getter = theNewTitle) NSString *newTitle;
```

复制

#### 不能显式调用 dealloc

无论在`MRC`还是`ARC`下，当对象引用计数为 0，系统就会自动调用`dealloc`方法。大多数情况下，我们会在`dealloc`方法中移除通知或观察者对象等。

在`MRC`下，我们可以手动调用`dealloc`。但在`ARC`下，这是禁止的，否则编译不通过。

在`MRC`下，我们实现`dealloc`，必须在实现末尾调用`[super dealloc]`。

```javascript
// MRC
- (void)dealloc
{
    // 其他处理
    [super dealloc];
}
```

复制

而在`ARC`下，`ARC`会自动对此处理，因此我们不必也禁止写`[super dealloc]`，否则编译错误。

```javascript
// ARC
- (void)dealloc
{
    // 其他处理
    [super dealloc]; // 编译错误：ARC forbids explicit message send of 'dealloc'
}
```

复制

#### 使用 @autoreleasepool 块替代 NSAutoreleasePool

在`ARC`下，自动释放池应使用`@autoreleasepool`，禁止使用`NSAutoreleasePool`，否则编译错误。

```javascript
NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init]; 
```

复制

```javascript
error：'NSAutoreleasePool' is unavailable: not available in automatic reference counting mode
```

复制

>  关于`@autoreleasepool`的原理，可以参阅[《iOS - 聊聊 autorelease 和 @autoreleasepool》](https://links.jianshu.com/go?to=https%3A%2F%2Fjuejin.im%2Fpost%2F5e6fac36e51d4526e75003ef)。 

#### 不能使用区域（NSZone）

对于现在的运行时系统（编译器宏 __ OBJC2 __ 被设定的环境），不管是`MRC`还是`ARC`下，区域（NSZone）都已单纯地被忽略。

>  **NSZone** 《Objective-C 高级编程：iOS 与 OS X 多线程和内存管理》书中对 NSZone 做了如下介绍：  NSZone 是为防止内存碎片化而引入的结构。对内存分配的区域本身进行多重化管理，根据使用对象的目的、对象的大小分配内存，从而提高了内存管理的效率。 但是，现在的运行时系统已经忽略了区域的概念。运行时系统中的内存管理本身已极具效率，使用区域来管理内存反而会引起内存使用效率低下以及源代码复杂化等问题。 下图是使用多重区域防止内存碎片化的例子：     

![img](https://ask.qcloudimg.com/http-save/7220648/lra2imun85.png?imageView2/2/w/2560/h/7000)

#### 对象型变量不能作为 C 语言结构体（struct / union）的成员

C 语言的结构体（struct / union）成员中，如果存在 Objective-C 对象型变量，便会引起编译错误。

>  **备注：** 我使用的时候编译通过，难道编译器优化了吗？ 

```javascript
struct Data {
    NSMutableArray *mArray;
};
```

复制

```javascript
error：ARC forbids Objective-C objs in struct or unions NSMutableArray *mArray;
```

复制

虽然是 LLVM 编译器 3.0，但不论怎样，C 语言的规约上没有方法来管理结构体成员的生存周期。因为`ARC`把内存管理的工作分配给编译器，所以编译器必须能够知道并管理对象的生存周期。例如 C 语言的自动变量（局部变量）可使用该变量的作用域管理对象。但是对于 C 语言的结构体成员来说，这在标准上就是不可实现的。因此，必须要在结构体释放之前将结构体中的对象类型的成员释放掉，但是编译器并不能可靠地做到这一点，所以对象型变量不能作为 C 语言结构体的成员。

这个问题有以下三种解决方案：

- ① 使用 Objective-C 对象替代结构体。这是最好的解决方案。

如果你还是坚持使用结构体，并把对象型变量加入到结构体成员中，可以使用以下两种方案：

- ② 将 Objective-C 对象通过`Toll-Free Bridging`强制转换为`void *`类型，请参阅`《Managing Toll-Free Bridging》`章节。
- ③ 对 Objective-C 对象附加`__unsafe_unretained`修饰符。

```javascript
struct Data {
    NSMutableArray __unsafe_unretained *mArray;
};
```

复制

附有`__unsafe_unretained`修饰符的变量不属于编译器的内存管理对象。如果管理时不注意赋值对象的所有者，便有可能遭遇内存泄漏或者程序崩溃。这点在使用时应多加注意。

```javascript
struct x { NSString * __unsafe_unretained S; int X; }
```

复制

`__unsafe_unretained`指针在对象被销毁后是不安全的，但它对诸如字符串常量之类的从一开始就确定永久存活的对象非常有用。

#### 显式转换 “id” 和 “void *” —— 桥接

在`MRC`下，我们可以直接在 `id` 和 `void *` 变量之间进行强制转换。

```javascript
    id obj = [[NSObject alloc] init];
    void *p = obj;
    id o = p;
    [o release];
```

复制

但在`ARC`下，这样会引起编译报错：在`Objective-C`指针类型`id`和`C`指针类型`void *`之间进行转换需要使用`Toll-Free Bridging`，请参阅`《Managing Toll-Free Bridging》`章节。

```javascript
    id obj = [[NSObject alloc] init];
    void *p = obj; // error：Implicit conversion of Objective-C pointer type 'id' to C pointer type 'void *' requires a bridged cast
    id o = p;      // error：Implicit conversion of C pointer type 'void *' to Objective-C pointer type 'id' requires a bridged cast
    [o release];   // error：'release' is unavailable: not available in automatic reference counting mode
```

复制

### 所有权修饰符

`ARC`为对象引入了几个新的生命周期修饰符（我们称为 “所有权修饰符”）以及弱引用功能。弱引用`weak`不会延长它指向的对象的生命周期，并且该对象没有强引用（即`dealloc`）时自动置为`nil`。 你应该利用这些修饰符来管理程序中的对象图。特别是，`ARC`不能防止强引用循环（以前称为`Retain Cycles`，请参阅`《从 MRC 说起 —— 使用弱引用来避免 Retain Cycles》`章节）。明智地使用弱引用`weak`将有助于确保你不会创建循环引用。

#### 属性关键字

`ARC`中引入了新的属性关键字`strong`和`weak`，如下所示：

```javascript
// 以下声明同：@property(retain) MyClass *myObject;
@property(strong) MyClass *myObject;
 
// 以下声明类似于：@property（assign）MyClass *myObject；
// 不同的是，如果 MyClass 实例被释放，属性值赋值为 nil，而不像 assign 一样产生悬垂指针。
@property(weak) MyClass *myObject;
```

复制

`strong`和`weak`属性关键字分别对应`__strong`和`__weak`所有权修饰符。在`ARC`下，`strong`是对象类型的属性的默认关键字。

在`ARC`中，对象类型的变量都附有所有权修饰符，总共有以下 4 种。

```javascript
__strong
__weak
__unsafe_unretained
__autoreleasing
```

复制

-  `__strong`是默认修饰符。只要有强指针指向对象，对象就会保持存活。
-  `__weak`指定一个不使引用对象保持存活的引用。当一个对象没有强引用时，弱引用`weak`会自动置为`nil`。
-  `__unsafe_unretained`指定一个不使引用对象保持存活的引用，当一个对象没有强引用时，它不会置为`nil`。如果它引用的对象被销毁，就会产生悬垂指针。
-  `__autoreleasing`用于表示通过引用（`id *`）传入，并在返回时（`autorelease`）自动释放的参数。

在对象变量的声明中使用所有权修饰符时，正确的格式为：

```javascript
    ClassName * qualifier variableName;
```

复制

例如：

```javascript
    MyClass * __weak myWeakReference;
    MyClass * __unsafe_unretained myUnsafeReference;
```

复制

其它格式在技术上是不正确的，但编译器会 “原谅”。也就是说，以上才是标准写法。

#### __strong

`__strong`修饰符为强引用，会持有对象，使其引用计数 +1。该修饰符是对象类型变量的默认修饰符。如果我们没有明确指定对象类型变量的所有权修饰符，其默认就为`__strong`修饰符。

```javascript
    id obj = [NSObject alloc] init];
    // -> id __strong obj = [NSObject alloc] init];
```

复制

#### __weak

如果单单靠`__strong`完成内存管理，那必然会发生循环引用的情况造成内存泄漏，这时候`__weak`就出来解决问题了。 `__weak`修饰符为弱引用，不会持有对象，对象的引用计数不会增加。`__weak`可以用来防止循环引用。

以下单纯地使用`__weak`修饰符修饰变量，编译器会给出警告，因为`NSObject`的实例创建出来没有强引用，就会立即释放。

```javascript
    id __weak weakObj = [[NSObject alloc] init]; // ⚠️Assigning retained object to weak variable; object will be released after assignment
    NSLog(@"%@", obj);
    //  (null)
```

复制

以下`NSObject`的实例已有强引用，再赋值给`__weak`修饰的变量就不会有警告了。

```javascript
    id __strong strongObj = [[NSObject alloc] init];
    id __weak weakObj = strongObj;
```

复制

当对象被`dealloc`时，指向该对象的`__weak`变量会被赋值为`nil`。（具体的执行过程请参阅：`《iOS - 老生常谈内存管理（四）：源码分析内存管理方法》`）

>  **备注：**`__weak`仅在`ARC`中才能使用，在`MRC`中是使用`__unsafe_unretained`修饰符来代替。 

#### __unsafe_unretained

`__unsafe_unretained`修饰符的特点正如其名所示，不安全且不会持有对象。

>  **注意：**尽管`ARC`内存管理是编译器的工作，但是附有`__unsafe_unretained`修饰符的变量不属于编译器的内存管理对象。这一点在使用时要注意。 

“不会持有对象” 这一特点使它和`__weak`的作用相似，可以防止循环引用。 “不安全“ 这一特点是它和`__weak`的区别，那么它不安全在哪呢？

我们来看代码：

```javascript
    id __weak weakObj = nil;
    id __unsafe_unretained uuObj = nil;
    {
        id __strong strongObj = [[NSObject alloc] init];
        weakObj = strongObj;
        unsafeUnretainedObj = strongObj;
        NSLog(@"strongObj:%@", strongObj);
        NSLog(@"weakObj:%@", weakObj);
        NSLog(@"unsafeUnretainedObj:%@", unsafeUnretainedObj);
    }
    NSLog(@"-----obj dealloc-----");
    NSLog(@"weakObj:%@", weakObj);
    NSLog(@"unsafeUnretainedObj:%@", unsafeUnretainedObj); // Crash:EXC_BAD_ACCESS

/*
strongObj:<NSObject: 0x6000038f4340>
weakObj:<NSObject: 0x6000038f4340>
unsafeUnretainedObj:<NSObject: 0x6000038f4340>
-----obj dealloc-----
weakObj:(null)
(lldb) 
*/
```

复制

以上代码运行崩溃`EXC_BAD_ACCESS`。原因是`__unsafe_unretained`修饰的对象在被销毁之后，指针仍然指向原对象地址，我们称它为 “悬垂指针”。这时候如果继续通过指针访问原对象的话，就会导致`Crash`。而`__weak`修饰的对象在被释放之后，会将指向该对象的所有`__weak`指针变量全都置为`nil`。这就是`__unsafe_unretained`不安全的原因。所以，在使用`__unsafe_unretained`修饰符修饰的对象时，需要确保它未被销毁。

>  **Q：** 既然 __weak 更安全，那么为什么已经有了 __weak 还要保留 __unsafe_unretained ？ 

-  `__weak`仅在`ARC`中才能使用，而`MRC`只能使用`__unsafe_unretained`；
-  `__unsafe_unretained`主要跟 C 代码交互；
-  `__weak`对性能会有一定的消耗，当一个对象`dealloc`时，需要遍历对象的`weak`表，把表里的所有`weak`指针变量值置为`nil`，指向对象的`weak`指针越多，性能消耗就越多。所以`__unsafe_unretained`比`__weak`快。当明确知道对象的生命周期时，选择`__unsafe_unretained`会有一些性能提升。  A 持有 B 对象，当 A 销毁时 B 也销毁。这样当 B 存在，A 就一定会存在。而 B 又要调用 A 的接口时，B 就可以存储 A 的`__unsafe_unretained`指针。 比如，MyViewController 持有 MyView，MyView 需要调用 MyViewController 的接口。MyView 中就可以存储`__unsafe_unretained MyViewController *_viewController`。  虽然这种性能上的提升是很微小的。但当你很清楚这种情况下，`__unsafe_unretained`也是安全的，自然可以快一点就是一点。而当情况不确定的时候，应该优先选用`__weak`。

#### __autoreleasing

##### 自动释放池

首先讲一下自动释放池，在`ARC`下已经禁止使用`NSAutoreleasePool`类创建自动释放池，而用`@autoreleasepool`替代。

-  `MRC`下可以使用`NSAutoreleasePool`或者`@autoreleasepool`。建议使用`@autoreleasepool`，苹果说它比`NSAutoreleasePool`快大约六倍。

```javascript
    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    // Code benefitting from a local autorelease pool.
    [pool release]; // [pool drain]
```

复制

>  **Q：** 释放`NSAutoreleasePool`对象，使用`[pool release]`与`[pool drain]`的区别？  Objective-C 语言本身是支持 GC 机制的，但有平台局限性，仅限于 MacOS 开发中，iOS 开发用的是 RC 机制。在 iOS 的 RC 环境下`[pool release]`和`[pool drain]`效果一样，但在 GC 环境下`drain`会触发 GC 而`release`不做任何操作。使用`[pool drain]`更佳，一是它的功能对系统兼容性更强，二是这样可以跟普通对象的`release`区别开。（注意：苹果在引入`ARC`时称，已在 OS X Mountain Lion v10.8 中弃用`GC`机制，而使用`ARC`替代） 

-  `ARC`下只能使用`@autoreleasepool`。

```javascript
    @autoreleasepool {
        // Code benefitting from a local autorelease pool.
    }
```

复制

>  关于`@autoreleasepool`的底层原理，可以参阅[《iOS - 聊聊 autorelease 和 @autoreleasepool》](https://links.jianshu.com/go?to=https%3A%2F%2Fjuejin.im%2Fpost%2F5e6fac36e51d4526e75003ef)。 

##### __autoreleasing 使用

在`MRC`中我们可以给对象发送`autorelease`消息来将它注册到`autoreleasepool`中。而在`ARC`中`autorelease`已禁止调用，我们可以使用`__autoreleasing`修饰符修饰对象将对象注册到`autoreleasepool`中。

```javascript
    @autoreleasepool {
        id __autoreleasing obj = [[NSObject alloc] init];
    }
```

复制

以上代码在`MRC`中等价于:

```javascript
    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    id obj = [[NSObject alloc] init];
    [obj autorelease];
    [pool drain];
    // 或者
    @autoreleasepool {
        id obj = [[NSObject alloc] init];
        [obj autorelease];
    }
```

复制

##### __autoreleasing 是二级指针类型的默认修饰符

前面我们说过，对象指针的默认所有权修饰符是`__strong`。 而二级指针类型（`ClassName **`或`id *`）的默认所有权修饰符是`__autoreleasing`。如果我们没有明确指定二级指针类型的所有权修饰符，其默认就会附加上`__autoreleasing`修饰符。

比如，我们经常会在开发中使用到`NSError`打印错误信息，我们通常会在方法的参数中传递`NSError`对象的指针。如`NSString`的`stringWithContentsOfFile`类方法，其参数`NSError **`使用的是`__autoreleasing`修饰符。

```javascript
    NSString *str = [NSString stringWithContentsOfFile:<#(nonnull NSString *)#>
                                              encoding:<#(NSStringEncoding)#> 
                                              error:<#(NSError *__autoreleasing  _Nullable * _Nullable)#>];
```

复制

示例：我们声明一个参数为`NSError **`的方法，但不指定其所有权修饰符。

```javascript
- (BOOL)performOperationWithError:(NSError **)error;
```

复制

接着我们尝试调用该方法，发现智能提示中的参数`NSError **`附有`__autoreleasing`修饰符。可见，如果我们没有明确指定二级指针类型的所有权修饰符，其默认就会附加上`__autoreleasing`修饰符。

```javascript
    NSError *error = nil;
    BOOL result = [self performOperationWithError:<#(NSError *__autoreleasing *)#>];
```

复制

##### 注意

需要注意的是，赋值给二级指针类型时，所有权修饰符必须一致，否则会编译错误。

```javascript
    NSError *error = nil;
    NSError **error1 = &error;                 // error：Pointer to non-const type 'NSError *' with no explicit ownersh
    NSError *__autoreleasing *error2 = &error; // error：Initializing 'NSError *__autoreleasing *' with an expression of type 'NSError *__strong *' changes retain/release properties of pointer
    NSError *__weak *error3 = &error;          // error：Initializing 'NSError *__weak *' with an expression of type 'NSError *__strong *' changes retain/release properties of pointer
    NSError *__strong *error4 = &error;        // 编译通过
```

复制

```javascript
    NSError *__weak error = nil;
    NSError *__weak *error1 = &error;          // 编译通过
```

复制

```javascript
    NSError *__autoreleasing error = nil;
    NSError *__autoreleasing *error1 = &error; // 编译通过
```

复制

我们前面说过，二级指针类型的默认修饰符是`__autoreleasing`。那为什么我们调用方法传入`__strong`修饰的参数就可以编译通过呢？

```javascript
    NSError *__strong error = nil;
    BOOL result = [self performOperationWithError:<#(NSError *__autoreleasing *)#>];
```

复制

其实，编译器自动将我们的代码转化成了以下形式：

```javascript
    NSError *__strong error = nil;
    NSError *__autoreleasing tmp = error;
    BOOL result = [self performOperationWithError:&tmp];
    error = tmp;
```

复制

可见，当局部变量声明（`__strong`）和参数（`__autoreleasing`）之间不匹配时，会导致编译器创建临时变量。你可以将显示地指定局部变量所有权修饰符为`__autoreleasing`或者不显式指定（因为其默认就为`__autoreleasing`），或者显示地指定参数所有权修饰符为`__strong`，来避免编译器创建临时变量。

```javascript
- (BOOL)performOperationWithError:(NSError *__strong *)error;
```

复制

但是在`MRC`引用计数内存管理规则中：使用`alloc/new/copy/mutableCopy`等方法创建的对象，创建并持有对象；其他情况创建对象但并不持有对象。为了在使用参数获得对象时，遵循此规则，我们应该指定二级指针类型参数修饰符为`__autoreleasing`。

在`《从 MRC 说起 —— 你不持有通过引用返回的对象》`章节中也说到，Cocoa 中的一些方法指定通过引用返回对象（即，它们采用`ClassName **`或`id *`类型的参数），常见的就是使用`NSError`对象。当你调用这些方法时，你不会创建该`NSError`对象，因此你不持有该对象，也无需释放它。而`__strong`代表持有对象，因此应该使用`__autoreleasing`。

另外，我们在显示指定`__autoreleasing`修饰符时，必须注意对象变量要为自动变量（包括局部变量、函数以及方法参数），否则编译不通过。

```javascript
    static NSError __autoreleasing *error = nil; // Global variables cannot have __autoreleasing ownership
```

复制

#### 使用所有权修饰符来避免循环引用

前面已经说过`__weak`和`__unsafe_unretained`修饰符可以用来循环引用，这里再来啰嗦几句。

如果两个对象互相强引用，就产生了循环引用，导致两个对象都不能被销毁，内存泄漏。或者多个对象，每个对象都强引用下一个对象直到回到第一个，产生大环循环引用，这些对象也均不能被销毁。

>  在`ARC`中，“循环引用” 是指两个对象都通过`__strong`持有对方。 

解决 “循环引用” 问题就是采用 “断环” 的方式，让其中一方持有另一方的弱引用。同`MRC`，父对象对它的子对象持有强引用，而子对象对父对象持有弱引用。

>  在`ARC`中，“弱引用” 是指`__weak`或`__unsafe_unretained`。 

##### delegate 避免循环引用

`delegate`避免循环引用，就是在委托方声明`delegate`属性时，使用`weak`关键字。

```javascript
@property (nonatomic, weak) id<protocolName> delegate;
```

复制

##### block 避免循环引用

>  **Q：** 为什么 block 会产生循环引用？ 

- ① 相互循环引用： 如果当前`block`对当前对象的某一成员变量进行捕获的话，可能会对它产生强引用。根据`block`的变量捕获机制，如果`block`被拷贝到堆上，且捕获的是对象类型的`auto`变量，则会连同其所有权修饰符一起捕获，所以如果对象是`__strong`修饰，则`block`会对它产生强引用（如果`block`在栈上就不会强引用）。而当前`block`可能又由于当前对象对其有一个强引用，就产生了相互循环引用的问题；
- ② 大环引用： 我们如果使用`__block`的话，在`ARC`下可能会产生循环引用（`MRC`则不会）。由于`__block`修饰符会将变量包装成一个对象，如果`block`被拷贝到堆上，则会直接对`__block`变量产生强引用，而`__block`如果修饰的是对象的话，会根据对象的所有权修饰符做出相应的操作，形成强引用或者弱引用。如果对象是`__strong`修饰（如`__block id x`），则`__block`变量对它产生强引用（在`MRC`下则不会），如果这时候该对象是对`block`持有强引用的话，就产生了大环引用的问题。在`ARC`下可以通过断环的方式去解除循环引用，可以在`block`中将指针置为`nil`（`MRC`不会循环引用，则不用解决）。但是有一个弊端，如果该`block`一直得不到调用，循环引用就一直存在。

**ARC 下的解决方式：**

- 用`__weak`或者`__unsafe_unretained`解决：

```javascript
    __weak typeof(self) weakSelf = self;
    self.block = ^{
        NSLog(@"%p",weakSelf);
    };
```

复制

```javascript
    __unsafe_unretained id uuSelf = self;
    self.block = ^{
        NSLog(@"%p",uuSelf);
    };
```

复制

![img](https://ask.qcloudimg.com/http-save/7220648/tiu34n6vc0.png?imageView2/2/w/2560/h/7000)

>  **注意**：`__unsafe_unretained`会产生悬垂指针，建议使用`weak`。 

 对于 non-trivial cycles，我们需要这样做：

```javascript
    __weak typeof(self) weakSelf = self;
    self.block = ^{
        if(!strongSelf) return;
        __strong typeof(weakSelf) strongSelf = weakSelf;
        NSLog(@"%p",weakSelf);
    };
```

复制

- 用`__block`解决（必须要调用`block`）： 缺点：必须要调用`block`，而且`block`里要将指针置为`nil`。如果一直不调用`block`，对象就会一直保存在内存中，造成内存泄漏。

```javascript
    __block id blockSelf = self;
    self.block = ^{
        NSLog(@"%p",blockSelf);
        blockSelf = nil;
    };
    self.block();
```

复制

![img](https://ask.qcloudimg.com/http-save/7220648/xc6xn9rxbk.png?imageView2/2/w/2560/h/7000)

**MRC 下的解决方式：**

- 用`__unsafe_unretained`解决：同`ARC`。
- 用`__block`解决（在`MRC`下使用`__block`修饰对象类型，在`block`内部不会对该对象进行`retain`操作，所以在`MRC`环境下可以通过`__block`解决循环引用的问题）

```javascript
    __block id blockSelf = self;
    self.block = ^{
        NSLog(@"%p",blockSelf);
    };
```

复制

更多关于`block`的内容，可以参阅[《OC - Block 详解》](https://links.jianshu.com/go?to=https%3A%2F%2Fjuejin.im%2Fpost%2F5e5282356fb9a07c891503df%23heading-2)。

### 属性

说到属性，不得不提一下`@synthesize`和`@dynamic`这两个指令。

#### @synthesize 和 @dynamic

-  `@property`：帮我们自动生成属性的`setter`和`getter`方法的声明。
-  `@synthesize`：帮我们自动生成`setter`和`getter`方法的实现以及下划线成员变量。 以前我们需要手动对每个`@property`添加`@synthesize`，而在 iOS 6 之后 LLVM 编译器引入了 “`property autosynthesis`”，即属性自动合成。换句话说，就是编译器会自动为每个`@property`添加`@synthesize`。

>  **Q：** `@synthesize`现在有什么作用呢？  如果我们同时重写了`setter`和`getter`方法，则编译器就不会为这个`@property`添加`@synthesize`，这时候就不存在下划线成员变量，所以我们需要手动添加`@synthesize`。 @synthesize propertyName = _propertyName; 

 有时候我们不希望编译器为我们`@synthesize`，我们希望在程序运行过程中再去决定该属性存取方法的实现，就可以使用`@dynamic`。

-  `@dynamic` ：告诉编译器不用自动进行`@synthesize`，等到运行时再添加方法实现，但是它不会影响`@property`生成的`setter`和`getter`方法的声明。`@dynamic`是 OC 为动态运行时语言的体现。动态运行时语言与编译时语言的区别：动态运行时语言将函数决议推迟到运行时，编译时语言在编译器进行函数决议。

```javascript
@dynamic propertyName;
```

复制

#### 属性“内存管理”关键字与所有权修饰符的对应关系

| 属性“内存管理”关键字 | 所有权修饰符        |
| :------------------- | :------------------ |
| assign               | __unsafe_unretained |
| unsafe_unretained    | __unsafe_unretained |
| weak                 | __weak              |
| retain               | __strong            |
| strong               | __strong            |
| copy                 | __strong            |

更多关于属性关键字的内容，可以参阅[《OC - 属性关键字和所有权修饰符》](https://links.jianshu.com/go?to=https%3A%2F%2Fjuejin.im%2Fpost%2F5e4c0bb051882549236f7578)。

### 管理 Outlets 的模式在 iOS 和 OS X 平台下变得一致

在`ARC`下，`iOS`和`OS X`平台中声明`outlets`的模式变得一致。你应该采用的模式为：在`nib`或者`storyboard`中，除了来自文件所有者的`top-level`对象的`outlets`应该使用`strong`，其它情况下应该使用`weak`修饰`outlets`。（详情见 [Nib Files](https://links.jianshu.com/go?to=https%3A%2F%2Fdeveloper.apple.com%2Flibrary%2Farchive%2Fdocumentation%2FCocoa%2FConceptual%2FLoadingResources%2FCocoaNibs%2FCocoaNibs.html%23%2F%2Fapple_ref%2Fdoc%2Fuid%2F10000051i-CH4) in [Resource Programming Guide](https://links.jianshu.com/go?to=https%3A%2F%2Fdeveloper.apple.com%2Flibrary%2Farchive%2Fdocumentation%2FCocoa%2FConceptual%2FLoadingResources%2FIntroduction%2FIntroduction.html%23%2F%2Fapple_ref%2Fdoc%2Fuid%2F10000051i)）

### 栈变量初始化为 nil

使用`ARC`，`strong`、`weak`和`autoreleasing`的栈变量现在会默认初始化为`nil`。例如：

```javascript
- (void)myMethod {
    NSString *name;
    NSLog(@"name: %@", name);
}
```

复制

打印`name`的值为`null`，而不是程序`Crash`。

### 使用编译器标志启用和禁用 ARC

使用`-fobjc-arc`编译器标志启用`ARC`。如果对你来说，某些文件使用`MRC`更方便，那你可以仅对部分文件使用`ARC`。对于使用`ARC`作为默认方式的项目，可以使用`-fno-objc-arc`编译器标志为指定文件禁用`ARC`。如下图所示：

![img](https://ask.qcloudimg.com/http-save/7220648/yqqsjhhegy.png?imageView2/2/w/2560/h/7000)

`ARC`支持 Xcode 4.2 及更高版本、OS X v10.6 及更高版本 (64-bit applications) 、iOS 4 及更高版本。但 OS X v10.6 和 iOS 4 不支持`weak`弱引用。Xcode 4.1 及更早版本中不支持`ARC`。

## Managing Toll-Free Bridging

### Toll-Free Bridging

你在项目中可能会使用到`Core Foundation`样式的对象，它可能来自`Core Foundation`框架或者采用`Core Foundation`约定标准的其它框架如`Core Graphics`。

编译器不会自动管理`Core Foundation`对象的生命周期，你必须根据`Core Foundation`内存管理规则调用`CFRetain`和`CFRelease`。请参阅[《Memory Management Programming Guide for Core Foundation》](https://links.jianshu.com/go?to=https%3A%2F%2Fdeveloper.apple.com%2Flibrary%2Farchive%2Fdocumentation%2FCoreFoundation%2FConceptual%2FCFMemoryMgmt%2FCFMemoryMgmt.html%23%2F%2Fapple_ref%2Fdoc%2Fuid%2F10000127i)。

在`MRC`下，我们可以直接在`Objective-C`指针类型`id`和`C`指针类型`void *`之间进行强制转换，如`Foundation`对象和`Core Foundation`对象进行转换。由于都是手动管理内存，无须关心内存管理权的移交问题。

在`ARC`下，进行`Foundation`对象和`Core Foundation`对象的类型转换，需要使用`Toll-Free Bridging`（`桥接`）告诉编译器对象的所有权语义。你要选择使用`__bridge`、`__bridge_retained`、`__bridge_transfer`这三种`桥接`方案中的一种来确定对象的内存管理权移交问题，它们的作用分别如下：

| 桥接方案                                | 用法     | 内存管理权                                                   | 引用计数         |
| :-------------------------------------- | :------- | :----------------------------------------------------------- | :--------------- |
| __bridge                                | F <=> CF | 不改变                                                       | 不改变           |
| __bridge_retained(或 CFBridgingRetain)  | F => CF  | ARC 管理 => 手动管理(你负责调用 CFRelease 或相关函数来放弃对象所有权） | +1               |
| __bridge_transfer(或 CFBridgingRelease) | CF => F  | 手动管理 => ARC 管理(ARC 负责放弃对象的所有权)               | +1 再 -1，不改变 |

-  **__bridge**（常用）：不改变对象的内存管理权所有者。 本来由`ARC`管理的`Foundation`对象，转换成`Core Foundation`对象后继续由`ARC`管理； 本来由开发者手动管理的`Core Foundation`对象，转换成`Foundation`对象后继续由开发者手动管理。 下面以`NSMutableArray`对象和`CFMutableArrayRef`对象为例：

```javascript
    // 本来由 ARC 管理
    NSMutableArray *mArray = [[NSMutableArray alloc] init];
    // 转换后继续由 ARC 管理            
    CFMutableArrayRef cfMArray = (__bridge CFMutableArrayRef)(mArray); 

    // 本来由开发者手动管理
    CFMutableArrayRef cfMArray = CFArrayCreateMutable(kCFAllocatorDefault, 0, NULL); 
    // 转换后继续由开发者手动管理
    NSMutableArray *mArray = (__bridge NSMutableArray *)(cfMArray); 
    ...
    // 在不需要该对象时需要手动释放
    CFRelease(cfMArray); 
```

复制

`__bridge`的安全性与赋值给`__unsafe_unretained`修饰符相近甚至更低，如果使用不当没有注意对象的释放，就会因悬垂指针而导致`Crash`。

`__bridge`转换后不改变对象的引用计数，比如我们将`id`类型转换为`void *`类型，我们在使用`void *`之前该对象被销毁了，那么我们再使用`void *`访问该对象肯定会`Crash`。所以`void *`指针建议立即使用，如果我们要保存这个`void *`指针留着以后使用，那么建议使用`__bridge_retain`。

而在使用`__bridge`将`void *`类型转换为`id`类型时，一定要注意此时对象的内存管理还是由开发者手动管理，记得在不需要对象时进行释放，否则内存泄漏！

以下给出几个 “使用`__bridge`将`void *`类型转换为`id`类型” 的示例代码，要注意转换后还是由开发者手动管理内存，所以即使离开作用域，该对象还保存在内存中。

```javascript
    // 使用 __strong
    CFMutableArrayRef cfMArray = CFArrayCreateMutable(kCFAllocatorDefault, 0, NULL);
    NSMutableArray *mArray = (__bridge NSMutableArray *)(cfMArray);
    
    NSLog(@"%ld", CFGetRetainCount(cfMArray));     // 2, 因为 mArray 是 __strong, 所以增加引用计数
    NSLog(@"%ld", _objc_rootRetainCount(mArray));  // 1, 但是使用 _objc_rootRetainCount 打印出来是 1 ？
     
    // 在不需要该对象时进行释放
    CFRelease(cfMArray); 
    NSLog(@"%ld", CFGetRetainCount(cfMArray));     // 1, 因为 __strong 作用域还没结束，还有强指针引用着
    NSLog(@"%ld", _objc_rootRetainCount(mArray));  // 1
    
   // 在 __strong 作用域结束前，还可以访问该对象
   // 等 __strong 作用域结束，该对象就会销毁，再访问就会崩溃
```

复制

```javascript
    // 使用 __strong
    CFMutableArrayRef cfMArray;
    {
        cfMArray = CFArrayCreateMutable(kCFAllocatorDefault, 0, NULL);
        NSMutableArray *mArray = (__bridge NSMutableArray *)(cfMArray);
        NSLog(@"%ld", CFGetRetainCount(cfMArray));  // 2, 因为 mArray 是 __strong, 所以增加引用计数
    }
    NSLog(@"%ld", CFGetRetainCount(cfMArray));      // 1, __strong 作用域结束
    CFRelease(cfMArray); // 释放对象，否则内存泄漏
    // 可以使用 CFShow 函数打印 CF 对象
    CFShow(cfMArray);    // 再次访问就会崩溃
```

复制

```javascript
    // 使用 __weak
    CFMutableArrayRef cfMArray = CFArrayCreateMutable(kCFAllocatorDefault, 0, NULL);
    NSMutableArray __weak *mArray = (__bridge NSMutableArray *)(cfMArray);
    
    NSLog(@"%ld", CFGetRetainCount(cfMArray));     // 1, 因为 mArray 是 __weak, 所以不增加引用计数
    NSLog(@"%ld", _objc_rootRetainCount(mArray));  // 1
    
    /*
     * 使用 mArray
     */
    
    // 在不需要该对象时进行释放
    CFRelease(cfMArray);
    
    NSLog(@"%@",mArray);  // nil, 这就是使用 __weak 的好处，在指向的对象被销毁的时候会自动置指针为 nil，再次访问也不会崩溃
```

复制

```javascript
    // 使用 __weak
    NSMutableArray __weak *mArray;
    {
        CFMutableArrayRef cfMArray = CFArrayCreateMutable(kCFAllocatorDefault, 0, NULL);
        mArray = (__bridge NSMutableArray *)(cfMArray);
        NSLog(@"%ld", CFGetRetainCount(cfMArray));  // 1, 因为 mArray 是 __weak, 所以不增加引用计数
    }
    CFMutableArrayRef cfMArray =  (__bridge CFMutableArrayRef)(mArray);
    NSLog(@"%ld", CFGetRetainCount(cfMArray)); // 1, 可见即使出了作用域，对象也还没释放，因为内存管理权在我们
    
    CFRelease(cfMArray); // 释放对象，否则内存泄漏
```

复制

-  **__bridge_retained**：用在`Foundation`对象转换成`Core Foundation`对象时，进行`ARC`内存管理权的剥夺。 本来由`ARC`管理的`Foundation`对象，转换成`Core Foundation`对象后，`ARC`不再继续管理该对象，需要由开发者自己手动释放该对象，否则会发生内存泄漏。

```javascript
    // 本来由 ARC 管理
    NSMutableArray *mArray = [[NSMutableArray alloc] init];       
    // 转换后由开发者手动管理              
    CFMutableArrayRef cfMArray = (__bridge_retained CFMutableArrayRef)(mArray); 
//    CFMutableArrayRef cfMArray = (CFMutableArrayRef)CFBridgingRetain(mArray); // 另一种等效写法
    ...
    CFRelease(cfMArray);  // 在不需要该对象的时候记得手动释放
```

复制

`__bridge_retained`顾名思义会对对象`retain`，使转换赋值的变量也持有该对象，对象的引用计数 +1。由于转换后由开发者进行手动管理，所以再不需要该对象的时候记得调用`CFRelease`释放对象，否则内存泄漏。

```javascript
    id obj = [[NSObject alloc] init];
    void *p = (__bridge_retained void *)(obj);
```

复制

以上代码如果在`MRC`下相当于：

```javascript
    id obj = [[NSObject alloc] init];

    void *p = obj;
    [(id)p retain];
```

复制

**查看引用计数**

在`ARC`下，我们可以使用`_objc_rootRetainCount`函数查看对象的引用计数（该函数有时候不准确）。对于`Core Foundation`对象，我们可以使用`CFGetRetainCount`函数查看引用计数。

```javascript
uintptr_t _objc_rootRetainCount(id obj);
```

复制

打印上面代码的`obj`对象的引用计数，发现其引用计数确实增加。

```javascript
    id obj = [[NSObject alloc] init];
    NSLog(@"%ld", _objc_rootRetainCount(obj)); // 1
    void *p = (__bridge_retained void *)(obj);
    NSLog(@"%ld", _objc_rootRetainCount(obj)); // 2
    NSLog(@"%ld", CFGetRetainCount(p));        // 2
```

复制

以下给出几个示例代码：

```javascript
    CFMutableArrayRef cfMArray;
    {
        NSMutableArray *mArray = [[NSMutableArray alloc] init];
        cfMArray = (__bridge_retained CFMutableArrayRef)(mArray);
        NSLog(@"%ld", CFGetRetainCount(cfMArray)); // 2, 因为 mArray 是 __strong, 而且使用了 __bridge_retained
    }
    NSLog(@"%ld", CFGetRetainCount(cfMArray));     // 1, __strong 作用域结束
    CFRelease(cfMArray); // 在不需要使用的时候释放，防止内存泄漏
```

复制

如果将上面的代码由`__bridge_retained`改为使用`__bridge`会怎样？

```javascript
    CFMutableArrayRef cfMArray;
    {
        NSMutableArray *mArray = [[NSMutableArray alloc] init];
        cfMArray = (__bridge CFMutableArrayRef)(mArray);
        NSLog(@"%ld", CFGetRetainCount(cfMArray)); // 1, 因为 mArray 是 __strong, 且使用 __bridge 还是由 ARC 管理，不增加引用计数
    }
    NSLog(@"%ld", CFGetRetainCount(cfMArray)); // 程序崩溃，因为对象已销毁
```

复制

-  **__bridge_transfer**：用在`Core Foundation`对象转换成`Foundation`对象时，进行内存管理权的移交。 本来由开发者手动管理的`Core Foundation`对象，转换成`Foundation`对象后，将内存管理权移交给`ARC`，开发者不用再关心对象的释放问题，不用担心内存泄漏。

```javascript
    // 本来由开发者手动管理
    CFMutableArrayRef cfMArray = CFArrayCreateMutable(kCFAllocatorDefault, 0, NULL);
    // 转换后由 ARC 管理
    NSMutableArray *mArray = (__bridge_transfer NSMutableArray *)(cfMArray);
//    NSMutableArray *mArray = CFBridgingRelease(cfMArray); // 另一种等效写法
```

复制

`__bridge_transfer`作用如其名，移交内存管理权。它的实现跟`__bridge_retained`相反，会`release`被转换的变量持有的对象，但同时它在赋值给转换的变量时会对对象进行`retain`，所以引用计数不变。也就是说，对于`Core Foundation`引用计数语义而言，对象是释放的，但是`ARC`保留了对它的引用。

```javascript
    id obj = (__bridge_transfer void *)(p);
```

复制

以上代码如果在`MRC`下相当于：

```javascript
    id obj = (id)p;
    [obj retain];
    [(id)p release];
```

复制

下面也给出一个示例代码：

```javascript
    CFMutableArrayRef cfMArray;
    {
        cfMArray = CFArrayCreateMutable(kCFAllocatorDefault, 0, NULL);
        NSMutableArray *mArray = (__bridge_transfer NSMutableArray *)(cfMArray);
        NSLog(@"%ld", CFGetRetainCount(cfMArray));    // 1, 因为 cfMArray 指针指向的对象存在，所以仍然可以通过该指针访问
        NSLog(@"%ld", _objc_rootRetainCount(mArray)); // 1, mArray 为 __strong
    }
    // __strong 作用域结束，ARC 对该对象进行了释放
    NSLog(@"%ld", CFGetRetainCount(cfMArray)); // 再次访问就会崩溃
```

复制

如果将上面的代码由`__bridge_transfer`改为使用`__bridge`会怎样？ 其实在`__bridge`讲解中已经给出了示例代码，如果不释放就会造成内存泄漏。

以上提到了可以替代`__bridge_retained`和`__bridge_transfer`的两个函数：`CFBridgingRetain`和`CFBridgingRelease`，下面我们来看一下函数实现：

```javascript
/* Foundation - NSObject.h */
#if __has_feature(objc_arc)  // ARC

// After using a CFBridgingRetain on an NSObject, the caller must take responsibility for calling CFRelease at an appropriate time.
NS_INLINE CF_RETURNS_RETAINED CFTypeRef _Nullable CFBridgingRetain(id _Nullable X) {
    return (__bridge_retained CFTypeRef)X;
}

NS_INLINE id _Nullable CFBridgingRelease(CFTypeRef CF_CONSUMED _Nullable X) {
    return (__bridge_transfer id)X;
}

#else // MRC

// This function is intended for use while converting to ARC mode only.
NS_INLINE CF_RETURNS_RETAINED CFTypeRef _Nullable CFBridgingRetain(id _Nullable X) {
    return X ? CFRetain((CFTypeRef)X) : NULL;
}

// Casts a CoreFoundation object to an Objective-C object, transferring ownership to ARC (ie. no need to CFRelease to balance a prior +1 CFRetain count). NS_RETURNS_RETAINED is used to indicate that the Objective-C object returned has +1 retain count.  So the object is 'released' as far as CoreFoundation reference counting semantics are concerned, but retained (and in need of releasing) in the view of ARC. This function is intended for use while converting to ARC mode only.
NS_INLINE id _Nullable CFBridgingRelease(CFTypeRef CF_CONSUMED _Nullable X) NS_RETURNS_RETAINED {
    return [(id)CFMakeCollectable(X) autorelease];
}

#endif
```

复制

可以看到在`ARC`下，这两个函数就是使用了`__bridge_retained`和`__bridge_transfer`。

>  **小结：**在`ARC`下，必须恰当使用`Toll-Free Bridging`（`桥接`）在`Foundation`对象和`Core Foundation`对象之间进行类型转换，否则可能会导致内存泄漏。  **建议：** 

- 将`Foundation`对象转为`Core Foundation`对象时，如果我们立即使用该`Core Foundation`对象，使用`__bridge`；如果我们想保存着以后使用，使用`__bridge_retained`，但是要记得在使用完调用`CFRelease`释放对象。
- 将`Core Foundation`对象转为`Foundation`对象时，使用`__bridge_transfer`。

### 编译器处理从 Cocoa 方法返回的 CF 对象

编译器知道返回`Core Foundation`对象的`Objective-C`方法遵循历史 Cocoa 命名约定。例如，编译器知道，在`iOS`中，`UIColor`的`CGColor`方法返回的`CGColor`并不持有（因为方法名不是以`alloc/new/copy/mutableCopy`开头）。所以你仍然必须使用适当的类型转换，如以下示例所示：

```javascript
    NSMutableArray *colors = [NSMutableArray arrayWithObject:(id)[[UIColor darkGrayColor] CGColor]];
    [colors addObject:(id)[[UIColor lightGrayColor] CGColor]];
```

复制

否则编译警告：

```javascript
    NSMutableArray *colors = [NSMutableArray arrayWithObject:[[UIColor darkGrayColor] CGColor]];
    // Incompatible pointer types sending 'CGColorRef _Nonnull' (aka 'struct CGColor *') to parameter of type 'id _Nonnull'
    // 不兼容的指针类型，将 CGColorRef（又称 struct CGColor *）作为 id 类型参数传入
```

复制

### 使用桥接转换函数参数

当在函数调用中在`Objective-C`和`Core Foundation`对象之间进行转换时，需要告诉编译器参数的所有权语义。`Core Foundation`对象的所有权规则请参阅[《Memory Management Programming Guide for Core Foundation》](https://links.jianshu.com/go?to=https%3A%2F%2Fdeveloper.apple.com%2Flibrary%2Farchive%2Fdocumentation%2FCoreFoundation%2FConceptual%2FCFMemoryMgmt%2FCFMemoryMgmt.html%23%2F%2Fapple_ref%2Fdoc%2Fuid%2F10000127i)。`Objective-C`的所有权规则请参阅`《从 MRC 说起 —— 内存管理策略》`章节。

如下实例所示，`NSArray`对象作为`CGGradientCreateWithColors`函数的参数传入，它的所有权不需要传递给该函数，因此需要使用`__bridge`进行强制转换。

```javascript
    NSArray *colors = <#An array of colors#>;
    CGGradientRef gradient = CGGradientCreateWithColors(colorSpace, (__bridge CFArrayRef)colors, locations);
```

复制

以下实例中使用了`Core Foundation`对象以及`Objective-C`和`Core Foundation`对象之间进行转换，同时需要注意`Core Foundation`对象的内存管理。

```javascript
- (void)drawRect:(CGRect)rect {
    CGContextRef ctx = UIGraphicsGetCurrentContext();
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceGray();
    CGFloat locations[2] = {0.0, 1.0};
    NSMutableArray *colors = [NSMutableArray arrayWithObject:(id)[[UIColor darkGrayColor] CGColor]];
    [colors addObject:(id)[[UIColor lightGrayColor] CGColor]];
    CGGradientRef gradient = CGGradientCreateWithColors(colorSpace, (__bridge CFArrayRef)colors, locations);
    CGColorSpaceRelease(colorSpace);  // Release owned Core Foundation object.
    CGPoint startPoint = CGPointMake(0.0, 0.0);
    CGPoint endPoint = CGPointMake(CGRectGetMaxX(self.bounds), CGRectGetMaxY(self.bounds));
    CGContextDrawLinearGradient(ctx, gradient, startPoint, endPoint,
                                kCGGradientDrawsBeforeStartLocation | kCGGradientDrawsAfterEndLocation);
    CGGradientRelease(gradient);  // Release owned Core Foundation object.
}
```

复制

## ARC 的实现

`ARC`仅仅依靠`LLVM`编译器是无法完成内存管理工作的，它还需要`Runtime`的支持。就比如`__weak`修饰符，如果没有`Runtime`，那么在对象`dealloc`时就不会将`__weak`变量置为`nil`。 `ARC`由以下工具、库来实现：

- clang（LLVM 编译器）3.0 以上
- objc4 Objective-C 运行时库 493.9 以上

## 转换项目时的常见问题

除了以上说明的几点`ARC`新规则以外，`ARC`下还要注意以下几个问题，也是`MRC`转换到`ARC`项目的常见问题：

-  `ARC`要求你在`init`方法中将`[super init]`的结果分配给`self`。

```javascript
    self = [super init];
    if (self) {
    ...
```

复制

-  你无法实现自定义

  ```
  retain
  ```

  或

  ```
  release
  ```

  方法。 实现自定义

  ```
  retain
  ```

  或

  ```
  release
  ```

  方法会破坏

  ```
  weak
  ```

  弱指针。你想要这么做的原因可能如下： 

  - ① 性能 请不要再这样做了，`NSObject`的`retain`和`release`方法的实现现在已经足够快了。如果你仍然发现有问题，请提交错误给苹果。
  - ② 实现自定义`weak`弱指针系统 请改用`__weak`。
  - ③ 实现单例类 请改用`shared instance`模式。或者，使用类方法替代实例方法，这样可以避免创建对象。

- “直接赋值” 的实例变量变成强引用了。

在`ARC`之前，实例变量是弱引用（非持有引用） —— 直接将对象分配给实例变量并不延长对象的生命周期。为了使属性变`strong`，你通常会实现或使用`@synthesize`合成 “调用适当内存管理方法” 的访问器方法。相反，有时你为了维持一个弱引用，你可能会像以下实例这样实现访问器方法。

```javascript
@interface MyClass : Superclass {
    id thing; // Weak reference.
}
// ...
@end

@implementation MyClass
- (id)thing {
    return thing;
}
- (void)setThing:(id)newThing {
    thing = newThing;
}
// ...
@end
```

复制

对于`ARC`，实例变量默认是`strong`强引用 —— 直接将对象分配给实例变量会延长对象的生命周期。迁移工具在将`MRC`代码转换为`ARC`代码时，无法确定它该使用`strong`还是`weak`，所以默认使用`strong`。 若要保持与`MRC`下一致，必须将实例变量使用`__weak`修饰，或使用`weak`关键字的属性。

```javascript
@interface MyClass : Superclass {
    id __weak thing;
}
// ...
@end

@implementation MyClass
- (id)thing {
    return thing;
}
- (void)setThing:(id)newThing {
    thing = newThing;
}
// ...
@end
```

复制

或者：

```javascript
@interface MyClass : Superclass
@property (weak) id thing;
// ...
@end

@implementation MyClass
@synthesize thing;
// ...
@end
```

复制

## ARC 补充

### __weak 黑科技

在所有权修饰符中我们简单介绍了`__weak`修饰符。实际上，除了在`MRC`下无法使用`__weak`修饰符以外，还有其他无法使用`__weak`修饰符的情况。

例如，有一些类是不支持`__weak`修饰符的，比如`NSMachPort`。这些类重写了`retain / release`并实现该类独自的引用计数机制。但是赋值以及使用附有`__weak`修饰符的变量都必须恰当地使用 objc4 运行时库中的函数，因此独自实现引用计数机制的类大多不支持`__weak`修饰符。

```javascript
    NSMachPort __weak *port = [NSMachPort new]; 
    // 编译错误：Class is incompatible with __weak references 类与弱引用不兼容
```

复制

不支持`__weak`修饰符的类，其类的声明中添加了`NS_AUTOMATED_REFCOUNT_WEAK_UNAVAILABLE`宏，该宏的定义如下。

```javascript
// Marks classes which cannot participate in the ARC weak reference feature.
#if __has_attribute(objc_arc_weak_reference_unavailable)
#define NS_AUTOMATED_REFCOUNT_WEAK_UNAVAILABLE __attribute__((objc_arc_weak_reference_unavailable))
#else
#define NS_AUTOMATED_REFCOUNT_WEAK_UNAVAILABLE
#endif
```

复制

如果将不支持`__weak`的类的对象赋值给`__weak`修饰符的变量，一旦编译器检测出来就会报告编译错误。但是在 Cocoa 框架中，不支持`__weak`修饰符的类极为罕见，因此没有必要太过担心。

`__weak`黑科技来了！！！！！

还有一种情况也不能使用`__weak`修饰符。就是当对象的`allowsWeakReference`/`retainWeakReference`实例方法返回`NO`时，这两个方法的声明如下：

```javascript
- (BOOL)allowsWeakReference;
- (BOOL)retainWeakReference;
```

复制

这两个方法的默认实现是返回`YES`。

如果我们在类中重写了`allowsWeakReference`方法并返回`NO`，那么如果我们将该类的实例对象赋值给`__weak`修饰符的变量，那么程序就会`Crash`。

例如我们在`HTPerson`类中做了此操作，则以下代码运行就会`Crash`。

```javascript
    HTPerson __weak *p = [[HTPerson alloc] init];
```

复制

```javascript
// 无法对 HTPerson 类的实例持有弱引用。可能是此对象被过度释放，或者正在销毁。
objc[18094]: Cannot form weak reference to instance (0x600001d7c2a0) of class HTPerson. It is possible that this object was over-released, or is in the process of deallocation.
(lldb) 
```

复制

所以，对于所有`allowsWeakReference`方法返回`NO`的类的实例都绝对不能使用`__weak`修饰符。

另外，如果实例对象的`retainWeakReference`方法返回`NO`，那么赋值该对象`__weak`修饰符的变量将为`nil`，代表无法通过`__weak`变量访问该对象。

比如以下示例代码：

```javascript
    HTPerson *p1 = [[HTPerson alloc] init];    
    HTPerson __weak *p2 = p1;
    NSLog(@"%@", p2);
    NSLog(@"%@", p2);
    NSLog(@"%@", p2);
    NSLog(@"%@", p2);
    NSLog(@"%@", p2);

/* 打印如下：
   <HTPerson: 0x600002e0dd20>
   <HTPerson: 0x600002e0dd20>
   <HTPerson: 0x600002e0dd20>
   <HTPerson: 0x600002e0dd20>
   <HTPerson: 0x600002e0dd20> */
```

复制

由于`p1`为`__strong`持有对象的强引用，所以在`p1`作用域结束前，该对象都存在，使用`__weak`修饰的`p2`访问该对象没问题。

下面在`HTPerson`类中重写`retainWeakReference`方法：

```javascript
@interface HTPerson ()
{
    NSUInteger count;
}

@implementation HTPerson
- (BOOL)retainWeakReference
{
    if (++count > 3) {
        return NO;
    }
    return [super retainWeakReference];    
}
@end
```

复制

再次运行以上代码，发现从第 4 次开始，通过`__weak`变量就无法访问到对象，因为这时候`retainWeakReference`方法返回值为`NO`。

```javascript
    HTPerson *p1 = [[HTPerson alloc] init];    
    HTPerson __weak *p2 = p1;
    NSLog(@"%@", p2);
    NSLog(@"%@", p2);
    NSLog(@"%@", p2);
    NSLog(@"%@", p2);
    NSLog(@"%@", p2);

/* 打印如下：
   <HTPerson: 0x600003e23ba0>
   <HTPerson: 0x600003e23ba0>
   <HTPerson: 0x600003e23ba0>
   (null)
   (null) */
```

复制

### 查看引用计数

在`ARC`下，我们可以使用`_objc_rootRetainCount`函数查看对象的引用计数。

```javascript
uintptr_t _objc_rootRetainCount(id obj);
```

复制

但实际上并不能完全信任该函数取得的数值。对于已释放的对象以及不正确的对象地址，有时也返回 “1”。另外，在多线程中使用对象的引用计数数值，因为存在竞争条件的问题，所以取得的数值不一定完全可信。 虽然在调试中`_objc_rootRetainCount`函数很有用，但最好在了解其所具有的问题的基础上来使用。

## 苹果对 ARC 一些问题的回答

>  **Q：** 我应该如何看待 ARC ？它将 retains/releases 调用的代码放在哪了？ 

尝试不要去思考`ARC`将`retains/releases`调用的代码放在哪里，而是思考应用程序算法，思考对象的`strong`和`weak`指针、所有权、以及可能产生的循环引用。

>  **Q：** 我还需要为我的对象编写 dealloc 方法吗？ 

有时候需要。 因为`ARC`不会自动处理`malloc/free`、`Core Foundation`对象的生命周期管理、文件描述符等等，所以你仍然可以通过编写`dealloc`方法来释放这些资源。 你不必（实际上不能）释放实例变量，但可能需要对系统类和其他未使用`ARC`编写的代码调用`[self setDelegate:nil]`。 `ARC`下的`dealloc`方法中不需要且不允许调用`[super dealloc]`，`Runtime`会自动处理。

>  **Q：** ARC 中仍然可能存在循环引用吗？ 

是的，`ARC`自动`retain/release`，也继承了循环引用问题。幸运的是，迁移到`ARC`的代码很少开始泄漏，因为属性已经声明是否`retain`。

>  **Q：** block 是如何在 ARC 中工作的？ 

在`ARC`下，编译器会根据情况自动将栈上的`block`复制到堆上，比如`block`作为函数返回值时，这样你就不必再调用`Block Copy`。

需要注意的一件事是，在`ARC`下，`NSString * __block myString`这样写的话，`block`会对`NSString`对象强引用，而不是造成悬垂指针问题。如果你要和`MRC`保持一致，请使用`__block NSString * __unsafe_unretained myString`或（更好的是）使用`__block NSString * __weak myString`。

>  **Q：** 我可以在 ARC 下创建一个 retained 指针的 C 数组吗？ 

可以，如下示例所示：

```javascript
// Note calloc() to get zero-filled memory.
__strong SomeClass **dynamicArray = (__strong SomeClass **)calloc(entries, sizeof(SomeClass *));
for (int i = 0; i < entries; i++) {
     dynamicArray[i] = [[SomeClass alloc] init];
}
 
// When you're done, set each entry to nil to tell ARC to release the object.
for (int i = 0; i < entries; i++) {
     dynamicArray[i] = nil;
}
free(dynamicArray);
```

复制

这里有一些注意点：

- 在某些情况下，你需要编写`__strong SomeClass **`，因为默认是`__autoreleasing SomeClass **`。
- 分配的内存区域必须初始化为 0（`zero-filled`）。
- 在`free`数组之前，必须将每个元素赋值为`nil`（`memset`或`bzero`将不起作用）。
- 你应该避免使用`memcpy`或`realloc`。

>  **Q：** ARC 速度上慢吗？ 

不。编译器有效地消除了许多无关的`retain/release`调用，并且已经投入了大量精力来加速 Objective-C 运行时。特别的是，当方法的调用者是`ARC`代码时，常见的 “`return a retain/autoreleased object`” 模式要快很多，并且实际上并不将对象放入自动释放池中。

>  **备注：** 在`MRC`下，通过`alloc/new/copy/mutableCopy`或以这些命名开头的方法创建的对象直接持有，而通过其它方法创建的对象会通过调用`autorelease`加入到自动释放池中。而`ARC`下不能调用`autorelease`方法，那么`ARC`怎么做到这一点呢？  **《Objective-C 高级编程：iOS 与 OS X 多线程和内存管理》**书中是说：在`ARC`下，编译器会检查方法名是否以`alloc/new/copy/mutableCopy`开始，如果不是则自动将返回值的对象注册到`@autoreleasepool`。  但经过测试，发现并不是如此。而且，以前在`MRC`下通过`array`类方法创建的`NSMutableArray`对象会被加入到`@autoreleasepool`，但是在`ARC`下并不会。  所以，根据方法名并不能判断`ARC`会不会将对象加入到`@autoreleasepool`。如果我们需要这么做，建议使用`__autoreleasing`修饰符。 

需要注意的一个问题是，优化器不是在常见的调试配置中运行的，所以预计在`-O0`模式下将会比`-Os`模式下看到更多的`retain/release`调用。

>  **Q：** ARC 在 ObjC++ 模式下工作吗？ 

是。你甚至可以在类和[容器](https://cloud.tencent.com/product/tke?from=20065&from_column=20065)中放置`strong/weak`的`id`对象。`ARC`编译器会在复制构造函数和析构函数等中合成`retain/release`逻辑以使其运行。

>  **Q：** 哪些类不支持 weak 弱引用？ 

你当前无法创建对以下类的实例的`weak`弱引用：NSATSTypesetter、NSColorSpace、NSFont、NSMenuView、NSParagraphStyle、NSSimpleHorizontalTypesetter 和 NSTextView。

**注意：** 此外，在 OS X v10.7 中，你无法创建对 NSFontManager，NSFontPanel、NSImage、NSTableCellView、NSViewController、NSWindow 和 NSWindowController 实例的`weak`弱引用。此外，在 OS X v10.7 中，AV Foundation 框架中的任何类都不支持`weak`弱引用。

此外，你无法在`ARC`下创建 NSHashTable、NSMapTable 和 NSPointerArray 类的实例的`weak`弱引用。

>  **Q：** 当我继承一个使用了 NSCopyObject 的类，如 NSCell 时，我需要做些什么？ 

没什么特别的。`ARC`会关注以前必须显式添加额外`retain`的情况。使用`ARC`，所有的复制方法只需要复制实例变量就可以了。

>  **Q：** 我可以对指定文件选择退出`ARC`而使用`MRC`吗？ 

可以。当你迁移项目到`ARC`或创建一个`ARC`项目时，所以`Objective-C`源文件的默认编译器标志将设置为`-fobjc-arc`，你可以使用`-fno-objc-arc`编译器标志为指定的类禁用`ARC`。操作如下图所示：

![img](https://ask.qcloudimg.com/http-save/7220648/yqqsjhhegy.png?imageView2/2/w/2560/h/7000)

>  **Q：** 在 Mac 上是否弃用了 GC (Garbage Collection) 机制？ 

OS X Mountain Lion v10.8 中不推荐使用`GC`机制，并且将在 OS X 的未来版本中删除`GC`机制。`ARC`是推荐的替代技术。为了帮助现有应用程序迁移，Xcode 4.3 及更高版本中的`ARC`迁移工具支持将使用`GC`的 OS X 应用程序迁移到`ARC`。

**注意：** 对于面向 Mac App Store 的应用，Apple 强烈建议你尽快使用`ARC`替换`GC`，因为 Mac App Store Guidelines 禁止使用已弃用的技术，否则不会通过审核，详情请参阅 [Mac App Store Review Guidelines](https://links.jianshu.com/go?to=http%3A%2F%2Fdeveloper.apple.com%2Fappstore%2Fmac%2Fresources%2Fapproval%2Fguidelines.html)。



## 内存管理（四）：内存管理方法源码分析



建议去掘金查看本文，带目录方便阅读。 [《iOS - 老生常谈内存管理（四）：内存管理方法源码分析》](https://links.jianshu.com/go?to=https%3A%2F%2Fjuejin.im%2Fpost%2F5e9c28f56fb9a03c860b8531%23heading-20)

## 走进苹果源码分析内存管理方法的实现

前面我们只是讲解了内存管理方法的使用以及使用注意，那么这些方法的内部实现到底是怎样的？引用计数具体又是怎样管理的呢？接下来我们走进`Runtime`最新源码`objc4-779.1`（写该文章时的最新），分析`alloc`、`retainCount`、`retain`、`release`、`dealloc`等方法的实现。

源码下载地址：[https://opensource.apple.com/tarballs/objc4/](https://links.jianshu.com/go?to=https%3A%2F%2Fopensource.apple.com%2Ftarballs%2Fobjc4%2F)

### alloc

`alloc`方法的函数调用栈为：

```javascript
// NSObject.mm
① objc_alloc
② callAlloc
// objc-runtime-new.mm
③ _objc_rootAllocWithZone
④ _class_createInstanceFromZone
⑤ calloc、
// objc-object.h
  initInstanceIsa->initIsa
```

复制

#### ① objc_alloc

```javascript
// Calls [cls alloc].
id
objc_alloc(Class cls)
{
    return callAlloc(cls, true/*checkNil*/, false/*allocWithZone*/);
}
```

复制

#### ② callAlloc

```javascript
// Call [cls alloc] or [cls allocWithZone:nil], with appropriate 
// shortcutting optimizations.
// 调用 [cls alloc] or [cls allocWithZone:nil] 会来到这个函数，使用适当的快捷方式优化
static ALWAYS_INLINE id
callAlloc(Class cls, bool checkNil, bool allocWithZone=false)
{
// 如果是 __OBJC2__ 代码（判断当前语言是否是 Objective-C 2.0）
#if __OBJC2__ 
    // 如果 (checkNil && !cls)，直接返回 nil
    if (slowpath(checkNil && !cls)) return nil;  
    // 如果 cls 没有实现自定义 allocWithZone 方法，调用 _objc_rootAllocWithZone
    if (fastpath(!cls->ISA()->hasCustomAWZ())) { 
        return _objc_rootAllocWithZone(cls, nil);
    }
#endif
       
    // No shortcuts available.    
    // 没有可用的快捷方式
    // 如果 allocWithZone 为 true，给 cls 发送 allocWithZone:nil 消息
    if (allocWithZone) { 
        return ((id(*)(id, SEL, struct _NSZone *))objc_msgSend)(cls, @selector(allocWithZone:), nil);
    }
    // 否则发送 alloc 消息
    return ((id(*)(id, SEL))objc_msgSend)(cls, @selector(alloc)); 
}
```

复制

>  **备注：** slowpath & fastpath  这两个宏的定义如下： #define fastpath(x) (__builtin_expect(bool(x), 1)) #define slowpath(x) (__builtin_expect(bool(x), 0)) 它们都使用了`__builtin_expect()`： long __builtin_expect(long exp, long c); `__builtin_expect()`是 GCC (version >= 2.96）提供给程序员使用的，由于大部分程序员在分支预测方面做得很糟糕，所以 GCC 提供这个内建函数来帮助程序员处理分支预测，目的是将 “分支转移” 的信息提供给编译器，这样编译器可以对代码进行优化，以减少指令跳转带来的性能下降。它的意思是：`exp == c`的概率很大。 `fastpath(x)`表示`x`为`1`的概率很大，`slowpath(x)`表示`x`为`0`的概率很大。它和`if`一起使用，`if (fastpath(x))`表示执行`if`语句的可能性大，`if (slowpath(x))`表示执行`if`语句的可能性小。 

`callAlloc`函数中`主要`执行以下步骤： 1、判断类有没有实现自定义`allocWithZone`方法，如果没有，就调用`_objc_rootAllocWithZone`函数（这属于快捷方式）。 2、如果不能使用快捷方式（即第 1 步条件不成立），根据`allocWithZone`的值给`cls`类发送消息。由于`allocWithZone`传的`false`，则给`cls`发送`alloc`消息。

我们先来看一下第二种情况，就是给`cls`发送`alloc`消息。

```javascript
+ (id)alloc {
    return _objc_rootAlloc(self);
}
```

复制

```javascript
// Base class implementation of +alloc. cls is not nil.
// Calls [cls allocWithZone:nil].
id
_objc_rootAlloc(Class cls)
{
    return callAlloc(cls, false/*checkNil*/, true/*allocWithZone*/);
}
```

复制

小朋友，你是否有很多问号？它怎么又调用了`callAlloc`？但不同的是，这次传参不一样：

-  `checkNil`为`false`，`checkNil`作用是是否需要判空，由于第一次调用该函数时已经进行判空操作了，所以这次传`false`。
-  `allocWithZone`为`true`，所以接下来会给对象发送`allocWithZone:nil`消息。

```javascript
// Replaced by ObjectAlloc
+ (id)allocWithZone:(struct _NSZone *)zone {
    return _objc_rootAllocWithZone(self, (malloc_zone_t *)zone);
}
```

复制

可以看到，第一种（快捷方式）和第二种（非快捷方式）调用的都是`_objc_rootAllocWithZone`函数，且传参都是`cls`和`nil`。

>  **备注：**在 ARC 下 NSZone 已被忽略。  在`《iOS - 老生常谈内存管理（三）：ARC 面世 —— ARC 实施新规则》`章节中已经提到，对于现在的运行时系统（编译器宏 __ OBJC2 __ 被设定的环境），不管是`MRC`还是`ARC`下，区域（`NSZone`）都已单纯地被忽略。所以现在`allocWithZone`和`alloc`方法已经没有区别。 

#### ③ _objc_rootAllocWithZone

```javascript
// objc-runtime-new.mm
NEVER_INLINE
id
_objc_rootAllocWithZone(Class cls, malloc_zone_t *zone __unused)
{
    // allocWithZone under __OBJC2__ ignores the zone parameter
    // allocWithZone 在 __OBJC2__ 下忽略 zone 参数
    return _class_createInstanceFromZone(cls, 0, nil,
                                         OBJECT_CONSTRUCT_CALL_BADALLOC);
}
```

复制

该函数中调用了`_class_createInstanceFromZone`函数，可以发现，参数`zone`已被忽略，直接传`nil`。

#### ④ _class_createInstanceFromZone

```javascript
/***********************************************************************
* class_createInstance
* fixme
* Locking: none
*
* Note: this function has been carefully written so that the fastpath
* takes no branch.
**********************************************************************/
static ALWAYS_INLINE id
_class_createInstanceFromZone(Class cls, size_t extraBytes, void *zone,
                              int construct_flags = OBJECT_CONSTRUCT_NONE,
                              bool cxxConstruct = true,
                              size_t *outAllocatedSize = nil)
{
    ASSERT(cls->isRealized());

    // Read class's info bits all at once for performance
    bool hasCxxCtor = cxxConstruct && cls->hasCxxCtor(); // 获取 cls 是否有构造函数
    bool hasCxxDtor = cls->hasCxxDtor();                 // 获取 cls 是否有析构函数
    bool fast = cls->canAllocNonpointer();               // 获取 cls 是否可以分配 nonpointer，如果是的话代表开启了内存优化 
    size_t size;

    // 获取需要申请的空间大小
    size = cls->instanceSize(extraBytes);  
    if (outAllocatedSize) *outAllocatedSize = size;

    id obj;
    // zone == nil，调用 calloc 来申请内存空间
    if (zone) { 
        obj = (id)malloc_zone_calloc((malloc_zone_t *)zone, 1, size);
    } else {    
        obj = (id)calloc(1, size);
    }
    // 如果内存空间申请失败，调用 callBadAllocHandler
    if (slowpath(!obj)) { 
        if (construct_flags & OBJECT_CONSTRUCT_CALL_BADALLOC) {
            return _objc_callBadAllocHandler(cls);
        }
        return nil;
    }

    // 初始化 isa。如果是 nonpointer，就调用 initInstanceIsa
    if (!zone && fast) { 
        obj->initInstanceIsa(cls, hasCxxDtor); 
    } else {
        // Use raw pointer isa on the assumption that they might be
        // doing something weird with the zone or RR.
        obj->initIsa(cls);
    }

    // 如果 cls 没有构造函数，直接返回对象
    if (fastpath(!hasCxxCtor)) {
        return obj;
    }
    // 进行构造函数的处理，再返回
    construct_flags |= OBJECT_CONSTRUCT_FREE_ONFAILURE;
    return object_cxxConstructFromClass(obj, cls, construct_flags);
}
```

复制

在`_class_createInstanceFromZone`函数中，通过调用 C 函数`calloc`来申请内存空间，并初始化对象的`isa`。

接着我们来看一下初始化对象`isa`(`nonpointer`)的过程。

#### ⑤ initInstanceIsa

```javascript
// objc-object.h
inline void 
objc_object::initInstanceIsa(Class cls, bool hasCxxDtor)
{
    ASSERT(!cls->instancesRequireRawIsa());
    ASSERT(hasCxxDtor == cls->hasCxxDtor());

    initIsa(cls, true, hasCxxDtor);
}
```

复制

#### initIsa

```javascript
// objc-config.h
// Define SUPPORT_INDEXED_ISA=1 on platforms that store the class in the isa 
// field as an index into a class table.
// Note, keep this in sync with any .s files which also define it.
// Be sure to edit objc-abi.h as well.
#if __ARM_ARCH_7K__ >= 2  ||  (__arm64__ && !__LP64__)
#   define SUPPORT_INDEXED_ISA 1
#else
#   define SUPPORT_INDEXED_ISA 0
#endif

// objc-object.h
inline void 
objc_object::initIsa(Class cls, bool nonpointer, bool hasCxxDtor) 
{ 
    ASSERT(!isTaggedPointer()); 
    
    if (!nonpointer) {
        isa = isa_t((uintptr_t)cls);
    } else {
        ASSERT(!DisableNonpointerIsa);
        ASSERT(!cls->instancesRequireRawIsa());

        isa_t newisa(0);

#if SUPPORT_INDEXED_ISA  // 对于 64 位系统，该值为 0
        ASSERT(cls->classArrayIndex() > 0);
        newisa.bits = ISA_INDEX_MAGIC_VALUE;  
        // isa.magic is part of ISA_MAGIC_VALUE
        // isa.nonpointer is part of ISA_MAGIC_VALUE
        newisa.has_cxx_dtor = hasCxxDtor;
        newisa.indexcls = (uintptr_t)cls->classArrayIndex();
#else
        newisa.bits = ISA_MAGIC_VALUE;  // 将 isa 的 bits 赋值为 ISA_MAGIC_VALUE
        // isa.magic is part of ISA_MAGIC_VALUE
        // isa.nonpointer is part of ISA_MAGIC_VALUE
        newisa.has_cxx_dtor = hasCxxDtor;
        newisa.shiftcls = (uintptr_t)cls >> 3;
#endif

        // This write must be performed in a single store in some cases
        // (for example when realizing a class because other threads
        // may simultaneously try to use the class).
        // fixme use atomics here to guarantee single-store and to
        // guarantee memory order w.r.t. the class index table
        // ...but not too atomic because we don't want to hurt instantiation
        isa = newisa;
    }
}
```

复制

在`initIsa`方法中将`isa`的`bits`赋值为`ISA_MAGIC_VALUE`。源码注释写的是`ISA_MAGIC_VALUE`初始化了`isa`的`magic`和`nonpointer`字段，下面我们加以验证。

```javascript
#if SUPPORT_PACKED_ISA

    // extra_rc must be the MSB-most field (so it matches carry/overflow flags)
    // nonpointer must be the LSB (fixme or get rid of it)
    // shiftcls must occupy the same bits that a real class pointer would
    // bits + RC_ONE is equivalent to extra_rc + 1
    // RC_HALF is the high bit of extra_rc (i.e. half of its range)

    // future expansion:
    // uintptr_t fast_rr : 1;     // no r/r overrides
    // uintptr_t lock : 2;        // lock for atomic property, @synch
    // uintptr_t extraBytes : 1;  // allocated with extra bytes

# if __arm64__
#   define ISA_MASK        0x0000000ffffffff8ULL
#   define ISA_MAGIC_MASK  0x000003f000000001ULL
#   define ISA_MAGIC_VALUE 0x000001a000000001ULL  // here
#   define ISA_BITFIELD                                                      \
      uintptr_t nonpointer        : 1;                                       \
      uintptr_t has_assoc         : 1;                                       \
      uintptr_t has_cxx_dtor      : 1;                                       \
      uintptr_t shiftcls          : 33; /*MACH_VM_MAX_ADDRESS 0x1000000000*/ \
      uintptr_t magic             : 6;                                       \
      uintptr_t weakly_referenced : 1;                                       \
      uintptr_t deallocating      : 1;                                       \
      uintptr_t has_sidetable_rc  : 1;                                       \
      uintptr_t extra_rc          : 19
#   define RC_ONE   (1ULL<<45)
#   define RC_HALF  (1ULL<<18)

# elif __x86_64__
#   define ISA_MASK        0x00007ffffffffff8ULL
#   define ISA_MAGIC_MASK  0x001f800000000001ULL
#   define ISA_MAGIC_VALUE 0x001d800000000001ULL
#   define ISA_BITFIELD                                                        \
      uintptr_t nonpointer        : 1;                                         \
      uintptr_t has_assoc         : 1;                                         \
      uintptr_t has_cxx_dtor      : 1;                                         \
      uintptr_t shiftcls          : 44; /*MACH_VM_MAX_ADDRESS 0x7fffffe00000*/ \
      uintptr_t magic             : 6;                                         \
      uintptr_t weakly_referenced : 1;                                         \
      uintptr_t deallocating      : 1;                                         \
      uintptr_t has_sidetable_rc  : 1;                                         \
      uintptr_t extra_rc          : 8
#   define RC_ONE   (1ULL<<56)
#   define RC_HALF  (1ULL<<7)

# else
#   error unknown architecture for packed isa
# endif

// SUPPORT_PACKED_ISA
#endif
```

复制

在`__arm64__`下，`ISA_MAGIC_VALUE`的值为`0x000001a000000001ULL`。 

![img](https://ask.qcloudimg.com/http-save/yehe-6828465/bjqg3hwihc.png?imageView2/2/w/2560/h/7000)

对应到`ISA_BITFIELD`中，`ISA_MAGIC_VALUE`确实是用于初始化`isa`的`magic`和`nonpointer`字段。

在初始化`isa`的时候，并没有对`extra_rc`进行操作。也就是说`alloc`方法实际上并没有设置对象的引用计数值为 1。

>  **Why?** alloc 居然没有让引用计数值为 1？ 不急，我们先留着疑问分析其它内存管理方法。 
>
>  **小结：** `alloc`方法经过一系列的函数调用栈，最终通过调用 C 函数`calloc`来申请内存空间，并初始化对象的`isa`，但并没有设置对象的引用计数值为 1。 

### init

```javascript
// NSObject.mm
// Calls [[cls alloc] init].
id
objc_alloc_init(Class cls)
{
    return [callAlloc(cls, true/*checkNil*/, false/*allocWithZone*/) init];
}

- (id)init {
    return _objc_rootInit(self);
}

id
_objc_rootInit(id obj)
{
    // In practice, it will be hard to rely on this function.
    // Many classes do not properly chain -init calls.
    return obj;
}
```

复制

基类的`init`方法啥都没干，只是将`alloc`创建的对象返回。我们可以重写`init`方法来对`alloc`创建的实例做一些初始化操作。

### new

```javascript
// Calls [cls new]
id
objc_opt_new(Class cls)
{
#if __OBJC2__
    if (fastpath(cls && !cls->ISA()->hasCustomCore())) {
        return [callAlloc(cls, false/*checkNil*/, true/*allocWithZone*/) init];
    }
#endif
    return ((id(*)(id, SEL))objc_msgSend)(cls, @selector(new));
}

+ (id)new {
    return [callAlloc(self, false/*checkNil*/) init];
}
```

复制

`new`方法很简单，只是嵌套了`alloc`和`init`。

### copy & mutableCopy

```javascript
- (id)copy {
    return [(id)self copyWithZone:nil];
}

- (id)mutableCopy {
    return [(id)self mutableCopyWithZone:nil];
}
```

复制

`copy`和`mutableCopy`也很简单，只是调用了`copyWithZone`和`mutableCopyWithZone`方法。

### retainCount

我们都知道，`retainCount`方法是取出对象的引用计数值。那么，它是从哪里取值，怎么取值的呢？相信你们已经想到了，`isa`和`Sidetable`，下面我们进入源码看看它的取值过程。

`retainCount`方法的函数调用栈为：

```javascript
// NSObject.mm
① retainCount
② _objc_rootRetainCount
// objc-object.h
③ objc_object::rootRetainCount
// NSObject.mm
④ objc_object::sidetable_getExtraRC_nolock
objc_object::sidetable_retainCount
```

复制

#### ① retainCount

```javascript
- (NSUInteger)retainCount {
    return _objc_rootRetainCount(self);
}
```

复制

#### ② _objc_rootRetainCount

```javascript
uintptr_t
_objc_rootRetainCount(id obj)
{
    ASSERT(obj);

    return obj->rootRetainCount();
}
```

复制

#### ③ objc_object::rootRetainCount

```javascript
inline uintptr_t 
objc_object::rootRetainCount()
{
    // 如果是 tagged pointer，直接返回 this
    if (isTaggedPointer()) return (uintptr_t)this; 

    sidetable_lock();
    isa_t bits = LoadExclusive(&isa.bits); // 获取 isa 
    ClearExclusive(&isa.bits);
    // 如果 isa 是 nonpointer
    if (bits.nonpointer) { 
        uintptr_t rc = 1 + bits.extra_rc; // 引用计数 = 1 + isa 中 extra_rc 的值
        // 如果还额外使用 sidetable 存储引用计数
        if (bits.has_sidetable_rc) { 
            rc += sidetable_getExtraRC_nolock(); // 加上 sidetable 中引用计数的值
        }
        sidetable_unlock();
        return rc;
    }

    sidetable_unlock();
    // 如果 isa 不是 nonpointer，返回 sidetable_retainCount() 的值
    return sidetable_retainCount(); 
}
```

复制

#### ④ objc_object::sidetable_getExtraRC_nolock

```javascript
size_t 
objc_object::sidetable_getExtraRC_nolock()
{
    ASSERT(isa.nonpointer);
    SideTable& table = SideTables()[this];               // 获得 SideTable
    RefcountMap::iterator it = table.refcnts.find(this); // 获得 refcnts
    if (it == table.refcnts.end()) return 0;       // 如果没找到，返回 0
    else return it->second >> SIDE_TABLE_RC_SHIFT; // 如果找到了，通过 SIDE_TABLE_RC_SHIFT 位掩码获取对应的引用计数
}

#define SIDE_TABLE_RC_SHIFT 2
```

复制

如果`isa`是`nonpointer`，则对象的引用计数就存储在它的`isa_t`的`extra_rc`中以及`SideTable`的`RefCountMap`中。由于`extra_rc`存储的对象本身之外的引用计数值，所以需要加上对象本身的引用计数 1；再加上`SideTable`中存储的引用计数值，通过`sidetable_getExtraRC_nolock()`函数获取。

`sidetable_getExtraRC_nolock()`函数中进行了两次哈希查找：

- ① 第一次根据当前对象的内存地址，经过哈希查找从`SideTables()`中取出它所在的`SideTable`；
- ② 第二次根据当前对象的内存地址，经过哈希查找从`SideTable`中的`refcnts`中取出它的引用计数表。

#### objc_object::sidetable_retainCount

```javascript
uintptr_t
objc_object::sidetable_retainCount()
{
    SideTable& table = SideTables()[this];

    size_t refcnt_result = 1; // 设置对象本身的引用计数为1
    
    table.lock();
    RefcountMap::iterator it = table.refcnts.find(this);
    if (it != table.refcnts.end()) {
        // this is valid for SIDE_TABLE_RC_PINNED too
        refcnt_result += it->second >> SIDE_TABLE_RC_SHIFT; // 引用计数 = 1 + SideTable 中存储的引用计数
    }
    table.unlock();
    return refcnt_result;
}
```

复制

如果`isa`不是`nonpointer`，它直接存储着`Class`、`Meta-Class`对象的内存地址，没办法存储引用计数，所以引用计数都存储在`SideTable`中，这时候就通过`sidetable_retainCount()`获得引用计数。

>  **小结：**`retainCount`方法： 

- 在`arm64`之前，`isa`不是`nonpointer`。对象的引用计数全都存储在`SideTable`中，`retainCount`方法返回的是对象本身的引用计数值 1，加上`SideTable`中存储的值；
- 从`arm64`开始，`isa`是`nonpointer`。对象的引用计数先存储到它的`isa`中的`extra_rc`中，如果 19 位的`extra_rc`不够存储，那么溢出的部分再存储到`SideTable`中，`retainCount`方法返回的是对象本身的引用计数值 1，加上`isa`中的`extra_rc`存储的值，加上`SideTable`中存储的值。
- 所以，其实我们通过`retainCount`方法打印`alloc`创建的对象的引用计数为 1，这是`retainCount`方法的功劳，`alloc`方法并没有设置对象的引用计数。

>  **Why：**那也不对啊，`alloc`方法没有设置对象的引用计数为 1，而且它内部也没有调用`retainCount`方法啊。那我们通过`alloc`创建出来的对象的引用计数岂不是就是 0，那不是会直接`dealloc`吗？ `dealloc`方法是在`release`方法内部调用的。只有你直接调用了`dealloc`，或者调用了`release`且在`release`方法中判断对象的引用计数为 0 的时候，才会调用`dealloc`。详情请参阅`release`源码分析。 

### retain

在`《iOS - 老生常谈内存管理（二）：从 MRC 说起》`文章中已经讲解过，持有对象有两种方式，一是通过 `alloc`/`new`/`copy`/`mutableCopy`等方法创建对象，二是通过`retain`方法。`retain`方法会将对象的引用计数 +1。

`retain`方法的函数调用栈为：

```javascript
// NSObject.mm
① objc_retain
// objc-object.h 
② objc_object::retain
// NSObject.mm
③ retain
④ _objc_rootRetain
// objc-object.h
⑤ objc_object::rootRetain
// NSObject.mm
⑥ objc_object::sidetable_retain
   addc // objc-os.h
   objc_object::rootRetain_overflow
   objc_object::sidetable_addExtraRC_nolock
```

复制

#### ① objc_retain

```javascript
#if __OBJC2__
__attribute__((aligned(16), flatten, noinline))
id 
objc_retain(id obj)
{
    if (!obj) return obj;
    if (obj->isTaggedPointer()) return obj;
    return obj->retain();
}
#else
id objc_retain(id obj) { return [obj retain]; }
#endif
```

复制

如果是`__OBJC2__`，则调用`objc_object::retain`函数；否则调用`retain`方法。

#### ② objc_object::retain

```javascript
// Equivalent to calling [this retain], with shortcuts if there is no override
inline id 
objc_object::retain()
{
    ASSERT(!isTaggedPointer());

    if (fastpath(!ISA()->hasCustomRR())) {
        return rootRetain();
    }

    return ((id(*)(objc_object *, SEL))objc_msgSend)(this, @selector(retain));
}
```

复制

如果方法没有被重写，直接调用`objc_object::rootRetain`，这是快捷方式；否则调用`retain`方法。

#### ③ retain

```javascript
// Replaced by ObjectAlloc
- (id)retain {
    return _objc_rootRetain(self);
}
```

复制

#### ④ _objc_rootRetainCount

```javascript
NEVER_INLINE id
_objc_rootRetain(id obj)
{
    ASSERT(obj);

    return obj->rootRetain();
}
```

复制

#### ⑤ objc_object::rootRetain

```javascript
ALWAYS_INLINE id 
objc_object::rootRetain()
{
    return rootRetain(false, false);
}

ALWAYS_INLINE id 
objc_object::rootRetain(bool tryRetain, bool handleOverflow)
{
    // 如果是 tagged pointer，直接返回 this
    if (isTaggedPointer()) return (id)this; 

    bool sideTableLocked = false;
    bool transcribeToSideTable = false; // 是否需要将引用计数存储在 sideTable 中

    isa_t oldisa;
    isa_t newisa;

    do {
        transcribeToSideTable = false;
        // 获取 isa
        oldisa = LoadExclusive(&isa.bits);  
        newisa = oldisa; 
        // 如果 isa 不是 nonpointer
        if (slowpath(!newisa.nonpointer)) { 
            ClearExclusive(&isa.bits);
            if (rawISA()->isMetaClass()) return (id)this;
            if (!tryRetain && sideTableLocked) sidetable_unlock();
            // tryRetain == false，调用 sidetable_retain
            if (tryRetain) return sidetable_tryRetain() ? (id)this : nil;
            else return sidetable_retain(); 
        }
        // don't check newisa.fast_rr; we already called any RR overrides
        if (slowpath(tryRetain && newisa.deallocating)) {
            ClearExclusive(&isa.bits);
            if (!tryRetain && sideTableLocked) sidetable_unlock();
            return nil;
        }
        uintptr_t carry; // 用于判断 isa 的 extra_rc 是否溢出，这里指上溢，即存满
        newisa.bits = addc(newisa.bits, RC_ONE, 0, &carry);  // extra_rc++

        // 如果 extra_rc 上溢
        if (slowpath(carry)) { 
            // newisa.extra_rc++ overflowed
            // 如果 handleOverflow == false，调用 rootRetain_overflow
            if (!handleOverflow) { 
                ClearExclusive(&isa.bits);
                return rootRetain_overflow(tryRetain); 
            }
            // Leave half of the retain counts inline and 
            // prepare to copy the other half to the side table.
            // 保留一半的引用计数在 extra_rc 中
            // 准备把另一半引用计数存储到 Sidetable 中
            if (!tryRetain && !sideTableLocked) sidetable_lock();
            sideTableLocked = true;
            transcribeToSideTable = true;   // 设置 transcribeToSideTable 为 true
            newisa.extra_rc = RC_HALF;      // 设置 extra_rc 的值为 RC_HALF   # define RC_HALF  (1ULL<<18)
            newisa.has_sidetable_rc = true; // 设置 has_sidetable_rc 为 true
        }
    } while (slowpath(!StoreExclusive(&isa.bits, oldisa.bits, newisa.bits))); // 保存更新后的 isa.bits

    // 如果需要将溢出的引用计数存储到 sidetable 中
    if (slowpath(transcribeToSideTable)) { 
        // Copy the other half of the retain counts to the side table.
        // 将 RC_HALF 个引用计数存储到 Sidetable 中
        sidetable_addExtraRC_nolock(RC_HALF); 
    }

    if (slowpath(!tryRetain && sideTableLocked)) sidetable_unlock();
    return (id)this;
}
```

复制

#### ⑥ objc_object::sidetable_retain

我们先来看几个偏移量：

```javascript
// The order of these bits is important.
#define SIDE_TABLE_WEAKLY_REFERENCED (1UL<<0)
#define SIDE_TABLE_DEALLOCATING      (1UL<<1)  // MSB-ward of weak bit
#define SIDE_TABLE_RC_ONE            (1UL<<2)  // MSB-ward of deallocating bit
#define SIDE_TABLE_RC_PINNED         (1UL<<(WORD_BITS-1))

#define SIDE_TABLE_RC_SHIFT 2
#define SIDE_TABLE_FLAG_MASK (SIDE_TABLE_RC_ONE-1)
```

复制

- SIDE_TABLE_WEAKLY_REFERENCED：标记对象是否有弱引用
- SIDE_TABLE_DEALLOCATING：标记对象是否正在 dealloc
- SIDE_TABLE_RC_ONE：对象引用计数存储的开始位，引用计数存储在第 2～63 位
- SIDE_TABLE_RC_PINNED：引用计数的溢出标志位（最后一位）

以下是对象的引用计数表：

![img](https://ask.qcloudimg.com/http-save/yehe-6828465/gt44gr4dmx.png?imageView2/2/w/2560/h/7000)

```javascript
id
objc_object::sidetable_retain()
{
#if SUPPORT_NONPOINTER_ISA
    ASSERT(!isa.nonpointer);
#endif
    SideTable& table = SideTables()[this];          // 获取 SideTable
    
    table.lock();
    size_t& refcntStorage = table.refcnts[this];    // 获取 refcnt
    if (! (refcntStorage & SIDE_TABLE_RC_PINNED)) { // 如果获取到了，且未溢出
        refcntStorage += SIDE_TABLE_RC_ONE;         // 将引用计数加 1
    }
    table.unlock();

    return (id)this;
}
```

复制

如果`isa`不是`nonpointer`，就会调用`sidetable_retain`，经过两次哈希查找得到对象的引用计数表，将引用计数 +1。

#### addc

```javascript
static ALWAYS_INLINE uintptr_t 
addc(uintptr_t lhs, uintptr_t rhs, uintptr_t carryin, uintptr_t *carryout)
{
    return __builtin_addcl(lhs, rhs, carryin, carryout);
}
```

复制

如果`isa`是`nonpointer`，就会调用`addc`将`extra_rc`中的引用计数 +1。这个函数的作用就是增加引用计数。

#### objc_object::rootRetain_overflow

```javascript
NEVER_INLINE id 
objc_object::rootRetain_overflow(bool tryRetain)
{
    return rootRetain(tryRetain, true);
}
```

复制

如果`extra_rc`中存储满了，就会调用`rootRetain_overflow`，该函数又调用了`rootRetain`，但参数`handleOverflow`传`true`。

#### objc_object::sidetable_addExtraRC_nolock

```javascript
// Move some retain counts to the side table from the isa field.
// Returns true if the object is now pinned.
// 将一些引用计数从 isa 中转移到 sidetable
bool 
objc_object::sidetable_addExtraRC_nolock(size_t delta_rc)
{
    ASSERT(isa.nonpointer);
    SideTable& table = SideTables()[this];

    size_t& refcntStorage = table.refcnts[this];
    size_t oldRefcnt = refcntStorage;
    // isa-side bits should not be set here
    ASSERT((oldRefcnt & SIDE_TABLE_DEALLOCATING) == 0);
    ASSERT((oldRefcnt & SIDE_TABLE_WEAKLY_REFERENCED) == 0);

    if (oldRefcnt & SIDE_TABLE_RC_PINNED) return true;

    uintptr_t carry;
    size_t newRefcnt = 
        addc(oldRefcnt, delta_rc << SIDE_TABLE_RC_SHIFT, 0, &carry);
    if (carry) {
        refcntStorage =
            SIDE_TABLE_RC_PINNED | (oldRefcnt & SIDE_TABLE_FLAG_MASK);
        return true;
    }
    else {
        refcntStorage = newRefcnt;
        return false;
    }
}
```

复制

如果`extra_rc`中存储满了，就会调用`sidetable_addExtraRC_nolock`将`extra_rc`中的`RC_HALF`（`extra_rc`满值的一半）个引用计数转移到`sidetable`中存储，也是调用`addc`对`refcnt`引用计数表进行引用计数增加操作。

>  **小结：**`retain`方法： 

- 如果`isa`不是`nonpointer`，那么就对`Sidetable`中的引用计数进行 +1；
- 如果`isa`是`nonpointer`，就将`isa`中的`extra_rc`存储的引用计数进行 +1，如果溢出，就将`extra_rc`中`RC_HALF`（`extra_rc`满值的一半）个引用计数转移到`sidetable`中存储。 从`rootRetain`函数中我们可以看到，如果`extra_rc`溢出，设置它的值为`RC_HALF`，这时候又对`sidetable`中的`refcnt`增加引用计数`RC_HALF`。`extra_rc`是`19`位，而`RC_HALF`宏是`(1ULL<<18)`，实际上相等于进行了 +1 操作。

### release

当我们在不需要使用（持有）对象的时候，需要调用一下`release`方法进行释放。`release`方法会将对象的引用计数 -1。

`release`方法的函数调用栈为：

```javascript
// NSObject.mm
① objc_release
// objc-object.h 
② objc_object::release
// NSObject.mm
③ release
④ _objc_rootRelease
// objc-object.h
⑤ objc_object::rootRelease
// NSObject.mm
⑥ objc_object::sidetable_release
   subc // objc-os.h
   objc_object::rootRelease_underflow
   objc_object::sidetable_subExtraRC_nolock
   objc_object::overrelease_error
```

复制

#### ① objc_release

```javascript
#if __OBJC2__
__attribute__((aligned(16), flatten, noinline))
void 
objc_release(id obj)
{
    if (!obj) return;
    if (obj->isTaggedPointer()) return;
    return obj->release();
}
#else
void objc_release(id obj) { [obj release]; }
#endif
```

复制

如果是`__OBJC2__`，则调用`objc_object::release`函数；否则调用`release`方法。

#### ② objc_object::release

```javascript
// Equivalent to calling [this release], with shortcuts if there is no override
inline void
objc_object::release()
{
    ASSERT(!isTaggedPointer());

    if (fastpath(!ISA()->hasCustomRR())) {
        rootRelease();
        return;
    }

    ((void(*)(objc_object *, SEL))objc_msgSend)(this, @selector(release));
}
```

复制

如果方法没有被重写，直接调用`objc_object::rootRelease`，这是快捷方式；否则调用`release`方法。

#### ③ release

```javascript
// Replaced by ObjectAlloc
- (oneway void)release {
    _objc_rootRelease(self);
}
```

复制

#### ④ _objc_rootRelease

```javascript
NEVER_INLINE void
_objc_rootRelease(id obj)
{
    ASSERT(obj);

    obj->rootRelease();
}
```

复制

#### ⑤ objc_object::rootRelease

```javascript
ALWAYS_INLINE bool 
objc_object::rootRelease()
{
    return rootRelease(true, false);
}

ALWAYS_INLINE bool 
objc_object::rootRelease(bool performDealloc, bool handleUnderflow)
{
    // 如果是 tagged pointer，直接返回 false
    if (isTaggedPointer()) return false; 

    bool sideTableLocked = false;

    isa_t oldisa;
    isa_t newisa;

 retry:
    do {
        // 获取 isa
        oldisa = LoadExclusive(&isa.bits);
        newisa = oldisa;
        // 如果 isa 不是 nonpointer
        if (slowpath(!newisa.nonpointer)) { 
            ClearExclusive(&isa.bits);
            if (rawISA()->isMetaClass()) return false;
            if (sideTableLocked) sidetable_unlock();
            // 调用 sidetable_release
            return sidetable_release(performDealloc); 
        }
        // don't check newisa.fast_rr; we already called any RR overrides
        uintptr_t carry;
        newisa.bits = subc(newisa.bits, RC_ONE, 0, &carry);  // extra_rc--
        // 如果发现溢出的情况，这里是下溢，指 extra_rc 中的引用计数已经为 0 了
        if (slowpath(carry)) { 
            // don't ClearExclusive()
            // 执行 underflow 处理下溢
            goto underflow; 
        }
    } while (slowpath(!StoreReleaseExclusive(&isa.bits, 
                                             oldisa.bits, newisa.bits))); // 保存更新后的 isa.bits

    if (slowpath(sideTableLocked)) sidetable_unlock();
    return false;

 underflow:
    // newisa.extra_rc-- underflowed: borrow from side table or deallocate
    // abandon newisa to undo the decrement
    // extra_rc-- 下溢，从 sidetable 借用或者 dealloc 对象
    newisa = oldisa;

    // 如果 isa 的 has_sidetable_rc 字段值为 1
    if (slowpath(newisa.has_sidetable_rc)) { 
        // 如果 handleUnderflow == false，调用 rootRelease_underflow
        if (!handleUnderflow) { 
            ClearExclusive(&isa.bits);
            return rootRelease_underflow(performDealloc); 
        }

        // Transfer retain count from side table to inline storage.
        // 将引用计数从 sidetable 中转到 extra_rc 中存储

        if (!sideTableLocked) {
            ClearExclusive(&isa.bits);
            sidetable_lock();
            sideTableLocked = true;
            // Need to start over to avoid a race against 
            // the nonpointer -> raw pointer transition.
            goto retry;
        }

        // Try to remove some retain counts from the side table.        
        // 尝试从 sidetable 中删除（借出）一些引用计数，传入 RC_HALF
        // borrowed 为 sidetable 实际删除（借出）的引用计数
        size_t borrowed = sidetable_subExtraRC_nolock(RC_HALF); 

        // To avoid races, has_sidetable_rc must remain set 
        // even if the side table count is now zero.
        // 为了避免竞争，has_sidetable_rc 必须保持设置
        // 即使 sidetable 中的引用计数现在是 0

        if (borrowed > 0) { // 如果 borrowed > 0
            // Side table retain count decreased.
            // Try to add them to the inline count.
            // 将它进行 -1，赋值给 extra_rc 
            newisa.extra_rc = borrowed - 1;  // redo the original decrement too
            // 存储更改后的 isa.bits
            bool stored = StoreReleaseExclusive(&isa.bits, 
                                                oldisa.bits, newisa.bits); 
            // 如果存储失败，立刻重试一次
            if (!stored) { 
                // Inline update failed. 
                // Try it again right now. This prevents livelock on LL/SC 
                // architectures where the side table access itself may have 
                // dropped the reservation.
                isa_t oldisa2 = LoadExclusive(&isa.bits);
                isa_t newisa2 = oldisa2;
                if (newisa2.nonpointer) {
                    uintptr_t overflow;
                    newisa2.bits = 
                        addc(newisa2.bits, RC_ONE * (borrowed-1), 0, &overflow);
                    if (!overflow) {
                        stored = StoreReleaseExclusive(&isa.bits, oldisa2.bits, 
                                                       newisa2.bits);
                    }
                }
            }
            // 如果还是存储失败，把引用计数再重新保存到 sidetable 中
            if (!stored) {
                // Inline update failed.
                // Put the retains back in the side table.
                sidetable_addExtraRC_nolock(borrowed);
                goto retry;
            }

            // Decrement successful after borrowing from side table.
            // This decrement cannot be the deallocating decrement - the side 
            // table lock and has_sidetable_rc bit ensure that if everyone 
            // else tried to -release while we worked, the last one would block.
            sidetable_unlock();
            return false;
        }
        else {
            // Side table is empty after all. Fall-through to the dealloc path.
        }
    }

    // 如果引用计数为 0，dealloc 对象
    // Really deallocate.
    // 如果当前 newisa 处于 deallocating 状态，保证对象只会 dealloc 一次
    if (slowpath(newisa.deallocating)) { 
        ClearExclusive(&isa.bits);
        if (sideTableLocked) sidetable_unlock();
        // 调用 overrelease_error
        return overrelease_error(); 
        // does not actually return
    }
    // 设置 newisa 为 deallocating 状态
    newisa.deallocating = true; 
    // 如果存储失败，继续重试
    if (!StoreExclusive(&isa.bits, oldisa.bits, newisa.bits)) goto retry; 

    if (slowpath(sideTableLocked)) sidetable_unlock();

    __c11_atomic_thread_fence(__ATOMIC_ACQUIRE);

    // 如果 performDealloc == true，给对象发送一条 dealloc 消息
    if (performDealloc) { 
        ((void(*)(objc_object *, SEL))objc_msgSend)(this, @selector(dealloc));
    }
    return true;
}
```

复制

#### ⑥ objc_object::sidetable_release

```javascript
// rdar://20206767
// return uintptr_t instead of bool so that the various raw-isa 
// -release paths all return zero in eax
uintptr_t
objc_object::sidetable_release(bool performDealloc)
{
#if SUPPORT_NONPOINTER_ISA
    ASSERT(!isa.nonpointer);
#endif
    // 获取 SideTable
    SideTable& table = SideTables()[this]; 

    bool do_dealloc = false; // 标识是否需要执行 dealloc 方法

    table.lock();
    auto it = table.refcnts.try_emplace(this, SIDE_TABLE_DEALLOCATING);
    // 获取 refcnts
    auto &refcnt = it.first->second; 
    if (it.second) {
        do_dealloc = true;
    // 如果对象处于 deallocating 状态
    } else if (refcnt < SIDE_TABLE_DEALLOCATING) { 
        // SIDE_TABLE_WEAKLY_REFERENCED may be set. Don't change it.
        do_dealloc = true;
        refcnt |= SIDE_TABLE_DEALLOCATING;
    // 如果引用计数有值
    } else if (! (refcnt & SIDE_TABLE_RC_PINNED)) { 
        // 引用计数 -1
        refcnt -= SIDE_TABLE_RC_ONE; 
    }
    table.unlock();
    // 如果符合判断条件，dealloc 对象
    if (do_dealloc  &&  performDealloc) { 
        ((void(*)(objc_object *, SEL))objc_msgSend)(this, @selector(dealloc));
    }
    return do_dealloc;
}
```

复制

如果`isa`不是`nonpointer`，那么就对`Sidetable`中的引用计数进行 -1，如果引用计数 =0，就`dealloc`对象；

#### subc

```javascript
static ALWAYS_INLINE uintptr_t 
subc(uintptr_t lhs, uintptr_t rhs, uintptr_t carryin, uintptr_t *carryout)
{
    return __builtin_subcl(lhs, rhs, carryin, carryout);
}
```

复制

`subc`就是`addc`的反操作，用来减少引用计数。

#### objc_object::rootRelease_underflow

```javascript
NEVER_INLINE bool 
objc_object::rootRelease_underflow(bool performDealloc)
{
    return rootRelease(performDealloc, true);
}
```

复制

如果`extra_rc`下溢，就会调用`rootRelease_underflow`，该函数又调用了`rootRelease`，但参数`handleUnderflow`传`true`。

#### objc_object::sidetable_subExtraRC_nolock

```javascript
// Move some retain counts from the side table to the isa field.
// Returns the actual count subtracted, which may be less than the request.
size_t 
objc_object::sidetable_subExtraRC_nolock(size_t delta_rc)
{
    ASSERT(isa.nonpointer);
    // 获取 SideTable
    SideTable& table = SideTables()[this];

    // 获取 refcnt
    RefcountMap::iterator it = table.refcnts.find(this);
    if (it == table.refcnts.end()  ||  it->second == 0) {
        // Side table retain count is zero. Can't borrow.
        return 0;
    }
    size_t oldRefcnt = it->second;

    // isa-side bits should not be set here
    ASSERT((oldRefcnt & SIDE_TABLE_DEALLOCATING) == 0);
    ASSERT((oldRefcnt & SIDE_TABLE_WEAKLY_REFERENCED) == 0);

    // 减少引用计数
    size_t newRefcnt = oldRefcnt - (delta_rc << SIDE_TABLE_RC_SHIFT);
    ASSERT(oldRefcnt > newRefcnt);  // shouldn't underflow
    it->second = newRefcnt;
    return delta_rc;
}
```

复制

`sidetable_subExtraRC_nolock`目的就是请求将`sidetable`中存储的一些引用计数值转移到`isa`中。返回减去的实际引用计数，该值可能小于请求值。

#### objc_object::overrelease_error

```javascript
NEVER_INLINE uintptr_t
objc_object::overrelease_error()
{
    _objc_inform_now_and_on_crash("%s object %p overreleased while already deallocating; break on objc_overrelease_during_dealloc_error to debug", object_getClassName((id)this), this);
    objc_overrelease_during_dealloc_error();
    return 0; // allow rootRelease() to tail-call this
}
```

复制

如果当前对象处于`deallocating`状态，再次`release`就会执行`overrelease_error`，该函数就是用来在过度调用`release`的时候报错用的。

>  **小结：**`release`方法： 

- 如果`isa`不是`nonpointer`，那么就对`Sidetable`中的引用计数进行 -1，如果引用计数 =0，就`dealloc`对象；
- 如果`isa`是`nonpointer`，就将`isa`中的`extra_rc`存储的引用计数进行 -1。如果下溢，即`extra_rc`中的引用计数已经为 0，判断`has_sidetable_rc`是否为`true`即是否有使用`Sidetable`存储。如果有的话就申请从`Sidetable`中申请`RC_HALF`个引用计数转移到`extra_rc`中存储，如果不足`RC_HALF`就有多少申请多少，然后将`Sidetable`中的引用计数值减去`RC_HALF`（或是小于`RC_HALF`的实际值），将实际申请到的引用计数值 -1 后存储到`extra_rc`中。如果`extra_rc`中引用计数为 0 且`has_sidetable_rc`为`false`或者`Sidetable`中的引用计数也为 0 了，那就`dealloc`对象。  为什么需要这么做呢？直接先从`Sidetable`中对引用计数进行 -1 操作不行吗？ 我想应该是为了性能吧，毕竟访问对象的`isa`更快。

### autorelease

`autorelease`方法的函数调用栈为：

```javascript
// NSObject.mm
① objc_autorelease
// objc-object.h 
② objc_object::autorelease
// NSObject.mm
③ autorelease
④ _objc_rootAutorelease
// objc-object.h
⑤ objc_object::rootAutorelease
// NSObject.mm
⑥ objc_object::rootAutorelease2
```

复制

#### ① objc_autorelease

```javascript
#if __OBJC2__
__attribute__((aligned(16), flatten, noinline))
id
objc_autorelease(id obj)
{
    if (!obj) return obj;
    if (obj->isTaggedPointer()) return obj;
    return obj->autorelease();
}
#else
id objc_autorelease(id obj) { return [obj autorelease]; }
#endif
```

复制

如果是`__OBJC2__`，则调用`objc_object::autorelease`函数；否则调用`autorelease`方法。

#### ② objc_object::autorelease

```javascript
// Equivalent to [this autorelease], with shortcuts if there is no override
inline id 
objc_object::autorelease()
{
    ASSERT(!isTaggedPointer());
    if (fastpath(!ISA()->hasCustomRR())) {
        return rootAutorelease();
    }

    return ((id(*)(objc_object *, SEL))objc_msgSend)(this, @selector(autorelease));
}
```

复制

如果方法没有被重写，直接调用`objc_object::rootAutorelease`，这是快捷方式；否则调用`autorelease`方法。

#### ③ autorelease

```javascript
// Replaced by ObjectAlloc
- (id)autorelease {
    return _objc_rootAutorelease(self);
}
```

复制

#### ④ _objc_rootAutorelease

```javascript
NEVER_INLINE id
_objc_rootAutorelease(id obj)
{
    ASSERT(obj);
    return obj->rootAutorelease();
}
```

复制

#### ⑤ objc_object::rootAutorelease

```javascript
// Base autorelease implementation, ignoring overrides.
inline id 
objc_object::rootAutorelease()
{
    if (isTaggedPointer()) return (id)this;
    if (prepareOptimizedReturn(ReturnAtPlus1)) return (id)this;

    return rootAutorelease2();
}
```

复制

#### ⑥ objc_object::rootAutorelease2

```javascript
__attribute__((noinline,used))
id 
objc_object::rootAutorelease2()
{
    assert(!isTaggedPointer());
    return AutoreleasePoolPage::autorelease((id)this);
}
```

复制

在该函数中调用了`AutoreleasePoolPage`类的`autorelease`方法。 关于`AutoreleasePoolPage`类以及`autorelease`与`@autoreleasepool`，可参阅[《iOS - 聊聊 autorelease 和 @autoreleasepool》](https://links.jianshu.com/go?to=https%3A%2F%2Fjuejin.im%2Fpost%2F5e6fac36e51d4526e75003ef)。

### dealloc

`dealloc`方法的函数调用栈为：

```javascript
// NSObject.mm
① dealloc
② _objc_rootDealloc
// objc-object.h
③ rootDealloc
// objc-runtime-new.mm
④ object_dispose
⑤ objc_destructInstance
// objc-object.h
⑥ clearDeallocating
// NSObject.mm
⑦ sidetable_clearDeallocating
   clearDeallocating_slow
```

复制

#### ① dealloc

```javascript
// Replaced by NSZombies
- (void)dealloc {
    _objc_rootDealloc(self);
}
```

复制

#### ② _objc_rootDealloc

```javascript
void
_objc_rootDealloc(id obj)
{
    ASSERT(obj);

    obj->rootDealloc();
}
```

复制

#### ③ rootDealloc

```javascript
inline void
objc_object::rootDealloc()
{
    // 判断是否为 TaggerPointer 内存管理方案，是的话直接 return
    if (isTaggedPointer()) return;  // fixme necessary? * 

    if (fastpath(isa.nonpointer  &&          // 如果 isa 为 nonpointer
                 !isa.weakly_referenced  &&  // 没有弱引用
                 !isa.has_assoc  &&          // 没有关联对象
                 !isa.has_cxx_dtor  &&       // 没有 C++ 的析构函数
                 !isa.has_sidetable_rc))     // 没有额外采用 SideTabel 进行引用计数存储
    {
        assert(!sidetable_present());
        free(this);               // 如果以上条件成立，直接调用 free 函数销毁对象
    } 
    else {
        object_dispose((id)this); // 如果以上条件不成立，调用 object_dispose 函数
    }
}
```

复制

#### ④ object_dispose

```javascript
/***********************************************************************
* object_dispose
* fixme
* Locking: none
**********************************************************************/
id 
object_dispose(id obj)
{
    if (!obj) return nil;

    objc_destructInstance(obj); // 调用 objc_destructInstance 函数
    free(obj);                  // 调用 free 函数销毁对象

    return nil;
}
```

复制

#### ⑤ objc_destructInstance

```javascript
/***********************************************************************
* objc_destructInstance
* Destroys an instance without freeing memory. 
* Calls C++ destructors.
* Calls ARC ivar cleanup.
* Removes associative references.
* Returns `obj`. Does nothing if `obj` is nil.
**********************************************************************/
void *objc_destructInstance(id obj) 
{
    if (obj) {
        // Read all of the flags at once for performance.
        bool cxx = obj->hasCxxDtor();
        bool assoc = obj->hasAssociatedObjects();

        // This order is important.
        if (cxx) object_cxxDestruct(obj);           // 如果有 C++ 的析构函数，调用 object_cxxDestruct 函数
        if (assoc) _object_remove_assocations(obj); // 如果有关联对象，调用 _object_remove_assocations 函数，移除关联对象
        obj->clearDeallocating();                   // 调用 clearDeallocating 函数
    }

    return obj;
}
```

复制

#### ⑥ clearDeallocating

```javascript
inline void 
objc_object::clearDeallocating()
{
    // 如果 isa 不是 nonpointer
    if (slowpath(!isa.nonpointer)) {     
        // Slow path for raw pointer isa.
        // 调用 sidetable_clearDeallocating 函数
        sidetable_clearDeallocating();   
    }
    // 如果 isa 是 nonpointer，且有弱引用或者有额外使用 SideTable 存储引用计数
    else if (slowpath(isa.weakly_referenced  ||  isa.has_sidetable_rc)) { 
        // Slow path for non-pointer isa with weak refs and/or side table data.
        // 调用 clearDeallocating_slow 函数
        clearDeallocating_slow();        
    }

    assert(!sidetable_present());
}
```

复制

#### ⑦ sidetable_clearDeallocating

```javascript
void 
objc_object::sidetable_clearDeallocating()
{
    // 获取 SideTable
    SideTable& table = SideTables()[this]; 

    // clear any weak table items
    // clear extra retain count and deallocating bit
    // (fixme warn or abort if extra retain count == 0 ?)
    table.lock();
    // 获取 refcnts
    RefcountMap::iterator it = table.refcnts.find(this); 
    if (it != table.refcnts.end()) {
        if (it->second & SIDE_TABLE_WEAKLY_REFERENCED) {
            // 调用 weak_clear_no_lock：将指向该对象的弱引用指针置为 nil
            weak_clear_no_lock(&table.weak_table, (id)this); 
        }
        // 调用 table.refcnts.erase：从引用计数表中擦除该对象的引用计数
        table.refcnts.erase(it); 
    }
    table.unlock();
}
```

复制

#### clearDeallocating_slow

```javascript
// Slow path of clearDeallocating() 
// for objects with nonpointer isa
// that were ever weakly referenced 
// or whose retain count ever overflowed to the side table.
NEVER_INLINE void
objc_object::clearDeallocating_slow()
{
    ASSERT(isa.nonpointer  &&  (isa.weakly_referenced || isa.has_sidetable_rc));

    // 获取 SideTable
    SideTable& table = SideTables()[this]; 
    table.lock();
    // 如果有弱引用
    if (isa.weakly_referenced) { 
        // 调用 weak_clear_no_lock：将指向该对象的弱引用指针置为 nil
        weak_clear_no_lock(&table.weak_table, (id)this);
    }
    // 如果有使用 SideTable 存储引用计数
    if (isa.has_sidetable_rc) {  
        // 调用 table.refcnts.erase：从引用计数表中擦除该对象的引用计数
        table.refcnts.erase(this);
    }
    table.unlock();
}
```

复制

>  **小结：**`dealloc`方法： 

- ① 判断 5 个条件（1.`isa`为`nonpointer`；2.没有弱引用；3.没有关联对象；4.没有`C++`的析构函数；5.没有额外采用`SideTabel`进行引用计数存储），如果这 5 个条件都成立，直接调用`free`函数销毁对象，否则调用`object_dispose`做一些释放对象前的处理；
- ② 1.如果有`C++`的析构函数，调用`object_cxxDestruct`；  2.如果有关联对象，调用`_object_remove_assocations`函数，移除关联对象；  3.调用`weak_clear_no_lock`将指向该对象的弱引用指针置为`nil`；  4.调用`table.refcnts.erase`从引用计数表中擦除该对象的引用计数（如果`isa`为`nonpointer`，还要先判断`isa.has_sidetable_rc`）
- ③ 调用`free`函数销毁对象。

 根据`dealloc`过程，`__weak`修饰符的变量在对象被`dealloc`时，会将该`__weak`置为`nil`。可见，如果大量使用`__weak`变量的话，则会消耗相应的 CPU 资源，所以建议只在需要避免循环引用的时候使用`__weak`修饰符。 在`《iOS - 老生常谈内存管理（三）：ARC 面世 —— 所有权修饰符》`章节中提到，`__weak`对性能会有一定的消耗，当一个对象`dealloc`时，需要遍历对象的`weak`表，把表里的所有`weak`指针变量值置为`nil`，指向对象的`weak`指针越多，性能消耗就越多。所以`__unsafe_unretained`比`__weak`快。当明确知道对象的生命周期时，选择`__unsafe_unretained`会有一些性能提升。 

### weak

#### 清除 weak

以上从`dealloc`方法实现我们知道了在对象`dealloc`的时候，会调用`weak_clear_no_lock`函数将指向该对象的弱引用指针置为`nil`，那么该函数的具体实现是怎样的呢？

##### weak_clear_no_lock

```javascript
// objc-weak.mm
/** 
 * Called by dealloc; nils out all weak pointers that point to the 
 * provided object so that they can no longer be used.
 * 
 * @param weak_table 
 * @param referent The object being deallocated. 
 */
void 
weak_clear_no_lock(weak_table_t *weak_table, id referent_id) 
{
    // 获得 weak 指向的地址，即对象内存地址
    objc_object *referent = (objc_object *)referent_id; 
    
    // 找到管理 referent 的 entry 容器
    weak_entry_t *entry = weak_entry_for_referent(weak_table, referent); 
    // 如果 entry == nil，表示没有弱引用需要置为 nil，直接返回
    if (entry == nil) { 
        /// XXX shouldn't happen, but does with mismatched CF/objc
        //printf("XXX no entry for clear deallocating %p\n", referent);
        return;
    }

    // zero out references
    weak_referrer_t *referrers;
    size_t count;
    
    if (entry->out_of_line()) { 
        // referrers 是一个数组，存储所有指向 referent_id 的弱引用
        referrers = entry->referrers; 
        // 弱引用数组长度
        count = TABLE_SIZE(entry);    
    } 
    else {
        referrers = entry->inline_referrers;
        count = WEAK_INLINE_COUNT;
    }
    
    // 遍历弱引用数组，将所有指向 referent_id 的弱引用全部置为 nil
    for (size_t i = 0; i < count; ++i) {
        objc_object **referrer = referrers[i];
        if (referrer) {
            if (*referrer == referent) {
                *referrer = nil;
            }
            else if (*referrer) {
                _objc_inform("__weak variable at %p holds %p instead of %p. "
                             "This is probably incorrect use of "
                             "objc_storeWeak() and objc_loadWeak(). "
                             "Break on objc_weak_error to debug.\n", 
                             referrer, (void*)*referrer, (void*)referent);
                objc_weak_error();
            }
        }
    }
    
    // 从 weak_table 中移除对应的弱引用的管理容器
    weak_entry_remove(weak_table, entry);
}
```

复制

>  **小结：**清除`weak`。  当一个对象被销毁时，在`dealloc`方法内部经过一系列的函数调用栈，通过两次哈希查找，第一次根据对象的地址找到它所在的`Sidetable`，第二次根据对象的地址在`Sidetable`的`weak_table`中找到它的弱引用表。弱引用表中存储的是对象的地址（作为`key`）和`weak`指针地址的数组（作为`value`）的映射。`weak_clear_no_lock`函数中遍历弱引用数组，将指向对象的地址的`weak`变量全都置为`nil`。 

#### 添加 weak

接下来我们来看一下`weak`变量是怎样添加到弱引用表中的。

一个被声明为`__weak`的指针，在经过编译之后。通过`objc_initWeak`函数初始化附有`__weak`修饰符的变量，在变量作用域结束时通过`objc_destroyWeak`函数销毁该变量。

```javascript
{
    id obj = [[NSObject alloc] init];
    id __weak obj1 = obj;
}
    /*----- 编译 -----*/
    id obj1;
    objc_initWeak(&obj1,obj);
    objc_destroyWeak(&obj1);
```

复制

`objc_initWeak`函数调用栈如下：

```javascript
// NSObject.mm
① objc_initWeak
② storeWeak
// objc-weak.mm
③ weak_register_no_lock
   weak_unregister_no_lock
```

复制

##### ① objc_initWeak

```javascript
/** 
 * Initialize a fresh weak pointer to some object location. 
 * It would be used for code like: 
 *
 * (The nil case) 
 * __weak id weakPtr;
 * (The non-nil case) 
 * NSObject *o = ...;
 * __weak id weakPtr = o;
 * 
 * This function IS NOT thread-safe with respect to concurrent 
 * modifications to the weak variable. (Concurrent weak clear is safe.)
 *
 * @param location Address of __weak ptr. 
 * @param newObj Object ptr. 
 */
id
objc_initWeak(id *location, id newObj) // *location 为 __weak 指针地址，newObj 为对象地址
{
    // 如果对象为 nil，那就将 weak 指针置为 nil
    if (!newObj) {
        *location = nil;
        return nil;
    }

    return storeWeak<DontHaveOld, DoHaveNew, DoCrashIfDeallocating>
        (location, (objc_object*)newObj);
}
```

复制

##### ② storeWeak

```javascript
// Update a weak variable.
// If HaveOld is true, the variable has an existing value 
//   that needs to be cleaned up. This value might be nil.
// If HaveNew is true, there is a new value that needs to be 
//   assigned into the variable. This value might be nil.
// If CrashIfDeallocating is true, the process is halted if newObj is 
//   deallocating or newObj's class does not support weak references. 
// If CrashIfDeallocating is false, nil is stored instead.
// 更新 weak 变量
// 如果 HaveOld == true，表示变量有旧值，它需要被清理，这个旧值可能为 nil
// 如果 HaveNew == true，表示一个新值需要赋值给变量，这个新值可能为 nil
// 如果 CrashIfDeallocating == true，则如果对象正在销毁或者对象不支持弱引用，则停止更新
// 如果 CrashIfDeallocating == false，则存储 nil
enum CrashIfDeallocating {
    DontCrashIfDeallocating = false, DoCrashIfDeallocating = true
};
template <HaveOld haveOld, HaveNew haveNew,
          CrashIfDeallocating crashIfDeallocating>
static id 
storeWeak(id *location, objc_object *newObj)
{
    assert(haveOld  ||  haveNew);
    if (!haveNew) assert(newObj == nil);

    Class previouslyInitializedClass = nil;
    id oldObj;
    SideTable *oldTable;  // 旧表，用来存放已有的 weak 变量
    SideTable *newTable;  // 新表，用来存放新的 weak 变量

    // Acquire locks for old and new values.
    // Order by lock address to prevent lock ordering problems. 
    // Retry if the old value changes underneath us.
 retry:
    // 分别获取新旧值相关联的弱引用表
    // 如果 weak 变量有旧值，获取已有对象（该旧值对象）和旧表
    if (haveOld) {
        oldObj = *location;
        oldTable = &SideTables()[oldObj];
    } else {
        oldTable = nil;
    }
    // 如果有新值要赋值给变量，创建新表
    if (haveNew) {
        newTable = &SideTables()[newObj];
    } else {
        newTable = nil;
    }
    
    // 对 haveOld 和 haveNew 分别加锁
    SideTable::lockTwo<haveOld, haveNew>(oldTable, newTable);

    // 判断 oldObj 和 location 指向的值是否相等，即是否是同一对象，如果不是就重新获取旧值相关联的表
    if (haveOld  &&  *location != oldObj) {
        // 解锁
        SideTable::unlockTwo<haveOld, haveNew>(oldTable, newTable);
        goto retry;
    }

    // Prevent a deadlock between the weak reference machinery
    // and the +initialize machinery by ensuring that no 
    // weakly-referenced object has an un-+initialized isa.
    // 如果有新值，判断新值所属的类是否已经初始化
    // 如果没有初始化，则先执行初始化，防止 +initialize 内部调用 storeWeak 产生死锁
    if (haveNew  &&  newObj) {
        Class cls = newObj->getIsa();
        if (cls != previouslyInitializedClass  &&  
            !((objc_class *)cls)->isInitialized()) 
        {
            SideTable::unlockTwo<haveOld, haveNew>(oldTable, newTable);
            class_initialize(cls, (id)newObj);

            // If this class is finished with +initialize then we're good.
            // If this class is still running +initialize on this thread 
            // (i.e. +initialize called storeWeak on an instance of itself)
            // then we may proceed but it will appear initializing and 
            // not yet initialized to the check above.
            // Instead set previouslyInitializedClass to recognize it on retry.
            previouslyInitializedClass = cls;

            goto retry;
        }
    }

    // 如果有旧值，调用 weak_unregister_no_lock 清除旧值
    // Clean up old value, if any.
    if (haveOld) {
        // 移除所有指向旧值的 weak 引用，而不是赋值为 nil
        weak_unregister_no_lock(&oldTable->weak_table, oldObj, location);
    }

    // 如果有新值要赋值，调用 weak_register_no_lock 将所有 weak 指针重新指向新的对象
    // Assign new value, if any.
    if (haveNew) {
        newObj = (objc_object *)
            weak_register_no_lock(&newTable->weak_table, (id)newObj, location, 
                                  crashIfDeallocating);
        // weak_register_no_lock returns nil if weak store should be rejected

        // 如果存储成功
        // 如果对象是 Tagged Pointer，不做操作
        // 如果 isa 不是 nonpointer，设置 SideTable 中弱引用标志位
        // 如果 isa 是 nonpointer，设置 isa 的 weakly_referenced 弱引用标志位
        // Set is-weakly-referenced bit in refcount table.
        if (newObj  &&  !newObj->isTaggedPointer()) {
            newObj->setWeaklyReferenced_nolock();
        }
 
        // 将 location 指向新的对象
        // Do not set *location anywhere else. That would introduce a race.
        *location = (id)newObj;
    }
    else {
        // No new value. The storage is not changed.
    }
    
    // 解锁
    SideTable::unlockTwo<haveOld, haveNew>(oldTable, newTable);

    return (id)newObj;
}
```

复制

`store_weak`函数的执行过程如下：

- 分别获取新旧值相关联的弱引用表；
- 如果有旧值，就调用`weak_unregister_no_lock`函数清除旧值，移除所有指向旧值的`weak`引用，而不是赋值为`nil`；
- 如果有新值，就调用`weak_register_no_lock`函数分配新值，将所有`weak`指针重新指向新的对象；
- 判断`isa`是否为`nonpointer`来设置弱引用标志位。如果不是`nonpointer`，设置`SideTable`中的弱引用标志位，否则设置`isa`的`weakly_referenced`弱引用标志位。

##### ③ weak_register_no_lock

```javascript
/** 
 * Registers a new (object, weak pointer) pair. Creates a new weak
 * object entry if it does not exist.
 * 
 * @param weak_table The global weak table.
 * @param referent The object pointed to by the weak reference.
 * @param referrer The weak pointer address.
 */
id 
weak_register_no_lock(weak_table_t *weak_table, id referent_id, 
                      id *referrer_id, bool crashIfDeallocating)
{
    objc_object *referent = (objc_object *)referent_id;
    objc_object **referrer = (objc_object **)referrer_id;

    if (!referent  ||  referent->isTaggedPointer()) return referent_id;

    // ensure that the referenced object is viable
    bool deallocating;
    if (!referent->ISA()->hasCustomRR()) {
        deallocating = referent->rootIsDeallocating();
    }
    else {
        BOOL (*allowsWeakReference)(objc_object *, SEL) = 
            (BOOL(*)(objc_object *, SEL))
            object_getMethodImplementation((id)referent, 
                                           SEL_allowsWeakReference);
        if ((IMP)allowsWeakReference == _objc_msgForward) {
            return nil;
        }
        deallocating =
            ! (*allowsWeakReference)(referent, SEL_allowsWeakReference);
    }

    if (deallocating) {
        if (crashIfDeallocating) {
            _objc_fatal("Cannot form weak reference to instance (%p) of "
                        "class %s. It is possible that this object was "
                        "over-released, or is in the process of deallocation.",
                        (void*)referent, object_getClassName((id)referent));
        } else {
            return nil;
        }
    }

    // now remember it and where it is being stored
    weak_entry_t *entry;
    if ((entry = weak_entry_for_referent(weak_table, referent))) {
        append_referrer(entry, referrer);
    } 
    else {
        weak_entry_t new_entry(referent, referrer);
        weak_grow_maybe(weak_table);
        weak_entry_insert(weak_table, &new_entry);
    }

    // Do not set *referrer. objc_storeWeak() requires that the 
    // value not change.

    return referent_id;
}
```

复制

`weak_register_no_lock`用来保存弱引用信息，具体实现如下：

- 判断对象是否正在释放，是否支持弱引用`allowsWeakReference`，如果实例对象的`allowsWeakReference`方法返回`NO`，则调用`_objc_fatal`并在控制台打印`"Cannot form weak reference to instance (%p) of class %s. It is possible that this object was over-released, or is in the process of deallocation."`； （关于`allowsWeakReference`已经在[《iOS - 老生常谈内存管理（三）：ARC 面世》](https://links.jianshu.com/go?to=https%3A%2F%2Fjuejin.im%2Fpost%2F5e99ae39e51d45470c12c516)中讲到）
- 查询`weak_table`，判断弱引用表中是否已经保存有与对象相关联的弱引用信息；
- 如果已经有相关弱引用信息，则调用`append_referrer`函数将弱引用信息添加进现在`entry`[容器](https://cloud.tencent.com/product/tke?from=20065&from_column=20065)中；如果没有相关联信息，则创建一个`entry`，并且插入到`weak_table`弱引用表中。

##### weak_unregister_no_lock

```javascript
/** 
 * Unregister an already-registered weak reference.
 * This is used when referrer's storage is about to go away, but referent
 * isn't dead yet. (Otherwise, zeroing referrer later would be a
 * bad memory access.)
 * Does nothing if referent/referrer is not a currently active weak reference.
 * Does not zero referrer.
 * 
 * FIXME currently requires old referent value to be passed in (lame)
 * FIXME unregistration should be automatic if referrer is collected
 * 
 * @param weak_table The global weak table.
 * @param referent The object.
 * @param referrer The weak reference.
 */
void
weak_unregister_no_lock(weak_table_t *weak_table, id referent_id, 
                        id *referrer_id)
{
    objc_object *referent = (objc_object *)referent_id;
    objc_object **referrer = (objc_object **)referrer_id;

    weak_entry_t *entry;

    if (!referent) return;

    if ((entry = weak_entry_for_referent(weak_table, referent))) {
        remove_referrer(entry, referrer);
        bool empty = true;
        if (entry->out_of_line()  &&  entry->num_refs != 0) {
            empty = false;
        }
        else {
            for (size_t i = 0; i < WEAK_INLINE_COUNT; i++) {
                if (entry->inline_referrers[i]) {
                    empty = false; 
                    break;
                }
            }
        }

        if (empty) {
            weak_entry_remove(weak_table, entry);
        }
    }

    // Do not set *referrer = nil. objc_storeWeak() requires that the 
    // value not change.
}
```

复制

`weak_unregister_no_lock`用来移除弱引用信息，具体实现如下：

- 查询`weak_table`，判断弱引用表中是否已经保存有与对象相关联的弱引用信息；
- 如果有，则调用`remove_referrer`方法移除相关联的弱引用信息；接着判断存储数组是否为空，如果为空，则调用`weak_entry_remove`移除`entry`容器。

 `objc_destroyWeak`函数调用栈如下：

```javascript
// NSObject.mm
① objc_destroyWeak
② storeWeak
```

复制

##### objc_destroyWeak

```javascript
/** 
 * Destroys the relationship between a weak pointer
 * and the object it is referencing in the internal weak
 * table. If the weak pointer is not referencing anything, 
 * there is no need to edit the weak table. 
 *
 * This function IS NOT thread-safe with respect to concurrent 
 * modifications to the weak variable. (Concurrent weak clear is safe.)
 * 
 * @param location The weak pointer address. 
 */
void
objc_destroyWeak(id *location)
{
    (void)storeWeak<DoHaveOld, DontHaveNew, DontCrashIfDeallocating>
        (location, nil);
}
```

复制

`objc_initWeak`和`objc_destroyWeak`函数中都调用了`storeWeak`，但是传的参数不同。

-  `objc_initWeak`将对象地址传入，且`DontHaveOld`、`DoHaveNew`、`DoCrashIfDeallocating`；
-  `objc_destroyWeak`将`nil`传入，且`DoHaveOld`、`DontHaveNew`、`DontCrashIfDeallocating`。

`storeWeak`函数把参数二的赋值的对象地址作为`key`，把参数一的附有`__weak`修饰符的变量的地址注册到`weak`表中。如果参数二为`nil`，则把变量的地址从`weak`表中删除。

>  **小结：**添加`weak`。  一个被标记为`__weak`的指针，在经过编译之后会调用`objc_initWeak`函数，`objc_initWeak`函数中初始化`weak`变量后调用`storeWeak`。添加`weak`的过程如下： 经过一系列的函数调用栈，最终在`weak_register_no_lock()`函数当中，进行弱引用变量的添加，具体添加的位置是通过哈希算法来查找的。如果对应位置已经存在当前对象的弱引用表（数组），那就把弱引用变量添加进去；如果不存在的话，就创建一个弱引用表，然后将弱引用变量添加进去。 

## 总结

以上就是内存管理方法的具体实现，接下来做个小总结：

| 内存管理方法                    | 具体实现                                                     |
| :------------------------------ | :----------------------------------------------------------- |
| alloc                           | 经过一系列的函数调用栈，最终通过调用 C 函数calloc来申请内存空间，并初始化对象的isa，但并没有设置对象的引用计数值为 1。 |
| init                            | 基类的init方法啥都没干，只是将alloc创建的对象返回。我们可以重写init方法来对alloc创建的实例做一些初始化操作。 |
| new                             | new方法很简单，只是嵌套了alloc和init。                       |
| copy、mutableCopy               | 调用了copyWithZone和mutableCopyWithZone方法。                |
| retainCount                     | ① 如果isa不是nonpointer，引用计数值 = SideTable中的引用计数表中存储的值 + 1；② 如果isa是nonpointer，引用计数值 = isa中的extra_rc存储的值 + 1 +SideTable中的引用计数表中存储的值。 |
| retain                          | ① 如果isa不是nonpointer，就对Sidetable中的引用计数进行 +1；② 如果isa是nonpointer，就将isa中的extra_rc存储的引用计数进行 +1，如果溢出，就将extra_rc中RC_HALF（extra_rc满值的一半）个引用计数转移到sidetable中存储。 |
| release                         | ① 如果isa不是nonpointer，就对Sidetable中的引用计数进行 -1，如果引用计数 =0，就dealloc对象；② 如果isa是nonpointer，就将isa中的extra_rc存储的引用计数进行 -1。如果下溢，即extra_rc中的引用计数已经为 0，判断has_sidetable_rc是否为true即是否有使用Sidetable存储。如果有的话就申请从Sidetable中申请RC_HALF个引用计数转移到extra_rc中存储，如果不足RC_HALF就有多少申请多少，然后将Sidetable中的引用计数值减去RC_HALF（或是小于RC_HALF的实际值），将实际申请到的引用计数值 -1 后存储到extra_rc中。如果extra_rc中引用计数为 0 且has_sidetable_rc为false或者Sidetable中的引用计数也为 0 了，那就dealloc对象。 |
| dealloc                         | ① 判断销毁对象前有没有需要处理的东西（如弱引用、关联对象、C++的析构函数、SideTabel的引用计数表等等）；② 如果没有就直接调用free函数销毁对象；③ 如果有就先调用object_dispose做一些释放对象前的处理（置弱引用指针置为nil、移除关联对象、object_cxxDestruct、在SideTabel的引用计数表中擦出引用计数等待），再用free函数销毁对象。 |
| 清除weak，weak指针置为nil的过程 | 当一个对象被销毁时，在dealloc方法内部经过一系列的函数调用栈，通过两次哈希查找，第一次根据对象的地址找到它所在的Sidetable，第二次根据对象的地址在Sidetable的weak_table中找到它的弱引用表。遍历弱引用数组，将指向对象的地址的weak变量全都置为nil。 |
| 添加weak                        | 经过一系列的函数调用栈，最终在weak_register_no_lock()函数当中，进行弱引用变量的添加，具体添加的位置是通过哈希算法来查找的。如果对应位置已经存在当前对象的弱引用表（数组），那就把弱引用变量添加进去；如果不存在的话，就创建一个弱引用表，然后将弱引用变量添加进去。 |

建议大家自己通过`objc4`源码看一遍，这样印象会更深一些。另外本篇文章的源码分析并没有分析得很细节，如果大家感兴趣可以自己研究一遍，刨根问底固然是好。如果以后有时间，我会再具体分析并更新本文章。





## 内存管理（五）：Tagged Pointer



在`objc4`源码中，我们经常会在函数中看到`Tagged Pointer`。`Tagged Pointer`究竟是何方神圣？请开始阅读本文。

>  目录

- **1. Tagged Pointer 是什么？**
- **2. Tagged Pointer 的原理** 2.1 关闭 Tagged Pointer 混淆 2.2 MacOS 分析 2.3 iOS 分析
- **3. 如何判断 Tagged Pointer ？**
- **4. Tagged Pointer 注意点**
- **相关题目**

## 1. Tagged Pointer 是什么？

以下是苹果在 WWDC2013 《Session 404 Advances in Objective-C》中对`Tagged Pointer`的介绍：

 【视频链接：[https://developer.apple.com/videos/play/wwdc2013/404/](https://links.jianshu.com/go?to=https%3A%2F%2Fdeveloper.apple.com%2Fvideos%2Fplay%2Fwwdc2013%2F404%2F)，`Tagged Pointer`部分从 36:50 左右开始】

![img](https://ask.qcloudimg.com/http-save/7220648/yjzbb2ufc8.png?imageView2/2/w/2560/h/7000)

为了节省内存和提高执行效率，苹果在`64bit`程序中引入了`Tagged Pointer`技术，用于优化`NSNumber`、`NSDate`、`NSString`等小对象的存储。

### 在引入 Tagged Pointer 技术之前

`NSNumber`等[对象存储](https://cloud.tencent.com/product/cos?from=20065&from_column=20065)在堆上，`NSNumber`的指针中存储的是堆中`NSNumber`对象的地址值。

#### 从内存占用来看

基本数据类型所需的内存不大。比如`NSInteger`变量，它所占用的内存是与 CPU 的位数有关，如下。在 32 bit 下占用 4 个字节，而在 64 bit 下占用 8 个字节。指针类型的大小通常也是与 CPU 位数相关，一个指针所在 32 bit 下占用 4 个字节，在 64 bit 下占用 8 个字节。

```js
#if __LP64__ || 0 || NS_BUILD_32_LIKE_64
typedef long NSInteger;
typedef unsigned long NSUInteger;
#else
typedef int NSInteger;
typedef unsigned int NSUInteger;
#endif
```

复制

假设我们通过`NSNumber`对象存储一个`NSInteger`的值，系统实际上会给我们分配多少内存呢？

 由于`Tagged Pointer`无法禁用，所以以下将变量`i`设了一个很大的数，以让`NSNumber`对象存储在堆上。

>  **备注：** 可以通过设置环境变量`OBJC_DISABLE_TAGGED_POINTERS`为`YES`来禁用`Tagged Pointer`，但如果你这么做，运行就`Crash`。 objc39337: tagged pointers are disabled (lldb)  因为`Runtime`在程序运行时会判断`Tagged Pointer`是否被禁用，如果是的话就会调用`_objc_fatal()`函数杀死进程。所以，虽然苹果提供了`OBJC_DISABLE_TAGGED_POINTERS`这个环境变量给我们，但是`Tagged Pointer`还是无法禁用。 

```js
    NSInteger i = 0xFFFFFFFFFFFFFF;
    NSNumber *number = [NSNumber numberWithInteger:i];
    NSLog(@"%zd", malloc_size((__bridge const void *)(number))); // 32
    NSLog(@"%zd", sizeof(number)); // 8
```

复制

由于`NSNumber`继承自`NSObject`，所有它有`isa`指针，加上内存对齐的处理，系统给`NSNumber`对象分配了 32 个字节内存。通过 LLDB 指令读取它的内存，实际上它并没有用完 32 个字节。

![img](https://ask.qcloudimg.com/http-save/7220648/12vmoefnpj.png?imageView2/2/w/2560/h/7000)

 从以上可以得知，在 64 bit 下，如果没有使用`Tagged Pointer`的话，为了使用一个`NSNumber`对象就需要 8 个字节指针内存和 32 个字节对象内存。而直接使用一个`NSInteger`变量只要 8 个字节内存，相差好几倍。但总不能弃用`NSNumber`对象而改用基本数据类型吧。

#### 从效率上来看

为了使用一个`NSNumber`对象，需要在堆上为其分配内存，还要维护它的引用计数，管理它的生命周期，实在是影响执行效率。

### 在引入 Tagged Pointer 技术之后

`NSNumber`等对象的值直接存储在了指针中，不必在堆上为其分配内存，节省了很多内存开销。在性能上，有着 3 倍空间效率的提升以及 106 倍创建和销毁速度的提升。

`NSNumber`等对象的指针中存储的数据变成了`Tag`+`Data`形式（`Tag`为特殊标记，用于区分`NSNumber`、`NSDate`、`NSString`等对象类型；`Data`为对象的值）。这样使用一个`NSNumber`对象只需要 8 个字节指针内存。当指针的 8 个字节不够存储数据时，才会在将对象存储在堆上。

我们再来看一下如果使用了`Tagged Pointer`，系统会给`NSNumber`对象分配多少内存。

```js
     NSInteger i = 1;
     NSNumber *number = [NSNumber numberWithInteger:i];
     NSLog(@"%zd", malloc_size((__bridge const void *)(number))); // 0
     NSLog(@"%zd", sizeof(number)); // 8
```

复制

可见，使用了`Tagged Pointer`，`NSNumber`对象的值直接存储在了指针上，不会在堆上申请内存。则使用一个`NSNumber`对象只需要指针的 8 个字节内存就够了，大大的节省了内存占用。

## 2. Tagged Pointer 的原理

### 2.1 关闭 Tagged Pointer 的数据混淆

在现在的版本中，为了保证[数据安全](https://cloud.tencent.com/solution/data_protection?from=20065&from_column=20065)，苹果对 Tagged Pointer 做了数据混淆，开发者通过打印指针无法判断它是不是一个`Tagged Pointer`，更无法读取`Tagged Pointer`的存储数据。

所以在分析`Tagged Pointer`之前，我们需要先关闭`Tagged Pointer`的数据混淆，以方便我们调试程序。通过设置环境变量`OBJC_DISABLE_TAG_OBFUSCATION`为`YES`。

![img](https://ask.qcloudimg.com/http-save/7220648/payqhfevae.png?imageView2/2/w/2560/h/7000)

### 2.2 MacOS 分析

#### NSNumber

```js
int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSNumber *number1 = @1;
        NSNumber *number2 = @2;
        NSNumber *number3 = @3;
        NSNumber *number4 = @(0xFFFFFFFFFFFFFFFF);
    
        NSLog(@"%p %p %p %p", number1, number2, number3, number4);
    }
    return 0;
}
// 关闭 Tagged Pointer 数据混淆后：0x127 0x227 0x327 0x600003a090e0
// 关闭 Tagged Pointer 数据混淆前：0xaca2838a63a4fb34 0xaca2838a63a4fb04 0xaca2838a63a4fb14 0x600003a090e0
```

复制

从以上打印结果可以看出，`number1～number3`指针为`Tagged Pointer`类型，可以看到对象的值都存储在了指针中，对应`0x1`、`0x2`、`0x3`。而`number4`由于数据过大，指针的`8`个字节不够存储，所以在堆中分配了内存。

>  **注意：** `MacOS`与`iOS`平台下的`Tagged Pointer`有差别，下面会讲到。 

**0x127 中的 2 和 7 表示什么？**

 我们先来看这个`7`，`0x127`为十六进制表示，`7`的二进制为`0111`。

 最后一位`1`是`Tagged Pointer`标识位，代表这个指针是`Tagged Pointer`。

 前面的`011`是类标识位，对应十进制为`3`，表示`NSNumber`类。

>  **备注：** `MacOS`下采用 LSB（Least Significant Bit，即最低有效位）为`Tagged Pointer`标识位，而`iOS`下则采用 MSB（Most Significant Bit，即最高有效位）为`Tagged Pointer`标识位。 

可以在`Runtime`源码`objc4`中查看`NSNumber`、`NSDate`、`NSString`等类的标识位。

```js
// objc-internal.h
{
    OBJC_TAG_NSAtom            = 0, 
    OBJC_TAG_1                 = 1, 
    OBJC_TAG_NSString          = 2, 
    OBJC_TAG_NSNumber          = 3, 
    OBJC_TAG_NSIndexPath       = 4, 
    OBJC_TAG_NSManagedObjectID = 5, 
    OBJC_TAG_NSDate            = 6,
    ......
}
```

复制

**代码验证：**

```js
int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSNumber *number = @1;
        NSString *string = [NSString stringWithFormat:@"a"];
    
        NSLog(@"%p %p", number, string);
    }
    return 0;
}
// 0x127 0x6115
```

复制

以上打印的`string`指针值为`0x6115`，`61`是`a`的 ASCII 码，最后一位`5`的二进制为`0101`，其中最后一位`1`是代表这个指针是`Tagged Pointer`前面已经说过，`010`对应十进制为`2`，表示`NSString`类。

**0x127 中的 2（即倒数第二位）又代表什么呢？**

 倒数第二位用来表示数据类型。

示例：

```js
int main(int argc, const char * argv[]) {
    @autoreleasepool {
        char a = 1;
        short b = 1;
        int c = 1;
        long d = 1;
        float e = 1.0;
        double f = 1.00;
        
        NSNumber *number1 = @(a);
        NSNumber *number2 = @(b);
        NSNumber *number3 = @(c);
        NSNumber *number4 = @(d);
        NSNumber *number5 = @(e);
        NSNumber *number6 = @(f);

        NSLog(@"%p %p %p %p %p %p", number1, number2, number3, number4, number5, number6);
    }
    return 0;
}
// 0x107 0x117 0x127 0x137 0x147 0x157
```

复制

`Tagged Pointer`倒数第二位对应数据类型：

| Tagged Pointer 倒数第二位 | 对应数据类型 |
| :------------------------ | :----------- |
| 0                         | char         |
| 1                         | short        |
| 2                         | int          |
| 3                         | long         |
| 4                         | float        |
| 5                         | double       |

下图是`MacOS`下`NSNumber`的`Tagged Pointer`位视图：

![img](https://ask.qcloudimg.com/http-save/7220648/qiceyctsgt.png?imageView2/2/w/2560/h/7000)

Tagged Pointer 位视图

#### NSString

接下来我们来分析一下`Tagged Pointer`在`NSString`中的应用。同`NSNumber`一样，在`64 bit`的`MacOS`下，如果一个`NSString`对象指针为`Tagged Pointer`，那么它的后 4 位（0-3）作为标识位，第 4-7 位表示字符串长度，剩余的 56 位就可以用来存储字符串。

示例：

```js
// MRC 环境
#define HTLog(_var) \
{ \
    NSString *name = @#_var; \
    NSLog(@"%@: %p, %@, %lu", name, _var, [_var class], [_var retainCount]); \
}

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSString *a = @"a";
        NSMutableString *b = [a mutableCopy];
        NSString *c = [a copy];
        NSString *d = [[a mutableCopy] copy];
        NSString *e = [NSString stringWithString:a];
        NSString *f = [NSString stringWithFormat:@"f"];
        NSString *string1 = [NSString stringWithFormat:@"abcdefg"];
        NSString *string2 = [NSString stringWithFormat:@"abcdefghi"];
        NSString *string3 = [NSString stringWithFormat:@"abcdefghij"];
        HTLog(a);
        HTLog(b);
        HTLog(c);
        HTLog(d);
        HTLog(e);
        HTLog(f);
        HTLog(string1);
        HTLog(string2);
        HTLog(string3);
    }
    return 0;
}
/*
a: 0x100002038, __NSCFConstantString, 18446744073709551615
b: 0x10071f3c0, __NSCFString, 1
c: 0x100002038, __NSCFConstantString, 18446744073709551615
d: 0x6115, NSTaggedPointerString, 18446744073709551615
e: 0x100002038, __NSCFConstantString, 18446744073709551615
f: 0x6615, NSTaggedPointerString, 18446744073709551615
string1: 0x6766656463626175, NSTaggedPointerString, 18446744073709551615
string2: 0x880e28045a54195, NSTaggedPointerString, 18446744073709551615
string3: 0x10071f6d0, __NSCFString, 1 */
```

复制

从打印结果来看，有三种`NSString`类型：

| 类型                  | 描述                                                         |
| :-------------------- | :----------------------------------------------------------- |
| __NSCFConstantString  | 常量字符串，存储在字符串常量区，继承于 __NSCFString。相同内容的 __NSCFConstantString 对象的地址相同，也就是说常量字符串对象是一种单例，可以通过 == 判断字符串内容是否相同。2. 这种对象一般通过字面值@"..."创建。如果使用 __NSCFConstantString 来初始化一个字符串，那么这个字符串也是相同的 __NSCFConstantString。 |
| __NSCFString          | 存储在堆区，需要维护其引用计数，继承于 NSMutableString。2. 通过stringWithFormat:等方法创建的NSString对象（且字符串值过大无法使用Tagged Pointer存储）一般都是这种类型。 |
| NSTaggedPointerString | Tagged Pointer，字符串的值直接存储在了指针上。               |

打印结果分析：

| NSString 对象 | 类型                  | 分析                                                         |
| :------------ | :-------------------- | :----------------------------------------------------------- |
| a             | __NSCFConstantString  | 通过字面量@"..."创建                                         |
| b             | __NSCFString          | a 的深拷贝，指向不同的内存地址，被拷贝到堆区                 |
| c             | __NSCFConstantString  | a 的浅拷贝，指向同一块内存地址                               |
| d             | NSTaggedPointerString | 单独对 a 进行 copy（如 c），浅拷贝是指向同一块内存地址，所以不会产生Tagged Pointer；单独对 a 进行 mutableCopy（如 b），复制出来是可变对象，内容大小可以扩展；而Tagged Pointer存储的内容大小有限，因此无法满足可变对象的存储要求。 |
| e             | __NSCFConstantString  | 使用 __NSCFConstantString 来初始化的字符串                   |
| f             | NSTaggedPointerString | 通过stringWithFormat:方法创建，指针足够存储字符串的值。      |
| string1       | NSTaggedPointerString | 通过stringWithFormat:方法创建，指针足够存储字符串的值。      |
| string2       | NSTaggedPointerString | 通过stringWithFormat:方法创建，指针足够存储字符串的值。      |
| string3       | __NSCFString          | 通过stringWithFormat:方法创建，指针不足够存储字符串的值。    |

可以看到，为`Tagged Pointer`的有`d`、`f`、`string1`、`string2`指针。它们的指针值分别为

 `0x6115`、`0x6615`、`0x6766656463626175`、`0x880e28045a54195`。

其中`0x61`、`0x66`、`0x67666564636261`分别对应字符串的 ASCII 码。

最后一位`5`的二进制为`0101`，最后一位`1`是代表这个指针是`Tagged Pointer`，`010`对应十进制为`2`，表示`NSString`类。

倒数第二位`1`、`1`、`7`、`9`代表字符串长度。

对于`string2`的指针值`0x880e28045a54195`，虽然从指针中看不出来字符串的值，但其也是一个`Tagged Pointer`。

下图是`MacOS`下`NSString`的`Tagged Pointer`位视图：

![img](https://ask.qcloudimg.com/http-save/7220648/gurs1uzync.png?imageView2/2/w/2560/h/7000)

Tagged Pointer 位视图

### 2.3 iOS 分析

#### NSNumber

```js
- (void)viewDidLoad {
    [super viewDidLoad];
               
    NSNumber *number1 = @1;
    NSNumber *number2 = @2;
    NSNumber *number3 = @79;
    NSNumber *number4 = @(0xFFFFFFFFFFFFFFFF);
    
    NSLog(@"%p %p %p %p", number1, number2, number3, number4);   
}
// 0xb000000000000012 0xb000000000000022 0xb0000000000004f2 0x600000678480
```

复制

从以上打印结果可以看出，`number1～number3`指针为`Tagged Pointer`类型，可以看到对象的值都存储在了指针中，对应倒数第二位开始的`1`、`2`、`4f`。而`number4`由于数据过大，指针的`8`个字节不够存储，所以在堆中分配了内存。

最后一位用来表示数据类型。

第一位`b`的二进制为`1011`，其中第一位`1`是`Tagged Pointer`标识位。后面的`011`是类标识位，对应十进制为3，表示`NSNumber`类。

下图是`iOS`下`NSNumber`的`Tagged Pointer`位视图：

![img](https://ask.qcloudimg.com/http-save/7220648/zufmtqnvbq.png?imageView2/2/w/2560/h/7000)

Tagged Pointer 位视图

#### NSString

同理，不再分析。

下图是`iOS`下`NSString`的`Tagged Pointer`位视图：

![img](https://ask.qcloudimg.com/http-save/7220648/cj0aj4o1ul.png?imageView2/2/w/2560/h/7000)

Tagged Pointer 位视图

## 3. 如何判断 Tagged Pointer ？

前面已经说过了，通过`Tagged Pointer`标识位。

在`objc4`源码中找到判断`Tagged Pointer`的函数：

```js
// objc-internal.h
static inline bool 
_objc_isTaggedPointer(const void * _Nullable ptr)
{
    return ((uintptr_t)ptr & _OBJC_TAG_MASK) == _OBJC_TAG_MASK;
}
```

复制

可以看到，它是将指针值与一个`_OBJC_TAG_MASK`掩码进行按位与运算，查看该掩码：

```js
#if (TARGET_OS_OSX || TARGET_OS_IOSMAC) && __x86_64__
    // 64-bit Mac - tag bit is LSB
#   define OBJC_MSB_TAGGED_POINTERS 0  // MacOS
#else
    // Everything else - tag bit is MSB
#   define OBJC_MSB_TAGGED_POINTERS 1  // iOS
#endif

#define _OBJC_TAG_INDEX_MASK 0x7
// array slot includes the tag bit itself
#define _OBJC_TAG_SLOT_COUNT 16
#define _OBJC_TAG_SLOT_MASK 0xf

#define _OBJC_TAG_EXT_INDEX_MASK 0xff
// array slot has no extra bits
#define _OBJC_TAG_EXT_SLOT_COUNT 256
#define _OBJC_TAG_EXT_SLOT_MASK 0xff

#if OBJC_MSB_TAGGED_POINTERS
#   define _OBJC_TAG_MASK (1UL<<63)  // _OBJC_TAG_MASK
#   define _OBJC_TAG_INDEX_SHIFT 60
#   define _OBJC_TAG_SLOT_SHIFT 60
#   define _OBJC_TAG_PAYLOAD_LSHIFT 4
#   define _OBJC_TAG_PAYLOAD_RSHIFT 4
#   define _OBJC_TAG_EXT_MASK (0xfUL<<60)
#   define _OBJC_TAG_EXT_INDEX_SHIFT 52
#   define _OBJC_TAG_EXT_SLOT_SHIFT 52
#   define _OBJC_TAG_EXT_PAYLOAD_LSHIFT 12
#   define _OBJC_TAG_EXT_PAYLOAD_RSHIFT 12
#else
#   define _OBJC_TAG_MASK 1UL       // _OBJC_TAG_MASK
#   define _OBJC_TAG_INDEX_SHIFT 1
#   define _OBJC_TAG_SLOT_SHIFT 0
#   define _OBJC_TAG_PAYLOAD_LSHIFT 0
#   define _OBJC_TAG_PAYLOAD_RSHIFT 4
#   define _OBJC_TAG_EXT_MASK 0xfUL
#   define _OBJC_TAG_EXT_INDEX_SHIFT 4
#   define _OBJC_TAG_EXT_SLOT_SHIFT 4
#   define _OBJC_TAG_EXT_PAYLOAD_LSHIFT 0
#   define _OBJC_TAG_EXT_PAYLOAD_RSHIFT 12
#endif
```

复制

由此我们可以验证：

- `MacOS`下采用 LSB（Least Significant Bit，即最低有效位）为`Tagged Pointer`标识位；
- `iOS`下则采用 MSB（Most Significant Bit，即最高有效位）为`Tagged Pointer`标识位。

而存储在堆空间的对象由于内存对齐，它的内存地址的最低有效位为 0。由此可以辨别`Tagged Pointer`和一般对象指针。

![img](https://ask.qcloudimg.com/http-save/7220648/c9p7hqf95w.png?imageView2/2/w/2560/h/7000)

在`objc4`源码中，我们经常会在函数中看到`Tagged Pointer`。比如`objc_msgSend`函数：

```js
    ENTRY _objc_msgSend
    UNWIND _objc_msgSend, NoFrame

    cmp p0, #0          // nil check and tagged pointer check
#if SUPPORT_TAGGED_POINTERS
    b.le    LNilOrTagged        //  (MSB tagged pointer looks negative)
#else
    b.eq    LReturnZero
#endif
    ldr p13, [x0]       // p13 = isa
    GetClassFromIsa_p16 p13     // p16 = class
LGetIsaDone:
    // calls imp or objc_msgSend_uncached
    CacheLookup NORMAL, _objc_msgSend

#if SUPPORT_TAGGED_POINTERS
LNilOrTagged:
    b.eq    LReturnZero     // nil check

    // tagged
    adrp    x10, _objc_debug_taggedpointer_classes@PAGE
    add x10, x10, _objc_debug_taggedpointer_classes@PAGEOFF
    ubfx    x11, x0, #60, #4
    ldr x16, [x10, x11, LSL #3]
    adrp    x10, _OBJC_CLASS_$___NSUnrecognizedTaggedPointer@PAGE
    add x10, x10, _OBJC_CLASS_$___NSUnrecognizedTaggedPointer@PAGEOFF
    cmp x10, x16
    b.ne    LGetIsaDone

    // ext tagged
    adrp    x10, _objc_debug_taggedpointer_ext_classes@PAGE
    add x10, x10, _objc_debug_taggedpointer_ext_classes@PAGEOFF
    ubfx    x11, x0, #52, #8
    ldr x16, [x10, x11, LSL #3]
    b   LGetIsaDone
// SUPPORT_TAGGED_POINTERS
#endif
```

复制

`objc_msgSend`能识别`Tagged Pointer`，比如`NSNumber`的`intValue`方法，直接从指针提取数据，不会进行`objc_msgSend`的三大流程，节省了调用开销。

内存管理相关的，如`retain`方法中调用的`rootRetain`：

```js
ALWAYS_INLINE id 
objc_object::rootRetain(bool tryRetain, bool handleOverflow)
{
    // 如果是 tagged pointer，直接返回 this
    if (isTaggedPointer()) return (id)this; 

    bool sideTableLocked = false;
    bool transcribeToSideTable = false; 

    isa_t oldisa;
    isa_t newisa;
    ......
```

复制

来看一下`isTaggedPointer()`函数实现：

```js
inline bool 
objc_object::isTaggedPointer() 
{
    return _objc_isTaggedPointer(this);
}
```

复制

该函数就是调用了`_objc_isTaggedPointer`。

## 4. Tagged Pointer 注意点

我们知道，所有`OC`对象都有`isa`指针，而`Tagged Pointer`并不是真正的对象，它没有`isa`指针，所以如果你直接访问`Tagged Pointer`的`isa`成员的话，在编译时将会有如下警告：

![img](https://ask.qcloudimg.com/http-save/7220648/dznxv2dqe0.png?imageView2/2/w/2560/h/7000)

对于`Tagged Pointer`，应该换成相应的方法调用，如`isKindOfClass`和`object_getClass`。只要避免在代码中直接访问`Tagged Pointer`的`isa`，即可避免这个问题。

当然现在也不允许我们在代码中直接访问对象的`isa`了，否则编译不通过。

我们通过 LLDB 打印`Tagged Pointer`的`isa`，会提示如下错误：

![img](https://ask.qcloudimg.com/http-save/7220648/mzlzzzbe0g.png?imageView2/2/w/2560/h/7000)

而打印`OC`对象的`isa`没有问题：

![img](https://ask.qcloudimg.com/http-save/7220648/nzlnxqg8qz.png?imageView2/2/w/2560/h/7000)

## 相关题目

#### Q：执行以下两段代码，有什么区别？

```js
    dispatch_queue_t queue = dispatch_get_global_queue(0, 0);
    for (int i = 0; i < 1000; i++) {
        dispatch_async(queue, ^{
            self.name = [NSString stringWithFormat:@"abcdefghij"];
        });
    }
```

复制

```js
    dispatch_queue_t queue = dispatch_get_global_queue(0, 0);
    for (int i = 0; i < 1000; i++) {
        dispatch_async(queue, ^{
            self.name = [NSString stringWithFormat:@"abcdefghi"];
        });
    }
```

复制

心里一万个草泥马?奔腾而过～～～，两段代码差别不就是字符串长度少了一位吗，哪有什么差别？

 结果一运行，哎呀？第一段代码居然`Crash`，而第二段却没有问题，奇了怪了。

 分别打印两段代码的`self.name`类型看看，原来第一段代码中`self.name`为`__NSCFString`类型，而第二段代码中为`NSTaggedPointerString`类型。

我们来看一下第一段代码`Crash`的地方：

![img](https://ask.qcloudimg.com/http-save/7220648/820glyqsjp.png?imageView2/2/w/2560/h/7000)

想必你已经猜到了，`__NSCFString`存储在堆上，它是个正常对象，需要维护引用计数的。`self.name`通过`setter`方法为其赋值。而`setter`方法的实现如下：

```js
- (void)setName:(NSString *)name {
    if(_name != name) {
        [_name release];
        _name = [name retain]; // or [name copy]
    }
}
```

复制

我们异步并发执行`setter`方法，可能就会有多条线程同时执行`[_name release]`，连续`release`两次就会造成对象的过度释放，导致`Crash`。

解决办法：

- 1. 使用`atomic`属性关键字。
- 1. 加锁

```js
    dispatch_queue_t queue = dispatch_get_global_queue(0, 0);
    for (int i = 0; i < 1000; i++) {
        dispatch_async(queue, ^{
            // 加锁
            self.name = [NSString stringWithFormat:@"abcdefghij"];
            // 解锁
        });
    }
```

复制

而第二段代码中的`NSString`为`NSTaggedPointerString`类型，在`objc_release`函数中会判断指针是不是`TaggedPointer`类型，是的话就不对对象进行`release`操作，也就避免了因过度释放对象而导致的`Crash`，因为根本就没执行释放操作。

```js
__attribute__((aligned(16), flatten, noinline))
void 
objc_release(id obj)
{
    if (!obj) return;
    if (obj->isTaggedPointer()) return;
    return obj->release();
}
```

复制

关于`release`方法的函数调用栈可阅读文章[《iOS - 老生常谈内存管理（四）：内存管理方法源码分析》](https://juejin.im/post/6844904131719593998)。



## 内存管理（6）： autorelease 和 @autoreleasepool



## 前言

作为 iOS 开发者，在面试过程中经常会碰到这样一个问题：在 ARC 环境下`autorelease`对象在什么时候释放？如果你还不知道怎么回答，或者你只有比较模糊的概念，那么你绝对不能错过本文。

本文将通过`Runtime objc4-756.2`版本源码、macOS 与 iOS 工程示例来分析`@autoreleasepool`的底层原理。并在最后针对有关`autorelease`和`@autoreleasepool`的一些问题进行解答。

苹果在 iOS 5 中引入了`ARC（Automatic Reference Counting）`自动引用计数内存管理技术，通过`LLVM`编译器和`Runtime`协作来进行自动管理内存。`LLVM`编译器会在编译时在合适的地方为 OC 对象插入`retain`、`release`和`autorelease`代码，省去了在`MRC（Manual Reference Counting）`手动引用计数下手动插入这些代码的工作，减轻了开发者的工作量。

在`MRC`下，当我们不需要一个对象的时候，要调用`release`或`autorelease`方法来释放它。调用`release`会立即让对象的引用计数减 1 ，如果此时对象的引用计数为 0，对象就会被销毁。调用`autorelease`会将该对象添加进自动释放池中，它会在一个恰当的时刻自动给对象调用`release`，所以`autorelease`相当于延迟了对象的释放。

在`ARC`下，`autorelease`方法已被禁用，我们可以使用`__autoreleasing`修饰符修饰对象将对象注册到自动释放池中。详情请参阅`《iOS - 老生常谈内存管理（三）：ARC 面世 —— 所有权修饰符》`。

## 1. 自动释放池

> **官方文档**
>
> The Application Kit creates an autorelease pool on the main thread at the beginning of every cycle of the event loop, and drains it at the end, thereby releasing any autoreleased objects generated while processing an event. If you use the Application Kit, you therefore typically don’t have to create your own pools. If your application creates a lot of temporary autoreleased objects within the event loop, however, it may be beneficial to create “local” autorelease pools to help to minimize the peak memory footprint.

以上是苹果对自动释放池的一段介绍，其意思为：AppKit 和 UIKit 框架在事件循环(`RunLoop`)的每次循环开始时，在主线程创建一个自动释放池，并在每次循环结束时销毁它，在销毁时释放自动释放池中的所有`autorelease`对象。通常情况下我们不需要手动创建自动释放池，但是如果我们在循环中创建了很多临时的`autorelease`对象，则手动创建自动释放池来管理这些对象可以很大程度地减少内存峰值。

![img](https://ask.qcloudimg.com/http-save/6828465/m3aixa5o1s.png)

### 创建一个自动释放池

- 在`MRC`下，可以使用`NSAutoreleasePool`或者`@autoreleasepool`。建议使用`@autoreleasepool`，苹果说它比`NSAutoreleasePool`快大约六倍。

```js
NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
// Code benefitting from a local autorelease pool.
[pool release];
```

复制

> **Q：** 释放`NSAutoreleasePool`对象，使用`[pool release]`与`[pool drain]`的区别？
>
> Objective-C 语言本身是支持 GC 机制的，但有平台局限性，仅限于 MacOS 开发中，iOS 开发用的是 RC 机制。在 iOS 的 RC 环境下`[pool release]`和`[pool drain]`效果一样，但在 GC 环境下`drain`会触发 GC 而`release`不做任何操作。使用`[pool drain]`更佳，一是它的功能对系统兼容性更强，二是这样可以跟普通对象的`release`区别开。（注意：苹果在引入`ARC`时称，已在 OS X Mountain Lion v10.8 中弃用`GC`机制，而使用`ARC`替代）

- 而在`ARC`下，已经禁止使用`NSAutoreleasePool`类创建自动释放池，只能使用`@autoreleasepool`。

```js
@autoreleasepool {
    // Code benefitting from a local autorelease pool.
}
```

复制

## 2. 原理分析

下面我们先通过`macOS`工程来分析`@autoreleasepool`的底层原理。

`macOS`工程中的`main()`函数什么都没做，只是放了一个`@autoreleasepool`。

```js
int main(int argc, const char * argv[]) {
    @autoreleasepool {}
    return 0;
}
```

复制

### __AtAutoreleasePool

通过 Clang `clang -rewrite-objc main.m` 将以上代码转换为 C++ 代码。

```js
struct __AtAutoreleasePool {
    __AtAutoreleasePool() {
        atautoreleasepoolobj = objc_autoreleasePoolPush();
    }
    ~__AtAutoreleasePool() {
        objc_autoreleasePoolPop(atautoreleasepoolobj);
    }
    void * atautoreleasepoolobj;
};

int main(int argc, const char * argv[]) {
    /* @autoreleasepool */ 
    { __AtAutoreleasePool __autoreleasepool;  }
    return 0;
}
```

复制

可以看到：

- `@autoreleasepool`底层是创建了一个`__AtAutoreleasePool`结构体对象；
- 在创建`__AtAutoreleasePool`结构体时会在构造函数中调用`objc_autoreleasePoolPush()`函数，并返回一个`atautoreleasepoolobj`(`POOL_BOUNDARY`存放的内存地址，下面会讲到)；
- 在释放`__AtAutoreleasePool`结构体时会在析构函数中调用`objc_autoreleasePoolPop()`函数，并将`atautoreleasepoolobj`传入。

### AutoreleasePoolPage

下面我们进入`Runtime objc4`源码查看以上提到的两个函数的实现。

```js
// NSObject.mm
void * objc_autoreleasePoolPush(void)
{
    return AutoreleasePoolPage::push();
}

void objc_autoreleasePoolPop(void *ctxt)
{
    AutoreleasePoolPage::pop(ctxt);
}
```

复制

可以得知，`objc_autoreleasePoolPush()`和`objc_autoreleasePoolPop()`两个函数其实是调用了`AutoreleasePoolPage`类的两个类方法`push()`和`pop()`。所以`@autoreleasepool`底层就是使用`AutoreleasePoolPage`类来实现的。

下面我们来看一下`AutoreleasePoolPage`类的定义：

```js
class AutoreleasePoolPage 
{
#   define EMPTY_POOL_PLACEHOLDER ((id*)1)  // EMPTY_POOL_PLACEHOLDER：表示一个空自动释放池的占位符
#   define POOL_BOUNDARY nil                // POOL_BOUNDARY：哨兵对象
    static pthread_key_t const key = AUTORELEASE_POOL_KEY;
    static uint8_t const SCRIBBLE = 0xA3;   // 用来标记已释放的对象
    static size_t const SIZE =              // 每个 Page 对象占用 4096 个字节内存
#if PROTECT_AUTORELEASEPOOL                 // PAGE_MAX_SIZE = 4096
        PAGE_MAX_SIZE;  // must be muliple of vm page size
#else
        PAGE_MAX_SIZE;  // size and alignment, power of 2
#endif
    static size_t const COUNT = SIZE / sizeof(id);  // Page 的个数

    magic_t const magic;                // 用来校验 Page 的结构是否完整
    id *next;                           // 指向下一个可存放 autorelease 对象地址的位置，初始化指向 begin()
    pthread_t const thread;             // 指向当前线程
    AutoreleasePoolPage * const parent; // 指向父结点，首结点的 parent 为 nil
    AutoreleasePoolPage *child;         // 指向子结点，尾结点的 child  为 nil
    uint32_t const depth;               // Page 的深度，从 0 开始递增
    uint32_t hiwat;
    ......
}
```

复制

> **备注：** 本文使用的是`objc4-756.2`版本源码进行分析。在`objc4-779.1`版本中，`AutoreleasePoolPage`继承自`AutoreleasePoolPageData`，如下。不过原理不变，不影响分析。

```js
// objc4-779.1
// NSObject.mm
class AutoreleasePoolPage : private AutoreleasePoolPageData
{
	friend struct thread_data_t;

public:
	static size_t const SIZE =
#if PROTECT_AUTORELEASEPOOL
		PAGE_MAX_SIZE;  // must be multiple of vm page size
#else
		PAGE_MIN_SIZE;  // size and alignment, power of 2
#endif
    
private:
	static pthread_key_t const key = AUTORELEASE_POOL_KEY;
	static uint8_t const SCRIBBLE = 0xA3;  // 0xA3A3A3A3 after releasing
	static size_t const COUNT = SIZE / sizeof(id);

    // EMPTY_POOL_PLACEHOLDER is stored in TLS when exactly one pool is 
    // pushed and it has never contained any objects. This saves memory 
    // when the top level (i.e. libdispatch) pushes and pops pools but 
    // never uses them.
#   define EMPTY_POOL_PLACEHOLDER ((id*)1)

#   define POOL_BOUNDARY nil

    // SIZE-sizeof(*this) bytes of contents follow
    ......
}

// NSObject-internal.h
class AutoreleasePoolPage;
struct AutoreleasePoolPageData
{
	magic_t const magic;
	__unsafe_unretained id *next;
	pthread_t const thread;
	AutoreleasePoolPage * const parent;
	AutoreleasePoolPage *child;
	uint32_t const depth;
	uint32_t hiwat;

	AutoreleasePoolPageData(__unsafe_unretained id* _next, pthread_t _thread, AutoreleasePoolPage* _parent, uint32_t _depth, uint32_t _hiwat)
		: magic(), next(_next), thread(_thread),
		  parent(_parent), child(nil),
		  depth(_depth), hiwat(_hiwat)
	{
	}
};
```

复制

整个程序运行过程中，可能会有多个`AutoreleasePoolPage`对象。从它的定义可以得知：

- 自动释放池（即所有的`AutoreleasePoolPage`对象）是以`栈`为结点通过`双向链表`的形式组合而成；
- 自动释放池与线程一一对应；
- 每个`AutoreleasePoolPage`对象占用`4096`字节内存，其中`56`个字节用来存放它内部的成员变量，剩下的空间（`4040`个字节）用来存放`autorelease`对象的地址。

其内存分布图如下：

![img](https://ask.qcloudimg.com/http-save/6828465/s9e0wn0f1b.png)

下面我们通过源码来分析`push()`、`pop()`以及`autorelease`方法的实现。

#### POOL_BOUNDARY

在分析这些方法之前，先介绍一下`POOL_BOUNDARY`。

- `POOL_BOUNDARY`的前世叫做`POOL_SENTINEL`，称为哨兵对象或者边界对象；
- `POOL_BOUNDARY`用来区分不同的自动释放池，以解决自动释放池嵌套的问题；
- 每当创建一个自动释放池，就会调用`push()`方法将一个`POOL_BOUNDARY`入栈，并返回其存放的内存地址；
- 当往自动释放池中添加`autorelease`对象时，将`autorelease`对象的内存地址入栈，它们前面至少有一个`POOL_BOUNDARY`；
- 当销毁一个自动释放池时，会调用`pop()`方法并传入一个`POOL_BOUNDARY`，会从自动释放池中最后一个对象开始，依次给它们发送`release`消息，直到遇到这个`POOL_BOUNDARY`。

#### push

```js
    static inline void *push() 
    {
        id *dest;
        if (DebugPoolAllocation) { // 出错时进入调试状态
            // Each autorelease pool starts on a new pool page.
            dest = autoreleaseNewPage(POOL_BOUNDARY);
        } else {
            dest = autoreleaseFast(POOL_BOUNDARY);  // 传入 POOL_BOUNDARY 哨兵对象
        }
        assert(dest == EMPTY_POOL_PLACEHOLDER || *dest == POOL_BOUNDARY);
        return dest;
    }
```

复制

当创建一个自动释放池时，会调用`push()`方法。`push()`方法中调用了`autoreleaseFast()`方法并传入了`POOL_BOUNDARY`哨兵对象。

下面我们来看一下`autoreleaseFast()`方法的实现：

```js
    static inline id *autoreleaseFast(id obj)
    {
        AutoreleasePoolPage *page = hotPage();     // 新创建的未满的 Page
        if (page && !page->full()) {        // 如果当前 Page 存在且未满
            return page->add(obj);                 // 将 autorelease 对象入栈，即添加到当前 Page 中；
        } else if (page) {                  // 如果当前 Page 存在但已满
            return autoreleaseFullPage(obj, page); // 创建一个新的 Page，并将 autorelease 对象添加进去
        } else {                            // 如果当前 Page 不存在，即还没创建过 Page
            return autoreleaseNoPage(obj);         // 创建第一个 Page，并将 autorelease 对象添加进去
        }
    }
```

复制

`autoreleaseFast()`中先是调用了`hotPage()`方法获得未满的`Page`，从`AutoreleasePoolPage`类的定义可知，每个`Page`的内存大小为`4096`个字节，每当`Page`满了的时候，就会创建一个新的`Page`。`hotPage()`方法就是用来获得这个新创建的未满的`Page`。

`autoreleaseFast()`在执行过程中有三种情况：

- ① 当前`Page`存在且未满时，通过`page->add(obj)`将`autorelease`对象入栈，即添加到当前`Page`中；
- ② 当前`Page`存在但已满时，通过`autoreleaseFullPage(obj, page)`创建一个新的`Page`，并将`autorelease`对象添加进去；
- ③ 当前`Page`不存在，即还没创建过`Page`，通过`autoreleaseNoPage(obj)`创建第一个`Page`，并将`autorelease`对象添加进去。

下面我们来看一下以上提到的三个方法的实现：

```js
    id *add(id obj)
    {
        assert(!full());
        unprotect();
        id *ret = next;  // faster than `return next-1` because of aliasing
        *next++ = obj;
        protect();
        return ret;
    }
```

复制

`page->add(obj)`其实就是将`autorelease`对象添加到`Page`中的`next`指针所指向的位置，并将`next`指针指向这个对象的下一个位置，然后将该对象的位置返回。

```js
    static __attribute__((noinline))
    id *autoreleaseFullPage(id obj, AutoreleasePoolPage *page)
    {
        // The hot page is full. 
        // Step to the next non-full page, adding a new page if necessary.
        // Then add the object to that page.
        assert(page == hotPage());
        assert(page->full()  ||  DebugPoolAllocation);

        do {
            if (page->child) page = page->child;
            else page = new AutoreleasePoolPage(page);
        } while (page->full());

        setHotPage(page);
        return page->add(obj);
    }
```

复制

`autoreleaseFullPage()`方法中通过`while`循环，通过`Page`的`child`指针找到最后一个`Page`。

- 如果最后一个`Page`未满，就通过`page->add(obj)`将`autorelease`对象添加到最后一个`Page`中；
- 如果最后一个`Page`已满，就创建一个新的`Page`并通过`page->add(obj)`将`autorelease`对象添加进去，并将该`Page`设置为`hotPage`。

```js
    static __attribute__((noinline))
    id *autoreleaseNoPage(id obj)
    {
        // "No page" could mean no pool has been pushed
        // or an empty placeholder pool has been pushed and has no contents yet
        assert(!hotPage());

        bool pushExtraBoundary = false;
        if (haveEmptyPoolPlaceholder()) {
            // We are pushing a second pool over the empty placeholder pool
            // or pushing the first object into the empty placeholder pool.
            // Before doing that, push a pool boundary on behalf of the pool 
            // that is currently represented by the empty placeholder.
            pushExtraBoundary = true;
        }
        else if (obj != POOL_BOUNDARY  &&  DebugMissingPools) {
            // We are pushing an object with no pool in place, 
            // and no-pool debugging was requested by environment.
            _objc_inform("MISSING POOLS: (%p) Object %p of class %s "
                         "autoreleased with no pool in place - "
                         "just leaking - break on "
                         "objc_autoreleaseNoPool() to debug", 
                         pthread_self(), (void*)obj, object_getClassName(obj));
            objc_autoreleaseNoPool(obj);
            return nil;
        }
        else if (obj == POOL_BOUNDARY  &&  !DebugPoolAllocation) {
            // We are pushing a pool with no pool in place,
            // and alloc-per-pool debugging was not requested.
            // Install and return the empty pool placeholder.
            return setEmptyPoolPlaceholder();
        }

        // We are pushing an object or a non-placeholder'd pool.

        // Install the first page.
        AutoreleasePoolPage *page = new AutoreleasePoolPage(nil);
        setHotPage(page);
        
        // Push a boundary on behalf of the previously-placeholder'd pool.
        if (pushExtraBoundary) {
            page->add(POOL_BOUNDARY);
        }
        
        // Push the requested object or pool.
        return page->add(obj);
    }
```

复制

`autoreleaseNoPage()`方法中会创建第一个`Page`。该方法会判断是否有空的自动释放池存在，如果没有会通过`setEmptyPoolPlaceholder()`生成一个占位符，表示一个空的自动释放池。接着创建第一个`Page`，设置它为`hotPage`。最后将一个`POOL_BOUNDARY`添加进`Page`中，并返回`POOL_BOUNDARY`的下一个位置。

> **小结：** 以上就是`push`操作的实现，往自动释放池中添加一个`POOL_BOUNDARY`，并返回它存放的内存地址。接着每有一个对象调用`autorelease`方法，会将它的内存地址添加进自动释放池中。

#### autorelease

```js
    static inline id autorelease(id obj)
    {
        assert(obj);
        assert(!obj->isTaggedPointer());
        id *dest __unused = autoreleaseFast(obj);
        assert(!dest  ||  dest == EMPTY_POOL_PLACEHOLDER  ||  *dest == obj);
        return obj;
    }
```

复制

可以看到，调用了`autorelease`方法的对象，也是通过以上解析的`autoreleaseFast()`方法添加进`Page`中。

#### pop

```js
    static inline void pop(void *token) 
    {
        AutoreleasePoolPage *page;
        id *stop;

        if (token == (void*)EMPTY_POOL_PLACEHOLDER) {
            // Popping the top-level placeholder pool.
            if (hotPage()) {
                // Pool was used. Pop its contents normally.
                // Pool pages remain allocated for re-use as usual.
                pop(coldPage()->begin());
            } else {
                // Pool was never used. Clear the placeholder.
                setHotPage(nil);
            }
            return;
        }

        page = pageForPointer(token);
        stop = (id *)token;
        if (*stop != POOL_BOUNDARY) {
            if (stop == page->begin()  &&  !page->parent) {
                // Start of coldest page may correctly not be POOL_BOUNDARY:
                // 1. top-level pool is popped, leaving the cold page in place
                // 2. an object is autoreleased with no pool
            } else {
                // Error. For bincompat purposes this is not 
                // fatal in executables built with old SDKs.
                return badPop(token);
            }
        }

        if (PrintPoolHiwat) printHiwat();

        page->releaseUntil(stop);

        // memory: delete empty children
        if (DebugPoolAllocation  &&  page->empty()) {
            // special case: delete everything during page-per-pool debugging
            AutoreleasePoolPage *parent = page->parent;
            page->kill();
            setHotPage(parent);
        } else if (DebugMissingPools  &&  page->empty()  &&  !page->parent) {
            // special case: delete everything for pop(top) 
            // when debugging missing autorelease pools
            page->kill();
            setHotPage(nil);
        } 
        else if (page->child) {
            // hysteresis: keep one empty child if page is more than half full
            if (page->lessThanHalfFull()) {
                page->child->kill();
            }
            else if (page->child->child) {
                page->child->child->kill();
            }
        }
    }
```

复制

`pop()`方法的传参`token`即为`POOL_BOUNDARY`对应在`Page`中的地址。当销毁自动释放池时，会调用`pop()`方法将自动释放池中的`autorelease`对象全部释放（实际上是从自动释放池的中的最后一个入栈的`autorelease`对象开始，依次给它们发送一条`release`消息，直到遇到这个`POOL_BOUNDARY`）。`pop()`方法的执行过程如下：

- ① 判断`token`是不是`EMPTY_POOL_PLACEHOLDER`，是的话就清空这个自动释放池；
- ② 如果不是的话，就通过`pageForPointer(token)`拿到`token`所在的`Page`（自动释放池的首个`Page`）；
- ③ 通过`page->releaseUntil(stop)`将自动释放池中的`autorelease`对象全部释放，传参`stop`即为`POOL_BOUNDARY`的地址；
- ④ 判断当前`Page`是否有子`Page`，有的话就销毁。

`pop()`方法中释放`autorelease`对象的过程在`releaseUntil()`方法中，下面来看一下这个方法的实现：

```js
    void releaseUntil(id *stop) 
    {
        // Not recursive: we don't want to blow out the stack 
        // if a thread accumulates a stupendous amount of garbage
        
        while (this->next != stop) {
            // Restart from hotPage() every time, in case -release 
            // autoreleased more objects
            AutoreleasePoolPage *page = hotPage();

            // fixme I think this `while` can be `if`, but I can't prove it
            while (page->empty()) {
                page = page->parent;
                setHotPage(page);
            }

            page->unprotect();
            id obj = *--page->next;  // next指针是指向最后一个对象的后一个位置，所以需要先减1
            memset((void*)page->next, SCRIBBLE, sizeof(*page->next));
            page->protect();

            if (obj != POOL_BOUNDARY) {
                objc_release(obj);
            }
        }

        setHotPage(this);

#if DEBUG
        // we expect any children to be completely empty
        for (AutoreleasePoolPage *page = child; page; page = page->child) {
            assert(page->empty());
        }
#endif
    }
```

复制

`releaseUntil()`方法其实就是通过一个`while`循环，从最后一个入栈的`autorelease`对象开始，依次给它们发送一条`release`消息，直到遇到这个`POOL_BOUNDARY`。

#### AutoreleasePoolPage()

我们来看一下创建一个`Page`的过程。`AutoreleasePoolPage()`方法的参数为`parentPage`，新创建的`Page`的`depth`加一，`next`指针的初始位置指向`begin`，将新创建的`Page`的`parent`指针指向`parentPage`。将`parentPage`的`child`指针指向自己，这就形成了`双向链表`的结构。

```js
    AutoreleasePoolPage(AutoreleasePoolPage *newParent) 
        : magic(), next(begin()), thread(pthread_self()),
          parent(newParent), child(nil), 
          depth(parent ? 1+parent->depth : 0), 
          hiwat(parent ? parent->hiwat : 0)
    { 
        if (parent) {
            parent->check();
            assert(!parent->child);
            parent->unprotect();
            parent->child = this;
            parent->protect();
        }
        protect();
    }
```

复制

#### begin、end、empty、full

下面再来看一下`begin`、`end`、`empty`、`full`这些方法的实现。

- `begin`的地址为：`Page`自己的地址+`Page`对象的大小`56`个字节；
- `end`的地址为：`Page`自己的地址+`4096`个字节；
- `empty`判断`Page`是否为空的条件是`next`地址是不是等于`begin`；
- `full`判断`Page`是否已满的条件是`next`地址是不是等于`end`（栈顶）。

```js
    id * begin() {
        return (id *) ((uint8_t *)this+sizeof(*this));
    }

    id * end() {
        return (id *) ((uint8_t *)this+SIZE);
    }

    bool empty() {
        return next == begin();
    }

    bool full() { 
        return next == end();
    }
```

复制

> **小结：** `push`操作是往自动释放池中添加一个`POOL_BOUNDARY`，并返回它存放的内存地址；
>
> 接着每有一个对象调用`autorelease`方法，会将它的内存地址添加进自动释放池中。 `pop`操作是传入一个`POOL_BOUNDARY`的内存地址，从最后一个入栈的`autorelease`对象开始，将自动释放池中的`autorelease`对象全部释放（实际上是给它们发送一条`release`消息），直到遇到这个`POOL_BOUNDARY`。

## 3. 查看自动释放池的情况

可以通过以下私有函数来查看自动释放池的情况：

```js
extern void _objc_autoreleasePoolPrint(void);
```

复制

## 4. 使用 macOS 工程示例分析

由于`iOS`工程中，系统在自动释放池中注册了一些对象。为了排除这些干扰，接下来我们通过`macOS`工程代码示例，结合`AutoreleasePoolPage`的内存分布图以及`_objc_autoreleasePoolPrint()`私有函数，来帮助我们更好地理解`@autoreleasepool`的原理。

> **注意：**由于`ARC`环境下不能调用`autorelease`等方法，所以需要将工程切换为`MRC`环境。
>
> 如果使用`ARC`，则可以使用`__autoreleasing`所有权修饰符替代`autorelease`方法。

#### 单个 @autoreleasepool

```js
int main(int argc, const char * argv[]) {
    _objc_autoreleasePoolPrint();     // print1
    @autoreleasepool {
        _objc_autoreleasePoolPrint(); // print2
        HTPerson *p1 = [[[HTPerson alloc] init] autorelease];
        HTPerson *p2 = [[[HTPerson alloc] init] autorelease];
        _objc_autoreleasePoolPrint(); // print3
    }
    _objc_autoreleasePoolPrint();     // print4
    return 0;
}
```

复制

![img](https://ask.qcloudimg.com/http-save/6828465/80sah1jpw8.png)

```js
// 自动释放池的情况
objc[68122]: ############## (print1)
objc[68122]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68122]: 0 releases pending. //当前自动释放池中没有任何对象
objc[68122]: [0x102802000]  ................  PAGE  (hot) (cold)
objc[68122]: ##############

objc[68122]: ############## (print2)
objc[68122]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68122]: 1 releases pending. //当前自动释放池中有1个对象，这个对象为POOL_BOUNDARY
objc[68122]: [0x102802000]  ................  PAGE  (hot) (cold)
objc[68122]: [0x102802038]  ################  POOL 0x102802038  //POOL_BOUNDARY
objc[68122]: ##############

objc[68122]: ############## (print3)
objc[68122]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68122]: 3 releases pending. //当前自动释放池中有3个对象
objc[68122]: [0x102802000]  ................  PAGE  (hot) (cold)
objc[68122]: [0x102802038]  ################  POOL 0x102802038  //POOL_BOUNDARY
objc[68122]: [0x102802040]       0x100704a10  HTPerson          //p1
objc[68122]: [0x102802048]       0x10075cc30  HTPerson          //p2
objc[68122]: ##############

objc[68156]: ############## (print4)
objc[68156]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68156]: 0 releases pending. //当前自动释放池中没有任何对象，因为@autoreleasepool作用域结束，调用pop方法释放了对象
objc[68156]: [0x100810000]  ................  PAGE  (hot) (cold)
objc[68156]: ##############
```

复制

### 嵌套 @autoreleasepool

```js
int main(int argc, const char * argv[]) {
    _objc_autoreleasePoolPrint();             // print1
    @autoreleasepool { //r1 = push()
        _objc_autoreleasePoolPrint();         // print2
        HTPerson *p1 = [[[HTPerson alloc] init] autorelease];
        HTPerson *p2 = [[[HTPerson alloc] init] autorelease];
        _objc_autoreleasePoolPrint();         // print3
        @autoreleasepool { //r2 = push()
            HTPerson *p3 = [[[HTPerson alloc] init] autorelease];
            _objc_autoreleasePoolPrint();     // print4
            @autoreleasepool { //r3 = push()
                HTPerson *p4 = [[[HTPerson alloc] init] autorelease];
                _objc_autoreleasePoolPrint(); // print5
            } //pop(r3)
            _objc_autoreleasePoolPrint();     // print6
        } //pop(r2)
        _objc_autoreleasePoolPrint();         // print7
    } //pop(r1)
    _objc_autoreleasePoolPrint();             // print8
    return 0;
}
```

复制

![img](https://ask.qcloudimg.com/http-save/6828465/ube2v9nbxr.png)

```js
// 自动释放池的情况
objc[68285]: ############## (print1)
objc[68285]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68285]: 0 releases pending. //当前自动释放池中没有任何对象
objc[68285]: [0x102802000]  ................  PAGE  (hot) (cold)
objc[68285]: ##############

objc[68285]: ############## (print2)
objc[68285]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68285]: 1 releases pending. //当前自动释放池中有1个对象
objc[68285]: [0x102802000]  ................  PAGE  (hot) (cold)
objc[68285]: [0x102802038]  ################  POOL 0x102802038  //POOL_BOUNDARY
objc[68285]: ##############

objc[68285]: ############## (print3)
objc[68285]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68285]: 3 releases pending. //当前自动释放池中有3个对象（1个@autoreleasepool）
objc[68285]: [0x102802000]  ................  PAGE  (hot) (cold)
objc[68285]: [0x102802038]  ################  POOL 0x102802038  //POOL_BOUNDARY
objc[68285]: [0x102802040]       0x100707d80  HTPerson          //p1
objc[68285]: [0x102802048]       0x100707de0  HTPerson          //p2
objc[68285]: ##############

objc[68285]: ############## (print4)
objc[68285]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68285]: 5 releases pending. //当前自动释放池中有5个对象（2个@autoreleasepool）
objc[68285]: [0x102802000]  ................  PAGE  (hot) (cold)
objc[68285]: [0x102802038]  ################  POOL 0x102802038  //POOL_BOUNDARY
objc[68285]: [0x102802040]       0x100707d80  HTPerson          //p1
objc[68285]: [0x102802048]       0x100707de0  HTPerson          //p2
objc[68285]: [0x102802050]  ################  POOL 0x102802050  //POOL_BOUNDARY
objc[68285]: [0x102802058]       0x1005065b0  HTPerson          //p3
objc[68285]: ##############

objc[68285]: ############## (print5)
objc[68285]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68285]: 7 releases pending. //当前自动释放池中有7个对象（3个@autoreleasepool）
objc[68285]: [0x102802000]  ................  PAGE  (hot) (cold)
objc[68285]: [0x102802038]  ################  POOL 0x102802038  //POOL_BOUNDARY
objc[68285]: [0x102802040]       0x100707d80  HTPerson          //p1
objc[68285]: [0x102802048]       0x100707de0  HTPerson          //p2
objc[68285]: [0x102802050]  ################  POOL 0x102802050  //POOL_BOUNDARY
objc[68285]: [0x102802058]       0x1005065b0  HTPerson          //p3
objc[68285]: [0x102802060]  ################  POOL 0x102802060  //POOL_BOUNDARY
objc[68285]: [0x102802068]       0x100551880  HTPerson          //p4
objc[68285]: ##############

objc[68285]: ############## (print6)
objc[68285]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68285]: 5 releases pending. //当前自动释放池中有5个对象（第3个@autoreleasepool已释放）
objc[68285]: [0x102802000]  ................  PAGE  (hot) (cold)
objc[68285]: [0x102802038]  ################  POOL 0x102802038
objc[68285]: [0x102802040]       0x100707d80  HTPerson
objc[68285]: [0x102802048]       0x100707de0  HTPerson
objc[68285]: [0x102802050]  ################  POOL 0x102802050
objc[68285]: [0x102802058]       0x1005065b0  HTPerson
objc[68285]: ##############

objc[68285]: ############## (print7)
objc[68285]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68285]: 3 releases pending. //当前自动释放池中有3个对象（第2、3个@autoreleasepool已释放）
objc[68285]: [0x102802000]  ................  PAGE  (hot) (cold)
objc[68285]: [0x102802038]  ################  POOL 0x102802038
objc[68285]: [0x102802040]       0x100707d80  HTPerson
objc[68285]: [0x102802048]       0x100707de0  HTPerson
objc[68285]: ##############

objc[68285]: ############## (print8)
objc[68285]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[68285]: 0 releases pending. //当前自动释放池没有任何对象（3个@autoreleasepool都已释放）
objc[68285]: [0x102802000]  ................  PAGE  (hot) (cold)
objc[68285]: ##############
```

复制

### 复杂情况 @autoreleasepool

由`AutoreleasePoolPage`类的定义可知，自动释放池（即所有的`AutoreleasePoolPage`对象）是以`栈`为结点通过`双向链表`的形式组合而成。每当`Page`满了的时候，就会创建一个新的`Page`，并设置它为`hotPage`，而首个`Page`为`coldPage`。接下来我们来看一下多个`Page`和多个`@autoreleasepool`嵌套的情况。

```js
int main(int argc, const char * argv[]) {
    @autoreleasepool { //r1 = push()
        for (int i = 0; i < 600; i++) {
            HTPerson *p = [[[HTPerson alloc] init] autorelease];
        }
        @autoreleasepool { //r2 = push()
            for (int i = 0; i < 500; i++) {
                HTPerson *p = [[[HTPerson alloc] init] autorelease];
            }
            @autoreleasepool { //r3 = push()
                for (int i = 0; i < 200; i++) {
                    HTPerson *p = [[[HTPerson alloc] init] autorelease];
                }
                _objc_autoreleasePoolPrint();
            } //pop(r3)
        } //pop(r2)
    } //pop(r1)
    return 0;
}
```

复制

一个`AutoreleasePoolPage`对象的内存大小为`4096`个字节，它自身成员变量占用内存`56`个字节，所以剩下的`4040`个字节用来存储`autorelease`对象的内存地址。又因为`64bit`下一个`OC`对象的指针所占内存为`8`个字节，所以一个`Page`可以存放`505`个对象的地址。`POOL_BOUNDARY`也是一个对象，因为它的值为`nil`。所以以上代码的自动释放池内存分布图如下所示。

![img](https://ask.qcloudimg.com/http-save/6828465/2h24og89ze.png)

```js
objc[69731]: ##############
objc[69731]: AUTORELEASE POOLS for thread 0x1000aa5c0
objc[69731]: 1303 releases pending. //当前自动释放池中有1303个对象（3个POOL_BOUNDARY和1300个HTPerson实例）
objc[69731]: [0x100806000]  ................  PAGE (full)  (cold) /* 第一个PAGE，full代表已满，cold代表coldPage */
objc[69731]: [0x100806038]  ################  POOL 0x100806038    //POOL_BOUNDARY
objc[69731]: [0x100806040]       0x10182a040  HTPerson            //p1
objc[69731]: [0x100806048]       .....................            //...
objc[69731]: [0x100806ff8]       0x101824e40  HTPerson            //p504
objc[69731]: [0x102806000]  ................  PAGE (full)         /* 第二个PAGE */
objc[69731]: [0x102806038]       0x101824e50  HTPerson            //p505
objc[69731]: [0x102806040]       .....................            //...
objc[69731]: [0x102806330]       0x101825440  HTPerson            //p600
objc[69731]: [0x102806338]  ################  POOL 0x102806338    //POOL_BOUNDARY
objc[69731]: [0x102806340]       0x101825450  HTPerson            //p601
objc[69731]: [0x102806348]       .....................            //...
objc[69731]: [0x1028067e0]       0x101825d90  HTPerson            //p1008
objc[69731]: [0x102804000]  ................  PAGE  (hot)         /* 第三个PAGE，hot代表hotPage */
objc[69731]: [0x102804038]       0x101826dd0  HTPerson            //p1009
objc[69731]: [0x102804040]       .....................            //...
objc[69731]: [0x102804310]       0x101827380  HTPerson            //p1100
objc[69731]: [0x102804318]  ################  POOL 0x102804318    //POOL_BOUNDARY
objc[69731]: [0x102804320]       0x101827390  HTPerson            //p1101
objc[69731]: [0x102804328]       .....................            //...
objc[69731]: [0x102804958]       0x10182b160  HTPerson            //p1300
objc[69731]: ##############
```

复制

## 5. 使用 iOS 工程示例分析

从以上`macOS`工程示例可以得知，在`@autoreleasepool`大括号结束的时候，就会调用`Page`的`pop()`方法，给`@autoreleasepool`中的`autorelease`对象发送`release`消息。

那么在`iOS`工程中，方法里的`autorelease`对象是什么时候释放的呢？有系统干预释放和手动干预释放两种情况。

- 系统干预释放是不指定`@autoreleasepool`，所有`autorelease`对象都由主线程的`RunLoop`创建的`@autoreleasepool`来管理。
- 手动干预释放就是将`autorelease`对象添加进我们手动创建的`@autoreleasepool`中。

下面还是在`MRC`环境下进行分析。

### 系统干预释放

我们先来看以下 Xcode 11 版本的`iOS`程序中的`main()`函数，和旧版本的差异。

```js
// Xcode 11
int main(int argc, char * argv[]) {
    NSString * appDelegateClassName;
    @autoreleasepool {
        // Setup code that might create autoreleased objects goes here.
        appDelegateClassName = NSStringFromClass([AppDelegate class]);
    }
    return UIApplicationMain(argc, argv, nil, appDelegateClassName);
}
```

复制

```js
// Xcode 旧版本
int main(int argc, char * argv[]) {
    @autoreleasepool {
        return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
    }
}
```

复制

> **注意：** 
>
> **网上对于`iOS`工程的`main()`函数中的`@autoreleasepool`有一种解释：**
>
> 在`iOS`工程的`main()`函数中有一个`@autoreleasepool`，这个`@autoreleasepool`负责了应用程序所有`autorelease`对象的释放。
>
> **其实这个解释是错误的。**
>
> 如果你的程序使用了`AppKit`或`UIKit`框架，那么主线程的`RunLoop`就会在每次事件循环迭代中创建并处理`@autoreleasepool`。也就是说，应用程序所有`autorelease`对象的都是由`RunLoop`创建的`@autoreleasepool`来管理。而`main()`函数中的`@autoreleasepool`只是负责管理它的作用域中的`autorelease`对象。 在以上`《使用 MacOS 工程示例分析》`章节中提到了嵌套`@autoreleasepool`的情况。Xcode 旧版本的`main`函数中是将整个应用程序运行（`UIApplicationMain`）放在`@autoreleasepool`内，而主线程的`RunLoop`就是在`UIApplicationMain`中创建，所以`RunLoop`创建的`@autoreleasepool`是嵌套在`main`函数的`@autoreleasepool`内的。`RunLoop`会在每次事件循环中对自动释放池进行`pop`和`push`（以下会详细讲解），但是它的`pop`只会释放掉它的`POOL_BOUNDARY`之后的对象，它并不会影响到外层即`main`函数中`@autoreleasepool`。
>
> **新版本 Xcode 11 中的 main 函数发生了哪些变化？**
>
> 旧版本是将整个应用程序运行放在`@autoreleasepool`内，由于`RunLoop`的存在，要`return`即程序结束后`@autoreleasepool`作用域才会结束，这意味着程序结束后`main`函数中的`@autoreleasepool`中的`autorelease`对象才会释放。 而在 Xcode 11中，触发主线程`RunLoop`的`UIApplicationMain`函数放在了`@autoreleasepool`外面，这可以保证`@autoreleasepool`中的`autorelease`对象在程序启动后立即释放。正如新版本的`@autoreleasepool`中的注释所写 “`Setup code that might create autoreleased objects goes here.`”（如上代码），可以将`autorelease`对象放在此处。

接着我们来看 “系统干预释放” 情况的示例：

```js
- (void)viewDidLoad {
    [super viewDidLoad];    
    HTPerson *person = [[[HTPerson alloc] init] autorelease];    
    NSLog(@"%s", __func__);
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];    
    NSLog(@"%s", __func__);
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];    
    NSLog(@"%s", __func__);
}

// -[ViewController viewDidLoad]
// -[ViewController viewWillAppear:]
// -[HTPerson dealloc]
// -[ViewController viewDidAppear:]
```

复制

可以看到，调用了`autorelease`方法的`person`对象不是在`viewDidLoad`方法结束后释放，而是在`viewWillAppear`方法结束后释放，说明在`viewWillAppear`方法结束的时候，调用了`pop()`方法释放了`person`对象。其实这是由`RunLoop`控制的，下面来讲解一下`RunLoop`和`@autoreleasepool`的关系。

### RunLoop 与 @autoreleasepool

> 学习这个知识点之前，需要先搞懂`RunLoop`的事件循环机制以及它的`6`种活动状态，可以查看我的文章：
>
> [《深入浅出 RunLoop（二）：数据结构》](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fjuejin.im%2Fpost%2F5e57a2e5e51d4526e32c319a)
>
> [《深入浅出 RunLoop（三）：事件循环机制》](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fjuejin.im%2Fpost%2F5e57a8946fb9a07c994be136)

`iOS`在主线程的`RunLoop`中注册了两个`Observer`。

- 第1个`Observer`监听了`kCFRunLoopEntry`事件，会调用`objc_autoreleasePoolPush()`；
- 第2个`Observer` ① 监听了`kCFRunLoopBeforeWaiting`事件，会调用`objc_autoreleasePoolPop()`、`objc_autoreleasePoolPush()`； ② 监听了`kCFRunLoopBeforeExit`事件，会调用`objc_autoreleasePoolPop()`。

![img](https://ask.qcloudimg.com/http-save/6828465/gsyzek73i8.png)

所以，在`iOS`工程中系统干预释放的`autorelease`对象的释放时机是由`RunLoop`控制的，会在当前`RunLoop`每次循环结束时释放。以上`person`对象在`viewWillAppear`方法结束后释放，说明`viewDidLoad`和`viewWillAppear`方法在同一次循环里。

- `kCFRunLoopEntry`：在即将进入`RunLoop`时，会自动创建了一个`__AtAutoreleasePool`结构体对象，并调用`objc_autoreleasePoolPush()`函数。
- `kCFRunLoopBeforeWaiting`：在`RunLoop`即将休眠时，会自动销毁一个`__AtAutoreleasePool`对象，调用`objc_autoreleasePoolPop()`。然后创建一个新的`__AtAutoreleasePool`对象，并调用`objc_autoreleasePoolPush()`。
- `kCFRunLoopBeforeExit`，在即将退出`RunLoop`时，会自动销毁最后一个创建的`__AtAutoreleasePool`对象，并调用`objc_autoreleasePoolPop()`。

### 手动干预释放

我们再来看一下手动干预释放的情况。

```js
- (void)viewDidLoad {
    [super viewDidLoad];    
    @autoreleasepool {
        HTPerson *person = [[[HTPerson alloc] init] autorelease];  
    }  
    NSLog(@"%s", __func__);
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];    
    NSLog(@"%s", __func__);
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];    
    NSLog(@"%s", __func__);
}

// -[HTPerson dealloc]
// -[ViewController viewDidLoad]
// -[ViewController viewWillAppear:]
// -[ViewController viewDidAppear:]
```

复制

可以看到，添加进手动指定的`@autoreleasepool`中的`autorelease`对象，在`@autoreleasepool`大括号结束时就会释放，不受`RunLoop`控制。

## 相关问题

### Q：ARC 环境下，方法里的局部对象什么时候释放？

以上都是在`MRC`环境下分析，因为`ARC`下不能给对象调用`retain`

`release`、`autorelease`等方法，`LLVM`编译器会自动为我们插入这些代码。

那`ARC`中方法里的局部对象什么时候释放？其实只要知道`LLVM`编译器在编译时给对象插入`release`还是`autorelease`方法就知道了。如果插入的是`release`，那么这个局部对象在方法结束时就会释放；如果插入的是`autorelease`，那么这个局部对象的释放时机由`RunLoop`控制。

> **备注：** 在`MRC`下，通过`alloc/new/copy/mutableCopy`或以这些命名开头的方法创建的对象直接持有，而通过其它方法创建的对象会通过调用`autorelease`加入到自动释放池中。而`ARC`下不能调用`autorelease`方法，那么`ARC`怎么做到这一点呢？
>
> **《Objective-C 高级编程：iOS 与 OS X 多线程和内存管理》** 书中是说：在`ARC`下，编译器会检查方法名是否以`alloc/new/copy/mutableCopy`开始，如果不是则自动将返回值的对象注册到`@autoreleasepool`。
>
> 但经过测试，发现并不是如此。而且，以前在`MRC`下通过`array`类方法创建的`NSMutableArray`对象会被加入到`@autoreleasepool`，但是在`ARC`下并不会。
>
> 所以，根据方法名并不能判断`ARC`会不会将对象加入到`@autoreleasepool`。如果我们需要这么做，建议使用`__autoreleasing`修饰符。

### Q：ARC 环境下，autorelease 对象在什么时候释放？

回到我们最初的面试题，在`ARC`环境下，`autorelease`对象在什么时候释放？我们就分`系统干预释放`和`手动干预释放`两种情况回答。

### Q：ARC 环境下，需不需要手动添加 @autoreleasepool？

AppKit 和 UIKit 框架会在`RunLoop`每次事件循环迭代中创建并处理`@autoreleasepool`，因此，你通常不必自己创建`@autoreleasepool`，甚至不需要知道创建`@autoreleasepool`的代码怎么写。但是，有些情况需要自己创建`@autoreleasepool`。

例如，如果我们需要在循环中创建了很多临时的`autorelease`对象，则手动添加`@autoreleasepool`来管理这些对象可以很大程度地减少内存峰值。比如在`for`循环中`alloc`图片数据等内存消耗较大的场景，需要手动添加`@autoreleasepool`。

> 苹果给出了三种需要手动添加`@autoreleasepool`的情况：
>
> ① 如果你编写的程序不是基于 UI 框架的，比如说[命令行工具](https://cloud.tencent.com/product/cli?from_column=20065&from=20065)；
>
> ② 如果你编写的循环中创建了大量的临时对象；
>
> 你可以在循环内使用`@autoreleasepool`在下一次迭代之前处理这些对象。在循环中使用`@autoreleasepool`有助于减少应用程序的最大内存占用。
>
> ③ 如果你创建了辅助线程。
>
> 一旦线程开始执行，就必须创建自己的`@autoreleasepool`；否则，你的应用程序将存在内存泄漏。

## 版本更新

| 版本日期  | 更新内容                                                     |
| :-------- | :----------------------------------------------------------- |
| 2020.3.17 | 首次发布文章                                                 |
| 2020.4.17 | 新增问题：对`释放 NSAutoreleasePool 对象，使用 [pool release] 与 [pool drain] 的区别？`问题的解释； 2. 修改错误：`在 iOS 中 main 函数中的 @autoreleasepool 负责整个应用程序 autorelease 对象的释放`； 3. 新增问题：对`新版本 Xcode 11 中的 main 函数发生了哪些变化？`问题的解释； 4. 修改错误：对`ARC 环境下，方法里的局部对象什么时候释放？`问题的解释； 5. 新增分析：`Runtime`最新源代码`objc4-779.1`中对`AutoreleasePoolPage`类的更新：`AutoreleasePoolPage`现在继承自`AutoreleasePoolPageData`。 |

