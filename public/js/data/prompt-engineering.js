export const PROMPT_ENG_CURRICULUM = {
    title: "Prompt Engineering Masters",
    totalHours: 25,
    totalWorkflows: 10,
    totalProjects: 3,
    keyDates: [
        { date: "Day 1", description: "The Art of the Prompt" },
        { date: "Day 3", description: "Advanced Techniques & Personas" },
        { date: "Day 5", description: "Final Project: AI Agent Design" }
    ],
    days: [
        {
            day: 1,
            title: "Foundations of Prompting",
            duration: "2 hours",
            difficulty: 1,
            outcomes: ["Understand the fundamentals of Large Language Models (LLMs).", "Distinguish between zero-shot, one-shot, and few-shot prompting.", "Craft clear and effective prompts for basic tasks."],
            topics: ["LLM Fundamentals", "The 'Context Window'", "Zero-shot vs Few-shot", "Instructional Prompts"],
            concepts: "A deep dive into how LLMs process text as 'tokens'. Understanding that a prompt is not a question, but an instruction set to guide the model's completion.",
            practice: "Take a simple, ambiguous prompt and refine it three times to get a better, more consistent output.",
            homework: "Write 5 distinct prompts for different generative tasks (e.g., email writing, code generation, summarization).",
            homeworkTime: "1 hour"
        },
        {
            day: 2,
            title: "Core Techniques",
            duration: "3 hours",
            difficulty: 2,
            outcomes: ["Learn to provide context and desired formats.", "Structure prompts for better clarity and performance.", "Use delimiters and explicit instructions effectively."],
            topics: ["Role Prompting", "Providing Examples (Few-shot)", "Using Delimiters", "Specifying Output Format (JSON, Markdown)"],
            concepts: "The model's ability to adopt a 'persona' (e.g., 'You are a helpful assistant'). Structuring complex prompts to separate instructions, examples, and user input.",
            practice: "Write a prompt that instructs an LLM to act as a travel agent and output a structured JSON object with a trip itinerary.",
            homework: "Create a prompt that takes a block of text and summarizes it into three bullet points, formatted in Markdown.",
            homeworkTime: "1.5 hours"
        },
        {
            day: 3,
            title: "Advanced Prompting: Reasoning & Logic",
            duration: "4 hours",
            difficulty: 3,
            outcomes: ["Implement Chain-of-Thought (CoT) to improve reasoning.", "Understand the basics of the ReAct (Reason + Act) framework.", "Guide LLMs through multi-step logic problems."],
            topics: ["Chain-of-Thought (CoT)", "The 'Let's think step by step' trick", "ReAct Framework", "Self-Correction Prompts"],
            concepts: "Forcing the model to 'show its work'. By asking the LLM to reason step-by-step, it can achieve much higher accuracy on logic, math, and reasoning tasks.",
            practice: "Give an LLM a logic puzzle and first ask for the answer directly. Then, re-prompt using a Chain-of-Thought approach and compare the results.",
            homework: "Solve a multi-step math word problem by guiding an LLM with a detailed CoT prompt.",
            homeworkTime: "2 hours"
        },
        {
            day: 4,
            title: "Building Prompt Chains & Agents",
            duration: "5 hours",
            difficulty: 3,
            outcomes: ["Design systems of chained prompts where one LLM's output is another's input.", "Understand the concept of an AI 'Agent'.", "Manage conversational context and memory in prompts."],
            topics: ["Prompt Chaining", "State Management", "Tool Use Simulation", "Introduction to AI Agents"],
            concepts: "Breaking a complex task into a sequence of simpler prompts. Creating a 'state' by including the summary of the conversation so far in the context of the next prompt.",
            practice: "Design a two-prompt chain: the first prompt summarizes a document, and the second prompt uses that summary to write a social media post.",
            homework: "Create a series of prompts that simulate a simple customer service agent, guiding a user through a troubleshooting process.",
            homeworkTime: "3 hours"
        },
        {
            day: 5,
            title: "Project: Automated Content Creator",
            duration: "5 hours",
            difficulty: 3,
            outcomes: ["Apply all learned techniques to a real-world project.", "Build a robust, multi-step prompt chain.", "Evaluate and refine prompts for optimal performance."],
            topics: ["Project Planning", "Building a Multi-prompt System", "Evaluation and Testing", "Showcase"],
            concepts: "The iterative nature of prompt engineering. There is no 'perfect' prompt; it requires testing, evaluation, and continuous refinement.",
            practice: "Build the first step of the content creator: a prompt that generates a list of blog post ideas from a single topic.",
            homework: "Complete the Automated Content Creator project, which takes a topic, generates an outline, writes a draft, and then suggests 3 social media headlines.",
            homeworkTime: "4 hours"
        }
    ],
    resources: {
        youtube: [
            { title: "Prompt Engineering Guide", channel: "OpenAI", duration: "45:00", tags: ["prompting", "basics"], url: "https://www.youtube.com/watch?v=d_q_t2a4Z1A" },
            { title: "Advanced Prompting Techniques", channel: "DeepLearning.AI", duration: "1:30:00", tags: ["CoT", "advanced"], url: "https://www.youtube.com/watch?v=NqA_j9d3Gz0" }
        ],
        workflows: [
            { name: "Basic Summarizer", url: "/workflows/pe-summarizer.json" },
            { name: "JSON Formatter", url: "/workflows/pe-json.json" }
        ]
    }
};