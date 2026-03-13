import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, CheckSquare, Flame, BookOpen, Star, Quote, Github, Twitter, Linkedin } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans relative selection:bg-primary/30 flex flex-col">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-20 flex justify-between items-center px-6 py-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent">
            Notebook.
          </h2>
        </div>
        <div>
          {userId ? (
            <Link 
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="text-sm font-medium hover:text-primary transition-colors px-4 py-2 hidden sm:block"
              >
                Log In
              </Link>
              <Link 
                href="/register"
                className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center w-full">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-24 md:pt-32 md:pb-40 max-w-5xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Your personal growth OS
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Master your <span className="bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent drop-shadow-sm">habits</span>, <br className="hidden md:block" />
            track your life.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Notebook is a beautifully designed, all-in-one workspace for your daily habits, tasks, and journals. Stay consistent and build the life you want.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in zoom-in duration-700 delay-300">
            {userId ? (
              <Link 
                href="/dashboard"
                className="flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all w-full sm:w-auto font-bold text-lg shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary),0.5)]"
              >
                Open Workspace <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link 
                href="/register"
                className="flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all w-full sm:w-auto font-bold text-lg shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary),0.5)]"
              >
                Get Started for Free <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </section>

        {/* Feature Highlights section */}
        <section className="px-6 py-24 w-full bg-muted/10 border-y border-border/40 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to stay on track</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">We've combined the three most important tools for personal growth into one seamless experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="flex flex-col gap-4 p-8 bg-card/40 backdrop-blur-md rounded-3xl border border-border/40 hover:border-primary/30 transition-colors shadow-lg shadow-black/5 group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                  <Flame className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">Habit Tracking</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Build lasting routines with beautiful heatmaps and activity streaks that motivate you daily. Don't break the chain.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 p-8 bg-card/40 backdrop-blur-md rounded-3xl border border-border/40 hover:border-blue-500/30 transition-colors shadow-lg shadow-black/5 group">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                  <CheckSquare className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">Task Management</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Keep your day organized with a simple, distraction-free todo list. Swipe to complete, minus to delete.
                </p>
              </div>

              <div className="flex flex-col gap-4 p-8 bg-card/40 backdrop-blur-md rounded-3xl border border-border/40 hover:border-emerald-500/30 transition-colors shadow-lg shadow-black/5 group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">Daily Journal</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Reflect on your progress and clear your mind with a distraction-free daily journaling space attached to your everyday dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Testimonials */}
        <section className="px-6 py-32 w-full bg-muted/5 border-y border-border/40 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Loved by productivity seekers</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Here's what our early users have to say about Notebook.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "I've tried Notion, Todoist, and Apple Notes. Nothing matches the absolute simplicity and visual satisfaction of this dashboard. It completely changed my mornings.",
                  name: "Sarah Jenkins",
                  role: "Product Designer",
                  rating: 5
                },
                {
                  quote: "The visual streaks hold me so accountable. If I don't see the primary color lighting up on the productivity map, I literally get out of bed to do my pushups.",
                  name: "David Chen",
                  role: "Software Engineer",
                  rating: 5
                },
                {
                  quote: "Having my journal tied directly right next to my task list means I actually use it. It's the perfect closing routine for my workday.",
                  name: "Elena Rodriguez",
                  role: "Freelance Writer",
                  rating: 5
                }
              ].map((review, i) => (
                <div key={i} className="bg-card/60 backdrop-blur-md p-8 rounded-2xl border border-border/40 flex flex-col gap-6 relative">
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground/90 italic leading-relaxed flex-1">"{review.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center font-bold text-sm border border-border">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-foreground">{review.name}</h5>
                      <p className="text-xs text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-32 max-w-5xl mx-auto w-full text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Ready to build better habits?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of users who are taking control of their lives. It takes less than 30 seconds to sign up.
          </p>
          {userId ? (
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all font-bold text-lg shadow-[0_0_40px_rgba(var(--primary),0.4)]"
            >
              Go to your Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
             <Link 
              href="/register"
              className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all font-bold text-lg shadow-[0_0_40px_rgba(var(--primary),0.4)]"
            >
              Start Your Free Account <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 bg-card/10 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent mb-4">
                Notebook.
              </h2>
              <p className="text-muted-foreground max-w-sm mb-6">
                A single workspace for habits, tasks, and reflections. Built for the modern mind.
              </p>
              <div className="flex gap-4 text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
                <a href="#" className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Product</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Download App</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Notebook Application. All rights reserved.</p>
            <p>Designed with absolute focus.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
