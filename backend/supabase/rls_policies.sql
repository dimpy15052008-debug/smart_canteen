-- SmartUni.Ai — Row Level Security Policies
-- Apply to Supabase project via: supabase db push or Dashboard SQL editor
-- The API uses the postgres role (bypasses RLS). RLS is defense-in-depth
-- for Supabase Realtime, PostgREST, and Storage.

-- ─── Enable RLS on all personal-data tables ─────────────────────────────────
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE students             ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty              ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_invoices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_tickets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_allocations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_passes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs            ENABLE ROW LEVEL SECURITY;

-- ─── Helper function for admin check ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ─── Profiles ────────────────────────────────────────────────────────────────
-- Users see their own profile; faculty & admins see students/profiles
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    auth.uid() = id OR is_admin() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'faculty')
  );

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id OR is_admin());

-- ─── Students ────────────────────────────────────────────────────────────────
CREATE POLICY students_select ON students
  FOR SELECT USING (
    profile_id = auth.uid() OR is_admin() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'faculty')
  );

-- ─── Notifications ───────────────────────────────────────────────────────────
-- Each user reads and updates only their own notifications (ensures Supabase Realtime safety)
CREATE POLICY notifications_owner_only ON notifications
  FOR ALL USING (user_id = auth.uid());

-- ─── Attendance Records ──────────────────────────────────────────────────────
-- Students read their own records; faculty see their course records; admin see all
CREATE POLICY attendance_records_select ON attendance_records
  FOR SELECT USING (
    student_id = auth.uid() OR is_admin() OR
    EXISTS (
      SELECT 1 FROM attendance_sessions s
      JOIN course_offerings co ON s.course_id = co.course_id
      WHERE s.id = attendance_records.session_id AND co.faculty_id = auth.uid()
    )
  );

-- ─── Fee Invoices & Payments ─────────────────────────────────────────────────
-- Students read their own invoices; admin sees all
CREATE POLICY fee_invoices_select ON fee_invoices
  FOR SELECT USING (student_id = auth.uid() OR is_admin());

CREATE POLICY payments_select ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fee_invoices f
      WHERE f.id = payments.invoice_id AND (f.student_id = auth.uid() OR is_admin())
    )
  );

-- ─── Canteen Orders ──────────────────────────────────────────────────────────
-- Students see their own orders; canteen staff and admin see all
CREATE POLICY canteen_orders_select ON canteen_orders
  FOR SELECT USING (
    student_id = auth.uid() OR is_admin() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'canteen')
  );

-- ─── Certificates ────────────────────────────────────────────────────────────
-- Students see their own requests; admin sees all
CREATE POLICY certificate_requests_select ON certificate_requests
  FOR SELECT USING (student_id = auth.uid() OR is_admin());

-- ─── Helpdesk Tickets & Messages ─────────────────────────────────────────────
CREATE POLICY helpdesk_tickets_select ON helpdesk_tickets
  FOR SELECT USING (student_id = auth.uid() OR is_admin());

CREATE POLICY helpdesk_messages_select ON helpdesk_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM helpdesk_tickets t
      WHERE t.id = helpdesk_messages.ticket_id AND (t.student_id = auth.uid() OR is_admin())
    )
  );

-- ─── Hostel & Gate Passes ────────────────────────────────────────────────────
CREATE POLICY hostel_allocations_select ON hostel_allocations
  FOR SELECT USING (student_id = auth.uid() OR is_admin());

CREATE POLICY gate_passes_select ON gate_passes
  FOR SELECT USING (student_id = auth.uid() OR is_admin());

-- ─── AI Conversations & Messages ─────────────────────────────────────────────
CREATE POLICY ai_conversations_owner ON ai_conversations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY ai_messages_owner ON ai_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ai_conversations c
      WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
    )
  );

-- ─── Recommendations & Interventions ─────────────────────────────────────────
CREATE POLICY recommendations_student ON recommendations
  FOR SELECT USING (student_id = auth.uid() OR is_admin());

CREATE POLICY interventions_admin ON interventions
  FOR ALL USING (is_admin());

-- ─── Audit Logs ──────────────────────────────────────────────────────────────
-- Append-only; admin read-only; no update/delete for anyone
CREATE POLICY audit_logs_admin_read ON audit_logs
  FOR SELECT USING (is_admin());
