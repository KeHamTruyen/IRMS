import React from 'react';
import { Link } from 'react-router';
import { ChefHat, Zap, Shield, BarChart3, Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="size-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">IRMS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">Benefits</a>
            <a href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">Demo</a>
          </nav>
          <Link to="/login">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              Get Started
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium mb-6">
            <Zap className="size-4" />
            <span>100% SOLID Compliance • Production Ready</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Intelligent Restaurant<br />
            <span className="text-orange-500">Management System</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Streamline your restaurant operations with real-time order tracking, 
            kitchen coordination, and role-based dashboards. Built with enterprise-grade architecture.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
                Try Demo Now
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
            <Link to="/test">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                API Test Page
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>6 Role Dashboards</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>Real-time Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>TOP 1% Code Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete Restaurant Solution</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to run a modern restaurant efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-xl mb-4">
                <Users className="size-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Digital Ordering</h3>
              <p className="text-gray-600">
                Servers take orders on tablets with real-time menu updates and special instructions
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-xl mb-4">
                <ChefHat className="size-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Kitchen Display</h3>
              <p className="text-gray-600">
                Auto-routing to kitchen with priority ordering and progress tracking
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-xl mb-4">
                <BarChart3 className="size-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">
                Real-time insights on sales, peak hours, and operational efficiency
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-xl mb-4">
                <Clock className="size-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Table Management</h3>
              <p className="text-gray-600">
                Manage reservations, table assignments, and wait times digitally
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-xl mb-4">
                <Zap className="size-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                WebSocket notifications keep all roles synchronized instantly
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-xl mb-4">
                <Shield className="size-6 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Role-based Access</h3>
              <p className="text-gray-600">
                Secure authentication with JWT and role-specific permissions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Built with Enterprise-Grade Architecture
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  IRMS is developed following SOLID principles with 100% compliance, 
                  ensuring maintainability, extensibility, and scalability.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">100% SOLID Compliance</h4>
                      <p className="text-gray-600">Clean architecture with 37 domain services and strategy patterns</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">93% Test Coverage</h4>
                      <p className="text-gray-600">Comprehensive testing ensures reliability and quality</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Event-Driven Design</h4>
                      <p className="text-gray-600">Loosely coupled modules communicate via domain events</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Auto-Discovery Patterns</h4>
                      <p className="text-gray-600">Add new strategies without modifying existing code</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl p-8">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">SOLID Compliance</span>
                    <span className="text-2xl font-bold text-green-600">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Test Coverage</span>
                    <span className="text-2xl font-bold text-blue-600">93%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '93%' }}></div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Code Quality</span>
                    <span className="text-sm font-bold text-orange-600">TOP 1%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">3.1</div>
                      <div className="text-xs text-gray-500">Complexity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">&lt;1%</div>
                      <div className="text-xs text-gray-500">Duplication</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">77+</div>
                      <div className="text-xs text-gray-500">Java Files</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Try the Live Demo
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Experience the system from different role perspectives. 
              No signup required - just click a role and start exploring.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-3xl mb-2">👨‍💼</div>
                <div className="font-semibold">Server</div>
                <div className="text-sm text-gray-400">Take orders</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-3xl mb-2">👨‍🍳</div>
                <div className="font-semibold">Chef</div>
                <div className="text-sm text-gray-400">Kitchen display</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-3xl mb-2">💰</div>
                <div className="font-semibold">Cashier</div>
                <div className="text-sm text-gray-400">Process payments</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-semibold">Host</div>
                <div className="text-sm text-gray-400">Reservations</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-3xl mb-2">📊</div>
                <div className="font-semibold">Manager</div>
                <div className="text-sm text-gray-400">Analytics</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-3xl mb-2">⚙️</div>
                <div className="font-semibold">Admin</div>
                <div className="text-sm text-gray-400">Full access</div>
              </div>
            </div>

            <Link to="/login">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
                Launch Demo
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ChefHat className="size-6 text-orange-500" />
              <span className="font-bold text-gray-900">IRMS</span>
              <span className="text-gray-500">• Intelligent Restaurant Management System</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link to="/test" className="hover:text-gray-900 transition-colors">
                API Test
              </Link>
              <a href="https://github.com" className="hover:text-gray-900 transition-colors">
                GitHub
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Documentation
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-gray-500">
            Built with 100% SOLID compliance • Spring Boot + React + TypeScript
          </div>
        </div>
      </footer>
    </div>
  );
};
