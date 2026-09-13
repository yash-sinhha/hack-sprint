const AUTH_API_BASE = window.location.port === "3000"
  ? "/api/auth"
  : `${window.location.protocol}//${window.location.hostname}:3000/api/auth`;

export class AuthManager {
  constructor({ onStateChanged } = {}) {
    this.onStateChanged = onStateChanged;
    this.user = null;
    this.restoreSession();
  }

  saveUser(user) {
    this.user = user;
    this.onStateChanged?.(this.user);
  }

  async submit(path, payload) {
    const response = await fetch(`${AUTH_API_BASE}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Authentication request failed.");
    return data.user;
  }

  async restoreSession() {
    try {
      const response = await fetch(`${AUTH_API_BASE}/me`, { credentials: "include" });
      if (response.ok) {
        this.saveUser((await response.json()).user);
      } else {
        this.saveUser(null);
      }
    } catch {
      this.saveUser(null);
    }
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

  async signOut() {
    try {
      await fetch(`${AUTH_API_BASE}/signout`, { method: "POST", credentials: "include" });
    } finally {
      this.saveUser(null);
    }
  }
}
