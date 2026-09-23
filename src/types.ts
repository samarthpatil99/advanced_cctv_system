export type UserRole =
  | 'STATE_ADMIN'
  | 'DISTRICT_ADMIN'
  | 'DEPARTMENT_OFFICER'
  | 'MAINTENANCE_OFFICER'
  | 'AUDITOR';

export type CameraStatus = 'OPERATIONAL' | 'OFFLINE' | 'MAINTENANCE' | 'UNKNOWN';

export type CameraType =
  | 'PTZ'
  | 'FIXED_DOME'
  | 'BULLET'
  | 'ANPR'
  | 'THERMAL'
  | 'PANORAMIC_360';

export type LifecycleStage =
  | 'NEW'
  | 'ACTIVE'
  | 'AGING'
  | 'CRITICAL_AGING'
  | 'REPLACEMENT_CANDIDATE'
  | 'RETIRED';

export type AgeGroup = '0-2 YRS' | '3-5 YRS' | '6-8 YRS' | '9+ YRS';

export type RedundancyLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';

export type MaintenancePriority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export type CoverageImportance =
  | 'A_CRITICAL_JUNCTION'
  | 'B_ARTERIAL_ROAD'
  | 'C_SECONDARY_SECTOR'
  | 'D_PERIPHERAL';

export type IntegrationTier =
  | 'DIRECT_CLOUD_INGESTION'
  | 'EDGE_GATEWAY_REQUIRED'
  | 'LEGACY_UPGRADE_REQUIRED';

export interface HealthBreakdown {
  connectivity: number; // 30% weight
  uptime: number; // 20% weight
  heartbeat_freshness: number; // 20% weight
  maintenance_compliance: number; // 15% weight
  failure_history_score: number; // 15% weight
}

export interface IntegrationCapabilities {
  rtsp: boolean;
  onvif: boolean;
  rest_api: boolean;
  vendor_sdk: boolean;
  metadata_stream: boolean;
  health_endpoint: boolean;
  vms_bridge: boolean;
  network_accessible: boolean;
}

export interface Camera {
  id: string;
  global_id: string; // GJ-{DISTRICT}-{DEPARTMENT}-{TYPE}-{NUMBER}
  original_source_id: string;
  department: string;
  district: string;
  city: string;
  ward: string;
  landmark: string;
  latitude: number;
  longitude: number;
  heading: number; // 0 - 360
  fov_angle: number; // 30 - 120
  mounting_height_m: number;
  type: CameraType;
  status: CameraStatus;
  vendor: string;
  model: string;
  serial_number: string;
  ip_address: string;
  mac_address: string;
  firmware_version: string;
  owner: string;
  custodian_officer: string;
  custodian_contact: string;
  installation_date: string;
  protocol: string;
  vms: string;
  capabilities: string[];
  health_score: number; // 0 - 100
  health_breakdown: HealthBreakdown;
  age_years: number;
  age_group: AgeGroup;
  lifecycle_stage: LifecycleStage;
  redundancy_level: RedundancyLevel;
  redundancy_note: string;
  redundancy_adjacent_count: number;
  coverage_score: number; // 0 - 100
  coverage_importance: CoverageImportance;
  data_confidence_score: number; // 0 - 100
  last_verified_at: string;
  provenance_source: string;
  provenance_updated_at: string;
  maintenance_priority: MaintenancePriority;
  maintenance_reason: string;
  integration_score: number; // 0 - 100
  integration_tier: IntegrationTier;
  integration_capabilities: IntegrationCapabilities;
  has_data_conflict: boolean;
  has_quality_issue: boolean;
  quality_issue_types: string[];
  synthetic_label: string; // 'SYNTHETIC DATA - DEMO'
}

export interface ConflictRecord {
  id: string;
  camera_id: string;
  camera_global_id: string;
  field_name: string;
  current_value: string;
  proposed_value: string;
  source: string;
  detected_at: string;
  confidence: number;
  status: 'PENDING' | 'RESOLVED_ACCEPTED' | 'RESOLVED_REJECTED' | 'RESOLVED_CUSTOM';
  resolved_by?: string;
  resolved_at?: string;
  resolution_reason?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  who: string;
  role: UserRole;
  what: string;
  entity_type: string;
  entity_id: string;
  old_value: string | null;
  new_value: string | null;
  reason: string;
  source: string;
}

