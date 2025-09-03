import { useState } from 'react';
import { useRouter } from 'next/router';
import { FaUserMd } from "react-icons/fa";

const DentistAuth = () => {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // MVP hardcoded password - you can change this
  const DENTIST_PASSWORD = 'dentist123';

  const handleDentistLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === DENTIST_PASSWORD) {
      // Set a simple session cookie for dentist
      document.cookie = 'dentist-session=authenticated; path=/; max-age=86400'; // 24 hours
      router.push('/clinic/dashboard');
    } else {
      setError('Invalid password. Please try again.');
      setIsLoading(false);
    }
  };

  const handleContinueAsDentist = () => {
    setShowPasswordPrompt(true);
    setError('');
    setPassword('');
  };

  const handleCancel = () => {
    setShowPasswordPrompt(false);
    setPassword('');
    setError('');
  };

  if (showPasswordPrompt) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Dentist Access</h2>
            <p className="text-gray-600 mt-2">Enter the clinic password to continue</p>
          </div>

          <form onSubmit={handleDentistLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter dentist password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#4fa1f2] text-white px-4 py-3 rounded-lg hover:bg-[#3a8bd9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </div>
                ) : (
                  'Access Clinic'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="text-center">
        <button
            onClick={handleContinueAsDentist}
            className="w-full flex items-center justify-center text-sm gap-3 bg-[#4fa1f2] text-white px-4 py-3 rounded-full border-2 border-[#4fa1f2] hover:bg-white hover:text-[#4fa1f2] transition-colors font-medium"
        >
            <FaUserMd />
            I'm a Dentist
        </button>
      </div>
    </div>
  );
};

export default DentistAuth;