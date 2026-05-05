import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRestaurant } from '../store/RestaurantContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, ChefHat, Coffee, DollarSign, Users, BarChart, Shield, Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { authService } from '../services/auth.service';
import type { UserRole } from '../types';

const roleIcons = {
  server: Coffee,
  chef: ChefHat,
  cashier: DollarSign,
  host: Users,
  manager: BarChart,
  admin: Shield,
};

const roleColors = {
  server: 'from-blue-500 to-blue-600',
  chef: 'from-orange-500 to-orange-600',
  cashier: 'from-green-500 to-green-600',
  host: 'from-purple-500 to-purple-600',
  manager: 'from-red-500 to-red-600',
  admin: 'from-gray-700 to-gray-800',
};

const roleDescriptions = {
  server: 'Manage tables and take orders',
  chef: 'Kitchen display and order preparation',
  cashier: 'Process payments and billing',
  host: 'Handle reservations and table assignments',
  manager: 'Analytics and business insights',
  admin: 'System administration and settings',
};

// Validation schema
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(3, 'Password must be at least 3 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { users, setCurrentUser } = useRestaurant();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  // Demo mode - Role selection
  const handleRoleSelect = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      toast.success(`Logged in as ${role}`, {
        description: 'Demo mode - No authentication required',
      });
      navigate(`/${role}`);
    }
  };

  // Real login
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      // Call backend auth service
      const user = await authService.login(data.username, data.password);
      
      // Save remember me preference
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // Update context
      setCurrentUser(user);
      
      // Success notification
      toast.success('Login successful!', {
        description: `Welcome back, ${user.name}`,
      });
      
      // Navigate to dashboard
      navigate(`/${user.role}`);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Error notification
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Invalid username or password';
      
      toast.error('Login failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="size-16 text-orange-500" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Intelligent Restaurant Management System
          </h1>
          <p className="text-xl text-gray-600">Choose how you want to access</p>
        </div>

        {/* Tabs: Demo Mode vs Real Login */}
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="demo" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="demo" className="text-lg py-3">
                🚀 Quick Demo
              </TabsTrigger>
              <TabsTrigger value="login" className="text-lg py-3">
                🔐 Real Login
              </TabsTrigger>
            </TabsList>

            {/* Demo Mode Tab */}
            <TabsContent value="demo" className="mt-0">
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800 font-medium">
                  ⚡ Quick Demo Mode - Click any role to explore instantly
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  No login required • Perfect for testing
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Object.keys(roleIcons) as UserRole[]).map((role) => {
                  const Icon = roleIcons[role];
                  const gradient = roleColors[role];
                  const description = roleDescriptions[role];

                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSelect(role)}
                      className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-transparent overflow-hidden"
                    >
                      {/* Background gradient on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="mb-4 inline-flex p-4 rounded-2xl bg-gray-50 group-hover:bg-white/20 transition-colors">
                          <Icon className="size-12 text-gray-700 group-hover:text-white transition-colors" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white capitalize mb-2 transition-colors">
                          {role}
                        </h3>
                        
                        <p className="text-gray-600 group-hover:text-white/90 transition-colors">
                          {description}
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-white transition-colors">
                          <span>Access Dashboard</span>
                          <svg className="size-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            {/* Real Login Tab */}
            <TabsContent value="login" className="mt-0">
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-full bg-orange-100 mb-4">
                      <Lock className="size-8 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Welcome Back
                    </h2>
                    <p className="text-gray-600">
                      Sign in to access your dashboard
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Username Field */}
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="Enter your username"
                          className="pl-10"
                          {...register('username')}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.username && (
                        <p className="text-sm text-red-500">{errors.username.message}</p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          {...register('password')}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="size-5" />
                          ) : (
                            <Eye className="size-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
                      )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          {...register('rememberMe')}
                          disabled={isLoading}
                          className="size-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        disabled={isLoading}
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 size-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  {/* Demo Credentials */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3 text-center font-medium">
                      Demo Credentials:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="font-medium text-gray-700">Admin</p>
                        <p className="text-gray-600">admin / same PIN as server</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="font-medium text-gray-700">Server</p>
                        <p className="text-gray-600">server1 / password123</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="font-medium text-gray-700">Chef</p>
                        <p className="text-gray-600">chef1 / password123</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="font-medium text-gray-700">Cashier</p>
                        <p className="text-gray-600">cashier1 / password123</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Features Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">System Features</h2>
            <div className="grid md:grid-cols-2 gap-6 text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">✨ Real-time Updates</h3>
                <p className="text-sm">Order status changes reflect across all roles instantly via WebSocket</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🎯 Role-based Access</h3>
                <p className="text-sm">Each role has customized dashboard with specific permissions</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔒 JWT Security</h3>
                <p className="text-sm">Token-based authentication with secure password encryption</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🏗️ SOLID Architecture</h3>
                <p className="text-sm">100% SOLID compliance with clean architecture patterns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
