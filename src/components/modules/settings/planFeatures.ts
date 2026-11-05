import { UNLIMITED, type Capability } from "../../../stores/settings/subscription";

interface FeatureGroup {
  summary: string;
  capabilities: Array<{ value: string; line: string }>;
}

// A plan with a whole group gets the summary; a plan with part of it gets the individual lines,
// so the list never promises more than the plan includes.
const FEATURE_GROUPS: FeatureGroup[] = [
  {
    summary: "Full feed management",
    capabilities: [
      { value: "add_feed_stock", line: "Keep track of your feed stock" },
      { value: "add_feed_consumption", line: "Record daily feed consumption" },
      { value: "set_feed_finishing_limit", line: "Get alerts before your feed runs out" },
    ],
  },
  {
    summary: "Full water management",
    capabilities: [
      { value: "add_water_refilled", line: "Record water tank refills" },
      { value: "add_water_consumption", line: "Record daily water consumption" },
      { value: "water_quality_checks", line: "Log water quality checks" },
      { value: "clean_water_tanks", line: "Keep a record of water tank cleaning" },
    ],
  },
  {
    summary: "Bird health tracking",
    capabilities: [
      { value: "add_medication_vaccination", line: "Record medication and vaccinations" },
      { value: "add_mortality_loss", line: "Record bird deaths and losses" },
      { value: "record_sick_birds", line: "Record sick birds" },
      { value: "sick_bird_recovery", line: "Track sick bird recovery" },
    ],
  },
  {
    summary: "Egg production tracking",
    capabilities: [
      { value: "daily_egg_record", line: "Record daily egg collection" },
      { value: "egg_in_store_record", line: "Keep track of eggs in store" },
    ],
  },
  {
    summary: "Sales and customer records",
    capabilities: [
      { value: "egg_sales", line: "Record egg sales" },
      { value: "add_consumer_biodata", line: "Save your customers' details" },
    ],
  },
  {
    summary: "Farm upkeep and monitoring",
    capabilities: [
      { value: "litter_pushing", line: "Keep a record of litter management" },
      { value: "clean_external_tanks", line: "Keep a record of external tank cleaning" },
      { value: "environmental_monitoring", line: "Monitor your farm's environment" },
      { value: "bird_stock_checks", line: "Check and track your bird stock" },
    ],
  },
  {
    summary: "Farm financial records",
    capabilities: [{ value: "financial_record", line: "Farm financial records" }],
  },
  {
    summary: "Flock overview and weekly reports",
    capabilities: [
      { value: "flock_laying_cycle_overview", line: "See your flock's laying cycle at a glance" },
      { value: "weekly_summary_reports", line: "Get weekly summary reports" },
    ],
  },
  {
    summary: "Verify and manage your staff",
    capabilities: [{ value: "staff_verification_and_management", line: "Verify and manage your staff" }],
  },
];

const LIMIT_CAPABILITIES = ["create_farmhouse", "create_batch"];
const VET_CAPABILITIES = ["vet_platform_access", "vet_chat_only", "vet_full_access"];

const KNOWN_CAPABILITIES = new Set([
  ...LIMIT_CAPABILITIES,
  ...VET_CAPABILITIES,
  ...FEATURE_GROUPS.flatMap((group) => group.capabilities.map((c) => c.value)),
]);

// A limit the admin hasn't finished typing is null, so the preview doesn't show "up to 0"
const limitLine = (limit: number | null, singular: string, plural: string, suffix = "") => {
  if (limit === null) return `Create ${plural}${suffix}`;
  if (limit === UNLIMITED) return `Create unlimited ${plural}${suffix}`;
  return limit === 1 ? `Create 1 ${singular}${suffix}` : `Create up to ${limit} ${plural}${suffix}`;
};

// Each vet level includes the one below it, so only the highest is listed
const vetLine = (capabilities: string[]) => {
  if (capabilities.includes("vet_full_access")) return "Chat with veterinarians and book veterinary services";
  if (capabilities.includes("vet_chat_only")) return "Chat with veterinarians";
  if (capabilities.includes("vet_platform_access")) return "Access the veterinary platform";
  return null;
};

export function generatePlanFeatures(
  capabilities: string[],
  maxFarmhouses: number | null,
  maxBatches: number | null,
  availableCapabilities: Capability[] = []
): string[] {
  const features: string[] = [];

  if (capabilities.includes("create_farmhouse")) features.push(limitLine(maxFarmhouses, "farmhouse", "farmhouses"));
  if (capabilities.includes("create_batch")) features.push(limitLine(maxBatches, "batch", "batches", " per farmhouse"));

  FEATURE_GROUPS.forEach((group) => {
    const included = group.capabilities.filter((c) => capabilities.includes(c.value));
    if (included.length === group.capabilities.length) features.push(group.summary);
    else features.push(...included.map((c) => c.line));
  });

  const vet = vetLine(capabilities);
  if (vet) features.push(vet);

  // A capability added on the backend later still shows, using the backend's label
  capabilities
    .filter((value) => !KNOWN_CAPABILITIES.has(value))
    .forEach((value) => features.push(availableCapabilities.find((c) => c.value === value)?.label ?? value));

  return features;
}
