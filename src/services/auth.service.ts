import API from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await API.post('/auth/login', { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem('token', token.access_token);
    localStorage.setItem('user', JSON.stringify(user));
    return res.data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    const res = await API.post('/auth/register', data);
    const { token, user } = res.data.data;
    localStorage.setItem('token', token.access_token);
    localStorage.setItem('user', JSON.stringify(user));
    return res.data;
  },

  logout: async () => {
    await API.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  me: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn: () => !!localStorage.getItem('token'),
};