// data/oopExercises.ts
// Public exercise data (safe to ship to the browser).
// The hidden tests live in data/oopExerciseHarness.ts, which is server-only.
//
// IMPORTANT: each `slug` must match a lesson slug in OOP_COURSE.
// Rename the slugs below to match your lessons, and shape each exercise
// around what that lesson's quiz assesses.

export type StarterFile = { name: string; content: string };

export type Difficulty = "Easy" | "Medium" | "Hard";
export type RunMode = "run" | "submit" | "program";

export type Exercise = {
  slug: string;
  title: string;
  /** One line shown on the lesson page card. */
  blurb: string;
  difficulty: Difficulty;
  minutes: number;
  concepts: string[];
  /** Paragraphs. Backticks render as inline code via <Inline />. */
  prompt: string[];
  requirements: string[];
  example: string;
  hints: string[];
  /** One file per class. A scratch Main.java is added by getStarterFiles(). */
  starterFiles: StarterFile[];
};

export type RunTest = {
  name: string;
  hidden: boolean;
  passed: boolean;
  /** Withheld for hidden tests. */
  message?: string;
};

export type RunResult = {
  verdict:
    | "finished"
    | "compile_error"
    | "runtime_error"
    | "timeout"
    | "incomplete"
    | "error";
  mode: RunMode;
  tests: RunTest[];
  stdout: string;
  stderr: string;
  compileOutput: string;
  message?: string;
  timeMs?: number;
  memoryKb?: number;
  saved?: boolean;
  alreadySaved?: boolean;
};

