import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';

function RuleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    action: 'block',
    redirectTarget: '',
    enabled: true,
    priority: 0,
    timeRestrictions: []
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchRule();
    }
  }, [id]);

  const fetchRule = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/rules/${id}`);
      setFormData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch rule details. Please try again.');
      console.error('Error fetching rule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTimeRestrictionChange = (index, field, value) => {
    const updatedRestrictions = [...formData.timeRestrictions];
    updatedRestrictions[index] = {
      ...updatedRestrictions[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      timeRestrictions: updatedRestrictions
    }));
  };

  const handleDayToggle = (index, day) => {
    const updatedRestrictions = [...formData.timeRestrictions];
    const currentDays = updatedRestrictions[index].days || [];
    
    if (currentDays.includes(day)) {
      updatedRestrictions[index].days = currentDays.filter(d => d !== day);
    } else {
      updatedRestrictions[index].days = [...currentDays, day].sort();
    }
    
    setFormData(prev => ({
      ...prev,
      timeRestrictions: updatedRestrictions
    }));
  };

  const addTimeRestriction = () => {
    setFormData(prev => ({
      ...prev,
      timeRestrictions: [
        ...prev.timeRestrictions,
        {
          days: [1, 2, 3, 4, 5], // Monday to Friday by default
          startTime: 540, // 9:00 AM (9 * 60)
          endTime: 1020 // 5:00 PM (17 * 60)
        }
      ]
    }));
  };

  const removeTimeRestriction = (index) => {
    setFormData(prev => ({
      ...prev,
      timeRestrictions: prev.timeRestrictions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        await axios.patch(`http://localhost:3001/api/rules/${id}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/rules', formData);
      }
      
      navigate('/rules');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} rule. Please check your inputs and try again.`);
      console.error('Error saving rule:', err);
      setLoading(false);
    }
  };

  const minutesToTimeString = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const timeStringToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading && isEditMode) {
    return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Rule' : 'Create New Rule'}
      </h1>
      
      {error && (
        <div className="alert alert-error mb-4">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-base-200 p-6 rounded-box shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Rule Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="e.g., Block Social Media"
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Domain</span>
            </label>
            <input
              type="text"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="e.g., example.com or *.example.com"
              required
            />
            <label className="label">
              <span className="label-text-alt">Use * as wildcard for subdomains</span>
            </label>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Action</span>
            </label>
            <select
              name="action"
              value={formData.action}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="block">Block</option>
              <option value="redirect">Redirect</option>
              <option value="allow">Allow</option>
            </select>
          </div>
          
          {formData.action === 'redirect' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Redirect Target</span>
              </label>
              <input
                type="text"
                name="redirectTarget"
                value={formData.redirectTarget}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="e.g., safe.example.com"
                required
              />
            </div>
          )}
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Priority</span>
            </label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input input-bordered"
              min="0"
              max="100"
            />
            <label className="label">
              <span className="label-text-alt">Higher values are processed first</span>
            </label>
          </div>
          
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Enabled</span>
              <input
                type="checkbox"
                name="enabled"
                checked={formData.enabled}
                onChange={handleChange}
                className="toggle toggle-primary"
              />
            </label>
          </div>
        </div>
        
        <div className="divider">Time Restrictions</div>
        
        <div className="mb-4">
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={addTimeRestriction}
          >
            <FaPlus className="mr-2" /> Add Time Restriction
          </button>
        </div>
        
        {formData.timeRestrictions.map((restriction, index) => (
          <div key={index} className="bg-base-300 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Schedule #{index + 1}</h3>
              <button 
                type="button" 
                className="btn btn-sm btn-error btn-outline"
                onClick={() => removeTimeRestriction(index)}
              >
                <FaTrash />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="label">
                <span className="label-text">Days</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((day, dayIndex) => (
                  <button
                    key={dayIndex}
                    type="button"
                    className={`btn btn-sm ${restriction.days?.includes(dayIndex) ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleDayToggle(index, dayIndex)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Start Time</span>
                </label>
                <input
                  type="time"
                  value={minutesToTimeString(restriction.startTime)}
                  onChange={(e) => handleTimeRestrictionChange(
                    index, 
                    'startTime', 
                    timeStringToMinutes(e.target.value)
                  )}
                  className="input input-bordered"
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">End Time</span>
                </label>
                <input
                  type="time"
                  value={minutesToTimeString(restriction.endTime)}
                  onChange={(e) => handleTimeRestrictionChange(
                    index, 
                    'endTime', 
                    timeStringToMinutes(e.target.value)
                  )}
                  className="input input-bordered"
                  required
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-6 flex justify-end space-x-4">
          <button 
            type="button" 
            className="btn btn-ghost"
            onClick={() => navigate('/rules')}
            disabled={loading}
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                <FaSave className="mr-2" /> Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RuleForm;