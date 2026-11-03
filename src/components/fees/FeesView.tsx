import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { FeeInvoice } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  ShieldCheck,
  Building,
  QrCode,
  DollarSign,
  ArrowRight,
  AlertCircle,
  X,
  Sparkles,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FeesView: React.FC = () => {
  const { feeInvoices, payFees, currentUser } = useApp();
  const shouldReduceMotion = useReducedMotion();

  const [payingInvoice, setPayingInvoice] = useState<FeeInvoice | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<FeeInvoice | null>(null);
  const [verifyingTxnInvoice, setVerifyingTxnInvoice] = useState<FeeInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(15000);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NetBanking' | 'Card'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const activeInvoice = feeInvoices[0];
  const totalAmount = feeInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const paidAmount = feeInvoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const paidPercent = totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : '100';

  const handlePay = async () => {
    if (!payingInvoice) return;
    setIsProcessingPayment(true);
    await new Promise((r) => setTimeout(r, 1200));

    payFees(payingInvoice.id, paymentAmount);
    setIsProcessingPayment(false);
    setPaymentSuccess(true);

    if (!shouldReduceMotion) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1'],
        });
      } catch {
        // ignore
      }
    }
  };

  const closePaymentModal = () => {
    setPayingInvoice(null);
    setPaymentSuccess(false);
    setIsProcessingPayment(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* 1. Page Header */}
      <PageHeader
        title="Fees & Institutional Finance"
        subtitle="Semester tuition ledger, installment history, payment receipts, and digital banking receipts."
        badge={
          pendingAmount > 0 ? (
            <Badge variant="warning">Due ₹{pendingAmount.toLocaleString()}</Badge>
          ) : (
            <Badge variant="success">All Dues Cleared</Badge>
          )
        }
        action={
          pendingAmount > 0 ? (
            <Button
              variant="primary"
              onClick={() => {
                setPayingInvoice(activeInvoice);
                setPaymentAmount(pendingAmount);
              }}
              leftIcon={<CreditCard className="w-4 h-4" />}
            >
              Pay Balance (₹{pendingAmount.toLocaleString()})
            </Button>
          ) : undefined
        }
      />

      {/* 2. Segmented Balance Summary Band */}
      <Card surface="elevated" className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase font-mono font-bold text-slate-400">
              Academic Year 2026 - 2027 Summary
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
              ₹{totalAmount.toLocaleString()} Total Semester Obligation
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block">Cleared</span>
              <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                ₹{paidAmount.toLocaleString()} ({paidPercent}%)
              </strong>
            </div>
            <div className="h-8 w-0.5 bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-slate-400 block">Remaining</span>
              <strong className="text-amber-600 dark:text-amber-400 text-sm">
                ₹{pendingAmount.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Visual Segmented Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${paidPercent}%` }}
              title={`Paid: ${paidPercent}%`}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${100 - Number(paidPercent)}%` }}
              title={`Pending: ${100 - Number(paidPercent)}%`}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Paid via HDFC SmartGateway: ₹{paidAmount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Balance Pending: ₹{pendingAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Deadline Timeline with Urgency */}
      {pendingAmount > 0 && (
        <Card surface="base" className="p-4 border-l-4 border-l-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="warning">Upcoming Deadline</Badge>
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                  October 15, 2026 (16 Days Remaining)
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                Installment 2 Payment Due Date
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Late penalty of ₹50/day applies automatically after October 15 per institutional finance rules.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setPayingInvoice(activeInvoice);
              setPaymentAmount(pendingAmount);
            }}
            className="shrink-0"
          >
            Clear Dues Now
          </Button>
        </Card>
      )}

      {/* 4. Invoices & Receipts Catalog */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Semester Invoices & Payment Receipts
        </h3>

        <div className="space-y-4">
          {feeInvoices.map((invoice) => {
            const isFullyPaid = invoice.status === 'paid';
            const bal = invoice.totalAmount - invoice.paidAmount;

            return (
              <Card key={invoice.id} surface="base" className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        {invoice.invoiceNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {invoice.semester}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Academic Session {invoice.academicYear}</p>
                  </div>

                  <StatusPill
                    status={isFullyPaid ? 'success' : 'warning'}
                    label={isFullyPaid ? 'Fully Paid' : `Balance Due: ₹${bal.toLocaleString()}`}
                  />
                </div>

                {/* Component Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Tuition Fee</span>
                    <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 font-semibold">
                      ₹{invoice.tuitionFee.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Development Fee</span>
                    <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 font-semibold">
                      ₹{invoice.developmentFee.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Exam Fee</span>
                    <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 font-semibold">
                      ₹{invoice.examFee.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Hostel & Mess</span>
                    <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 font-semibold">
                      ₹{invoice.hostelFee.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500 font-mono">
                    Cleared: <strong className="text-emerald-600">₹{invoice.paidAmount.toLocaleString()}</strong> of ₹{invoice.totalAmount.toLocaleString()}
                    {invoice.transactionId && (
                      <span className="ml-2 text-slate-400">
                        (Ref: {invoice.transactionId})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {invoice.paidAmount > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setVerifyingTxnInvoice(invoice)}
                        leftIcon={<QrCode className="w-3.5 h-3.5 text-indigo-500" />}
                      >
                        Verify QR
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewingReceipt(invoice)}
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                    >
                      Receipt PDF
                    </Button>

                    {!isFullyPaid && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setPayingInvoice(invoice);
                          setPaymentAmount(bal);
                        }}
                        leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                      >
                        Pay ₹{bal.toLocaleString()}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. Payment Flow Dialog */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card surface="elevated" className="max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  University Payment Gateway
                </h3>
              </div>
              <button
                onClick={closePaymentModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!paymentSuccess ? (
              <div className="space-y-4">
                <div className="bg-indigo-50/50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Beneficiary</span>
                    <strong className="text-slate-800 dark:text-slate-200">SmartUni Treasury Trust</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Student Enrollment</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">0827CS221045</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Invoice Ref</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{payingInvoice.invoiceNumber}</strong>
                  </div>
                </div>

                {/* Amount input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount to Pay (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['UPI', 'NetBanking', 'Card'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                          paymentMethod === method
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handlePay}
                    isLoading={isProcessingPayment}
                    className="w-full font-bold"
                  >
                    Authorize Payment (₹{paymentAmount.toLocaleString()})
                  </Button>
                </div>
              </div>
            ) : (
              /* Payment Success State */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl ring-4 ring-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Payment Successful!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    ₹{paymentAmount.toLocaleString()} has been credited to University Accounts.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-left space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="font-bold text-indigo-600">TXN-2026-9842A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timestamp:</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      closePaymentModal();
                      setViewingReceipt(payingInvoice);
                    }}
                    className="flex-1"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    View Receipt
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={closePaymentModal}
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 6. Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card surface="elevated" className="max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Official University Fee Receipt
                </h3>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs font-mono space-y-2">
              <div className="flex justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">Student</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">Roll Number</span>
                <span>0827CS221045</span>
              </div>
              <div className="flex justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">Receipt No</span>
                <span>RCP-{viewingReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">Amount Paid</span>
                <span className="font-bold text-emerald-600 text-sm">₹{viewingReceipt.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-500 font-bold uppercase">VERIFIED & CLEARED</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex-1"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setViewingReceipt(null)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 7. QR Verification Modal */}
      {verifyingTxnInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card surface="elevated" className="max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <span>Cryptographic Transaction QR</span>
            </h3>

            {/* QR Visual */}
            <div className="w-44 h-44 mx-auto p-3 bg-white rounded-2xl border-2 border-indigo-500 shadow-md flex items-center justify-center">
              <div className="grid grid-cols-7 grid-rows-7 gap-1 w-full h-full">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i % 2 === 0 && i % 3 === 0) || i < 7 || i > 42 || i % 7 === 0
                        ? 'bg-slate-900'
                        : 'bg-indigo-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500 font-mono">
              Signed by University Digital Signer • SHA-256
            </p>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setVerifyingTxnInvoice(null)}
              className="w-full"
            >
              Done
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
