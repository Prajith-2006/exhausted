import { Request, Response } from 'express';
import { SensorsService } from './sensors.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler, AppError } from '../../utils/errors';

export const getSensorsHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const farmId = req.query.farmId as string;
  const sensors = await SensorsService.getSensorsByUser(ownerId, farmId);
  return sendSuccess(res, sensors);
});

export const getSensorByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const sensor = await SensorsService.getSensorById(id, ownerId);
  return sendSuccess(res, sensor);
});

export const createSensorHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId, fieldId, deviceId, name, type, unit, status } = req.body;

  if (!farmId || !deviceId || !name || !type || !unit) {
    throw new AppError('farmId, deviceId, name, type, and unit are required', 400, 'VALIDATION_ERROR');
  }

  const sensor = await SensorsService.createSensor(ownerId, {
    farmId,
    fieldId,
    deviceId,
    name,
    type,
    unit,
    status
  });
  return sendSuccess(res, sensor, 201);
});

export const updateSensorHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const sensor = await SensorsService.updateSensor(id, ownerId, req.body);
  return sendSuccess(res, sensor);
});

export const deleteSensorHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const result = await SensorsService.deleteSensor(id, ownerId);
  return sendSuccess(res, result);
});

export const addReadingHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { sensorId } = req.params;
  const { value, unit } = req.body;

  if (value === undefined || value === null) {
    throw new AppError('Reading value is required', 400, 'VALIDATION_ERROR');
  }

  const reading = await SensorsService.addReading(sensorId, ownerId, Number(value), unit);
  return sendSuccess(res, reading, 201);
});

export const getReadingsHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { sensorId } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

  const readings = await SensorsService.getReadings(sensorId, ownerId, limit);
  return sendSuccess(res, readings);
});
