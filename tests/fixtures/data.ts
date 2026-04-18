// Minimal test fixtures for Servipinsa backoffice
export const FIXTURES = {
  users: {
    alice: {
      email: 'alice@example.com',
      name: 'Alice User',
      role: 'EMPLEADO' as const,
    },
    bob: {
      email: 'bob@example.com',
      name: 'Bob User',
      role: 'EMPLEADO' as const,
    },
    manager: {
      email: 'manager@example.com',
      name: 'Manager User',
      role: 'MANAGER' as const,
    },
  },
  sessions: {
    aliceSession: {
      token: 'test-session-token-alice',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
    },
    bobSession: {
      token: 'test-session-token-bob',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
    },
    expiredSession: {
      token: 'test-session-expired',
      expiresAt: new Date(Date.now() - 1000), // Already expired
    },
  },
  accounts: {
    aliceAccount: {
      accountId: 'alice@example.com',
      providerId: 'credential',
      password:
        '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // 'password123'
    },
    bobAccount: {
      accountId: 'bob@example.com',
      providerId: 'credential',
      password:
        '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // 'password123'
    },
    managerAccount: {
      accountId: 'manager@example.com',
      providerId: 'credential',
      password:
        '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // 'password123'
    },
  },
  workOrders: {
    sampleOrder: {
      client: 'Acme Corp',
      address: 'Calle Principal 1, Madrid',
      carNumber: 'ABC-123',
      driverOut: 'Juan',
      driverReturn: 'Pedro',
    },
  },
  workOrderTasks: {
    sampleTask: {
      description: 'Instalación de tubería',
      startTime: new Date('2026-03-29T08:00:00Z'),
      endTime: new Date('2026-03-29T12:00:00Z'),
      projectNumber: '100/2026' as string | null,
      workType: 'obra' as
        | 'visita_tecnica'
        | 'oficina'
        | 'obra'
        | 'punto_recarga'
        | 'postventa'
        | 'averia'
        | null,
    },
  },
  workOrderLabor: {
    sampleLabor: {
      technicianName: 'Carlos Técnico',
      entryTime: new Date('2026-03-29T08:00:00Z'),
      exitTime: new Date('2026-03-29T17:00:00Z'),
    },
  },
  workOrderMaterials: {
    sampleMaterial: {
      units: 10,
      description: 'Tubería PVC 110mm',
      project: '100/2026',
      supply: 'Proveedor X',
    },
  },
}
