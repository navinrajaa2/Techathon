import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const taxonomyPath = path.join(__dirname, '../data/taxonomy.json');

function loadTaxonomy() {
  const data = fs.readFileSync(taxonomyPath, 'utf8');
  return JSON.parse(data);
}

/**
 * Extracts skill vectors from unstructured free-text user descriptions.
 * Uses smart keyword taxonomy matching and proficiency heuristics.
 */
export function parseFreeTextSkills(text) {
  if (!text || typeof text !== 'string') {
    return { parsed_skills: {}, detected_mentions: [] };
  }

  const taxonomy = loadTaxonomy();
  const normalized = text.toLowerCase();
  const parsedVector = {};
  const detectedMentions = [];

  // Keywords mapping for each skill
  const skillKeywords = {
    sql_mastery: ["sql", "postgres", "mysql", "queries", "select", "join", "joins", "bigquery", "snowflake", "database", "warehousing"],
    python_analytics: ["python", "pandas", "numpy", "jupyter", "script", "scripts", "automation", "pyspark"],
    tableau_bi: ["tableau", "power bi", "powerbi", "bi", "dashboard", "dashboards", "visualization", "reports", "looker"],
    stat_modeling: ["stat", "statistics", "a/b test", "hypothesis", "regression", "probability", "p-value", "experiment"],
    llm_engineering: ["llm", "rag", "langchain", "prompt", "vector db", "openai", "claude", "gpt", "embeddings", "llama"],
    react_frontend: ["react", "jsx", "frontend", "hooks", "components", "javascript", "typescript", "tailwind", "css"],
    node_express: ["node", "express", "backend", "api", "rest", "server", "middleware", "expressjs"],
    system_design: ["system design", "architecture", "microservices", "caching", "redis", "kafka", "scalability", "load balancer"],
    product_discovery: ["product", "user research", "interviews", "wireframe", "scoping", "mvp", "discovery"],
    ai_product_strategy: ["ai strategy", "ai product", "ethics", "precision", "recall", "ai roadmap"],
    docker_k8s: ["docker", "kubernetes", "k8s", "container", "containers", "pod", "helm"],
    cicd_terraform: ["ci/cd", "github actions", "terraform", "iac", "pipeline", "deployments"]
  };

  for (const skill of taxonomy.skills) {
    const keywords = skillKeywords[skill.id] || [skill.name.toLowerCase()];
    let matchesCount = 0;

    keywords.forEach(kw => {
      if (normalized.includes(kw)) {
        matchesCount++;
      }
    });

    if (matchesCount > 0) {
      // Proficiency heuristic
      let estimatedLevel = 1;
      if (normalized.includes("expert") || normalized.includes("senior") || normalized.includes("mastered") || normalized.includes("years of") || matchesCount >= 3) {
        estimatedLevel = 4;
      } else if (normalized.includes("built") || normalized.includes("proficient") || normalized.includes("solid") || matchesCount === 2) {
        estimatedLevel = 3;
      } else if (normalized.includes("basic") || normalized.includes("some") || normalized.includes("learning") || normalized.includes("started")) {
        estimatedLevel = 2;
      } else {
        estimatedLevel = 2;
      }

      parsedVector[skill.id] = estimatedLevel;
      detectedMentions.push({
        skill_id: skill.id,
        skill_name: skill.name,
        estimated_level: estimatedLevel,
        matches_found: matchesCount
      });
    }
  }

  return {
    parsed_skills: parsedVector,
    detected_mentions: detectedMentions,
    raw_text: text
  };
}
