import fs from 'fs';
import path from 'path';
import {
  Camera,
  CameraStatus,
  CameraType,
  LifecycleStage,
  AgeGroup,
  RedundancyLevel,
  MaintenancePriority,
  CoverageImportance,
  IntegrationTier,
  ConflictRecord,
  AuditLogEntry,
  DashboardStats,
  InvestmentCandidate,
  QueryInterpretation,
  UserRole,
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'cctv_registry_store.json');

// District definitions in Gujarat with geographic bounds and centers
export const GUJARAT_DISTRICTS = [
  { code: 'AHM', name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, count: 125, radius: 0.12 },
  { code: 'SUR', name: 'Surat', lat: 21.1702, lng: 72.8311, count: 115, radius: 0.10 },
  { code: 'VAD', name: 'Vadodara', lat: 22.3072, lng: 73.1812, count: 75, radius: 0.08 },
  { code: 'RAJ', name: 'Rajkot', lat: 22.3039, lng: 70.8022, count: 65, radius: 0.07 },
  { code: 'GAN', name: 'Gandhinagar', lat: 23.2156, lng: 72.6369, count: 48, radius: 0.06 },
  { code: 'BHA', name: 'Bhavnagar', lat: 21.7645, lng: 72.1519, count: 36, radius: 0.05 },
  { code: 'JAM', name: 'Jamnagar', lat: 22.4707, lng: 70.0577, count: 32, radius: 0.05 },
  { code: 'JUN', name: 'Junagadh', lat: 21.5222, lng: 70.4579, count: 26, radius: 0.04 },
  { code: 'KUT', name: 'Kutch-Kandla', lat: 23.0131, lng: 70.1337, count: 26, radius: 0.08 },
  { code: 'ANA', name: 'Anand', lat: 22.5645, lng: 72.9289, count: 22, radius: 0.04 },
];

export const DEPARTMENTS = [
  { code: 'POLICE', name: 'Gujarat Police / Traffic Command', owner: 'Home Department, Govt of Gujarat' },
  { code: 'MUNICIPAL', name: 'Municipal Smart City Corporation', owner: 'Urban Development & Housing' },
  { code: 'TRANSPORT', name: 'GSRTC & Bus Rapid Transit', owner: 'Transport Department, Gujarat' },
  { code: 'MARITIME', name: 'Gujarat Maritime Board & Port SEZ', owner: 'Ports and Transport Department' },
  { code: 'HIGHWAY', name: 'State Highways & Toll Infrastructure', owner: 'Roads & Buildings Department' },
];

export const CAMERA_TYPES: CameraType[] = [
  'PTZ',
  'FIXED_DOME',
  'BULLET',
  'ANPR',
  'THERMAL',
  'PANORAMIC_360',
];

export const VENDORS = ['Hikvision Enterprise', 'Axis Communications', 'Hanwha Techwin', 'Dahua SmartCity', 'Bosch Security', 'CP Plus Indigo'];
export const VMS_SYSTEMS = ['Milestone XProtect Corporate', 'Genetec Security Center', 'Sentinel VMS Enterprise', 'Qognify Ocularis', 'Nx Witness VMS'];

export interface DatabaseState {
  cameras: Camera[];
  conflicts: ConflictRecord[];
  audit_logs: AuditLogEntry[];
  investment_candidates: InvestmentCandidate[];
  config: {
    coverage_target: number;
    last_synced_sentinel: string;
  };
}

