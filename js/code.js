/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Code Snippets
   Real code for the ultimate typing challenge
   ═══════════════════════════════════════════════════════════ */

const CODE_SNIPPETS = {
    javascript: [
        {
            code: `const fetchData = async (url) => {
    const response = await fetch(url);
    return response.json();
};`,
            language: 'JavaScript',
            difficulty: 'easy'
        },
        {
            code: `function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}`,
            language: 'JavaScript',
            difficulty: 'medium'
        },
        {
            code: `const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);`,
            language: 'JavaScript',
            difficulty: 'medium'
        },
        {
            code: `const deepClone = obj => JSON.parse(JSON.stringify(obj));`,
            language: 'JavaScript',
            difficulty: 'easy'
        },
        {
            code: `const unique = arr => [...new Set(arr)];`,
            language: 'JavaScript',
            difficulty: 'easy'
        },
        {
            code: `const flatten = arr => arr.reduce((flat, item) => 
    flat.concat(Array.isArray(item) ? flatten(item) : item), []);`,
            language: 'JavaScript',
            difficulty: 'medium'
        },
        {
            code: `class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(event, listener) {
        (this.events[event] ||= []).push(listener);
    }
    emit(event, ...args) {
        this.events[event]?.forEach(fn => fn(...args));
    }
}`,
            language: 'JavaScript',
            difficulty: 'hard'
        },
        {
            code: `const memoize = fn => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        return cache.get(key) ?? cache.set(key, fn(...args)).get(key);
    };
};`,
            language: 'JavaScript',
            difficulty: 'hard'
        }
    ],

    python: [
        {
            code: `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
            language: 'Python',
            difficulty: 'easy'
        },
        {
            code: `squares = [x**2 for x in range(10) if x % 2 == 0]`,
            language: 'Python',
            difficulty: 'easy'
        },
        {
            code: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`,
            language: 'Python',
            difficulty: 'hard'
        },
        {
            code: `from functools import reduce
product = reduce(lambda x, y: x * y, [1, 2, 3, 4, 5])`,
            language: 'Python',
            difficulty: 'medium'
        },
        {
            code: `class Singleton:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance`,
            language: 'Python',
            difficulty: 'medium'
        }
    ],

    rust: [
        {
            code: `fn main() {
    let numbers: Vec<i32> = (1..=10).collect();
    println!("{:?}", numbers);
}`,
            language: 'Rust',
            difficulty: 'easy'
        },
        {
            code: `fn factorial(n: u64) -> u64 {
    (1..=n).product()
}`,
            language: 'Rust',
            difficulty: 'easy'
        },
        {
            code: `impl<T> Option<T> {
    pub fn map<U, F>(self, f: F) -> Option<U>
    where F: FnOnce(T) -> U {
        match self {
            Some(x) => Some(f(x)),
            None => None,
        }
    }
}`,
            language: 'Rust',
            difficulty: 'hard'
        },
        {
            code: `let sum: i32 = vec![1, 2, 3, 4, 5]
    .iter()
    .filter(|x| *x % 2 == 0)
    .sum();`,
            language: 'Rust',
            difficulty: 'medium'
        }
    ],

    typescript: [
        {
            code: `interface User {
    id: number;
    name: string;
    email?: string;
}`,
            language: 'TypeScript',
            difficulty: 'easy'
        },
        {
            code: `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };`,
            language: 'TypeScript',
            difficulty: 'medium'
        },
        {
            code: `const identity = <T>(arg: T): T => arg;`,
            language: 'TypeScript',
            difficulty: 'easy'
        },
        {
            code: `type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};`,
            language: 'TypeScript',
            difficulty: 'hard'
        },
        {
            code: `function assertNever(x: never): never {
    throw new Error("Unexpected value: " + x);
}`,
            language: 'TypeScript',
            difficulty: 'medium'
        }
    ],

    go: [
        {
            code: `func main() {
    messages := make(chan string)
    go func() { messages <- "ping" }()
    msg := <-messages
    fmt.Println(msg)
}`,
            language: 'Go',
            difficulty: 'medium'
        },
        {
            code: `func reverse(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}`,
            language: 'Go',
            difficulty: 'medium'
        }
    ],

    css: [
        {
            code: `.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}`,
            language: 'CSS',
            difficulty: 'easy'
        },
        {
            code: `@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}`,
            language: 'CSS',
            difficulty: 'easy'
        },
        {
            code: `.card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}`,
            language: 'CSS',
            difficulty: 'medium'
        }
    ],

    sql: [
        {
            code: `SELECT users.name, COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
GROUP BY users.id
HAVING order_count > 5;`,
            language: 'SQL',
            difficulty: 'medium'
        },
        {
            code: `SELECT * FROM products WHERE price BETWEEN 10 AND 50 ORDER BY price DESC;`,
            language: 'SQL',
            difficulty: 'easy'
        }
    ]
};

// Code snippet utilities
const CodeGenerator = {
    // Get random snippet from a language
    getRandom(language = 'javascript') {
        const snippets = CODE_SNIPPETS[language] || CODE_SNIPPETS.javascript;
        return snippets[Math.floor(Math.random() * snippets.length)];
    },

    // Get snippet by difficulty
    getByDifficulty(difficulty = 'medium', language = null) {
        let allSnippets = [];
        
        if (language && CODE_SNIPPETS[language]) {
            allSnippets = CODE_SNIPPETS[language];
        } else {
            Object.values(CODE_SNIPPETS).forEach(snippets => {
                allSnippets = allSnippets.concat(snippets);
            });
        }
        
        const filtered = allSnippets.filter(s => s.difficulty === difficulty);
        return filtered.length > 0 
            ? filtered[Math.floor(Math.random() * filtered.length)]
            : allSnippets[Math.floor(Math.random() * allSnippets.length)];
    },

    // Get any random snippet
    getAny() {
        const languages = Object.keys(CODE_SNIPPETS);
        const language = languages[Math.floor(Math.random() * languages.length)];
        return this.getRandom(language);
    },

    // Get all available languages
    getLanguages() {
        return Object.keys(CODE_SNIPPETS);
    },

    // Format code for typing (preserve whitespace exactly)
    formatForTyping(code) {
        return code.trim();
    },

    // Split code into lines
    getLines(code) {
        return code.split('\n');
    }
};

