import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor, fn, expect } from '@storybook/test';
import { BrowserRouter } from 'react-router-dom';
import Login from './login';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/globals.css';

const meta: Meta<typeof Login> = {
  title: 'Authentication/Login',
  component: Login,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Login>;

export default meta;
type Story = StoryObj<typeof meta>;

// Template that provides the mock context
const Template: Story = {
  args: {},
  render: function Render(args) {
    // Default mock auth
    const mockAuth: any = {
      login: fn(),
      isAuthenticated: false,
      loading: false,
      user: null,
      isAdmin: false,
      logout: fn(),
      updateUsername: fn(),
      updateEmail: fn(),
      changePassword: fn(),
    };
    
    return (
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <Login {...args} />
          </div>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default Login Form',
};

export const FormLoading: Story = {
  ...Template,
  name: 'Form Loading',
  render: function Render(args) {
    const mockAuth: any = {
      login: fn(() => new Promise(resolve => setTimeout(resolve, 2000))),
      isAuthenticated: false,
      loading: false,
      user: null,
      isAdmin: false,
      logout: fn(),
      updateUsername: fn(),
      updateEmail: fn(),
      changePassword: fn(),
    };
    
    return (
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <Login {...args} />
          </div>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await userEvent.type(canvas.getByPlaceholderText('Email'), 'test@example.com');
    await userEvent.type(canvas.getByPlaceholderText('Password'), 'password123');
    await userEvent.click(canvas.getByRole('button', { name: /log in/i }));
    
    await waitFor(() => {
      expect(canvas.getByRole('button')).toHaveTextContent('Loading...');
    });
  },
};

export const InvalidCredentials: Story = {
  ...Template,
  name: 'Invalid Credentials',
  render: function Render(args) {
    const mockAuth: any = {
      login: fn(() => Promise.reject(new Error('Invalid email or password, Please try again.'))),
      isAuthenticated: false,
      loading: false,
      user: null,
      isAdmin: false,
      logout: fn(),
      updateUsername: fn(),
      updateEmail: fn(),
      changePassword: fn(),
    };
    
    return (
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <Login {...args} />
          </div>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await userEvent.type(canvas.getByPlaceholderText('Email'), 'wrong@example.com');
    await userEvent.type(canvas.getByPlaceholderText('Password'), 'wrongpass');
    await userEvent.click(canvas.getByRole('button', { name: /log in/i }));
    
    await waitFor(() => {
      expect(canvas.getByText(/Invalid email or password, Please try again./i)).toBeInTheDocument();
    });
  },
};

export const SuccessfulLogin: Story = {
  ...Template,
  name: 'Successful Login',
  render: function Render(args) {
    const mockAuth: any = {
      login: fn(() => Promise.resolve({
        user: { name: 'John Doe', email: 'example@example.com'}
      })),
      isAuthenticated: false,
      loading: false,
      user: null,
      isAdmin: false,
      logout: fn(),
      updateUsername: fn(),
      updateEmail: fn(),
      changePassword: fn(),
    };
    
    return (
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <Login {...args} />
          </div>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await userEvent.type(canvas.getByPlaceholderText('Email'), 'example@example.com');
    await userEvent.type(canvas.getByPlaceholderText('Password'), 'password123');
    await userEvent.click(canvas.getByRole('button', { name: /log in/i }));
    
    await waitFor(() => {
      expect(canvas.getByRole('button')).not.toHaveTextContent('Loading...');
    });
  },
};