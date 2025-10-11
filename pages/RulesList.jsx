import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import axios from 'axios';

function RulesList() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/rules');
      setRules(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch rules. Please try again.');
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`http://localhost:3001/api/rules/${id}`, {
        enabled: !currentStatus
      });
      // Update local state
      setRules(rules.map(rule => 
        rule._id === id ? { ...rule, enabled: !currentStatus } : rule
      ));
    } catch (err) {
      setError('Failed to update rule status. Please try again.');
      console.error('Error updating rule:', err);
    }
  };

  const deleteRule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:3001/api/rules/${id}`);
      // Update local state
      setRules(rules.filter(rule => rule._id !== id));
    } catch (err) {
      setError('Failed to delete rule. Please try again.');
      console.error('Error deleting rule:', err);
    }
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'block':
        return 'badge badge-error';
      case 'redirect':
        return 'badge badge-warning';
      case 'allow':
        return 'badge badge-success';
      default:
        return 'badge';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">DNS Rules</h1>
        <Link to="/rules/new" className="btn btn-primary">
          <FaPlus className="mr-2" /> Add New Rule
        </Link>
      </div>
      
      {error && (
        <div className="alert alert-error mb-4">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Domain</th>
              <th>Action</th>
              <th>Time Restrictions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.length > 0 ? (
              rules.map(rule => (
                <tr key={rule._id}>
                  <td>{rule.name}</td>
                  <td>{rule.domain}</td>
                  <td>
                    <span className={getActionBadgeClass(rule.action)}>
                      {rule.action}
                      {rule.action === 'redirect' && rule.redirectTarget && (
                        <span className="ml-1">→ {rule.redirectTarget}</span>
                      )}
                    </span>
                  </td>
                  <td>
                    {rule.timeRestrictions && rule.timeRestrictions.length > 0 ? (
                      <span className="badge badge-info">
                        {rule.timeRestrictions.length} schedule(s)
                      </span>
                    ) : (
                      <span className="text-gray-500">Always active</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleRuleStatus(rule._id, rule.enabled)}
                    >
                      {rule.enabled ? (
                        <><FaToggleOn className="text-success mr-1" /> Active</>
                      ) : (
                        <><FaToggleOff className="text-gray-500 mr-1" /> Inactive</>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <Link to={`/rules/edit/${rule._id}`} className="btn btn-sm btn-outline">
                        <FaEdit />
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline btn-error"
                        onClick={() => deleteRule(rule._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No rules found. Click "Add New Rule" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RulesList;