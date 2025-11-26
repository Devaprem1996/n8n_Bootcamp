export const VIBE_CODING_CURRICULUM = {
    title: "Vibe Coding Bootcamp",
    totalHours: 20,
    totalWorkflows: 5, // Or projects, adapting the terminology
    totalProjects: 3,
    keyDates: [
        { date: "Day 1", description: "Finding Your Flow" },
        { date: "Day 3", description: "Mid-point Jam Session" },
        { date: "Day 5", description: "Showcase & Vibe Out" }
    ],
    days: [
        {
            day: 1,
            title: "Introduction to Vibe Coding",
            duration: "2 hours",
            difficulty: 1,
            outcomes: ["Understand the philosophy of 'vibe-driven development'.", "Curate a personalized coding environment (music, lighting).", "Learn techniques to enter a state of creative flow."],
            topics: ["Philosophy of Vibe Coding", "Setting the Mood", "Creative Flow", "Ergonomics"],
            concepts: "Focus on the psychological aspects of coding, treating it as a creative and meditative practice rather than a purely technical one. The environment's impact on productivity and creativity.",
            practice: "Spend 30 minutes setting up a new coding playlist and adjusting your workspace lighting. Journal the difference in your focus.",
            homework: "Write a small piece of code (e.g., a CSS animation) while listening to three different genres of music. Note how each affects your process.",
            homeworkTime: "1 hour"
        },
        {
            day: 2,
            title: "Aesthetics & Code",
            duration: "3 hours",
            difficulty: 2,
            outcomes: ["Apply principles of visual design to your code structure.", "Understand the basics of UI/UX for developers.", "Learn to create visually pleasing and intuitive interfaces."],
            topics: ["Code Aesthetics & Formatting", "UI/UX Principles", "Color Theory Basics", "Font Pairing"],
            concepts: "Code is not just functional, it is a medium. Learn how well-formatted, aesthetically pleasing code can improve readability and maintainability. Introduction to user-centric design.",
            practice: "Refactor a messy code file to be more visually organized and readable without changing its functionality.",
            homework: "Design a simple, beautiful login screen using HTML and CSS, focusing on color, font, and spacing.",
            homeworkTime: "2 hours"
        },
        {
            day: 3,
            title: "Generative Art & Creative APIs",
            duration: "4 hours",
            difficulty: 3,
            outcomes: ["Use JavaScript to create generative art.", "Connect to creative APIs (e.g., Giphy, Unsplash).", "Understand the basics of p5.js for creative expression."],
            topics: ["Intro to p5.js", "Generative Art Algorithms", "Fetching data from public APIs", "Displaying images and media"],
            concepts: "Using code as a tool for artistic creation. Randomness, noise, and algorithms in art. Interacting with third-party services to bring external media into your creations.",
            practice: "Create a simple p5.js sketch that draws random geometric shapes with every refresh.",
            homework: "Build a webpage that displays a random image from the Unsplash API and changes it every 10 seconds.",
            homeworkTime: "2.5 hours"
        },
        {
            day: 4,
            title: "Sound & Interaction",
            duration: "4 hours",
            difficulty: 3,
            outcomes: ["Integrate sound into web applications.", "Create interactive experiences that respond to user input.", "Learn about the Web Audio API."],
            topics: ["Web Audio API Basics", "Triggering sounds on events", "Interactive animations", "User input handling"],
            concepts: "The web as a multi-sensory experience. Using sound to provide feedback and create atmosphere. Combining visuals and sound for immersive interactions.",
            practice: "Create a button that plays a sound and triggers a CSS animation when clicked.",
            homework: "Build a simple digital drum machine with clickable pads that play different sounds.",
            homeworkTime: "3 hours"
        },
        {
            day: 5,
            title: "Showcase: Personal Project",
            duration: "4 hours",
            difficulty: 3,
            outcomes: ["Scope and plan a creative coding project.", "Build a polished piece for your portfolio.", "Practice presenting your work and creative process."],
            topics: ["Project Scoping", "Creative Project Showcase", "Peer Feedback", "Future Learning Paths"],
            concepts: "Bringing all the elements together to create a cohesive and personal project. The art of storytelling in presenting technical work.",
            practice: "Outline your personal project idea and create a small proof-of-concept.",
            homework: "Complete and polish your personal creative coding project for the showcase.",
            homeworkTime: "4 hours"
        }
    ],
    resources: {
        youtube: [
            { title: "The Coding Train: Intro to p5.js", channel: "The Coding Train", duration: "30:00", tags: ["p5.js", "creative coding"], url: "https://www.youtube.com/watch?v=8j0UDiN7my4" },
            { title: "Generative Art with JavaScript", channel: "freeCodeCamp.org", duration: "2:30:00", tags: ["generative art", "javascript"], url: "https://www.youtube.com/watch?v=t-4E7w_ik4Q" }
        ],
        workflows: [
            { name: "Random Giphy Display", url: "/workflows/vibe-giphy.json" },
            { name: "Web Audio Player", url: "/workflows/vibe-audio.json" }
        ]
    }
};