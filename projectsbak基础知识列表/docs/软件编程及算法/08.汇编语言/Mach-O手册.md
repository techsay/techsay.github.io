

[Mach-O手册](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/MachOOverview.html#//apple_ref/doc/uid/20001860-BAJGJEJC)



# Mach-O 可执行格式概述

Mach-O 是 OS X 中二进制文件的本机可执行格式，也是发布代码的首选格式。可执行格式决定了二进制文件中的代码和数据读入内存的顺序。代码和数据的顺序会影响内存的使用和分页活动从而直接影响程序的性能。

Mach-O 二进制文件被组织成段。每个段包含一个或多个部分。不同类型的代码或数据进入每个部分。段总是从页边界开始，但节不一定是页对齐的。段的大小通过其包含的所有部分中的字节数来衡量，并向上舍入到下一个虚拟内存页边界。因此，一个段始终是 4096 字节的倍数，即 4 KB，其中 4096 字节是最小大小。

Mach-O 可执行文件的段和节根据其预期用途来命名。段名称的约定是使用全大写字母，前面加双下划线（例如，`__TEXT`）；节名称的约定是使用全小写字母，前面加双下划线（例如，`__text`）。

Mach-O 可执行文件中有多个可能的段，但只有其中两个与性能相关：段`__TEXT`和`__DATA`段。



## __TEXT 段：只读



该`__TEXT`段是一个包含可执行代码和常量数据的只读区域。按照惯例，编译器工具创建的每个可执行文件都至少有一个只读`__TEXT`段。由于该段是只读的，因此内核只能将该`__TEXT`段从可执行文件直接映射到内存一次。当该段被映射到内存中时，它可以在对其内容感兴趣的所有进程之间共享。（这主要是框架和其他共享库的情况。）只读属性还意味着组成段的页面`__TEXT`不必保存到后备存储中。如果内核需要释放物理内存，它可以丢弃一页或多`__TEXT`页，并在需要时从磁盘重新读取它们。

[表 1](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/MachOOverview.html#//apple_ref/doc/uid/20001860-99943-BAJDDDDH)列出了该段中可能出现的一些更重要的部分`__TEXT`。有关段的完整列表，请参阅*Mach-O 运行时架构*。



| 部分               | 描述                                                 |
| :----------------- | :--------------------------------------------------- |
| `__text`           | 可执行文件的已编译机器代码                           |
| `__const`          | 可执行文件的一般常量数据                             |
| `__cstring`        | 文字字符串常量（源代码中引用的字符串）               |
| `__picsymbol_stub` | 使用的与位置无关的代码存根例程动态链接器 ( `dyld`)。 |



## __DATA 段：读/写

该`__DATA`段包含非常量数据对于可执行文件。该段是可读可写的。因为它是可写的，所以`__DATA`框架或其他共享库的段在逻辑上被复制到与库链接的每个进程。当内存页可读可写时，内核会对它们进行标记*写时复制*。此技术推迟复制页面，直到共享该页面的进程之一尝试写入该页面。当这种情况发生时，内核会为该进程创建该页面的私有副本。

该`__DATA`段有许多节，其中一些仅由动态链接器使用。[表 2](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/MachOOverview.html#//apple_ref/doc/uid/20001860-100074-BAJCDHJE)列出了该段中可能出现的一些更重要的部分`__DATA`。有关段的完整列表，请参阅*Mach-O 运行时架构*。



| 部分              | 描述                                                         |
| :---------------- | :----------------------------------------------------------- |
| `__data`          | 已初始化的全局变量（例如`int a = 1;`或`static int a = 1;`）。 |
| `__const`         | 需要重定位的常量数据（例如 `char * const p = "foo";`）。     |
| `__bss`           | 未初始化的静态变量（例如，`static int a;`）。                |
| `__common`        | 未初始化的外部全局变量（例如，`int a;`外部功能块）。         |
| `__dyld`          | 占位符部分，由动态链接器使用。                               |
| `__la_symbol_ptr` | “懒惰”符号指针。可执行文件调用的每个未定义函数的符号指针。   |
| `__nl_symbol_ptr` | “非惰性”符号指针。可执行文件引用的每个未定义数据符号的符号指针。 |



## Mach-O 性能影响

Mach-O 可执行文件的`__TEXT`和段的组成对性能有直接影响。`__DATA`优化这些细分市场的技术和目标是不同的。然而，他们有一个共同的目标：提高内存的使用效率。

大多数典型的 Mach-O 文件由可执行代码组成，占据`__TEXT`,`__text`部分。[如__TEXT 段：只读](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/MachOOverview.html#//apple_ref/doc/uid/20001860-99893)中所述，该`__TEXT`段是只读的，并直接映射到可执行文件。因此，如果内核需要回收某些页面占用的物理内存`__text`，则不必将这些页面保存到后备存储并稍后将其分页。它只需要释放内存，并且当稍后引用代码时，从磁盘读回它。尽管这比交换便宜（因为它涉及一次磁盘访问而不是两次），但它仍然可能很昂贵，尤其是在必须从磁盘重新创建许多页面的情况下。

改善这种情况的一种方法是通过过程重新排序来改善代码的引用局部性，如[改进引用局部性](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-CJBJFIDD)中所述。该技术根据方法和函数的执行顺序、调用频率以及相互调用的频率将它们分组在一起。如果`__text`节组中的页面以这种方式逻辑地运行，则它们不太可能被多次释放和读回。例如，如果您将所有启动时初始化函数放在一两个页面上，则在这些初始化发生后不必重新创建这些页面。

与段不同`__TEXT`，`__DATA`段可以写入，因此`__DATA`段中的页面不可共享。框架中的非常量全局变量可能会对性能产生影响，因为与框架链接的每个进程都会获得自己的这些变量的副本。这个问题的主要解决方案是通过声明尽可能多的非常量全局变量到`__TEXT`,部分。[减少共享内存页](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/SharedPages.html#//apple_ref/doc/uid/20001863-CJBJFIDD)描述了这一技术和相关技术。对于应用程序来说，这通常不是问题，因为应用程序中的部分不与其他应用程序共享。`__const``const``__DATA`

编译器将不同类型的非常量全局数据存储在`__DATA`段的不同部分中。这些类型的数据是与未声明的“暂定定义”的 ANSI C 概念一致的未初始化静态数据和符号`extern`。未初始化的静态数据位于`__bss`该`__DATA`段的部分中。暂定定义符号位于`__common` 该段的一部分`__DATA`。

这ANSI C 和C++ 标准指定系统必须将未初始化的静态变量设置为零。（其他类型的未初始化数据保持未初始化状态。）由于未初始化的静态变量和暂定定义符号存储在不同的段中，因此系统需要对它们进行不同的处理。但是，当变量位于不同的部分时，它们更有可能位于不同的内存页面上，因此可以单独换入和换出，从而使代码运行速度变慢。[如减少共享内存页](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/SharedPages.html#//apple_ref/doc/uid/20001863-CJBJFIDD)中所述，这些问题的解决方案是将非常量全局数据合并到`__DATA`段的一个部分中。

[下一个](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/CompilerOptions.html)[以前的](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/CodeFootprint.html)



# 管理代码大小

GCC 编译器支持多种用于优化代码的选项。大多数这些技术都会生成更少的代码或更快的代码，具体取决于您的需求。当您准备要发布的软件时，您应该尝试这些技术，看看哪些技术对您的代码最有利。



## 编译器级优化

当您的项目代码稳定后，您应该开始尝试使用基本的 GCC 选项来优化代码。GCC 编译器支持优化选项，让您可以选择更小的二进制大小、更快的代码还是更快的构建时间。

对于新项目，Xcode 自动禁用开发构建风格的优化，并为部署构建风格选择“Fastest, smallest(最快、最小)”选项。由于优化过程中涉及额外的工作，任何类型的代码优化都会导致构建时间变慢。如果您的代码正在发生变化，就像在开发周期中那样，您不希望启用优化。然而，当您的开发周期接近尾声时，部署构建样式可以让您了解成品的大小。

表 1列出了 Xcode 中可用的优化级别。当您选择这些选项之一时，Xcode 会将给定组或文件的适当标志传递给 GCC 编译器。这些选项可在目标级别使用或作为构建样式的一部分使用。有关使用项目的构建设置的信息，请参阅 Xcode 帮助。



| Xcode 设置        | 描述                                                         |
| :---------------- | :----------------------------------------------------------- |
| None              | 编译器不会尝试优化代码。当您专注于解决逻辑错误并需要快速编译时间时，请在开发过程中使用此选项。不要使用此选项来传送可执行文件。 |
| Fast              | 编译器执行简单的优化以提高代码性能，同时最大限度地减少对编译时间的影响。此选项在编译期间也会使用更多内存。 |
| Faster            | 执行几乎所有支持的不需要时空权衡的优化。编译器不会使用此选项执行循环展开或函数内联。此选项会增加编译时间和生成代码的性能。 |
| Fastest           | 执行所有优化以尝试提高生成代码的速度。当编译器执行积极的函数内联时，此选项可能会增加生成代码的大小。一般不推荐此选项。有关详细信息，请参阅[避免过多的函数内联。](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/CompilerOptions.html#//apple_ref/doc/uid/20001861-131770) |
| Fastest, smallest | 执行通常不会增加代码大小的所有优化。这是传送代码的首选选项，因为它为您的可执行文件提供了更小的内存占用。 |

与任何性能增强一样，不要假设哪个选项会给您带来最佳结果。您应该始终衡量您尝试的每个优化的结果。例如，“Fastest (最快)”选项可能会为特定模块生成极快的代码，但通常会以牺牲可执行文件大小为代价。如果代码需要在运行时从磁盘调入，那么从代码生成中获得的任何速度优势都很容易丢失。



## 额外的优化

除了代码级优化之外，您还可以使用一些其他技术在模块级组织代码。以下各节介绍了这些技术。



### 彻底剥离你的代码



对于静态链接的可执行文件，死代码剥离是从可执行文件中删除未引用代码的过程。死剥离背后的想法是，如果代码未被引用，则不得使用它，因此在可执行文件中不需要它。删除死代码可以减少可执行文件的大小，并有助于减少分页。

从 Xcode Tools 版本 1.5 开始，静态链接器 ( `ld`) 支持可执行文件的死剥离。您可以直接从 Xcode 或通过将适当的命令行选项传递给静态链接器来启用此功能。

要在 Xcode 中启用死代码剥离，请执行以下操作：

1. 选择您的目标。
2. 打开“检查器”或“获取信息”窗口并选择“构建”选项卡。
3. 在“链接”设置中，启用“死代码剥离”选项。
4. 在“代码生成”设置中，将“调试符号级别”选项设置为“所有符号”。

要从命令行启用死代码剥离，请将选项传递`-dead_strip`给`ld`. 您还应该将该`-gfull`选项传递给 GCC 来为您的代码生成一套完整的调试符号。链接器使用这些额外的调试信息来死区剥离可执行文件。

**注意：**`-gfull`即使您不打算彻底删除代码，也建议使用 “All Symbols” “所有符号”或选项。尽管该选项生成较大的中间文件，但它通常会生成较小的可执行文件，因为链接器能够更有效地删除重复的符号信息。



如果您不想删除任何未使用的功能，您至少应该将它们隔离在段的单独部分中`__TEXT`。将未使用的函数移动到公共部分可以提高代码引用的局部性，并降低它们被加载到内存中的可能性。有关如何将函数分组到公共部分的更多信息，请参阅[改进引用局部性](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-CJBJFIDD)。



### 条带符号信息



调试符号和动态绑定信息可能会占用大量空间，并占可执行文件大小的很大一部分。在发送代码之前，您应该删除所有不需要的符号。

要从可执行文件中删除调试符号，请将 Xcode 构建样式设置更改为“部署”并重建可执行文件。如果您愿意，还可以逐个目标地生成调试符号。有关构建样式和目标设置的更多信息，请参阅 Xcode 帮助。

要从可执行文件中手动删除动态绑定符号，请使用该`strip`工具。此工具删除动态链接器通常在运行时绑定外部符号时使用的符号信息。删除不想动态绑定的函数的符号可以减少可执行文件的大小并减少动态链接器必须绑定的符号数量。通常，您可以使用不带任何选项的此命令来删除非外部符号，如下例所示：

| `% cd ~/MyApp/MyApp.app/Contents/MacOS` |
| --------------------------------------- |
| `% strip MyApp剥离我的应用程序`         |

该命令相当于`strip`使用`-u`和`-r`选项运行。它会删除所有标记为 的符号，`non-external`但不会删除标记为 的符号`external`。

手动删除动态绑定符号的另一种方法是使用导出文件来限制在构建时导出的符号。导出文件标识运行时可执行文件中可用的特定符号。有关创建导出文件的更多信息，请参阅[最小化导出的符号](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ReducingExports.html#//apple_ref/doc/uid/20001864-CJBJFIDD)。



### 消除 C++ 异常处理开销



当抛出异常时，C++运行时库必须能够将堆栈展开回第一个匹配`catch`块的位置。为此，GCC 编译器为每个可能引发异常的函数生成堆栈展开信息。该展开信息存储在可执行文件中，并描述堆栈上的对象。通过此信息，可以在引发异常时调用这些对象的析构函数来清理它们。

即使您的代码不引发异常，GCC 编译器仍然默认为 C++ 代码生成堆栈展开信息。如果您广泛使用异常，这些额外的代码可能会显着增加可执行文件的大小。



#### 禁用异常

您可以通过禁用目标的“启用 C++ 异常”构建选项来完全禁用 Xcode 中的异常处理。从命令行将选项传递`-fno-exceptions`给编译器。此选项删除函数的堆栈展开信息。但是，您仍然必须从代码中删除任何`try`、`catch`和语句。`throw`



#### 有选择地禁用异常

如果您的代码在某些地方但不是在所有地方使用异常，则可以通过在方法声明中添加空异常规范来显式标识不需要展开信息的方法。例如，在下面的代码中，编译器必须生成堆栈展开信息，因为`my_function`它`my_other_function`或它调用的函数可能会抛出异常。

```
extern int my_other_function (int a, int b);
int my_function (int a, int b)
{
   return my_other_function (a, b);
}
```



但是，如果您知道`my_other_function`不能引发异常，则可以通过`throw ()`在函数声明中包含空异常规范 ( ) 来向编译器发出信号。因此，您可以将前面的函数声明如下：

```
extern int foo (int a, int b) throw ();
int my_function (int a, int b) throw ()
{
   return foo (a, b);
}
```



#### 最大限度地减少异常的使用

编写代码时，请仔细考虑异常的使用。异常应该用于指示异常情况，也就是说，它们应该用于报告您没有预料到的问题。如果您从文件中读取数据并收到文件结束错误，您不会想抛出异常，因为这是一种已知的错误类型并且可以轻松处理。如果您尝试读取已知已打开的文件并被告知文件 ID 无效，那么您可能会想要抛出异常。



### 避免过多的函数内联



虽然内联函数在某些情况下可以提高速度，但如果过度使用，它们也会降低 OS X 上的性能。内联函数消除了调用函数的开销，但通过用代码副本替换每个函数调用来实现这一点。如果频繁调用内联函数，这些额外的代码可能会快速增加，使可执行文件膨胀并导致分页问题。

使用得当，内联函数可以节省时间并对代码占用空间产生最小的影响。请记住，内联函数的代码通常应该非常短并且不经常调用。如果执行函数中代码所需的时间少于调用该函数所需的时间，则该函数是内联的良好候选者。一般来说，这意味着内联函数可能不应超过几行代码。您还应该确保从代码中尽可能少的位置调用该函数。即使是一个很短的函数，如果在数十个或数百个地方内联，也会导致过度膨胀。

另外，您应该意识到，通常应该避免 GCC 的“最快”优化级别。在此优化级别，编译器会积极尝试创建内联函数，即使对于未标记为内联的函数也是如此。不幸的是，这样做会显着增加可执行文件的大小，并因分页而导致更严重的性能问题。



### 将框架构建为单个模块



大多数共享库不需要 Mach-O 运行时的模块功能。此外，跨模块调用会产生与跨库调用相同的开销。因此，您应该将项目的所有中间目标文件链接到一个模块中。

要合并目标文件，您必须在链接阶段传递该`-r`选项。`ld`如果您使用 Xcode 构建代码，默认情况下会为您完成此操作。



# 改善参考位置

您可以对应用程序性能进行的一项重要改进是减少应用程序在任何给定时间使用的虚拟内存页数。这组页面称为*工作集*由应用程序代码和运行时数据组成。减少内存中的数据量是算法的一个功能，但减少内存中的代码量可以通过称为*分散加载的过程来实现*。此技术也称为改进代码引用的局部性。

通常，方法和函数的编译代码由生成的二进制文件中的源文件组织。分散加载改变了这种组织方式，而是将相关的方法和函数分组在一起，而与这些方法和函数的原始位置无关。此过程允许内核将活动应用程序最常引用的可执行页面保留在尽可能小的内存空间中。这不仅减少了应用程序的占用空间，还减少了这些页面被调出的可能性。



**重要提示：** 您通常应该等到开发周期的最后阶段才分散加载您的应用程序。代码往往会在开发过程中移动，这可能会使之前的分析结果失效。





## 使用 gprof 分析代码

给定运行时收集的分析数据，`gprof`生成程序的执行分析。被调用例程的效果被纳入每个调用者的配置文件中。配置文件数据取自调用图配置文件（`gmon.out`默认情况下），该文件由使用选项编译和链接的程序创建`-pg`。可执行文件中的符号表与调用图配置文件相关。如果指定了多个配置文件，则`gprof`输出将显示给定配置文件中配置信息的总和。

该`gprof`工具可用于多种用途，包括：

- Sampler 应用程序无法正常工作的情况，例如命令行工具或应用程序在短时间内退出
- 您想要一个包含给定程序中可能调用的所有代码的调用图，而不是定期对调用进行采样的情况
- 您想要更改代码的链接顺序以优化代码局部性的情况



### 生成分析数据

在分析应用程序之前，您必须设置项目以生成分析信息。要为 Xcode 项目生成分析信息，您必须修改目标或构建样式设置以包含“Generate profiling code” (生成分析代码) 选项。（有关启用目标和构建样式设置的信息，请参阅 Xcode 帮助。）

程序内的分析代码会生成一个`gmon.out`包含分析信息的文件。（通常，此文件放置在当前工作目录中。）要分析此文件中的数据，请在调用之前将其复制到包含可执行文件的目录，或者仅指定运行时的`gprof`路径。`gmon.out``gprof`

除了分析您自己的代码之外，您还可以通过链接到这些框架的配置文件版本来了解在 Carbon 和 Cocoa 框架上花费了多少时间。为此，请将设置添加`DYLD_IMAGE_SUFFIX`到您的目标或构建样式并将其值设置为`_profile`。动态链接器将此后缀与框架名称相结合，以链接到框架的配置文件版本。要确定哪些框架支持分析，请查看框架本身。例如，Carbon 库附带配置文件和调试版本。



**注意：** 库的配置文件和调试版本作为开发人员工具包的一部分安装，可能在用户系统上不可用。确保您的运输可执行文件不会链接到这些库之一。





### 生成订单文件

订单文件包含有序的行序列，每行由源文件名和符号名组成，用冒号分隔，没有其他空格。每行代表要放置在可执行文件的一部分中的一个块。如果您手动修改文件，则必须严格遵循此格式，以便链接器可以处理该文件。如果目标文件*名*：*符号*名称对不完全是链接器看到的名称，它会尽力将名称与正在链接的对象进行匹配。

用于过程重新排序的订单文件中的行由对象文件名和过程名称（函数、方法或其他符号）组成。顺序文件中列出过程的顺序表示它们链接到`__text`可执行文件部分的顺序。

要根据使用程序生成的分析数据创建订单文件，请`gprof`使用`-S`选项运行（请参阅 的手册页`gprof (1)`）。例如，

```
gprof -S MyApp.profile/MyApp gmon.out
```

该`-S`选项生成四个互斥的订单文件：

| `gmon.order`  | 基于对分析调用图的“最接近的是最好的”分析进行排序。经常互相呼叫的呼叫被放置在一起。 |
| ------------- | ------------------------------------------------------------ |
| `callf.order` | 例程按每个例程的调用次数排序，最大的数字排在前面。           |
| `callo.order` | 例程按调用顺序排序。                                         |
| `time.order`  | 例程按所用 CPU 时间量排序，最大时间排在前面。                |

您应该尝试使用这些文件中的每一个，看看哪个文件提供了最大的性能改进（如果有）。有关如何衡量排序结果的讨论，请参阅[使用 pagestuff 检查磁盘上的页面。](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-103710)

这些命令文件仅包含分析过程中使用的那些过程。链接器跟踪丢失的过程，并在顺序文件中列出的过程之后按默认顺序链接它们。仅当项目目录包含由链接器选项生成的文件时，才会在顺序文件中生成库函数的静态名称`-whatsloaded`；有关详细信息，请参阅[创建默认订单文件](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-103584)。

该`gprof -S`选项不适用于已使用订单文件链接的可执行文件。



### 修复您的订单文件

生成订单文件后，您应该仔细检查它们并确保它们正确。在许多情况下，您需要手动编辑订单文件，包括以下情况：

- 您的可执行文件包含汇编语言文件。
- 您分析了一个已剥离的可执行文件。
- 您的可执行文件包含在没有该`-g`选项的情况下编译的文件。
- 您的项目定义内部标签（通常用于`goto`语句）。
- 您希望保留特定目标文件中例程的顺序。

如果符号的定义位于汇编文件、剥离的可执行文件或不带选项编译的文件中`-g`，`gprof`则在顺序文件中的符号条目中省略源文件名。如果您的项目使用此类文件，则必须手动编辑订单文件并添加适当的源文件名。或者，您可以完全删除符号引用，以强制按默认顺序链接相应的例程。

如果您的代码包含内部标签，则必须从订单文件中删除这些标签；否则，定义标签的函数将在链接阶段被拆分。您可以通过在内部标签前添加字符串 来完全防止在程序集文件中包含内部标签`L_`。汇编器将带有此前缀的符号解释为特定函数的本地符号，并剥离它们以防止其他工具（例如`gprof`.

要保留特定目标文件中例程的顺序，请使用特殊符号`.section_all`。例如，如果目标文件`foo.o`来自汇编源，并且您想要链接所有例程而不重新排序它们，请删除对`foo.o`顺序文件的任何现有引用并插入以下行：

```
foo.o:.section_all
```

此选项对于从程序集源代码编译的目标文件或您没有源代码的目标文件很有用。



### 与订单文件链接

生成订单文件后，您可以使用`-sectorder`和`-e start`选项链接该程序：

```
cc -o outputFile inputFile.o … -sectorder __TEXT __text orderFile -e start
```

要将订单文件与 Xcode 项目一起使用，请修改项目的部署构建样式中的“其他链接器标志”选项。将文本`-sectorder __TEXT __text` *orderFile*添加到此设置以指定您的订单文件。

如果任何*inputFile*是库而不是目标文件，则您可能需要在链接之前编辑顺序文件，以将所有对目标文件的引用替换为对相应库文件的引用。同样，链接器会尽力将订单文件中的名称与其正在编辑的源进行匹配。

使用这些选项，链接器构造可执行文件*outputFile*，以便从输入文件节`__TEXT`的`__text`块构造段节的内容`__text`。链接器按照*orderFile*中列出的顺序排列输入文件中的例程。

当链接器处理顺序文件时，它将对象文件和符号名称对未在顺序文件中列出的过程放入*outputFile*`__text`部分。它以默认顺序链接这些符号。多次列出的对象文件和符号名称对总是会生成警告，并且使用第一次出现的对。

默认情况下，链接器打印链接对象中不在订单文件中的符号名称数量、订单文件中不在链接对象中的符号名称数量以及它的符号名称数量的摘要。试图匹配那些不明确的内容。要请求这些符号的详细列表，请使用 选项`-sectorder_detail`。

链接器的`-e start`选项保留可执行文件的入口点。该符号`start`（注意缺少前导“ `_`”）是在 C 运行时共享库中定义的`/usr/bin/crt1.o`；它代表正常链接时程序中的第一个文本地址。当您重新排序过程时，必须使用此选项来修复入口点。另一种方法是创建订单文件的第一行`/usr/lib/crt1.o:start`或第一行。`/usr/lib/crt1.o:section_all`



### gprof 订单文件的限制

`.order`生成的文件仅`gprof`包含运行可执行文件时调用或采样的那些函数。为了使库函数正确显示在订单文件中，`whatsloaded`链接器生成的文件应该存在于工作目录中。

该`-S`选项不适用于已与订单文件链接的可执行文件。

文件的生成`gmon.order`可能需要很长时间 - 可以使用`-x`参数来抑制。

以下项目的文件名将丢失：

- `-g`不带参数编译的文件
- 从汇编语言源生成的例程
- 已删除调试符号的可执行文件（与`strip`工具一样）



## 使用监视器功能进行分析

该文件`/usr/include/monitor.h`声明了一组函数，您可以使用它们以编程方式分析代码的特定部分。您可以使用这些函数仅收集代码的某些部分或所有代码的统计信息。然后，您可以使用该`gprof`工具从结果文件中构建调用图和其他性能分析数据。[清单 1](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-138857-BCIGGIII)显示了如何使用监视器功能。



**清单 1** 使用监控函数

```
#include <monitor.h>
 
    /* To start profiling: */
    moninit();
    moncontrol(1);
 
    /* To stop, and dump to a file */
    moncontrol(0);
    monoutput("/tmp/myprofiledata.out");
    monreset();

```



## 在编译时组织代码

GCC 编译器允许您指定声明的任何函数或变量的属性。该`section`属性可让您告诉 GCC 您希望将特定代码片段放置在哪个段和部分。



**警告：** 不要使用`section` 属性，除非您了解 Mach-O 可执行文件的结构，否则 不要使用属性并了解将函数和数据放置在相应段中的规则。将函数或全局变量放在不适当的部分可能会破坏您的程序。



该`section`属性采用多个参数来控制结果代码的放置位置。您至少必须为要放置的代码指定段和节名称。其他选项也可用，并在 GCC 文档中进行了描述。

以下清单显示了如何使用`section`函数的属性。在此示例中，该`section`属性被添加到函数的前向声明中。该属性告诉编译器将函数放置在`__text`可执行文件的特定部分中。

```
void MyFunction (int a) __attribute__((section("__TEXT,__text.10")));
```

以下清单显示了如何使用`section`属性组织全局变量的一些示例。

```
extern const int x __attribute__((section("__TEXT,__my_const")));
const int x=2;
 
extern char foo_string[] __attribute__((section("__DATA,__my_data")));
char foo_string[] = "My text string\n";
```

有关指定`section`属性的详细信息，请参阅 中的 GCC 编译器文档`/Developer/Documentation/DeveloperTools/gcc3`。



## 重新排序 __text 部分



如[Mach-O 可执行格式概述](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/MachOOverview.html#//apple_ref/doc/uid/20001860-BAJGJEJC)中所述，该`__TEXT`段保存程序的实际代码和只读部分。按照惯例，编译器工具将您的程序放置在Mach-O 目标文件（扩展名为`.o`）位于段`__text`的部分中`__TEXT`。

当程序运行时，该`__text`部分中的页面会根据需要加载到内存中，因为这些页面上的例程会被使用。代码按照其在给定源文件中出现的顺序链接到该`__text`节，并且源文件按照它们在链接器命令行上列出的顺序（或按照在Xcode）。因此，第一个目标文件中的代码从头到尾链接，然后是第二个文件和第三个文件中的代码，依此类推。

按照源文件声明顺序加载代码很少是最佳的。例如，假设代码中的某些方法或函数被重复调用，而其他方法或函数很少使用。对过程重新排序以将常用代码放置在该`__text`部分的开头可以最大限度地减少应用程序使用的平均页面数，从而减少分页活动。

再举一个例子，假设代码定义的所有对象都同时初始化。由于每个类的初始化例程是在单独的源文件中定义的，因此初始化代码通常分布在整个`__text`部分中。通过连续地重新排序所有类的初始化代码，可以减少需要读入的页数，从而提高初始化性能。应用程序只需要少量包含初始化代码的页面，而不是大量页面，每个页面都包含一小段初始化代码。



### 重新订购程序



根据应用程序的大小和复杂性，您应该采取一种最能提高可执行文件性能的代码排序策略。与大多数性能调整一样，您花在测量和重新调整过程顺序上的时间越多，节省的内存就越多。通过运行应用程序并按调用频率对例程进行排序，您可以轻松获得良好的首次排序。下面列出了该策略的步骤，并在接下来的部分中进行了更详细的解释：

1. 构建应用程序的配置文件版本。此步骤生成包含分析和重新排序过程中使用的符号的可执行文件。

2. 运行并使用该应用程序来创建一组配置文件数据。执行一系列功能测试，或者让某人在测试期间使用该程序。

   

   **重要提示：** 为了获得最佳结果，请关注最典型的使用模式。避免使用应用程序的所有功能，否则配置文件数据可能会被稀释。例如，关注启动时间以及激活和停用主窗口的时间。不要打开辅助窗口。

   

3. 创建订单文件。订单文件以优化顺序列出程序。链接器使用顺序文件对可执行文件中的过程进行重新排序。

4. 使用订单文件运行链接器。这将创建一个可执行文件，其中的过程链接到`__text`订单文件中指定的部分。

有关分析代码以及生成和链接订单文件的信息，请参阅[使用 gprof 分析代码](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-106785)。



### 大型程序的过程重新排序

对于许多程序来说，由刚才描述的步骤生成的排序比无序过程带来了实质性的改进。对于具有很少功能的简单应用程序，这种排序代表了过程重新排序所获得的大部分收益。然而，更大的应用程序和其他大型程序可以从额外的分析中受益匪浅。虽然基于调用频率或调用图来排序文件是一个好的开始，但您可以利用您对应用程序结构的了解来进一步减少虚拟内存工作集。



#### 创建默认订单文件



如果您想使用上述以外的技术重新排序应用程序的过程，您可能需要跳过分析步骤并直接从默认顺序文件列出了应用程序的所有例程。一旦您获得了合适形式的例程列表，您就可以手动或使用您选择的排序技术重新排列条目。然后，您可以将生成的订单文件与链接器选项一起使用，如[链接订单文件](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-109955)`-sectorder`中所述。

要创建默认订单文件，请首先使用以下选项运行链接器`-whatsloaded`：

`cc -o` *输出文件 输入文件.o* `-whatsloaded >` *加载文件*

这将创建一个文件*loadFile*，其中列出了可执行文件中加载的对象文件，包括框架或其他库中的任何对象文件。该`-whatsloaded`选项还可用于确保生成的订单文件包含`gprof -S`静态库中过程的名称。

使用文件*loadedFile*，您可以`nm`使用`-onjls`选项和`__TEXT __text`参数运行：

`nm -onjls __TEXT __text `cat` *加载*`` >` *文件 orderFile*

文件*orderFile*的内容是文本部分的符号表。过程按其默认链接顺序列在符号表中。您可以重新排列此文件中的条目以更改您希望链接过程的顺序，然后按照使用[顺序文件链接](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-109955)中所述运行链接器。



#### 使用 pagestuff 检查磁盘上的页面



该`pagestuff`工具通过告诉您可执行文件的哪些页面可能在给定时间加载到内存中来帮助您衡量过程排序的有效性。本节简要介绍如何使用该工具。请参阅`pagestuff`手册页以获取更多信息。

该`pagestuff`工具打印出可执行代码的特定页面上的符号。以下是该命令的语法：

`pagestuff` *文件名*[*页码*| `-a`]

的输出是页*pageNumber上的**filename*`pagestuff`中包含的过程列表。要查看文件的所有页面，请使用该选项代替页码。此输出允许您确定与内存中的文件关联的每个页面是否都已优化。如果不是，您可以重新排列订单文件中的条目并再次链接可执行文件以最大限度地提高性能。例如，将两个相关的过程移到一起，以便它们在同一页面上链接。完善排序可能需要多个链接和调整周期。`-a`



#### 根据用途对例程进行分组



为什么要为应用程序的各个操作生成配置文件数据？该策略基于这样的假设：大型应用程序具有三组常规例程：

- *热例程*在应用程序最常见的使用期间运行。这些通常是为应用程序的功能提供基础的原始例程（例如，用于访问文档的数据结构的例程）或实现应用程序的核心功能的例程，例如在字处理器中实现打字的例程。这些例程应该聚集在同一组页面中。

- *温例程*实现应用程序的特定功能。热例程通常与用户偶尔执行的特定功能相关（例如启动、打印或导入图形）。由于这些例程的使用相当频繁，因此请将它们聚集在同一小组页面中，以便它们可以快速加载。但是，由于用户有很长一段时间不访问此功能，因此这些例程不应位于热门类别中。

- 

  应用中很少使用*冷例程。*冷例程实现模糊的功能或覆盖边界或错误情况。将这些例程组合在一起，以避免在热页或暖页上浪费空间。

在任何给定时间，您应该预期大多数热页都会驻留，并且您应该预期暖页会针对用户当前使用的功能驻留。只有极少数情况下才会驻留冷页面。

为了实现这种理想的排序，需要收集许多配置文件数据集。首先，收集热点例程。如上所述，编译应用程序以进行分析，启动它并使用该程序。使用，生成从配置文件数据`gprof -S`调用的频率排序顺序文件。`hot.order`

创建热订单文件后，为用户偶尔使用的功能创建订单文件，例如仅在应用程序启动时运行的例程。打印、打开文档、导入图像以及使用各种非文档窗口和工具是用户偶尔但不经常使用的功能的其他示例，并且是拥有自己的订单文件的良好候选者。`feature.order`建议在分析的功能之后命名这些订单文件（例如）。

最后，要生成所有例程的列表，请构建“默认”订单文件`default.order`（如[重新排序过程](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-102991)中所述）。

获得这些订单文件后，您可以使用[清单 2](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-110927-BCIGIGCD)中所示的代码将它们组合起来。您可以使用此清单构建一个命令行实用程序，该实用程序删除订单文件中的重复行，同时保留原始数据的顺序。



**清单 2**  Unique.c 的代码

```
//
//  unique
//
//  A command for combining files while removing
//  duplicate lines of text. The order of other lines of text
//  in the input files is preserved.
//
//  Build using this command line:
//
//  cc -ObjC -O -o unique -framework Foundation Unique.c
//
//  Note that “unique” differs from the BSD command “uniq” in that
//  “uniq” combines duplicate adjacent lines, while “unique” does not
//  require duplicate lines to be adjacent. “unique” is also spelled
//  correctly.
//
 
#import <stdio.h>
#import <string.h>
#import <Foundation/NSSet.h>
#import <Foundation/NSData.h>
 
#define kBufferSize 8*1024
 
void ProcessFile(FILE *fp)
{
    char buf[ kBufferSize ];
 
    static id theSet = nil;
 
    if( theSet == nil )
    {
        theSet = [[NSMutableSet alloc] init];
    }
 
    while( fgets(buf, kBufferSize, fp) )
    {
        id dataForString;
 
        dataForString = [[NSData alloc] initWithBytes:buf length:strlen(buf)];
 
        if( ! [theSet containsObject:dataForString] )
        {
            [theSet addObject:dataForString];
            fputs(buf, stdout);
        }
 
        [dataForString release];
    }
}
 
int main( int argc, char *argv[] )
{
    int     i;
    FILE *  theFile;
    int     status = 0;
 
    if( argc > 1 )
    {
        for( i = 1; i < argc; i++ )
        {
            if( theFile = fopen( argv[i], "r" ) )
            {
                ProcessFile( theFile );
                fclose( theFile );
            }
            else
            {
                fprintf( stderr, "Could not open ‘%s’\n", argv[i] );
                status = 1;
                break;
            }
        }
    }
    else
    {
        ProcessFile( stdin );
    }
 
    return status;
}
```

构建完成后，您将使用该程序生成最终订单文件，其语法类似于以下内容：

```
unique hot.order feature1.order ... featureN.order default.order > final.order
```

当然，排序的真正考验是分页 I/O 减少的量。运行您的应用程序，使用不同的功能，并检查您的排序文件在不同条件下的执行情况。您可以使用该`top`工具（以及其他工具）来测量分页性能。



#### 找到最后一个热门习惯

重新排序后，您通常会在文本排序的末尾看到一个包含冷例程的页面区域，您希望这些例程很少使用。然而，一两个热门例程可能会从裂缝中溜走，落在这个冷区。这是一个代价高昂的错误，因为现在使用这些热例程之一需要驻留整个页面，否则该页面将充满不太可能使用的冷例程。

检查可执行文件的冷页是否没有意外调入。查找在应用程序文本段的冷区中具有高页面偏移量的页面。如果存在不需要的页面，您需要找出正在调用该页面上的哪个例程。实现此目的的一种方法是在接触该页面的特定操作期间进行分析，并使用该`grep`工具在分析器输出中搜索驻留在该页面上的例程。或者，识别页面被触摸位置的快速方法是在调试器下运行应用程序`gdb`并使用 Mach 调用`vm_protect`来禁止对该页面的所有访问：

```
(gdb) p vm_protect(task_self(), startpage_addr, vm_page_size, FALSE, 0);
```

清除页面保护后，对该页面的任何访问都会导致内存错误，从而破坏调试器中的程序。此时，您可以简单地查看函数调用堆栈（使用命令`bt`）来了解调用例程的原因。



## 重新排序其他部分



您可以使用`-sectorder`链接器的选项来组织可执行文件的大多数部分中的块。有时可能受益于重新排序的节是文字节，例如`__TEXT`段的`__cstring`节和`__DATA`段的`__data`节。



### 重新排序文字部分

`ld`使用和工具可以最轻松地生成订单文件中文字部分的行`otool`。对于文字部分，`otool`为每种类型的文字部分创建特定类型的订单文件：

- 对于 C 字符串文字部分，顺序文件格式是每行一个文字 C 字符串（C 字符串中允许使用 ANSI C 转义序列）。例如，一行可能看起来像

  `Hello world\n`

- 对于 4 字节文字部分，订单文件格式是一个 32 位十六进制数字，每行以 0x 开头，该行的其余部分被视为注释。例如，一行可能看起来像

  `0x3f8ccccd (1.10000002384185790000e+00)`

- 对于 8 字节文字部分，订单文件行每行由两个 32 位十六进制数字组成，每个数字以空格分隔，每个数字以 0x 开头，该行的其余部分被视为注释。例如，一行可能如下所示：

  `0x3ff00000 0x00000000 (1.00000000000000000000e+00)`

- 对于文字指针部分，订单文件中的行格式表示指针，每行一个。文字指针由段名称、文字指针的节名称以及文字本身表示。它们由冒号分隔，没有多余的空格。例如，一行可能如下所示：

  `__OBJC:__selector_strs:new`

- 对于所有文字部分，订单文件中的每一行都简单地输入文字部分，并按照订单文件的顺序出现在输出文件中。不会检查文字是否在加载的对象中。



To reorder a literal section, first create a “whatsloaded” file using the `ld` `-whatsloaded` option as described in section [Creating a Default Order File](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-103584). Then, run `otool` with the appropriate options, segment and section names, and filenames. The output of `otool` is a default order file for the specified section. For example, the following command line produces an order file listing the default load order for the `__TEXT` segment’s `__cstring` section in the file `cstring_order`:

要对文字部分重新排序，请首先使用创建[默认顺序文件](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-103584)`` `ld -whatsloaded`部分中所述的选项创建一个“whatsloaded”文件。然后，使用适当的选项、段和节名称以及文件名运行。的输出是指定部分的默认订单文件。例如，以下命令行生成一个顺序文件，列出文件中段部分的默认加载顺序：`otool``otool``__TEXT``__cstring``cstring_order`

```
otool -X -v -s __TEXT __cstring `cat Whatsloaded` > cstring_order
```

一旦创建文件后`cstring_order`，您可以编辑该文件并重新排列其条目以优化引用的位置。例如，您可以将程序最常用的文字字符串（例如用户界面中出现的标签）放置在文件的开头。要在可执行文件中生成所需的加载顺序，请使用以下命令：

```
cc -o hello hello.o -sectorder __TEXT __cstring cstring_order
```



### 重新排序数据部分

目前没有工具可以测量代码对数据符号的引用。但是，您可能知道程序的数据引用模式，并且可以通过将很少使用的功能的数据与其他数据分开来节省一些费用。一种接近方法 `__data`部分重新排序是按大小对数据进行排序，以便小数据项最终出现在尽可能少的页面上。例如，如果较大的数据项放置在两个页面上，并且两个小项目共享这些页面中的每一个，则必须对较大的项目进行分页才能访问较小的项目。按大小对数据重新排序可以最大限度地减少这种低效率。由于这些数据通常需要写入虚拟内存后备存储，因此这在某些程序中可能会节省大量成本。



To reorder the `__data` section, first create an order file listing source files and symbols in the order in which you want them linked (order file entries are described at the beginning of [Generating Order Files](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-117091)). Then, link the program using the `-sectorder` command-line option:

要重新排序该`__data`部分，首先创建一个顺序文件，按照您希望链接的顺序列出源文件和符号（顺序文件条目在生成顺序文件的开头进行了描述[）](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-117091)。`-sectorder`然后，使用命令行选项链接程序：

```
cc -o` *outputFile* *inputFile.o* `… -sectorder __DATA __data` *orderFile* `-e start
```

To use an order file with a Xcode project, modify the “Other Linker Flags” option in the Deployment build style of your project. Add the text `-sectorder __DATA __data` *orderFile* to this setting to specify your order file.

要将订单文件与 Xcode 项目一起使用，请修改项目的部署构建样式中的“其他链接器标志”选项。将文本`-sectorder __DATA __data` *orderFile*添加到此设置以指定您的订单文件。



## 重新排序汇编语言代码

重新排序用汇编语言编码的例程时要记住的一些附加准则：

- 

  汇编代码中的临时标签

  在手动编码的汇编代码中，请小心分支到临时标签的分支，这些分支跨越非临时标签。例如，如果您使用以“L”开头的标签或*d*标签（其中*d*是数字），如此例所示

  ```
  foo: b 1f
      ...
  bar: ...
  1:   ...
  ```

  生成的程序将无法正确链接或执行，因为只有符号`foo`并将`bar`其放入目标文件的符号表中。对临时标签的引用`1`被编译为偏移量；因此，不会为该指令生成重定位条目`b 1f`。如果链接器没有将与符号关联的块`bar`直接放置在与 关联的块之后`foo`，则分支 to`1f`将不会到达正确的位置。因为没有重定位条目，所以链接器不知道要修复分支。解决此问题的源代码更改是将标签更改`1`为非临时标签（`bar1`例如）。您可以通过将包含手工编码的汇编代码的目标文件整个链接来避免出现问题，而无需重新排序。

  

- 伪符号`.section_start`

  如果任何输入文件中的指定节具有非零大小，并且不存在具有该节开头值的符号，则链接器使用伪象征`.section_start`作为与该部分中的第一个块关联的符号名称。该符号的目的是处理其符号不会保留到目标文件中的文字常量。因为文字字符串和浮点常量位于文字部分，所以这对于 Apple 编译器来说不是问题。您可能会看到汇编语言程序或非 Apple 编译器使用此符号。但是，您不应重新排序此类代码，而应链接整个文件，而不重新排序（请参阅[与订单文件链接](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/ImprovingLocality.html#//apple_ref/doc/uid/20001862-109955)）。



# 减少共享内存页

如[Mach-O 可执行格式概述](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/MachOOverview.html#//apple_ref/doc/uid/20001860-BAJGJEJC)中所述，Mach-O 二进制文件段中的数据`__DATA`是可写的，因此可共享（通过写入时复制）。可写数据会增加可能需要写入磁盘的页数，从而降低内存不足情况下的分页性能。对于框架来说，可写数据最初是共享的，但有可能被复制到每个进程的内存空间。

减少可执行文件中的动态或非常量数据量会对性能产生重大影响，尤其是对于框架而言。以下各节将向您展示如何减少可执行文件段的大小，从而减少共享内存页的数量`__DATA`。



## 将数据声明为 const



缩小段的最简单方法`__DATA`是将更多全局范围的数据标记为常量。大多数时候，将数据标记为常量很容易。例如，如果您永远不会修改数组中的元素，则应`const`在数组声明中包含关键字，如下所示：

```
const int fibonacci_table[8] = {1, 1, 2, 3, 5, 8, 13, 21};
```

请记住将指针标记为常量（在适当的时候）。在以下示例中，字符串`"a"`和`"b"`是常量，但数组指针`foo`不是：

```
static const char *foo[] = {"a", "b"};
foo[1] = "c";       // OK: foo[1] is not constant.
```

要将整个声明标记为常量，需要在`const`指针上添加关键字，使指针成为常量。在以下示例中，数组及其内容都是常量：

```
static const char *const foo[] = {"a", "b"};
foo[1] = "c";       // NOT OK: foo[1] is constant.
```

有时您可能想重写代码以分离出常量数据。下面的示例包含一个结构体数组，其中仅声明了一个字段`const`。由于未声明整个数组`const`，因此它存储在`__DATA`段中。

```
struct {
    const char *imageName;
    NSImage *image;
} images[100] = {
    {"FooImage", nil},
    {"FooImage2", nil}
    // and so on
};
```

要在段中存储尽可能多的数据`__TEXT`，请创建两个并行数组，一个标记为常量，另一个不标记为常量：

```
const char *const imageNames[100] = { "FooImage", /* . . . */ };
NSImage *imageInstances[100] = { nil, /* . . . */ };
```

如果未初始化的数据项包含指针，则编译器无法将该项存储在段中`__TEXT`。字符串最终位于`__TEXT`段的`__cstring`部分，但数据项的其余部分（包括指向字符串的指针）最终位于段`__DATA`的`const`部分。在下面的示例中，即使它是恒定的，最终也会在和段`daytimeTable`之间分割：`__TEXT``__DATA`

```
struct daytime {
    const int value;
    const char *const name;
};
 
const struct daytime daytimeTable[] = {
    {1, "dawn"},
    {2, "day"},
    {3, "dusk"},
    {4, "night"}
};
```

`要将整个数组放入`__TEXT`段中，必须重写此结构，以便它使用固定大小的字符数组而不是字符串指针，如以下示例所示：

```
struct daytime {
    const int value;
    const char name[6];
};
 
const struct daytime daytimeTable[] = {
    {1, {'d', 'a', 'w', 'n', '\0'}},
    {2, {'d', 'a', 'y', '\0'}},
    {3, {'d', 'u', 's', 'k', '\0'}},
    {4, {'n', 'i', 'g', 'h', 't', '\0'}}
};

```

不幸的是，如果字符串的大小变化很大，则没有好的解决方案，因为此解决方案会留下大量未使用的空间。

该数组被分成两个段，因为编译器始终将常量字符串存储在`__TEXT`段的`__cstring`部分中。如果编译器将数组的其余部分存储在`__DATA`段的`__data`部分中，则字符串和指向字符串的指针可能最终会出现在不同的页面上。如果发生这种情况，系统必须用新地址更新指向字符串的指针，如果指针位于段中，则系统无法执行此操作，因为`__TEXT`该`__TEXT`段被标记为只读。因此，指向字符串的指针以及数组的其余部分必须存储在段`const`的部分中`__DATA`。该`__const`部分保留用于声明`const`无法放入`__TEXT`段中的数据。



## 初始化静态数据



[正如《Mach-O 可执行格式概述》](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/MachOOverview.html#//apple_ref/doc/uid/20001860-BAJGJEJC)中所指出的，编译器将未初始化的静态数据存储在段`__bss`的部分中`__DATA`，并将初始化的数据存储在`__data`段中。如果该部分中只有少量静态数据`__bss`，您可能需要考虑将其移至该`__data`部分。将数据存储在两个不同的部分会增加可执行文件使用的内存页数，从而增加分页的可能性。

`__bss`合并和部分的目的`__data`是减少应用程序使用的内存页数。如果将数据移入该`__data`部分会增加该部分中的内存页数，则此技术没有任何好处。事实上，添加到该`__data`部分中的页面会增加在启动时读取和初始化该数据所花费的时间。

假设您声明以下静态变量：

```
static int x;
static short conv_table[128];
```

要将这些变量移动到`__data`可执行文件`__DATA`段的部分，您可以将定义更改为以下内容：

```
static int x = 0;
static short conv_table[128] = {0};

```



## 避免暂定定义符号

编译器将任何复制它在中遇到的符号`__common` 该`__DATA`段的部分（请参阅[Mach-O 可执行格式概述](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/MachOOverview.html#//apple_ref/doc/uid/20001860-BAJGJEJC)）。这里的问题与未初始化的静态变量相同。如果可执行文件的非常量全局数据分布在多个部分中，则该数据更有可能位于不同的内存页上；因此，页面可能必须单独换入和换出。目标为`__common`部分与`__bss` 部分：如果其中有少量数据，则将其从可执行文件中删除。

一个共同的来源暂定定义符号是头文件中该符号的定义。通常，标头声明一个符号，但不包含该符号的定义；相反，定义是在实现文件中提供的。但是出现在头文件中的定义可能会导致该代码或数据出现在每个包含头文件的实现文件。解决这个问题的方法是确保头文件只包含声明，而不包含定义。

对于函数，您显然需要在头文件中声明该函数的原型，并将该函数的定义放入实现文件中。对于全局变量和数据结构，您应该做类似的事情。不要在头文件中定义变量，而是在实现文件中定义它并适当地初始化它。然后，在头文件中声明该变量，并在声明之前添加关键字`extern`。这一技术将变量定义本地化到一个文件，同时仍然允许从其他文件访问该变量。

当您不小心导入同一个头文件两次时，您也可能会得到临时定义符号。为了确保您不这样做，请包含预处理器指令以禁止包含已包含的文件。因此，在您的头文件中，您将具有以下代码：

```
#ifndef MYHEADER_H
#define MYHEADER_H
// Your header file declarations. . .
#endif
```

然后，当您想要包含该头文件时，请按以下方式包含它：

```
#ifndef MYHEADER_H
#include "MyHeader.h"
#endif

```



## 分析 Mach-O 可执行文件

您可以使用多种工具来查找非常量数据占用了多少内存。这些工具报告数据使用的各个方面。

当您的应用程序或框架运行时，使用`size`和`pagestuff`工具查看各个数据部分有多大以及它们包含哪些符号。需要寻找的一些内容包括：

- 要查找包含大量非常量数据的可执行文件，请检查段`__data`中包含较大部分的文件`__DATA`。
- 检查`__bss`和`__common`部分中是否有可以删除或移动到该`__data`部分的变量和符号。
- 要查找虽然声明为常量但编译器不能将其视为常量的数据，请检查`__const`段中是否有某个节的可执行文件或目标文件`__DATA`。

该段中一些较大的内存消耗者`__DATA`是固定大小的全局数组已初始化但未声明`const`。有时，您可以通过在源代码中搜索“ `[] = {`”来找到这些表。

您还可以让编译器帮助您找到可以使数组保持不变的位置。`const`将您怀疑可能是只读的所有已初始化数组放在前面并重新编译。如果数组不是真正只读的，则它将无法编译。删除有问题的`const`并重试。



# 最小化导出的符号

如果您的应用程序或框架具有公共接口，则应将导出的符号限制为接口所需的符号。导出的符号会占用可执行文件中的空间，应尽可能减少。这不仅可以减少可执行文件的大小，还可以减少动态链接器完成的工作量。

默认情况下，Xcode 会导出项目中的所有符号。您可以使用以下信息来识别并消除那些您不想导出的符号。



## 识别导出的符号



要查看应用程序导出的符号，请使用该`nm`工具。该工具读取可执行文件的符号表并显示您请求的符号信息。您可以查看所有符号或仅查看可执行代码特定段中的符号。例如，要仅显示外部可用的全局符号，您可以`-g`在命令行上指定该选项。

要查看详细的符号信息，请`nm`使用该`-m`选项运行。此选项的输出告诉您符号的类型以及它是外部的还是本地的（非外部）。例如，要查看 TextEdit 应用程序的详细符号信息，您可以使用`nm`以下命令：

```
%cd /Applications/TextEdit.app/Contents/MacOS
% nm -m TextEdit

```

结果输出的一部分可能如下所示：

```
9005cea4 (prebound undefined [lazy bound]) external _abort (from libSystem)
9000a5c0 (prebound undefined [lazy bound]) external _atexit (from libSystem)
90009380 (prebound undefined [lazy bound]) external _calloc (from libSystem)
00018d14 (__DATA,__common) [referenced dynamically] external _catch_exception_raise
00018d18 (__DATA,__common) [referenced dynamically] external _catch_exception_raise_state
00018d1c (__DATA,__common) [referenced dynamically] external _catch_exception_raise_state_identity
```

在此模式下，`nm`根据符号显示各种信息。对于驻留在段中的函数和其他代码`__TEXT`，`nm`显示预绑定信息和原始库。对于`__DATA`段中的信息，`nm`显示符号的特定部分及其链接。对于所有符号，`nm`显示符号是外部符号还是本地符号。



## 限制导出的符号



如果您知道要从项目中导出的符号，则应该创建一个导出文件并将该文件添加到项目的链接器设置中。导出文件是一个纯文本文件，其中包含您希望提供给外部调用者的符号名称。每个符号必须单独列出。前导和尾随空格不被视为符号名称的一部分。以符号开头的行将`#`被忽略。

要将导出文件包含在 Xcode 项目中，请修改项目的目标或构建样式设置。将“导出符号文件”设置的值设置为导出文件的名称。Xcode 将适当的选项传递给静态链接器。

要从命令行导出符号列表，请将该`-exported_symbols_list`选项添加到链接器命令中。您还可以导出所有符号，然后限制特定列表，而不是导出特定的符号列表。要限制特定的符号列表，请使用`-unexported_symbols_list`链接器命令中的选项。

请注意，运行时库导出的符号必须明确包含在导出文件中，应用程序才能正确启动。要收集这些符号的列表，请在没有导出文件的情况下链接代码，然后`nm -m`从终端执行命令。从结果输出中，收集所有已标记`external`且不属于代码的符号，并将它们添加到导出文件中。



## 使用 GCC 4.0 限制出口

GCC 4.0 支持单个符号的自定义可见性属性。此外，编译器还提供编译时标志，使您可以设置已编译文件的所有符号的默认可见性。

有关使用 GCC 4.0 的新符号可见性功能的信息，请参阅《*[C++ 运行时环境编程指南》中的“](https://developer.apple.com/library/archive/documentation/DeveloperTools/Conceptual/CppRuntimeEnv/CPPRuntimeEnv.html#//apple_ref/doc/uid/TP40001666)*[控制符号可见性](https://developer.apple.com/library/archive/documentation/DeveloperTools/Conceptual/CppRuntimeEnv/Articles/SymbolVisibility.html#//apple_ref/doc/uid/TP40001670)” 。

[下一个](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/RevisionHistory.html)[以前的](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/CodeFootprint/Articles/SharedPages.html)

# 文档修订历史

*此表描述了代码大小性能指南*的更改。

| **日期**   | **笔记**                                                     |
| ---------- | ------------------------------------------------------------ |
| 2014-03-10 | 移至退休文献库。                                             |
| 2006-06-28 | 添加了有关使用 GCC 4.0 减少导出符号数量的信息。              |
| 2005-04-29 | 澄清了内联函数的指南。更新了编译器选项以覆盖死代码剥离。     |
|            | 文档名称已更改。旧标题是*优化您的代码占用空间*。             |
| 2003-12-11 | 修复了一些小错误，以阐明`-dynamic`编译器选项的使用。         |
| 2003-07-25 | 修复了一些小错误以反映 Xcode 环境。                          |
| 2003-05-15 | 本编程主题的第一次修订。部分信息出现在文档*Inside OS X: Performance*中。 |