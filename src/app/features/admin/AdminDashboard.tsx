import React, { useState } from 'react';
import { useRestaurant } from '../../store/RestaurantContext';
import { Settings, Users, Menu, Package, Shield } from 'lucide-react';
import { auditService, AuditLogEntry } from '../../services/audit.service';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { users, menuItems, updateMenuItem } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'users' | 'menu' | 'settings' | 'audit'>('users');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const loadAuditLogs = async () => {
    try {
      const logs = await auditService.getRecentLogs(100);
      setAuditLogs(logs);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to load audit logs');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="size-10 text-gray-800" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600">System administration and configuration</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="size-5" />
                User Management
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'menu'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Menu className="size-5" />
                Menu Management
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="size-5" />
                System Settings
              </button>
              <button
                onClick={() => {
                  setActiveTab('audit');
                  void loadAuditLogs();
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'audit'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className="size-5" />
                Audit Logs
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">System Users</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map(user => (
                    <div key={user.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                          {user.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center text-gray-500">
                    <Users className="size-8 mb-2" />
                    <span className="font-medium">Add New User</span>
                  </button>
                </div>
              </div>
            )}

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Menu Items</h2>
                  <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Add New Item
                  </button>
                </div>
                
                <div className="space-y-2">
                  {menuItems.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.available 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.category} • {item.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">${item.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{item.prepTime} min</p>
                        </div>
                        
                        <button
                          onClick={() => updateMenuItem({ ...item, available: !item.available })}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            item.available
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          {item.available ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">System Settings</h2>
                
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Restaurant Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Restaurant Name</label>
                        <input
                          type="text"
                          defaultValue="IRMS Demo Restaurant"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Phone</label>
                          <input
                            type="tel"
                            defaultValue="+1234567890"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Email</label>
                          <input
                            type="email"
                            defaultValue="info@irms.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Tax & Payment Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tax Rate (%)</label>
                        <input
                          type="number"
                          defaultValue="10"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm text-gray-700">Enable card payments</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm text-gray-700">Enable cash payments</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm text-gray-700">Enable bank transfer</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Operation Hours</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Monday - Friday</span>
                        <span className="text-sm font-medium text-gray-900">11:00 AM - 11:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Saturday - Sunday</span>
                        <span className="text-sm font-medium text-gray-900">10:00 AM - 12:00 AM</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Recent Audit Logs</h2>
                  <button
                    onClick={() => void loadAuditLogs()}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Refresh
                  </button>
                </div>
                <div className="space-y-3 max-h-[500px] overflow-auto">
                  {auditLogs.length === 0 ? (
                    <div className="text-sm text-gray-500">No audit logs found.</div>
                  ) : (
                    auditLogs.map(log => (
                      <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-gray-900">{log.action}</div>
                          <div className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {log.entityType}#{log.entityId ?? '-'} by {log.username}
                        </div>
                        {log.details && <div className="text-sm text-gray-700 mt-1">{log.details}</div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
