import axios from 'axios';

const API_BASE = '/api';
const token = localStorage.getItem('token');

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

export const surveyService = {
  // Survey Management
  createSurvey: async (data: any) => {
    const response = await axios.post(`${API_BASE}/surveys`, data, { headers });
    return response.data;
  },

  getSurvey: async (surveyId: string) => {
    const response = await axios.get(`${API_BASE}/surveys/${surveyId}`, { headers });
    return response.data;
  },

  getSessionSurveys: async (sessionId: string) => {
    const response = await axios.get(`${API_BASE}/surveys/session/${sessionId}`, { headers });
    return response.data;
  },

  publishSurvey: async (surveyId: string) => {
    const response = await axios.post(
      `${API_BASE}/surveys/publish`,
      { survey_id: surveyId },
      { headers }
    );
    return response.data;
  },

  closeSurvey: async (surveyId: string) => {
    const response = await axios.post(
      `${API_BASE}/surveys/close`,
      { survey_id: surveyId },
      { headers }
    );
    return response.data;
  },

  getSurveyResults: async (surveyId: string) => {
    const response = await axios.get(`${API_BASE}/surveys/results/${surveyId}`, { headers });
    return response.data;
  },

  // Questions
  addQuestion: async (surveyId: string, data: any) => {
    const response = await axios.post(
      `${API_BASE}/surveys/questions`,
      { survey_id: surveyId, ...data },
      { headers }
    );
    return response.data;
  },

  addQuestionOption: async (questionId: string, optionText: string) => {
    const response = await axios.post(
      `${API_BASE}/surveys/questions/options`,
      { question_id: questionId, option_text: optionText },
      { headers }
    );
    return response.data;
  },

  // Responses
  startSurveyResponse: async (surveyId: string) => {
    const response = await axios.post(
      `${API_BASE}/surveys/start`,
      { survey_id: surveyId },
      { headers }
    );
    return response.data;
  },

  submitAnswer: async (responseId: string, questionId: string, answer: any) => {
    const response = await axios.post(
      `${API_BASE}/surveys/submit-answer`,
      { response_id: responseId, question_id: questionId, ...answer },
      { headers }
    );
    return response.data;
  },

  completeSurveyResponse: async (responseId: string) => {
    const response = await axios.post(
      `${API_BASE}/surveys/complete`,
      { response_id: responseId },
      { headers }
    );
    return response.data;
  },
};

export const emailService = {
  // Send
  sendNotification: async (email: string, templateName: string, variables: any) => {
    const response = await axios.post(
      `${API_BASE}/email/send`,
      {
        recipient_email: email,
        template_name: templateName,
        variables,
      },
      { headers }
    );
    return response.data;
  },

  sendSurveyReminder: async (surveyId: string, userIds?: string[]) => {
    const response = await axios.post(
      `${API_BASE}/email/send-survey-reminder`,
      { survey_id: surveyId, user_ids: userIds },
      { headers }
    );
    return response.data;
  },

  // Templates
  createTemplate: async (data: any) => {
    const response = await axios.post(`${API_BASE}/email/template`, data, { headers });
    return response.data;
  },

  getTemplate: async (name: string) => {
    const response = await axios.get(`${API_BASE}/email/template/${name}`, { headers });
    return response.data;
  },

  // Preferences
  getPreferences: async (userId: string) => {
    const response = await axios.get(`${API_BASE}/email/preferences/${userId}`, { headers });
    return response.data;
  },

  updatePreferences: async (userId: string, prefs: any) => {
    const response = await axios.put(`${API_BASE}/email/preferences/${userId}`, prefs, {
      headers,
    });
    return response.data;
  },

  // Logs
  getEmailLogs: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit);
    if (filters?.offset) params.append('offset', filters.offset);

    const response = await axios.get(`${API_BASE}/email/logs?${params.toString()}`, {
      headers,
    });
    return response.data;
  },
};

export default { surveyService, emailService };
