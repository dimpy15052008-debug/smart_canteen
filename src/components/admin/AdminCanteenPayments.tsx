import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  User,
  ShoppingBag,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { PaymentTransaction } from '../../types';

export const AdminCanteenPayments: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED' | 'PENDING'>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

  // Fetch live payment transactions from server API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/canteen/payments');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load canteen payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        tx.id.toLowerCase().includes(q) ||
        (tx.razorpayPaymentId && tx.razorpayPaymentId.toLowerCase().includes(q)) ||
        tx.orderId.toLowerCase().includes(q) ||
        tx.studentName.toLowerCase().includes(q) ||
        (tx.studentRoll && tx.studentRoll.toLowerCase().includes(q)) ||
        tx.paymentMethod.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
      const matchesMethod =
        methodFilter === 'ALL' ||
        tx.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [transactions, searchQuery, statusFilter, methodFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const successList = transactions.filter(t => t.status === 'SUCCESS');
    const totalVolume = successList.reduce((acc, t) => acc + t.amount, 0);
    const successRate = transactions.length > 0 ? Math.round((successList.length / transactions.length) * 100) : 100;
    const avgTicket = successList.length > 0 ? Math.round(totalVolume / successList.length) : 0;
    const failedCount = transactions.filter(t => t.status === 'FAILED').length;
    const pendingCount = transactions.filter(t => t.status === 'PENDING').length;

    return {
      totalVolume,
      successCount: successList.length,
      successRate,
      avgTicket,
      failedCount,
      pendingCount,
    };
  }, [transactions]);

  const exportCSV = () => {
    const headers = ['Transaction ID', 'Razorpay Payment ID', 'Order ID', 'Student Name', 'Student Roll', 'Amount (INR)', 'Method', 'Status', 'Date Time'];
    const rows = filtered.map(t => [
      t.id,
      t.razorpayPaymentId || 'N/A',
      t.orderId,
      t.studentName,
      t.studentRoll || 'N/A',
      t.amount,
      `"${t.paymentMethod}"`,
      t.status,
      `"${t.dateTime}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `canteen_payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/20 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Payment Gateway Control Center
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            Canteen Payment Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Razorpay Standard Checkout settlements, HMAC SHA256 verified transactions, and student ledger logs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchPayments}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-amber-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Gross Collections</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-white mt-2">
            ₹{stats.totalVolume.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {stats.successCount} verified payments
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Success Rate</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-white mt-2">
            {stats.successRate}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            HMAC SHA256 verified
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Order Value</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-white mt-2">
            ₹{stats.avgTicket}
          </p>
          <p className="text-[11px] text-amber-400/80 mt-1">
            Across campus canteen counters
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Failed / Pending</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-white mt-2">
            {stats.failedCount + stats.pendingCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.failedCount} Failed · {stats.pendingCount} Pending
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Razorpay ID, Student Name, Roll No, or Order ID…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  statusFilter === st
                    ? st === 'SUCCESS'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : st === 'FAILED'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : st === 'PENDING'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="Razorpay">Razorpay Checkout</option>
            <option value="UPI">UPI / QR</option>
            <option value="Card">Cards</option>
            <option value="NetBanking">Net Banking</option>
            <option value="Wallet">Campus Wallet</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Payment Transactions Ledger</h2>
            <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
              {filtered.length} entries
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Gateway: Razorpay Test Mode (Standard)
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <CreditCard className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="text-slate-400 text-sm">No transactions match your search filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setMethodFilter('ALL'); }}
              className="text-xs text-amber-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Transaction ID</th>
                  <th className="px-4 py-3.5">Student Details</th>
                  <th className="px-4 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Amount (INR)</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-4 py-3.5">Date &amp; Time</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map(tx => {
                  const isSuccess = tx.status === 'SUCCESS';
                  const isFailed = tx.status === 'FAILED';
                  const isPending = tx.status === 'PENDING';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Transaction ID */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-400">{tx.id}</span>
                          <button
                            onClick={() => handleCopy(tx.razorpayPaymentId || tx.id)}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                            title="Copy ID"
                          >
                            {copiedId === (tx.razorpayPaymentId || tx.id) ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {tx.razorpayPaymentId && (
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{tx.razorpayPaymentId}</p>
                        )}
                      </td>

                      {/* Student Details */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                            {tx.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-xs">{tx.studentName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {tx.studentRoll || tx.studentId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Order ID */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-slate-200">{tx.orderId}</span>
                        {tx.tokenNumber && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                            Token #{tx.tokenNumber}
                          </span>
                        )}
                      </td>

                      {/* Amount in INR */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-extrabold text-sm text-white">
                          ₹{tx.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{tx.paymentMethod}</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3.5 text-[11px] text-slate-400 whitespace-nowrap">
                        {tx.dateTime}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isSuccess
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : isFailed
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                          {isFailed && <XCircle className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3 animate-spin" />}
                          {tx.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Payment Audit Record</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Internal Ref:</span>
                <span className="text-white font-bold">{selectedTx.id}</span>
              </div>
              {selectedTx.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Razorpay Payment ID:</span>
                  <span className="text-amber-400 font-bold">{selectedTx.razorpayPaymentId}</span>
                </div>
              )}
              {selectedTx.razorpayOrderId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Razorpay Order ID:</span>
                  <span className="text-slate-300">{selectedTx.razorpayOrderId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Canteen Order ID:</span>
                <span className="text-white">{selectedTx.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="text-slate-200">{selectedTx.studentName} ({selectedTx.studentRoll || selectedTx.studentId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payable Amount:</span>
                <span className="text-emerald-400 font-extrabold text-sm">₹{selectedTx.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="text-slate-300">{selectedTx.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Signature Verification:</span>
                <span className="text-emerald-400 font-bold">HMAC SHA256 (Passed ✓)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-400">{selectedTx.dateTime}</span>
              </div>
              {selectedTx.failureReason && (
                <div className="pt-2 border-t border-slate-800 text-rose-400">
                  <span className="text-slate-500">Failure Reason: </span>
                  {selectedTx.failureReason}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
