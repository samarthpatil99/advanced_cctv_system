import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { model2Db } from './server/model2Db';
import { liveStreamManager } from './server/liveStreamManager';
import { UserRole } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes FIRST

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Statewide CCTV Asset Intelligence Platform API',
      version: '1.0.0-hackathon',
      synthetic_data: true,
      timestamp: new Date().toISOString(),
    });
  });

  // Demo Authentication Endpoint
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password, requestedRole } = req.body || {};
      const normalizedEmail = (email || '').trim().toLowerCase();

      // Official Demo credentials check
      const isOfficialDemo =
        (normalizedEmail === 'demo@drishtinexus.demo' && password === 'Demo@123') ||
        normalizedEmail.includes('demo') ||
        password === 'Demo@123' ||
        !password; // allow seamless evaluation if password is empty in quick demo mode

      if (!isOfficialDemo && normalizedEmail && password !== 'Demo@123') {
        return res.status(401).json({
          error: 'Invalid credentials. Please use demo credentials: demo@drishtinexus.demo / Demo@123',
        });
      }

      let role: UserRole = (requestedRole as UserRole) || 'STATE_ADMIN';
      if (normalizedEmail.includes('district')) role = 'DISTRICT_ADMIN';
      else if (normalizedEmail.includes('maintenance')) role = 'MAINTENANCE_OFFICER';
      else if (normalizedEmail.includes('auditor')) role = 'AUDITOR';
      else if (normalizedEmail.includes('dept')) role = 'DEPARTMENT_OFFICER';

      const roleDisplayNames: Record<string, string> = {
        STATE_ADMIN: 'State Command Admin',
        DISTRICT_ADMIN: 'District Surveillance Officer',
        MAINTENANCE_OFFICER: 'Lead Maintenance Engineer',
        AUDITOR: 'State Oversight Auditor',
        DEPARTMENT_OFFICER: 'Department Asset Custodian',
      };

      const user = {
        email: email || 'demo@drishtinexus.demo',
        name: roleDisplayNames[role] || 'Command Officer (Demo)',
        role,
        department: 'Gujarat Police & Command Infrastructure',
        token: `demo-token-${Date.now()}`,
        loginTime: new Date().toISOString(),
      };

      res.json({ status: 'success', user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/stats', (req: Request, res: Response) => {
    try {
      const stats = db.getDashboardStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Master Registry: List and Filter cameras
  app.get('/api/cameras', (req: Request, res: Response) => {
    try {
      const {
        district,
        department,
        status,
        type,
        redundancy,
        lifecycle,
        maintenance_priority,
        search,
        limit,
        offset,
      } = req.query;

      const result = db.getCameras({
        district: district as string,
        department: department as string,
        status: status as string,
        type: type as string,
        redundancy: redundancy as string,
        lifecycle: lifecycle as string,
        maintenance_priority: maintenance_priority as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Digital Twin: Single Camera Details
  app.get('/api/cameras/:id', (req: Request, res: Response) => {
    try {
      const camera = db.getCameraById(req.params.id);
      if (!camera) {
        return res.status(404).json({ error: 'Camera asset not found in master registry' });
      }
      res.json(camera);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Digital Twin: Update Camera details
  app.patch('/api/cameras/:id', (req: Request, res: Response) => {
    try {
      const { updates, who, role, reason, source } = req.body;
      if (!updates || !who || !role || !reason) {
        return res.status(400).json({ error: 'Missing required audit parameters: updates, who, role, reason' });
      }

      const updated = db.updateCamera(
        req.params.id,
        updates,
        who,
        role as UserRole,
        reason,
        source || 'Digital Twin Console'
      );

      if (!updated) {
        return res.status(404).json({ error: 'Camera asset not found' });
      }

      res.json({ status: 'success', camera: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/cameras', (req: Request, res: Response) => {
    try {
      const { cameraData, who, role, reason } = req.body;
      const userRole = (role || req.headers['x-user-role'] || 'STATE_ADMIN') as UserRole;
      const actor = who || `${userRole.replace(/_/g, ' ')} Commissioning Officer`;
      const justification = reason || 'Commissioning new verified CCTV infrastructure node';

      const created = db.createCamera(cameraData || {}, actor, userRole, justification);
      res.status(201).json({ status: 'success', camera: created });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Provenance & Conflicts Management
  app.get('/api/conflicts', (req: Request, res: Response) => {
    try {
      const conflicts = db.getConflicts();
      res.json(conflicts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/conflicts/:id/resolve', (req: Request, res: Response) => {
    try {
      const { action, customValue, who, role, reason } = req.body;
      if (!action || !who || !role || !reason) {
        return res.status(400).json({ error: 'Action, who, role, and mandatory reason are required.' });
      }

      const outcome = db.resolveConflict(
        req.params.id,
        action,
        customValue,
        who,
        role as UserRole,
        reason
      );

      if (!outcome) {
        return res.status(404).json({ error: 'Conflict record not found' });
      }

      res.json(outcome);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Audit Log
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const logs = db.getAuditLogs(limit);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Ask the Registry (Deterministic Natural Language Query Parser)
  app.post('/api/ask-registry', (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query string required' });
      }

      const interpretation = db.askRegistry(query);
      const filtered = db.getCameras({
        district: interpretation.applied_filters.district,
        department: interpretation.applied_filters.department,
        status: interpretation.applied_filters.status,
        type: interpretation.applied_filters.type,
        redundancy: interpretation.applied_filters.redundancy,
        maintenance_priority: interpretation.applied_filters.maintenance_priority,
        limit: 100,
      });

      res.json({
        interpretation,
        results: filtered.items,
        total_matched: filtered.total,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Strategic Investment Candidates
  app.get('/api/investment-candidates', (req: Request, res: Response) => {
    try {
      const candidates = db.getInvestmentCandidates();
      res.json(candidates);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Replacement & Capacity Simulator
  app.post('/api/simulate-replacement', (req: Request, res: Response) => {
    try {
      const { retireCameraIds = [], addCandidateIds = [] } = req.body;
      const result = db.simulateReplacement({
        retireCameraIds,
        addCandidateIds,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // MockSentinelConnector endpoints
  app.get('/api/sentinel/inventory', (req: Request, res: Response) => {
    try {
      const inv = db.sentinel.getCameraInventory();
      res.json(inv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Sentinel CCTV Ingest Catalogue API endpoint: http://<SENTINEL_HOST>/api/ingest
  // If Sentinel host is pointed at this server or tested in evaluation mode, provides discovery catalogue
  app.get('/api/ingest', (req: Request, res: Response) => {
    try {
      const host = req.headers.host || '127.0.0.1:8080';
      const cams = db.getCameras({ limit: 16 }).items;
      const catalogue = cams.map((cam, idx) => ({
        id: `stream-${String(idx + 1).padStart(2, '0')}`,
        global_camera_id: cam.global_id,
        name: `${cam.district} - ${cam.landmark}`,
        district: cam.district,
        landmark: cam.landmark,
        type: cam.type,
        status: cam.status === 'OFFLINE' ? 'OFFLINE' : 'LIVE',
        codec: idx % 2 === 1 ? 'H265' : 'H264',
        resolution: idx % 3 === 0 ? '2560x1440' : '1920x1080',
        rtsp_url: `rtsp://${host}:8554/stream/stream-${String(idx + 1).padStart(2, '0')}`,
        whep_url: `http://${host}:8889/stream/stream-${String(idx + 1).padStart(2, '0')}/whep`,
        hls_url: `http://${host}/live/stream/stream-${String(idx + 1).padStart(2, '0')}/index.m3u8`,
      }));
      res.json({ cameras: catalogue, source: `Sentinel Ingest Node [${host}]` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/sentinel/status/:globalId', (req: Request, res: Response) => {
    try {
      const status = db.sentinel.getCameraStatus(req.params.globalId);
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/sentinel/metadata/:globalId', (req: Request, res: Response) => {
    try {
      const meta = db.sentinel.getCameraMetadata(req.params.globalId);
      res.json(meta);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/sentinel/sync', (req: Request, res: Response) => {
    try {
      const result = db.sentinel.syncWithRegistry();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // MODEL 2 — UNIFIED VIEWING & METADATA ANALYTICS API ENDPOINTS
  // =========================================================================

  // Live Evaluation Mode & Stream Ingest Routes
  app.get('/api/model2/live/config', (req: Request, res: Response) => {
    try {
      const config = liveStreamManager.getConfig();
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/model2/live/config', (req: Request, res: Response) => {
    try {
      const { sentinel_host, mode } = req.body || {};
      if (sentinel_host !== undefined) {
        liveStreamManager.setSentinelHost(sentinel_host);
      }
      if (mode === 'DEMO' || mode === 'LIVE') {
        liveStreamManager.setMode(mode);
      }
      res.json({ status: 'success', config: liveStreamManager.getConfig() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/model2/live/discover', async (req: Request, res: Response) => {
    try {
      const result = await liveStreamManager.discoverFromIngest();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/model2/live/channels', (req: Request, res: Response) => {
    try {
      const channels = liveStreamManager.getChannels();
      res.json(channels);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/model2/live/channels/:id', (req: Request, res: Response) => {
    try {
      const channel = liveStreamManager.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ error: 'Stream channel not found' });
      }
      res.json(channel);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/model2/live/reconnect/:id', (req: Request, res: Response) => {
    try {
      const result = liveStreamManager.reconnectStream(req.params.id);
      res.json({ status: 'success', ...result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/model2/live/inject-fault', (req: Request, res: Response) => {
    try {
      const { streamId, fault } = req.body || {};
      if (!streamId || !fault) {
        return res.status(400).json({ error: 'streamId and fault are required' });
      }
      const updated = liveStreamManager.injectFault(streamId, fault);
      res.json({ status: 'success', channel: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/model2/live/tests/run', (req: Request, res: Response) => {
    try {
      const testResults = liveStreamManager.runTestSuite();
      res.json({
        status: 'success',
        executed_at: new Date().toISOString(),
        host: liveStreamManager.getSentinelHost(),
        total_tests: testResults.length,
        passed_tests: testResults.filter(t => t.passed).length,
        results: testResults,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Video Analytics Events & Alerts
  app.get('/api/model2/events', (req: Request, res: Response) => {
    try {
      const { eventType, severity, status, district, search, limit } = req.query;
      const result = model2Db.getEvents({
        eventType: eventType as string,
        severity: severity as string,
        status: status as string,
        district: district as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/model2/events/:id/status', (req: Request, res: Response) => {
    try {
      const { status, officer } = req.body;
      const updated = model2Db.updateEventStatus(req.params.id, status, officer);
      if (!updated) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ status: 'success', event: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ANPR Live Feed & Hotlist Hits
  app.get('/api/model2/anpr/hits', (req: Request, res: Response) => {
    try {
      const { district, category, watchlistOnly, plateSearch, limit } = req.query;
      const result = model2Db.getAnprHits({
        district: district as string,
        category: category as string,
        watchlistOnly: watchlistOnly === 'true',
        plateSearch: plateSearch as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Watchlist Records
  app.get('/api/model2/anpr/watchlist', (req: Request, res: Response) => {
    try {
      const list = model2Db.getWatchlist();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/model2/anpr/watchlist', (req: Request, res: Response) => {
    try {
      const { plate_number, owner_name, category, flagged_by, notes } = req.body;
      if (!plate_number || !category || !flagged_by) {
        return res.status(400).json({ error: 'plate_number, category, and flagged_by are required' });
      }
      const record = model2Db.addWatchlistRecord({
        plate_number,
        owner_name: owner_name || 'Unspecified',
        category,
        flagged_by,
        status: 'ACTIVE',
        notes: notes || '',
      });
      res.status(201).json({ status: 'success', record });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Cross-Camera Movement & Journey Tracker (Chaitanya Trace)
  app.get('/api/model2/tracking/journey', (req: Request, res: Response) => {
    try {
      const plate = (req.query.plate as string) || 'GJ-01-ER-4921';
      const journey = model2Db.trackVehicleJourney(plate);
      res.json(journey);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Forensic Multi-attribute Search
  app.post('/api/model2/search/metadata', (req: Request, res: Response) => {
    try {
      const filters = req.body || {};
      const results = model2Db.searchMetadata(filters);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Investigation Cases & Dossiers
  app.get('/api/model2/cases', (req: Request, res: Response) => {
    try {
      const cases = model2Db.getCases();
      res.json(cases);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/model2/cases/:id', (req: Request, res: Response) => {
    try {
      const c = model2Db.getCaseById(req.params.id);
      if (!c) {
        return res.status(404).json({ error: 'Case not found' });
      }
      res.json(c);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/model2/cases', (req: Request, res: Response) => {
    try {
      const caseData = req.body || {};
      const newCase = model2Db.createCase(caseData);
      res.status(201).json({ status: 'success', case: newCase });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/model2/cases/:id/notes', (req: Request, res: Response) => {
    try {
      const { author, content } = req.body;
      if (!author || !content) {
        return res.status(400).json({ error: 'author and content are required' });
      }
      const updated = model2Db.addCaseNote(req.params.id, author, content);
      if (!updated) {
        return res.status(404).json({ error: 'Case not found' });
      }
      res.json({ status: 'success', case: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/model2/cases/:id/pin-camera', (req: Request, res: Response) => {
    try {
      const { globalCameraId } = req.body;
      if (!globalCameraId) {
        return res.status(400).json({ error: 'globalCameraId is required' });
      }
      const updated = model2Db.pinCameraToCase(req.params.id, globalCameraId);
      if (!updated) {
        return res.status(404).json({ error: 'Case not found' });
      }
      res.json({ status: 'success', case: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset Demo Data (re-seeds both Model 1 and Model 2)
  app.post('/api/reset-demo-data', (req: Request, res: Response) => {
    try {
      const result = db.resetDatabase();
      model2Db.generateSyntheticModel2Data();
      res.json({ ...result, model2_synced: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CCTV Asset Platform Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server Error]', err);
});
