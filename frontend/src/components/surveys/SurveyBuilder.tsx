import React, { useState } from 'react';
import axios from 'axios';

interface QuestionData {
  question_text: string;
  question_type: 'text' | 'rating' | 'multiple_choice' | 'checkbox' | 'likert';
  is_required: boolean;
  rating_scale?: number;
  options?: string[];
}

interface SurveyBuilderProps {
  sessionId: string;
  onSurveyCreated?: (surveyId: string) => void;
}

const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ sessionId, onSurveyCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'text',
        is_required: true,
        options: [],
      },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    if (!newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options = [];
    }
    newQuestions[questionIndex].options?.push('');
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options![optionIndex] = value;
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Survey title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create survey
      const surveyRes = await axios.post('/api/surveys', {
        title,
        description,
        session_id: sessionId,
        is_anonymous: isAnonymous,
        allow_multiple_responses: allowMultiple,
      });

      const surveyId = surveyRes.data.id;

      // Add questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionRes = await axios.post('/api/surveys/questions', {
          survey_id: surveyId,
          question_text: q.question_text,
          question_type: q.question_type,
          order_id: i,
          is_required: q.is_required,
          rating_scale: q.rating_scale || 5,
        });

        // Add options if applicable
        if ((q.question_type === 'multiple_choice' || q.question_type === 'checkbox') && q.options) {
          for (let j = 0; j < q.options.length; j++) {
            if (q.options[j]) {
              await axios.post('/api/surveys/questions/options', {
                question_id: questionRes.data.id,
                option_text: q.options[j],
                order_id: j,
              });
            }
          }
        }
      }

      setSuccess(true);
      setTitle('');
      setDescription('');
      setQuestions([]);

      if (onSurveyCreated) {
        onSurveyCreated(surveyId);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to create survey');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Survey</h2>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          Survey created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Survey Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Anonymous responses</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Allow multiple responses per user</span>
            </label>
          </div>
        </div>

        {/* Questions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Question text"
                    value={question.question_text}
                    onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />

                  <div className="flex gap-2">
                    <select
                      value={question.question_type}
                      onChange={(e) => updateQuestion(index, 'question_type', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text">Text</option>
                      <option value="rating">Rating Scale</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="checkbox">Checkboxes</option>
                      <option value="likert">Likert Scale</option>
                    </select>

                    {question.question_type === 'rating' && (
                      <input
                        type="number"
                        min="2"
                        max="10"
                        value={question.rating_scale || 5}
                        onChange={(e) => updateQuestion(index, 'rating_scale', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={question.is_required}
                      onChange={(e) => updateQuestion(index, 'is_required', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Required</span>
                  </label>

                  {/* Options for multiple choice */}
                  {(question.question_type === 'multiple_choice' || question.question_type === 'checkbox') && (
                    <div className="pl-4 border-l-2 border-gray-300">
                      <p className="text-sm font-medium text-gray-600 mb-2">Options:</p>
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <input
                            key={optIndex}
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(index)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
          >
            + Add Question
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || questions.length === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Survey'}
        </button>
      </form>
    </div>
  );
};

export default SurveyBuilder;
