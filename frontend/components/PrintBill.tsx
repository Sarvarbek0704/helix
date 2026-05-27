"use client";
import { X, Printer } from "lucide-react";
import { format } from "date-fns";

interface PrintBillProps {
  bill: any;
  onClose: () => void;
}

export function PrintBill({ bill, onClose }: PrintBillProps) {
  const handlePrint = () => window.print();

  const items = bill.items || [];
  const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 print:bg-transparent print:p-0 print:inset-auto print:relative">
      <div className="bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto print:shadow-none print:rounded-none print:max-h-none">
        {/* Actions (hidden on print) */}
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="font-semibold text-lg">Invoice Preview</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-helix-600 text-white rounded-lg text-sm hover:bg-helix-700 transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice content */}
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-helix-700">HELIX</h1>
              <p className="text-sm text-gray-500 mt-1">Healthcare Management System</p>
              <p className="text-sm text-gray-500">123 Medical Center Drive</p>
              <p className="text-sm text-gray-500">contact@helixhealthcare.com</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
              <p className="text-sm text-gray-500 mt-1">#{bill.id?.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm text-gray-500">
                Date: {bill.createdAt ? format(new Date(bill.createdAt), "MMM d, yyyy") : "—"}
              </p>
              {bill.dueDate && (
                <p className="text-sm text-gray-500">
                  Due: {format(new Date(bill.dueDate), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>

          {/* Patient info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Bill To</p>
            <p className="font-semibold text-gray-800">
              {bill.patient
                ? `${bill.patient.firstName} ${bill.patient.lastName}`
                : "Patient"}
            </p>
            {bill.patient?.email && <p className="text-sm text-gray-600">{bill.patient.email}</p>}
          </div>

          {/* Items table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-sm font-semibold text-gray-600">Description</th>
                <th className="text-right py-2 text-sm font-semibold text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 text-sm">{item.description || item.name || `Item ${i + 1}`}</td>
                    <td className="py-3 text-sm text-right">${Number(item.amount || 0).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-sm">Medical Services</td>
                  <td className="py-3 text-sm text-right">${Number(bill.totalAmount || 0).toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-56 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${(items.length > 0 ? subtotal : Number(bill.totalAmount || 0)).toFixed(2)}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-${Number(bill.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Paid</span>
                <span className="text-green-600">${Number(bill.paidAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t-2 border-gray-200 pt-2">
                <span>Balance Due</span>
                <span>${(Number(bill.totalAmount || 0) - Number(bill.paidAmount || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                bill.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : bill.status === "partial"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {bill.status?.toUpperCase() || "PENDING"}
              </span>
              {bill.paidAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Paid on {format(new Date(bill.paidAt), "MMM d, yyyy")}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-400">Thank you for choosing Helix Healthcare</p>
          </div>
        </div>
      </div>
    </div>
  );
}
