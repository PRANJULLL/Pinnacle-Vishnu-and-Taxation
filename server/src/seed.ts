import Client from "./models/Client";
import Employee from "./models/Employee";
import { CLIENTS, EMPLOYEES } from "./utils/constants";

export const seedDatabase = async (): Promise<void> => {
  for (const name of CLIENTS) {
    await Client.findOneAndUpdate({ name }, { name }, { upsert: true });
  }
  for (const name of EMPLOYEES) {
    await Employee.findOneAndUpdate({ name }, { name }, { upsert: true });
  }
  console.log("Database seeded with clients and employees");
};
