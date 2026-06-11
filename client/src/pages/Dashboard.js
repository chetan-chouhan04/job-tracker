import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  Applied: 'bg-blue-100 text-blue-700',
  Interview: 'bg-yellow-100 text-yellow-700',
  Offer: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    company: '', role: '', status: 'Applied', jobUrl: '', notes: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
  try {
    const res = await axios.get('/jobs');
    setJobs(res.data);
  } catch (err) {
    console.log('Error fetching jobs:', err.message);
  }
};

const handleAdd = async (e) => {
  e.preventDefault();
  try {
    await axios.post('/jobs', form);
    setForm({ company: '', role: '', status: 'Applied', jobUrl: '', notes: '' });
    setShowForm(false);
    fetchJobs();
  } catch (err) {
    alert('Error adding job: ' + (err.response?.data?.message || err.message));
  }
};

  const handleDelete = async (id) => {
    await axios.delete(`/jobs/${id}`);
    fetchJobs();
  };

  const handleStatusChange = async (id, status) => {
    await axios.put(`/jobs/${id}`, { status });
    fetchJobs();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Job Tracker</h1>
        <div className="flex items-center gap-4">
          <span>Hi, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-indigo-600 px-4 py-1 rounded-lg font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {['Applied', 'Interview', 'Offer', 'Rejected'].map((s) => (
            <div key={s} className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {jobs.filter((j) => j.status === s).length}
              </p>
              <p className="text-sm text-gray-500">{s}</p>
            </div>
          ))}
        </div>

        {/* Add Job Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold"
        >
          {showForm ? 'Cancel' : '+ Add Job'}
        </button>

        {/* Add Job Form */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow mb-6 space-y-3">
            <input
              placeholder="Company Name"
              className="w-full border p-3 rounded-lg"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
            />
            <input
              placeholder="Role / Position"
              className="w-full border p-3 rounded-lg"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            />
            <select
              className="w-full border p-3 rounded-lg"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
            <input
              placeholder="Job URL (optional)"
              className="w-full border p-3 rounded-lg"
              value={form.jobUrl}
              onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
            />
            <textarea
              placeholder="Notes (optional)"
              className="w-full border p-3 rounded-lg"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Save Job
            </button>
          </form>
        )}

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length === 0 && (
            <p className="text-center text-gray-400 mt-10">
              No jobs added yet. Click "+ Add Job" to start!
            </p>
          )}
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-xl shadow p-5 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{job.company}</h3>
                <p className="text-gray-600">{job.role}</p>
                {job.jobUrl && (
                  <a href={job.jobUrl} target="_blank" rel="noreferrer"
                    className="text-indigo-500 text-sm hover:underline">
                    View Job
                  </a>
                )}
                {job.notes && <p className="text-gray-400 text-sm mt-1">{job.notes}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <select
                  className={`text-sm px-3 py-1 rounded-full font-semibold ${STATUS_COLORS[job.status]}`}
                  value={job.status}
                  onChange={(e) => handleStatusChange(job._id, e.target.value)}
                >
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}