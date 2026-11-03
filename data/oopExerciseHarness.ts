// data/oopExerciseHarness.ts
// SERVER ONLY. Holds the Java test code (including hidden tests) per exercise.
// `String.raw` keeps Java backslashes literal. Avoid backticks and ${ in Java code.
import "server-only";

// Shared test helpers. Test results go to stderr as "@@TEST|..." lines so the
// student's own System.out.println output can never be confused with them.
const PRELUDE = String.raw`
final class __T {
    interface Body { void run() throws Throwable; }

    static String mode() {
        try {
            java.util.Scanner in = new java.util.Scanner(System.in);
            return in.hasNextLine() ? in.nextLine().trim() : "run";
        } catch (Throwable t) {
            return "run";
        }
    }

    static void test(String name, boolean hidden, String mode, Body body) {
        if (hidden && !"submit".equals(mode)) return;
        String status = "PASS";
        String msg = "";
        try {
            body.run();
        } catch (AssertionError e) {
            status = "FAIL";
            msg = String.valueOf(e.getMessage());
        } catch (Throwable t) {
            status = "FAIL";
            msg = t.getClass().getSimpleName() + (t.getMessage() != null ? ": " + t.getMessage() : "");
        }
        System.out.flush();
        System.err.println("\n@@TEST|" + (hidden ? "1" : "0") + "|" + status + "|" + clean(name) + "|" + clean(msg));
    }

    static String clean(String s) {
        return s.replace('|', '/').replaceAll("\\s+", " ").trim();
    }

    static void done() {
        System.out.flush();
        System.err.println("\n@@DONE");
    }

    static void eq(Object expected, Object actual) {
        if (!java.util.Objects.equals(expected, actual)) {
            throw new AssertionError("Expected " + expected + " but got " + actual);
        }
    }

    static void near(double expected, double actual) {
        if (Math.abs(expected - actual) > 1e-6) {
            throw new AssertionError("Expected " + expected + " but got " + actual);
        }
    }

    static void isTrue(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    static void throwsA(Class<? extends Throwable> type, Body body) {
        try {
            body.run();
        } catch (Throwable t) {
            if (type.isInstance(t)) return;
            throw new AssertionError("Expected " + type.getSimpleName() + " but got " + t.getClass().getSimpleName());
        }
        throw new AssertionError("Expected " + type.getSimpleName() + " but nothing was thrown");
    }
}
`;

const CLASSES_AND_OBJECTS = String.raw`
public class Main {
    public static void main(String[] args) {
        String mode = __T.mode();

        __T.test("Stores name and grade", false, mode, () -> {
            Student s = new Student("Ana", 88);
            __T.eq("Ana", s.getName());
            __T.eq(88, s.getGrade());
        });
        __T.test("A grade of 75 is passing", false, mode, () -> {
            __T.isTrue(new Student("Ben", 75).isPassing(), "75 should be passing");
        });
        __T.test("toString shows name and grade", false, mode, () -> {
            __T.eq("Ana (88)", new Student("Ana", 88).toString());
        });
        __T.test("A grade of 74 is not passing", true, mode, () -> {
            __T.isTrue(!new Student("Cy", 74).isPassing(), "74 should not be passing");
        });
        __T.test("Handles grades 0 and 100", true, mode, () -> {
            __T.isTrue(!new Student("Low", 0).isPassing(), "0 should not be passing");
            __T.isTrue(new Student("High", 100).isPassing(), "100 should be passing");
            __T.eq("High (100)", new Student("High", 100).toString());
        });
        __T.test("Each object keeps its own data", true, mode, () -> {
            Student a = new Student("Ana", 90);
            Student b = new Student("Ben", 60);
            __T.eq("Ana", a.getName());
            __T.eq("Ben", b.getName());
            __T.eq(90, a.getGrade());
            __T.eq(60, b.getGrade());
        });

        __T.done();
    }
}
`;

