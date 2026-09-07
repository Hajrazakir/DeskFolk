export type User = { name: string; email: string };

const USERS_KEY = "deskfolk-users";
const SESSION_KEY = "deskfolk-session";

type StoredUser = User & { password: string };

const readUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const signup = (name: string, email: string, password: string) => {
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: "Ye email pehle se registered hai." };
  }
  saveUsers([...users, { name, email, password }]);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email }));
  return { success: true, message: "Account ban gaya." };
};

export const login = (email: string, password: string) => {
  const users = readUsers();
  const found = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) return { success: false, message: "Incorrect Password or Email." };
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: found.name, email: found.email }));
  return { success: true, message: "Login ho gaya." };
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};