class DatabaseService {
  private state: DatabaseState = {
    cameras: [],
    conflicts: [],
    audit_logs: [],
    investment_candidates: [],
    config: {
      coverage_target: 90,
      last_synced_sentinel: new Date().toISOString(),
    },
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_PATH)) {
      try {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.state = JSON.parse(raw);
        console.log(`[DB] Loaded ${this.state.cameras.length} cameras from persistent store.`);
        return;
      } catch (err) {
        console.warn('[DB] Failed to parse existing store, regenerating demo data...', err);
      }
    }

    this.generateSyntheticSeed();
    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving store:', err);
    }
  }

  public resetDatabase() {
    this.generateSyntheticSeed();
    this.save();
    return { status: 'ok', count: this.state.cameras.length };
  }

  private generateSyntheticSeed() {
    const cameras: Camera[] = [];
    const conflicts: ConflictRecord[] = [];
    const audit_logs: AuditLogEntry[] = [];
    let globalCounter = 1000;

    const today = new Date('2026-09-14T00:00:00Z');

    // Create cameras for each district
    for (const dist of GUJARAT_DISTRICTS) {
      for (let i = 0; i < dist.count; i++) {
        globalCounter++;
        const dept = DEPARTMENTS[i % DEPARTMENTS.length];
        const type = CAMERA_TYPES[i % CAMERA_TYPES.length];
        const numberStr = String(10000 + i + (dist.code.charCodeAt(0) * 10)).slice(-5);
        const global_id = `GJ-${dist.code}-${dept.code}-${type.replace('_', '')}-${numberStr}`;

        // Perturb coordinates realistically around district core
        // Adding radial clustering along simulated road intersections
        const angle = (i * 137.5) * (Math.PI / 180);
        const distRatio = Math.sqrt((i + 1) / dist.count) * dist.radius;
        let lat = dist.lat + Math.sin(angle) * distRatio;
        let lng = dist.lng + Math.cos(angle) * distRatio;

        // Introduce deliberate edge cases for Data Quality testing
        const isCoordinateAnomaly = i === 12 && dist.code === 'AHM'; // Outside Gujarat bounds
        if (isCoordinateAnomaly) {
          lat = 28.6139; // Delhi coordinate anomaly
          lng = 77.2090;
        }

        const isDuplicateLocation = i === 7 && dist.code === 'SUR'; // Almost identical coordinate
        if (isDuplicateLocation && cameras.length > 0) {
          lat = cameras[cameras.length - 1].latitude + 0.00003; // ~3 meters
          lng = cameras[cameras.length - 1].longitude + 0.00002;
        }

        // Installation date: create variety of age groups (0-2, 3-5, 6-8, 9+ years)
        const yearsAgo = (i % 11) + (i % 3 === 0 ? 0.3 : 0.7);
        const installDate = new Date(today.getTime() - yearsAgo * 365.25 * 24 * 3600 * 1000);
        const installDateStr = installDate.toISOString().split('T')[0];
        const age_years = Math.round(yearsAgo * 10) / 10;

        let age_group: AgeGroup = '0-2 YRS';
        if (age_years >= 9) age_group = '9+ YRS';
        else if (age_years >= 6) age_group = '6-8 YRS';
        else if (age_years >= 3) age_group = '3-5 YRS';

        let lifecycle_stage: LifecycleStage = 'ACTIVE';
        if (age_years < 1) lifecycle_stage = 'NEW';
        else if (age_years >= 9) lifecycle_stage = 'CRITICAL_AGING';
        else if (age_years >= 7) lifecycle_stage = 'REPLACEMENT_CANDIDATE';
        else if (age_years >= 5) lifecycle_stage = 'AGING';

        // Camera Status distribution
        let status: CameraStatus = 'OPERATIONAL';
        if (i % 9 === 0) status = 'OFFLINE';
        else if (i % 14 === 0) status = 'MAINTENANCE';
        else if (i % 23 === 0) status = 'UNKNOWN';

        // Health Breakdown (prototype formula: 30% conn, 20% uptime, 20% heartbeat, 15% maint, 15% fail)
        let conn = status === 'OPERATIONAL' ? 95 + (i % 5) : status === 'MAINTENANCE' ? 40 : status === 'UNKNOWN' ? 10 : 0;
        let uptime = status === 'OPERATIONAL' ? 92 + (i % 8) : 35;
        let heartbeat = status === 'OPERATIONAL' ? 98 : status === 'MAINTENANCE' ? 50 : 5;
        let maint = lifecycle_stage === 'CRITICAL_AGING' ? 50 : 85 + (i % 15);
        let failureScore = status === 'OFFLINE' ? 25 : status === 'MAINTENANCE' ? 45 : 90;

        const health_score = Math.round(
          0.30 * conn + 0.20 * uptime + 0.20 * heartbeat + 0.15 * maint + 0.15 * failureScore
        );

        // Importance
        let coverage_importance: CoverageImportance = 'B_ARTERIAL_ROAD';
        if (i % 4 === 0) coverage_importance = 'A_CRITICAL_JUNCTION';
        else if (i % 4 === 2) coverage_importance = 'C_SECONDARY_SECTOR';
        else if (i % 4 === 3) coverage_importance = 'D_PERIPHERAL';

        // Redundancy calculation: High / Medium / Low / Critical
        let redundancy_level: RedundancyLevel = 'MEDIUM';
        let redundancy_note = '1 adjacent camera covers ~50% overlapping field of view.';
        let redundancy_adjacent_count = 1 + (i % 3);

        if (i % 7 === 0 && coverage_importance === 'A_CRITICAL_JUNCTION') {
          redundancy_level = 'CRITICAL';
          redundancy_adjacent_count = 0;
          redundancy_note = 'Zero overlapping cameras within 400m. Failure causes immediate blind spot at junction.';
        } else if (i % 5 === 0) {
          redundancy_level = 'LOW';
          redundancy_adjacent_count = 1;
          redundancy_note = 'Limited peripheral angle overlap (<20%). High coverage degradation on failure.';
        } else if (i % 3 === 0) {
          redundancy_level = 'HIGH';
          redundancy_adjacent_count = 3;
          redundancy_note = 'Triple overlapping coverage. Failure causes zero surveillance loss.';
        }

        // Coverage Score & Local Debt (Demo formula)
        const coverage_score = Math.min(100, Math.max(30, Math.round(72 + Math.sin(i) * 20 - (status === 'OFFLINE' ? 18 : 0))));

        // Maintenance Priority: P1 Critical, P2 High, P3 Medium, P4 Low
        let maintenance_priority: MaintenancePriority = 'P4_LOW';
        let maintenance_reason = 'Routine scheduled inspection cycle.';

        if (status === 'OFFLINE' && (redundancy_level === 'CRITICAL' || coverage_importance === 'A_CRITICAL_JUNCTION')) {
          maintenance_priority = 'P1_CRITICAL';
          maintenance_reason = 'Device offline at critical junction with zero redundancy. Immediate dispatch required.';
        } else if (status === 'OFFLINE' || (status === 'MAINTENANCE' && redundancy_level === 'LOW')) {
          maintenance_priority = 'P2_HIGH';
          maintenance_reason = 'Connectivity loss with secondary coverage deficit. High risk of area blindspot.';
        } else if (health_score < 65 || age_years > 8) {
          maintenance_priority = 'P3_MEDIUM';
          maintenance_reason = 'Telemetry degradation and aging hardware components approaching EOL.';
        }

        // Integration Readiness
        const isModern = age_years < 5;
        const integration_details = {
          rtsp: isModern || i % 2 === 0,
          onvif: isModern || i % 3 !== 0,
          rest_api: isModern && i % 2 === 0,
          vendor_sdk: true,
          metadata_stream: isModern && (type === 'ANPR' || type === 'PTZ'),
          health_endpoint: isModern,
          vms_bridge: true,
          network_accessible: status !== 'UNKNOWN',
        };

        const trueCount = Object.values(integration_details).filter(Boolean).length;
        const integration_score = Math.round((trueCount / 8) * 100);

        let integration_tier: IntegrationTier = 'DIRECT_CLOUD_INGESTION';
        if (integration_score < 50) integration_tier = 'LEGACY_UPGRADE_REQUIRED';
        else if (integration_score < 75) integration_tier = 'EDGE_GATEWAY_REQUIRED';

        // Data quality checks
        const quality_issue_types: string[] = [];
        if (isCoordinateAnomaly) quality_issue_types.push('COORDINATE_OUT_OF_BOUNDS');
        if (isDuplicateLocation) quality_issue_types.push('POTENTIAL_COORDINATE_DUPLICATE');
        if (i % 17 === 0) quality_issue_types.push('MISSING_FIRMWARE_SPEC');
        if (i % 29 === 0) quality_issue_types.push('STALE_UNVERIFIED_180_DAYS');
        if (i % 41 === 0) quality_issue_types.push('INCOMPLETE_CUSTODIAN_CONTACT');

        const has_quality_issue = quality_issue_types.length > 0;
        const data_confidence_score = has_quality_issue
          ? Math.max(40, 85 - quality_issue_types.length * 15)
          : Math.min(100, 92 + (i % 8));

        // Verification date
        const verifiedDaysAgo = (i % 190);
        const lastVerifiedDate = new Date(today.getTime() - verifiedDaysAgo * 24 * 3600 * 1000).toISOString().split('T')[0];

        // Has conflict?
        const has_data_conflict = (i % 24 === 0);

        const camera: Camera = {
          id: `cam-${dist.code.toLowerCase()}-${i + 1}`,
          global_id,
          original_source_id: `SRC-${dept.code.slice(0, 3)}-${1000 + i}`,
          department: dept.name,
          district: dist.name,
          city: dist.name,
          ward: `Ward-${(i % 16) + 1} (${['Central', 'North', 'East', 'West', 'South', 'South-West'][(i % 6)]} Zone)`,
          landmark: `${dist.name} Cross Road ${i + 1}, Near ${['Circle', 'Flyover', 'Metro Station', 'BRTS Terminal', 'Toll Plaza', 'Industrial Gate'][(i % 6)]}`,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          heading: (i * 45) % 360,
          fov_angle: type === 'PANORAMIC_360' ? 360 : type === 'PTZ' ? 90 : 65,
          mounting_height_m: 6.5 + (i % 4),
          type,
          status,
          vendor: VENDORS[i % VENDORS.length],
          model: `${VENDORS[i % VENDORS.length].split(' ')[0]}-Pro-${4000 + (i % 500)}`,
          serial_number: `SN-GJ-${dist.code}-${88000 + i}`,
          ip_address: `10.${dist.code.charCodeAt(0) % 30}.${(i % 250) + 1}.${(i * 3) % 250 + 2}`,
          mac_address: `A4:7B:2C:${(10 + (i % 80)).toString(16).toUpperCase()}:${(20 + (i % 70)).toString(16).toUpperCase()}:${(30 + (i % 60)).toString(16).toUpperCase()}`,
          firmware_version: quality_issue_types.includes('MISSING_FIRMWARE_SPEC') ? '' : `v4.${(i % 8) + 1}.${(i % 20)}`,
          owner: dept.owner,
          custodian_officer: quality_issue_types.includes('INCOMPLETE_CUSTODIAN_CONTACT') ? '' : `Officer ${['V. Patel', 'K. Sharma', 'R. Solanki', 'M. Joshi', 'A. Trivedi', 'S. Desai'][(i % 6)]} (DYSP / Exec Eng.)`,
          custodian_contact: quality_issue_types.includes('INCOMPLETE_CUSTODIAN_CONTACT') ? '' : `+91 98${(70000000 + i).toString().slice(0, 8)}`,
          installation_date: installDateStr,
          protocol: isModern ? 'ONVIF Profile S / RTSP / HTTPS' : 'Legacy RTSP Stream',
          vms: VMS_SYSTEMS[i % VMS_SYSTEMS.length],
          capabilities: [
            type === 'ANPR' ? 'Automated Number Plate Recognition' : 'Motion Detection',
            'IR Night Vision (up to 50m)',
            ...(type === 'PTZ' ? ['30x Optical Zoom', 'Preset Tour Traversal'] : []),
            ...(type === 'THERMAL' ? ['Perimeter Heat Mapping'] : []),
            ...(isModern ? ['Edge AI Vehicle Classifier'] : []),
          ],
          health_score,
          health_breakdown: {
            connectivity: conn,
            uptime,
            heartbeat_freshness: heartbeat,
            maintenance_compliance: maint,
            failure_history_score: failureScore,
          },
          age_years,
          age_group,
          lifecycle_stage,
          redundancy_level,
          redundancy_note,
          redundancy_adjacent_count,
          coverage_score,
          coverage_importance,
          data_confidence_score,
          last_verified_at: lastVerifiedDate,
          provenance_source: i % 2 === 0 ? 'Municipal Smart City API Ingestion' : 'State Police Master Database v2.1',
          provenance_updated_at: new Date(today.getTime() - (i % 14) * 86400000).toISOString(),
          maintenance_priority,
          maintenance_reason,
          integration_score,
          integration_tier,
          integration_capabilities: integration_details,
          has_data_conflict,
          has_quality_issue,
          quality_issue_types,
          synthetic_label: 'SYNTHETIC DATA - DEMO ONLY',
        };

        cameras.push(camera);

        // Generate field conflict records for demo
        if (has_data_conflict) {
          const conflictFields = [
            { field: 'firmware_version', current: camera.firmware_version, proposed: 'v5.1.0-Patch3', src: 'Sentinel Automated Device Scan' },
            { field: 'status', current: camera.status, proposed: camera.status === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL', src: 'District Field Dispatch Survey' },
            { field: 'owner', current: camera.owner, proposed: 'Unified Smart City Authority', src: 'State Asset Transfer Notification 2026' },
            { field: 'vms', current: camera.vms, proposed: 'Sentinel VMS Enterprise', src: 'VMS Gateway Auto-Registration' },
          ];
          const choice = conflictFields[i % conflictFields.length];
          conflicts.push({
            id: `conf-${conflicts.length + 1}`,
            camera_id: camera.id,
            camera_global_id: camera.global_id,
            field_name: choice.field,
            current_value: String(choice.current),
            proposed_value: choice.proposed,
            source: choice.src,
            detected_at: new Date(today.getTime() - (i % 7) * 86400000).toISOString(),
            confidence: 82 + (i % 15),
            status: 'PENDING',
          });
        }
      }
    }

    // Seed realistic audit log entries
    const sampleActions = [
      { who: 'Rajesh Shah', role: 'STATE_ADMIN' as UserRole, what: 'RECONCILE_FIELD_CONFLICT', entity: 'GJ-AHM-POLICE-ANPR-10024', old: 'v4.1.2', new: 'v5.1.0-Patch3', reason: 'Verified via Sentinel auto-patch ingestion logs', src: 'UI Reconcile Dialog' },
      { who: 'Ketan Parikh', role: 'DISTRICT_ADMIN' as UserRole, what: 'UPDATE_MAINTENANCE_STATUS', entity: 'GJ-SUR-MUNICIPAL-PTZ-10045', old: 'OFFLINE', new: 'MAINTENANCE', reason: 'Optical cleaning and power PSU replacement technician dispatched', src: 'District Maintenance Portal' },
      { who: 'Amit Dave', role: 'MAINTENANCE_OFFICER' as UserRole, what: 'P1_DISPATCH_ACKNOWLEDGE', entity: 'GJ-VAD-POLICE-FIXEDDOME-10080', old: 'P1_CRITICAL (UNASSIGNED)', new: 'P1_CRITICAL (DISPATCHED)', reason: 'Substation circuit breaker tripped; field team en-route', src: 'Field Ops Mobile API' },
      { who: 'Sunita Mehta', role: 'AUDITOR' as UserRole, what: 'VERIFY_CAMERA_LOCATION', entity: 'GJ-RAJ-TRANSPORT-BULLET-10112', old: 'UNVERIFIED', new: 'PHYSICALLY_VERIFIED', reason: 'Field GIS survey audit complete and geotag matched', src: 'Auditor Verification Form' },
      { who: 'Sentinel Ingestion Bot', role: 'STATE_ADMIN' as UserRole, what: 'SENTINEL_INVENTORY_SYNC', entity: 'STATEWIDE_REGISTRY', old: '520 Records', new: `${cameras.length} Records`, reason: 'Periodic Sentinel connector sync executed', src: 'MockSentinelConnector' },
    ];

    sampleActions.forEach((act, idx) => {
      audit_logs.push({
        id: `audit-${idx + 1}`,
        timestamp: new Date(today.getTime() - (idx + 1) * 3600 * 4 * 1000).toISOString(),
        who: act.who,
        role: act.role,
        what: act.what,
        entity_type: 'CAMERA_ASSET',
        entity_id: act.entity,
        old_value: act.old,
        new_value: act.new,
        reason: act.reason,
        source: act.src,
      });
    });

    // Seed Strategic Investment Candidates (ranked locations across Gujarat)
    const investment_candidates: InvestmentCandidate[] = [
      {
        id: 'inv-1',
        district: 'Surat',
        location_name: 'Ring Road & Textile Market Junction, Surat',
        latitude: 21.1925,
        longitude: 72.8450,
        coverage_gap_pct: 38,
        importance: 'A_CRITICAL_JUNCTION',
        redundancy_deficit: 'Zero coverage in 450m radius (Critical Junction)',
        expected_coverage_gain_pct: 18.5,
        strategic_rank_score: 96,
        rationale: 'Highest pedestrian and commercial freight density with complete blind spot on Eastern feeder lane.',
        zone_type: 'High Density Commercial Hub',
      },
      {
        id: 'inv-2',
        district: 'Ahmedabad',
        location_name: 'Sardar Patel Ring Road & Vaishno Devi Circle, Ahmedabad',
        latitude: 23.1250,
        longitude: 72.5400,
        coverage_gap_pct: 34,
        importance: 'A_CRITICAL_JUNCTION',
        redundancy_deficit: 'Single legacy analog camera with frequent connectivity loss',
        expected_coverage_gain_pct: 16.2,
        strategic_rank_score: 93,
        rationale: 'Major inter-city highway bypass junction with heavy night truck movement and zero ANPR capabilities.',
        zone_type: 'Inter-City Expressway Node',
      },
      {
        id: 'inv-3',
        district: 'Vadodara',
        location_name: 'GIDC Industrial Corridor North Gate, Makarpura, Vadodara',
        latitude: 22.2500,
        longitude: 73.1950,
        coverage_gap_pct: 29,
        importance: 'B_ARTERIAL_ROAD',
        redundancy_deficit: 'Low redundancy; existing unit at 9.4 years (Critical Aging)',
        expected_coverage_gain_pct: 14.1,
        strategic_rank_score: 88,
        rationale: 'Heavy hazardous goods vehicle flow; replacement with dual ANPR + Thermal recommended.',
        zone_type: 'Industrial Freight Corridor',
      },
      {
        id: 'inv-4',
        district: 'Rajkot',
        location_name: 'Kuvadva Road Tri-Junction, Rajkot',
        latitude: 22.3150,
        longitude: 70.8350,
        coverage_gap_pct: 26,
        importance: 'B_ARTERIAL_ROAD',
        redundancy_deficit: 'Isolated node; adjacent camera 650m away',
        expected_coverage_gain_pct: 12.8,
        strategic_rank_score: 84,
        rationale: 'Rapidly growing transit route linking industrial estate with National Highway 27.',
        zone_type: 'Urban Influx Artery',
      },
      {
        id: 'inv-5',
        district: 'Gandhinagar',
        location_name: 'GIFT City Knowledge Corridor Entry, Gandhinagar',
        latitude: 23.1600,
        longitude: 72.6850,
        coverage_gap_pct: 22,
        importance: 'A_CRITICAL_JUNCTION',
        redundancy_deficit: 'Medium redundancy; needs 360-degree situational awareness',
        expected_coverage_gain_pct: 11.5,
        strategic_rank_score: 81,
        rationale: 'International financial tech hub perimeter expansion requiring modern ONVIF-T stream integration.',
        zone_type: 'Smart District Perimeter',
      },
      {
        id: 'inv-6',
        district: 'Kutch-Kandla',
        location_name: 'Kandla Port Terminal Gate 3, Gandhidham',
        latitude: 23.0050,
        longitude: 70.2150,
        coverage_gap_pct: 31,
        importance: 'A_CRITICAL_JUNCTION',
        redundancy_deficit: 'Maritime perimeter blind zone between berth 4 and container yard',
        expected_coverage_gain_pct: 15.0,
        strategic_rank_score: 89,
        rationale: 'Strategic maritime logistics asset requiring ATEX explosion-proof PTZ integration.',
        zone_type: 'Maritime Port Infrastructure',
      },
    ];

    this.state = {
      cameras,
      conflicts,
      audit_logs,
      investment_candidates,
      config: {
        coverage_target: 90,
        last_synced_sentinel: new Date().toISOString(),
      },
    };

    console.log(`[DB] Successfully generated ${cameras.length} synthetic camera records across Gujarat.`);
  }

  // Query & Getter methods
  public getCameras(filters: {
    district?: string;
    department?: string;
    status?: string;
    type?: string;
    redundancy?: string;
    lifecycle?: string;
    maintenance_priority?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let result = this.state.cameras;

    if (filters.district && filters.district !== 'ALL') {
      result = result.filter(c => c.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters.department && filters.department !== 'ALL') {
      result = result.filter(c => c.department.toLowerCase().includes(filters.department!.toLowerCase()));
    }
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(c => c.status === filters.status);
    }
    if (filters.type && filters.type !== 'ALL') {
      result = result.filter(c => c.type === filters.type);
    }
    if (filters.redundancy && filters.redundancy !== 'ALL') {
      result = result.filter(c => c.redundancy_level === filters.redundancy);
    }
    if (filters.lifecycle && filters.lifecycle !== 'ALL') {
      result = result.filter(c => c.lifecycle_stage === filters.lifecycle);
    }
    if (filters.maintenance_priority && filters.maintenance_priority !== 'ALL') {
      result = result.filter(c => c.maintenance_priority === filters.maintenance_priority);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        c =>
          c.global_id.toLowerCase().includes(q) ||
          c.original_source_id.toLowerCase().includes(q) ||
          c.landmark.toLowerCase().includes(q) ||
          c.vendor.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }

    const total = result.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 500;
    const items = result.slice(offset, offset + limit);

    return { total, items };
  }

  public getCameraById(idOrGlobalId: string): Camera | undefined {
    return this.state.cameras.find(
      c => c.id === idOrGlobalId || c.global_id.toLowerCase() === idOrGlobalId.toLowerCase()
    );
  }

  public getDashboardStats(): DashboardStats {
    const cams = this.state.cameras;
    const total = cams.length;
    const operational = cams.filter(c => c.status === 'OPERATIONAL').length;
    const offline = cams.filter(c => c.status === 'OFFLINE').length;
    const maintenance = cams.filter(c => c.status === 'MAINTENANCE').length;
    const unknown = cams.filter(c => c.status === 'UNKNOWN').length;

    const aging_count = cams.filter(c => c.age_group === '6-8 YRS').length;
    const critical_aging_count = cams.filter(c => c.age_group === '9+ YRS').length;

    const coverageSum = cams.reduce((sum, c) => sum + c.coverage_score, 0);
    const coverage_score_avg = total > 0 ? Math.round((coverageSum / total) * 10) / 10 : 0;
    const coverage_target = this.state.config.coverage_target;
    const coverage_debt = Math.max(0, Math.round((coverage_target - coverage_score_avg) * 10) / 10);

    const confidenceSum = cams.reduce((sum, c) => sum + c.data_confidence_score, 0);
    const data_confidence_avg = total > 0 ? Math.round((confidenceSum / total) * 10) / 10 : 0;

    const readinessSum = cams.reduce((sum, c) => sum + c.integration_score, 0);
    const integration_readiness_avg = total > 0 ? Math.round((readinessSum / total) * 10) / 10 : 0;

    const total_conflicts_pending = this.state.conflicts.filter(c => c.status === 'PENDING').length;
    const total_quality_anomalies = cams.filter(c => c.has_quality_issue).length;
    const p1_maintenance_count = cams.filter(c => c.maintenance_priority === 'P1_CRITICAL').length;

    // District distribution
    const districtMap: Record<string, { total: number; operational: number; offline: number }> = {};
    cams.forEach(c => {
      if (!districtMap[c.district]) {
        districtMap[c.district] = { total: 0, operational: 0, offline: 0 };
      }
      districtMap[c.district].total++;
      if (c.status === 'OPERATIONAL') districtMap[c.district].operational++;
      if (c.status === 'OFFLINE') districtMap[c.district].offline++;
    });

    const district_distribution = Object.entries(districtMap).map(([district, v]) => ({
      district,
      count: v.total,
      operational: v.operational,
      offline: v.offline,
    }));

    // Department distribution
    const deptMap: Record<string, number> = {};
    cams.forEach(c => {
      const shortDept = c.department.split('/')[0].split('Smart')[0].trim();
      deptMap[shortDept] = (deptMap[shortDept] || 0) + 1;
    });
    const department_distribution = Object.entries(deptMap).map(([department, count]) => ({
      department,
      count,
    }));

    // Age groups
    const ageMap: Record<string, number> = { '0-2 YRS': 0, '3-5 YRS': 0, '6-8 YRS': 0, '9+ YRS': 0 };
    cams.forEach(c => {
      ageMap[c.age_group] = (ageMap[c.age_group] || 0) + 1;
    });
    const age_group_distribution = Object.entries(ageMap).map(([age_group, count]) => ({
      age_group,
      count,
    }));

    // Camera types
    const typeMap: Record<string, number> = {};
    cams.forEach(c => {
      typeMap[c.type] = (typeMap[c.type] || 0) + 1;
    });
    const type_distribution = Object.entries(typeMap).map(([type, count]) => ({
      type,
      count,
    }));

    return {
      total,
      operational,
      offline,
      maintenance,
      unknown,
      aging_count,
      critical_aging_count,
      coverage_score_avg,
      coverage_target,
      coverage_debt,
      data_confidence_avg,
      integration_readiness_avg,
      total_conflicts_pending,
      total_quality_anomalies,
      p1_maintenance_count,
      district_distribution,
      department_distribution,
      age_group_distribution,
      type_distribution,
    };
  }

  public createCamera(
    data: Partial<Camera>,
    who: string,
    role: UserRole,
    reason: string = 'New CCTV infrastructure asset commissioning'
  ): Camera {
    const district = data.district || 'Ahmedabad';
    const dept = data.department || 'Gujarat Police / Traffic Command';
    const type = data.type || 'PTZ';
    const distCode = district.substring(0, 3).toUpperCase();
    const deptCode = dept.includes('Police') ? 'POLICE' : dept.includes('Road') ? 'R&B' : 'GIDC';
    const count = this.state.cameras.length + 1;
    const globalId = data.global_id || `GJ-${distCode}-${deptCode}-${type}-${10000 + count}`;

    const newCam: Camera = {
      id: `cam-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      global_id: globalId,
      original_source_id: data.original_source_id || `COMM-${Date.now().toString().slice(-6)}`,
      department: dept,
      district,
      city: data.city || district,
      latitude: Number(data.latitude) || 23.0225,
      longitude: Number(data.longitude) || 72.5714,
      heading: 180,
      fov_angle: 90,
      mounting_height_m: 6.5,
      landmark: data.landmark || 'Commissioned Smart Junction',
      ward: data.ward || 'Ward 1',
      type: type as any,
      status: (data.status as any) || 'OPERATIONAL',
      vendor: data.vendor || 'CP PLUS',
      model: 'CP-UNC-TA41ZL4-VMD',
      serial_number: `SN-COMM-${Date.now().toString().slice(-8)}`,
      owner: data.owner || 'Home Department, Government of Gujarat',
      custodian_officer: 'Assistant Commissioner of Police (Tech Command)',
      custodian_contact: '+91 79 2325 0000',
      installation_date: data.installation_date || new Date().toISOString().split('T')[0],
      protocol: (data.protocol as any) || 'ONVIF Profile T',
      vms: (data.vms as any) || 'Milestone XProtect',
      capabilities: data.capabilities || ['PTZ Control', 'Night Vision IR', 'ANPR Edge'],
      health_score: 95,
      health_breakdown: {
        connectivity: 95,
        uptime: 98,
        heartbeat_freshness: 96,
        maintenance_compliance: 90,
        failure_history_score: 95,
      },
      age_years: 0.2,
      age_group: '0-2 YRS',
      lifecycle_stage: 'ACTIVE',
      redundancy_level: (data.redundancy_level as any) || 'MEDIUM',
      redundancy_note: 'Verified dual-angle coverage from nearby intersection poles',
      redundancy_adjacent_count: 2,
      data_confidence_score: 98,
      coverage_importance: 'A_CRITICAL_JUNCTION',
      last_verified_at: new Date().toISOString(),
      coverage_score: 88,
      integration_score: 92,
      integration_tier: 'DIRECT_CLOUD_INGESTION',
      integration_capabilities: {
        rtsp: true,
        onvif: true,
        rest_api: true,
        vendor_sdk: true,
        metadata_stream: true,
        health_endpoint: true,
        vms_bridge: true,
        network_accessible: true,
      },
      ip_address: data.ip_address || `10.${(count % 200) + 1}.1.50`,
      mac_address: data.mac_address || `5C:E9:1E:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:AA`,
      firmware_version: data.firmware_version || 'v4.2.1-COMM-2026',
      maintenance_priority: 'P4_LOW',
      maintenance_reason: 'Newly commissioned hardware in active warranty',
      has_data_conflict: false,
      has_quality_issue: false,
      quality_issue_types: [],
      synthetic_label: 'SYNTHETIC DATA - DEMO',
      provenance_source: 'STATE_REGISTRY_PORTAL',
      provenance_updated_at: new Date().toISOString(),
    };

    this.state.cameras.unshift(newCam);

    this.addAuditLog({
      who,
      role,
      what: 'COMMISSION_NEW_CAMERA_ASSET',
      entity_type: 'CAMERA',
      entity_id: newCam.global_id,
      old_value: 'N/A (Commissioning)',
      new_value: `${newCam.global_id} at ${newCam.landmark}, ${newCam.district}`,
      reason,
      source: 'Commissioning Registry Form',
    });

    this.save();
    return newCam;
  }

  public updateCamera(
    id: string,
    updates: Partial<Camera>,
    who: string,
    role: UserRole,
    reason: string,
    source: string = 'User UI Form'
  ): Camera | null {
    const index = this.state.cameras.findIndex(c => c.id === id);
    if (index === -1) return null;

    const oldCam = { ...this.state.cameras[index] };
    const updatedCam = { ...oldCam, ...updates, provenance_updated_at: new Date().toISOString() };

    // Recalculate health if telemetry changed
    if (updates.status || updates.health_breakdown) {
      const hb = updatedCam.health_breakdown;
      updatedCam.health_score = Math.round(
        0.30 * hb.connectivity +
        0.20 * hb.uptime +
        0.20 * hb.heartbeat_freshness +
        0.15 * hb.maintenance_compliance +
        0.15 * hb.failure_history_score
      );
    }

    this.state.cameras[index] = updatedCam;

    // Record in Audit Log
    const changedFields = Object.keys(updates);
    const oldSnippet = changedFields.map(k => `${k}: ${(oldCam as any)[k]}`).join(', ');
    const newSnippet = changedFields.map(k => `${k}: ${(updates as any)[k]}`).join(', ');

    this.addAuditLog({
      who,
      role,
      what: `UPDATE_CAMERA_ASSET`,
      entity_type: 'CAMERA',
      entity_id: updatedCam.global_id,
      old_value: oldSnippet,
      new_value: newSnippet,
      reason,
      source,
    });

    this.save();
    return updatedCam;
  }

  public getConflicts(): ConflictRecord[] {
    return this.state.conflicts;
  }

  public resolveConflict(
    conflictId: string,
    action: 'ACCEPT_PROPOSED' | 'KEEP_CURRENT' | 'CUSTOM_VALUE',
    customValue: string | undefined,
    who: string,
    role: UserRole,
    reason: string
  ) {
    const conflict = this.state.conflicts.find(c => c.id === conflictId);
    if (!conflict) return null;

    const camIndex = this.state.cameras.findIndex(c => c.id === conflict.camera_id);
    const cam = this.state.cameras[camIndex];

    let chosenValue = conflict.current_value;
    if (action === 'ACCEPT_PROPOSED') {
      chosenValue = conflict.proposed_value;
      conflict.status = 'RESOLVED_ACCEPTED';
    } else if (action === 'KEEP_CURRENT') {
      conflict.status = 'RESOLVED_REJECTED';
    } else if (action === 'CUSTOM_VALUE' && customValue !== undefined) {
      chosenValue = customValue;
      conflict.status = 'RESOLVED_CUSTOM';
    }

    conflict.resolved_by = who;
    conflict.resolved_at = new Date().toISOString();
    conflict.resolution_reason = reason;

    if (cam && (action === 'ACCEPT_PROPOSED' || action === 'CUSTOM_VALUE')) {
      (cam as any)[conflict.field_name] = chosenValue;
      cam.provenance_updated_at = new Date().toISOString();
      cam.has_data_conflict = this.state.conflicts.some(
        c => c.camera_id === cam.id && c.id !== conflictId && c.status === 'PENDING'
      );
    }

    this.addAuditLog({
      who,
      role,
      what: `RESOLVE_CONFLICT_${action}`,
      entity_type: 'CONFLICT_RECORD',
      entity_id: conflict.camera_global_id,
      old_value: `${conflict.field_name}: ${conflict.current_value}`,
      new_value: `${conflict.field_name}: ${chosenValue}`,
      reason,
      source: 'Data Quality & Provenance Workbench',
    });

    this.save();
    return { conflict, updated_camera: cam };
  }

  public getAuditLogs(limit: number = 100): AuditLogEntry[] {
    return this.state.audit_logs.slice(0, limit);
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.state.audit_logs.unshift(newLog);
    if (this.state.audit_logs.length > 500) {
      this.state.audit_logs = this.state.audit_logs.slice(0, 500);
    }
  }

  public getInvestmentCandidates(): InvestmentCandidate[] {
    return this.state.investment_candidates;
  }

  // Ask the Registry deterministic query engine
  public askRegistry(query: string): QueryInterpretation {
    const q = query.toLowerCase().trim();
    const applied_filters: Record<string, any> = {};
    const intentParts: string[] = [];

    // District matching
    for (const dist of GUJARAT_DISTRICTS) {
      if (q.includes(dist.name.toLowerCase()) || q.includes(dist.code.toLowerCase())) {
        applied_filters.district = dist.name;
        intentParts.push(`District = "${dist.name}"`);
        break;
      }
    }

    // Department matching
    if (q.includes('police') || q.includes('traffic')) {
      applied_filters.department = 'Police';
      intentParts.push(`Department = "Gujarat Police"`);
    } else if (q.includes('municipal') || q.includes('smart city')) {
      applied_filters.department = 'Municipal';
      intentParts.push(`Department = "Municipal Corporation"`);
    } else if (q.includes('transport') || q.includes('bus') || q.includes('brts')) {
      applied_filters.department = 'Transport';
      intentParts.push(`Department = "Transport"`);
    } else if (q.includes('port') || q.includes('maritime')) {
      applied_filters.department = 'Maritime';
      intentParts.push(`Department = "Maritime"`);
    }

    // Status matching
    if (q.includes('offline')) {
      applied_filters.status = 'OFFLINE';
      intentParts.push(`Status = "OFFLINE"`);
    } else if (q.includes('maintenance')) {
      applied_filters.status = 'MAINTENANCE';
      intentParts.push(`Status = "MAINTENANCE"`);
    } else if (q.includes('operational') || q.includes('online')) {
      applied_filters.status = 'OPERATIONAL';
      intentParts.push(`Status = "OPERATIONAL"`);
    } else if (q.includes('unknown')) {
      applied_filters.status = 'UNKNOWN';
      intentParts.push(`Status = "UNKNOWN"`);
    }

    // Camera Type matching
    if (q.includes('ptz')) {
      applied_filters.type = 'PTZ';
      intentParts.push(`Type = "PTZ"`);
    } else if (q.includes('anpr') || q.includes('number plate')) {
      applied_filters.type = 'ANPR';
      intentParts.push(`Type = "ANPR"`);
    } else if (q.includes('thermal')) {
      applied_filters.type = 'THERMAL';
      intentParts.push(`Type = "THERMAL"`);
    } else if (q.includes('dome')) {
      applied_filters.type = 'FIXED_DOME';
      intentParts.push(`Type = "FIXED_DOME"`);
    } else if (q.includes('bullet')) {
      applied_filters.type = 'BULLET';
      intentParts.push(`Type = "BULLET"`);
    }

    // Redundancy matching
    if (q.includes('critical redundancy') || (q.includes('critical') && q.includes('redundancy'))) {
      applied_filters.redundancy = 'CRITICAL';
      intentParts.push(`Redundancy = "CRITICAL" (Single point of failure)`);
    } else if (q.includes('low redundancy')) {
      applied_filters.redundancy = 'LOW';
      intentParts.push(`Redundancy = "LOW"`);
    }

    // Priority matching
    if (q.includes('p1') || q.includes('critical priority')) {
      applied_filters.maintenance_priority = 'P1_CRITICAL';
      intentParts.push(`Priority = "P1_CRITICAL"`);
    } else if (q.includes('p2')) {
      applied_filters.maintenance_priority = 'P2_HIGH';
      intentParts.push(`Priority = "P2_HIGH"`);
    }

    // Age / Lifecycle matching
    let minAge: number | undefined;
    if (q.includes('5 year') || q.includes('older than 5')) minAge = 5;
    if (q.includes('8 year') || q.includes('older than 8')) minAge = 8;
    if (q.includes('critical aging') || q.includes('9 year') || q.includes('older than 9')) minAge = 9;

    // Filter cameras
    let matched = this.state.cameras;
    if (applied_filters.district) {
      matched = matched.filter(c => c.district.toLowerCase() === applied_filters.district.toLowerCase());
    }
    if (applied_filters.department) {
      matched = matched.filter(c => c.department.toLowerCase().includes(applied_filters.department.toLowerCase()));
    }
    if (applied_filters.status) {
      matched = matched.filter(c => c.status === applied_filters.status);
    }
    if (applied_filters.type) {
      matched = matched.filter(c => c.type === applied_filters.type);
    }
    if (applied_filters.redundancy) {
      matched = matched.filter(c => c.redundancy_level === applied_filters.redundancy);
    }
    if (applied_filters.maintenance_priority) {
      matched = matched.filter(c => c.maintenance_priority === applied_filters.maintenance_priority);
    }
    if (minAge !== undefined) {
      matched = matched.filter(c => c.age_years >= minAge!);
      intentParts.push(`Age >= ${minAge} Years`);
    }

    // Generate SQL translation for hackathon transparency
    const whereClauses: string[] = [];
    if (applied_filters.district) whereClauses.push(`district = '${applied_filters.district}'`);
    if (applied_filters.department) whereClauses.push(`department ILIKE '%${applied_filters.department}%'`);
    if (applied_filters.status) whereClauses.push(`status = '${applied_filters.status}'`);
    if (applied_filters.type) whereClauses.push(`type = '${applied_filters.type}'`);
    if (applied_filters.redundancy) whereClauses.push(`redundancy_level = '${applied_filters.redundancy}'`);
    if (applied_filters.maintenance_priority) whereClauses.push(`maintenance_priority = '${applied_filters.maintenance_priority}'`);
    if (minAge !== undefined) whereClauses.push(`age_years >= ${minAge}`);

    const sql_translation = `SELECT global_id, district, department, status, type, health_score, redundancy_level, age_years\nFROM master_cctv_registry\n${whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : ''}\nORDER BY health_score ASC;`;

    return {
      raw_query: query,
      interpreted_intent: intentParts.length ? intentParts.join(' AND ') : 'Statewide Master Registry Query',
      sql_translation,
      applied_filters,
      result_count: matched.length,
    };
  }

  // Camera Replacement Simulator Sandbox
  public simulateReplacement(params: {
    retireCameraIds: string[];
    addCandidateIds: string[];
  }) {
    const currentStats = this.getDashboardStats();
    let baselineCoverage = currentStats.coverage_score_avg;

    // Evaluate impact of retired cameras
    let coverageLoss = 0;
    const affectedJunctions: string[] = [];

    params.retireCameraIds.forEach(id => {
      const cam = this.getCameraById(id);
      if (cam) {
        affectedJunctions.push(`${cam.landmark} (${cam.district})`);
        if (cam.redundancy_level === 'CRITICAL') coverageLoss += 1.8;
        else if (cam.redundancy_level === 'LOW') coverageLoss += 0.9;
        else if (cam.redundancy_level === 'MEDIUM') coverageLoss += 0.4;
        else coverageLoss += 0.1;
      }
    });

    // Evaluate gain of candidate additions
    let coverageGain = 0;
    params.addCandidateIds.forEach(candId => {
      const cand = this.state.investment_candidates.find(c => c.id === candId);
      if (cand) {
        coverageGain += (cand.expected_coverage_gain_pct / 10);
      }
    });

    const projectedCoverage = Math.min(100, Math.max(0, Math.round((baselineCoverage - coverageLoss + coverageGain) * 10) / 10));
    const target = this.state.config.coverage_target;
    const oldDebt = Math.max(0, target - baselineCoverage);
    const newDebt = Math.max(0, target - projectedCoverage);
    const coverageDebtDelta = Math.round((newDebt - oldDebt) * 10) / 10;
    const resilienceDelta = Math.round((coverageGain - coverageLoss) * 10) / 10;

    return {
      baseline_coverage: baselineCoverage,
      projected_coverage: projectedCoverage,
      coverage_debt_delta: coverageDebtDelta,
      resilience_delta: resilienceDelta,
      affected_junctions: affectedJunctions,
      retired_count: params.retireCameraIds.length,
      added_count: params.addCandidateIds.length,
      simulation_label: 'PROTOTYPE PLANNING SIMULATION ONLY - DESIGN ESTIMATE',
    };
  }

  // MockSentinelConnector methods
  public sentinel = {
    getCameraInventory: () => {
      // Returns remote Sentinel metadata sample
      return this.state.cameras.slice(0, 15).map(c => ({
        sentinel_device_id: `SNT-${c.id.toUpperCase()}`,
        global_registry_id: c.global_id,
        ip: c.ip_address,
        protocol: 'ONVIF-Profile-T',
        telemetry_status: c.status,
        last_heartbeat: new Date().toISOString(),
        firmware: c.firmware_version || 'v4.8.0-build2026',
        video_channels: 1,
        active_analytics: c.capabilities,
      }));
    },
    getCameraStatus: (globalId: string) => {
      const cam = this.getCameraById(globalId);
      if (!cam) return { found: false, error: 'Device not indexed in Sentinel gateway' };
      return {
        found: true,
        global_id: cam.global_id,
        sentinel_id: `SNT-${cam.id.toUpperCase()}`,
        status: cam.status,
        ping_latency_ms: cam.status === 'OPERATIONAL' ? 24 + Math.floor(Math.random() * 12) : null,
        packet_loss_pct: cam.status === 'OPERATIONAL' ? 0.2 : cam.status === 'MAINTENANCE' ? 14.5 : 100,
        fps: cam.status === 'OPERATIONAL' ? 25 : 0,
        bitrate_kbps: cam.status === 'OPERATIONAL' ? 4096 : 0,
        temp_celsius: 42 + Math.floor(Math.random() * 8),
        stream_accessible: cam.status === 'OPERATIONAL',
        note: 'MockSentinelConnector live telemetry query (non-streaming metadata only)',
      };
    },
    getCameraMetadata: (globalId: string) => {
      const cam = this.getCameraById(globalId);
      if (!cam) return null;
      return {
        global_id: cam.global_id,
        vendor: cam.vendor,
        model: cam.model,
        mac_address: cam.mac_address,
        firmware: cam.firmware_version,
        capabilities: cam.capabilities,
        protocol: cam.protocol,
        network_zone: 'GUJ-SWAN-VLAN-402',
        integration_readiness: cam.integration_score,
      };
    },
    syncWithRegistry: () => {
      // Pulls synchronization updates from Sentinel
      const newConflictsCount = Math.floor(Math.random() * 2) + 1;
      this.state.config.last_synced_sentinel = new Date().toISOString();
      this.addAuditLog({
        who: 'MockSentinelConnector',
        role: 'STATE_ADMIN',
        what: 'SENTINEL_INVENTORY_SYNC',
        entity_type: 'CONNECTOR_SYNC',
        entity_id: 'SENTINEL-GW-01',
        old_value: 'Sync state: IDLE',
        new_value: `Sync complete (${newConflictsCount} updates processed)`,
        reason: 'Periodic automated device catalog sync from Sentinel edge gateway',
        source: 'Sentinel Connector Job',
      });
      this.save();
      return {
        status: 'SUCCESS',
        synced_at: this.state.config.last_synced_sentinel,
        devices_checked: this.state.cameras.length,
        devices_active: this.state.cameras.filter(c => c.status === 'OPERATIONAL').length,
        pending_reconciliations: this.state.conflicts.filter(c => c.status === 'PENDING').length,
      };
    },
  };
}

export const db = new DatabaseService();
