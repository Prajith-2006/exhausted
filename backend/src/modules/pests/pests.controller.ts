import { Request, Response } from 'express';
import { PestsService } from './pests.service';
import { PestAnalyzerService } from './pests.analyzer';
import { sendSuccess } from '../../utils/response';
import { asyncHandler, AppError } from '../../utils/errors';

export const getPestsHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const farmId = req.query.farmId as string;
  const pests = await PestsService.getPestsByUser(ownerId, farmId);
  return sendSuccess(res, pests);
});

export const getPestByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const pest = await PestsService.getPestById(id, ownerId);
  return sendSuccess(res, pest);
});

export const createPestHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { cropId, farmId, fieldId, pestName, severity, dateDetected, affectedArea, treatment, notes, aiAnalysis } = req.body;

  if (!cropId || !farmId || !pestName) {
    throw new AppError('cropId, farmId, and pestName are required', 400, 'VALIDATION_ERROR');
  }

  const pest = await PestsService.createPest(ownerId, {
    cropId,
    farmId,
    fieldId,
    pestName,
    severity,
    dateDetected,
    affectedArea,
    treatment,
    notes,
    aiAnalysis
  });
  return sendSuccess(res, pest, 201);
});

export const analyzePestHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId, cropId, fieldId, symptoms, notes, initialSeverity, affectedArea, areaUnit, dateDetected } = req.body;

  if (!farmId || !cropId) {
    throw new AppError('farmId and cropId are required for pest analysis', 400, 'VALIDATION_ERROR');
  }

  // Files extraction from Multer fields
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const pdfFile = files?.pdf?.[0] || (req.file?.fieldname === 'pdf' ? req.file : undefined);
  const imageFile = files?.image?.[0] || (req.file?.fieldname === 'image' ? req.file : undefined);

  let pdfBuffer: Buffer | undefined = undefined;
  let pdfFilename: string | undefined = undefined;
  if (pdfFile) {
    if (pdfFile.mimetype !== 'application/pdf' && !pdfFile.originalname.toLowerCase().endsWith('.pdf')) {
      throw new AppError('Invalid document format. Only PDF files are supported for document upload.', 400, 'INVALID_FILE_TYPE');
    }
    if (pdfFile.size > 10 * 1024 * 1024) {
      throw new AppError('PDF file exceeds maximum allowed size of 10MB.', 400, 'FILE_TOO_LARGE');
    }
    pdfBuffer = pdfFile.buffer;
    pdfFilename = pdfFile.originalname;
  }

  let imageBuffer: Buffer | undefined = undefined;
  let imageMimeType: string = 'image/jpeg';
  if (imageFile) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(imageFile.mimetype.toLowerCase())) {
      throw new AppError('Invalid image format. Supported formats: JPEG, PNG, WebP.', 400, 'INVALID_FILE_TYPE');
    }
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new AppError('Image file exceeds maximum allowed size of 10MB.', 400, 'FILE_TOO_LARGE');
    }
    imageBuffer = imageFile.buffer;
    imageMimeType = imageFile.mimetype;
  }

  const analysisResult = await PestAnalyzerService.analyzeIncident({
    ownerId,
    farmId,
    cropId,
    fieldId,
    manualInput: {
      symptoms,
      notes,
      initialSeverity,
      affectedArea: affectedArea ? Number(affectedArea) : undefined,
      areaUnit,
      dateDetected
    },
    pdfBuffer,
    pdfFilename,
    imageBuffer,
    imageMimeType
  });

  return sendSuccess(res, analysisResult);
});

export const updatePestHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const pest = await PestsService.updatePest(id, ownerId, req.body);
  return sendSuccess(res, pest);
});

export const deletePestHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const result = await PestsService.deletePest(id, ownerId);
  return sendSuccess(res, result);
});

