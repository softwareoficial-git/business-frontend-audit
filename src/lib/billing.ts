import { apiClient } from '../lib/api';

export const createPaymentPreference = async (
  tenantId: number,
  plan: string,
  amount: number
) => {
  const response = await apiClient('/execute', {
    method: 'POST',
    body: JSON.stringify({
      cmd: 'BILLING:create-preference',
      params: {
        plan,
        amount,
        tenantId,
      },
    }),
  });

  return response.json();
};
