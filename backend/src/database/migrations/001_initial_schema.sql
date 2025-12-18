-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE customer_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE feedback_source AS ENUM ('support', 'nps', 'appstore', 'social');
CREATE TYPE feedback_status AS ENUM ('new', 'reviewed', 'assigned', 'resolved');
CREATE TYPE sentiment_type AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE category_type AS ENUM ('bug', 'feature', 'complaint', 'praise', 'question');

-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  tier customer_tier NOT NULL DEFAULT 'free',
  company_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  type category_type NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  source feedback_source NOT NULL,
  content TEXT NOT NULL,
  urgency_score INTEGER CHECK (urgency_score >= 0 AND urgency_score <= 100),
  urgency_reasoning TEXT,
  sentiment sentiment_type DEFAULT 'neutral',
  status feedback_status DEFAULT 'new',
  frequency_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create feedback_tags table
CREATE TABLE feedback_tags (
  id SERIAL PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(feedback_id, tag)
);

-- Create indexes for performance
CREATE INDEX idx_feedback_urgency_created ON feedback(urgency_score DESC, created_at DESC);
CREATE INDEX idx_feedback_category ON feedback(category_id);
CREATE INDEX idx_feedback_customer ON feedback(customer_id);
CREATE INDEX idx_feedback_source ON feedback(source);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX idx_feedback_content_search ON feedback USING gin(to_tsvector('english', content));
CREATE INDEX idx_feedback_metadata ON feedback USING gin(metadata);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_tier ON customers(tier);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_feedback_tags_tag ON feedback_tags(tag);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories with keywords
INSERT INTO categories (name, type, keywords, description) VALUES
  ('Bug Report', 'bug', ARRAY['crash', 'error', 'broken', 'not working', 'bug', 'issue', 'fails', 'freezes', 'stuck', 'glitch', '500', '404', 'problem', 'wrong'], 'Issues and bugs reported by users'),
  ('Feature Request', 'feature', ARRAY['wish', 'would be nice', 'should add', 'feature request', 'suggestion', 'can you', 'please add', 'missing', 'need', 'want', 'could you'], 'Feature requests and enhancement suggestions'),
  ('Complaint', 'complaint', ARRAY['frustrated', 'angry', 'terrible', 'worst', 'disappointed', 'useless', 'waste', 'slow', 'poor', 'bad experience', 'unhappy', 'horrible'], 'Customer complaints and negative experiences'),
  ('Praise', 'praise', ARRAY['love', 'great', 'amazing', 'awesome', 'excellent', 'perfect', 'thank you', 'fantastic', 'best', 'wonderful', 'incredible', 'outstanding'], 'Positive feedback and praise'),
  ('Question', 'question', ARRAY['how do i', 'how to', 'can i', 'is it possible', 'where is', 'what is', '?', 'help', 'confused', 'understand', 'explain'], 'Questions and requests for clarification');

-- Add comments to tables for documentation
COMMENT ON TABLE customers IS 'Customer/user information including tier and company details';
COMMENT ON TABLE categories IS 'Feedback categories with associated keywords for classification';
COMMENT ON TABLE feedback IS 'Main feedback table storing all customer feedback from multiple sources';
COMMENT ON TABLE feedback_tags IS 'Tags associated with feedback items for flexible categorization';

COMMENT ON COLUMN feedback.urgency_score IS 'Urgency score from 0-100, calculated by LLM based on multiple factors';
COMMENT ON COLUMN feedback.frequency_count IS 'Number of similar feedback items (denormalized for performance)';
COMMENT ON COLUMN feedback.metadata IS 'Source-specific metadata stored as JSONB for flexibility';