const ENCAPSULATION = String.raw`
public class Main {
    public static void main(String[] args) {
        String mode = __T.mode();

        __T.test("New account starts at 0", false, mode, () -> {
            BankAccount acc = new BankAccount("Ben");
            __T.eq("Ben", acc.getOwner());
            __T.near(0.0, acc.getBalance());
        });
        __T.test("Deposit adds to the balance", false, mode, () -> {
            BankAccount acc = new BankAccount("Ben");
            acc.deposit(100);
            acc.deposit(25.5);
            __T.near(125.5, acc.getBalance());
        });
        __T.test("Withdraw within the balance", false, mode, () -> {
            BankAccount acc = new BankAccount("Ben");
            acc.deposit(100);
            __T.isTrue(acc.withdraw(30), "withdraw(30) should return true");
            __T.near(70.0, acc.getBalance());
        });
        __T.test("Withdraw above the balance is refused", true, mode, () -> {
            BankAccount acc = new BankAccount("Ben");
            acc.deposit(50);
            __T.isTrue(!acc.withdraw(500), "withdraw(500) should return false");
            __T.near(50.0, acc.getBalance());
        });
        __T.test("Invalid deposits throw", true, mode, () -> {
            BankAccount acc = new BankAccount("Ben");
            __T.throwsA(IllegalArgumentException.class, () -> acc.deposit(0));
            __T.throwsA(IllegalArgumentException.class, () -> acc.deposit(-5));
            __T.near(0.0, acc.getBalance());
        });
        __T.test("Invalid withdrawals return false", true, mode, () -> {
            BankAccount acc = new BankAccount("Ben");
            acc.deposit(20);
            __T.isTrue(!acc.withdraw(0), "withdraw(0) should return false");
            __T.isTrue(!acc.withdraw(-10), "withdraw(-10) should return false");
            __T.near(20.0, acc.getBalance());
        });
        __T.test("Data is private", true, mode, () -> {
            java.lang.reflect.Field[] fields = BankAccount.class.getDeclaredFields();
            __T.isTrue(fields.length >= 2, "BankAccount should keep the owner and balance in fields");
            for (java.lang.reflect.Field f : fields) {
                __T.isTrue(java.lang.reflect.Modifier.isPrivate(f.getModifiers()),
                    "Field '" + f.getName() + "' should be private");
            }
        });

        __T.done();
    }
}
`;

const INHERITANCE = String.raw`
public class Main {
    public static void main(String[] args) {
        String mode = __T.mode();

        __T.test("Dog describes itself", false, mode, () -> {
            __T.eq("Rex says Woof", new Dog("Rex").describe());
        });
        __T.test("Cat describes itself", false, mode, () -> {
            __T.eq("Tom says Meow", new Cat("Tom").describe());
        });
        __T.test("A generic animal says ...", false, mode, () -> {
            __T.eq("Generic says ...", new Animal("Generic").describe());
        });
        __T.test("Works through an Animal reference", true, mode, () -> {
            Animal a = new Cat("Tom");
            Animal b = new Dog("Rex");
            __T.eq("Meow", a.speak());
            __T.eq("Woof", b.speak());
        });
        __T.test("Subclasses inherit the name", true, mode, () -> {
            __T.eq("Rex", new Dog("Rex").getName());
            __T.eq("Tom", new Cat("Tom").getName());
        });
        __T.test("describe() is not repeated in subclasses", true, mode, () -> {
            for (Class<?> c : new Class<?>[] { Dog.class, Cat.class }) {
                try {
                    c.getDeclaredMethod("describe");
                } catch (NoSuchMethodException ok) {
                    continue;
                }
                throw new AssertionError(c.getSimpleName() + " should reuse describe() from Animal instead of redefining it");
            }
        });

        __T.done();
    }
}
`;

const POLYMORPHISM = String.raw`
public class Main {
    public static void main(String[] args) {
        String mode = __T.mode();

        __T.test("Rectangle area", false, mode, () -> {
            __T.near(12.0, new Rectangle(3, 4).area());
        });
        __T.test("Circle area", false, mode, () -> {
            __T.near(Math.PI, new Circle(1).area());
        });
        __T.test("describe shows name and area", false, mode, () -> {
            __T.eq("Rectangle with area 12.00", new Rectangle(3, 4).describe());
            __T.eq("Circle with area 3.14", new Circle(1).describe());
        });
        __T.test("Total area of a mix of shapes", true, mode, () -> {
            Shape[] shapes = { new Circle(1), new Rectangle(3, 4), new Rectangle(1, 1) };
            __T.near(Math.PI + 13.0, ShapeUtils.totalArea(shapes));
        });
        __T.test("Empty array totals 0", true, mode, () -> {
            __T.near(0.0, ShapeUtils.totalArea(new Shape[0]));
        });
        __T.test("Shape.area() is abstract", true, mode, () -> {
            java.lang.reflect.Method m = Shape.class.getDeclaredMethod("area");
            __T.isTrue(java.lang.reflect.Modifier.isAbstract(m.getModifiers()), "Shape.area() should be abstract");
        });
        __T.test("Works for a brand new shape", true, mode, () -> {
            Shape custom = new Shape() {
                public double area() { return 5; }
            };
            __T.near(5.0, ShapeUtils.totalArea(new Shape[] { custom }));
        });

        __T.done();
    }
}
`;

// Keys must match the exercise slugs in data/oopExercises.ts.
const HARNESSES: Record<string, string> = {
  "classes-and-objects": CLASSES_AND_OBJECTS,
  encapsulation: ENCAPSULATION,
  inheritance: INHERITANCE,
  polymorphism: POLYMORPHISM,
};

export function getHarness(slug: string): string | undefined {
  const main = HARNESSES[slug];
  return main ? PRELUDE + main : undefined;
}
