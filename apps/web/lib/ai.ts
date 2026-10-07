import { generateText, Output } from "ai";
import { z } from "zod";

export const FAST_MODEL =
  process.env.AI_MODEL_FAST ?? "openai/gpt-5.6-luna";

export const DEEP_MODEL =
  process.env.AI_MODEL_DEEP ?? "openai/gpt-6-sol";

export const engineKeys = [
  "ECONOMIC_ROI",
  "ASPIRATION_TRANSFORMATION",
  "RISK_MANDATORY",
  "TRANSACTION_ASSET",
  "NETWORK_MARKETPLACE",
  "CONVENIENCE_EXPERIENCE",
] as const;

export const evidenceLevels = [
  "HYPOTHESIS",
  "DESK_RESEARCH",
  "CUSTOMER_BEHAVIOR",
  "COMMERCIAL_COMMITMENT",
  "MONEY",
  "OBSERVED_OUTCOME",
] as const;

export { generateText, Output, z };
