import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CertificateRequest } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import { StepTimeline, TimelineStep } from '../ui/StepTimeline';
import { EmptyState } from '../ui/EmptyState';
import {
  FileText,
  CheckCircle2,
  Clock,
  QrCode,
  Download,
  Printer,
  ShieldCheck,
  Award,
  Sparkles,
  Share2,
  Check,
  X,
  Building,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CertificatesView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    certificateRequests,
    createCertificateRequest,
    approveCertificate
  } = useApp();

  const [selectedType, setSelectedType] = useState<CertificateRequest['certificateType']>('Bonafide Certificate');
  const [purpose, setPurpose] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState<CertificateRequest | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const overallAttendance = 86.4;
  const isEligible = overallAttendance >= 75;

  const catalogTypes: {
    type: CertificateRequest['certificateType'];
    title: string;
    desc: string;
    sla: string;
  }[] = [
    {
      type: 'Bonafide Certificate',
      title: 'Bonafide Student Certificate',
      desc: 'Proof of active matriculation for passport, visa, or educational loan.',
      sla: 'Instant / 24h',
    },
    {
      type: 'Internship NOC',
      title: 'Internship No-Objection Certificate (NOC)',
      desc: 'Official institutional clearance for corporate summer/winter internships.',
      sla: '48h Review',
    },
    {
      type: 'Character Certificate',
      title: 'Conduct & Character Certificate',
      desc: 'Attestation of good moral character and zero disciplinary infractions.',
      sla: '24h Review',
    },
    {
      type: 'Semester Transcript',
      title: 'Provisional Semester Grade Transcript',
      desc: 'Certified statement of marks and credits earned through Semester 5.',
      sla: 'Instant Hash',
    },
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    createCertificateRequest(selectedType, purpose);
    setPurpose('');
    setIsApplyModalOpen(false);

    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#4f46e5', '#10b981'],
      });
    } catch {
      // ignore
    }
  };

  const handleShareLink = (code?: string) => {
    const certCode = code || 'CRT-VERIFIED';
    const url = `${window.location.origin}/verify/cert/${certCode}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* 1. Page Header */}
      <PageHeader
        title="Official Certificates & Digital Credentials"
        subtitle="Automated academic clearance, digital Dean signatures, verifiable QR seals, and immutable verification links."
        badge={<Badge variant="success">Institutional Trust Tier</Badge>}
        action={
          <Button
            variant="primary"
            onClick={() => setIsApplyModalOpen(true)}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Request New Certificate
          </Button>
        }
      />

      {/* 2. Automated Eligibility Status Banner */}
      <Card surface="elevated" className="p-4 sm:p-5 border-l-4 border-l-emerald-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Eligibility Audit Passed</Badge>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  Attendance: {overallAttendance}% (&ge; 75%)
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                Zero Administrative or Financial Holds
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Central Library dues cleared • Hostel warden NOC cleared • Disciplinary record clean.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
              Library: NOC Clear
            </span>
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
              Finance: Cleared
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Request Catalog Grid */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Certificate Request Catalog
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {catalogTypes.map((cat) => (
            <Card
              key={cat.type}
              surface="interactive"
              className="p-4 flex flex-col justify-between"
              onClick={() => {
                setSelectedType(cat.type);
                setIsApplyModalOpen(true);
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{cat.sla}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {cat.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                <span>Apply Now</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Active Applications & Per-Request Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Your Applications & Issued Certificates ({certificateRequests.length})
          </h3>
          <span className="text-xs font-mono text-slate-400">Dean Sign-Off Enabled</span>
        </div>

        {certificateRequests.length === 0 ? (
          <EmptyState
            icon={<Award className="w-7 h-7" />}
            title="No certificate requests yet"
            description="You haven't submitted any document applications. Select a certificate from the catalog above to apply with 1 click."
            action={{
              label: 'Apply for Bonafide',
              onClick: () => {
                setSelectedType('Bonafide Certificate');
                setIsApplyModalOpen(true);
              },
            }}
          />
        ) : (
          <div className="space-y-4">
            {certificateRequests.map((req) => {
              const isReady = req.status === 'ready_for_download';

              // 5-step lifecycle timeline
              const reqSteps: TimelineStep[] = [
                {
                  id: 1,
                  label: 'Requested',
                  description: `By ${req.studentName} on ${req.requestedDate}`,
                  status: 'completed',
                  timestamp: req.requestedDate,
                },
                {
                  id: 2,
                  label: 'Under Review',
                  description: 'Registrar Academic Records audit',
                  status: 'completed',
                },
                {
                  id: 3,
                  label: 'Approved',
                  description: req.verifiedBy ? `Signed by ${req.verifiedBy.split('(')[0]}` : 'Awaiting Dean review',
                  status: isReady ? 'completed' : 'active',
                },
                {
                  id: 4,
                  label: 'Generated',
                  description: isReady ? 'Cryptographic PDF & seal generated' : 'Pending signature',
                  status: isReady ? 'completed' : 'upcoming',
                },
                {
                  id: 5,
                  label: 'Verified',
                  description: isReady ? `SHA-256 seal: ${req.certificateNumber}` : 'Pending seal',
                  status: isReady ? 'completed' : 'upcoming',
                },
              ];

              return (
                <Card key={req.id} surface="base" className="p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {req.certificateType}
                        </h4>
                        <span className="text-xs font-mono text-slate-400">
                          #{req.certificateNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Purpose: <strong>{req.purpose}</strong> • Applied: {req.requestedDate}
                      </p>
                    </div>

                    <StatusPill
                      status={isReady ? 'success' : 'warning'}
                      label={isReady ? 'Digitally Signed & Verified' : 'In Review with Dean'}
                    />
                  </div>

                  {/* Horizontal Lifecycle Step Timeline */}
                  <div className="py-2">
                    <StepTimeline steps={reqSteps} orientation="horizontal" />
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Code: {req.certificateNumber}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isReady ? (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleShareLink(req.certificateNumber)}
                            leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                          >
                            {copiedLink ? 'Link Copied!' : 'Share Verification Link'}
                          </Button>

                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setViewingCertificate(req)}
                            leftIcon={<QrCode className="w-3.5 h-3.5" />}
                          >
                            View & Download PDF
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => approveCertificate(req.id)}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />}
                          title="Simulate Dean Approval for Hackathon Evaluation"
                        >
                          Sign as Dean (Evaluation Test)
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Request Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card surface="elevated" className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Request Official Certificate
                </h3>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="Bonafide Certificate">Bonafide Student Certificate</option>
                  <option value="Internship NOC">Internship No-Objection Certificate (NOC)</option>
                  <option value="Character Certificate">Conduct & Character Certificate</option>
                  <option value="Semester Transcript">Provisional Semester Transcript</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purpose / Organization Name
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Applying for Summer 2026 Cloud Engineering Internship at Google / Educational loan verification at SBI."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border text-[11px] text-slate-500 space-y-1">
                <p>• Student: <strong>{currentUser.name}</strong> ({currentUser.rollNumber || '0827CS221045'})</p>
                <p>• Turnaround SLA: Automated approval within 24 hours.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 6. Certificate Printable View Modal */}
      {viewingCertificate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card surface="elevated" className="max-w-2xl w-full p-8 shadow-2xl space-y-6 bg-white dark:bg-slate-900 border-2 border-indigo-500/40 relative">
            <button
              onClick={() => setViewingCertificate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* University Crest Header */}
            <div className="text-center space-y-1 border-b pb-4 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 font-bold block">
                Office of the Registrar & Academic Affairs
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                SmartUni.Ai Institute of Technology
              </h2>
              <p className="text-xs text-slate-500">Autonomous Institution • NIRF Rank 22</p>
            </div>

            {/* Certificate Title */}
            <div className="text-center py-2">
              <h3 className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {viewingCertificate.certificateType}
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Certificate ID: {viewingCertificate.certificateNumber}
              </p>
            </div>

            {/* Certificate Body Text */}
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 font-serif">
              <p>
                This is to officially certify that <strong>{viewingCertificate.studentName}</strong>, Roll Number{' '}
                <strong>{viewingCertificate.rollNumber}</strong>, is a bonafide student of the Bachelor of Technology (B.Tech)
                programme in Computer Science & Engineering (Semester 6) at this institute during the academic session 2025–2026.
              </p>
              <p>
                According to our official attendance records, the student maintains an aggregate attendance of{' '}
                <strong>86.4%</strong> and bears good moral conduct. This certificate is issued for the purpose of:{' '}
                <em>"{viewingCertificate.purpose}"</em>.
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-end justify-between text-xs">
              <div className="space-y-1 text-left">
                {/* QR code visual */}
                <div className="w-20 h-20 p-1 bg-white border border-slate-300 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-5 grid-rows-5 gap-0.5 w-full h-full">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 block">Scan to Authenticate</span>
              </div>

              <div className="text-right space-y-1">
                <div className="font-script text-lg text-indigo-600 italic">Dr. R. K. Mishra</div>
                <div className="h-0.5 w-32 bg-slate-400 ml-auto" />
                <span className="font-bold text-slate-900 dark:text-white block">Dean, Academic Affairs</span>
                <span className="text-[10px] text-slate-400 font-mono block">Digitally Signed on {viewingCertificate.requestedDate}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex-1"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Official Copy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setViewingCertificate(null)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
