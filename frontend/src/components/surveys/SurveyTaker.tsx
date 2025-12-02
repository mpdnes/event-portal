import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SurveyQuestion {
  id: string;
  question_text: string;
  question_type: 'text' | 'rating' | 'multiple_choice' | 'checkbox' | 'likert';
  is_required: boolean;
  rating_scale?: number;
  options?: { id: string; option_text: string }[];
}

interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

interface SurveyTakerProps {
  surveyId: string;
  onComplete?: () => void;
}

const SurveyTaker: React.FC<SurveyTakerProps> = ({ surveyId, onComplete }) => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/surveys/${surveyId}`);
        setSurvey(res.data);

        // Start survey response
        const responseRes = await axios.post('/api/surveys/start', {
          survey_id: surveyId,
        });
        setResponseId(responseRes.data.id);
      } catch (err) {
        setError('Failed to load survey');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseId) return;

    try {
      setSubmitting(true);

      // Submit all answers
      for (const [questionId, answer] of Object.entries(answers)) {
        const question = survey?.questions.find((q) => q.id === questionId);
        if (!question) continue;

        let payload: any = {
          response_id: responseId,
          question_id: questionId,
        };

        if (question.question_type === 'rating') {
          payload.rating_value = answer;
        } else if (question.question_type === 'multiple_choice' || question.question_type === 'checkbox') {
          payload.selected_option_id = answer;
        } else {
          payload.answer_text = answer;
        }

        await axios.post('/api/surveys/submit-answer', payload);
      }

      // Complete survey
      await axios.post('/api/surveys/complete', { response_id: responseId });

      setCompleted(true);
      if (onComplete) onComplete();
    } catch (err) {
      setError('Failed to submit survey');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading survey...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (completed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Thank you!</h3>
        <p className="text-green-700">Your feedback has been submitted successfully.</p>
      </div>
    );
  }

  if (!survey) {
    return <div className="text-gray-500">Survey not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{survey.title}</h2>
        {survey.description && <p className="text-gray-600 mt-2">{survey.description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {survey.questions.map((question, index) => (
          <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {index + 1}. {question.question_text}
              {question.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {question.question_type === 'text' && (
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                required={question.is_required}
              />
            )}

            {question.question_type === 'rating' && (
              <div className="flex gap-2">
                {Array.from({ length: question.rating_scale || 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAnswerChange(question.id, i + 1)}
                    className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                      answers[question.id] === i + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

            {(question.question_type === 'multiple_choice' || question.question_type === 'checkbox') && (
              <div className="space-y-2">
                {question.options?.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type={question.question_type === 'checkbox' ? 'checkbox' : 'radio'}
                      name={question.id}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">{option.option_text}</span>
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'likert' && (
              <div className="flex justify-between gap-2">
                {['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'].map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAnswerChange(question.id, i + 1)}
                    className={`px-3 py-2 text-xs rounded-md transition-colors ${
                      answers[question.id] === i + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Survey'}
        </button>
      </form>
    </div>
  );
};

export default SurveyTaker;
