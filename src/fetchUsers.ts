import axios from "axios";
import fs from "fs/promises";

type RawUser = {
    id: number;
    name: string;
    email: string;
    company?: { name?: string};
};

type TransformedUser = {
    id: number;
    name: string;
    email: string;
    comapny: string;
};

const API_URL = "https://jsonplaceholder.typicode.com/users";

// Simple retry-once fetch
async function fetchWithRetry<T>(url: string, retries = 1): Promise<T> {
    try {
        const res = await axios.get<T>(url, {
            timeout: 10_000,
            validateStatus: (s) => s >= 200 && s<300,
        });
        return res.data;
    } catch (err) {
        if( retries > 0){
            console.warn(`Fetch failed, retrying ... (${retries} left)`);
            return fetchWithRetry<T>(url, retries - 1);
        }
        throw err;
    }
}

function transform (users: RawUser[]): TransformedUser[] {
    return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        comapny: u.company?.name ?? "",
    }));
}

async function main() {
    console.time("fetch-users");
    try {
        const raw = await fetchWithRetry<RawUser[]>(API_URL, 1);
        const transformed = transform(raw);

        await fs.writeFile("users.json", JSON.stringify(transformed, null, 2), "utf-8");
        console.log(`Saved ${transformed.length} users to users.json`);
    } catch(err){
        console.error("Error:", err instanceof Error ? err.message : String(err));
        process.exit(1);
    } finally {
        console.timeEnd("fetch-users");
    }
}

if (require.main === module) {
    main();
}