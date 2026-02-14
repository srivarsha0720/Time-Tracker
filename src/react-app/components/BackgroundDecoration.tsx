export default function BackgroundDecoration() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating Clock Icons */}
      <div className="absolute top-20 left-10 opacity-10">
        <svg className="w-32 h-32 text-blue-600 float-animation" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
        </svg>
      </div>

      <div className="absolute top-40 right-20 opacity-10" style={{ animationDelay: '2s' }}>
        <svg className="w-24 h-24 text-purple-600 float-animation" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
        </svg>
      </div>

      <div className="absolute bottom-32 left-1/4 opacity-10" style={{ animationDelay: '4s' }}>
        <svg className="w-28 h-28 text-indigo-600 float-animation" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
        </svg>
      </div>

      {/* Colorful Particles */}
      <div 
        className="particle bg-gradient-to-br from-blue-400 to-blue-600 w-16 h-16 top-1/4 left-1/3"
        style={{ animation: 'particle-float-1 20s ease-in-out infinite' }}
      />
      <div 
        className="particle bg-gradient-to-br from-purple-400 to-purple-600 w-12 h-12 top-1/3 right-1/4"
        style={{ animation: 'particle-float-2 25s ease-in-out infinite' }}
      />
      <div 
        className="particle bg-gradient-to-br from-pink-400 to-pink-600 w-20 h-20 bottom-1/4 right-1/3"
        style={{ animation: 'particle-float-3 18s ease-in-out infinite' }}
      />
      <div 
        className="particle bg-gradient-to-br from-indigo-400 to-indigo-600 w-14 h-14 bottom-1/3 left-1/4"
        style={{ animation: 'particle-float-1 22s ease-in-out infinite 3s' }}
      />
      <div 
        className="particle bg-gradient-to-br from-cyan-400 to-cyan-600 w-10 h-10 top-1/2 left-1/2"
        style={{ animation: 'particle-float-2 19s ease-in-out infinite 5s' }}
      />

      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl" />
    </div>
  );
}
