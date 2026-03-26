import { users } from "./data";

export { users };

export const getUserById = (id: string) => users.find((u) => u.id === id);
