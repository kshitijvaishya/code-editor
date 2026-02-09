import Link from "next/link";
import Image from "next/image";
import { Rocket, Phone, CalendarDays, MapPin, Sparkles } from "lucide-react";

function Starfield() {
  // Generate deterministic star positions using a simple seed approach
  const stars = Array.from({ length: 80 }, (_, i) => {
    const seed = (i * 17 + 31) % 100;
    const seed2 = (i * 23 + 47) % 100;
    const seed3 = (i * 13 + 11) % 25 + 5;
    const seed4 = (i * 7 + 3) % 50;
    const seed5 = (i * 11 + 19) % 30 + 20;
    return {
      id: i,
      x: seed,
      y: seed2,
      size: (seed3 % 25) / 10 + 0.5,
      delay: seed4 / 10,
      duration: seed5 / 10,
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-primary/60"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function EventDetails() {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 box-glow">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-primary">Event Details</h2>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <CalendarDays className="w-4 h-4" />
            <span className="font-semibold">Date:</span>
          </div>
          <p className="text-foreground ml-6">10 February 2026</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <MapPin className="w-4 h-4" />
            <span className="font-semibold">Venue:</span>
          </div>
          <p className="text-foreground ml-6">
            EGD Hall, I.K. Gujral Punjab Technical University
            <br />
            Mohali Campus - I
          </p>
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-muted-foreground text-sm mb-3">Presented by</p>
          <div className="flex items-center gap-4">
            <Image
              src="/logo.jpeg"
              alt="TECHzHUT Coding Club"
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover border border-border"
            />
            <span className="text-sm text-muted-foreground font-display tracking-wide">
              Coding Club TECHzHUT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="TECHzHUT"
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover"
          />
          <span className="font-display text-sm md:text-base font-bold tracking-wider text-foreground">
            DSA PLAYGROUND - 2K26
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Schedule", "Gallery", "Rules & Guidelines", "FAQs"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ & /g, "-")}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        <Link
          href="/signup"
          className="px-5 py-2 rounded-md bg-primary text-primary-foreground font-display text-xs font-semibold tracking-wider hover:brightness-110 transition-all duration-300"
        >
          Register
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <Starfield />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 md:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left content */}
            <div className="flex-1">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-glow text-primary mb-6">
                DSA PLAYGROUND - 2K26
              </h1>

              <div className="space-y-4 text-foreground/80 text-base md:text-lg leading-relaxed max-w-xl">
                <p>
                  Join us for an electrifying experience of creativity, problem-solving, and next-level coding! Collaborate with brilliant minds, turn ideas into reality, and compete for thrilling prizes.
                </p>
                <p>
                  Whether you&apos;re a coding wizard or a curious innovator, this is your chance to build, break, and innovate like never before.
                </p>
              </div>

              <p className="mt-6 text-lg font-semibold text-foreground">
                🔥 Code. Create. Conquer. Are you ready? 🚀
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm font-semibold tracking-wider btn-glow hover:brightness-110 transition-all duration-300"
                >
                  <Rocket className="w-4 h-4" />
                  Register Now
                </Link>
                <a
                  href="#contact"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-secondary text-secondary-foreground font-display text-sm font-semibold tracking-wider hover:bg-muted transition-all duration-300"
                >
                  <Phone className="w-4 h-4" />
                  Contact Us
                </a>
              </div>
            </div>

            {/* Right content - Event Details */}
            <div className="flex-shrink-0">
              <EventDetails />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
