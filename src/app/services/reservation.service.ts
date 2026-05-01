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
}

const toFrontendStatus = (status: string): ReservationStatus => {
  const map: Record<string, ReservationStatus> = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SEATED: 'seated',
    CANCELLED: 'cancelled',
    NO_SHOW: 'cancelled',
  };
  return map[status] || 'pending';
};

const toBackendStatus = (status: ReservationStatus): string => {
  const map: Record<ReservationStatus, string> = {
    pending: 'PENDING',
    confirmed: 'CONFIRMED',
    seated: 'SEATED',
    cancelled: 'CANCELLED',
    completed: 'SEATED',
  };
  return map[status];
};

const mapReservation = (reservation: ReservationResponse): Reservation => ({
  id: reservation.id.toString(),
  customerName: reservation.customerName,
  customerPhone: reservation.customerPhone,
  guestCount: reservation.guestCount,
  date: new Date(reservation.reservationDate),
  time: reservation.reservationTime,
  status: toFrontendStatus(reservation.status),
  tableId: reservation.tableId?.toString(),
  notes: reservation.notes,
});

export const reservationService = {
  async getReservations(): Promise<Reservation[]> {
    const response = await api.get<ReservationResponse[]>('/reservations');
    const data = (response as any).data || response;
    return (Array.isArray(data) ? data : []).map(mapReservation);
  },

  async createReservation(payload: {
    customerName: string;
    customerPhone: string;
    guestCount: number;
    date: string;
    time: string;
    notes?: string;
  }): Promise<Reservation> {
    const response = await api.post<ReservationResponse>('/reservations', {
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      guestCount: payload.guestCount,
      reservationDate: payload.date,
      reservationTime: payload.time,
      notes: payload.notes,
      status: 'PENDING',
    });
    const data = (response as any).data || response;
    return mapReservation(data);
  },

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const response = await api.patch<ReservationResponse>(
      `/reservations/${id}/status`,
      null,
      { params: { status: toBackendStatus(status) } }
    );
    const data = (response as any).data || response;
    return mapReservation(data);
  },

  async assignTable(id: string, tableId: string): Promise<Reservation> {
    const response = await api.patch<ReservationResponse>(
      `/reservations/${id}/table`,
      null,
      { params: { tableId } }
    );
    const data = (response as any).data || response;
    return mapReservation(data);
  },
};
