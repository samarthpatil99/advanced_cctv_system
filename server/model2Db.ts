import { db } from './db';
import {
  Camera,
  VideoAnalyticsEvent,
  VideoAnalyticsEventType,
  EventSeverity,
  EventStatus,
  AnprHit,
  WatchlistRecord,
  MetadataSearchFilter,
  MetadataSearchResult,
  CrossCameraJourney,
  CrossCameraWaypoint,
  InvestigationCase,
} from '../src/types';

// Pre-seeded Watchlist of flagged target vehicles across Gujarat
export const INITIAL_WATCHLIST: WatchlistRecord[] = [
  {
    id: 'wl-1',
    plate_number: 'GJ-01-ER-4921',
    owner_name: 'Unknown / False Registration',
    category: 'STOLEN_VEHICLE',
    flagged_by: 'Ahmedabad Crime Branch - Unit 4',
    flagged_at: '2026-09-12T04:30:00Z',
    status: 'ACTIVE',
    notes: 'Silver Hyundai Creta reported stolen from Vastrapur; suspected involvement in multiple inter-district break-ins.',
  },
  {
    id: 'wl-2',
    plate_number: 'GJ-05-BK-8820',
    owner_name: 'Dharmesh R. Vaghela',
    category: 'WANTED_SUSPECT',
    flagged_by: 'Surat Police Special Operations Group (SOG)',
    flagged_at: '2026-09-11T14:15:00Z',
    status: 'ACTIVE',
    notes: 'White Mahindra Scorpio. Subject wanted under State Warrant #GJ-SOG-8491. Priority apprehension order.',
  },
  {
    id: 'wl-3',
    plate_number: 'GJ-06-TX-3104',
    owner_name: 'Gujarat Commercial Logistics Pvt Ltd',
    category: 'EXPIRED_COMMERCIAL_FITNESS',
    flagged_by: 'Vadodara Regional Transport Authority',
    flagged_at: '2026-09-08T09:00:00Z',
    status: 'ACTIVE',
    notes: 'Heavy multi-axle freight carrier operating without mandatory brake fitness & pollution compliance on national bypass.',
  },
  {
    id: 'wl-4',
    plate_number: 'GJ-27-AZ-1109',
    owner_name: 'Ramesh K. Prajapati',
    category: 'CRIMINAL_INVESTIGATION',
    flagged_by: 'Gandhinagar State CID (Crime)',
    flagged_at: '2026-09-13T18:45:00Z',
    status: 'ACTIVE',
    notes: 'Black Tata Harrier fleeing scene of industrial warehouse intrusion near Kalol GIDC.',
  },
  {
    id: 'wl-5',
    plate_number: 'GJ-03-VIP-0001',
    owner_name: 'State Protocol Convoy Pilot',
    category: 'VIP_ESCORT',
    flagged_by: 'Rajkot Traffic Control Center',
    flagged_at: '2026-09-14T06:00:00Z',
    status: 'ACTIVE',
    notes: 'High-priority dignitary escort route monitoring across Rajkot-Jamnagar expressway green corridor.',
  },
];

class Model2DatabaseService {
  private events: VideoAnalyticsEvent[] = [];
  private anprHits: AnprHit[] = [];
  private watchlist: WatchlistRecord[] = [...INITIAL_WATCHLIST];
  private cases: InvestigationCase[] = [];
  private metadataObjects: MetadataSearchResult[] = [];

  constructor() {
    this.generateSyntheticModel2Data();
  }

