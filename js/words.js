/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Word Lists
   Curated collections for the best typing experience
   ═══════════════════════════════════════════════════════════ */

const WORDS = {
    // Common English words - easy to type, good flow
    common: [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
        'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
        'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
        'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
        'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
        'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
    ],

    // Medium difficulty words
    medium: [
        'about', 'above', 'across', 'after', 'again', 'against', 'almost', 'along', 'already', 'also',
        'although', 'always', 'among', 'another', 'answer', 'appear', 'around', 'become', 'before', 'began',
        'begin', 'being', 'believe', 'below', 'between', 'beyond', 'both', 'bring', 'build', 'built',
        'business', 'called', 'cannot', 'carry', 'center', 'certain', 'change', 'children', 'city', 'close',
        'company', 'complete', 'consider', 'contain', 'continue', 'control', 'country', 'course', 'cover', 'create',
        'current', 'describe', 'design', 'develop', 'different', 'direct', 'discover', 'during', 'early', 'effect',
        'either', 'electric', 'energy', 'enough', 'enter', 'entire', 'equal', 'especially', 'establish', 'every',
        'example', 'expect', 'experience', 'explain', 'express', 'extend', 'family', 'federal', 'feeling', 'field',
        'figure', 'finally', 'financial', 'finish', 'follow', 'force', 'foreign', 'former', 'forward', 'found',
        'freedom', 'friend', 'front', 'function', 'further', 'future', 'general', 'given', 'glass', 'global'
    ],

    // Advanced vocabulary
    advanced: [
        'absolute', 'abstract', 'academic', 'accomplish', 'accurate', 'achieve', 'acknowledge', 'acquire', 'adequate', 'adjacent',
        'aesthetic', 'algorithm', 'alternative', 'ambiguous', 'analyze', 'anticipate', 'apparatus', 'apparent', 'appreciate', 'appropriate',
        'arbitrary', 'architecture', 'articulate', 'assemble', 'assessment', 'assumption', 'attribute', 'authentic', 'authority', 'automatic',
        'beneficial', 'bureaucracy', 'calculate', 'capability', 'characteristic', 'circumstance', 'cognitive', 'collaborate', 'commodity', 'communicate',
        'community', 'compatible', 'compensate', 'competitive', 'complement', 'component', 'comprehensive', 'compromise', 'concentrate', 'conceptual',
        'concurrent', 'configure', 'consecutive', 'consequence', 'considerable', 'consistent', 'constitute', 'constraint', 'construct', 'contemporary',
        'contribute', 'controversy', 'conventional', 'coordinate', 'correspond', 'criterion', 'curriculum', 'demonstrate', 'derivative', 'deteriorate',
        'determine', 'differentiate', 'dimension', 'discipline', 'discretion', 'discriminate', 'distinguish', 'distribute', 'documentation', 'dominant',
        'efficiency', 'elaborate', 'eliminate', 'empirical', 'encounter', 'endeavor', 'enormous', 'enterprise', 'enthusiasm', 'environment',
        'equivalent', 'erroneous', 'essentially', 'establish', 'evaluate', 'eventually', 'evidence', 'evolution', 'exaggerate', 'examination'
    ],

    // Programming-related words
    programming: [
        'function', 'variable', 'constant', 'array', 'object', 'class', 'method', 'property', 'return', 'value',
        'string', 'number', 'boolean', 'null', 'undefined', 'typeof', 'instance', 'prototype', 'constructor', 'inherit',
        'export', 'import', 'module', 'package', 'library', 'framework', 'component', 'element', 'render', 'state',
        'props', 'effect', 'hook', 'context', 'reducer', 'dispatch', 'action', 'store', 'selector', 'provider',
        'async', 'await', 'promise', 'callback', 'event', 'listener', 'handler', 'trigger', 'emit', 'subscribe',
        'query', 'mutation', 'schema', 'model', 'database', 'table', 'column', 'index', 'primary', 'foreign',
        'server', 'client', 'request', 'response', 'header', 'body', 'status', 'endpoint', 'route', 'middleware',
        'deploy', 'build', 'compile', 'bundle', 'minify', 'optimize', 'debug', 'test', 'mock', 'assert',
        'config', 'environment', 'variable', 'secret', 'token', 'session', 'cookie', 'cache', 'storage', 'memory',
        'algorithm', 'structure', 'stack', 'queue', 'tree', 'graph', 'node', 'edge', 'vertex', 'path'
    ],

    // Flow words - optimized for typing rhythm
    flow: [
        'alpha', 'beta', 'delta', 'gamma', 'theta', 'sigma', 'omega', 'epsilon', 'lambda', 'kappa',
        'silent', 'velvet', 'silver', 'golden', 'violet', 'indigo', 'cobalt', 'amber', 'coral', 'ivory',
        'stream', 'drift', 'glide', 'float', 'swift', 'fleet', 'rapid', 'quick', 'light', 'bright',
        'spark', 'flame', 'blaze', 'ember', 'glow', 'shine', 'gleam', 'flash', 'pulse', 'wave',
        'ocean', 'river', 'forest', 'mountain', 'valley', 'meadow', 'prairie', 'desert', 'island', 'shore',
        'crystal', 'prism', 'mirror', 'shadow', 'echo', 'whisper', 'murmur', 'rustle', 'breeze', 'gentle',
        'serene', 'tranquil', 'peaceful', 'calm', 'still', 'quiet', 'soft', 'smooth', 'fluid', 'grace',
        'rhythm', 'tempo', 'melody', 'harmony', 'chord', 'note', 'tone', 'pitch', 'sound', 'music',
        'dream', 'vision', 'wonder', 'magic', 'mystic', 'cosmic', 'stellar', 'lunar', 'solar', 'astral',
        'zenith', 'horizon', 'aurora', 'nebula', 'quasar', 'pulsar', 'nova', 'comet', 'meteor', 'orbit'
    ]
};

// Word generation utilities
const WordGenerator = {
    // Get random words from a category
    getRandom(category = 'common', count = 25) {
        const wordList = WORDS[category] || WORDS.common;
        const result = [];
        const used = new Set();
        
        while (result.length < count) {
            const word = wordList[Math.floor(Math.random() * wordList.length)];
            if (!used.has(word) || result.length >= wordList.length) {
                result.push(word);
                used.add(word);
            }
        }
        
        return result;
    },

    // Get mixed difficulty words
    getMixed(count = 25) {
        const categories = ['common', 'medium', 'flow'];
        const result = [];
        
        for (let i = 0; i < count; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const wordList = WORDS[category];
            result.push(wordList[Math.floor(Math.random() * wordList.length)]);
        }
        
        return result;
    },

    // Get programming words
    getProgramming(count = 25) {
        return this.getRandom('programming', count);
    },

    // Get flow-optimized words
    getFlow(count = 25) {
        return this.getRandom('flow', count);
    },

    // Generate a natural-feeling word sequence
    generateSequence(count = 25, difficulty = 'normal') {
        let words;
        
        switch (difficulty) {
            case 'easy':
                words = this.getRandom('common', count);
                break;
            case 'hard':
                words = [...this.getRandom('advanced', Math.floor(count * 0.6)),
                         ...this.getRandom('medium', Math.floor(count * 0.4))];
                break;
            case 'programming':
                words = this.getProgramming(count);
                break;
            case 'flow':
                words = this.getFlow(count);
                break;
            default:
                words = this.getMixed(count);
        }
        
        // Shuffle the array
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
        
        return words;
    }
};

