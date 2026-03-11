import { dbService } from "../src/services/db.service";

const prisma = dbService.client;

const defaultSettings = [
    {
        key: "app.maintenance_mode",
        value: "false",
        type: "boolean",
        description:
            "Toggles the entire API into maintenance mode (503 responses)",
    },
    {
        key: "app.maintenance_message",
        value: "System is currently undergoing maintenance. Please check back later.",
        type: "text",
        description: "Custom message returned during maintenance",
    },
    {
        key: "app.api_version",
        value: "1.0.0",
        type: "string",
        description: "Current API version identifier",
    },
    {
        key: "rate_limit.requests_per_minute",
        value: "100",
        type: "integer",
        description: "Global rate limit per client",
    },
    {
        key: "rate_limit.burst_size",
        value: "20",
        type: "integer",
        description: "Max burst before throttling kicks in",
    },
    {
        key: "pagination.default_page_size",
        value: "20",
        type: "integer",
        description: "Default items per page",
    },
    {
        key: "pagination.max_page_size",
        value: "100",
        type: "integer",
        description: "Upper bound for client-requested page size",
    },
    {
        key: "email.sender_address",
        value: "noreply@example.com",
        type: "string",
        description: "Default 'from' address for outbound emails",
    },
    {
        key: "email.sender_name",
        value: "API Service",
        type: "string",
        description: "Display name for outbound emails",
    },
];

async function main() {
    console.log(`Start seeding ...`);
    for (const setting of defaultSettings) {
        const result = await prisma.setting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
        console.log(`Upserted setting: ${result.key}`);
    }
    console.log(`Seeding finished.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
