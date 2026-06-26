import Task from "./models/Task";
import { generateOrderId } from "./utils/generateOrderId";

const sampleTasks = [
  {
    client: "Pinnacle",
    customerName: "Rahul Sharma",
    pan: "ABCDE1234F",
    phone: "9876543210",
    email: "rahul@email.com",
    plan: "Assisted Filing - Premium",
    amount: 1300,
    taxExpert: "Jay",
    status: "Pending" as const,
    remarks: "ITR filing for FY 2024-25",
  },
  {
    client: "Vishnu",
    customerName: "Priya Patel",
    pan: "FGHIJ5678K",
    phone: "8765432109",
    email: "priya@email.com",
    plan: "Assisted Filing - Basic",
    amount: 500,
    taxExpert: "Mohan",
    status: "Completed" as const,
    remarks: "Basic filing completed",
    completedAt: new Date(),
  },
  {
    client: "Clear Tax",
    customerName: "Amit Kumar",
    pan: "KLMNO9012P",
    phone: "7654321098",
    email: "amit@email.com",
    plan: "Assisted Filing - Elite",
    amount: 1800,
    taxExpert: "Prem",
    status: "Pending" as const,
    remarks: "Elite plan with advisory",
  },
  {
    client: "Pinnacle",
    customerName: "Sneha Reddy",
    pan: "PQRST3456U",
    phone: "6543210987",
    email: "sneha@email.com",
    plan: "Assisted Filing - Basic",
    amount: 2000,
    taxExpert: "Vivek",
    status: "Stuck" as const,
    remarks: "Awaiting documents",
  },
];

export const seedSampleTasks = async (): Promise<void> => {
  const count = await Task.countDocuments();
  if (count > 0) return;

  for (const task of sampleTasks) {
    await Task.create({
      ...task,
      orderId: generateOrderId(),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
  }
  console.log("Sample tasks seeded");
};
