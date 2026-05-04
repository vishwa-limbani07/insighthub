import { Router } from 'express';
import { upload } from '../../config/multer';
import {
  uploadDataset,
  getDatasets,
  getDatasetById,
  getDatasetPreview,
  deleteDataset,
} from './dataset.controller';

const router = Router();

router.post('/upload', upload.single('file'), uploadDataset);
router.get('/', getDatasets);
router.get('/:id', getDatasetById);
router.get('/:id/preview', getDatasetPreview);
router.delete('/:id', deleteDataset);

export default router;