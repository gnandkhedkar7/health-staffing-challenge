import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const appointments = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/appointments.json'), 'utf-8')
);

type Appointment = {
    id: number,
    date: Date,
    description: String,
    userId: number
};

const prisma = new PrismaClient();

async function main() {
    try{

        let insertedCount = 0;
        
        for (const app of appointments) {
            const existing = await prisma.appointment.findFirst({
                where: {
                    userId: app.userId,
                    date: new Date(app.date)
                }
            });

            if (existing) {
                console.log(`Skipping appointment for user ${app.userId} on
                    ${app.date} (already exists)`);
                continue;
            }

            await prisma.appointment.create({
                data: {
                    id: app.id,
                    date: new Date(app.date),
                    description: String(app.description),
                    userId: app.userId
                }
            });

            insertedCount++;
        }
         console.log(`Inserted ${insertedCount} appointments into SQLite`);

        /*
        const data = appointments.map( (app: Appointment) => ({
            id: app.id,
            date: (app.date),
            description: String(app.description),
            userId: app.userId
        }));

        const result = await prisma.appointment.createMany({
            data,
            // skipDuplicates: true
        });
        */

        // console.log(`Inserted ${result.count} appointments into SQLite`)


    } catch(err){
        console.error("Error", err instanceof Error ? err.message : String(err));
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) main();