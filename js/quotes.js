/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Quote Collections
   Inspiring quotes for the typing experience
   ═══════════════════════════════════════════════════════════ */

const QUOTES = {
    short: [
        {
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            length: 52
        },
        {
            text: "In the middle of difficulty lies opportunity.",
            author: "Albert Einstein",
            length: 46
        },
        {
            text: "Simplicity is the ultimate sophistication.",
            author: "Leonardo da Vinci",
            length: 43
        },
        {
            text: "The best time to plant a tree was twenty years ago. The second best time is now.",
            author: "Chinese Proverb",
            length: 80
        },
        {
            text: "Stay hungry, stay foolish.",
            author: "Steve Jobs",
            length: 26
        },
        {
            text: "Code is like humor. When you have to explain it, it's bad.",
            author: "Cory House",
            length: 57
        },
        {
            text: "First, solve the problem. Then, write the code.",
            author: "John Johnson",
            length: 47
        },
        {
            text: "Make it work, make it right, make it fast.",
            author: "Kent Beck",
            length: 43
        },
        {
            text: "Talk is cheap. Show me the code.",
            author: "Linus Torvalds",
            length: 33
        },
        {
            text: "The most disastrous thing that you can ever learn is your first programming language.",
            author: "Alan Kay",
            length: 85
        },
        {
            text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
            author: "Martin Fowler",
            length: 111
        },
        {
            text: "Programs must be written for people to read, and only incidentally for machines to execute.",
            author: "Harold Abelson",
            length: 91
        },
        {
            text: "The function of good software is to make the complex appear to be simple.",
            author: "Grady Booch",
            length: 73
        },
        {
            text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
            author: "Antoine de Saint-Exupéry",
            length: 106
        },
        {
            text: "The only source of knowledge is experience.",
            author: "Albert Einstein",
            length: 43
        }
    ],

    medium: [
        {
            text: "Life is what happens when you're busy making other plans. The key is to enjoy the journey and embrace the unexpected turns along the way.",
            author: "John Lennon",
            length: 139
        },
        {
            text: "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep moving forward no matter what obstacles you face.",
            author: "Winston Churchill",
            length: 144
        },
        {
            text: "The greatest glory in living lies not in never falling, but in rising every time we fall. This is the true measure of strength and character.",
            author: "Nelson Mandela",
            length: 144
        },
        {
            text: "Your time is limited, don't waste it living someone else's life. Have the courage to follow your heart and intuition.",
            author: "Steve Jobs",
            length: 118
        },
        {
            text: "The future belongs to those who believe in the beauty of their dreams. Never stop dreaming and never stop believing.",
            author: "Eleanor Roosevelt",
            length: 117
        },
        {
            text: "It does not matter how slowly you go as long as you do not stop. Progress is progress, no matter how small the steps.",
            author: "Confucius",
            length: 118
        },
        {
            text: "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are by definition not smart enough to debug it.",
            author: "Brian Kernighan",
            length: 177
        },
        {
            text: "The best error message is the one that never shows up. Design your systems to prevent errors before they happen.",
            author: "Thomas Fuchs",
            length: 112
        },
        {
            text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight. Focus on value, not volume.",
            author: "Bill Gates",
            length: 132
        },
        {
            text: "Walking on water and developing software from a specification are easy if both are frozen. The challenge is when things are fluid.",
            author: "Edward V. Berard",
            length: 131
        }
    ],

    long: [
        {
            text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover.",
            author: "Mark Twain",
            length: 236
        },
        {
            text: "The computer was born to solve problems that did not exist before. It has created new possibilities and new challenges. We are only beginning to understand its potential to transform every aspect of human life and society.",
            author: "Unknown",
            length: 224
        },
        {
            text: "Programming is not about typing, it's about thinking. The act of describing what a program should do forces you to think deeply about the problem. This clarity of thought is the real value of programming.",
            author: "Unknown",
            length: 207
        },
        {
            text: "The art of programming is the art of organizing complexity, of mastering multitude and avoiding its bastard chaos as effectively as possible. We must acknowledge that what we create has consequences beyond our immediate intentions.",
            author: "Edsger Dijkstra",
            length: 232
        },
        {
            text: "Software is like entropy. It is difficult to grasp, weighs nothing, and obeys the second law of thermodynamics. It tends to deteriorate over time unless we actively maintain it. Good architecture helps slow this inevitable decay.",
            author: "Norman Augustine",
            length: 230
        }
    ],

    philosophical: [
        {
            text: "The mind is everything. What you think you become.",
            author: "Buddha",
            length: 50
        },
        {
            text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
            author: "Aristotle",
            length: 76
        },
        {
            text: "The unexamined life is not worth living.",
            author: "Socrates",
            length: 40
        },
        {
            text: "Knowing yourself is the beginning of all wisdom.",
            author: "Aristotle",
            length: 48
        },
        {
            text: "The only true wisdom is in knowing you know nothing.",
            author: "Socrates",
            length: 52
        },
        {
            text: "Happiness is not something ready made. It comes from your own actions.",
            author: "Dalai Lama",
            length: 70
        },
        {
            text: "Be yourself; everyone else is already taken.",
            author: "Oscar Wilde",
            length: 44
        },
        {
            text: "In three words I can sum up everything I've learned about life: it goes on.",
            author: "Robert Frost",
            length: 75
        }
    ],

    tech: [
        {
            text: "The web is more a social creation than a technical one. I designed it for a social effect to help people work together and not as a technical toy.",
            author: "Tim Berners-Lee",
            length: 148
        },
        {
            text: "Hardware: the parts of a computer that can be kicked. Software: the parts of a computer that can only be cursed at.",
            author: "Unknown",
            length: 115
        },
        {
            text: "Computers are incredibly fast, accurate, and stupid. Human beings are incredibly slow, inaccurate, and brilliant. Together they are powerful beyond imagination.",
            author: "Albert Einstein",
            length: 163
        },
        {
            text: "The Internet is becoming the town square for the global village of tomorrow. It connects us all in ways we never thought possible.",
            author: "Bill Gates",
            length: 131
        },
        {
            text: "Technology is a useful servant but a dangerous master. We must learn to use it wisely and not let it control us.",
            author: "Christian Lous Lange",
            length: 112
        },
        {
            text: "The advance of technology is based on making it fit in so that you don't really even notice it, so it's part of everyday life.",
            author: "Bill Gates",
            length: 126
        }
    ]
};

