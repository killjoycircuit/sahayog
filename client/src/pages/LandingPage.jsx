import { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Users, 
  Target, 
  TrendingUp, 
  Shield, 
  Play,
  CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  const [stats, setStats] = useState({
    projects: 0,
    backers: 0,
    funded: 0
  });

  // Animate stats on component mount
  useEffect(() => {
    const animateStats = () => {
      const targets = { projects: 15420, backers: 89750, funded: 4200000 };
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setStats({
          projects: Math.floor(targets.projects * easeOut),
          backers: Math.floor(targets.backers * easeOut),
          funded: Math.floor(targets.funded * easeOut)
        });
        
        if (currentStep >= steps) clearInterval(timer);
      }, stepTime);
    };

    animateStats();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#008080] to-[#006666] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Fund the 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Future
                </span>
              </h1>
              <p className="text-xl text-teal-100 mb-8 leading-relaxed">
                Turn your innovative ideas into reality with the power of community funding. 
                Join thousands of creators and backers making dreams come true.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="bg-white text-[#008080] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center">
                  Start Your Campaign
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#008080] transition-all flex items-center justify-center">
                  <Play className="mr-2 h-5 w-5" />
                  Watch How It Works
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-teal-400">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{stats.projects.toLocaleString()}</div>
                  <div className="text-teal-200 text-sm">Projects Funded</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{stats.backers.toLocaleString()}</div>
                  <div className="text-teal-200 text-sm">Happy Backers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{formatNumber(stats.funded)}</div>
                  <div className="text-teal-200 text-sm">Total Raised</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1553484771-371a605b060b?w=500&h=300&fit=crop" 
                  alt="Innovation" 
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-900 font-semibold">Smart City Initiative</h3>
                  <span className="bg-[#008080] text-white px-2 py-1 rounded text-xs">Featured</span>
                </div>
                <div className="text-gray-600 text-sm mb-3">Making cities more sustainable and connected</div>
                <div className="flex items-center justify-between">
                  <div className="text-[#008080] font-bold">$125,400 raised</div>
                  <div className="text-gray-500 text-sm">89% funded</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-[#008080] h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to bring your ideas to life</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Create Your Campaign",
                description: "Share your project idea, set your funding goal, and create compelling rewards for your backers.",
                icon: Target,
                color: "bg-blue-500"
              },
              {
                step: "2",
                title: "Build Your Community",
                description: "Spread the word, engage with potential backers, and build momentum for your project.",
                icon: Users,
                color: "bg-purple-500"
              },
              {
                step: "3",
                title: "Bring It to Life",
                description: "Reach your goal, fulfill your promises, and turn your vision into reality with community support.",
                icon: TrendingUp,
                color: "bg-green-500"
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className={`${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <div className="bg-[#008080] text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-[#008080] to-[#006666] rounded-2xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Make Your Mark?</h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who have successfully funded their projects. 
              Your journey to turning ideas into reality starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-[#008080] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Start Your Campaign
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#008080] transition-all flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Learn More
              </button>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-8 text-teal-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Secure payments</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Global reach</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-xl font-bold">Sahayog</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering creators and innovators to bring their ideas to life through community funding.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Creators</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Start a Campaign</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Creator Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Creator Handbook</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Backers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Explore Projects</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Backer Protection</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 FundFlow. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;