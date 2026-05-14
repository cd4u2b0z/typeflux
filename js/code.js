/* ═══════════════════════════════════════════════════════════════
   TYPEFLUX — Code Snippets & Tips
   ─────────────────────────────────────────────────────────────
   Fifteen languages, real idioms, short enough to be typed in a
   single trial. Tips are language-specific marginalia rendered on
   the certificate after a code trial; typing tips are shown after
   words / quotes / zen trials.
   ═══════════════════════════════════════════════════════════════ */

const CODE_SNIPPETS = {
    /* ── javascript ─────────────────────────────────────────────── */
    javascript: [
        { language: 'JavaScript', difficulty: 'easy',   code: `const unique = arr => [...new Set(arr)];` },
        { language: 'JavaScript', difficulty: 'easy',   code: `const sleep = ms => new Promise(r => setTimeout(r, ms));` },
        { language: 'JavaScript', difficulty: 'easy',   code: `const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);` },
        { language: 'JavaScript', difficulty: 'easy',   code: `const range = (n) => [...Array(n).keys()];` },
        { language: 'JavaScript', difficulty: 'medium', code: `const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);` },
        { language: 'JavaScript', difficulty: 'medium', code: `const groupBy = (arr, key) =>
    arr.reduce((acc, x) => ({ ...acc, [x[key]]: [...(acc[x[key]] ?? []), x] }), {});` },
        { language: 'JavaScript', difficulty: 'medium', code: `function debounce(fn, ms) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}` },
        { language: 'JavaScript', difficulty: 'medium', code: `const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
};` },
        { language: 'JavaScript', difficulty: 'hard',   code: `const memoize = fn => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const out = fn(...args);
        cache.set(key, out);
        return out;
    };
};` },
        { language: 'JavaScript', difficulty: 'hard',   code: `class EventBus {
    #subs = new Map();
    on(event, fn) {
        (this.#subs.get(event) ?? this.#subs.set(event, new Set()).get(event)).add(fn);
        return () => this.#subs.get(event)?.delete(fn);
    }
    emit(event, payload) {
        this.#subs.get(event)?.forEach(fn => fn(payload));
    }
}` },
        { language: 'JavaScript', difficulty: 'hard',   code: `function* take(iter, n) {
    let i = 0;
    for (const x of iter) {
        if (i++ >= n) return;
        yield x;
    }
}` },
        { language: 'JavaScript', difficulty: 'medium', code: `const partition = (arr, pred) =>
    arr.reduce(([yes, no], x) => pred(x) ? [[...yes, x], no] : [yes, [...no, x]], [[], []]);` }
    ],

    /* ── typescript ─────────────────────────────────────────────── */
    typescript: [
        { language: 'TypeScript', difficulty: 'easy',   code: `type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };` },
        { language: 'TypeScript', difficulty: 'easy',   code: `const isNumber = (x: unknown): x is number => typeof x === 'number';` },
        { language: 'TypeScript', difficulty: 'easy',   code: `type Nullable<T> = T | null | undefined;` },
        { language: 'TypeScript', difficulty: 'medium', code: `interface User {
    id: number;
    name: string;
    email?: string;
}

const greet = (u: User): string => \`hello, \${u.name}\`;` },
        { language: 'TypeScript', difficulty: 'medium', code: `function assertNever(x: never): never {
    throw new Error(\`unhandled case: \${JSON.stringify(x)}\`);
}` },
        { language: 'TypeScript', difficulty: 'medium', code: `type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};` },
        { language: 'TypeScript', difficulty: 'hard',   code: `type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<number, 'UserId'>;
const asUserId = (n: number): UserId => n as UserId;` },
        { language: 'TypeScript', difficulty: 'hard',   code: `class Cache<K, V> {
    private store = new Map<K, V>();
    get(key: K): V | undefined { return this.store.get(key); }
    set(key: K, value: V): this { this.store.set(key, value); return this; }
    delete(key: K): boolean { return this.store.delete(key); }
}` },
        { language: 'TypeScript', difficulty: 'medium', code: `const tryParse = <T>(json: string): T | null => {
    try { return JSON.parse(json) as T; }
    catch { return null; }
};` },
        { language: 'TypeScript', difficulty: 'hard',   code: `type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;` },
        { language: 'TypeScript', difficulty: 'easy',   code: `enum Status { Idle, Loading, Ready, Failed }
const isTerminal = (s: Status) => s === Status.Ready || s === Status.Failed;` },
        { language: 'TypeScript', difficulty: 'medium', code: `const omit = <T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> => {
    const { [key]: _, ...rest } = obj;
    return rest;
};` }
    ],

    /* ── python ─────────────────────────────────────────────────── */
    python: [
        { language: 'Python', difficulty: 'easy',   code: `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a` },
        { language: 'Python', difficulty: 'easy',   code: `squares = [x * x for x in range(10) if x % 2 == 0]` },
        { language: 'Python', difficulty: 'easy',   code: `def chunked(seq, n):
    return [seq[i:i+n] for i in range(0, len(seq), n)]` },
        { language: 'Python', difficulty: 'easy',   code: `from collections import Counter
def most_common(text, n=3):
    return Counter(text.split()).most_common(n)` },
        { language: 'Python', difficulty: 'medium', code: `from contextlib import contextmanager

@contextmanager
def timed(label):
    import time
    start = time.perf_counter()
    yield
    print(f"{label}: {time.perf_counter() - start:.3f}s")` },
        { language: 'Python', difficulty: 'medium', code: `def memoize(fn):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]
    return wrapper` },
        { language: 'Python', difficulty: 'medium', code: `from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float
    def distance(self, other):
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5` },
        { language: 'Python', difficulty: 'medium', code: `async def fetch_all(urls):
    import aiohttp, asyncio
    async with aiohttp.ClientSession() as s:
        return await asyncio.gather(*(s.get(u) for u in urls))` },
        { language: 'Python', difficulty: 'hard',   code: `def quicksort(xs):
    if len(xs) <= 1:
        return xs
    pivot = xs[len(xs) // 2]
    lo = [x for x in xs if x < pivot]
    eq = [x for x in xs if x == pivot]
    hi = [x for x in xs if x > pivot]
    return quicksort(lo) + eq + quicksort(hi)` },
        { language: 'Python', difficulty: 'hard',   code: `class LRUCache:
    def __init__(self, capacity):
        from collections import OrderedDict
        self.cache = OrderedDict()
        self.capacity = capacity
    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]` },
        { language: 'Python', difficulty: 'easy',   code: `with open('data.txt', 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f if line.strip()]` },
        { language: 'Python', difficulty: 'medium', code: `def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item` }
    ],

    /* ── rust ───────────────────────────────────────────────────── */
    rust: [
        { language: 'Rust', difficulty: 'easy',   code: `fn fib(n: u32) -> u64 {
    let (mut a, mut b) = (0u64, 1u64);
    for _ in 0..n { let t = a + b; a = b; b = t; }
    a
}` },
        { language: 'Rust', difficulty: 'easy',   code: `let evens: Vec<i32> = (0..20).filter(|n| n % 2 == 0).collect();` },
        { language: 'Rust', difficulty: 'easy',   code: `fn greet(name: &str) -> String {
    format!("hello, {}!", name)
}` },
        { language: 'Rust', difficulty: 'medium', code: `enum Shape {
    Circle(f64),
    Rect(f64, f64),
}

impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle(r) => std::f64::consts::PI * r * r,
            Shape::Rect(w, h) => w * h,
        }
    }
}` },
        { language: 'Rust', difficulty: 'medium', code: `fn parse_port(s: &str) -> Result<u16, String> {
    s.parse::<u16>().map_err(|e| format!("bad port {}: {}", s, e))
}` },
        { language: 'Rust', difficulty: 'medium', code: `use std::collections::HashMap;

fn word_count(text: &str) -> HashMap<&str, usize> {
    let mut counts = HashMap::new();
    for w in text.split_whitespace() {
        *counts.entry(w).or_insert(0) += 1;
    }
    counts
}` },
        { language: 'Rust', difficulty: 'medium', code: `trait Speak {
    fn speak(&self) -> String;
}

impl Speak for &str {
    fn speak(&self) -> String { format!("the page says: {}", self) }
}` },
        { language: 'Rust', difficulty: 'hard',   code: `use std::sync::Arc;
use std::sync::Mutex;

fn shared_counter() -> Arc<Mutex<u64>> {
    Arc::new(Mutex::new(0))
}` },
        { language: 'Rust', difficulty: 'hard',   code: `async fn fetch_json(url: &str) -> Result<serde_json::Value, reqwest::Error> {
    let body = reqwest::get(url).await?.text().await?;
    Ok(serde_json::from_str(&body).unwrap())
}` },
        { language: 'Rust', difficulty: 'easy',   code: `let nums = vec![1, 2, 3, 4, 5];
let sum: i32 = nums.iter().sum();
let max = nums.iter().max().copied().unwrap_or(0);` },
        { language: 'Rust', difficulty: 'medium', code: `fn safe_div(a: i64, b: i64) -> Option<i64> {
    if b == 0 { None } else { Some(a / b) }
}` },
        { language: 'Rust', difficulty: 'hard',   code: `#[derive(Debug, Clone)]
struct Node<T> {
    value: T,
    next: Option<Box<Node<T>>>,
}

impl<T> Node<T> {
    fn new(value: T) -> Self { Self { value, next: None } }
}` }
    ],

    /* ── go ─────────────────────────────────────────────────────── */
    go: [
        { language: 'Go', difficulty: 'easy',   code: `func reverse(s string) string {
    r := []rune(s)
    for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
        r[i], r[j] = r[j], r[i]
    }
    return string(r)
}` },
        { language: 'Go', difficulty: 'easy',   code: `type Point struct{ X, Y float64 }

func (p Point) Distance(q Point) float64 {
    return math.Hypot(p.X-q.X, p.Y-q.Y)
}` },
        { language: 'Go', difficulty: 'medium', code: `func fanIn(chs ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    for _, ch := range chs {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for v := range c { out <- v }
        }(ch)
    }
    go func() { wg.Wait(); close(out) }()
    return out
}` },
        { language: 'Go', difficulty: 'medium', code: `func mustOpen(path string) *os.File {
    f, err := os.Open(path)
    if err != nil { log.Fatal(err) }
    return f
}` },
        { language: 'Go', difficulty: 'medium', code: `type Cache struct {
    mu   sync.RWMutex
    data map[string]string
}

func (c *Cache) Get(k string) (string, bool) {
    c.mu.RLock(); defer c.mu.RUnlock()
    v, ok := c.data[k]
    return v, ok
}` },
        { language: 'Go', difficulty: 'hard',   code: `func worker(jobs <-chan int, results chan<- int) {
    for j := range jobs {
        time.Sleep(time.Second)
        results <- j * 2
    }
}` },
        { language: 'Go', difficulty: 'easy',   code: `func sum(xs []int) int {
    total := 0
    for _, x := range xs { total += x }
    return total
}` },
        { language: 'Go', difficulty: 'medium', code: `func handler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "only GET", http.StatusMethodNotAllowed)
        return
    }
    fmt.Fprintln(w, "ok")
}` },
        { language: 'Go', difficulty: 'medium', code: `type Result[T any] struct {
    Value T
    Err   error
}

func Ok[T any](v T) Result[T] { return Result[T]{Value: v} }` },
        { language: 'Go', difficulty: 'easy',   code: `defer func() {
    if r := recover(); r != nil {
        log.Printf("recovered: %v", r)
    }
}()` },
        { language: 'Go', difficulty: 'medium', code: `ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
result, err := slowOp(ctx)` },
        { language: 'Go', difficulty: 'easy',   code: `func main() {
    ch := make(chan string)
    go func() { ch <- "hello" }()
    fmt.Println(<-ch)
}` }
    ],

    /* ── c ──────────────────────────────────────────────────────── */
    c: [
        { language: 'C', difficulty: 'easy',   code: `int strlen(const char *s) {
    int n = 0;
    while (*s++) n++;
    return n;
}` },
        { language: 'C', difficulty: 'easy',   code: `void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}` },
        { language: 'C', difficulty: 'easy',   code: `#include <stdio.h>

int main(void) {
    printf("hello, world\\n");
    return 0;
}` },
        { language: 'C', difficulty: 'medium', code: `typedef struct Node {
    int value;
    struct Node *next;
} Node;

Node *node_new(int v) {
    Node *n = malloc(sizeof *n);
    n->value = v;
    n->next = NULL;
    return n;
}` },
        { language: 'C', difficulty: 'medium', code: `int max(int a, int b) {
    return a > b ? a : b;
}

int max3(int a, int b, int c) {
    return max(max(a, b), c);
}` },
        { language: 'C', difficulty: 'medium', code: `void *xmalloc(size_t n) {
    void *p = malloc(n);
    if (!p) { perror("malloc"); exit(1); }
    return p;
}` },
        { language: 'C', difficulty: 'hard',   code: `int binary_search(const int *xs, int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (xs[mid] == target) return mid;
        if (xs[mid] <  target) lo = mid + 1;
        else                   hi = mid - 1;
    }
    return -1;
}` },
        { language: 'C', difficulty: 'medium', code: `for (int i = 0; i < n; i++) {
    if (arr[i] < 0) continue;
    sum += arr[i];
}` },
        { language: 'C', difficulty: 'hard',   code: `enum { MAX_BUF = 1024 };

char buf[MAX_BUF];
ssize_t n = read(fd, buf, sizeof buf - 1);
if (n < 0) { perror("read"); return -1; }
buf[n] = '\\0';` },
        { language: 'C', difficulty: 'easy',   code: `#define ARRAY_LEN(a) (sizeof(a) / sizeof((a)[0]))` },
        { language: 'C', difficulty: 'medium', code: `FILE *f = fopen(path, "r");
if (!f) { perror(path); return 1; }
char line[256];
while (fgets(line, sizeof line, f)) {
    fputs(line, stdout);
}
fclose(f);` },
        { language: 'C', difficulty: 'hard',   code: `void *thread_main(void *arg) {
    int *id = arg;
    printf("thread %d running\\n", *id);
    return NULL;
}` }
    ],

    /* ── cpp ────────────────────────────────────────────────────── */
    cpp: [
        { language: 'C++', difficulty: 'easy',   code: `#include <iostream>

int main() {
    std::cout << "hello, world\\n";
    return 0;
}` },
        { language: 'C++', difficulty: 'easy',   code: `auto square = [](int x) { return x * x; };
auto sum = [&](int a, int b) { return a + b; };` },
        { language: 'C++', difficulty: 'medium', code: `template <typename T>
T clamp(T value, T lo, T hi) {
    return value < lo ? lo : (value > hi ? hi : value);
}` },
        { language: 'C++', difficulty: 'medium', code: `class Point {
    double x_, y_;
public:
    Point(double x, double y) : x_(x), y_(y) {}
    double distance(const Point &o) const {
        return std::hypot(x_ - o.x_, y_ - o.y_);
    }
};` },
        { language: 'C++', difficulty: 'medium', code: `std::vector<int> v{5, 3, 8, 1, 4};
std::sort(v.begin(), v.end());
auto it = std::find(v.begin(), v.end(), 4);` },
        { language: 'C++', difficulty: 'hard',   code: `template <typename... Args>
auto sum(Args... args) {
    return (args + ...);
}` },
        { language: 'C++', difficulty: 'medium', code: `auto ptr = std::make_unique<std::string>("vellum");
std::cout << *ptr << "\\n";` },
        { language: 'C++', difficulty: 'hard',   code: `class FileHandle {
    std::FILE *f_;
public:
    explicit FileHandle(const char *path) : f_(std::fopen(path, "r")) {}
    ~FileHandle() { if (f_) std::fclose(f_); }
    FileHandle(const FileHandle &) = delete;
    FileHandle &operator=(const FileHandle &) = delete;
};` },
        { language: 'C++', difficulty: 'medium', code: `std::map<std::string, int> counts;
for (const auto &word : words) {
    ++counts[word];
}` },
        { language: 'C++', difficulty: 'easy',   code: `for (const auto &x : xs) {
    std::cout << x << " ";
}
std::cout << "\\n";` },
        { language: 'C++', difficulty: 'medium', code: `std::optional<int> safe_div(int a, int b) {
    if (b == 0) return std::nullopt;
    return a / b;
}` },
        { language: 'C++', difficulty: 'hard',   code: `template <typename T>
concept Numeric = std::integral<T> || std::floating_point<T>;

template <Numeric T>
T add(T a, T b) { return a + b; }` }
    ],

    /* ── zig ────────────────────────────────────────────────────── */
    zig: [
        { language: 'Zig', difficulty: 'easy',   code: `const std = @import("std");

pub fn main() !void {
    const out = std.io.getStdOut().writer();
    try out.print("hello, {s}\\n", .{"world"});
}` },
        { language: 'Zig', difficulty: 'easy',   code: `fn add(a: i32, b: i32) i32 {
    return a + b;
}` },
        { language: 'Zig', difficulty: 'medium', code: `fn divide(a: i32, b: i32) !i32 {
    if (b == 0) return error.DivideByZero;
    return @divTrunc(a, b);
}` },
        { language: 'Zig', difficulty: 'medium', code: `const Point = struct {
    x: f32,
    y: f32,
    pub fn distance(self: Point, other: Point) f32 {
        return @sqrt((self.x - other.x) * (self.x - other.x) + (self.y - other.y) * (self.y - other.y));
    }
};` },
        { language: 'Zig', difficulty: 'medium', code: `var list = std.ArrayList(i32).init(allocator);
defer list.deinit();
try list.append(42);
try list.append(99);` },
        { language: 'Zig', difficulty: 'hard',   code: `fn fib(n: u32) u64 {
    var a: u64 = 0;
    var b: u64 = 1;
    var i: u32 = 0;
    while (i < n) : (i += 1) {
        const t = a + b;
        a = b;
        b = t;
    }
    return a;
}` },
        { language: 'Zig', difficulty: 'medium', code: `const Color = enum { red, green, blue };
const c: Color = .green;
switch (c) {
    .red => std.debug.print("warm\\n", .{}),
    .green, .blue => std.debug.print("cool\\n", .{}),
}` },
        { language: 'Zig', difficulty: 'hard',   code: `fn parseInt(s: []const u8) !i64 {
    return std.fmt.parseInt(i64, s, 10);
}` },
        { language: 'Zig', difficulty: 'easy',   code: `const n: i32 = 42;
const ptr: *const i32 = &n;
std.debug.print("value: {d}\\n", .{ptr.*});` },
        { language: 'Zig', difficulty: 'medium', code: `test "addition works" {
    try std.testing.expectEqual(@as(i32, 4), add(2, 2));
}` },
        { language: 'Zig', difficulty: 'medium', code: `const buf = try allocator.alloc(u8, 1024);
defer allocator.free(buf);` },
        { language: 'Zig', difficulty: 'hard',   code: `fn maybeFail(flag: bool) error{Failed}!void {
    if (flag) return error.Failed;
}` }
    ],

    /* ── ruby ───────────────────────────────────────────────────── */
    ruby: [
        { language: 'Ruby', difficulty: 'easy',   code: `def fib(n)
  a, b = 0, 1
  n.times { a, b = b, a + b }
  a
end` },
        { language: 'Ruby', difficulty: 'easy',   code: `evens = (1..20).select(&:even?)
squared = evens.map { |n| n ** 2 }` },
        { language: 'Ruby', difficulty: 'easy',   code: `class Greeter
  def initialize(name)
    @name = name
  end

  def greet
    "hello, #{@name}!"
  end
end` },
        { language: 'Ruby', difficulty: 'medium', code: `module Memoizable
  def memoize(method_name)
    original = instance_method(method_name)
    cache = {}
    define_method(method_name) do |*args|
      cache[args] ||= original.bind(self).call(*args)
    end
  end
end` },
        { language: 'Ruby', difficulty: 'medium', code: `users.group_by(&:role).transform_values(&:count)` },
        { language: 'Ruby', difficulty: 'medium', code: `class Stack
  def initialize
    @items = []
  end

  def push(x); @items.push(x); self; end
  def pop;     @items.pop; end
  def peek;    @items.last; end
end` },
        { language: 'Ruby', difficulty: 'hard',   code: `def with_retries(times: 3)
  attempts = 0
  begin
    yield
  rescue StandardError => e
    attempts += 1
    retry if attempts < times
    raise e
  end
end` },
        { language: 'Ruby', difficulty: 'easy',   code: `["a", "b", "c"].each_with_index do |c, i|
  puts "#{i}: #{c}"
end` },
        { language: 'Ruby', difficulty: 'medium', code: `def fetch_json(url)
  require 'net/http'
  require 'json'
  JSON.parse(Net::HTTP.get(URI(url)))
end` },
        { language: 'Ruby', difficulty: 'medium', code: `Person = Struct.new(:name, :age) do
  def adult?
    age >= 18
  end
end` },
        { language: 'Ruby', difficulty: 'easy',   code: `name = "world"
puts "hello, #{name}!"` },
        { language: 'Ruby', difficulty: 'hard',   code: `class LazyList
  include Enumerable
  def initialize(&block)
    @block = block
  end
  def each(&blk)
    @block.call(blk)
  end
end` }
    ],

    /* ── lua ────────────────────────────────────────────────────── */
    lua: [
        { language: 'Lua', difficulty: 'easy',   code: `local function fib(n)
    local a, b = 0, 1
    for _ = 1, n do
        a, b = b, a + b
    end
    return a
end` },
        { language: 'Lua', difficulty: 'easy',   code: `local t = { 1, 2, 3, 4, 5 }
for i, v in ipairs(t) do
    print(i, v)
end` },
        { language: 'Lua', difficulty: 'easy',   code: `local function greet(name)
    return string.format("hello, %s!", name)
end` },
        { language: 'Lua', difficulty: 'medium', code: `local Counter = {}
Counter.__index = Counter

function Counter.new()
    return setmetatable({ count = 0 }, Counter)
end

function Counter:tick()
    self.count = self.count + 1
end` },
        { language: 'Lua', difficulty: 'medium', code: `local function map(t, fn)
    local out = {}
    for i, v in ipairs(t) do
        out[i] = fn(v)
    end
    return out
end` },
        { language: 'Lua', difficulty: 'medium', code: `local function safe_call(fn, ...)
    local ok, result = pcall(fn, ...)
    if ok then return result end
    return nil, result
end` },
        { language: 'Lua', difficulty: 'easy',   code: `local config = {
    host = "localhost",
    port = 8080,
    debug = true,
}` },
        { language: 'Lua', difficulty: 'medium', code: `local co = coroutine.create(function()
    for i = 1, 3 do
        coroutine.yield(i)
    end
end)

print(coroutine.resume(co))` },
        { language: 'Lua', difficulty: 'hard',   code: `local function memoize(fn)
    local cache = {}
    return function(x)
        if cache[x] == nil then
            cache[x] = fn(x)
        end
        return cache[x]
    end
end` },
        { language: 'Lua', difficulty: 'easy',   code: `local s = "hello, world"
print(string.upper(s))
print(#s)` },
        { language: 'Lua', difficulty: 'medium', code: `local M = {}
function M.add(a, b) return a + b end
function M.mul(a, b) return a * b end
return M` },
        { language: 'Lua', difficulty: 'medium', code: `local file = io.open("data.txt", "r")
if file then
    for line in file:lines() do
        print(line)
    end
    file:close()
end` }
    ],

    /* ── bash ───────────────────────────────────────────────────── */
    bash: [
        { language: 'Bash', difficulty: 'easy',   code: `#!/usr/bin/env bash
set -euo pipefail
echo "hello, $USER"` },
        { language: 'Bash', difficulty: 'easy',   code: `for f in *.log; do
    [ -f "$f" ] || continue
    echo "found: $f"
done` },
        { language: 'Bash', difficulty: 'easy',   code: `if [ -d "$HOME/projects" ]; then
    cd "$HOME/projects"
fi` },
        { language: 'Bash', difficulty: 'medium', code: `count_lines() {
    local file="$1"
    wc -l < "$file" | tr -d ' '
}` },
        { language: 'Bash', difficulty: 'medium', code: `while IFS= read -r line; do
    echo "[line] $line"
done < input.txt` },
        { language: 'Bash', difficulty: 'medium', code: `usage() {
    cat <<EOF
usage: $(basename "$0") [-v] [-h] FILE
  -v   verbose output
  -h   show this help
EOF
}` },
        { language: 'Bash', difficulty: 'easy',   code: `find . -type f -name "*.tmp" -delete` },
        { language: 'Bash', difficulty: 'medium', code: `if ! command -v rg >/dev/null 2>&1; then
    echo "ripgrep not installed" >&2
    exit 1
fi` },
        { language: 'Bash', difficulty: 'hard',   code: `trap 'echo "interrupted"; exit 130' INT TERM

for i in {1..10}; do
    echo "step $i"
    sleep 1
done` },
        { language: 'Bash', difficulty: 'easy',   code: `name="\${1:-stranger}"
echo "hello, $name"` },
        { language: 'Bash', difficulty: 'medium', code: `result=$(curl -s "https://example.com/api" | jq '.value')
echo "got: $result"` },
        { language: 'Bash', difficulty: 'medium', code: `case "$1" in
    start) echo "starting"  ;;
    stop)  echo "stopping"  ;;
    *)     echo "usage: start|stop"; exit 1 ;;
esac` }
    ],

    /* ── sql ────────────────────────────────────────────────────── */
    sql: [
        { language: 'SQL', difficulty: 'easy',   code: `SELECT name, email FROM users WHERE active = TRUE ORDER BY created_at DESC LIMIT 10;` },
        { language: 'SQL', difficulty: 'easy',   code: `INSERT INTO posts (title, body, author_id)
VALUES ('the field', 'set thy hand to it', 1);` },
        { language: 'SQL', difficulty: 'easy',   code: `UPDATE products SET price = price * 1.1 WHERE category = 'books';` },
        { language: 'SQL', difficulty: 'medium', code: `CREATE TABLE trials (
    id          SERIAL PRIMARY KEY,
    wpm         INTEGER NOT NULL,
    accuracy    NUMERIC(5,2) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);` },
        { language: 'SQL', difficulty: 'medium', code: `SELECT u.name, COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.author_id = u.id
GROUP BY u.id, u.name
HAVING COUNT(p.id) > 5;` },
        { language: 'SQL', difficulty: 'medium', code: `WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY wpm DESC) AS rn
    FROM trials
)
SELECT * FROM ranked WHERE rn = 1;` },
        { language: 'SQL', difficulty: 'hard',   code: `SELECT
    DATE_TRUNC('day', created_at) AS day,
    AVG(wpm)  AS mean_wpm,
    MAX(wpm)  AS best_wpm
FROM trials
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day;` },
        { language: 'SQL', difficulty: 'medium', code: `CREATE INDEX idx_trials_user_created ON trials (user_id, created_at DESC);` },
        { language: 'SQL', difficulty: 'easy',   code: `DELETE FROM sessions WHERE expires_at < NOW();` },
        { language: 'SQL', difficulty: 'medium', code: `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;` },
        { language: 'SQL', difficulty: 'hard',   code: `SELECT u.name FROM users u
WHERE EXISTS (
    SELECT 1 FROM trials t
    WHERE t.user_id = u.id AND t.wpm > 100
);` },
        { language: 'SQL', difficulty: 'medium', code: `SELECT name, COALESCE(nickname, name) AS display_name FROM users;` }
    ],

    /* ── haskell ────────────────────────────────────────────────── */
    haskell: [
        { language: 'Haskell', difficulty: 'easy',   code: `factorial :: Integer -> Integer
factorial 0 = 1
factorial n = n * factorial (n - 1)` },
        { language: 'Haskell', difficulty: 'easy',   code: `doubles :: [Int] -> [Int]
doubles = map (*2)` },
        { language: 'Haskell', difficulty: 'easy',   code: `greet :: String -> String
greet name = "hello, " ++ name ++ "!"` },
        { language: 'Haskell', difficulty: 'medium', code: `quicksort :: Ord a => [a] -> [a]
quicksort []     = []
quicksort (x:xs) = quicksort smaller ++ [x] ++ quicksort larger
  where
    smaller = [a | a <- xs, a <= x]
    larger  = [a | a <- xs, a >  x]` },
        { language: 'Haskell', difficulty: 'medium', code: `data Shape = Circle Double | Rect Double Double

area :: Shape -> Double
area (Circle r)  = pi * r * r
area (Rect w h)  = w * h` },
        { language: 'Haskell', difficulty: 'medium', code: `safeDiv :: Int -> Int -> Maybe Int
safeDiv _ 0 = Nothing
safeDiv a b = Just (a \`div\` b)` },
        { language: 'Haskell', difficulty: 'hard',   code: `fibs :: [Integer]
fibs = 0 : 1 : zipWith (+) fibs (tail fibs)` },
        { language: 'Haskell', difficulty: 'medium', code: `import Data.List (sort, group)

frequencies :: Ord a => [a] -> [(a, Int)]
frequencies = map (\\g -> (head g, length g)) . group . sort` },
        { language: 'Haskell', difficulty: 'hard',   code: `newtype State s a = State { runState :: s -> (a, s) }

instance Functor (State s) where
  fmap f (State g) = State $ \\s -> let (a, s') = g s in (f a, s')` },
        { language: 'Haskell', difficulty: 'easy',   code: `main :: IO ()
main = do
  putStrLn "what is your name?"
  name <- getLine
  putStrLn $ "hello, " ++ name` },
        { language: 'Haskell', difficulty: 'medium', code: `compose :: (b -> c) -> (a -> b) -> a -> c
compose f g x = f (g x)` },
        { language: 'Haskell', difficulty: 'medium', code: `data Tree a = Leaf | Node (Tree a) a (Tree a)

insert :: Ord a => a -> Tree a -> Tree a
insert x Leaf = Node Leaf x Leaf
insert x t@(Node l v r)
  | x < v     = Node (insert x l) v r
  | x > v     = Node l v (insert x r)
  | otherwise = t` }
    ],

    /* ── html ───────────────────────────────────────────────────── */
    html: [
        { language: 'HTML', difficulty: 'easy', code: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>page</title></head>
<body><h1>hello, world</h1></body>
</html>` },
        { language: 'HTML', difficulty: 'easy', code: `<a href="https://example.com" target="_blank" rel="noopener noreferrer">visit example</a>` },
        { language: 'HTML', difficulty: 'easy', code: `<img src="vellum.jpg" alt="A folio of vellum, lit from above" loading="lazy" width="800" height="600">` },
        { language: 'HTML', difficulty: 'medium', code: `<form action="/submit" method="post">
    <label for="name">name</label>
    <input id="name" name="name" type="text" required>
    <button type="submit">send</button>
</form>` },
        { language: 'HTML', difficulty: 'medium', code: `<nav aria-label="primary">
    <ul>
        <li><a href="/">home</a></li>
        <li><a href="/ledger">the ledger</a></li>
        <li><a href="/desk">the desk</a></li>
    </ul>
</nav>` },
        { language: 'HTML', difficulty: 'medium', code: `<details>
    <summary>read more</summary>
    <p>Here lies the additional matter, kept folded until called.</p>
</details>` },
        { language: 'HTML', difficulty: 'easy', code: `<table>
    <thead><tr><th>grade</th><th>score</th></tr></thead>
    <tbody>
        <tr><td>S+</td><td>100+</td></tr>
        <tr><td>S</td><td>80–99</td></tr>
    </tbody>
</table>` },
        { language: 'HTML', difficulty: 'medium', code: `<picture>
    <source srcset="hero.avif" type="image/avif">
    <source srcset="hero.webp" type="image/webp">
    <img src="hero.jpg" alt="The frontispiece">
</picture>` },
        { language: 'HTML', difficulty: 'medium', code: `<button type="button" aria-pressed="false" data-action="toggle">
    <span class="icon" aria-hidden="true">◐</span>
    <span class="label">toggle palette</span>
</button>` },
        { language: 'HTML', difficulty: 'easy', code: `<dialog id="confirm">
    <p>Strike all from the record?</p>
    <form method="dialog">
        <button value="cancel">cancel</button>
        <button value="ok">strike</button>
    </form>
</dialog>` },
        { language: 'HTML', difficulty: 'medium', code: `<meta name="description" content="A typing trial in the manner of an engraved manuscript.">
<meta property="og:title" content="typeflux">
<meta property="og:image" content="/og.png">` },
        { language: 'HTML', difficulty: 'easy', code: `<article>
    <header><h2>Plate I — The Field</h2></header>
    <p>In which the typewright is set to his work.</p>
</article>` }
    ],

    /* ── css ────────────────────────────────────────────────────── */
    css: [
        { language: 'CSS', difficulty: 'easy', code: `.button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    background: var(--gold);
    color: var(--bg-primary);
}` },
        { language: 'CSS', difficulty: 'easy', code: `:root {
    --ink:  #d3c6aa;
    --gold: #dbbc7f;
    --teal: #7fbbb3;
}` },
        { language: 'CSS', difficulty: 'medium', code: `.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
}` },
        { language: 'CSS', difficulty: 'medium', code: `@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}` },
        { language: 'CSS', difficulty: 'medium', code: `.card {
    container-type: inline-size;
}
@container (min-width: 480px) {
    .card { display: flex; }
}` },
        { language: 'CSS', difficulty: 'easy', code: `body {
    font-family: "EB Garamond", Garamond, serif;
    line-height: 1.6;
    color: var(--ink);
}` },
        { language: 'CSS', difficulty: 'medium', code: `.frame {
    background:
        radial-gradient(ellipse at top, var(--bg-elevated), var(--bg-card)),
        linear-gradient(180deg, transparent, rgba(0,0,0,0.2));
}` },
        { language: 'CSS', difficulty: 'hard', code: `@keyframes float {
    0%, 100% { transform: translateY(0)    rotate(0); }
    50%      { transform: translateY(-8px) rotate(2deg); }
}

