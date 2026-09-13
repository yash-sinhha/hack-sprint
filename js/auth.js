const AUTH_API_BASE = "http://localhost:3000/api/auth";

export class AuthManager {
  constructor({ onStateChanged } = {}) {
    this.onStateChanged = onStateChanged;
    this.user = this.loadUser();
  }

  loadUser() {
    try {
      return JSON.parse(localStorage.getItem("nexus_auth_user")) || null;
    } catch {
      return null;
    }
  }

  saveUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem("nexus_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("nexus_auth_user");
    }
    this.onStateChanged?.(this.user);
  }

  async submit(path, payload) {
    const response = await fetch(`${AUTH_API_BASE}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Authentication request failed.");
    return data.user;
  }

  async signUp(name, email, password) {
    const user = await this.submit("signup", { name, email, password });
    this.saveUser(user);
    return user;
  }

  async signIn(email, password) {
    const user = await this.submit("signin", { email, password });
    this.saveUser(user);
    return user;
  }

  signOut() {
    this.saveUser(null);
  }
}
