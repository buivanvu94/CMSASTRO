import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import mediaRoutes from './modules/media/media.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import postRoutes from './modules/posts/post.routes.js';
import productRoutes from './modules/products/product.routes.js';
import reservationRoutes from './modules/reservations/reservation.routes.js';
import contactRoutes from './modules/contacts/contact.routes.js';
import menuRoutes from './modules/menus/menu.routes.js';
import settingRoutes from './modules/settings/setting.routes.js';

// Import middlewares
import { errorHandler } from './middlewares/errorHandler.js';
import { config } from './config/index.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create Express application
 */
const app = express();

/**
 * Security & Logging Middlewares
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
// CORS configuration - Allow all origins for development
app.use(cors({
  origin: '*', // Allow all origins
  credentials: false, // Set to false when using wildcard origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

/**
 * Body Parser Middlewares
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Static Files
 * Serve uploaded files
 */
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.env
  });
});

/**
 * API Routes
 * Base path: /api/v1
 */
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/media`, mediaRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/posts`, postRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/reservations`, reservationRoutes);
app.use(`${API_PREFIX}/contacts`, contactRoutes);
app.use(`${API_PREFIX}/menus`, menuRoutes);
app.use(`${API_PREFIX}/settings`, settingRoutes);

/**
 * 404 Handler
 * Handle undefined routes
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

/**
 * Global Error Handler
 * Must be last middleware
 */
app.use(errorHandler);

export default app;
