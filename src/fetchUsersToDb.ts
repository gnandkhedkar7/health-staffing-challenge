import axios from "axios";
import { PrismaClient } from "@prisma/client";

type RawUser = {
    id: number;
    name: String;
    email: String;
    company?: { name?: String };
};

const prisma = new PrismaClient();
const API_URL = "https://jsonplaceholder.typicode.com/users";

async function fetchWithRetry<T>(url: string, retries = 1): Promise<T> {
    try {

        const res = await axios.get<T>(url, {
            timeout: 10_000,
            validateStatus: s => s >= 200 && s < 300,
        });
        return res.data;
    } catch (err) {
        if (retries > 0) {
            return fetchWithRetry(url, retries - 1);
        }
        throw err;
    }
}

async function main() {
    try {
        const users = await fetchWithRetry<RawUser[]>(API_URL, 1);
        const data = users.map(u => ({
            id: u.id,
            name: String(u.name),
            email: String(u.email),
            company: String(u.company?.name ?? ""),
        }));

        const result = await prisma.transformedUser.createMany({
            data,
            // skipDuplicates: true
        });

        console.log(`Inserted ${result.count} users into SQLite (skipDuplicated enabled).`);
    } catch (err) {
        console.error("Error", err instanceof Error ? err.message : String(err));
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if( require.main === module) main();