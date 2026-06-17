import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

// CORS only needed in dev — in production the frontend is served from the same origin
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
}

// ── Applications ───────────────────────────────────────────────────────────────

app.get('/api/applications', async (req, res) => {
  const { status } = req.query;
  const applications = await prisma.application.findMany({
    where: status ? { status: status as 'NEW' | 'IN_PROGRESS' | 'DONE' } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  res.json(applications);
});

app.post('/api/applications', async (req, res) => {
  const { clientName, phone, equipmentType, comment, status } = req.body as {
    clientName: string;
    phone: string;
    equipmentType: string;
    comment?: string;
    status?: string;
  };
  const application = await prisma.application.create({
    data: { clientName, phone, equipmentType, comment, status: (status as any) ?? 'NEW' },
  });
  res.status(201).json(application);
});

app.patch('/api/applications/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const application = await prisma.application.update({
    where: { id },
    data: req.body,
  });
  res.json(application);
});

app.delete('/api/applications/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await prisma.application.delete({ where: { id } });
  res.status(204).send();
});

// ── Static frontend (production) ───────────────────────────────────────────────

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ── Start ──────────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '3000', 10);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
