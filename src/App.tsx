import React, { useState } from 'react';
import { Heart, Activity, Thermometer, Droplet, Ruler, Weight, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PredictionResult {
  prediction: string;
  probabilities: Record<string, number>;
  message: string;
}

function App() {
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    hr: '',
    spo2: '',
    temp: '',
    qt_interval: '',
    st_segment: ''
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('https://web-production-900a9.up.railway.app/predict', formData);
      setPrediction(response.data);

      if (window.innerWidth < 1024) {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (err) {
      setError('An error occurred during prediction. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      age: '',
      weight: '',
      height: '',
      hr: '',
      spo2: '',
      temp: '',
      qt_interval: '',
      st_segment: ''
    });
    setPrediction(null);
    setError(null);
  };

  const getChartData = () => {
    if (!prediction) return null;

    const labels = Object.keys(prediction.probabilities);
    const data = Object.values(prediction.probabilities);

    const backgroundColors = [
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(41, 151, 92, 0.7)',
      'rgba(250, 64, 64, 0.7)',
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 12
          }
        }
      }
    },
    maintainAspectRatio: false,
    responsive: true
  };

  const getDiagnosisColor = (diagnosis: string) => {
    switch (diagnosis) {
      case 'Good':
        return 'bg-green-100 text-green-700';
      case 'Heart Failure':
        return 'bg-red-100 text-red-700';
      case 'Arrhythmia':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getRecommendationMessage = (diagnosis: string) => {
    switch (diagnosis) {
      case 'Good':
        return {
          message: 'No issues found. Maintain a healthy lifestyle.',
          color: 'bg-green-100 text-green-700'
        };

      case 'Heart Failure':
        return {
          message: 'Urgent care needed. See a cardiologist now.',
          color: 'bg-red-100 text-red-700'
        };

      case 'Coronary Artery Disease':
        return {
          message: 'Consult a cardiologist. Follow a heart-healthy plan.',
          color: 'bg-orange-100 text-orange-700'
        };

      case 'Arrhythmia':
        return {
          message: 'See a cardiologist. Avoid caffeine and monitor symptoms.',
          color: 'bg-blue-100 text-blue-700'
        };

      default:
        return {
          message: 'Further evaluation needed. Consult a doctor.',
          color: 'bg-yellow-100 text-yellow-700'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-800 flex items-center justify-center">
            Cardiac Health Assessment
          </h1>
          <p className="text-gray-600 mt-1">Enter patient details to evaluate cardiac health</p>
        </header>

        <div className={`lg:flex lg:gap-4 ${prediction ? '' : 'justify-center'}`}>
          <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${prediction ? 'lg:w-3/5' : 'lg:w-4/5 xl:w-3/4'} transition-all duration-500 ease-in-out mx-auto lg:mx-0`}>
            <form onSubmit={handleSubmit} className="p-4 md:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
                <div className="form-group w-full">
                  <label className="flex items-center text-gray-700 font-medium mb-1">
                    <Clock size={18} className="mr-1 text-indigo-600" />
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Years"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="form-group w-full">
                  <label className="flex items-center text-gray-700 font-medium mb-1">
                    <Weight size={18} className="mr-1 text-indigo-600" />
                    Weight
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="kg"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="form-group w-full">
                  <label className="flex items-center text-gray-700 font-medium mb-1">
                    <Ruler size={18} className="mr-1 text-indigo-600" />
                    Height
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="cm"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="form-group w-full">
                  <label className="flex items-center text-gray-700 font-medium mb-1">
                    <Activity size={18} className="mr-1 text-indigo-600" />
                    Heart Rate
                  </label>
                  <input
                    type="number"
                    name="hr"
                    value={formData.hr}
                    onChange={handleChange}
                    placeholder="bpm"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="form-group w-full">
                  <label className="flex items-center text-gray-700 font-medium mb-1">
                    <Droplet size={18} className="mr-1 text-indigo-600" />
                    SpO₂ Level
                  </label>
                  <input
                    type="number"
                    name="spo2"
                    value={formData.spo2}
                    onChange={handleChange}
                    placeholder="%"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="form-group w-full">
                  <label className="flex items-center text-gray-700 font-medium mb-1">
                    <Thermometer size={18} className="mr-1 text-indigo-600" />
                    Temperature
                  </label>
                  <input
                    type="number"
                    name="temp"
                    value={formData.temp}
                    onChange={handleChange}
                    placeholder="°C"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="form-group w-full">
                  <label className="flex items-center text-gray-700 font-medium mb-1">
                    QT Interval (ECG)
                  </label>
                  <input
                    type="number"
                    name="qt_interval"
                    value={formData.qt_interval}
                    onChange={handleChange}
                    placeholder="ms"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="form-group w-full">
                  <label className="flex items-center text-gray-700 font-medium mb-1">
                    ST Elevation (ECG)
                  </label>
                  <input
                    type="number"
                    name="st_segment"
                    value={formData.st_segment}
                    onChange={handleChange}
                    placeholder="mm"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-4">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md shadow-md transition duration-300 ease-in-out flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Analyze Cardiac Health'}
                  <Heart className="ml-2" size={18} />
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md shadow-md transition duration-300 ease-in-out flex items-center justify-center"
                >
                  Reset
                  <RefreshCw className="ml-2" size={18} />
                </button>
              </div>
            </form>

            {error && (
              <div className="bg-red-100 p-4 text-red-700 text-center">
                {error}
              </div>
            )}
          </div>

          {prediction && (
            <div id="results-section" className="bg-white rounded-xl shadow-lg overflow-hidden mt-4 lg:mt-0 lg:w-2/5 transition-all duration-500 ease-in-out">
              <div className="p-4 md:p-4">
                <h2 className="text-lg font-semibold text-indigo-800 mb-2 text-center">Prediction Results</h2>

                <div className="mb-4">
                  <div className="mb-2">
                    <h3 className="text-md font-medium text-gray-800 mb-1 flex items-center">
                      <AlertCircle className="mr-2 text-indigo-600" size={18} />
                      Diagnosis
                    </h3>
                    <div className={`text-md font-bold p-2 rounded-md ${getDiagnosisColor(prediction.prediction)}`}>
                      {prediction.prediction}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-800 mb-1">Clinical Recommendation</h3>
                    <div className={`p-8 rounded-md ${getRecommendationMessage(prediction.prediction).color}`}>
                      {getRecommendationMessage(prediction.prediction).message}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-2 text-center">Probability Distribution</h3>
                  <div className="h-40">
                    {getChartData() && <Doughnut data={getChartData()!} options={chartOptions} />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;