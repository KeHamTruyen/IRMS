import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Wifi } from 'lucide-react';

// Import API directly
import api from '../../services/api';

export function ApiTestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Test credentials
  const testUsers = {
    admin: { username: 'admin', password: 'password123' },
    server: { username: 'server1', password: 'password123' },
    chef: { username: 'chef1', password: 'password123' },
    cashier: { username: 'cashier1', password: 'password123' },
    manager: { username: 'manager1', password: 'password123' },
  };

  const addResult = (testName: string, success: boolean, data: any = null, error: any = null) => {
    setResults(prev => [
      {
        testName,
        success,
        data,
        error: error?.message || error?.response?.data?.message || error,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await testFn();
      addResult(testName, true, result);
      return result;
    } catch (error: any) {
      addResult(testName, false, null, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Authentication Tests
  const testLogin = async (role: keyof typeof testUsers) => {
    const { username, password } = testUsers[role];
    await runTest(`Login as ${role}`, async () => {
      const response = await api.post('/auth/login', { username, password });
      const data = (response as any).data || response;
      if (data.token) {
        localStorage.setItem('jwt_token', data.token);
      }
      return data;
    });
  };

  // Table Tests
  const testGetTables = async () => {
    await runTest('Get All Tables', async () => {
      const response = await api.get('/tables');
      return (response as any).data || response;
    });
  };

  // Menu Tests
  const testGetMenuItems = async () => {
    await runTest('Get All Menu Items', async () => {
      const response = await api.get('/menu-items');
      return (response as any).data || response;
    });
  };

  // Order Tests
  const testGetOrders = async () => {
    await runTest('Get All Orders', async () => {
      const response = await api.get('/orders');
      return (response as any).data || response;
    });
  };

  const testCreateOrder = async () => {
    await runTest('Create Order', async () => {
      const response = await api.post('/orders', {
        tableId: 1,
        orderType: 'DINE_IN',
        items: [
          { menuItemId: 1, quantity: 2, specialInstructions: 'Test order' },
          { menuItemId: 5, quantity: 1 },
        ],
        notes: 'API Test Order',
      });
      return (response as any).data || response;
    });
  };

  // Kitchen Tests
  const testGetKitchenOrders = async () => {
    await runTest('Get Kitchen Orders', async () => {
      const response = await api.get('/kitchen/orders');
      return (response as any).data || response;
    });
  };

  // Billing Tests
  const testGetBills = async () => {
    await runTest('Get All Bills', async () => {
      const response = await api.get('/bills');
      return (response as any).data || response;
    });
  };

  // Analytics Tests
  const testGetDashboardStats = async () => {
    await runTest('Get Dashboard Stats', async () => {
      const response = await api.get('/analytics/dashboard');
      return (response as any).data || response;
    });
  };

  // Health Check
  const testHealthCheck = async () => {
    await runTest('Backend Health Check', async () => {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const healthUrl = baseUrl.replace('/api', '/actuator/health');
      const response = await fetch(healthUrl);
      return await response.json();
    });
  };

  // Run All Tests
  const runAllTests = async () => {
    try {
      await testHealthCheck();
      await testLogin('server');
      await testGetTables();
      await testGetMenuItems();
      await testGetOrders();
    } catch (error) {
      console.error('Test suite error:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API Integration Test Suite</h1>
        <p className="text-muted-foreground">
          Test all backend API endpoints
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Backend Status</CardTitle>
            <CardDescription>Check if backend is running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">API URL</Badge>
                <code className="text-sm">{import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}</code>
              </div>
              <Button onClick={testHealthCheck} size="sm" className="mt-2">
                Check Health
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Run common tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={runAllTests} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Run All Tests
              </Button>
              <Button onClick={() => setResults([])} variant="outline">
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="auth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(testUsers).map(role => (
                  <Button 
                    key={role}
                    onClick={() => testLogin(role as keyof typeof testUsers)}
                    disabled={loading}
                  >
                    Login as {role}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={testGetTables} disabled={loading} className="w-full">
                Get All Tables
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Menu Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={testGetMenuItems} disabled={loading} className="w-full">
                Get All Menu Items
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={testGetOrders} disabled={loading} className="w-full">
                Get All Orders
              </Button>
              <Button onClick={testCreateOrder} disabled={loading} className="w-full">
                Create Order
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kitchen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kitchen Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={testGetKitchenOrders} disabled={loading} className="w-full">
                Get Kitchen Orders
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={testGetBills} disabled={loading} className="w-full">
                Get All Bills
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={testGetDashboardStats} disabled={loading} className="w-full">
                Get Dashboard Stats
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="space-y-2">
            {results.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No test results yet. Run some tests to see results here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              results.map((result, index) => (
                <Alert key={index} variant={result.success ? 'default' : 'destructive'}>
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mt-1" />
                    )}
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2">
                        {result.testName}
                        <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                      </AlertTitle>
                      <AlertDescription>
                        {result.success ? (
                          <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto max-h-48">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-sm text-red-600 mt-1">{String(result.error)}</p>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
