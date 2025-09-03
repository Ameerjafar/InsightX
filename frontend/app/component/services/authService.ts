import axios from 'axios';

export interface UserData {
  token: string;
  userId: string;
  userEmail: string;
  userBalance: number;
  freeMargin: number;
  lockedMargin: number;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_ID_KEY = 'userId';
  private static readonly USER_EMAIL_KEY = 'userEmail';
  private static readonly USER_BALANCE_KEY = 'userBalance';
  private static readonly FREE_MARGIN_KEY = 'freeMargin';
  private static readonly LOCKED_MARGIN_KEY = 'lockedMargin';

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get stored user ID
  static getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  // Get stored user email
  static getUserEmail(): string | null {
    return localStorage.getItem(this.USER_EMAIL_KEY);
  }

  // Get stored user balance
  static getUserBalance(): number {
    const balance = localStorage.getItem(this.USER_BALANCE_KEY);
    return balance ? parseFloat(balance) : 0;
  }

  // Get stored free margin
  static getFreeMargin(): number {
    const margin = localStorage.getItem(this.FREE_MARGIN_KEY);
    return margin ? parseFloat(margin) : 0;
  }

  // Get stored locked margin
  static getLockedMargin(): number {
    const margin = localStorage.getItem(this.LOCKED_MARGIN_KEY);
    return margin ? parseFloat(margin) : 0;
  }

  // Store user data
  static storeUserData(data: Partial<UserData>): void {
    if (data.token) localStorage.setItem(this.TOKEN_KEY, data.token);
    if (data.userId) localStorage.setItem(this.USER_ID_KEY, data.userId);
    if (data.userEmail) localStorage.setItem(this.USER_EMAIL_KEY, data.userEmail);
    if (data.userBalance !== undefined) localStorage.setItem(this.USER_BALANCE_KEY, String(data.userBalance));
    if (data.freeMargin !== undefined) localStorage.setItem(this.FREE_MARGIN_KEY, String(data.freeMargin));
    if (data.lockedMargin !== undefined) localStorage.setItem(this.LOCKED_MARGIN_KEY, String(data.lockedMargin));
  }

  // Update user balance
  static updateUserBalance(balance: number): void {
    localStorage.setItem(this.USER_BALANCE_KEY, String(balance));
  }

  // Update margins
  static updateMargins(freeMargin: number, lockedMargin: number): void {
    localStorage.setItem(this.FREE_MARGIN_KEY, String(freeMargin));
    localStorage.setItem(this.LOCKED_MARGIN_KEY, String(lockedMargin));
  }

  // Clear all stored data
  static clearUserData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_EMAIL_KEY);
    localStorage.removeItem(this.USER_BALANCE_KEY);
    localStorage.removeItem(this.FREE_MARGIN_KEY);
    localStorage.removeItem(this.LOCKED_MARGIN_KEY);
  }

  // Get axios instance with auth header
  static getAuthenticatedAxios() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:5000',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Refresh user balance from server
  static async refreshUserBalance(): Promise<void> {
    try {
      const token = this.getToken();
      const email = this.getUserEmail();
      
      if (!token || !email) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:5000'}/api/orders/balance?email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const userBalance = response.data.balance;
      if (userBalance?.balances?.[0]?.USD) {
        this.storeUserData({
          userBalance: userBalance.balances[0].USD,
          freeMargin: userBalance.balances[0].freeMargin || 0,
          lockedMargin: userBalance.balances[0].lockedMargin || 0,
        });
      }
    } catch (error) {
      console.error('Error refreshing user balance:', error);
      throw error;
    }
  }
  static getUserData(): UserData | null {
    const token = this.getToken();
    const userId = this.getUserId();
    const userEmail = this.getUserEmail();
    
    if (!token || !userId || !userEmail) {
      return null;
    }

    return {
      token,
      userId,
      userEmail,
      userBalance: this.getUserBalance(),
      freeMargin: this.getFreeMargin(),
      lockedMargin: this.getLockedMargin(),
    };
  }
}

export default AuthService;
