import React, { useEffect, useMemo, useState } from 'react';
import { Reservation, ReservationStatus } from '../../types';
import { Calendar, Clock, Users, Phone, CheckCircle, XCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { NewReservationModal } from './NewReservationModal';
import { reservationService } from '../../services/reservation.service';
import { tableService } from '../../services/table.service';
import { Table } from '../../types';

export const HostDashboard: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [tablesData, reservationsData] = await Promise.all([
        tableService.getTables(),
        reservationService.getReservations(),
      ]);

      setTables(tablesData);
      setReservations(reservationsData);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to load host data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const todayReservations = useMemo(() => {
    const today = new Date().toDateString();
    return reservations.filter(r => r.date.toDateString() === today);
  }, [reservations]);

  const pendingReservations = todayReservations.filter(r => r.status === 'pending');
  const confirmedReservations = todayReservations.filter(r => r.status === 'confirmed');

  const availableTables = tables.filter(t => t.status === 'available');

  const handleConfirmReservation = async (reservation: Reservation) => {
    try {
      await reservationService.updateReservationStatus(reservation.id, 'confirmed');
      toast.success('Reservation confirmed');
      setRefreshing(true);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to confirm reservation');
    }
  };

  const handleCancelReservation = async (reservation: Reservation) => {
    try {
      await reservationService.updateReservationStatus(reservation.id, 'cancelled');
      toast.success('Reservation cancelled');
      setRefreshing(true);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to cancel reservation');
    }
  };

  const handleSeatGuests = async (reservation: Reservation) => {
    if (reservation.tableId) {
      try {
        await reservationService.updateReservationStatus(reservation.id, 'seated');
        toast.success('Guests seated');
        setRefreshing(true);
        await loadData();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to seat guests');
      }
    } else {
      toast.error('Please assign a table first');
    }
  };

  const handleAssignTable = async (reservation: Reservation, tableId: string) => {
    try {
      await reservationService.assignTable(reservation.id, tableId);
      toast.success('Table assigned');
      setRefreshing(true);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to assign table');
    }
  };

  const handleCreateReservation = async (payload: {
    customerName: string;
    customerPhone: string;
    guestCount: number;
    date: string;
    time: string;
    notes?: string;
  }) => {
    await reservationService.createReservation(payload);
    setRefreshing(true);
    await loadData();
  };

  const getStatusColor = (status: ReservationStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
      seated: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
        Loading host dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Host Dashboard</h1>
            <p className="text-gray-600">Manage reservations and table assignments</p>
          </div>
          <button
            onClick={() => setShowNewReservation(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            disabled={refreshing}
          >
            <Plus className="size-5" />
            New Reservation
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Reservations</p>
                <p className="text-3xl font-bold text-purple-600">{todayReservations.length}</p>
              </div>
              <Calendar className="size-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingReservations.length}</p>
              </div>
              <Clock className="size-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                <p className="text-3xl font-bold text-blue-600">{confirmedReservations.length}</p>
              </div>
              <CheckCircle className="size-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Tables</p>
                <p className="text-3xl font-bold text-green-600">{availableTables.length}</p>
              </div>
              <Users className="size-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Reservations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Reservations</h2>
              
              <div className="space-y-3">
                {todayReservations.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="size-12 mx-auto mb-3" />
                    <p>No reservations today</p>
                  </div>
                ) : (
                  todayReservations.map(reservation => {
                    const table = reservation.tableId ? tables.find(t => t.id === reservation.tableId) : null;
                    
                    return (
                      <div
                        key={reservation.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">{reservation.customerName}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Phone className="size-4" />
                                {reservation.customerPhone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="size-4" />
                                {reservation.guestCount} guests
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="size-4" />
                                {reservation.time}
                              </span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </div>

                        {reservation.notes && (
                          <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                            Note: {reservation.notes}
                          </p>
                        )}

                        {table && (
                          <div className="text-sm text-gray-600 mb-3">
                            Assigned: Table {table.number} (Capacity: {table.capacity})
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => void handleConfirmReservation(reservation)}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => void handleCancelReservation(reservation)}
                                className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          
                          {reservation.status === 'confirmed' && !table && (
                            <button
                              onClick={() => setSelectedReservation(reservation)}
                              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                            >
                              Assign Table
                            </button>
                          )}

                          {reservation.status === 'confirmed' && table && (
                            <button
                                onClick={() => void handleSeatGuests(reservation)}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                            >
                              Seat Guests
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Available Tables */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Available Tables</h2>
              
              {selectedReservation ? (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-900 font-medium mb-1">
                    Assigning table for:
                  </p>
                  <p className="text-sm text-purple-700">
                    {selectedReservation.customerName} ({selectedReservation.guestCount} guests)
                  </p>
                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="text-xs text-purple-600 hover:text-purple-800 mt-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : null}

              <div className="space-y-2">
                {availableTables.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="size-8 mx-auto mb-2" />
                    <p className="text-sm">No tables available</p>
                  </div>
                ) : (
                  availableTables.map(table => (
                    <button
                      key={table.id}
                      onClick={() => {
                        if (selectedReservation) {
                          void handleAssignTable(selectedReservation, table.id);
                          setSelectedReservation(null);
                        }
                      }}
                      disabled={!selectedReservation}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        selectedReservation
                          ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer'
                          : 'border-gray-200 cursor-default'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">Table {table.number}</p>
                          <p className="text-sm text-gray-600">{table.section}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="size-4" />
                            <span>{table.capacity}</span>
                          </div>
                          <span className="text-xs text-green-600">Available</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNewReservation && (
        <NewReservationModal
          onClose={() => setShowNewReservation(false)}
          onCreate={handleCreateReservation}
        />
      )}
    </div>
  );
};
