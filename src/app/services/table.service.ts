// Table Service
import api from './api';
import { Table, TableStatus } from '../types';

// Backend DTO
interface TableResponse {
  id: number;
  tableNumber: string;
  capacity: number;
  status: string;
  location: string;
}

// Map backend table status to frontend
const mapTableStatus = (backendStatus: string): TableStatus => {
  const statusMap: Record<string, TableStatus> = {
    'AVAILABLE': 'available',
    'OCCUPIED': 'occupied',
    'RESERVED': 'reserved',
    'CLEANING': 'cleaning',
  };
  return statusMap[backendStatus] || 'available';
};

// Map backend status to frontend
const mapStatusToBackend = (frontendStatus: TableStatus): string => {
  const statusMap: Record<TableStatus, string> = {
    'available': 'AVAILABLE',
    'occupied': 'OCCUPIED',
    'reserved': 'RESERVED',
    'cleaning': 'CLEANING',
  };
  return statusMap[frontendStatus];
};

// Map backend table to frontend
const mapTable = (backendTable: TableResponse): Table => {
  return {
    id: backendTable.id.toString(),
    number: parseInt(backendTable.tableNumber.replace('T', '')),
    capacity: backendTable.capacity,
    status: mapTableStatus(backendTable.status),
    section: backendTable.location,
  };
};

export const tableService = {
  // Get all tables
  async getTables(status?: TableStatus): Promise<Table[]> {
    const params = status ? { status: mapStatusToBackend(status) } : {};
    const response = await api.get<TableResponse[]>('/tables', { params });
    const data = (response as any).data || response;
    const tables = Array.isArray(data) ? data : [];
    return tables.map(mapTable);
  },

  // Get table by ID
  async getTableById(id: string): Promise<Table> {
    const response = await api.get<TableResponse>(`/tables/${id}`);
    const data = (response as any).data || response;
    return mapTable(data);
  },

  // Update table status
  async updateTableStatus(id: string, status: TableStatus): Promise<Table> {
    const backendStatus = mapStatusToBackend(status);
    const response = await api.patch<TableResponse>(
      `/tables/${id}/status`,
      null,
      { params: { status: backendStatus } }
    );
    const data = (response as any).data || response;
    return mapTable(data);
  },
};
