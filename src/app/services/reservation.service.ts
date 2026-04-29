import api from './api';
import { Reservation, ReservationStatus } from '../types';

interface ReservationResponse {
  id: number;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  status: string;
  tableId?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateReservationRequest {
  customerName: string;
  customerPhone: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  notes?: string;
}

const mapStatus = (backendStatus: string): ReservationStatus => {
  const statusMap: Record<string, ReservationStatus> = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SEATED: 'seated',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  };

  return statusMap[backendStatus] || 'pending';
};

const mapStatusToBackend = (status: ReservationStatus): string => {
  const statusMap: Record<ReservationStatus, string> = {
    pending: 'PENDING',
    confirmed: 'CONFIRMED',
    seated: 'SEATED',
    cancelled: 'CANCELLED',
    completed: 'COMPLETED',
  };

  return statusMap[status];
};

const mapReservation = (backendReservation: ReservationResponse): Reservation => {
  return {
    id: backendReservation.id.toString(),
    customerName: backendReservation.customerName,
    customerPhone: backendReservation.customerPhone,
    guestCount: backendReservation.guestCount,
    date: new Date(backendReservation.reservationDate),
    time: backendReservation.reservationTime.slice(0, 5),
    status: mapStatus(backendReservation.status),
    tableId: backendReservation.tableId ? backendReservation.tableId.toString() : undefined,
    notes: backendReservation.notes,
  };
};

export const reservationService = {
  async getReservations(date?: Date, status?: ReservationStatus): Promise<Reservation[]> {
    const params: Record<string, string> = {};

    if (date) {
      params.date = date.toISOString().split('T')[0];
    }

    if (status) {
      params.status = mapStatusToBackend(status);
    }

    const response = await api.get<ReservationResponse[]>('/reservations', { params });
    const data = (response as any).data || response;
    const reservations = Array.isArray(data) ? data : [];

    return reservations.map(mapReservation);
  },

  async createReservation(payload: {
    customerName: string;
    customerPhone: string;
    guestCount: number;
    date: string;
    time: string;
    notes?: string;
  }): Promise<Reservation> {
    const request: CreateReservationRequest = {
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      guestCount: payload.guestCount,
      reservationDate: payload.date,
      reservationTime: payload.time,
      notes: payload.notes,
    };

    const response = await api.post<ReservationResponse>('/reservations', request);
    const data = (response as any).data || response;
    return mapReservation(data);
  },

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const response = await api.patch<ReservationResponse>(`/reservations/${id}/status`, null, {
      params: { status: mapStatusToBackend(status) },
    });
    const data = (response as any).data || response;
    return mapReservation(data);
  },

  async assignTable(id: string, tableId: string): Promise<Reservation> {
    const response = await api.patch<ReservationResponse>(`/reservations/${id}/assign-table`, null, {
      params: { tableId: parseInt(tableId, 10) },
    });
    const data = (response as any).data || response;
    return mapReservation(data);
  },
};
