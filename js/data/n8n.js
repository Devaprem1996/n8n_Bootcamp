export const N8N_CURRICULUM = {
    title: "N8N Bootcamp Hub",
    cohort: "2024 Automation Engineers",
    days: [
        {
            day: 1,
            title: "N8N Basics & Setup",
            duration: "2 hours",
            difficulty: 1,
            topics: [
                "Welcome & Course Overview",
                "N8N Platform Introduction",
                "Dashboard Tour",
                "First Workflow Setup"
            ],
            concepts: ["Installation", "UI Overview", "First Workflow"],
            keyOutcomes: [
                "Understand N8N core concepts",
                "Navigate the N8N dashboard",
                "Create your first workflow",
                "Connect basic nodes"
            ],
            homework: "Create a simple 2-node workflow (Webhook → Email)"
        },
        {
            day: 2,
            title: "Data Flow & Nodes",
            duration: "3 hours",
            difficulty: 1,
            topics: [
                "JSON Data Structures",
                "Node Input/Output",
                "Data Transformation",
                "Pinning Outputs"
            ],
            concepts: ["Data Mapping", "Node Types", "Output Handling"],
            keyOutcomes: [
                "Understand JSON data structures",
                "Navigate node I/O interface",
                "Transform data using Set node",
                "Pin outputs for workflow control"
            ],
            homework: "Build workflow that splits and transforms data"
        },
        {
            day: 3,
            title: "Triggers & Event Management",
            duration: "4 hours",
            difficulty: 2,
            topics: [
                "5 Trigger Types",
                "Webhook Configuration",
                "Schedule Expressions",
                "Trigger Decisions"
            ],
            concepts: ["Webhooks", "Schedules", "Forms", "Manual Triggers"],

            keyOutcomes: [
                "Choose correct trigger for use case",
                "Set up webhooks correctly",
                "Create cron schedules",
                "Test trigger execution"
            ],
            homework: "Build workflow triggered on schedule (daily at 9 AM)"
        },
        {
            day: 4,
            title: "Email & Slack Integration",
            duration: "4 hours",
            difficulty: 2,
            topics: [
                "Email Personalization",
                "Slack OAuth Flow",
                "Conditional Routing",
                "Message Formatting"
            ],
            concepts: ["Email Templates", "Slack API", "Switch Node", "Variables"],

            keyOutcomes: [
                "Set up email with personalization",
                "Configure Slack OAuth",
                "Route messages conditionally",
                "Format messages for channels"
            ],
            homework: "Send personalized emails to 5 recipients from Slack"
        },
        {
            day: 5,
            title: "Google Sheets Integration",
            duration: "5 hours",
            difficulty: 2,
            topics: [
                "Sheets Benefits & Setup",
                "OAuth Authentication",
                "CRUD Operations",
                "Data Mapping Modes"
            ],
            concepts: ["Google Sheets API", "Data Operations", "Mapping"],

            keyOutcomes: [
                "Authenticate with Google Sheets",
                "Perform all CRUD operations",
                "Map data between formats",
                "Handle large datasets"
            ],
            homework: "Create workflow that reads, transforms, and appends to Sheets"
        },
        {
            day: 6,
            title: "Lead Management System (Project 1)",
            duration: "6 hours",
            difficulty: 3,
            topics: [
                "Project Architecture",
                "Multi-Step Workflows",
                "Error Handling",
                "Testing & Debugging"
            ],
            concepts: ["Webhooks", "Google Sheets", "Email", "Slack"],

            keyOutcomes: [
                "Build 5-node workflow",
                "Handle multi-format outputs",
                "Validate data flow",
                "Deploy and test in production"
            ],
            homework: "Process 10 test leads through complete system"
        },
        {
            day: 7,
            title: "Invoice Generation System (Project 2)",
            duration: "6 hours",
            difficulty: 3,
            topics: [
                "Complex Data Transformation",
                "PDF Generation",
                "Calculation Logic",
                "Storage & Delivery"
            ],
            concepts: ["Forms", "Calculations", "PDF", "Email"],

            keyOutcomes: [
                "Build calculation workflows",
                "Generate formatted documents",
                "Implement business logic",
                "Automate document delivery"
            ],
            homework: "Generate invoices for 3 mock customers"
        },
        {
            day: 8,
            title: "Daily Report Aggregation (Project 3)",
            duration: "6 hours",
            difficulty: 3,
            topics: [
                "Multi-Source Integration",
                "Data Consolidation",
                "Report Formatting",
                "Scheduling & Automation"
            ],
            concepts: ["Multiple APIs", "Data Merging", "Formatting", "Scheduling"],

            keyOutcomes: [
                "Integrate multiple data sources",
                "Consolidate data efficiently",
                "Format professional reports",
                "Schedule recurring workflows"
            ],
            homework: "Create automated daily report with 3+ data sources"
        },
        {
            day: 9,
            title: "Error Handling & Capstone",
            duration: "4 hours",
            difficulty: 3,
            topics: [
                "Error Handling Patterns",
                "Retry Logic",
                "Capstone Project",
                "Celebration & Next Steps"
            ],
            concepts: ["Error Catching", "Retry Logic", "Logging", "Monitoring"],

            keyOutcomes: [
                "Handle workflow errors gracefully",
                "Implement retry strategies",
                "Log and monitor workflows",
                "Build production-ready systems"
            ],
            homework: "Complete capstone: Build error-resistant 4+ node workflow"
        }
    ]
};
