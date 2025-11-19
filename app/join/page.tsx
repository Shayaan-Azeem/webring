'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundDecorations from '@/components/BackgroundDecorations';

interface Member {
  id: number;
  name: string;
  website: string;
  year: number;
}

export default function JoinPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    year: new Date().getFullYear(),
  });
  const [widgetConfig, setWidgetConfig] = useState({
    leftConnection: '',
    rightConnection: '',
    iconColor: 'white' as 'white' | 'black' | 'red',
    customIcon: '',
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showWidget, setShowWidget] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'customize'>('form');

  useEffect(() => {
    // Fetch existing members for connection selection
    fetch('/api/members')
      .then(res => res.json())
      .then(data => setMembers(data.members || []))
      .catch(err => console.error('Failed to fetch members:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/members/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member');
      }

      setStatus('success');
      setCurrentStep('customize');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const generateWidgetCode = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app';
    const iconPath = widgetConfig.customIcon || `/icon.${widgetConfig.iconColor}.svg`;
    
    const leftSite = widgetConfig.leftConnection || 'auto';
    const rightSite = widgetConfig.rightConnection || 'auto';
    
    return `<script src="${baseUrl}/widget.js"></script>
<div id="webring-widget" 
     data-site="${formData.website}"
     data-left="${leftSite}"
     data-right="${rightSite}"
     data-icon="${baseUrl}${iconPath}"></div>`;
  };

  const widgetCode = generateWidgetCode();

  return (
    <main className="bg-black text-white px-4 py-8 sm:p-8 min-h-screen w-full overflow-x-hidden relative">
      <BackgroundDecorations />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-8">
          <a href="/" className="text-gray-400 hover:text-white inline-flex items-center gap-2 transition">
            ← Back to Webring
          </a>
        </div>

        <h1 className="text-4xl font-bold mb-4">Join the Webring</h1>
        <p className="text-gray-400 mb-8">
          Add your personal website to the ring and connect with fellow students and alumni.
        </p>

        {status === 'success' && currentStep === 'customize' && !showWidget ? (
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-600/50 rounded p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-2">✅ Account Created!</h2>
              <p className="text-gray-400">
                Now let&apos;s customize your widget.
              </p>
            </div>

            <div className="border border-gray-700 rounded p-6">
              <h3 className="text-xl font-bold mb-4">Choose Your Connections</h3>
              <p className="text-gray-400 mb-4">
                Select which sites the left and right arrows will link to:
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="left" className="block text-sm font-medium mb-2 text-gray-300">
                    Left Arrow (←) connects to:
                  </label>
                  <select
                    id="left"
                    value={widgetConfig.leftConnection}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, leftConnection: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded focus:border-white focus:outline-none text-white transition"
                  >
                    <option value="">Auto (previous in list)</option>
                    {members.filter(m => m.website !== formData.website).map((member) => (
                      <option key={member.id} value={member.website}>
                        {member.name} ({member.website})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="right" className="block text-sm font-medium mb-2 text-gray-300">
                    Right Arrow (→) connects to:
                  </label>
                  <select
                    id="right"
                    value={widgetConfig.rightConnection}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, rightConnection: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded focus:border-white focus:outline-none text-white transition"
                  >
                    <option value="">Auto (next in list)</option>
                    {members.filter(m => m.website !== formData.website).map((member) => (
                      <option key={member.id} value={member.website}>
                        {member.name} ({member.website})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                💡 Tip: Leave as &quot;Auto&quot; to use sequential ring order, or pick specific friends to create your own web of connections!
              </p>
            </div>

            <div className="border border-gray-700 rounded p-6">
              <h3 className="text-xl font-bold mb-4">Choose Your Icon</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setWidgetConfig({ ...widgetConfig, iconColor: 'white', customIcon: '' })}
                  className={`p-6 border-2 rounded transition ${
                    widgetConfig.iconColor === 'white' && !widgetConfig.customIcon 
                      ? 'bg-white border-white' 
                      : 'bg-black border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <img src="/icon.white.svg" alt="White icon" className="w-12 h-12 mx-auto mb-2" />
                  <p className={`text-sm text-center ${
                    widgetConfig.iconColor === 'white' && !widgetConfig.customIcon ? 'text-black font-medium' : 'text-gray-400'
                  }`}>
                    White
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setWidgetConfig({ ...widgetConfig, iconColor: 'black', customIcon: '' })}
                  className={`p-6 border-2 rounded transition ${
                    widgetConfig.iconColor === 'black' && !widgetConfig.customIcon 
                      ? 'bg-white border-white' 
                      : 'bg-black border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <img src="/icon.black.svg" alt="Black icon" className="w-12 h-12 mx-auto mb-2" />
                  <p className={`text-sm text-center ${
                    widgetConfig.iconColor === 'black' && !widgetConfig.customIcon ? 'text-black font-medium' : 'text-gray-400'
                  }`}>
                    Black
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setWidgetConfig({ ...widgetConfig, iconColor: 'red', customIcon: '' })}
                  className={`p-6 border-2 rounded transition ${
                    widgetConfig.iconColor === 'red' && !widgetConfig.customIcon 
                      ? 'bg-white border-white' 
                      : 'bg-black border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <img src="/icon.red.svg" alt="Red icon" className="w-12 h-12 mx-auto mb-2" />
                  <p className={`text-sm text-center ${
                    widgetConfig.iconColor === 'red' && !widgetConfig.customIcon ? 'text-black font-medium' : 'text-gray-400'
                  }`}>
                    Red
                  </p>
                </button>
              </div>

              <div>
                <label htmlFor="custom" className="block text-sm font-medium mb-2 text-gray-300">
                  Or use a custom icon URL:
                </label>
                <input
                  type="url"
                  id="custom"
                  value={widgetConfig.customIcon}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, customIcon: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded focus:border-white focus:outline-none text-white transition"
                  placeholder="https://yoursite.com/custom-icon.svg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Optional: Link to your own icon (SVG recommended, 24x24px)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowWidget(true)}
              className="w-full bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 active:bg-gray-300 transition"
            >
              Generate Widget Code →
            </button>
          </div>
        ) : status === 'success' && showWidget ? (
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-600/50 rounded p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-2">🎉 Welcome to the Ring!</h2>
              <p className="text-gray-400">
                You&apos;ve been successfully added to the Webring.
              </p>
            </div>

            <div className="border border-gray-700 rounded p-6">
              <h3 className="text-xl font-bold mb-4">Next Step: Add the Widget</h3>
              <p className="text-gray-400 mb-4">
                Copy and paste this code into your website (usually in the footer):
              </p>
              
              <div className="bg-black border border-gray-700 rounded p-4 mb-4">
                <code className="text-sm text-green-400 whitespace-pre-wrap break-all">
                  {widgetCode}
                </code>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(widgetCode);
                  alert('Copied to clipboard!');
                }}
                className="bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200 active:bg-gray-300 transition"
              >
                Copy to Clipboard
              </button>
            </div>

            <div className="border border-gray-700 rounded p-6">
              <h3 className="text-xl font-bold mb-4">Widget Preview</h3>
              <p className="text-gray-400 mb-4">This is what the widget will look like:</p>
              
              <div className="bg-gray-900 border border-gray-700 rounded p-6 inline-flex items-center gap-3">
                <span className="text-gray-400 text-xl cursor-pointer hover:text-white transition">←</span>
                <img 
                  src="/icon.white.svg" 
                  alt="Webring" 
                  className="w-6 h-6 opacity-80 hover:opacity-100 transition"
                />
                <span className="text-gray-400 text-xl cursor-pointer hover:text-white transition">→</span>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Click the arrows to navigate between sites, or click the icon to view all members.
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-white underline transition"
              >
                View all webring members →
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded focus:border-white focus:outline-none text-white transition"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium mb-2 text-gray-300">
                Website URL *
              </label>
              <input
                type="url"
                id="website"
                required
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded focus:border-white focus:outline-none text-white transition"
                placeholder="https://yoursite.com"
              />
              <p className="text-sm text-gray-500 mt-2">
                Make sure your website is live and accessible
              </p>
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium mb-2 text-gray-300">
                Graduation Year *
              </label>
              <input
                type="number"
                id="year"
                required
                min="2000"
                max="2040"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded focus:border-white focus:outline-none text-white transition"
              />
              <p className="text-sm text-gray-500 mt-2">
                Your expected or actual graduation year
              </p>
            </div>

            {status === 'error' && (
              <div className="bg-red-900/20 border border-red-600/50 rounded p-4">
                <p className="text-red-400">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 active:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Adding you to the ring...' : 'Join the Webring'}
            </button>
          </form>
        )}

        <div className="mt-12 border border-gray-700 rounded p-6">
          <h3 className="text-lg font-bold mb-3">Requirements</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Must be a student or alumni at University of Waterloo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Must have a personal website (not social media profiles)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Must add the webring widget to your site after joining</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

