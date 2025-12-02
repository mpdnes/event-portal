import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ChartBarIcon, 
  EnvelopeIcon, 
  XMarkIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import SurveyBuilder from '../../components/surveys/SurveyBuilder';

interface SurveyResult {
  survey_id: string;
  total_responses: number;
  questions: any[];
}

export default function SessionSurveyManagement() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
  const [results, setResults] = useState<SurveyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchSurveys = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const response = await axios.get(`/api/surveys/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSurveys(response.data);
    } catch (error: any) {
      toast.error('Failed to load surveys');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [sessionId]);

  const handleSurveyCreated = (surveyId: string) => {
    toast.success('Survey created successfully!');
    setShowBuilder(false);
    fetchSurveys();
  };

  const handleViewResults = async (surveyId: string) => {
    try {
      const response = await axios.get(`/api/surveys/results/${surveyId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedSurvey(response.data);
      setResults(response.data);
    } catch (error: any) {
      toast.error('Failed to load results');
      console.error(error);
    }
  };

  const handlePublish = async (surveyId: string) => {
    try {
      await axios.post(
        '/api/surveys/publish',
        { survey_id: surveyId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Survey published!');
      fetchSurveys();
    } catch (error: any) {
      toast.error('Failed to publish survey');
      console.error(error);
    }
  };

  const handleClose = async (surveyId: string) => {
    try {
      await axios.post(
        '/api/surveys/close',
        { survey_id: surveyId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Survey closed');
      fetchSurveys();
    } catch (error: any) {
      toast.error('Failed to close survey');
      console.error(error);
    }
  };

  const handleSendReminder = async (surveyId: string) => {
    try {
      setSending(true);
      await axios.post(
        '/api/email/send-survey-reminder',
        { survey_id: surveyId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Survey reminders sent!');
    } catch (error: any) {
      toast.error('Failed to send reminders');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  if (loading && surveys.length === 0) {
    return <div className="text-center py-8">Loading surveys...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Session Surveys</h1>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showBuilder ? 'Cancel' : '+ New Survey'}
        </button>
      </div>

      {showBuilder && (
        <div className="mb-8">
          <SurveyBuilder 
            sessionId={sessionId!}
            onSurveyCreated={handleSurveyCreated}
          />
        </div>
      )}

      {/* Survey List */}
      <div className="grid grid-cols-1 gap-6">
        {surveys.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No surveys yet</p>
            <button
              onClick={() => setShowBuilder(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Survey
            </button>
          </div>
        ) : (
          surveys.map((survey) => (
            <div key={survey.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{survey.title}</h3>
                  {survey.description && (
                    <p className="text-gray-600 mt-1">{survey.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    survey.status === 'active' ? 'bg-green-100 text-green-800' :
                    survey.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Questions</p>
                  <p className="font-semibold text-gray-900">{survey.questions?.length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Responses</p>
                  <p className="font-semibold text-gray-900">{survey.response_count || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-semibold text-gray-900">
                    {survey.is_anonymous ? 'Anonymous' : 'Identified'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                {survey.status === 'draft' && (
                  <>
                    <button
                      onClick={() => handlePublish(survey.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Publish
                    </button>
                  </>
                )}

                {survey.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleSendReminder(survey.id)}
                      disabled={sending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:bg-gray-400"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                      Send Reminder
                    </button>
                    <button
                      onClick={() => handleClose(survey.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                    >
                      Close Survey
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleViewResults(survey.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center gap-2"
                >
                  <ChartBarIcon className="w-4 h-4" />
                  View Results
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results Modal */}
      {results && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Survey Results</h2>
              <button
                onClick={() => setResults(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-3xl font-bold text-gray-900">{results.total_responses}</p>
            </div>

            <div className="space-y-6">
              {results.questions.map((question, idx) => (
                <div key={question.question_id} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {idx + 1}. {question.question_text}
                  </h4>

                  {question.question_type === 'rating' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Average: {question.average_rating}/5</span>
                      </div>
                      <div className="flex gap-2 items-end">
                        {Object.entries(question.rating_distribution).map(([rating, count]) => (
                          <div key={rating} className="flex flex-col items-center gap-1">
                            <div 
                              className="w-8 bg-blue-500 rounded"
                              style={{ 
                                height: `${Math.max(20, (count as number / results.total_responses) * 200)}px` 
                              }}
                            />
                            <span className="text-xs text-gray-600">{rating}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(question.question_type === 'multiple_choice' || question.question_type === 'checkbox') && (
                    <div className="space-y-2">
                      {question.responses.map((resp: any) => (
                        <div key={resp.option_id} className="flex items-center justify-between">
                          <span className="text-gray-700">{resp.option_text}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(resp.count / results.total_responses) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">{resp.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type === 'text' && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {question.responses.map((resp: string, i: number) => (
                        <p key={i} className="text-gray-700 p-2 bg-gray-50 rounded text-sm">
                          "{resp}"
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
