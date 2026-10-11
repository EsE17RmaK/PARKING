import { Router } from 'express';
import { cancelarReservaEstudiante } from '../controllers/reservaController.js';
import { verificarJWT } from '../middlewares/authMiddleware.js';

const router = Router();
router.post('/cancelar', verificarJWT, cancelarReservaEstudiante);

export default router;