-- Library Management & Organization - StudySpark
-- Tables: library_folders, library_tags, library_study_tags, study_permissions, library_audit_logs
-- Extends studies with folder_id, description, is_public, version for audit

-- Library folders table
CREATE TABLE IF NOT EXISTS library_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES library_folders(id) ON DELETE CASCADE,
  position_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_library_folders_owner ON library_folders(owner_id);
CREATE INDEX IF NOT EXISTS idx_library_folders_parent ON library_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_library_folders_order ON library_folders(parent_folder_id, position_order);

ALTER TABLE library_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "library_folders_select_own" ON library_folders
  FOR SELECT USING (auth.uid() = owner_id AND NOT is_deleted);

CREATE POLICY "library_folders_insert_own" ON library_folders
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "library_folders_update_own" ON library_folders
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "library_folders_delete_own" ON library_folders
  FOR DELETE USING (auth.uid() = owner_id);

-- Add folder_id to studies (after library_folders exists)
ALTER TABLE studies DROP CONSTRAINT IF EXISTS studies_folder_id_fkey;
ALTER TABLE studies ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES library_folders(id) ON DELETE SET NULL;
ALTER TABLE studies ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE studies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE studies ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE studies ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;
-- Backfill title from topic for existing rows
UPDATE studies SET title = topic WHERE title IS NULL OR title = '';
ALTER TABLE studies ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_studies_folder_id ON studies(folder_id);
CREATE INDEX IF NOT EXISTS idx_studies_is_deleted ON studies(user_id, is_deleted);

-- Library tags table
CREATE TABLE IF NOT EXISTS library_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_tags_owner ON library_tags(owner_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_library_tags_owner_name ON library_tags(owner_id, LOWER(name));

ALTER TABLE library_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "library_tags_select_own" ON library_tags
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "library_tags_insert_own" ON library_tags
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "library_tags_update_own" ON library_tags
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "library_tags_delete_own" ON library_tags
  FOR DELETE USING (auth.uid() = owner_id);

-- Study-tags join table
CREATE TABLE IF NOT EXISTS library_study_tags (
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES library_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (study_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_library_study_tags_study ON library_study_tags(study_id);
CREATE INDEX IF NOT EXISTS idx_library_study_tags_tag ON library_study_tags(tag_id);

ALTER TABLE library_study_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "library_study_tags_select_via_study" ON library_study_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = library_study_tags.study_id AND s.user_id = auth.uid())
  );

CREATE POLICY "library_study_tags_insert_via_study" ON library_study_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = library_study_tags.study_id AND s.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM library_tags t WHERE t.id = library_study_tags.tag_id AND t.owner_id = auth.uid())
  );

CREATE POLICY "library_study_tags_delete_via_study" ON library_study_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = library_study_tags.study_id AND s.user_id = auth.uid())
  );

-- Study permissions (sharing)
CREATE TABLE IF NOT EXISTS study_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'owner')),
  can_share BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(study_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_study_permissions_study ON study_permissions(study_id);
CREATE INDEX IF NOT EXISTS idx_study_permissions_user ON study_permissions(user_id);

ALTER TABLE study_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_permissions_select_own_or_shared" ON study_permissions
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM studies s WHERE s.id = study_permissions.study_id AND s.user_id = auth.uid())
  );

CREATE POLICY "study_permissions_insert_owner" ON study_permissions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = study_permissions.study_id AND s.user_id = auth.uid())
  );

CREATE POLICY "study_permissions_update_owner" ON study_permissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = study_permissions.study_id AND s.user_id = auth.uid())
  );

CREATE POLICY "study_permissions_delete_owner" ON study_permissions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM studies s WHERE s.id = study_permissions.study_id AND s.user_id = auth.uid())
  );

-- Library audit logs (resource-level actions)
CREATE TABLE IF NOT EXISTS library_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_audit_resource ON library_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_library_audit_action ON library_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_library_audit_performed_by ON library_audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_library_audit_created_at ON library_audit_logs(created_at DESC);

ALTER TABLE library_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "library_audit_logs_select_own" ON library_audit_logs
  FOR SELECT USING (auth.uid() = performed_by);

CREATE POLICY "library_audit_logs_insert_own" ON library_audit_logs
  FOR INSERT WITH CHECK (auth.uid() = performed_by);

-- Full-text search: tsvector with trigger for compatibility
ALTER TABLE studies ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION studies_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, coalesce(NEW.topic, ''))), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.topic, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.subject, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(COALESCE(NEW.topic_tags, '{}'), ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS studies_search_vector_update ON studies;
CREATE TRIGGER studies_search_vector_update
  BEFORE INSERT OR UPDATE OF title, description, topic, subject, topic_tags ON studies
  FOR EACH ROW EXECUTE FUNCTION studies_search_vector_trigger();

-- Backfill search_vector for existing rows
UPDATE studies SET topic = coalesce(topic, '') WHERE search_vector IS NULL;

CREATE INDEX IF NOT EXISTS idx_studies_search_vector ON studies USING GIN(search_vector) WHERE search_vector IS NOT NULL;

COMMENT ON TABLE library_folders IS 'Library folders for organizing studies';
COMMENT ON TABLE library_tags IS 'User-created tags for studies';
COMMENT ON TABLE library_study_tags IS 'Study-tag associations';
COMMENT ON TABLE study_permissions IS 'Sharing permissions for studies';
COMMENT ON TABLE library_audit_logs IS 'Audit trail for library resource actions';
