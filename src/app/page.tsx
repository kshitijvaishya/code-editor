import Link from "next/link";
import { Code2, Play, Terminal, Github, Twitter, Linkedin } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center bg-purple-600 rounded">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <span className="font-mono text-xl font-bold tracking-tight text-white">CodeForge</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 font-medium hover:text-purple-400 transition-colors">Features</a>
              <a href="#languages" className="text-gray-300 font-medium hover:text-purple-400 transition-colors">Languages</a>
              <a href="#compare" className="text-gray-300 font-medium hover:text-purple-400 transition-colors">Compare</a>
              <a href="#faq" className="text-gray-300 font-medium hover:text-purple-400 transition-colors">FAQ</a>
            </nav>

            <div className="flex items-center gap-4">
              <button className="px-6 py-2 font-mono text-white border border-gray-700 hover:bg-gray-800 transition-colors">
                Sign In
              </button>
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-2 font-mono bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Start Coding →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-16 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-purple-500/50 bg-purple-500/10 mb-8 rounded-full backdrop-blur-sm">
              <Terminal className="h-4 w-4 text-purple-400" />
              <span className="font-mono text-sm text-purple-300 font-medium">▶ v2.0 Now Available</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6 tracking-tight">
              Code. Compile.
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Conquer.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              The brutally fast online code editor for C, C++, Python, Java, and JavaScript. 
              <span className="block mt-2 text-gray-400">No setup. No friction. Just code.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link 
                href="/dashboard"
                className="group inline-flex items-center justify-center px-8 py-4 font-mono text-lg bg-purple-600 text-white hover:bg-purple-700 transition-all rounded-lg shadow-lg shadow-purple-600/50 hover:shadow-purple-600/70 hover:scale-105"
              >
                <Play className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Start Coding Free
              </Link>
              <a 
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 font-mono text-lg border-2 border-gray-700 bg-transparent text-white hover:bg-gray-800/50 transition-all rounded-lg backdrop-blur-sm"
              >
                View Features
              </a>
            </div>

            {/* Code Preview */}
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25"></div>
              <div className="relative border border-gray-800 bg-gray-900/90 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                {/* Editor Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                    </div>
                    <span className="font-mono text-sm text-gray-400 ml-4">main.py</span>
                  </div>
                  <button className="px-4 py-1.5 text-sm font-mono bg-cyan-500 hover:bg-cyan-400 text-black rounded-md transition-colors font-semibold">
                    Run ▶
                  </button>
                </div>
                
                {/* Code Content */}
                <div className="p-8 font-mono text-left text-base overflow-x-auto bg-gradient-to-b from-gray-900 to-gray-950">
                  <pre className="text-gray-300 leading-relaxed">
                    <code>
                      <span className="text-purple-400">def</span> <span className="text-cyan-400">solve</span><span className="text-gray-500">(</span>problem<span className="text-gray-500">)</span><span className="text-gray-500">:</span>
                      <br />
                      {"    "}<span className="text-gray-600"># Your genius code here</span>
                      <br />
                      {"    "}<span className="text-purple-400">return</span> <span className="text-yellow-300">&quot;success&quot;</span>
                      <br />
                      <br />
                      <span className="text-purple-400">if</span> <span className="text-cyan-300">__name__</span> <span className="text-purple-400">==</span> <span className="text-yellow-300">&quot;__main__&quot;</span><span className="text-gray-500">:</span>
                      <br />
                      {"    "}<span className="text-cyan-400">print</span><span className="text-gray-500">(</span><span className="text-cyan-400">solve</span><span className="text-gray-500">(</span><span className="text-yellow-300">&quot;challenge&quot;</span><span className="text-gray-500">))</span>
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
              {[
                { value: "5", label: "Languages", color: "from-purple-500 to-purple-600" },
                { value: "1M+", label: "Lines Run", color: "from-blue-500 to-blue-600" },
                { value: "<50ms", label: "Compile Time", color: "from-cyan-500 to-cyan-600" },
                { value: "99.9%", label: "Uptime", color: "from-green-500 to-green-600" },
              ].map((stat) => (
                <div key={stat.label} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity`}></div>
                  <div className="relative border border-gray-800 bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl hover:border-gray-700 transition-all">
                    <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-mono mb-1`}>{stat.value}</div>
                    <div className="text-sm text-gray-400 font-mono uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 border border-purple-500/30 bg-purple-500/10 mb-8 rounded-full backdrop-blur-sm">
              <span className="font-mono text-sm text-purple-300 font-medium uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Ship Code Fast</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A complete development environment designed for speed, simplicity, and power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                title: "Lightning Fast",
                description: "Compile and execute code in milliseconds. Our optimized runtime ensures you never wait.",
                icon: "⚡",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                title: "Multiple Languages",
                description: "Write in C, C++, Python, Java, or JavaScript—all in one unified environment.",
                icon: "▶",
                gradient: "from-purple-500 to-purple-600"
              },
              {
                title: "Syntax Highlighting",
                description: "Beautiful, language-aware syntax highlighting that makes code readable and elegant.",
                icon: "🎨",
                gradient: "from-cyan-500 to-blue-500"
              },
              {
                title: "Cloud Execution",
                description: "Run code on our secure cloud infrastructure. No local setup or dependencies needed.",
                icon: "☁",
                gradient: "from-blue-500 to-indigo-500"
              },
              {
                title: "Secure Sandbox",
                description: "Every execution runs in an isolated container. Your code stays safe and private.",
                icon: "🛡",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                title: "Real-time Collaboration",
                description: "Code together with teammates in real-time. See changes as they happen.",
                icon: "👥",
                gradient: "from-pink-500 to-rose-500"
              },
              {
                title: "Auto-Complete",
                description: "Intelligent code suggestions that understand your context and speed up development.",
                icon: "<>",
                gradient: "from-violet-500 to-purple-500"
              },
              {
                title: "Version History",
                description: "Never lose your work. Every save creates a checkpoint you can restore anytime.",
                icon: "⎇",
                gradient: "from-teal-500 to-cyan-500"
              },
            ].map((feature) => (
              <div 
                key={feature.title}
                className="group relative"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <div className="relative border border-gray-800 bg-gray-900/90 backdrop-blur-sm p-8 rounded-xl hover:border-gray-700 transition-all h-full">
                  <div className={`flex h-14 w-14 items-center justify-center bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg mb-6`}>
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section id="languages" className="py-32 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 border border-purple-500/30 bg-purple-500/10 mb-8 rounded-full backdrop-blur-sm">
              <span className="font-mono text-sm text-purple-300 font-medium uppercase tracking-wider">Supported Languages</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              One Editor,
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Five Languages</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Master any language with full support for compilation, execution, and debugging.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto mb-16">
            {[
              { name: "C", icon: "C", gradient: "from-blue-500 to-blue-600", ext: ".c", desc: "Low-level power for system programming" },
              { name: "C++", icon: "C++", gradient: "from-cyan-500 to-blue-500", ext: ".cpp", desc: "Object-oriented with high performance" },
              { name: "Python", icon: "Py", gradient: "from-yellow-500 to-yellow-600", ext: ".py", desc: "Clean syntax for rapid development" },
              { name: "Java", icon: "Ja", gradient: "from-red-500 to-orange-500", ext: ".java", desc: "Enterprise-grade portability" },
              { name: "JavaScript", icon: "JS", gradient: "from-yellow-400 to-yellow-500", ext: ".js", desc: "The language of the web" },
            ].map((lang) => (
              <div 
                key={lang.name}
                className="group relative"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${lang.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <div className="relative border border-gray-800 bg-gray-900/90 backdrop-blur-sm p-8 rounded-xl hover:border-gray-700 transition-all text-center h-full flex flex-col items-center justify-center">
                  <div className={`flex h-20 w-20 items-center justify-center bg-gradient-to-br ${lang.gradient} rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                    <span className="font-mono text-2xl font-bold text-white">{lang.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{lang.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{lang.desc}</p>
                  <span className="inline-block font-mono text-xs px-3 py-1.5 border border-gray-700 bg-gray-800 text-gray-300 rounded-lg">
                    {lang.ext}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Code Examples Tabs */}
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-20"></div>
              <div className="relative border border-gray-800 bg-gray-900/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-800 overflow-x-auto bg-gray-800/50">
                  {["C", "C++", "Python", "Java", "JavaScript"].map((lang, index) => (
                    <button
                      key={lang}
                      className={`px-8 py-4 font-mono text-sm border-r border-gray-800 transition-all whitespace-nowrap ${
                        index === 2 
                          ? "bg-purple-600 text-white font-semibold" 
                          : "bg-transparent text-gray-400 hover:bg-gray-800/80 hover:text-white"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                
                {/* Code Content */}
                <div className="p-8 font-mono text-base bg-gradient-to-b from-gray-900 to-gray-950">
                  <pre className="text-gray-300 overflow-x-auto leading-relaxed">
                    <code>
                      <span className="text-gray-600"># Python Example</span>
                      <br />
                      <span className="text-purple-400">def</span> <span className="text-cyan-400">fibonacci</span><span className="text-gray-500">(</span>n<span className="text-gray-500">)</span><span className="text-gray-500">:</span>
                      <br />
                      {"    "}<span className="text-purple-400">if</span> n <span className="text-purple-400">{"<="}</span> <span className="text-yellow-300">1</span><span className="text-gray-500">:</span>
                      <br />
                      {"        "}<span className="text-purple-400">return</span> n
                      <br />
                      {"    "}<span className="text-purple-400">return</span> <span className="text-cyan-400">fibonacci</span><span className="text-gray-500">(</span>n<span className="text-purple-400">-</span><span className="text-yellow-300">1</span><span className="text-gray-500">)</span> <span className="text-purple-400">+</span> <span className="text-cyan-400">fibonacci</span><span className="text-gray-500">(</span>n<span className="text-purple-400">-</span><span className="text-yellow-300">2</span><span className="text-gray-500">)</span>
                      <br />
                      <br />
                      <span className="text-gray-600"># Print first 10 Fibonacci numbers</span>
                      <br />
                      <span className="text-purple-400">for</span> i <span className="text-purple-400">in</span> <span className="text-cyan-400">range</span><span className="text-gray-500">(</span><span className="text-yellow-300">10</span><span className="text-gray-500">)</span><span className="text-gray-500">:</span>
                      <br />
                      {"    "}<span className="text-cyan-400">print</span><span className="text-gray-500">(</span><span className="text-cyan-400">fibonacci</span><span className="text-gray-500">(</span>i<span className="text-gray-500">))</span>
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="compare" className="py-20 lg:py-32 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 border border-gray-700 bg-gray-800 mb-6 rounded">
              <span className="font-mono text-sm text-gray-300 font-medium">Comparison</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Choose
              <br />
              <span className="text-purple-500">CodeForge?</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              See how we stack up against the competition.
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <div className="border border-gray-800 bg-gray-950 rounded-lg overflow-hidden min-w-[600px]">
              {/* Table Header */}
              <div className="grid grid-cols-5 border-b border-gray-800 bg-purple-600">
                <div className="p-4 font-mono font-bold text-white border-r border-purple-700">
                  Feature
                </div>
                <div className="p-4 font-mono font-bold text-white text-center border-r border-purple-700">
                  CodeForge
                </div>
                <div className="p-4 font-mono text-sm text-purple-100 text-center border-r border-purple-700">
                  Repl.it
                </div>
                <div className="p-4 font-mono text-sm text-purple-100 text-center border-r border-purple-700">
                  CodePen
                </div>
                <div className="p-4 font-mono text-sm text-purple-100 text-center">
                  JDoodle
                </div>
              </div>
              
              {/* Table Rows */}
              {(() => {
                type StatusType = boolean | "partial";
                type ComparisonRow = {
                  feature: string;
                  cf: StatusType;
                  r: StatusType;
                  cp: StatusType;
                  jd: StatusType;
                };
                
                const data: ComparisonRow[] = [
                  { feature: "Free Tier", cf: true, r: "partial", cp: false, jd: true },
                  { feature: "No Account Required", cf: true, r: false, cp: false, jd: false },
                  { feature: "C/C++ Support", cf: true, r: true, cp: false, jd: true },
                  { feature: "Real-time Collaboration", cf: true, r: false, cp: true, jd: false },
                  { feature: "Instant Execution", cf: true, r: "partial", cp: true, jd: "partial" },
                  { feature: "Syntax Highlighting", cf: true, r: true, cp: true, jd: true },
                  { feature: "Custom Themes", cf: true, r: false, cp: true, jd: false },
                  { feature: "Version History", cf: true, r: false, cp: false, jd: false },
                ];
                
                return data.map((row, index) => {
                const renderStatus = (status: StatusType) => {
                  if (status === true) {
                    return (
                      <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center">
                        <span className="text-xs text-black font-bold">✓</span>
                      </div>
                    );
                  }
                  if (status === "partial") {
                    return (
                      <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                        <span className="text-xs text-black font-bold">−</span>
                      </div>
                    );
                  }
                  return (
                    <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-xs text-white font-bold">✕</span>
                    </div>
                  );
                };
                
                return (
                <div 
                  key={row.feature}
                  className={`grid grid-cols-5 border-b border-gray-800 ${
                    index % 2 === 0 ? "bg-gray-950" : "bg-gray-900"
                  }`}
                >
                  <div className="p-4 font-medium text-white border-r border-gray-800">
                    {row.feature}
                  </div>
                  <div className="p-4 border-r border-gray-800 bg-purple-950/30">
                    <div className="flex justify-center">
                      {renderStatus(row.cf)}
                    </div>
                  </div>
                  <div className="p-4 border-r border-gray-800">
                    <div className="flex justify-center">
                      {renderStatus(row.r)}
                    </div>
                  </div>
                  <div className="p-4 border-r border-gray-800">
                    <div className="flex justify-center">
                      {renderStatus(row.cp)}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-center">
                      {renderStatus(row.jd)}
                    </div>
                  </div>
                </div>
              );
              });
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-32 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 border border-gray-700 bg-gray-800 mb-6 rounded">
              <span className="font-mono text-sm text-gray-300 font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked
              <br />
              <span className="text-purple-500">Questions</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              Got questions? We&apos;ve got answers.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Is CodeForge really free to use?",
                a: "Yes! CodeForge offers a generous free tier that includes unlimited code executions, all supported languages, and basic collaboration features.",
                num: "01"
              },
              {
                q: "Which programming languages are supported?",
                a: "CodeForge currently supports C, C++, Python, Java, and JavaScript. Each language runs on optimized compilers and interpreters for the best performance.",
                num: "02"
              },
              {
                q: "How fast is code execution?",
                a: "Our cloud infrastructure is optimized for speed. Most code compiles and executes in under 50 milliseconds.",
                num: "03"
              },
              {
                q: "Can I collaborate with my team in real-time?",
                a: "Absolutely! CodeForge supports real-time collaboration where multiple users can edit the same file simultaneously.",
                num: "04"
              },
              {
                q: "Is my code secure and private?",
                a: "Security is our top priority. All code runs in isolated containers that are destroyed after execution. Your code is encrypted in transit and at rest.",
                num: "05"
              },
            ].map((faq) => (
              <div 
                key={faq.num}
                className="border border-gray-800 bg-gray-900 p-6 rounded-lg hover:border-purple-600 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center bg-purple-600 text-white font-mono text-sm font-bold rounded shrink-0">
                    {faq.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                    <p className="text-gray-400 text-sm">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 border border-white/30 bg-white/10 mb-10 rounded-full backdrop-blur-md">
              <span className="font-mono text-sm text-white font-medium">✨ Start coding today</span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Ready to Write
              <br />
              Better Code?
            </h2>
            <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto mb-12 leading-relaxed">
              Join thousands of developers who&apos;ve made CodeForge their go-to online editor.
              <span className="block mt-2 text-purple-200">No credit card required.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <Link 
                href="/dashboard"
                className="group inline-flex items-center justify-center px-10 py-5 font-mono text-xl bg-white text-purple-600 hover:bg-gray-100 transition-all rounded-xl shadow-2xl hover:scale-105 font-semibold"
              >
                Start Coding Free
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a 
                href="#features"
                className="inline-flex items-center justify-center px-10 py-5 font-mono text-xl border-2 border-white text-white hover:bg-white/10 transition-all rounded-xl backdrop-blur-md"
              >
                View Documentation
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-10 text-purple-100">
              <div className="flex items-center gap-3 font-mono text-base">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                No credit card
              </div>
              <div className="flex items-center gap-3 font-mono text-base">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                Instant access
              </div>
              <div className="flex items-center gap-3 font-mono text-base">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white border-t border-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center bg-purple-600 rounded">
                  <Code2 className="h-6 w-6 text-white" />
                </div>
                <span className="font-mono text-xl font-bold">CodeForge</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-xs text-sm">
                The brutally fast online code editor for developers who value speed and simplicity.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                <a href="#" className="flex h-10 w-10 items-center justify-center border border-gray-700 hover:bg-gray-800 rounded transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="flex h-10 w-10 items-center justify-center border border-gray-700 hover:bg-gray-800 rounded transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="flex h-10 w-10 items-center justify-center border border-gray-700 hover:bg-gray-800 rounded transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-mono font-bold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a></li>
                <li><a href="#languages" className="text-gray-400 hover:text-white transition-colors text-sm">Languages</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Changelog</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="font-mono font-bold mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Tutorials</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-mono font-bold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Press</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-mono font-bold mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookies</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm font-mono">
                © 2024 CodeForge. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-gray-500 font-mono">
                  <span className="w-2 h-2 bg-cyan-400 animate-pulse rounded-full" />
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