// Quote utilities
const QuoteGenerator = {
    // Get a random quote from a category
    getRandom(category = 'short') {
        const quoteList = QUOTES[category] || QUOTES.short;
        return quoteList[Math.floor(Math.random() * quoteList.length)];
    },

    // Get a quote by length preference
    getByLength(preferredLength = 'medium') {
        switch (preferredLength) {
            case 'short':
                return this.getRandom('short');
            case 'long':
                return this.getRandom('long');
            default:
                return this.getRandom('medium');
        }
    },

    // Get a random quote from any category
    getAny() {
        const categories = Object.keys(QUOTES);
        const category = categories[Math.floor(Math.random() * categories.length)];
        return this.getRandom(category);
    },

    // Get a programming/tech quote
    getTech() {
        const combined = [...QUOTES.tech, ...QUOTES.short.filter(q => 
            q.author.includes('Torvalds') || 
            q.author.includes('Gates') ||
            q.text.toLowerCase().includes('code') ||
            q.text.toLowerCase().includes('program')
        )];
        return combined[Math.floor(Math.random() * combined.length)];
    },

    // Get philosophical quote
    getPhilosophical() {
        return this.getRandom('philosophical');
    },

    // Get words from a quote
    getWords(quote) {
        return quote.text.split(' ');
    }
};

export { QuoteGenerator };