.mote { animation: float 6s ease-in-out infinite; }` },
        { language: 'CSS', difficulty: 'medium', code: `.nav-link:is(:hover, :focus-visible) {
    color: var(--gold);
    text-decoration: underline 1px;
    text-underline-offset: 4px;
}` },
        { language: 'CSS', difficulty: 'medium', code: `.tab.active {
    color: var(--gold);
    border-bottom: 2px solid currentColor;
}
.tab:not(.active):hover { color: var(--ink); }` },
        { language: 'CSS', difficulty: 'easy', code: `* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}` },
        { language: 'CSS', difficulty: 'hard', code: `.glow {
    box-shadow:
        inset 0 0 0 1px var(--gold),
        inset 0 0 32px rgba(219, 188, 127, 0.18),
        0 0 36px rgba(219, 188, 127, 0.45);
}` }
    ]
};

/* ═══════════════════════════════════════════════════════════════
   TIPS — language-specific marginalia for the certificate.
   Kept short (one line, ideally < 110 chars), present-tense,
   one fact per tip. Voice is direct, not chatty.
   ═══════════════════════════════════════════════════════════════ */

const CODE_TIPS = {
    JavaScript: [
        "`==` performs type coercion; `===` does not. Reach for `===` unless you mean otherwise.",
        "`Array.from({length: n}, (_, i) => i)` builds a numbered array without manually pushing.",
        "Optional chaining `?.` short-circuits on `null` *and* `undefined` — but not on `0` or `''`.",
        "`Promise.all` rejects on the first failure; `Promise.allSettled` waits for every result.",
        "`Object.freeze` is shallow — nested objects remain mutable unless you freeze them too.",
        "Tagged template literals let you write your own DSL: `html\\`<p>\\${name}</p>\\``.",
        "`Map` keeps insertion order and accepts any key type. `Object` is for string/symbol keys.",
        "`structuredClone(x)` deep-clones objects without `JSON.parse(JSON.stringify(x))` lossiness."
    ],
    TypeScript: [
        "`unknown` is the safe `any` — you must narrow it before use, which catches real bugs.",
        "`as const` freezes a literal: `[1, 2] as const` becomes `readonly [1, 2]`, not `number[]`.",
        "Use `satisfies` over `as` when you want type-checking without widening the inferred type.",
        "Discriminated unions (a shared literal field) let TypeScript narrow exhaustively in `switch`.",
        "Branded types (`type UserId = number & { __brand: 'UserId' }`) prevent passing the wrong ID.",
        "`never` in a function return means it always throws or loops forever — useful in exhaustive checks.",
        "`Readonly<T>` and `ReadonlyArray<T>` only freeze the top level. Nested mutations still compile.",
        "`infer` inside a conditional type extracts: `type Returned<T> = T extends () => infer R ? R : never`."
    ],
    Python: [
        "List comprehensions are usually faster than the equivalent `for`-loop with `.append()`.",
        "`@dataclass` gives you `__init__`, `__repr__`, and `__eq__` for free — use it for plain records.",
        "`is` checks identity; `==` checks equality. Use `is None`, never `== None`.",
        "`pathlib.Path` beats `os.path` for almost everything — `Path('x') / 'y' / 'z.txt'`.",
        "Generators (`yield`) consume O(1) memory regardless of stream size, unlike returning a list.",
        "`enumerate(seq, start=1)` is cleaner than maintaining your own index counter.",
        "`@functools.cache` memoizes pure functions in one line. Use `lru_cache(maxsize=…)` for bounded.",
        "`f'{x = }'` (since 3.8) prints both the expression text and its value — invaluable for debugging."
    ],
    Rust: [
        "`?` propagates errors out of any function returning `Result` — replaces a pile of match arms.",
        "Prefer `&str` for parameters; return `String` only when you produce a new owned value.",
        "`Option<T>` and `Result<T, E>` carry no runtime cost — they compile to plain pointers/tags.",
        "`if let Some(x) = opt { … }` reads better than `match` when you only care about one variant.",
        "`Cow<'a, str>` lets a function accept both borrowed and owned strings without copying.",
        "Use `#[derive(Debug)]` everywhere — `dbg!(value)` is your fastest debugging tool.",
        "The borrow checker rejects nothing arbitrary. If it complains, the bug is real.",
        "`cargo clippy` catches a hundred lints `cargo check` won't. Run it before every PR."
    ],
    Go: [
        "Early returns beat nested `if`s. Go's flat style isn't a guideline — it's the convention.",
        "`defer` runs in LIFO order. Defer your unlocks immediately after locking.",
        "Don't use `panic` for control flow. Return errors. `panic` is for programmer mistakes.",
        "`context.Context` is the first parameter, by convention. Pass it down, never store it.",
        "Channels are not free. A `sync.Mutex` is often simpler and faster for shared state.",
        "Generics (1.18+) are for libraries. App code rarely needs them — concrete types read better.",
        "`go vet` and `staticcheck` catch more real bugs than the compiler. Run them in CI.",
        "Interfaces are satisfied implicitly. Define them where they're consumed, not where they're produced."
    ],
    C: [
        "`sizeof` is a compile-time operator, not a function. No parentheses needed for a value.",
        "Initialise local variables. Uninitialised reads are undefined behaviour, not zero.",
        "`const char *p` means the chars are const. `char *const p` means the pointer is const.",
        "Always check `malloc`'s return value. The OOM path is real, even on a 64-bit machine.",
        "`printf(\"%d\", x)` where `x` is a `long` is undefined. Use `%ld`. The compiler may not warn.",
        "Use `static` for file-local symbols — it's C's only way to limit visibility.",
        "Off-by-one is the #1 cause of buffer overruns. `array[N]` does not exist; `array[N-1]` is the last.",
        "Compile with `-Wall -Wextra -Wpedantic -Wshadow -Wconversion`. Fix every warning."
    ],
    'C++': [
        "Prefer `std::unique_ptr` over raw `new`. Prefer `std::make_unique<T>(...)` over `new T(...)`.",
        "RAII isn't a pattern, it's the language. If you write `delete`, you're probably wrong.",
        "Pass small objects by value, large objects by `const&`. The compiler is good at the rest.",
        "`auto` for type deduction; `auto&` to keep a reference; `auto&&` for forwarding.",
        "`std::span<T>` (C++20) carries a pointer + length — pass it instead of `T*` and a separate count.",
        "Ranges (`std::views`) compose lazily: `view | filter | transform | take(10)` is one pass.",
        "`constexpr` makes compile-time computation possible. `consteval` requires it.",
        "Mark single-argument constructors `explicit` unless you genuinely want implicit conversion."
    ],
    Zig: [
        "There is no hidden allocation in Zig. If a function allocates, it takes an `Allocator`.",
        "`defer` and `errdefer` are your cleanup story. `errdefer` runs only on the error path.",
        "`comptime` runs code at compile time — it's how Zig does generics, no separate template language.",
        "`!T` is sugar for an error union. The error set is inferred unless you write it out.",
        "`@TypeOf(x)` introspects a value's type at compile time — Zig's reflection lives in `comptime`.",
        "Always `defer arena.deinit()` (or equivalent) right after creating a resource.",
        "`zig fmt` is canonical. There are no style debates.",
        "Build with `-O ReleaseSafe` for production unless you've measured a need for `ReleaseFast`."
    ],
    Ruby: [
        "Blocks are first-class. `[1,2,3].map { |n| n * 2 }` reads like English; learn to love it.",
        "`||=` assigns only when the left side is nil/false. `@cache ||= expensive_call` memoizes in one line.",
        "Symbols (`:name`) are interned strings — same identity, faster comparison. Use them as hash keys.",
        "`Enumerable` gives you `map`, `select`, `reject`, `each_with_index`, `group_by` for free.",
        "Open classes are powerful and dangerous. Reach for refinements when you'd otherwise monkey-patch.",
        "`raise` without arguments inside `rescue` re-raises the current exception unchanged.",
        "`Struct.new` makes a value class in one line. `Data.define` (3.2+) makes it immutable.",
        "Run `bundle exec` to ensure you use the gem versions in your `Gemfile.lock`, not whatever's global."
    ],
    Lua: [
        "Tables are everything in Lua: arrays, hash maps, objects, modules, namespaces — one structure.",
        "Indices start at 1, not 0. `#t` returns the length of the array part.",
        "`local` is almost always what you want. Globals leak across files and slow lookups.",
        "Methods are sugar: `obj:method(x)` is `obj.method(obj, x)`. The colon passes `self`.",
        "Use `pcall(fn, ...)` to catch errors — Lua has no try/catch, only protected calls.",
        "Coroutines (`coroutine.create`) are cooperative threads — perfect for game loops and iterators.",
        "`require` caches modules. Mutating a returned table mutates everyone's copy.",
        "Closures capture variables by reference. Two closures sharing an upvalue see each other's writes."
    ],
    Bash: [
        "Always start scripts with `set -euo pipefail`. It turns silent failures into loud ones.",
        "Quote your variables: `\"$var\"`, not `$var`. Unquoted expansion splits on whitespace and globs.",
        "`[[ ... ]]` is the bash conditional — safer than `[ ... ]`, supports `&&`, `||`, `=~`.",
        "Use `\"$(command)\"` instead of backticks. They nest cleanly and quote consistently.",
        "`mapfile -t lines < file` reads a file into an array without subshell quirks.",
        "`trap 'cleanup' EXIT` runs your cleanup whether the script succeeds, fails, or is interrupted.",
        "ShellCheck (`shellcheck script.sh`) finds real bugs the shell will silently accept.",
        "`${var:-default}` substitutes a default if `var` is unset or empty. Cleaner than `if [ -z ... ]`."
    ],
    SQL: [
        "Indexes accelerate reads and slow writes. Add them deliberately, drop the unused ones.",
        "`EXPLAIN` (or `EXPLAIN ANALYZE`) shows the actual plan — read it before tuning anything.",
        "Always `BEGIN` and `COMMIT` related changes together. Half-applied state is the worst kind of bug.",
        "`LEFT JOIN ... WHERE right.col IS NOT NULL` is just an `INNER JOIN`. Pick one or the other.",
        "Window functions (`ROW_NUMBER()`, `LAG`, `SUM() OVER`) replace most self-join + group hacks.",
        "`NULL` is not a value — it's the absence of one. `x = NULL` is never true; use `x IS NULL`.",
        "Add `ORDER BY` when you want order. Without it, the database is free to return rows in any sequence.",
        "CTE (`WITH foo AS (...)`) makes complex queries readable. Modern engines optimise across them well."
    ],
    Haskell: [
        "Functions are curried by default. `add :: Int -> Int -> Int` is `Int -> (Int -> Int)`.",
        "`Maybe` and `Either` carry the absence/error in the type. The compiler enforces the handling.",
        "`fmap`, `<$>`, `<*>`, `>>=` form a ladder of structure: Functor → Applicative → Monad.",
        "`do`-notation is sugar over `>>=`. Reading `do` expressions backwards usually reveals the desugared form.",
        "Pattern matching is exhaustive — turn on `-Wincomplete-patterns` to catch missing cases.",
        "Type classes are like interfaces, but resolved at compile time and free of runtime cost.",
        "Lazy evaluation lets you define infinite lists like `fibs = 0 : 1 : zipWith (+) fibs (tail fibs)`.",
        "If you reach for a loop, you probably want `map`, `filter`, `foldr`, or `foldl'` instead."
    ],
    HTML: [
        "Use semantic elements: `<nav>`, `<main>`, `<article>`, `<aside>` over a sea of `<div>`s.",
        "Every `<img>` needs alt text. Decorative? `alt=\"\"`. Meaningful? Describe what it is, not that it is an image.",
        "`<button type=\"button\">` outside a form, otherwise it defaults to `type=\"submit\"` and triggers the form.",
        "`<label for=\"id\">` paired to an `<input id=\"id\">` makes the entire label clickable.",
        "`rel=\"noopener noreferrer\"` on `target=\"_blank\"` links prevents tabnabbing attacks.",
        "`loading=\"lazy\"` on images defers off-screen ones — built into the platform, no library needed.",
        "ARIA is the patch, not the fabric. Prefer real elements; use ARIA only when no semantic HTML fits.",
        "`<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">` is non-negotiable on mobile."
    ],
    CSS: [
        "Custom properties cascade and inherit. Set `--accent` once on `:root`, override per-section.",
        "`gap` works in flex too (since 2021), not just grid. Stop reaching for negative margins.",
        "`:has()` is the parent selector. `.card:has(img)` styles cards that contain an image.",
        "`clamp(min, ideal, max)` makes responsive type without media queries: `font-size: clamp(1rem, 4vw, 2rem)`.",
        "`aspect-ratio: 16 / 9` reserves layout space — no more layout shifts when images load.",
        "Avoid `!important`. The cascade is a feature; specificity wars are a smell.",
        "`prefers-reduced-motion` is one media query. Respect it — vestibular disorders are real.",
        "`backdrop-filter: blur()` creates frosted-glass surfaces in one declaration. Layer behind translucent fills."
    ]
};

/* General typing tips — shown after words / quotes / zen trials */
const TYPING_TIPS = [
    "Look at the page, not the keys. The hand learns faster when the eye stays where it's needed.",
    "Accuracy first; speed follows. A typo is a step backwards no matter how fast you took it.",
    "Rest the wrists. Anchor the palms only when scrolling, never while striking.",
    "Type whole words rhythmically rather than letter-by-letter. The fingers chord.",
    "Common bigrams (`th`, `er`, `in`, `on`) deserve dedicated muscle memory. Drill them.",
    "Punctuation slows everyone. Practise the symbol row deliberately, not only in the wild.",
    "Posture: feet flat, screen at eye level, elbows at ninety. The body is part of the keyboard.",
    "Trust the home row. Returning between strokes is what keeps long sessions accurate.",
    "Capital letters use the *opposite* shift key from the letter. Two hands always.",
    "If a word breaks your rhythm, retype it three times in isolation. Burn it in.",
    "Slow down on hard sequences. Speed without form ossifies bad habits.",
    "Take a 30-second break every five minutes of practice. The brain consolidates between trials.",
    "Right-hand pinky carries `;`, `'`, `enter`, `shift`. Don't let it freeload.",
    "Numbers come from the row above home. Resist looking — even slow, eyes-up beats fast, eyes-down.",
    "The fastest typists average ~120 WPM. Most people plateau at 60-80 — that's fine for almost everything.",
    "Hot drinks and dry hands. Sweaty fingers stick to the keys; cold ones miss them.",
    "Mechanical switches give you tactile feedback your typing brain craves. Try one before deciding.",
    "Three short sessions a day beat one long session. Consistency teaches the hand.",
    "Read aloud what you're typing on long passages. The voice synchronises the fingers.",
    "Errors cluster — when one shows up, slow down, finish the word, *then* fix. Don't panic-correct mid-flow."
];

const CodeGenerator = {
    /* Get a random snippet from a specific language */
    getRandom(language) {
        const snippets = CODE_SNIPPETS[language];
        if (!snippets || snippets.length === 0) return null;
        return snippets[Math.floor(Math.random() * snippets.length)];
    },

    /* Get any random snippet from any language */
    getAny() {
        const languages = Object.keys(CODE_SNIPPETS);
        const language = languages[Math.floor(Math.random() * languages.length)];
        return this.getRandom(language);
    },

    /* All registered languages */
    getLanguages() {
        return Object.keys(CODE_SNIPPETS);
    },

    /* Marginalia tip for a language (returns string or null) */
    getTip(language) {
        const tips = CODE_TIPS[language];
        if (!tips || tips.length === 0) return null;
        return tips[Math.floor(Math.random() * tips.length)];
    },

    /* General typing tip — for non-code modes */
    getTypingTip() {
        if (TYPING_TIPS.length === 0) return null;
        return TYPING_TIPS[Math.floor(Math.random() * TYPING_TIPS.length)];
    },

    /* Format code for typing (preserve internal whitespace, trim outer) */
    formatForTyping(code) {
        return code.trim();
    },

    /* Split code into lines */
    getLines(code) {
        return code.split('\n');
    }
};
