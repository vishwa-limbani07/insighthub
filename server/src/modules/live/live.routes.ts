import { Router } from 'express';
import { startLiveStream, getLiveSnapshot } from './live.controller';

const router = Router();

router.get('/stream', startLiveStream);
router.get('/snapshot', getLiveSnapshot);

export default router;