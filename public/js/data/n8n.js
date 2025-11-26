export const N8N_CURRICULUM = {
    title: "N8N Bootcamp",
    totalHours: 40,
    totalWorkflows: 15,
    totalProjects: 4,
    keyDates: [
        { date: "Day 1", description: "Bootcamp Kick-off & N8N Fundamentals" },
        { date: "Day 5", description: "Mid-point Check-in & Google Sheets Deep Dive" },
        { date: "Day 9", description: "Capstone Project Due & Graduation" }
    ],
    days: [
        {
            day: 1,
            title: "N8N Basics & Setup",
            duration: "2 hours",
            difficulty: 1,
            outcomes: [
                "Understand N8N core concepts and mental models.",
                "Navigate the N8N dashboard and key features.",
                "Successfully create and execute your first workflow.",
                "Connect basic nodes and understand data flow."
            ],
            topics: [ "Welcome & Course Overview", "N8N Platform Introduction", "Dashboard Tour", "First Workflow Setup"],
            concepts: "Core concepts include the 3-box mental model (Triggers, Actions, Data), understanding the difference between manual and webhook triggers, and basic data passing between nodes.",
            practice: "Build a simple 2-node workflow that is triggered by a webhook and sends a 'Hello World' message to a Discord channel.",
            homework: "Create a simple workflow that triggers manually, gets a random joke from an API, and logs it to the browser console.",
            homeworkTime: "45 minutes"
        },
        {
            day: 2,
            title: "Data Flow & Transformation",
            duration: "3 hours",
            difficulty: 1,
            outcomes: [
                "Understand JSON data structures and how N8N handles them.",
                "Confidently use the Set and Function nodes for data manipulation.",
                "Learn to pin and reference data from previous nodes.",
                "Visualize and debug data flow effectively."
            ],
            topics: ["JSON Data Structures", "Node Input/Output", "Data Transformation with Set", "Pinning Outputs", "Using the Function node"],
            concepts: "Deep dive into JSON structure (objects, arrays, key-value pairs). Learn how to use dot notation and array indexing to access specific data points. Introduction to expressions.",
            practice: "Create a workflow that fetches a list of users from a public API, and then uses the Set node to create a new field with their full name.",
            homework: "Build a workflow that fetches weather data and transforms the temperature from Kelvin to Celsius.",
            homeworkTime: "1 hour"
        },
        {
            day: 3,
            title: "Triggers & Logic",
            duration: "4 hours",
            difficulty: 2,
            outcomes: ["Master the 5 main trigger types.", "Configure webhooks and cron schedules.", "Use the Switch node for conditional logic.", "Build decision trees to handle different scenarios."],
            topics: ["5 Trigger Types", "Webhook Configuration", "Schedule Expressions (Cron)", "IF and Switch Nodes", "Decision Trees"],
            concepts: "Comparison of trigger types (manual, schedule, webhook, form, app-based). Understanding how to build robust logic with Switch nodes for routing data.",
            practice: "Build a workflow with a webhook trigger that routes requests to different functions based on the input data.",
            homework: "Create a workflow that runs on a schedule every morning, checks the weather, and sends a notification only if it's going to rain.",
            homeworkTime: "1.5 hours"
        },
        {
            day: 4,
            title: "Email & Slack Automation",
            duration: "4 hours",
            difficulty: 2,
            outcomes: ["Send personalized emails at scale.", "Integrate with Slack for notifications.", "Format messages with dynamic data.", "Build conditional notification systems."],
            topics: ["Email Personalization", "Slack OAuth Flow", "Conditional Routing", "Message Formatting"],
            concepts: "Using expressions and variables to create dynamic, personalized content for emails and Slack messages. Best practices for professional notifications.",
            practice: "Create a workflow that sends a personalized welcome email when a new user signs up via a form.",
            homework: "Build a workflow that sends a daily summary of tasks from a Google Sheet to a Slack channel.",
            homeworkTime: "2 hours"
        },
        {
            day: 5,
            title: "Google Sheets Deep Dive",
            duration: "5 hours",
            difficulty: 2,
            outcomes: ["Authenticate with Google Sheets using OAuth2.", "Perform all CRUD (Create, Read, Update, Delete) operations.", "Map data between different formats and Google Sheets.", "Handle large datasets efficiently."],
            topics: ["Sheets Benefits & Setup", "OAuth Authentication", "CRUD Operations", "Data Mapping Modes"],
            concepts: "Understanding the Google Sheets API and how n8n abstracts it. Difference between append, update, and overwrite. Best practices for data integrity.",
            practice: "Build a workflow that reads data from a webhook, adds it to a Google Sheet, and then reads it back to confirm.",
            homework: "Create a workflow that updates a specific row in a Google Sheet based on an ID, and then deletes another row.",
            homeworkTime: "2 hours"
        },
        {
            day: 6,
            title: "Project 1: Lead Management System",
            duration: "6 hours",
            difficulty: 3,
            outcomes: ["Design and build a multi-step workflow.", "Integrate webhooks, Google Sheets, and email.", "Implement basic error handling.", "Test and debug a complete system."],
            topics: ["Project Architecture", "Multi-Step Workflows", "Error Handling Basics", "Testing & Debugging"],
            concepts: "Breaking down a complex problem into a logical workflow. Using other workflows as sub-modules. Basic try-catch concepts with the Error Trigger.",
            practice: "Build the core lead capture and storage part of the project.",
            homework: "Complete the Lead Management System project by adding email notifications and error handling.",
            homeworkTime: "3 hours"
        },
        {
            day: 7,
            title: "Project 2: Invoice Generation",
            duration: "6 hours",
            difficulty: 3,
            outcomes: ["Perform complex data transformations and calculations.", "Generate dynamic PDFs from templates.", "Automate document storage and delivery.", "Implement business logic within a workflow."],
            topics: ["Complex Data Transformation", "PDF Generation", "Calculation Logic", "Storage & Delivery"],
            concepts: "Using the Function node for complex calculations. Working with HTML/CSS for PDF templates. Integrating with cloud storage like Google Drive.",
            practice: "Build a workflow that takes invoice data and generates a simple PDF.",
            homework: "Complete the Invoice Generation system, including calculations, PDF creation, and emailing the invoice.",
            homeworkTime: "3 hours"
        },
        {
            day: 8,
            title: "Project 3: Daily Report Aggregator",
            duration: "6 hours",
            difficulty: 3,
            outcomes: ["Integrate with multiple data sources (APIs).", "Consolidate and merge data from different systems.", "Format professional reports for email delivery.", "Master scheduling and automation."],
            topics: ["Multi-Source Integration", "Data Consolidation (Merge Node)", "Report Formatting", "Advanced Scheduling"],
            concepts: "Using the HTTP Request node to fetch data from any API. Merging data from different sources based on a common key. Advanced cron expressions.",
            practice: "Build a workflow that fetches data from two different public APIs and merges them.",
            homework: "Complete the Daily Report Aggregator project, formatting the data into a clean report and sending it on a daily schedule.",
            homeworkTime: "3 hours"
        },
        {
            day: 9,
            title: "Advanced Error Handling & Capstone",
            duration: "4 hours",
            difficulty: 3,
            outcomes: ["Implement robust error handling patterns.", "Use retry logic for intermittent failures.", "Design and build a production-ready capstone project.", "Understand best practices for monitoring and logging."],
            topics: ["Error Handling Patterns", "Retry Logic", "Capstone Project Kick-off", "Logging and Monitoring"],
            concepts: "Advanced error handling with the Error Trigger. Configuring retry-on-fail options. Strategies for logging important data for debugging.",
            practice: "Add robust error handling to a previous project.",
            homework: "Complete your capstone project: a production-ready, error-resistant workflow of at least 4 nodes that solves a real-world problem.",
            homeworkTime: "4 hours"
        }
    ],
    resources: {
        youtube: [
            { title: "N8N Fundamentals: Complete Beginner's Guide", channel: "n8n", duration: "1:15:00", tags: ["beginner", "fundamentals"], url: "https://www.youtube.com/watch?v=I_7_b0Qda9w" },
            { title: "Mastering Data Transformation", channel: "n8n", duration: "45:30", tags: ["data", "expressions"], url: "https://www.youtube.com/watch?v=4J0x1a7x9pA" },
            { title: "Error Handling in N8N", channel: "n8n", duration: "30:00", tags: ["errors", "best practices"], url: "https://www.youtube.com/watch?v=i8-L3m-4_7M" }
        ],
        workflows: [
            { name: "Webhook to Discord", url: "/workflows/webhook-to-discord.json" },
            { name: "Daily Weather Report", url: "/workflows/weather-report.json" },
            { name: "Google Sheets CRUD", url: "/workflows/sheets-crud.json" }
        ]
    }
};