export interface DashboardStats {
  total: number;
  operational: number;
  offline: number;
  maintenance: number;
  unknown: number;
  aging_count: number; // 6-8 yrs
  critical_aging_count: number; // 9+ yrs
  coverage_score_avg: number;
  coverage_target: number; // 90 DEMO Target
  coverage_debt: number; // max(90 - current, 0)
  data_confidence_avg: number;
  integration_readiness_avg: number;
  total_conflicts_pending: number;
  total_quality_anomalies: number;
  p1_maintenance_count: number;
  district_distribution: { district: string; count: number; operational: number; offline: number }[];
  department_distribution: { department: string; count: number }[];
  age_group_distribution: { age_group: string; count: number }[];
  type_distribution: { type: string; count: number }[];
}

export interface InvestmentCandidate {
  id: string;
  district: string;
  location_name: string;
  latitude: number;
  longitude: number;
  coverage_gap_pct: number;
  importance: CoverageImportance;
  redundancy_deficit: string;
  expected_coverage_gain_pct: number;
  strategic_rank_score: number; // 0 - 100
  rationale: string;
  zone_type: string;
}

export interface QueryInterpretation {
  raw_query: string;
  interpreted_intent: string;
  sql_translation: string;
  applied_filters: Record<string, any>;
  result_count: number;
}

export interface SentinelScanPayload {
  scan_id: string;
  district: string;
  sample_count: number;
  simulate_conflicts: boolean;
}

export interface SentinelScanResult {
  scan_id: string;
  district: string;
  processed_count: number;
  new_discovered_count: number;
  updated_count: number;
  conflicts_flagged: number;
  status: string;
}

// =========================================================================
// MODEL 2 — UNIFIED VIEWING & METADATA ANALYTICS PLATFORM TYPES
// =========================================================================

export type VideoAnalyticsEventType =
  | 'WATCHLIST_PLATE_HIT'
  | 'WRONG_WAY_DRIVING'
  | 'PERIMETER_INTRUSION'
  | 'TRAFFIC_CONGESTION'
  | 'ILLEGAL_PARKING'
  | 'CROWD_GATHERING'
  | 'ABANDONED_OBJECT'
  | 'SPEED_VIOLATION'
  | 'CAMERA_TAMPERING_OCCLUSION';

export type EventSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type EventStatus = 'NEW' | 'ACKNOWLEDGED' | 'IN_INVESTIGATION' | 'RESOLVED';

export interface VideoAnalyticsEvent {
  id: string;
  timestamp: string;
  camera_id: string;
  global_camera_id: string; // Model 1 Foreign Key
  camera_name: string;
  district: string;
  department: string;
  event_type: VideoAnalyticsEventType;
  severity: EventSeverity;
  status: EventStatus;
  confidence: number; // 0 - 100
  title: string;
  description: string;
  metadata: {
    license_plate?: string;
    vehicle_type?: string;
    vehicle_color?: string;
    speed_kmh?: number;
    speed_limit_kmh?: number;
    dwell_time_seconds?: number;
    crowd_density_pct?: number;
    bounding_box?: { x: number; y: number; width: number; height: number };
  };
  thumbnail_type: 'vehicle' | 'crowd' | 'perimeter' | 'traffic' | 'tampering';
  assigned_officer?: string;
}

export interface AnprHit {
  id: string;
  timestamp: string;
  camera_id: string;
  global_camera_id: string; // Model 1 Foreign Key
  district: string;
  location: string;
  plate_number: string;
  confidence: number; // 85 - 99%
  vehicle_category: 'SEDAN' | 'SUV' | 'MOTORCYCLE' | 'AUTO_RICKSHAW' | 'TRUCK' | 'BUS';
  vehicle_make: string;
  vehicle_color: string;
  speed_kmh: number;
  lane_number: number;
  direction: 'NORTHBOUND' | 'SOUTHBOUND' | 'EASTBOUND' | 'WESTBOUND';
  is_watchlist_match: boolean;
  watchlist_reason?: string;
  rto_state: string; // Gujarat (GJ)
  rto_division: string; // e.g., Ahmedabad RTO (GJ-01), Surat RTO (GJ-05)
  thumbnail_seed: number;
}

export interface WatchlistRecord {
  id: string;
  plate_number: string;
  owner_name: string;
  category: 'STOLEN_VEHICLE' | 'WANTED_SUSPECT' | 'CRIMINAL_INVESTIGATION' | 'EXPIRED_COMMERCIAL_FITNESS' | 'VIP_ESCORT';
  flagged_by: string;
  flagged_at: string;
  status: 'ACTIVE' | 'FLAGGED_INTERCEPTED' | 'ARCHIVED';
  notes: string;
}

