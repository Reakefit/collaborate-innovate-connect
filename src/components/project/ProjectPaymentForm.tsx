
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentModel } from '@/types/database';
import { PaymentModelOption } from '@/config/projectConfig';

interface ProjectPaymentFormProps {
  paymentModel: PaymentModel;
  setPaymentModel: (model: PaymentModel) => void;
  stipendAmount: number | null;
  setStipendAmount: (amount: number | null) => void;
  paymentModels: PaymentModelOption[];
  errors: Record<string, string>;
}

export const ProjectPaymentForm: React.FC<ProjectPaymentFormProps> = ({
  paymentModel,
  setPaymentModel,
  stipendAmount,
  setStipendAmount,
  paymentModels,
  errors
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Model */}
        <div>
          <label htmlFor="paymentModel" className="block text-sm font-medium mb-1">
            Payment Model <span className="text-red-500">*</span>
          </label>
          <select
            id="paymentModel"
            value={paymentModel}
            onChange={(e) => setPaymentModel(e.target.value as PaymentModel)}
            className={`w-full p-2 border rounded ${errors.payment_model ? 'border-red-500' : 'border-gray-300'}`}
          >
            {paymentModels.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
          {errors.payment_model && <p className="text-red-500 text-sm mt-1">{errors.payment_model}</p>}
        </div>
        
        {/* Payment Details based on selected model */}
        {paymentModel === 'stipend' && (
          <div>
            <label htmlFor="stipendAmount" className="block text-sm font-medium mb-1">
              Stipend Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2">$</span>
              <input
                id="stipendAmount"
                type="number"
                min="0"
                value={stipendAmount || ''}
                onChange={(e) => setStipendAmount(parseFloat(e.target.value) || null)}
                className={`w-full p-2 pl-8 border rounded ${errors.stipend_amount ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter amount"
              />
            </div>
            {errors.stipend_amount && <p className="text-red-500 text-sm mt-1">{errors.stipend_amount}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