  // Generate synthetic data tied strictly to Model 1 cameras
  public generateSyntheticModel2Data() {
    const cameras: Camera[] = db.getCameras({ limit: 1000 }).items;
    if (!cameras || cameras.length === 0) {
      console.warn('[Model 2 DB] Model 1 cameras not yet initialized.');
      return;
    }

    const now = new Date('2026-09-14T12:00:00Z');

    // 1. Generate ANPR Hits
    this.anprHits = [];
    const anprCapableCameras = cameras.filter(
      c => c.type === 'ANPR' || c.capabilities.some(cap => cap.includes('ANPR') || cap.includes('Vehicle')) || c.type === 'BULLET'
    );
    const targetPool = anprCapableCameras.length > 0 ? anprCapableCameras : cameras.slice(0, 100);

    const vehicleMakes: Record<string, string[]> = {
      SEDAN: ['Maruti Dzire', 'Honda City', 'Hyundai Verna', 'Tata Tigor'],
      SUV: ['Hyundai Creta', 'Mahindra Scorpio', 'Tata Harrier', 'Kia Seltos', 'Toyota Fortuner'],
      MOTORCYCLE: ['Hero Splendor', 'Honda Activa', 'Bajaj Pulsar', 'Royal Enfield Classic'],
      AUTO_RICKSHAW: ['Bajaj Compact RE', 'Piaggio Ape', 'Atul Auto Shakti'],
      TRUCK: ['Tata Signa 4825', 'Ashok Leyland 2820', 'Eicher Pro 3019', 'BharatBenz 3528'],
      BUS: ['GSRTC Express Volvo', 'Tata Starbus Urban', 'Ashok Leyland Viking'],
    };

    const colors = ['White', 'Silver', 'Black', 'Grey', 'Dark Blue', 'Red', 'Golden Yellow'];
    const categories: AnprHit['vehicle_category'][] = ['SEDAN', 'SUV', 'MOTORCYCLE', 'AUTO_RICKSHAW', 'TRUCK', 'BUS'];
    const directions: AnprHit['direction'][] = ['NORTHBOUND', 'SOUTHBOUND', 'EASTBOUND', 'WESTBOUND'];

    const districtRtoCodes: Record<string, { code: string; name: string }> = {
      Ahmedabad: { code: 'GJ-01', name: 'Ahmedabad City RTO' },
      Surat: { code: 'GJ-05', name: 'Surat City RTO' },
      Vadodara: { code: 'GJ-06', name: 'Vadodara City RTO' },
      Rajkot: { code: 'GJ-03', name: 'Rajkot RTO' },
      Gandhinagar: { code: 'GJ-18', name: 'Gandhinagar Capital RTO' },
      Bhavnagar: { code: 'GJ-04', name: 'Bhavnagar RTO' },
      Jamnagar: { code: 'GJ-10', name: 'Jamnagar RTO' },
      Junagadh: { code: 'GJ-11', name: 'Junagadh RTO' },
      'Kutch-Kandla': { code: 'GJ-12', name: 'Kutch-Bhuj/Gandhidham RTO' },
      Anand: { code: 'GJ-23', name: 'Anand RTO' },
    };

    let hitCounter = 1000;

    // Generate 180 realistic ANPR captures
    for (let i = 0; i < 180; i++) {
      hitCounter++;
      const cam = targetPool[i % targetPool.length];
      const category = categories[i % categories.length];
      const makeList = vehicleMakes[category] || vehicleMakes.SUV;
      const make = makeList[i % makeList.length];
      const color = colors[i % colors.length];

      // Time spread across last 24 hours
      const minutesAgo = i * 7 + (i % 5);
      const hitTime = new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

      const rtoInfo = districtRtoCodes[cam.district] || { code: 'GJ-01', name: 'Ahmedabad City RTO' };
      const seriesLetters = ['AB', 'BK', 'ER', 'TX', 'AZ', 'MN', 'KL', 'PQ', 'RS'][(i + cam.district.charCodeAt(0)) % 9];
      const plateNumber = `${rtoInfo.code}-${seriesLetters}-${String(1000 + ((i * 47) % 9000))}`;

      // Check if matches watchlist
      const watchlistMatch = this.watchlist.find(w => w.plate_number === plateNumber);
      const isWatchlist = Boolean(watchlistMatch || (i === 4 || i === 22 || i === 58));
      let finalPlate = plateNumber;
      let watchlistReason: string | undefined = undefined;

      if (i === 4) {
        finalPlate = this.watchlist[0].plate_number;
        watchlistReason = this.watchlist[0].notes;
      } else if (i === 22) {
        finalPlate = this.watchlist[1].plate_number;
        watchlistReason = this.watchlist[1].notes;
      } else if (i === 58) {
        finalPlate = this.watchlist[2].plate_number;
        watchlistReason = this.watchlist[2].notes;
      }

      this.anprHits.push({
        id: `anpr-hit-${hitCounter}`,
        timestamp: hitTime,
        camera_id: cam.id,
        global_camera_id: cam.global_id, // Model 1 key
        district: cam.district,
        location: cam.landmark,
        plate_number: finalPlate,
        confidence: Math.round(92 + (i % 7) + (Math.sin(i) * 1.5)),
        vehicle_category: category,
        vehicle_make: make,
        vehicle_color: color,
        speed_kmh: Math.round(38 + (i % 45) + (cam.coverage_importance === 'A_CRITICAL_JUNCTION' ? -10 : 15)),
        lane_number: (i % 4) + 1,
        direction: directions[i % directions.length],
        is_watchlist_match: isWatchlist,
        watchlist_reason: watchlistReason || (isWatchlist ? 'Flagged on Statewide Unified Traffic Watchlist' : undefined),
        rto_state: 'Gujarat (GJ)',
        rto_division: rtoInfo.name,
        thumbnail_seed: 100 + i,
      });
    }

    // Sort ANPR hits by timestamp descending (newest first)
    this.anprHits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 2. Generate Real-time AI Video Analytics Events & Alerts
    this.events = [];
    const eventTypes: { type: VideoAnalyticsEventType; severity: EventSeverity; title: string; desc: string; thumb: VideoAnalyticsEvent['thumbnail_type'] }[] = [
      {
        type: 'WATCHLIST_PLATE_HIT',
        severity: 'CRITICAL',
        title: 'Hotlist Vehicle Intercept Alert',
        desc: 'Identified stolen vehicle from State Crime Branch database passing camera junction.',
        thumb: 'vehicle',
      },
      {
        type: 'WRONG_WAY_DRIVING',
        severity: 'CRITICAL',
        title: 'Dangerous Wrong-Way Vehicle Traversal',
        desc: 'Vehicle detected traveling contrary to designated one-way arterial corridor.',
        thumb: 'vehicle',
      },
      {
        type: 'PERIMETER_INTRUSION',
        severity: 'HIGH',
        title: 'Restricted Industrial / Infrastructure Zone Intrusion',
        desc: 'Human boundary crossing tripwire triggered after operating hours.',
        thumb: 'perimeter',
      },
      {
        type: 'TRAFFIC_CONGESTION',
        severity: 'HIGH',
        title: 'Gridlock / Congestion Spike at Junction',
        desc: 'Vehicle queue length exceeds 180 meters for over 7 consecutive minutes.',
        thumb: 'traffic',
      },
      {
        type: 'SPEED_VIOLATION',
        severity: 'MEDIUM',
        title: 'High-Speed Expressway Violation',
        desc: 'Vehicle tracked traveling at 118 km/h in an 80 km/h municipal bypass zone.',
        thumb: 'vehicle',
      },
      {
        type: 'CROWD_GATHERING',
        severity: 'MEDIUM',
        title: 'Unusual Crowd Density Concentration',
        desc: 'Sudden accumulation of 40+ individuals detected near transit terminal node.',
        thumb: 'crowd',
      },
      {
        type: 'ABANDONED_OBJECT',
        severity: 'HIGH',
        title: 'Unattended Object Stationary Alert',
        desc: 'Stationary luggage/parcel detected with zero human interaction for >10 mins.',
        thumb: 'perimeter',
      },
      {
        type: 'CAMERA_TAMPERING_OCCLUSION',
        severity: 'HIGH',
        title: 'Optical Lens Occlusion / Defocus Detected',
        desc: 'Sudden optical distortion, spray paint or field-of-view misalignment detected.',
        thumb: 'tampering',
      },
      {
        type: 'ILLEGAL_PARKING',
        severity: 'LOW',
        title: 'No-Parking Corridor Obstruction',
        desc: 'Commercial carrier parked inside yellow emergency clearance zone.',
        thumb: 'traffic',
      },
    ];

    let eventCounter = 2000;
    const statuses: EventStatus[] = ['NEW', 'ACKNOWLEDGED', 'IN_INVESTIGATION', 'RESOLVED'];

    for (let i = 0; i < 65; i++) {
      eventCounter++;
      const cam = cameras[(i * 3) % cameras.length];
      const evSpec = eventTypes[i % eventTypes.length];
      const minutesAgo = i * 14 + (i % 10);
      const evTime = new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

      let status: EventStatus = 'NEW';
      if (i > 12) status = statuses[i % statuses.length];

      this.events.push({
        id: `ev-${eventCounter}`,
        timestamp: evTime,
        camera_id: cam.id,
        global_camera_id: cam.global_id, // Model 1 key
        camera_name: `${cam.district} - ${cam.landmark}`,
        district: cam.district,
        department: cam.department,
        event_type: evSpec.type,
        severity: evSpec.severity,
        status,
        confidence: Math.round(86 + (i % 12) + (Math.cos(i) * 2)),
        title: evSpec.title,
        description: evSpec.desc,
        metadata: {
          license_plate: evSpec.type.includes('PLATE') || evSpec.type.includes('VEHICLE') || evSpec.type.includes('SPEED')
            ? `GJ-${['01', '05', '06', '03', '18'][i % 5]}-${['ER', 'BK', 'TX', 'MN'][i % 4]}-${1200 + (i * 37) % 8000}`
            : undefined,
          vehicle_type: evSpec.thumb === 'vehicle' ? ['SUV', 'Sedan', 'Heavy Commercial Truck', 'Auto-Rickshaw'][i % 4] : undefined,
          vehicle_color: evSpec.thumb === 'vehicle' ? colors[i % colors.length] : undefined,
          speed_kmh: evSpec.type === 'SPEED_VIOLATION' ? 112 + (i % 18) : 42,
          speed_limit_kmh: 80,
          dwell_time_seconds: evSpec.type === 'ABANDONED_OBJECT' ? 640 : 180,
          crowd_density_pct: evSpec.type === 'CROWD_GATHERING' ? 78 + (i % 15) : undefined,
          bounding_box: {
            x: 120 + ((i * 30) % 400),
            y: 80 + ((i * 20) % 250),
            width: 140 + (i % 60),
            height: 110 + (i % 50),
          },
        },
        thumbnail_type: evSpec.thumb,
        assigned_officer: status !== 'NEW' ? `Officer ${['V. Patel', 'K. Sharma', 'R. Solanki', 'M. Joshi'][i % 4]}` : undefined,
      });
    }

    this.events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 3. Generate Metadata Search Objects
    this.metadataObjects = [];
    let metaCounter = 3000;
    const personClothingUpper = ['Blue Shirt', 'Red T-Shirt', 'Black Jacket', 'White Kurta', 'Grey Hoodie', 'Yellow Shirt'];
    const personClothingLower = ['Blue Jeans', 'Black Trousers', 'Grey Trackpants', 'White Dhoti', 'Khaki Pants'];

    for (let i = 0; i < 220; i++) {
      metaCounter++;
      const cam = cameras[(i * 2) % cameras.length];
      const isVehicle = i % 2 === 0;
      const minutesAgo = i * 6 + (i % 4);
      const metaTime = new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

      if (isVehicle) {
        const cat = categories[i % categories.length];
        const makeList = vehicleMakes[cat] || vehicleMakes.SUV;
        this.metadataObjects.push({
          id: `meta-v-${metaCounter}`,
          timestamp: metaTime,
          camera_id: cam.id,
          global_camera_id: cam.global_id, // Model 1 key
          district: cam.district,
          landmark: cam.landmark,
          latitude: cam.latitude,
          longitude: cam.longitude,
          category: 'VEHICLE',
          attributes: {
            type: cat,
            color: colors[i % colors.length],
            make: makeList[i % makeList.length],
            plate: `GJ-${['01', '05', '06', '03', '18', '12'][i % 6]}-${['AB', 'ER', 'BK', 'TX'][i % 4]}-${1000 + (i * 29) % 8900}`,
            speed_kmh: Math.round(35 + (i % 50)),
          },
          confidence: Math.round(88 + (i % 10)),
        });
      } else {
        this.metadataObjects.push({
          id: `meta-p-${metaCounter}`,
          timestamp: metaTime,
          camera_id: cam.id,
          global_camera_id: cam.global_id, // Model 1 key
          district: cam.district,
          landmark: cam.landmark,
          latitude: cam.latitude,
          longitude: cam.longitude,
          category: 'PERSON',
          attributes: {
            clothing_upper: personClothingUpper[i % personClothingUpper.length],
            clothing_lower: personClothingLower[i % personClothingLower.length],
            has_helmet: i % 3 === 0,
            has_backpack: i % 4 === 0,
          },
          confidence: Math.round(87 + (i % 11)),
        });
      }
    }

    // 4. Seed Investigation Cases
    this.cases = [
      {
        id: 'case-1',
        case_number: 'CASE-GJ-2026-0814',
        title: 'Hit & Run SG Highway Arterial Junction (Silver Creta)',
        priority: 'URGENT',
        status: 'ACTIVE',
        lead_investigator: 'Inspector R. V. Zala, Ahmedabad Traffic Crime Division',
        created_at: '2026-09-13T22:30:00Z',
        incident_datetime: '2026-09-13T21:45:00Z',
        location_summary: 'Sarkhej-Gandhinagar (SG) Highway, Near Pakwan Junction Flyover, Ahmedabad',
        description: 'Silver Hyundai Creta collided with motorized delivery rider at high speed and sped off towards Sarkhej bypass without halting. Vehicle front bumper damage recorded.',
        pinned_camera_ids: cameras.slice(0, 4).map(c => c.global_id),
        evidence_events: this.events.slice(0, 2),
        evidence_anpr_hits: this.anprHits.slice(0, 3),
        notes: [
          {
            id: 'note-1',
            timestamp: '2026-09-13T22:45:00Z',
            author: 'Inspector R. V. Zala',
            content: 'Initial footage reviewed from camera GJ-AHM-POLICE-ANPR-10001. Plate partially occluded by dirt; cross-referenced with SG Highway corridor trajectory.',
          },
          {
            id: 'note-2',
            timestamp: '2026-09-14T01:15:00Z',
            author: 'Sub-Inspector M. K. Gohil',
            content: 'Vehicle captured 14 minutes later at Sanand Crossroad camera travelling at 94 km/h. Driver identified as male, wearing dark jacket.',
          },
        ],
      },
      {
        id: 'case-2',
        case_number: 'CASE-GJ-2026-0792',
        title: 'Organized Cargo Freight Interception - Surat Ring Road',
        priority: 'HIGH',
        status: 'REVIEW',
        lead_investigator: 'ACP S. K. Parmar, Surat City Police',
        created_at: '2026-09-12T16:00:00Z',
        incident_datetime: '2026-09-12T14:10:00Z',
        location_summary: 'Ring Road & Textile Market Corridor, Surat',
        description: 'Multi-axle truck with falsified registration plate diverted high-value textile consignment away from declared customs terminal.',
        pinned_camera_ids: cameras.slice(10, 13).map(c => c.global_id),
        evidence_events: this.events.slice(2, 4),
        evidence_anpr_hits: this.anprHits.slice(3, 5),
        notes: [
          {
            id: 'note-3',
            timestamp: '2026-09-12T18:00:00Z',
            author: 'ACP S. K. Parmar',
            content: 'ANPR hit confirmed at Toll Plaza Entry. Commercial fitness records flagged as expired.',
          },
        ],
      },
      {
        id: 'case-3',
        case_number: 'CASE-GJ-2026-0641',
        title: 'Perimeter Breach & Surveillance Tampering - Kandla Port SEZ',
        priority: 'NORMAL',
        status: 'CLOSED',
        lead_investigator: 'Port Security Officer D. B. Barad, Gujarat Maritime Board',
        created_at: '2026-09-10T08:00:00Z',
        incident_datetime: '2026-09-10T02:15:00Z',
        location_summary: 'Kandla Port Industrial Boundary Wall, Kutch-Kandla',
        description: 'Camera lens spray painted by trespassers attempting unlawful entry into bonded storage yard. Immediate security dispatch apprehended subjects on site.',
        pinned_camera_ids: cameras.slice(20, 22).map(c => c.global_id),
        evidence_events: this.events.slice(5, 7),
        evidence_anpr_hits: [],
        notes: [
          {
            id: 'note-4',
            timestamp: '2026-09-10T09:30:00Z',
            author: 'Officer D. B. Barad',
            content: 'Maintenance team dispatched. Camera lens cleaned, integrity verified, and perimeter patrol augmented.',
          },
        ],
      },
    ];

    console.log(
      `[Model 2 DB] Initialized: ${this.events.length} AI Events, ${this.anprHits.length} ANPR Captures, ${this.metadataObjects.length} Metadata records, ${this.cases.length} Cases.`
    );
  }

