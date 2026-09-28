const API_BASE = '/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('smart_farmer_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.success) {
    const errorMsg = json.error?.message || `HTTP ${response.status} Error`;
    throw new Error(errorMsg);
  }
  return json.data;
};

export const api = {
  // Auth
  sendOtp: async (phone) => {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return handleResponse(res);
  },

  login: async (phone, password, otp) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, otp })
    });
    return handleResponse(res);
  },

  register: async (name, phone, password, preferredLanguage, otp) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password, preferredLanguage, otp })
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Farms
  getFarms: async () => {
    const res = await fetch(`${API_BASE}/farms`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getFarm: async (id) => {
    const res = await fetch(`${API_BASE}/farms/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createFarm: async (farmData) => {
    const res = await fetch(`${API_BASE}/farms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(farmData)
    });
    return handleResponse(res);
  },

  analyzeFarmPhoto: async (imageFile, visualAnalysis) => {
    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (visualAnalysis) {
      formData.append('isFarmClient', String(visualAnalysis.isFarm));
      if (visualAnalysis.error) {
        formData.append('clientError', visualAnalysis.error);
      }
    }
    const token = localStorage.getItem('smart_farmer_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/farms/analyze-photo`, {
      method: 'POST',
      headers,
      body: formData
    });
    return handleResponse(res);
  },

  updateFarm: async (id, farmData) => {
    const res = await fetch(`${API_BASE}/farms/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(farmData)
    });
    return handleResponse(res);
  },

  deleteFarm: async (id) => {
    const res = await fetch(`${API_BASE}/farms/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Fields
  getField: async (id) => {
    const res = await fetch(`${API_BASE}/fields/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getFieldsByFarm: async (farmId) => {
    const res = await fetch(`${API_BASE}/farms/${farmId}/fields`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createField: async (farmId, fieldData) => {
    const res = await fetch(`${API_BASE}/farms/${farmId}/fields`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(fieldData)
    });
    return handleResponse(res);
  },

  updateField: async (id, fieldData) => {
    const res = await fetch(`${API_BASE}/fields/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(fieldData)
    });
    return handleResponse(res);
  },

  deleteField: async (id) => {
    const res = await fetch(`${API_BASE}/fields/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Crops
  getCrops: async (farmId = '') => {
    const url = farmId ? `${API_BASE}/crops?farmId=${farmId}` : `${API_BASE}/crops`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },

  getCrop: async (id) => {
    const res = await fetch(`${API_BASE}/crops/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createCrop: async (cropData) => {
    const res = await fetch(`${API_BASE}/crops`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(cropData)
    });
    return handleResponse(res);
  },

  updateCrop: async (id, cropData) => {
    const res = await fetch(`${API_BASE}/crops/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(cropData)
    });
    return handleResponse(res);
  },

  deleteCrop: async (id) => {
    const res = await fetch(`${API_BASE}/crops/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Sensors & Telemetry
  getSensors: async (farmId = '') => {
    const url = farmId ? `${API_BASE}/sensors?farmId=${farmId}` : `${API_BASE}/sensors`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },

  createSensor: async (sensorData) => {
    const res = await fetch(`${API_BASE}/sensors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sensorData)
    });
    return handleResponse(res);
  },

  updateSensor: async (id, sensorData) => {
    const res = await fetch(`${API_BASE}/sensors/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(sensorData)
    });
    return handleResponse(res);
  },

  deleteSensor: async (id) => {
    const res = await fetch(`${API_BASE}/sensors/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  addSensorReading: async (sensorId, value, unit) => {
    const res = await fetch(`${API_BASE}/sensors/${sensorId}/readings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ value, unit })
    });
    return handleResponse(res);
  },

  getSensorReadings: async (sensorId) => {
    const res = await fetch(`${API_BASE}/sensors/${sensorId}/readings`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Pest Records
  getPests: async (farmId = '') => {
    const url = farmId ? `${API_BASE}/pests?farmId=${farmId}` : `${API_BASE}/pests`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },

  createPest: async (pestData) => {
    const res = await fetch(`${API_BASE}/pests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(pestData)
    });
    return handleResponse(res);
  },

  analyzePest: async (formData) => {
    const token = localStorage.getItem('smart_farmer_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/pests/analyze`, {
      method: 'POST',
      headers,
      body: formData
    });
    return handleResponse(res);
  },

  updatePest: async (id, pestData) => {
    const res = await fetch(`${API_BASE}/pests/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(pestData)
    });
    return handleResponse(res);
  },

  deletePest: async (id) => {
    const res = await fetch(`${API_BASE}/pests/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Weather Service
  getWeatherForFarm: async (farmId) => {
    const res = await fetch(`${API_BASE}/weather/farm/${farmId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // AI Recommendation Engine
  analyzeFarm: async (farmId, cropId = null) => {
    const res = await fetch(`${API_BASE}/recommendations/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ farmId, cropId })
    });
    return handleResponse(res);
  },

  getRecommendations: async (farmId = '') => {
    const url = farmId ? `${API_BASE}/recommendations?farmId=${farmId}` : `${API_BASE}/recommendations`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },

  markRecommendationReviewed: async (id) => {
    const res = await fetch(`${API_BASE}/recommendations/${id}/review`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Alerts
  getAlerts: async (unreadOnly = false) => {
    const url = unreadOnly ? `${API_BASE}/alerts?unread=true` : `${API_BASE}/alerts`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },

  markAlertRead: async (id) => {
    const res = await fetch(`${API_BASE}/alerts/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  markAllAlertsRead: async () => {
    const res = await fetch(`${API_BASE}/alerts/read-all`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Reports
  getFarmReport: async (farmId) => {
    const res = await fetch(`${API_BASE}/reports/farm/${farmId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getCropReport: async (cropId) => {
    const res = await fetch(`${API_BASE}/reports/crop/${cropId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getSensorReport: async (farmId) => {
    const res = await fetch(`${API_BASE}/reports/sensors/${farmId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getWeatherReport: async (farmId) => {
    const res = await fetch(`${API_BASE}/reports/weather/${farmId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getPestReport: async (farmId) => {
    const res = await fetch(`${API_BASE}/reports/pests/${farmId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getRecommendationReport: async (farmId) => {
    const res = await fetch(`${API_BASE}/reports/recommendations/${farmId}`, { headers: getHeaders() });
    return handleResponse(res);
  }
};
