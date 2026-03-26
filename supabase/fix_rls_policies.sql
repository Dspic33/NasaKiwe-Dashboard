-- ============================================================
-- FIX: Row Level Security (RLS) - NASA KIWE Dashboard
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================
-- Este script permite que la 'anon key' pueda leer y escribir
-- en las tablas principales de la Bitácora.
-- ============================================================

-- 1. TABLA: proyectos
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read proyectos" ON public.proyectos;
CREATE POLICY "Allow public read proyectos"
  ON public.proyectos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert proyectos" ON public.proyectos;
CREATE POLICY "Allow public insert proyectos"
  ON public.proyectos FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update proyectos" ON public.proyectos;
CREATE POLICY "Allow public update proyectos"
  ON public.proyectos FOR UPDATE
  USING (true);

-- 2. TABLA: viviendas
ALTER TABLE public.viviendas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read viviendas" ON public.viviendas;
CREATE POLICY "Allow public read viviendas"
  ON public.viviendas FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert viviendas" ON public.viviendas;
CREATE POLICY "Allow public insert viviendas"
  ON public.viviendas FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update viviendas" ON public.viviendas;
CREATE POLICY "Allow public update viviendas"
  ON public.viviendas FOR UPDATE
  USING (true);

-- 3. TABLA: evidencias_obra
ALTER TABLE public.evidencias_obra ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read evidencias_obra" ON public.evidencias_obra;
CREATE POLICY "Allow public read evidencias_obra"
  ON public.evidencias_obra FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert evidencias_obra" ON public.evidencias_obra;
CREATE POLICY "Allow public insert evidencias_obra"
  ON public.evidencias_obra FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update evidencias_obra" ON public.evidencias_obra;
CREATE POLICY "Allow public update evidencias_obra"
  ON public.evidencias_obra FOR UPDATE
  USING (true);

-- ============================================================
-- VERIFICACION: Lista las politicas activas
-- ============================================================
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
