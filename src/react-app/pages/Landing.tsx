import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Clock, TrendingUp, Calendar, BarChart3, Zap, Target } from "lucide-react";
import BackgroundDecoration from "@/react-app/components/BackgroundDecoration";

export default function LandingPage() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && user) {
      navigate("/tracker");
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient-bg-light relative overflow-hidden">
      <BackgroundDecoration />
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 glass-effect-strong text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-8 shadow-lg">
            <Clock className="w-4 h-4 text-blue-600" />
            Track Every Moment
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Master Your Time,
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
              Achieve Your Goals
            </span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            A powerful yet simple time tracking application that helps you understand how you spend your day and make better decisions about your time.
          </p>
          
          <button
            onClick={redirectToLogin}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 border-2 border-blue-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Get Started with Google
          </button>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Daily Time Tracking"
            description="Log activities with precision. Track exactly how you spend each minute of your day with an intuitive interface."
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Visual Analytics"
            description="Beautiful charts and insights show your time distribution across categories, helping you identify patterns."
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Smart Limits"
            description="Automatic validation ensures you never exceed 24 hours per day, with real-time feedback on available time."
            gradient="from-indigo-500 to-purple-500"
          />
        </div>

        {/* Additional Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Real-time Updates"
            description="See your progress update instantly as you log activities throughout your day."
            gradient="from-yellow-500 to-orange-500"
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Category Insights"
            description="Understand where your time goes with detailed breakdowns by activity category."
            gradient="from-green-500 to-teal-500"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-24 relative z-10">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 text-sm font-medium">
          Built with Mocha • Track your time, improve your life
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <div className="glass-effect-strong rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/30 group card-hover-effect backdrop-blur-xl">
      <div className={`mb-4 group-hover:scale-110 transition-transform duration-300 inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-700 leading-relaxed font-medium">{description}</p>
    </div>
  );
}
