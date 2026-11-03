export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | {
      type: "code";
      lang: "java" | "shell";
      code: string;
      output?: string;
      title?: string;
    }
  | { type: "note"; tone: "tip" | "note" | "warning"; text: string };

export type QuizQuestion = {
  prompt: string;
  /** Optional Java snippet shown under the question */
  code?: string;
  options: [string, string, string, string];
  /** Index (0 to 3) of the correct option */
  answer: 0 | 1 | 2 | 3;
  explanation: string;
};

/** Exactly five questions per topic. TypeScript enforces this. */
export type Assessment = [
  QuizQuestion,
  QuizQuestion,
  QuizQuestion,
  QuizQuestion,
  QuizQuestion,
];

export type OopLesson = {
  number: number;
  slug: string;
  title: string;
  module: string;
  summary: string;
  /** Reading time plus the assessment */
  minutes: number;
  content: Block[];
  takeaways: string[];
  quiz: Assessment;
};

/* -------------------------------------------------------------------------- */
/*  Tiny helpers to keep the data readable                                     */
/* -------------------------------------------------------------------------- */

const p = (text: string): Block => ({ type: "p", text });
const h = (text: string): Block => ({ type: "h", text });
const list = (...items: string[]): Block => ({ type: "list", items });
const java = (code: string, output?: string, title?: string): Block => ({
  type: "code",
  lang: "java",
  code,
  output,
  title,
});
const shell = (code: string, title?: string): Block => ({
  type: "code",
  lang: "shell",
  code,
  title,
});
const note = (
  text: string,
  tone: "tip" | "note" | "warning" = "note",
): Block => ({
  type: "note",
  tone,
  text,
});
const q = (
  prompt: string,
  options: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  explanation: string,
  code?: string,
): QuizQuestion => ({ prompt, options, answer, explanation, code });

/* -------------------------------------------------------------------------- */
/*  The course                                                                 */
/* -------------------------------------------------------------------------- */

