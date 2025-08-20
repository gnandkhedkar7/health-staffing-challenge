import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// GET all users
app.get("/users", async (req, res) => {
  const users = await prisma.transformedUser.findMany();
  res.json(users);
});

// GET all appointments
app.get("/appointments", async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    include: { user: true }, // include user details
  });
  res.json(appointments);
});

// Create a new appointment
app.post("/appointments", async (req, res) => {
  const { date, description, userId } = req.body;

  // Check for conflict
  const existing = await prisma.appointment.findFirst({
    where: { userId, date: new Date(date) }
  });

  if (existing) {
    return res.status(400).json({ error: "User already has an appointment at this time." });
  }

  const appointment = await prisma.appointment.create({
    data: {
      date: new Date(date),
      description,
     user: {
      connect: { id: userId }   // connect existing user
    }
    },
  });

  res.status(201).json(appointment);
});

// Start server
app.listen(3000, () => {
  console.log(" Server running on http://localhost:3000");
});