  // API Methods for Model 2
  public getEvents(filters: {
    eventType?: string;
    severity?: string;
    status?: string;
    district?: string;
    search?: string;
    limit?: number;
  }) {
    let list = this.events;

    if (filters.eventType && filters.eventType !== 'ALL') {
      list = list.filter(e => e.event_type === filters.eventType);
    }
    if (filters.severity && filters.severity !== 'ALL') {
      list = list.filter(e => e.severity === filters.severity);
    }
    if (filters.status && filters.status !== 'ALL') {
      list = list.filter(e => e.status === filters.status);
    }
    if (filters.district && filters.district !== 'ALL') {
      list = list.filter(e => e.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.global_camera_id.toLowerCase().includes(q) ||
          (e.metadata.license_plate && e.metadata.license_plate.toLowerCase().includes(q))
      );
    }

    const limit = filters.limit || 50;
    return {
      total: list.length,
      items: list.slice(0, limit),
    };
  }

  public updateEventStatus(eventId: string, newStatus: EventStatus, officer?: string) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return null;

    event.status = newStatus;
    if (officer) {
      event.assigned_officer = officer;
    }
    return event;
  }

  public getAnprHits(filters: {
    district?: string;
    category?: string;
    watchlistOnly?: boolean;
    plateSearch?: string;
    limit?: number;
  }) {
    let list = this.anprHits;

    if (filters.district && filters.district !== 'ALL') {
      list = list.filter(h => h.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters.category && filters.category !== 'ALL') {
      list = list.filter(h => h.vehicle_category === filters.category);
    }
    if (filters.watchlistOnly) {
      list = list.filter(h => h.is_watchlist_match);
    }
    if (filters.plateSearch) {
      const q = filters.plateSearch.replace(/\s+/g, '').toLowerCase();
      list = list.filter(h => h.plate_number.replace(/\s+/g, '').toLowerCase().includes(q));
    }

    const limit = filters.limit || 60;
    return {
      total: list.length,
      watchlist_hits_count: list.filter(h => h.is_watchlist_match).length,
      items: list.slice(0, limit),
    };
  }

  public getWatchlist(): WatchlistRecord[] {
    return this.watchlist;
  }

  public addWatchlistRecord(record: Omit<WatchlistRecord, 'id' | 'flagged_at'>): WatchlistRecord {
    const newRecord: WatchlistRecord = {
      ...record,
      id: `wl-${Date.now()}`,
      flagged_at: new Date().toISOString(),
    };
    this.watchlist.unshift(newRecord);
    return newRecord;
  }

  // Cross-Camera Movement: Generate or retrieve journey trace across Model 1 cameras
  public trackVehicleJourney(plateNumber: string): CrossCameraJourney {
    const cleanPlate = plateNumber.trim().toUpperCase();
    const cameras = db.getCameras({ limit: 1000 }).items;

    // Filter ANPR hits for this plate or pick 4-6 sequential cameras in a logical corridor
    const matchingHits = this.anprHits.filter(
      h => h.plate_number.replace(/\s+/g, '').toUpperCase() === cleanPlate.replace(/\s+/g, '')
    );

    let selectedCameras: Camera[] = [];
    if (matchingHits.length >= 3) {
      selectedCameras = matchingHits
        .map(h => cameras.find(c => c.global_id === h.global_camera_id))
        .filter((c): c is Camera => Boolean(c));
    }

    // If less than 3 hits, dynamically generate a realistic 5-node corridor in the district
    if (selectedCameras.length < 3) {
      const preferredDistrict = cleanPlate.startsWith('GJ-05')
        ? 'Surat'
        : cleanPlate.startsWith('GJ-06')
        ? 'Vadodara'
        : cleanPlate.startsWith('GJ-03')
        ? 'Rajkot'
        : 'Ahmedabad';

      const districtCams = cameras.filter(c => c.district.toLowerCase() === preferredDistrict.toLowerCase());
      selectedCameras = (districtCams.length >= 5 ? districtCams : cameras).slice(0, 5);
    }

    // Build waypoints with realistic times and distances
    const waypoints: CrossCameraWaypoint[] = [];
    const baseTime = new Date('2026-09-14T08:15:00Z').getTime();
    let accumulatedDistanceMeters = 0;

    for (let i = 0; i < selectedCameras.length; i++) {
      const cam = selectedCameras[i];
      const timeDeltaSeconds = i === 0 ? 0 : 280 + (i * 120); // 4-7 mins between junctions
      const waypointTime = new Date(baseTime + i * 420 * 1000).toISOString();
      const speed = 45 + ((i * 7) % 25);
      const stepDistanceMeters = Math.round((speed * 1000 / 3600) * (timeDeltaSeconds || 300));
      accumulatedDistanceMeters += stepDistanceMeters;

      waypoints.push({
        sequence: i + 1,
        timestamp: waypointTime,
        camera_id: cam.id,
        global_camera_id: cam.global_id, // Model 1 key
        camera_name: `${cam.district} - ${cam.landmark}`,
        district: cam.district,
        latitude: cam.latitude,
        longitude: cam.longitude,
        plate_number: cleanPlate,
        vehicle_desc: 'Target Vehicle Traversal',
        speed_kmh: speed,
        time_delta_seconds: timeDeltaSeconds,
        distance_meters: stepDistanceMeters,
      });
    }

    const totalDistKm = Math.round((accumulatedDistanceMeters / 1000) * 10) / 10;
    const avgSpeed = Math.round(waypoints.reduce((s, w) => s + w.speed_kmh, 0) / waypoints.length);
    const districts = Array.from(new Set(waypoints.map(w => w.district)));

    return {
      target_identifier: `${cleanPlate} (State Highway Surveillance Track)`,
      first_seen: waypoints[0]?.timestamp || new Date().toISOString(),
      last_seen: waypoints[waypoints.length - 1]?.timestamp || new Date().toISOString(),
      total_distance_km: totalDistKm || 8.4,
      average_speed_kmh: avgSpeed || 52,
      districts_traversed: districts,
      waypoints,
      estimated_direction: 'North-East Inter-City Bypass Corridor',
    };
  }

  // Metadata Forensic Multi-attribute Search
  public searchMetadata(filters: MetadataSearchFilter) {
    let list = this.metadataObjects;

    if (filters.target_type && filters.target_type !== 'ALL') {
      list = list.filter(m => m.category === filters.target_type);
    }
    if (filters.district && filters.district !== 'ALL') {
      list = list.filter(m => m.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters.camera_global_id) {
      list = list.filter(m => m.global_camera_id.toLowerCase().includes(filters.camera_global_id!.toLowerCase()));
    }
    if (filters.vehicle_type && filters.vehicle_type !== 'ALL') {
      list = list.filter(m => m.attributes.type?.toLowerCase() === filters.vehicle_type!.toLowerCase());
    }
    if (filters.color && filters.color !== 'ALL') {
      list = list.filter(
        m =>
          m.attributes.color?.toLowerCase().includes(filters.color!.toLowerCase()) ||
          m.attributes.clothing_upper?.toLowerCase().includes(filters.color!.toLowerCase())
      );
    }
    if (filters.plate_query) {
      const q = filters.plate_query.replace(/\s+/g, '').toLowerCase();
      list = list.filter(m => m.attributes.plate && m.attributes.plate.replace(/\s+/g, '').toLowerCase().includes(q));
    }
    if (filters.speed_min !== undefined && filters.speed_min > 0) {
      list = list.filter(m => (m.attributes.speed_kmh || 0) >= filters.speed_min!);
    }
    if (filters.speed_max !== undefined && filters.speed_max > 0) {
      list = list.filter(m => (m.attributes.speed_kmh || 0) <= filters.speed_max!);
    }

    return {
      total: list.length,
      items: list.slice(0, 60),
    };
  }

  // Investigation Workspace Cases
  public getCases(): InvestigationCase[] {
    return this.cases;
  }

  public getCaseById(id: string): InvestigationCase | undefined {
    return this.cases.find(c => c.id === id || c.case_number.toLowerCase() === id.toLowerCase());
  }

  public createCase(data: Partial<InvestigationCase>): InvestigationCase {
    const newCase: InvestigationCase = {
      id: `case-${Date.now()}`,
      case_number: `CASE-GJ-2026-${String(1000 + this.cases.length + 1)}`,
      title: data.title || 'Untitled Investigation Case',
      priority: data.priority || 'NORMAL',
      status: 'ACTIVE',
      lead_investigator: data.lead_investigator || 'Inspector on Duty',
      created_at: new Date().toISOString(),
      incident_datetime: data.incident_datetime || new Date().toISOString(),
      location_summary: data.location_summary || 'Statewide Gujarat CCTV Network',
      description: data.description || '',
      pinned_camera_ids: data.pinned_camera_ids || [],
      evidence_events: data.evidence_events || [],
      evidence_anpr_hits: data.evidence_anpr_hits || [],
      notes: [
        {
          id: `note-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: data.lead_investigator || 'Inspector on Duty',
          content: 'Case opened in Model 2 Unified Investigation Workspace.',
        },
      ],
    };

    this.cases.unshift(newCase);
    return newCase;
  }

  public addCaseNote(caseId: string, author: string, content: string) {
    const c = this.getCaseById(caseId);
    if (!c) return null;

    c.notes.push({
      id: `note-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author,
      content,
    });
    return c;
  }

  public pinCameraToCase(caseId: string, globalCameraId: string) {
    const c = this.getCaseById(caseId);
    if (!c) return null;

    if (!c.pinned_camera_ids.includes(globalCameraId)) {
      c.pinned_camera_ids.push(globalCameraId);
    }
    return c;
  }
}

export const model2Db = new Model2DatabaseService();
