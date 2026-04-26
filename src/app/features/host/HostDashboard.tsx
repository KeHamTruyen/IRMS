import React, { useState } from 'react';
import { useRestaurant } from '../../store/RestaurantContext';
import { Reservation, ReservationStatus } from '../../types';
import { Calendar, Clock, Users, Phone, CheckCircle, XCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { NewReservationModal } from './NewReservationModal';

export const HostDashboard: React.FC = () => {
  const { tables, reservations, updateReservation, updateTableStatus } = useRestaurant();
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const todayReservations = reservations.filter(r => {
    const today = new Date().toDateString();
    return r.date.toDateString() === today;
  });

  const pendingReservations = todayReservations.filter(r => r.status === 'pending');
  const confirmedReservations = todayReservations.filter(r => r.status === 'confirmed');

  const availableTables = tables.filter(t => t.status === 'available');

  const handleConfirmReservation = (reservation: Reservation) => {
    updateReservation({ ...reservation, status: 'confirmed' });
    toast.success('Reservation confirmed');
  };

  const handleCancelReservation = (reservation: Reservation) => {
    updateReservation({ ...reservation, status: 'cancelled' });
    if (reservation.tableId) {
      updateTableStatus(reservation.tableId, 'available');
    }
    toast.success('Reservation cancelled');
  };

  const handleSeatGuests = (reservation: Reservation) => {
    if (reservation.tableId) {
      updateReservation({ ...reservation, status: 'seated' });
      updateTableStatus(reservation.tableId, 'occupied');
      toast.success('Guests seated');
    } else {
      toast.error('Please assign a table first');
    }
  };

  const handleAssignTable = (reservation: Reservation, tableId: string) => {
    updateReservation({ ...reservation, tableId, status: 'confirmed' });
    updateTableStatus(tableId, 'reserved');
    toast.success('Table assigned');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Host Dashboard</h1>
            <p className="text-gray-600">Manage reservations and table assignments</p>
          </div>
          <button
            onClick={() => setShowNewReservation(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
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
                                onClick={() => handleConfirmReservation(reservation)}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleCancelReservation(reservation)}
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
                              onClick={() => handleSeatGuests(reservation)}
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
                          handleAssignTable(selectedReservation, table.id);
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
        <NewReservationModal onClose={() => setShowNewReservation(false)} />
      )}
    </div>
  );
};
