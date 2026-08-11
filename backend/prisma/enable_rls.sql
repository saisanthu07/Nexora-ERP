-- Enable Row Level Security (RLS) on all public tables created by Prisma
-- Since the backend accesses PostgreSQL using database connection pool (service role credentials / connection string),
-- enabling RLS without public policies protects your tables from unauthorized direct access via Supabase public REST API (PostgREST),
-- while your Node.js backend full-access connection string continues to work seamlessly.

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."stock_movements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."challan_sequence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."challans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."challan_items" ENABLE ROW LEVEL SECURITY;
