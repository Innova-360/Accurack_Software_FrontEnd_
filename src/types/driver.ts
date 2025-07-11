export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  status: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  stores: { storeId: string }[];
}