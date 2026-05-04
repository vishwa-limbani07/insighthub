import { Router } from 'express';
import { getChartData } from './chart.controller';

const router = Router();

router.get('/:datasetId', getChartData);

export default router;