export interface MetadataSearchFilter {
  target_type: 'VEHICLE' | 'PERSON' | 'ALL';
  district?: string;
  department?: string;
  camera_global_id?: string;
  vehicle_type?: string;
  color?: string;
  plate_query?: string;
  clothing_color?: string;
  accessory?: string;
  speed_min?: number;
  speed_max?: number;
  time_range: 'LAST_1_HOUR' | 'LAST_6_HOURS' | 'LAST_24_HOURS' | 'LAST_7_DAYS' | 'ALL';
}

export interface MetadataSearchResult {
  id: string;
  timestamp: string;
  camera_id: string;
  global_camera_id: string; // Model 1 Foreign Key
  district: string;
  landmark: string;
  latitude: number;
  longitude: number;
  category: 'VEHICLE' | 'PERSON';
  attributes: {
    type?: string;
    color?: string;
    make?: string;
    plate?: string;
    speed_kmh?: number;
    clothing_upper?: string;
    clothing_lower?: string;
    has_helmet?: boolean;
    has_backpack?: boolean;
  };
  confidence: number;
}

export interface CrossCameraWaypoint {
  sequence: number;
  timestamp: string;
  camera_id: string;
  global_camera_id: string; // Model 1 Foreign Key
  camera_name: string;
  district: string;
  latitude: number;
  longitude: number;
  plate_number: string;
  vehicle_desc: string;
  speed_kmh: number;
  time_delta_seconds: number;
  distance_meters: number;
}

export interface CrossCameraJourney {
  target_identifier: string; // e.g. "GJ-01-ER-4921 (Silver Hyundai Creta)"
  first_seen: string;
  last_seen: string;
  total_distance_km: number;
  average_speed_kmh: number;
  districts_traversed: string[];
  waypoints: CrossCameraWaypoint[];
  estimated_direction: string;
}

export interface InvestigationCase {
  id: string;
  case_number: string;
  title: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  status: 'ACTIVE' | 'REVIEW' | 'CLOSED';
  lead_investigator: string;
  created_at: string;
  incident_datetime: string;
  location_summary: string;
  description: string;
  pinned_camera_ids: string[]; // Model 1 global_camera_ids
  evidence_events: VideoAnalyticsEvent[];
  evidence_anpr_hits: AnprHit[];
  journey_trace?: CrossCameraJourney;
  notes: {
    id: string;
    timestamp: string;
    author: string;
    content: string;
  }[];
}

// =========================================================================
// MODEL 2 LIVE EVALUATION MODE & STREAM INGESTION TYPES
// =========================================================================

export type EvaluationMode = 'DEMO' | 'LIVE';
export type StreamStatus = 'LIVE' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
export type StreamProtocol = 'WHEP' | 'HLS' | 'RTSP_TCP';
export type StreamCodec = 'H264' | 'H265';

export interface LiveStreamChannel {
  stream_id: string;
  global_camera_id: string; // Model 1 Foreign Key
  name: string;
  district: string;
  landmark: string;
  camera_type: CameraType;
  rtsp_url: string;
  whep_url: string;
  hls_url: string;
  codec: StreamCodec;
  resolution: string;
  status: StreamStatus;
  protocol: StreamProtocol;
  force_tcp: boolean;
  pts_ticks: number; // 90kHz ticks
  pts_ms: number; // Presentation Time in ms
  pts_formatted: string;
  pts_delta_ms: number;
  jitter_ms: number;
  discontinuities_count: number;
  reconnect_count: number;
  backoff_delay_ms: number;
  failover_stage: 'PRIMARY_WHEP' | 'FALLBACK_HLS' | 'RECONNECTING' | 'OFFLINE';
  packet_loss_pct: number;
  bitrate_kbps: number;
  last_warning?: string;
  last_heartbeat: string;
}

export interface LiveEvaluationConfig {
  mode: EvaluationMode;
  sentinel_host: string;
  is_connected: boolean;
  last_ingest_time: string;
  camera_count: number;
  rtsp_forced_tcp: boolean;
  using_pts_timing: boolean;
  exponential_backoff_range: string;
  connection_error?: string;
  source_endpoint: string;
}

export interface LiveTestAssertion {
  label: string;
  passed: boolean;
  actual: string;
  expected: string;
}

export interface LiveTestSuiteResult {
  test_id: string;
  name: string;
  category: 'CATALOGUE' | 'CODEC' | 'PTS_TIMING' | 'RECONNECT' | 'FAILOVER';
  passed: boolean;
  duration_ms: number;
  details: string;
  assertions: LiveTestAssertion[];
}

