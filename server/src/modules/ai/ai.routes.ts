import { Router } from 'express';
import { askData } from './ai.controller';

const router = Router();

router.post('/:datasetId/ask', askData);

export default router;