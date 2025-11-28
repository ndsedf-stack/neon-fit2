-- ═══════════════════════════════════════════════════════════════════
-- NEON FIT - Schéma Supabase
-- Exécute ce SQL dans l'éditeur SQL de ton dashboard Supabase
-- ═══════════════════════════════════════════════════════════════════

-- Table pour stocker les données workout de chaque utilisateur
CREATE TABLE IF NOT EXISTS workout_data (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_key TEXT NOT NULL,
  data_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data_key)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_workout_data_user_id ON workout_data(user_id);

-- Row Level Security (RLS) - Chaque utilisateur ne voit que ses données
ALTER TABLE workout_data ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : uniquement ses propres données
CREATE POLICY "Users can read own data" ON workout_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique d'insertion : uniquement pour soi-même
CREATE POLICY "Users can insert own data" ON workout_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique de mise à jour : uniquement ses propres données
CREATE POLICY "Users can update own data" ON workout_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique de suppression : uniquement ses propres données
CREATE POLICY "Users can delete own data" ON workout_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-update
DROP TRIGGER IF EXISTS trigger_update_workout_data ON workout_data;
CREATE TRIGGER trigger_update_workout_data
  BEFORE UPDATE ON workout_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