export const OOP_COURSE: OopLesson[] = [
  /* ====================================================================== */
  /*  MODULE 1: JAVA BASICS                                                  */
  /* ====================================================================== */
  {
    number: 1,
    slug: "introduction-to-java",
    title: "Introduction to Java",
    module: "Java Basics",
    summary: "What Java is, how it runs, and your first program.",
    minutes: 15,
    content: [
      p(
        "Java is a popular, object-oriented programming language. It powers web back ends, Android apps, enterprise software, and games. It was first released in 1995 by Sun Microsystems and is now maintained by Oracle and the open-source OpenJDK community.",
      ),
      h("Why learn Java?"),
      list(
        "Object-oriented from the ground up, which is the focus of this course.",
        "Platform independent: write the code once, run it on Windows, macOS, or Linux.",
        "A huge ecosystem of libraries, tools, and learning resources.",
        "Widely used in schools and companies, so the skills transfer.",
      ),
      h("JDK, JRE and JVM"),
      list(
        "`JDK` (Java Development Kit): the tools you need to write, compile, and run Java. It includes the compiler `javac`.",
        "`JRE` (Java Runtime Environment): what a computer needs to run Java programs.",
        "`JVM` (Java Virtual Machine): the engine that runs compiled Java bytecode on your machine.",
      ),
      h("How a Java program runs"),
      p(
        "You write source code in a `.java` file. The compiler `javac` turns it into bytecode, saved in a `.class` file. The JVM then runs that bytecode. Because every operating system has its own JVM, the same bytecode runs everywhere.",
      ),
      java(
        `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, Java!");
  }
}`,
        "Hello, Java!",
        "Your first Java program",
      ),
      shell(
        `javac Main.java
java Main`,
        "Compile and run",
      ),
      note(
        "Since Java 11 you can also run a single file directly with `java Main.java`, which compiles and runs it in one step.",
        "tip",
      ),
    ],
    takeaways: [
      "Java is object-oriented and platform independent.",
      "`javac` compiles `.java` files into `.class` bytecode, and the JVM runs that bytecode.",
      "Every Java program starts running from a `main` method.",
    ],
    quiz: [
      q(
        "What does the JVM do?",
        [
          "Compiles source code into bytecode",
          "Runs compiled Java bytecode",
          "Downloads Java libraries",
          "Formats your source code",
        ],
        1,
        "The JVM (Java Virtual Machine) runs the bytecode that the compiler produced.",
      ),
      q(
        "Which command compiles `Main.java` into bytecode?",
        [
          "`java Main`",
          "`run Main.java`",
          "`javac Main.java`",
          "`compile Main`",
        ],
        2,
        "`javac` is the Java compiler. `java` runs the result.",
      ),
      q(
        "What is the file extension of compiled Java bytecode?",
        [".java", ".exe", ".txt", ".class"],
        3,
        "The compiler writes bytecode into `.class` files.",
      ),
      q(
        "Why is Java called platform independent?",
        [
          "The same bytecode runs on any operating system that has a JVM",
          "Java programs never need a computer",
          "The compiler makes a different program for each operating system",
          "Java code looks the same on every keyboard",
        ],
        0,
        "Bytecode is not tied to one operating system. Each system's JVM knows how to run it.",
      ),
      q(
        "Which kit do you install to write and compile Java programs?",
        ["JRE", "JVM", "JDK", "JSP"],
        2,
        "The JDK includes the compiler and the other development tools. The JRE only runs programs.",
      ),
    ],
  },

  {
    number: 2,
    slug: "java-syntax",
    title: "Java Syntax",
    module: "Java Basics",
    summary:
      "The building blocks of a Java program: classes, main, statements, and comments.",
    minutes: 20,
    content: [
      p(
        "Every Java program lives inside a class. Let's read the Hello World program line by line.",
      ),
      java(
        `public class Main {                        // 1. the class
  public static void main(String[] args) {  // 2. the entry point
    System.out.println("Hello");            // 3. a statement
  }
}`,
        undefined,
        "Anatomy of a program",
      ),
      list(
        "The file must be named `Main.java` because the public class is called `Main`.",
        "`main` is where the JVM starts running your program.",
        "`System.out.println()` prints a line of text to the screen.",
        "Every statement ends with a semicolon `;`.",
        "Curly braces `{ }` mark the start and end of a block of code.",
      ),
      note(
        "Java is case-sensitive. `main` and `Main` are different names, and `System` must start with a capital S.",
        "warning",
      ),
      h("print() and println()"),
      p(
        "`println()` prints the text and moves to a new line. `print()` stays on the same line.",
      ),
      java(
        `System.out.print("Hello ");
System.out.print("World");
System.out.println("!");
System.out.println("Done");`,
        `Hello World!
Done`,
      ),
      h("Comments"),
      p("Comments are notes for humans. Java ignores them."),
      java(
        `// A single-line comment

/* A multi-line comment
   can span several lines */`,
      ),
      h("Naming conventions"),
      list(
        "Classes use PascalCase: `BankAccount`.",
        "Variables and methods use camelCase: `totalPrice`, `calculateTax()`.",
        "Constants use UPPER_SNAKE_CASE: `MAX_SIZE`.",
      ),
    ],
    takeaways: [
      "Code lives in classes, and execution starts in `main`.",
      "Statements end with `;` and blocks are wrapped in `{ }`.",
      "Java is case-sensitive, so follow the naming conventions.",
    ],
    quiz: [
      q(
        "Which symbol ends a Java statement?",
        [".", ":", ";", ","],
        2,
        "A semicolon marks the end of a statement.",
      ),
      q(
        "Which is the correct signature of the program entry point?",
        [
          "`public void main(String args)`",
          "`public static void main(String[] args)`",
          "`static main(String[] args)`",
          "`public static int main()`",
        ],
        1,
        "The JVM looks for exactly `public static void main(String[] args)`.",
      ),
      q(
        "What happens when you compile this line?",
        [
          "It prints Hi",
          "It prints nothing",
          "Compile error, because Java is case-sensitive and System needs a capital S",
          "It prints Hi after a runtime error",
        ],
        2,
        "`system` is not the same as `System`, so the compiler cannot find it.",
        `system.out.println("Hi");`,
      ),
      q(
        "Which name follows the Java convention for a class?",
        ["`bank_account`", "`bankAccount`", "`BANKACCOUNT`", "`BankAccount`"],
        3,
        "Class names use PascalCase.",
      ),
      q(
        "Which line is a single-line comment?",
        [
          "`// remember to test`",
          "`# remember to test`",
          "`<!-- remember to test -->`",
          "`** remember to test`",
        ],
        0,
        "Java uses `//` for single-line comments.",
      ),
    ],
  },

  {
    number: 3,
    slug: "variables-and-data-types",
    title: "Variables and Data Types",
    module: "Java Basics",
    summary: "Store data with variables, primitive types, and Strings.",
    minutes: 25,
    content: [
      p(
        "A variable is a named container for a value. In Java you must say what type of data it holds. The pattern is `type name = value;`.",
      ),
      java(
        `int age = 20;
double price = 9.99;
char grade = 'A';
boolean isActive = true;
String name = "Alex";

System.out.println(name + " is " + age);`,
        "Alex is 20",
      ),
      h("Primitive data types"),
      list(
        "`byte` (8-bit) and `short` (16-bit): small whole numbers.",
        "`int` (32-bit): whole numbers. The usual choice.",
        "`long` (64-bit): very large whole numbers, written with an `L`, like `5000000000L`.",
        "`float` and `double`: decimal numbers. `double` is the default.",
        "`boolean`: either `true` or `false`.",
        "`char`: a single character in single quotes, like `'A'`.",
      ),
      note(
        "`String` is not a primitive. It is a class, which is why it starts with a capital S. Text goes in double quotes.",
        "note",
      ),
      h("Constants with final"),
      p(
        "Add `final` to a variable to stop it from being changed after it is set.",
      ),
      java(
        `final double PI = 3.14159;
// PI = 3;   // Error: cannot assign a value to a final variable`,
      ),
      h("Type casting"),
      p(
        "Widening (small to large) happens automatically. Narrowing (large to small) needs an explicit cast.",
      ),
      java(
        `double d = 9.78;
int i = (int) d;   // narrowing: becomes 9
int n = 5;
double x = n;      // widening: becomes 5.0

System.out.println(i + " " + x);`,
        "9 5.0",
      ),
      note(
        "Casting a decimal to an `int` cuts off the decimal part. It does not round.",
        "warning",
      ),
    ],
    takeaways: [
      "Declare a variable with `type name = value;`.",
      "Java has eight primitive types. `String` is a class, not a primitive.",
      "Use `final` for constants and a cast like `(int)` to narrow a value.",
    ],
    quiz: [
      q(
        "Which line declares an integer variable?",
        [
          "`integer count = 5;`",
          "`count int = 5;`",
          "`int count = 5;`",
          "`Int count = '5';`",
        ],
        2,
        "The type comes first, then the name, then the value.",
      ),
      q(
        "Which type stores only `true` or `false`?",
        ["`char`", "`boolean`", "`String`", "`byte`"],
        1,
        "`boolean` holds one of two values: `true` or `false`.",
      ),
      q(
        "What does `final` do to a variable?",
        [
          "Makes it private",
          "Lets you change it later",
          "Deletes it after use",
          "Prevents it from being reassigned",
        ],
        3,
        "A `final` variable can be set once and never changed.",
      ),
      q(
        "What is printed?",
        ["7", "8", "7.9", "Error"],
        0,
        "Casting to `int` cuts off the decimal part, so 7.9 becomes 7.",
        `int x = (int) 7.9;
System.out.println(x);`,
      ),
      q(
        "Which of these is NOT a primitive type?",
        ["`int`", "`double`", "`String`", "`boolean`"],
        2,
        "`String` is a class. The others are primitives.",
      ),
    ],
  },

  {
    number: 4,
    slug: "operators",
    title: "Operators",
    module: "Java Basics",
    summary: "Do math, compare values, and combine conditions.",
    minutes: 20,
    content: [
      p("Operators perform operations on variables and values."),
      h("Arithmetic operators"),
      java(
        `int a = 10, b = 3;
System.out.println(a + b);  // addition
System.out.println(a - b);  // subtraction
System.out.println(a * b);  // multiplication
System.out.println(a / b);  // division
System.out.println(a % b);  // remainder (modulus)`,
        `13
7
30
3
1`,
      ),
      note(
        "Dividing two integers gives an integer. `10 / 3` is `3`, not `3.33`. Use a decimal, like `10 / 3.0`, to keep the fraction.",
        "warning",
      ),
      h("Assignment, increment and decrement"),
      java(
        `int x = 5;
x += 3;   // same as x = x + 3  (8)
x++;      // add 1              (9)
x--;      // subtract 1         (8)
System.out.println(x);`,
        "8",
      ),
      h("Comparison operators"),
      p(
        "Comparison operators return a `boolean`: `==`, `!=`, `>`, `<`, `>=`, `<=`.",
      ),
      java(
        `System.out.println(5 > 3);   // true
System.out.println(5 == 3);  // false
System.out.println(5 != 3);  // true`,
        `true
false
true`,
      ),
      h("Logical operators"),
      java(
        `int age = 20;
boolean hasId = true;

System.out.println(age >= 18 && hasId);  // AND
System.out.println(age < 18 || hasId);   // OR
System.out.println(!hasId);              // NOT`,
        `true
true
false`,
      ),
      note(
        'Never compare Strings with `==`. That checks whether they are the same object. Use `.equals()` to compare their text, like `name.equals("Alex")`.',
        "tip",
      ),
    ],
    takeaways: [
      "Arithmetic: `+ - * / %`. Integer division drops the decimal.",
      "Comparisons return `true` or `false`. Combine them with `&&`, `||`, and `!`.",
      "Compare Strings with `.equals()`, not `==`.",
    ],
    quiz: [
      q(
        "What is printed?",
        ["3", "1", "0", "3.33"],
        1,
        "`%` gives the remainder. 10 divided by 3 leaves 1.",
        `System.out.println(10 % 3);`,
      ),
      q(
        "What is printed?",
        ["3.5", "4", "3", "2"],
        2,
        "Both numbers are integers, so the result is an integer: 3.",
        `System.out.println(7 / 2);`,
      ),
      q(
        "Which operator means logical AND?",
        ["`&&`", "`||`", "`!`", "`==`"],
        0,
        "`&&` is true only when both sides are true.",
      ),
      q(
        "What is the value of `x` after this code runs?",
        ["46", "10", "6", "4"],
        1,
        "`x += 6` means `x = x + 6`, so 4 + 6 = 10.",
        `int x = 4;
x += 6;`,
      ),
      q(
        "How should you compare the text of two Strings `a` and `b`?",
        ["`a == b`", "`a = b`", "`a.compare(b)`", "`a.equals(b)`"],
        3,
        "`.equals()` compares content. `==` compares object references.",
      ),
    ],
  },

  {
    number: 5,
    slug: "conditions",
    title: "Conditions: if, else and switch",
    module: "Java Basics",
    summary: "Make decisions with if, else, and switch.",
    minutes: 25,
    content: [
      p(
        "Conditions let your program choose what to do. Use `if` to run code only when something is true.",
      ),
      java(
        `int score = 72;

if (score >= 90) {
  System.out.println("Grade A");
} else if (score >= 75) {
  System.out.println("Grade B");
} else if (score >= 60) {
  System.out.println("Grade C");
} else {
  System.out.println("Try again");
}`,
        "Grade C",
        "if, else if, else",
      ),
      p(
        "Java checks the conditions from top to bottom and runs only the first block that is true.",
      ),
      h("The ternary operator"),
      p("A short way to write a simple `if`/`else` that produces a value."),
      java(
        `int score = 72;
String result = (score >= 60) ? "Pass" : "Fail";
System.out.println(result);`,
        "Pass",
      ),
      h("switch"),
      p("Use `switch` when you compare one value against many fixed options."),
      java(
        `int day = 3;

switch (day) {
  case 1:
    System.out.println("Monday");
    break;
  case 2:
    System.out.println("Tuesday");
    break;
  case 3:
    System.out.println("Wednesday");
    break;
  default:
    System.out.println("Another day");
}`,
        "Wednesday",
      ),
      note(
        "Without `break`, Java keeps running the next case too. This is called fall-through.",
        "warning",
      ),
      h("Modern switch expressions"),
      p(
        "From Java 14 you can write `switch` with arrows. There is no fall-through, and it can return a value.",
      ),
      java(
        `int day = 3;

String name = switch (day) {
  case 1 -> "Monday";
  case 2 -> "Tuesday";
  case 3 -> "Wednesday";
  default -> "Another day";
};

System.out.println(name);`,
        "Wednesday",
      ),
    ],
    takeaways: [
      "`if`, `else if`, and `else` run the first block whose condition is true.",
      "Use `switch` for one value against many options, and remember `break` and `default`.",
      "The ternary `condition ? a : b` is a compact if/else that returns a value.",
    ],
    quiz: [
      q(
        "Which keyword handles every value that matches no case in a `switch`?",
        ["`else`", "`other`", "`default`", "`final`"],
        2,
        "`default` runs when none of the cases match.",
      ),
      q(
        "What is printed?",
        ["A", "B", "AB", "Nothing"],
        1,
        "`x > 5` is false because x is 5, so the `else` block runs.",
        `int x = 5;
if (x > 5) {
  System.out.println("A");
} else {
  System.out.println("B");
}`,
      ),
      q(
        "What happens if you forget `break` in a classic `switch` case?",
        [
          "A compile error",
          "The switch stops early",
          "Execution falls through into the next case",
          "The program restarts",
        ],
        2,
        "Without `break`, Java continues into the following case.",
      ),
      q(
        "What is the value of `r`?",
        ['"yes"', '"no"', "true", "4"],
        0,
        "`4 > 2` is true, so the ternary returns the first value.",
        `String r = (4 > 2) ? "yes" : "no";`,
      ),
      q(
        "Which condition checks that `x` is between 1 and 10, inclusive?",
        [
          "`x >= 1 || x <= 10`",
          "`x > 1 && x < 10`",
          "`1 <= x <= 10`",
          "`x >= 1 && x <= 10`",
        ],
        3,
        "Both parts must be true, so use `&&` and include the boundaries with `>=` and `<=`.",
      ),
    ],
  },

  {
    number: 6,
    slug: "loops-and-arrays",
    title: "Loops and Arrays",
    module: "Java Basics",
    summary: "Repeat work with loops and store lists of values in arrays.",
    minutes: 30,
    content: [
      p(
        "Loops run the same code many times. Arrays store many values of the same type in one variable.",
      ),
      h("The while loop"),
      java(
        `int i = 1;
while (i <= 3) {
  System.out.println("Round " + i);
  i++;
}`,
        `Round 1
Round 2
Round 3`,
      ),
      h("The for loop"),
      p(
        "A `for` loop packs the start, the condition, and the update into one line.",
      ),
      java(
        `for (int i = 0; i < 3; i++) {
  System.out.println(i);
}`,
        `0
1
2`,
      ),
      h("Arrays"),
      java(
        `String[] fruits = {"Apple", "Banana", "Cherry"};

System.out.println(fruits[0]);      // first element
System.out.println(fruits.length);  // number of elements

for (int i = 0; i < fruits.length; i++) {
  System.out.println(fruits[i]);
}`,
        `Apple
3
Apple
Banana
Cherry`,
      ),
      note(
        "Array indexes start at 0. Reading `fruits[3]` in an array of three items throws an `ArrayIndexOutOfBoundsException`.",
        "warning",
      ),
      h("The for-each loop"),
      p("When you only need each value and not its position, use for-each."),
      java(
        `for (String fruit : fruits) {
  System.out.println(fruit);
}`,
        `Apple
Banana
Cherry`,
      ),
      h("break and continue"),
      list(
        "`break` ends the loop immediately.",
        "`continue` skips the rest of the current round and moves on to the next one.",
      ),
    ],
    takeaways: [
      "Use `while` when you don't know how many rounds, and `for` when you do.",
      "Arrays hold many values, are indexed from 0, and expose `.length`.",
      "for-each is the cleanest way to read every element.",
    ],
    quiz: [
      q(
        "How many times does the loop body run?",
        ["4", "5", "6", "Forever"],
        1,
        "`i` takes the values 0, 1, 2, 3, and 4, which is five rounds.",
        `for (int i = 0; i < 5; i++) {
  // body
}`,
      ),
      q(
        "What is the index of the first element in an array?",
        ["0", "1", "-1", "It depends on the type"],
        0,
        "Java arrays are zero-indexed.",
      ),
      q(
        "What is printed?",
        ["2", "3", "15", "4"],
        1,
        "The array holds three values, so `length` is 3.",
        `int[] nums = {4, 8, 15};
System.out.println(nums.length);`,
      ),
      q(
        "What does `continue` do inside a loop?",
        [
          "Ends the loop immediately",
          "Restarts the program",
          "Skips the rest of this round and moves to the next",
          "Pauses for one second",
        ],
        2,
        "`continue` jumps to the next iteration. `break` is the one that ends the loop.",
      ),
      q(
        "Which loop is best for reading every element when you don't need the index?",
        ["for-each", "do-while", "switch", "`while (true)`"],
        0,
        "The for-each loop gives you each value directly.",
      ),
    ],
  },

  {
    number: 7,
    slug: "methods",
    title: "Methods",
    module: "Java Basics",
    summary:
      "Package reusable code into methods with parameters and return values.",
    minutes: 25,
    content: [
      p(
        "A method is a named block of code that runs when you call it. Methods let you reuse code and keep programs organized.",
      ),
      java(
        `public class Main {
  static void greet(String name) {
    System.out.println("Hello, " + name + "!");
  }

  static int add(int a, int b) {
    return a + b;
  }

  public static void main(String[] args) {
    greet("Alex");
    int sum = add(4, 6);
    System.out.println(sum);
  }
}`,
        `Hello, Alex!
10`,
      ),
      h("Parts of a method"),
      list(
        "Return type: the kind of value it sends back. `void` means it returns nothing.",
        "Name: written in camelCase, like `calculateTotal`.",
        "Parameters: the inputs, listed in parentheses.",
        "Body: the code inside `{ }`. Use `return` to send a value back.",
      ),
      note(
        "Parameters are the variables in the method definition. Arguments are the actual values you pass when you call it.",
        "note",
      ),
      h("Scope"),
      p(
        "A variable declared inside a method only exists inside that method. Other methods cannot see it.",
      ),
      note(
        "You'll notice `static` in these examples. It lets us call the methods straight from `main` without creating an object. Lesson 9 explains `static` properly.",
        "tip",
      ),
    ],
    takeaways: [
      "A method has a return type, a name, parameters, and a body.",
      "`void` methods return nothing, and others use `return`.",
      "Variables declared in a method stay inside that method.",
    ],
    quiz: [
      q(
        "What does `void` mean in a method declaration?",
        [
          "The method returns an `int`",
          "The method cannot be called",
          "The method returns nothing",
          "The method is private",
        ],
        2,
        "`void` means the method does not send a value back.",
      ),
      q(
        "What is printed?",
        ["23", "5", "add", "Error"],
        1,
        "The method returns 2 + 3, which is 5.",
        `static int add(int a, int b) {
  return a + b;
}

System.out.println(add(2, 3));`,
      ),
      q(
        'In `greet("Alex")`, what is `"Alex"` called?',
        ["A parameter", "A return type", "An argument", "A variable type"],
        2,
        "The value you pass in a call is an argument. The variable in the definition is the parameter.",
      ),
      q(
        "Which statement sends a value back from a method?",
        ["`send`", "`return`", "`give`", "`output`"],
        1,
        "`return` ends the method and hands back a value.",
      ),
      q(
        "Where can a variable declared inside a method be used?",
        [
          "Anywhere in the program",
          "In every method of the class",
          "Only in `main`",
          "Only inside that method",
        ],
        3,
        "Local variables are limited to the method that declares them.",
      ),
    ],
  },

  /* ====================================================================== */
  /*  MODULE 2: CLASSES AND OBJECTS                                          */
  /* ====================================================================== */
  {
    number: 8,
    slug: "classes-and-objects",
    title: "Classes and Objects",
    module: "Classes and Objects",
    summary: "Blueprints, and the things built from them.",
    minutes: 25,
    content: [
      p(
        "Java is an object-oriented language. Programs are built from objects: things that have data and can do actions. Think of a real car. It has a brand and a year, and it can drive.",
      ),
      p(
        "A class is the blueprint. An object is a real thing built from that blueprint.",
      ),
      java(
        `public class Car {
  String brand;
  int year;
}`,
        undefined,
        "A class (the blueprint)",
      ),
      p(
        "Use the `new` keyword to create objects. Each object gets its own copy of the attributes, and you reach them with a dot.",
      ),
      java(
        `public class Main {
  public static void main(String[] args) {
    Car myCar = new Car();
    myCar.brand = "Toyota";
    myCar.year = 2022;

    Car yourCar = new Car();
    yourCar.brand = "Honda";
    yourCar.year = 2019;

    System.out.println(myCar.brand + " " + myCar.year);
    System.out.println(yourCar.brand + " " + yourCar.year);
  }
}`,
        `Toyota 2022
Honda 2019`,
        "Creating objects",
      ),
      list(
        "`Car myCar` declares a variable that can refer to a `Car` object.",
        "`new Car()` builds the object in memory.",
        "`myCar.brand` uses the dot to read or change an attribute.",
      ),
      note(
        "A public class must live in a file with the same name, like `Car.java`. You can keep other classes in separate files in the same folder.",
        "tip",
      ),
    ],
    takeaways: [
      "A class is a blueprint, and an object is an instance of it.",
      "Create objects with `new` and reach their data with the dot operator.",
      "Every object has its own copy of the attributes.",
    ],
    quiz: [
      q(
        "What is a class?",
        [
          "A blueprint for creating objects",
          "A running object",
          "A kind of variable",
          "A loop",
        ],
        0,
        "A class describes what its objects will have and do.",
      ),
      q(
        "Which keyword creates a new object?",
        ["`create`", "`object`", "`new`", "`make`"],
        2,
        "`new` allocates memory and builds the object.",
      ),
      q(
        "How do you read the `brand` attribute of the object `myCar`?",
        ["`myCar->brand`", "`brand(myCar)`", "`myCar[brand]`", "`myCar.brand`"],
        3,
        "Java uses the dot operator to access attributes and methods.",
      ),
      q(
        "You create two `Car` objects and change the brand of one. What happens to the other object's brand?",
        [
          "It changes too",
          "It stays the same",
          "It becomes null",
          "Compile error",
        ],
        1,
        "Each object keeps its own copy of the attributes.",
      ),
      q(
        "In `Car myCar = new Car();`, what is `myCar`?",
        [
          "A copy of the Car class",
          "A method",
          "A constant",
          "A reference variable that points to a Car object",
        ],
        3,
        "`myCar` holds a reference to the object created by `new`.",
        `Car myCar = new Car();`,
      ),
    ],
  },

  {
    number: 9,
    slug: "attributes-methods-and-static",
    title: "Attributes, Methods and static",
    module: "Classes and Objects",
    summary: "Give classes data and behavior, and learn when to use static.",
    minutes: 30,
    content: [
      p(
        "Attributes (also called fields) are variables inside a class. Methods are functions inside a class. Together they describe what an object has and what it can do.",
      ),
      java(
        `public class Dog {
  String name;
  int age;

  void bark() {
    System.out.println(name + " says Woof!");
  }

  int humanYears() {
    return age * 7;
  }
}`,
        undefined,
        "Attributes and methods",
      ),
      java(
        `Dog d = new Dog();
d.name = "Rex";
d.age = 3;

d.bark();
System.out.println(d.humanYears());`,
        `Rex says Woof!
21`,
      ),
      note(
        "An instance method can use the object's own attributes directly, like `name` and `age` above.",
        "note",
      ),
      h("static attributes and methods"),
      p(
        "Normally each object gets its own copy of every attribute. A `static` member belongs to the class itself, so there is only one copy shared by all objects.",
      ),
      java(
        `public class Counter {
  static int total = 0;  // one copy shared by every Counter
  int count = 0;         // each Counter has its own copy

  void increase() {
    count++;
    total++;
  }
}`,
      ),
      java(
        `Counter a = new Counter();
Counter b = new Counter();

a.increase();
a.increase();
b.increase();

System.out.println(a.count);
System.out.println(b.count);
System.out.println(Counter.total);`,
        `2
1
3`,
      ),
      p(
        "A static method can be called on the class itself, with no object needed.",
      ),
      java(
        `public class MathUtil {
  static int square(int n) {
    return n * n;
  }
}

// Somewhere else:
System.out.println(MathUtil.square(5));`,
        "25",
      ),
      note(
        "A static method cannot use instance attributes, because there may be no object when it runs. This is also why `main` is static: the JVM calls it before any object exists.",
        "warning",
      ),
    ],
    takeaways: [
      "Attributes hold an object's data, and methods define what it can do.",
      "Instance members belong to each object. `static` members belong to the class.",
      "Call static methods on the class, like `MathUtil.square(5)`.",
    ],
    quiz: [
      q(
        "Which line calls the static method `square` of the class `MathUtil`?",
        [
          "`MathUtil.square(5);`",
          "`square.MathUtil(5);`",
          "`MathUtil->square(5);`",
          "`call MathUtil square(5);`",
        ],
        0,
        "Static methods are called with the class name and a dot.",
      ),
      q(
        "A `static` attribute is shared by:",
        [
          "Only the first object",
          "Every object of the class",
          "Only subclasses",
          "Nobody",
        ],
        1,
        "There is a single copy that belongs to the class.",
      ),
      q(
        "Using the `Dog` class from this lesson (`humanYears()` returns `age * 7`), what is printed?",
        ["11", "7", "28", "4"],
        2,
        "4 times 7 is 28.",
        `Dog d = new Dog();
d.age = 4;
System.out.println(d.humanYears());`,
      ),
      q(
        "What can a static method use directly?",
        [
          "Instance attributes",
          "The `this` keyword",
          "Any attribute of any object",
          "Other static members",
        ],
        3,
        "Static code runs without an object, so it can only use other static members directly.",
      ),
      q(
        "You create 3 objects. How many copies of a non-static attribute exist?",
        ["One", "Zero", "Three", "It depends on the compiler"],
        2,
        "Each object has its own copy of an instance attribute.",
      ),
    ],
  },

  {
    number: 10,
    slug: "constructors",
    title: "Constructors",
    module: "Classes and Objects",
    summary: "Set up objects the moment they are created.",
    minutes: 25,
    content: [
      p(
        "A constructor is a special method that runs automatically when an object is created. It has the same name as the class and no return type, not even `void`.",
      ),
      java(
        `public class Car {
  String brand;
  int year;

  Car(String brand, int year) {
    this.brand = brand;
    this.year = year;
  }
}`,
        undefined,
        "A constructor with parameters",
      ),
      java(
        `Car myCar = new Car("Toyota", 2022);
System.out.println(myCar.brand + " " + myCar.year);`,
        "Toyota 2022",
      ),
      h("The this keyword"),
      p(
        "Inside a constructor or method, `this` means the current object. Here `this.brand` is the attribute, and `brand` is the parameter with the same name.",
      ),
      h("The default constructor"),
      p(
        "If you don't write any constructor, Java gives your class an empty one with no parameters. As soon as you write your own, Java stops providing that default.",
      ),
      h("Constructor overloading"),
      p(
        "A class can have several constructors with different parameters. One constructor can call another with `this(...)`.",
      ),
      java(
        `public class Car {
  String brand;
  int year;

  Car() {
    this("Unknown", 2000);   // calls the constructor below
  }

  Car(String brand, int year) {
    this.brand = brand;
    this.year = year;
  }
}`,
      ),
      java(
        `Car a = new Car();
Car b = new Car("Toyota", 2022);

System.out.println(a.brand + " " + a.year);
System.out.println(b.brand + " " + b.year);`,
        `Unknown 2000
Toyota 2022`,
      ),
      note(
        "`this(...)` must be the first statement in the constructor.",
        "warning",
      ),
    ],
    takeaways: [
      "A constructor has the class name, no return type, and runs when you use `new`.",
      "`this` refers to the current object. It separates attributes from parameters.",
      "Write several constructors to give callers more than one way to build an object.",
    ],
    quiz: [
      q(
        "What must a constructor's name be?",
        ["The same as the class name", "`new`", "`init`", "Any name you like"],
        0,
        "Java recognizes a constructor by its name matching the class.",
      ),
      q(
        "What return type does a constructor declare?",
        ["`void`", "None, not even `void`", "`int`", "`Object`"],
        1,
        "Constructors have no return type at all.",
      ),
      q(
        "In this constructor, what is `this.brand`?",
        [
          "The constructor's parameter",
          "A local variable",
          "The attribute of the current object",
          "A static constant",
        ],
        2,
        "`this.brand` is the attribute. The plain `brand` is the parameter.",
        `Car(String brand) {
  this.brand = brand;
}`,
      ),
      q(
        "A class declares only `Car(String brand)`. What happens when you write `new Car()`?",
        [
          "A default constructor is used",
          "Compile error, because no constructor matches",
          "`brand` becomes empty",
          "A runtime exception",
        ],
        1,
        "Once you write any constructor, Java no longer supplies the empty default one.",
      ),
      q(
        "When does a constructor run?",
        [
          "When the program starts",
          "When you call a setter",
          "When the object is deleted",
          "When the object is created with `new`",
        ],
        3,
        "Constructors run once, as part of `new`.",
      ),
    ],
  },

  /* ====================================================================== */
  /*  MODULE 3: ENCAPSULATION                                                */
  /* ====================================================================== */
  {
    number: 11,
    slug: "access-modifiers",
    title: "Access Modifiers",
    module: "Encapsulation",
    summary: "Control who can see and use your code.",
    minutes: 20,
    content: [
      p(
        "Access modifiers decide who is allowed to see and use a class, attribute, or method. They are the first tool for protecting your data.",
      ),
      list(
        "`public`: accessible from anywhere.",
        "`private`: accessible only inside the same class.",
        "`protected`: accessible in the same package and in subclasses.",
        "default (no modifier): accessible only in the same package.",
      ),
      java(
        `public class Account {
  public String owner;
  private double balance;   // hidden from other classes

  public Account(String owner, double balance) {
    this.owner = owner;
    this.balance = balance;
  }
}`,
        undefined,
        "public and private attributes",
      ),
      java(
        `Account acc = new Account("Alex", 500);
System.out.println(acc.owner);
// System.out.println(acc.balance);  // Error: balance has private access`,
        "Alex",
      ),
      h("Packages"),
      p(
        "A package groups related classes together, like a folder. You declare it on the first line of a file, for example `package com.school.lms;`. Package-private (default) and `protected` access are based on packages.",
      ),
      note(
        "Start with `private` and open things up only when you need to. Hiding details by default is the idea behind the next lesson.",
        "tip",
      ),
    ],
    takeaways: [
      "`private` is the most closed, and `public` is the most open.",
      "`protected` adds access for subclasses, and default access is limited to the package.",
      "Make attributes `private` unless there is a reason not to.",
    ],
    quiz: [
      q(
        "Which modifier allows access only inside the same class?",
        ["`public`", "`private`", "`protected`", "default"],
        1,
        "`private` members are visible only within their own class.",
      ),
      q(
        "What does no modifier (default access) allow?",
        [
          "Access from anywhere",
          "Access only from the same class",
          "Access from the same package",
          "Access only from subclasses",
        ],
        2,
        "Default access is also called package-private.",
      ),
      q(
        "Which modifier allows access from the same package and from subclasses?",
        ["`protected`", "`private`", "`public`", "`final`"],
        0,
        "`protected` is designed for inheritance.",
      ),
      q(
        "`balance` is private in `Account`. What happens when another class runs this line?",
        [
          "It prints the balance",
          "Compile error: balance has private access",
          "It prints 0",
          "Runtime error",
        ],
        1,
        "Private members cannot be used outside their class. The compiler stops you.",
        `System.out.println(acc.balance);`,
      ),
      q(
        "Which modifier is the most open?",
        ["`private`", "`protected`", "default", "`public`"],
        3,
        "`public` members can be used from anywhere.",
      ),
    ],
  },

  {
    number: 12,
    slug: "encapsulation",
    title: "Encapsulation",
    module: "Encapsulation",
    summary: "Pillar 1: hide data and expose it safely through methods.",
    minutes: 30,
    content: [
      p(
        "Encapsulation is the first pillar of OOP. It means bundling data and the methods that work on it together, and hiding the internal details from the outside world.",
      ),
      p(
        "To encapsulate a class: declare the attributes `private`, then provide `public` methods to read and change them.",
      ),
      java(
        `public class Account {
  private double balance;

  public double getBalance() {
    return balance;
  }

  public void deposit(double amount) {
    if (amount > 0) {
      balance += amount;
    }
  }

  public boolean withdraw(double amount) {
    if (amount > 0 && amount <= balance) {
      balance -= amount;
      return true;
    }
    return false;
  }
}`,
        undefined,
        "An encapsulated class",
      ),
      java(
        `Account acc = new Account();
acc.deposit(500);
acc.withdraw(200);
acc.withdraw(1000);   // rejected: not enough money

System.out.println(acc.getBalance());`,
        "300.0",
      ),
      p(
        "Nobody can set the balance to a negative number or overdraw the account, because the only way in is through methods that check the rules.",
      ),
      h("Why encapsulate?"),
      list(
        "Control: validate every change to your data.",
        "Flexibility: change the inside of the class without breaking code that uses it.",
        "Safety: other code can't put the object into an invalid state.",
        "Clarity: users of the class only see what they need.",
      ),
      h("Getters and setters"),
      p(
        "A getter returns a value and a setter changes it. By convention they are named `getX()` and `setX()`. A boolean getter is usually named `isX()`.",
      ),
      java(
        `public class Person {
  private int age;

  public int getAge() {
    return age;
  }

  public void setAge(int age) {
    if (age >= 0 && age <= 120) {
      this.age = age;
    }
  }
}`,
      ),
      note(
        "A setter is your chance to validate. Don't generate a setter for every attribute out of habit. Only add the ones that make sense.",
        "tip",
      ),
    ],
    takeaways: [
      "Encapsulation = private data + public methods that enforce the rules.",
      "Getters read values, and setters change them after validating.",
      "It protects objects from ending up in an invalid state.",
    ],
    quiz: [
      q(
        "What does encapsulation mean?",
        [
          "Copying a class",
          "Hiding data and exposing it through methods",
          "Running code faster",
          "Splitting code across files",
        ],
        1,
        "Data is kept private, and methods control how it is read or changed.",
      ),
      q(
        "How do you encapsulate an attribute?",
        [
          "Make it public and static",
          "Make it final",
          "Make it private and provide public getter and setter methods",
          "Move it into `main`",
        ],
        2,
        "Private attribute plus public methods is the standard pattern.",
      ),
      q(
        "Why validate input inside a setter?",
        [
          "To make the program slower",
          "To avoid using constructors",
          "To hide the class name",
          "To keep the object from entering an invalid state",
        ],
        3,
        "The setter is the gatekeeper for the attribute.",
      ),
      q(
        "What is printed? (Use the `Account` class from this lesson.)",
        ["100.0", "-50.0", "250.0", "Error"],
        0,
        "The withdrawal of 150 is rejected because it exceeds the balance, so 100.0 remains.",
        `Account acc = new Account();
acc.deposit(100);
acc.withdraw(150);
System.out.println(acc.getBalance());`,
      ),
      q(
        "What is the standard getter name for a private attribute called `name`?",
        ["`name()`", "`getName()`", "`fetchName()`", "`readName()`"],
        1,
        "By convention, getters start with `get` followed by the attribute name.",
      ),
    ],
  },

  /* ====================================================================== */
  /*  MODULE 4: INHERITANCE                                                  */
  /* ====================================================================== */
  {
    number: 13,
    slug: "inheritance",
    title: "Inheritance",
    module: "Inheritance",
    summary: "Pillar 2: reuse and extend code with extends.",
    minutes: 25,
    content: [
      p(
        "Inheritance is the second pillar of OOP. It lets one class reuse the attributes and methods of another. The class that inherits is the subclass (or child). The class it inherits from is the superclass (or parent). You write it with `extends`.",
      ),
      java(
        `class Animal {
  String name;

  void eat() {
    System.out.println(name + " is eating");
  }
}

class Dog extends Animal {
  void bark() {
    System.out.println(name + " says Woof!");
  }
}`,
        undefined,
        "Dog inherits from Animal",
      ),
      java(
        `Dog d = new Dog();
d.name = "Rex";
d.eat();    // inherited from Animal
d.bark();   // defined in Dog`,
        `Rex is eating
Rex says Woof!`,
      ),
      h("The IS-A test"),
      p(
        'Use inheritance when the sentence "X is a Y" makes sense. A Dog is an Animal, so `Dog extends Animal`. A Car is not an Engine. A Car has an Engine, which is a different relationship.',
      ),
      h("Rules to remember"),
      list(
        "A class can extend only one class. Java has single inheritance for classes.",
        "Every class ultimately inherits from `Object`.",
        "A subclass cannot directly use the superclass's `private` members. Use `protected` or getters.",
        "Mark a class `final` to stop anyone from extending it.",
      ),
      note(
        "Inheritance can go several levels deep (`Puppy extends Dog extends Animal`), but deep chains are hard to understand. Keep hierarchies shallow.",
        "tip",
      ),
    ],
    takeaways: [
      "`extends` lets a subclass reuse and add to a superclass.",
      "Use inheritance only for IS-A relationships.",
      "A class can extend just one class, and every class descends from `Object`.",
    ],
    quiz: [
      q(
        "Which keyword makes a class inherit from another?",
        ["`implements`", "`inherits`", "`extends`", "`super`"],
        2,
        "`class Dog extends Animal` declares inheritance.",
      ),
      q(
        "How many classes can a Java class extend?",
        ["One", "Two", "As many as you want", "None"],
        0,
        "Java supports single inheritance for classes.",
      ),
      q(
        "In `class Dog extends Animal`, what is `Dog`?",
        ["The superclass", "The subclass", "An interface", "A constructor"],
        1,
        "`Dog` is the subclass (child). `Animal` is the superclass (parent).",
      ),
      q(
        "Which pair fits an IS-A relationship?",
        [
          "Car and Engine",
          "Library and Book",
          "Student and Name",
          "Dog and Animal",
        ],
        3,
        "A Dog is an Animal. The other pairs are HAS-A relationships.",
      ),
      q(
        "Which class is the root of every Java class?",
        ["`Main`", "`Root`", "`Object`", "`Class`"],
        2,
        "All classes inherit from `java.lang.Object`, directly or indirectly.",
      ),
    ],
  },

  {
    number: 14,
    slug: "super-keyword",
    title: "The super Keyword",
    module: "Inheritance",
    summary: "Reach the parent class from a subclass.",
    minutes: 20,
    content: [
      p(
        "The `super` keyword refers to the parent class. You use it in two main ways: to call the parent's constructor, and to call the parent's methods.",
      ),
      h("Calling the parent constructor"),
      java(
        `class Person {
  String name;

  Person(String name) {
    this.name = name;
  }
}

class Student extends Person {
  String school;

  Student(String name, String school) {
    super(name);          // runs the Person constructor first
    this.school = school;
  }

  void introduce() {
    System.out.println(name + " studies at " + school);
  }
}`,
        undefined,
        "super(...) in a constructor",
      ),
      java(
        `Student s = new Student("Alex", "Riverside");
s.introduce();`,
        "Alex studies at Riverside",
      ),
      note(
        "`super(...)` must be the first statement in the constructor. If you leave it out, Java inserts `super()` for you, and that fails to compile if the parent has no constructor without parameters.",
        "warning",
      ),
      p(
        "When you create a subclass object, the parent constructor always runs first, then the child's.",
      ),
      h("Calling a parent method"),
      p(
        "Use `super.methodName()` to run the parent's version of a method from inside the subclass.",
      ),
      java(
        `class Animal {
  void sound() {
    System.out.println("Some sound");
  }
}

class Cat extends Animal {
  void sound() {
    super.sound();            // parent's version
    System.out.println("Meow");
  }
}`,
      ),
      java(
        `new Cat().sound();`,
        `Some sound
Meow`,
      ),
      p(
        "The `Cat` class just replaced a method it inherited. That is called overriding, and it is the next lesson.",
      ),
    ],
    takeaways: [
      "`super(...)` calls the parent constructor and must come first.",
      "Parent constructors run before child constructors.",
      "`super.method()` calls the parent's version of a method.",
    ],
    quiz: [
      q(
        "What does `super(name)` do inside a constructor?",
        [
          "Calls the parent class constructor",
          "Creates a new object",
          "Calls a static method",
          "Ends the constructor",
        ],
        0,
        "It passes `name` to the parent's constructor.",
      ),
      q(
        "Where must a `super(...)` call appear in a constructor?",
        ["Last", "First", "Anywhere", "Inside a loop"],
        1,
        "It must be the very first statement.",
      ),
      q(
        "When you create a subclass object, which constructor body runs first?",
        [
          "The subclass constructor",
          "Both at the same time",
          "The parent constructor",
          "Neither",
        ],
        2,
        "The parent part is built first, then the child part.",
      ),
      q(
        "What does `super.sound()` do?",
        [
          "Creates a new Animal",
          "Calls `sound` in the same class",
          "Declares a new method",
          "Calls the parent class's `sound` method",
        ],
        3,
        "`super.` reaches the parent's version of the method.",
      ),
      q(
        "The parent has only `Person(String name)`. The child constructor doesn't call `super(...)`. What happens?",
        [
          "`name` becomes null",
          "Java supplies an empty constructor",
          "Compile error, because no `super(...)` matches",
          "Runtime error when it runs",
        ],
        2,
        "Java tries to insert `super()`, but the parent has no such constructor.",
      ),
    ],
  },

  {
    number: 15,
    slug: "method-overriding",
    title: "Method Overriding",
    module: "Inheritance",
    summary: "Change inherited behavior in a subclass.",
    minutes: 25,
    content: [
      p(
        "Sometimes a subclass needs to behave differently from its parent. Overriding lets the subclass provide its own version of an inherited method. The name and parameters must stay the same.",
      ),
      java(
        `class Animal {
  void makeSound() {
    System.out.println("Some sound");
  }
}

class Dog extends Animal {
  @Override
  void makeSound() {
    System.out.println("Woof!");
  }
}

class Cat extends Animal {
  @Override
  void makeSound() {
    System.out.println("Meow!");
  }
}`,
        undefined,
        "Dog and Cat override makeSound()",
      ),
      java(
        `Animal a = new Animal();
Dog d = new Dog();
Cat c = new Cat();

a.makeSound();
d.makeSound();
c.makeSound();`,
        `Some sound
Woof!
Meow!`,
      ),
      h("The @Override annotation"),
      p(
        "`@Override` is optional, but you should always use it. It asks the compiler to confirm that the method really overrides something. If you mistype the name, you get an error instead of a silent bug.",
      ),
      h("Rules for overriding"),
      list(
        "Same method name and same parameter list as the parent method.",
        "The return type must be the same (or a subtype of it).",
        "The method can't be less visible than the parent's. A `public` method can't become `private`.",
        "You can't override `final`, `static`, or `private` methods.",
      ),
      p(
        "A very common example is overriding `toString()`, which every class inherits from `Object`.",
      ),
      java(
        `class Book {
  String title = "Java Basics";

  @Override
  public String toString() {
    return "Book: " + title;
  }
}

// Somewhere else:
System.out.println(new Book());`,
        "Book: Java Basics",
      ),
      note(
        "`toString()` is `public` in `Object`, so the override must be `public` too.",
        "tip",
      ),
    ],
    takeaways: [
      "Overriding = same method signature, new behavior in the subclass.",
      "Always add `@Override` so the compiler checks your work.",
      "You can't reduce visibility, and `final`, `static`, and `private` methods can't be overridden.",
    ],
    quiz: [
      q(
        "What is method overriding?",
        [
          "A subclass providing its own version of an inherited method",
          "Two methods with the same name but different parameters in one class",
          "Calling a method twice",
          "Making a method static",
        ],
        0,
        "Overriding replaces the inherited behavior with a new one in the subclass.",
      ),
      q(
        "What does `@Override` do?",
        [
          "Makes the method run faster",
          "Makes the method static",
          "Hides the method from subclasses",
          "Asks the compiler to check that it really overrides a parent method",
        ],
        3,
        "It catches mistakes like a misspelled method name.",
      ),
      q(
        "Which kind of method cannot be overridden?",
        [
          "A public method",
          "A `final` method",
          "An instance method",
          "A `void` method",
        ],
        1,
        "`final` forbids overriding.",
      ),
      q(
        "What is printed? (`Dog` overrides `makeSound()` to print Woof!)",
        ["Woof!", "Some sound", "Meow!", "Compile error"],
        0,
        "The overridden version in `Dog` runs.",
        `Dog d = new Dog();
d.makeSound();`,
      ),
      q(
        "Which rule applies to visibility when overriding?",
        [
          "The method can be made private",
          "Visibility is ignored",
          "It can't be more restrictive than the parent's method",
          "It must be private",
        ],
        2,
        "An override can keep or widen access, but never narrow it.",
      ),
    ],
  },

  /* ====================================================================== */
  /*  MODULE 5: POLYMORPHISM                                                 */
  /* ====================================================================== */
  {
    number: 16,
    slug: "method-overloading",
    title: "Method Overloading",
    module: "Polymorphism",
    summary: "Reuse one method name with different parameters.",
    minutes: 20,
    content: [
      p(
        "Overloading means writing several methods with the same name in the same class, as long as their parameter lists are different. Java picks the right one based on the arguments you pass.",
      ),
      java(
        `class Calculator {
  int add(int a, int b) {
    return a + b;
  }

  double add(double a, double b) {
    return a + b;
  }

  int add(int a, int b, int c) {
    return a + b + c;
  }
}`,
        undefined,
        "Three versions of add()",
      ),
      java(
        `Calculator calc = new Calculator();

System.out.println(calc.add(2, 3));
System.out.println(calc.add(2.5, 1.5));
System.out.println(calc.add(1, 2, 3));`,
        `5
4.0
6`,
      ),
      h("What makes a valid overload?"),
      list(
        "A different number of parameters.",
        "Different parameter types.",
        "A different order of parameter types.",
      ),
      note(
        "The return type alone is not enough. `int get()` and `double get()` in the same class will not compile, because the compiler can't tell which one you mean.",
        "warning",
      ),
      h("Overloading vs overriding"),
      list(
        "Overloading: same name, different parameters, in the same class. Decided at compile time.",
        "Overriding: same name and parameters, in a subclass. Decided at run time.",
        "Overloading is compile-time polymorphism. Overriding is run-time polymorphism, which is the next lesson.",
      ),
    ],
    takeaways: [
      "Overloaded methods share a name but differ in their parameter lists.",
      "The return type alone can't distinguish overloads.",
      "Java chooses the overload at compile time from the arguments.",
    ],
    quiz: [
      q(
        "What must differ between overloaded methods?",
        [
          "The class name",
          "The return type only",
          "The parameter list",
          "The access modifier only",
        ],
        2,
        "Overloads are told apart by their parameters.",
      ),
      q(
        "Can you overload a method by changing only the return type?",
        [
          "Yes",
          "No, the compiler can't tell them apart",
          "Only for `void` methods",
          "Only in subclasses",
        ],
        1,
        "Calls look identical, so the compiler rejects it.",
      ),
      q(
        "Using the `Calculator` class from this lesson, what is printed?",
        ["5", "5.0", "23", "Error"],
        0,
        "The `int` version is chosen because both arguments are ints.",
        `System.out.println(calc.add(2, 3));`,
      ),
      q(
        "When does Java decide which overloaded method to call?",
        [
          "At run time",
          "At compile time",
          "When the object is deleted",
          "Never",
        ],
        1,
        "Overloading is resolved by the compiler.",
      ),
      q(
        "Which pair is valid overloading?",
        [
          "`void show(int a)` and `int show(int a)`",
          "`void show(int a)` and `void show(int b)`",
          "`int show()` and `int show()`",
          "`void show(int a)` and `void show(String s)`",
        ],
        3,
        "Only the last pair has different parameter types.",
      ),
    ],
  },

  {
    number: 17,
    slug: "polymorphism",
    title: "Polymorphism",
    module: "Polymorphism",
    summary: "Pillar 3: one call, many behaviors.",
    minutes: 30,
    content: [
      p(
        'Polymorphism means "many forms". It is the third pillar of OOP. The same method call can behave differently depending on the real object behind it.',
      ),
      p(
        "Overloading is one kind (compile-time). The more powerful kind is run-time polymorphism, which comes from overriding.",
      ),
      java(
        `class Animal {
  void makeSound() {
    System.out.println("Some sound");
  }
}

class Dog extends Animal {
  @Override
  void makeSound() {
    System.out.println("Woof!");
  }
}

class Cat extends Animal {
  @Override
  void makeSound() {
    System.out.println("Meow!");
  }
}

public class Main {
  public static void main(String[] args) {
    Animal[] animals = { new Dog(), new Cat(), new Animal() };

    for (Animal a : animals) {
      a.makeSound();
    }
  }
}`,
        `Woof!
Meow!
Some sound`,
        "One loop, three behaviors",
      ),
      p(
        "The loop only knows about `Animal`, yet each object responds in its own way. Java decides which version to run while the program is running, based on the actual object. This is called dynamic method dispatch.",
      ),
      h("Upcasting and downcasting"),
      java(
        `Animal a = new Dog();     // upcasting: automatic and always safe

if (a instanceof Dog) {
  Dog d = (Dog) a;        // downcasting: explicit
  System.out.println("It's a dog");
}`,
        "It's a dog",
      ),
      list(
        "Upcasting treats a subclass object as its superclass type.",
        "Downcasting converts it back. Check with `instanceof` first to avoid a `ClassCastException`.",
        "Through an `Animal` reference you can only call methods that `Animal` declares.",
      ),
      note(
        "Since Java 16 you can write `if (a instanceof Dog d) { ... }` and skip the manual cast.",
        "tip",
      ),
      h("Why it matters"),
      p(
        "You can write code against a general type, like a method `feed(Animal a)`, and it works for every current and future subclass without changes.",
      ),
    ],
    takeaways: [
      "Polymorphism lets one call behave differently depending on the actual object.",
      "Overriding gives run-time polymorphism, and overloading gives compile-time polymorphism.",
      "Code written for a parent type works with every subclass.",
    ],
    quiz: [
      q(
        "If `Dog` overrides `makeSound()` to print Woof!, what is printed?",
        ["Some sound", "Woof!", "Nothing", "Compile error"],
        1,
        "The method that runs is chosen by the actual object, a `Dog`.",
        `Animal a = new Dog();
a.makeSound();`,
      ),
      q(
        "What does run-time polymorphism mean?",
        [
          "The method that runs depends on the actual object type at run time",
          "The compiler chooses the method",
          "Objects change class at compile time",
          "Methods run in parallel",
        ],
        0,
        "The JVM looks at the real object when the call happens.",
      ),
      q(
        "What is upcasting?",
        [
          "Converting an `int` to a `double`",
          "Making a class abstract",
          "Treating a subclass object as its superclass type",
          "Deleting an object",
        ],
        2,
        "For example, storing a `Dog` in an `Animal` variable.",
      ),
      q(
        "Which operator checks an object's type at run time?",
        ["`typeof`", "`isa`", "`equals`", "`instanceof`"],
        3,
        "`instanceof` returns true if the object is of that type.",
      ),
      q(
        "Method overloading is an example of:",
        [
          "Run-time polymorphism",
          "Compile-time polymorphism",
          "Encapsulation",
          "Abstraction",
        ],
        1,
        "The compiler picks the overload, so it is compile-time polymorphism.",
      ),
    ],
  },

  /* ====================================================================== */
  /*  MODULE 6: ABSTRACTION                                                  */
  /* ====================================================================== */
  {
    number: 18,
    slug: "abstract-classes",
    title: "Abstract Classes",
    module: "Abstraction",
    summary:
      "Pillar 4: define what to do without saying how, using abstract classes.",
    minutes: 30,
    content: [
      p(
        "Abstraction is the fourth pillar of OOP. It means hiding the complex details and showing only what is essential. When you drive a car you use the pedals and wheel, not the engine internals.",
      ),
      p(
        "In Java you get abstraction with abstract classes and interfaces. An abstract class can't be instantiated. It can contain abstract methods, which have no body, that its subclasses must implement.",
      ),
      java(
        `abstract class Shape {
  String color;

  Shape(String color) {
    this.color = color;
  }

  abstract double area();   // no body: subclasses must provide it

  void describe() {
    System.out.println(color + " shape with area " + area());
  }
}

class Circle extends Shape {
  double radius;

  Circle(String color, double radius) {
    super(color);
    this.radius = radius;
  }

  @Override
  double area() {
    return Math.PI * radius * radius;
  }
}

class Rectangle extends Shape {
  double width, height;

  Rectangle(String color, double width, double height) {
    super(color);
    this.width = width;
    this.height = height;
  }

  @Override
  double area() {
    return width * height;
  }
}`,
        undefined,
        "An abstract class and two subclasses",
      ),
      java(
        `// Shape s = new Shape("Red");   // Error: Shape is abstract

Shape c = new Circle("Blue", 2);
Shape r = new Rectangle("Green", 3, 4);

c.describe();
r.describe();`,
        `Blue shape with area 12.566370614359172
Green shape with area 12.0`,
      ),
      h("Rules for abstract classes"),
      list(
        "You can't create an object of an abstract class with `new`.",
        "It can have normal attributes, constructors, and regular methods.",
        "An abstract method has no body, just a declaration ending with `;`.",
        "A subclass must implement every abstract method, or be abstract itself.",
      ),
      note(
        "Reach for an abstract class when related classes share state and code, and there is a clear IS-A relationship, like Circle and Rectangle both being a Shape.",
        "tip",
      ),
    ],
    takeaways: [
      "Abstraction hides details and exposes only what is essential.",
      "Abstract classes can't be instantiated, and they declare methods subclasses must implement.",
      "They can still hold shared attributes, constructors, and ordinary methods.",
    ],
    quiz: [
      q(
        "Can you create an object of an abstract class with `new`?",
        [
          "Yes, always",
          "No",
          "Only inside `main`",
          "Only if it has a constructor",
        ],
        1,
        "Abstract classes are incomplete by design, so Java won't build them directly.",
      ),
      q(
        "What does an abstract method have?",
        [
          "A body that returns null",
          "A private body",
          "Only static code",
          "No body, only a declaration",
        ],
        3,
        "It is a promise that subclasses will fill in.",
      ),
      q(
        "A subclass doesn't implement all the abstract methods of its parent. What must the subclass be?",
        ["`final`", "`static`", "Declared `abstract` too", "`private`"],
        2,
        "Otherwise the subclass would still be incomplete.",
      ),
      q(
        "Can an abstract class have a constructor?",
        [
          "Yes, subclasses call it with `super(...)`",
          "No, never",
          "Only if it has no attributes",
          "Only if it is `final`",
        ],
        0,
        "Abstract classes often use constructors to set up shared state.",
      ),
      q(
        "What is the main goal of abstraction?",
        [
          "Make code longer",
          "Hide complexity and expose only what is essential",
          "Speed up compilation",
          "Avoid using classes",
        ],
        1,
        "Users of a class should only need to know what it does, not how.",
      ),
    ],
  },

  {
    number: 19,
    slug: "interfaces",
    title: "Interfaces",
    module: "Abstraction",
    summary: "Pillar 4, continued: contracts any class can sign up to.",
    minutes: 30,
    content: [
      p(
        "An interface is a contract. It lists the methods a class must have, without saying how they work. A class agrees to the contract with the `implements` keyword.",
      ),
      java(
        `interface Payable {
  double calculatePay();
}

interface Printable {
  void print();
}

class Employee implements Payable, Printable {
  String name;
  double hours, rate;

  Employee(String name, double hours, double rate) {
    this.name = name;
    this.hours = hours;
    this.rate = rate;
  }

  @Override
  public double calculatePay() {
    return hours * rate;
  }

  @Override
  public void print() {
    System.out.println(name + " earns " + calculatePay());
  }
}`,
        undefined,
        "A class implementing two interfaces",
      ),
      java(
        `Employee e = new Employee("Alex", 40, 15);
e.print();`,
        "Alex earns 600.0",
      ),
      h("Key facts"),
      list(
        "Methods in an interface are `public` and `abstract` by default.",
        "The implementing class must declare those methods `public`.",
        "A class can implement many interfaces, which gets around single inheritance.",
        "An interface can extend other interfaces.",
        "Attributes in an interface are constants (`public static final`).",
      ),
      h("Default methods"),
      p(
        "Since Java 8 an interface can include a method with a body, marked `default`. Implementing classes get it for free and may override it.",
      ),
      java(
        `interface Greeter {
  String name();

  default void greet() {
    System.out.println("Hello, " + name() + "!");
  }
}`,
      ),
      h("Abstract class or interface?"),
      list(
        "Abstract class: shared state and code, one parent, an IS-A relationship.",
        "Interface: a capability that unrelated classes can share, many allowed per class.",
      ),
      note(
        "Interfaces are great for programming to a contract. A method that accepts a `Payable` works with any class that implements it.",
        "tip",
      ),
    ],
    takeaways: [
      "An interface defines what a class must do, and `implements` signs the contract.",
      "A class can implement many interfaces. Interface methods are public and abstract by default.",
      "`default` methods let interfaces carry a ready-made implementation.",
    ],
    quiz: [
      q(
        "Which keyword does a class use to adopt an interface?",
        ["`extends`", "`uses`", "`inherits`", "`implements`"],
        3,
        "A class `implements` an interface and `extends` a class.",
      ),
      q(
        "How many interfaces can one class implement?",
        ["Only one", "As many as needed", "None", "Exactly two"],
        1,
        "A class can implement any number of interfaces.",
      ),
      q(
        "By default, methods declared in an interface are:",
        [
          "`private` and `final`",
          "`protected`",
          "`public` and `abstract`",
          "`static`",
        ],
        2,
        "That is why implementing methods must be declared `public`.",
      ),
      q(
        "Which statement is true?",
        [
          "A class can implement several interfaces",
          "A class can extend several classes",
          "An interface can be instantiated with `new`",
          "Interfaces cannot have methods",
        ],
        0,
        "Multiple interfaces are allowed, but only one superclass.",
      ),
      q(
        "What does a `default` method in an interface provide?",
        [
          "A private constructor",
          "A method body, so implementing classes inherit it",
          "A way to hide the interface",
          "A static attribute",
        ],
        1,
        "A default method is an interface method that already has code.",
      ),
    ],
  },

  /* ====================================================================== */
  /*  MODULE 7: PUTTING IT TOGETHER                                          */
  /* ====================================================================== */
  {
    number: 20,
    slug: "the-four-pillars",
    title: "The Four Pillars Together",
    module: "Putting It Together",
    summary:
      "See encapsulation, inheritance, polymorphism, and abstraction work together.",
    minutes: 40,
    content: [
      p(
        "You have now met the four pillars of object-oriented programming. In real programs they work together. Here is a quick reminder of each one:",
      ),
      list(
        "Encapsulation: keep data `private` and expose it through methods that enforce the rules.",
        "Inheritance: let a subclass reuse and extend a superclass with `extends`.",
        "Polymorphism: call the same method on different objects and get behavior that fits each one.",
        "Abstraction: hide details behind abstract classes and interfaces.",
      ),
      p(
        "Let's build a small payroll model that uses all four. Put each class in its own file, or all of them in `Main.java`.",
      ),
      java(
        `abstract class Employee {
  private String name;             // Encapsulation: private data
  private double baseSalary;

  Employee(String name, double baseSalary) {
    this.name = name;
    this.baseSalary = baseSalary;
  }

  public String getName() { return name; }
  protected double getBaseSalary() { return baseSalary; }

  public abstract double monthlyPay();   // Abstraction: what, not how
}

class Manager extends Employee {         // Inheritance
  private double bonus;

  Manager(String name, double baseSalary, double bonus) {
    super(name, baseSalary);
    this.bonus = bonus;
  }

  @Override
  public double monthlyPay() {           // Polymorphism: own version
    return getBaseSalary() + bonus;
  }
}

class Developer extends Employee {
  Developer(String name, double baseSalary) {
    super(name, baseSalary);
  }

  @Override
  public double monthlyPay() {
    return getBaseSalary();
  }
}`,
        undefined,
        "Employee, Manager, and Developer",
      ),
      java(
        `public class Main {
  public static void main(String[] args) {
    Employee[] team = {
      new Manager("Mia", 4000, 800),
      new Developer("Leo", 3500)
    };

    for (Employee e : team) {
      System.out.println(e.getName() + ": " + e.monthlyPay());
    }
  }
}`,
        `Mia: 4800.0
Leo: 3500.0`,
      ),
      h("Where each pillar appears"),
      list(
        "Encapsulation: `name` and `baseSalary` are private, and the class decides how they are read.",
        "Inheritance: `Manager` and `Developer` extend `Employee` and reuse its attributes.",
        "Polymorphism: the loop calls `monthlyPay()` on every `Employee`, and each one answers in its own way.",
        "Abstraction: `Employee` declares `monthlyPay()` without implementing it, so every employee type must.",
      ),
      p(
        "Adding an `Intern` class later needs no change to the loop. That is the payoff of using the pillars together.",
      ),
      h("Common mistakes"),
      list(
        "Leaving attributes `public`, which defeats encapsulation.",
        "Using inheritance when the relationship is HAS-A, not IS-A.",
        "Building deep inheritance chains that are hard to follow.",
        "Forgetting `@Override`, so typos slip by silently.",
      ),
      note(
        "To practice, model something you know, like a school with `Student` and `Teacher`, or a shop with different kinds of `Product`. Ask yourself which pillar each decision uses.",
        "tip",
      ),
    ],
    takeaways: [
      "The four pillars: encapsulation, inheritance, polymorphism, and abstraction.",
      "They reinforce each other: private data, shared parents, flexible behavior, hidden details.",
      "Good OOP means using inheritance only for IS-A and keeping data private.",
    ],
    quiz: [
      q(
        "Making `name` private and adding `getName()` shows which pillar?",
        ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
        2,
        "Private data with controlled access is encapsulation.",
      ),
      q(
        "`class Manager extends Employee` demonstrates:",
        ["Inheritance", "Encapsulation", "Overloading", "Abstraction"],
        0,
        "`Manager` inherits from `Employee` with `extends`.",
      ),
      q(
        "A loop calls `monthlyPay()` on every `Employee`, and each object gives a different result. Which pillar is this?",
        ["Encapsulation", "Polymorphism", "Inheritance", "Constructors"],
        1,
        "The same call behaves differently depending on the actual object.",
      ),
      q(
        "`abstract double monthlyPay();` in `Employee` is an example of:",
        ["Overloading", "Encapsulation", "Casting", "Abstraction"],
        3,
        "It declares what must be done without saying how.",
      ),
      q(
        "You add a new `Intern` subclass. Which pillar lets the existing loop work without changes?",
        ["Polymorphism", "Encapsulation", "Syntax", "Casting"],
        0,
        "The loop only depends on `Employee`, so any new subclass just works.",
      ),
    ],
  },
];