export const OOP_EXERCISES: Exercise[] = [
  {
    slug: "classes-and-objects",
    title: "Student record",
    blurb: "Model a student as a class, then ask it whether it is passing.",
    difficulty: "Easy",
    minutes: 10,
    concepts: ["Classes", "Objects", "Constructors", "Getters"],
    prompt: [
      "A teacher wants to track students in a program. Complete the `Student` class so each object remembers its own name and grade.",
      "A student is created with `new Student(name, grade)`. The grade is a whole number from 0 to 100.",
    ],
    requirements: [
      "Store the name and grade in `private` fields.",
      "Add `getName()` and `getGrade()` that return those values.",
      "`isPassing()` returns `true` when the grade is 75 or higher.",
      "`toString()` returns the name and grade like `Ana (88)`.",
    ],
    example: `Student ana = new Student("Ana", 88);
System.out.println(ana.getName());   // Ana
System.out.println(ana.isPassing()); // true
System.out.println(ana);             // Ana (88)`,
    hints: [
      "Fields go inside the class but outside every method. In the constructor, `this.name = name;` tells the field apart from the parameter.",
      "`isPassing()` can be one line: return the result of a comparison.",
      '`toString()` can join text with `+`, for example `name + " (" + grade + ")"`.',
    ],
    starterFiles: [
      {
        name: "Student.java",
        content: `public class Student {
    // TODO 1: add private fields for the name and the grade

    // TODO 2: store both values in the constructor
    public Student(String name, int grade) {
    }

    public String getName() {
        return null; // TODO 3
    }

    public int getGrade() {
        return 0; // TODO 3
    }

    public boolean isPassing() {
        return false; // TODO 4: passing means 75 or higher
    }

    @Override
    public String toString() {
        return ""; // TODO 5: format like "Ana (88)"
    }
}
`,
      },
    ],
  },
  {
    slug: "encapsulation",
    title: "Bank account",
    blurb: "Protect a balance so it only changes through safe methods.",
    difficulty: "Easy",
    minutes: 15,
    concepts: ["Encapsulation", "Private fields", "Validation"],
    prompt: [
      "Other parts of a banking app must never change a balance directly. Finish `BankAccount` so the only way to change the balance is through `deposit` and `withdraw`.",
      "A new account starts with a balance of 0.",
    ],
    requirements: [
      "Keep the owner and balance in `private` fields.",
      "`getOwner()` and `getBalance()` return them. Do not add setters.",
      "`deposit(amount)` adds to the balance. Throw an `IllegalArgumentException` when the amount is zero or negative.",
      "`withdraw(amount)` returns `true` and subtracts when the account has enough money. Otherwise it returns `false` and the balance stays the same.",
    ],
    example: `BankAccount acc = new BankAccount("Ben");
acc.deposit(100);
System.out.println(acc.withdraw(30));  // true
System.out.println(acc.withdraw(500)); // false
System.out.println(acc.getBalance());  // 70.0`,
    hints: [
      "Check the bad cases first and throw or return early.",
      '`throw new IllegalArgumentException("Amount must be positive");`',
      "A withdrawal of zero or a negative amount should also return `false`.",
    ],
    starterFiles: [
      {
        name: "BankAccount.java",
        content: `public class BankAccount {
    // TODO 1: add private fields for the owner and the balance

    public BankAccount(String owner) {
        // TODO 2: save the owner, start the balance at 0
    }

    public String getOwner() {
        return null; // TODO 3
    }

    public double getBalance() {
        return 0; // TODO 3
    }

    public void deposit(double amount) {
        // TODO 4: reject amounts of 0 or less, otherwise add to the balance
    }

    public boolean withdraw(double amount) {
        return false; // TODO 5
    }
}
`,
      },
    ],
  },
  {
    slug: "inheritance",
    title: "Animal sounds",
    blurb: "Share behavior in a parent class and override only what differs.",
    difficulty: "Medium",
    minutes: 15,
    concepts: ["Inheritance", "extends", "super", "Overriding"],
    prompt: [
      "`Animal` holds what every animal shares. `Dog` and `Cat` extend it and change only how they sound.",
      "Write the code so `describe()` exists once, in `Animal`, and works for every subclass.",
    ],
    requirements: [
      "`Animal` stores its name, and `getName()` returns it.",
      '`Animal.speak()` returns `"..."`.',
      "`Animal.describe()` returns `<name> says <sound>`, using `speak()`.",
      '`Dog` overrides `speak()` to return `"Woof"`. `Cat` returns `"Meow"`.',
      "Do not write `describe()` again inside `Dog` or `Cat`.",
    ],
    example: `Animal pet = new Dog("Rex");
System.out.println(pet.describe()); // Rex says Woof`,
    hints: [
      "Put `@Override` above `speak()` in the subclasses. The compiler will complain if the name or signature is wrong.",
      "Inside `describe()`, calling `speak()` runs the version that belongs to the real object.",
      "`Dog` and `Cat` already call `super(name)`, which hands the name to `Animal`'s constructor.",
    ],
    starterFiles: [
      {
        name: "Animal.java",
        content: `class Animal {
    // TODO 1: add a private field for the name

    public Animal(String name) {
        // TODO 1: store the name
    }

    public String getName() {
        return null; // TODO 1
    }

    public String speak() {
        return ""; // TODO 2: a generic animal says "..."
    }

    public String describe() {
        return ""; // TODO 3: "<name> says <sound>", built with speak()
    }
}
`,
      },
      {
        name: "Dog.java",
        content: `class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }

    // TODO 4: override speak() so a Dog says "Woof"
}
`,
      },
      {
        name: "Cat.java",
        content: `class Cat extends Animal {
    public Cat(String name) {
        super(name);
    }

    // TODO 5: override speak() so a Cat says "Meow"
}
`,
      },
    ],
  },
  {
    slug: "polymorphism",
    title: "Shapes and total area",
    blurb:
      "Treat different shapes the same way and let each one compute its own area.",
    difficulty: "Medium",
    minutes: 20,
    concepts: ["Abstract classes", "Polymorphism", "Overriding"],
    prompt: [
      "A drawing app keeps a list of shapes and needs their combined area. It should not care which kind of shape each one is.",
      "Make `Shape` abstract, give each shape its own `area()`, and finish a helper that works on any mix of shapes.",
    ],
    requirements: [
      "`Shape.area()` is abstract (no body).",
      "`Circle(radius)` and `Rectangle(width, height)` override `area()`. Use `Math.PI` for circles.",
      '`Shape.describe()` returns the class name and area with two decimals, like `Circle with area 3.14`. Try `getClass().getSimpleName()` and `String.format("%.2f", value)`.',
      "`ShapeUtils.totalArea(Shape[] shapes)` returns the sum of every area. An empty array gives `0`.",
    ],
    example: `Shape[] shapes = { new Circle(1), new Rectangle(3, 4) };
System.out.println(ShapeUtils.totalArea(shapes)); // 15.14159...
System.out.println(shapes[1].describe());         // Rectangle with area 12.00`,
    hints: [
      "An abstract method has no braces: `public abstract double area();`",
      "Loop over the array and add `shape.area()`. You never need to check the type.",
      "Keep each field `private` and set it in the constructor, like in earlier lessons.",
    ],
    starterFiles: [
      {
        name: "Shape.java",
        content: `abstract class Shape {
    public double area() {
        return 0; // TODO 1: turn this into an abstract method (no body)
    }

    public String describe() {
        return ""; // TODO 2: e.g. "Circle with area 3.14"
    }
}
`,
      },
      {
        name: "Circle.java",
        content: `class Circle extends Shape {
    // TODO 3: add a radius field, set it in the constructor, override area()
    public Circle(double radius) {
    }
}
`,
      },
      {
        name: "Rectangle.java",
        content: `class Rectangle extends Shape {
    // TODO 4: add width and height fields, set them in the constructor, override area()
    public Rectangle(double width, double height) {
    }
}
`,
      },
      {
        name: "ShapeUtils.java",
        content: `class ShapeUtils {
    public static double totalArea(Shape[] shapes) {
        return 0; // TODO 5: add up the area of every shape
    }
}
`,
      },
    ],
  },
];

export function getExercise(slug: string): Exercise | undefined {
  return OOP_EXERCISES.find((e) => e.slug === slug);
}

export const SCRATCH_FILE = "Main.java";

/** Main.java for "Run program": the exercise example wrapped in a main method. */
function scratchMain(example: string): StarterFile {
  const body = example
    .split("\n")
    .map((line) => (line ? `        ${line}` : line))
    .join("\n");
  return {
    name: SCRATCH_FILE,
    content: `public class Main {
    public static void main(String[] args) {
        // Try your classes here, then press "Run program".
${body}
    }
}
`,
  };
}

export function getStarterFiles(exercise: Exercise): StarterFile[] {
  return [...exercise.starterFiles, scratchMain(exercise.example)];
}
