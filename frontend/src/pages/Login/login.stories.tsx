import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, waitFor, fn } from '@storybook/test';
import { expect } from '@storybook/jest';
import React, { createContext, useContext } from 'react';
import { BrowserRouter } from 'react-router-dom';
import '../../styles/globals.css';

// Create mock context
interface MockAuthContextType {
  login: ReturnType<typeof fn>;
  isAuthenticated: boolean;
  loading: boolean;
  user: any;
  isAdmin: boolean;
}

const MockAuthContext = createContext<MockAuthContextType>({
  login: fn(),
  isAuthenticated: false,
  loading: false,
  user: null,
  isAdmin: false,
});

// Custom hook that mimics useAuth
const useMockAuth = () => useContext(MockAuthContext);

// Create a Login-like component that looks identical to your real one
const LoginStoryComponent: React.FC = () => {
  const auth = useMockAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await auth.login(email, password);
      // In Storybook, we just simulate success
      console.log('Login successful for:', email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (auth.loading) {
    return (
      <div className="rf-auth-page">
        <div className="text-(--color-gold) text-2xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="rf-auth-page">
      <div className="rf-auth-card">
        <div className="rf-auth-logo">
          <div className="rf-auth-logo-icon">
            <img src="/assets/richflow.png" alt="RichFlow Logo" />
          </div>
          <span className="rf-auth-logo-text">RichFlow</span>
        </div>
        
        <form onSubmit={handleLogin} className="rf-auth-form">
          {error && <div className="rf-auth-error">{error}</div>}
          
          <input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rf-auth-input"
            required
          />
          
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rf-auth-input"
            required
          />
          
          <button 
            type="submit"
            disabled={isLoading}
            className="rf-auth-btn"
          >
            {isLoading ? 'Loading...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
};

const meta: Meta<typeof LoginStoryComponent> = {
  title: 'Authentication/Login',
  component: LoginStoryComponent,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoginStoryComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Template that provides the mock context
const Template: Story = {
  args: {},
  render: function Render(args) {
    // Default mock auth
    const mockAuth = {
      login: fn(),
      isAuthenticated: false,
      loading: false,
      user: null,
      isAdmin: false,
    };
    
    return (
      <BrowserRouter>
        <MockAuthContext.Provider value={mockAuth}>
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <LoginStoryComponent {...args} />
          </div>
        </MockAuthContext.Provider>
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
    const mockAuth = {
      login: fn(() => new Promise(resolve => setTimeout(resolve, 2000))),
      isAuthenticated: false,
      loading: false,
      user: null,
      isAdmin: false,
    };
    
    return (
      <BrowserRouter>
        <MockAuthContext.Provider value={mockAuth}>
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <LoginStoryComponent {...args} />
          </div>
        </MockAuthContext.Provider>
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
    const mockAuth = {
      login: fn(() => Promise.reject(new Error('Invalid email or password, Please try again.'))),
      isAuthenticated: false,
      loading: false,
      user: null,
      isAdmin: false,
    };
    
    return (
      <BrowserRouter>
        <MockAuthContext.Provider value={mockAuth}>
          <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <LoginStoryComponent {...args} />
          </div>
        </MockAuthContext.Provider>
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