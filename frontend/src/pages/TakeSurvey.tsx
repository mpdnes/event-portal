import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SurveyTaker = lazy(() => import('../../components/surveys/SurveyTaker'));

import { lazy } from 'react';

export default function TakeSurvey() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!surveyId) {
        setError('Survey ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/surveys/${surveyId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSurvey(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load survey');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  const handleComplete = () => {
    toast.success('Thank you for completing the survey!');
    // Optionally redirect after a delay
    setTimeout(() => {
      window.history.back();
    }, 2000);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <p className="text-gray-600">Survey not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <SurveyTaker 
        surveyId={surveyId!}
        onComplete={handleComplete}
      />
    </div>
  );
}
