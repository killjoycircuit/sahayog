import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Heart, 
  Award, 
  Globe, 
  Shield, 
  Lightbulb,
  ChevronRight,
  Star,
  Quote,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    successfulCampaigns: 0,
    totalRaised: 0,
    activeBackers: 0,
    countries: 0
  });

  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState({});

  // Animate stats on component mount
  useEffect(() => {
    const animateStats = () => {
      const targets = { 
        totalProjects: 25847, 
        successfulCampaigns: 18295, 
        totalRaised: 12400000, 
        activeBackers: 156780,
        countries: 95
      };
      const duration = 3000;
      const steps = 60;
      const stepTime = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setStats({
          totalProjects: Math.floor(targets.totalProjects * easeOut),
          successfulCampaigns: Math.floor(targets.successfulCampaigns * easeOut),
          totalRaised: Math.floor(targets.totalRaised * easeOut),
          activeBackers: Math.floor(targets.activeBackers * easeOut),
          countries: Math.floor(targets.countries * easeOut)
        });
        
        if (currentStep >= steps) clearInterval(timer);
      }, stepTime);
    };

    animateStats();

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', campaigns: 1200, amount: 850000 },
    { month: 'Feb', campaigns: 1350, amount: 920000 },
    { month: 'Mar', campaigns: 1580, amount: 1200000 },
    { month: 'Apr', campaigns: 1720, amount: 1450000 },
    { month: 'May', campaigns: 1950, amount: 1680000 },
    { month: 'Jun', campaigns: 2100, amount: 1850000 }
  ];

  const categoryData = [
    { name: 'Technology', value: 32, color: '#008080' },
    { name: 'Creative Arts', value: 24, color: '#20B2AA' },
    { name: 'Games', value: 18, color: '#48CCCD' },
    { name: 'Design', value: 15, color: '#40E0D0' },
    { name: 'Publishing', value: 11, color: '#AFEEEE' }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Tech Entrepreneur",
      avatar: "https://tse2.mm.bing.net/th/id/OIP.SLbSasSkHYAtD3QNTzob3wHaF7?w=1200&h=960&rs=1&pid=ImgDetMain&o=7&rm=3?w=180&h=170&fit=crop&crop=face",
      content: "Sahayog helped me raise $150,000 for my sustainable tech startup. The platform's community support was incredible, and the tools made campaign management seamless.",
      rating: 5,
      project: "EcoTech Solutions"
    },
    {
      name: "Marcus Rodriguez",
      role: "Game Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "From concept to launch, Sahayog was there every step of the way. We exceeded our $50,000 goal by 300% and built an amazing community of supporters.",
      rating: 5,
      project: "Pixel Adventures"
    },
    {
      name: "Emily Johnson",
      role: "Artist & Designer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "The creative freedom and support I received through Sahayog allowed me to turn my art into a sustainable business. Best decision I ever made!",
      rating: 5,
      project: "Handcrafted Dreams"
    }
  ];

  const milestones = [
    { year: '2019', title: 'Platform Launch', description: 'Sahayog was founded with a mission to democratize funding for innovative projects.' },
    { year: '2020', title: 'First Million Raised', description: 'Reached our first major milestone with $1M in total funding for creators.' },
    { year: '2021', title: 'Global Expansion', description: 'Expanded to serve creators and backers in over 50 countries worldwide.' },
    { year: '2022', title: '10,000 Projects', description: 'Celebrated 10,000 successfully funded projects across all categories.' },
    { year: '2023', title: 'AI-Powered Tools', description: 'Launched intelligent campaign optimization tools to help creators succeed.' },
    { year: '2024', title: 'Community of 150K+', description: 'Built a thriving community of over 150,000 active creators and backers.' }
  ];

  const values = [
    {
      icon: Heart,
      title: "Community First",
      description: "We believe in the power of community to transform ideas into reality through collective support and shared passion."
    },
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "Every transaction is secure, every campaign is verified, and every backer is protected with our comprehensive guarantee."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge tools and features to help creators succeed in the digital age."
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Connecting creators and backers worldwide to fund projects that make a positive difference in communities everywhere."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#008080] to-[#006666] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Empowering Dreams
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                One Project at a Time
              </span>
            </h1>
            <p className="text-xl text-teal-100 mb-8 leading-relaxed max-w-3xl mx-auto">
              Since 2019, Sahayog has been the trusted platform where innovation meets community support. 
              We've helped thousands of creators turn their boldest ideas into successful ventures through 
              the power of crowdfunding.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact in Numbers</h2>
            <p className="text-xl text-gray-600">Real results from real creators worldwide</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
            {[
              { label: 'Total Projects', value: stats.totalProjects, icon: Target, suffix: '+' },
              { label: 'Successfully Funded', value: stats.successfulCampaigns, icon: Award, suffix: '+' },
              { label: 'Amount Raised', value: formatCurrency(stats.totalRaised), icon: TrendingUp, suffix: '' },
              { label: 'Active Backers', value: formatNumber(stats.activeBackers), icon: Users, suffix: '+' },
              { label: 'Countries', value: stats.countries, icon: Globe, suffix: '+' }
            ].map((stat, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="bg-gradient-to-br from-[#008080] to-[#20B2AA] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Growth & Analytics</h2>
            <p className="text-xl text-gray-600">Tracking our journey of consistent growth and success</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Monthly Growth Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <BarChart3 className="h-6 w-6 text-[#008080] mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Monthly Campaign Growth</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'campaigns' ? value : formatCurrency(value),
                    name === 'campaigns' ? 'Campaigns' : 'Amount Raised'
                  ]} />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stackId="1" 
                    stroke="#008080" 
                    fill="url(#colorGradient)" 
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008080" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#008080" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <PieChart className="h-6 w-6 text-[#008080] mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Projects by Category</h3>
              </div>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-gray-700">{category.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{category.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div data-animate id="mission" className={`transform transition-all duration-1000 ${isVisible.mission ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At Sahayog, we believe that great ideas deserve great support. Our mission is to democratize 
                access to funding, empowering creators from all walks of life to bring their innovative 
                projects to reality.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We've built more than just a crowdfunding platform – we've created a thriving ecosystem 
                where creativity meets community, where dreams are transformed into tangible achievements, 
                and where supporters become stakeholders in the future of innovation.
              </p>
              <div className="space-y-4">
                {[
                  "Democratize access to funding for all creators",
                  "Foster global communities around innovative projects", 
                  "Provide transparent and secure funding solutions",
                  "Empower the next generation of entrepreneurs"
                ].map((point, index) => (
                  <div key={index} className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-[#008080] mr-3" />
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div data-animate id="mission-image" className={`transform transition-all duration-1000 delay-300 ${isVisible['mission-image'] ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" 
                  alt="Team collaboration" 
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#008080]/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <p className="font-semibold mb-1">Global Community</p>
                    <p className="text-sm">Connecting creators worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                data-animate 
                id={`value-${index}`}
                className={`bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform ${isVisible[`value-${index}`] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-gradient-to-br from-[#008080] to-[#20B2AA] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Milestones that shaped our story</p>
          </div>
          
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#008080]"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  data-animate
                  id={`milestone-${index}`} 
                  className={`relative flex items-center transform transition-all duration-700 ${isVisible[`milestone-${index}`] ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
                  style={{ transitionDelay: `${index * 300}ms` }}
                >
                  <div className="absolute left-6 w-4 h-4 bg-[#008080] rounded-full border-4 border-white shadow-lg"></div>
                  <div className="ml-20 bg-white rounded-2xl shadow-lg p-8 w-full hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                      <span className="bg-[#008080] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {milestone.year}
                      </span>
                    </div>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Hear from creators who made it happen</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                data-animate
                id={`testimonial-${index}`}
                className={`bg-white rounded-2xl shadow-xl p-8 relative transform transition-all duration-700 ${isVisible[`testimonial-${index}`] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <Quote className="h-8 w-8 text-[#008080] mb-4" />
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-[#008080] font-medium">{testimonial.project}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#008080] to-[#006666] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
            Whether you're a creator with a groundbreaking idea or a supporter looking to back 
            the next big thing, Sahayog is your platform for making dreams come true.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
            onClick={() => navigate("/create-event")}
            className="bg-white text-[#008080] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Start Your Campaign
            </button>
            <button 
            onClick={() => navigate("/events")}
            className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-[#008080] transition-all flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Explore Projects
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;