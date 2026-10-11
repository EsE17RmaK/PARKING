import { Router } from 'express';
import { verificarEstadoFinanciero } from '../controllers/financieroController.js';
import { verificarJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/estado-solvencia', verificarJWT, verificarEstadoFinanciero);

export default router;