"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Play,
  Pause,
  Search,
  Mic,
  BookOpen,
  Building2,
  GraduationCap,
  Megaphone,
  Gamepad2,
  Smartphone,
  Film,
  User,
  UserRound,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Voice talent data with categories
// Combines original Chatterbox voices with Polly voices from doppel.center
const voiceTalents = [
  // === CHATTERBOX AI VOICES (Custom/Cloned) ===
  {
    id: "friendly-female",
    name: "Sarah",
    gender: "Female",
    language: "English",
    accent: "American",
    tags: ["Friendly", "Warm", "Professional"],
    categories: ["advertisements", "education", "corporate"],
    sampleText: "Hi there! I'm excited to help you create amazing voice content today.",
    audioUrl: "/audio/friendly-female.wav",
    engine: "chatterbox",
  },
  {
    id: "stewie-clone",
    name: "Stewie",
    gender: "Male",
    language: "English",
    accent: "American",
    tags: ["Character", "Distinctive", "Animated"],
    categories: ["advertisements", "games", "video"],
    sampleText: "Introducing the next generation of refreshment. Duff Beer just got bolder, smoother, and brewed to perfection.",
    audioUrl: "/audio/duff_stewie.wav",
    engine: "chatterbox",
  },
  {
    id: "conan-voice",
    name: "Conan",
    gender: "Male",
    language: "English",
    accent: "American",
    tags: ["Passionate", "Dramatic", "Powerful"],
    categories: ["video", "events", "audiobooks"],
    sampleText: "So I want you to get up now. I want all of you to get up out of your chairs.",
    audioUrl: "/audio/network_conan.wav",
    engine: "chatterbox",
  },
  {
    id: "hindi-voice",
    name: "Priya",
    gender: "Female",
    language: "Hindi",
    accent: "Indian",
    tags: ["Natural", "Clear", "Warm"],
    categories: ["education", "corporate", "products"],
    sampleText: "नमस्कार! हमारे मंच पर आपका स्वागत है।",
    audioUrl: "/audio/hindi.wav",
    engine: "chatterbox",
  },
  {
    id: "spanish-voice",
    name: "Carlos",
    gender: "Male",
    language: "Spanish",
    accent: "European",
    tags: ["Friendly", "Clear", "Engaging"],
    categories: ["advertisements", "education", "events"],
    sampleText: "¡Hola! Bienvenido a nuestra plataforma.",
    audioUrl: "/audio/spanish.wav",
    engine: "chatterbox",
  },
  {
    id: "french-voice",
    name: "Marie",
    gender: "Female",
    language: "French",
    accent: "French",
    tags: ["Elegant", "Sophisticated", "Warm"],
    categories: ["audiobooks", "corporate", "video"],
    sampleText: "Bonjour! Bienvenue sur notre plateforme.",
    audioUrl: "/audio/french.wav",
    engine: "chatterbox",
  },
  {
    id: "japanese-voice",
    name: "Yuki",
    gender: "Female",
    language: "Japanese",
    accent: "Japanese",
    tags: ["Polite", "Clear", "Professional"],
    categories: ["products", "games", "education"],
    sampleText: "こんにちは！私たちのプラットフォームへようこそ。",
    audioUrl: "/audio/japanese.wav",
    engine: "chatterbox",
  },
  // === AMAZON POLLY NEURAL VOICES ===
  {
    id: "polly-joanna-neural",
    name: "Joanna",
    gender: "Female",
    language: "English",
    accent: "American",
    tags: ["Professional", "Warm", "Clear"],
    categories: ["corporate", "education", "products"],
    sampleText: "Hello, I'm Joanna. I have a professional and warm voice that's perfect for business communications.",
    audioUrl: "/audio/polly/polly-joanna-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-matthew-neural",
    name: "Matthew",
    gender: "Male",
    language: "English",
    accent: "American",
    tags: ["Professional", "Calm", "Authoritative"],
    categories: ["corporate", "audiobooks", "education"],
    sampleText: "Hello, I'm Matthew. My calm and authoritative voice is ideal for professional narration.",
    audioUrl: "/audio/polly/polly-matthew-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-ruth-generative",
    name: "Ruth",
    gender: "Female",
    language: "English",
    accent: "American",
    tags: ["Natural", "Conversational", "Warm"],
    categories: ["advertisements", "products", "education"],
    sampleText: "Hi there, I'm Ruth. I have a natural, conversational style that feels warm and approachable.",
    audioUrl: "/audio/polly/polly-ruth-generative.mp3",
    engine: "polly-generative",
  },
  {
    id: "polly-stephen-generative",
    name: "Stephen",
    gender: "Male",
    language: "English",
    accent: "American",
    tags: ["Natural", "Professional", "Clear"],
    categories: ["corporate", "products", "video"],
    sampleText: "Hello, I'm Stephen. My natural voice brings professionalism with a clear, modern sound.",
    audioUrl: "/audio/polly/polly-stephen-generative.mp3",
    engine: "polly-generative",
  },
  {
    id: "polly-ivy-neural",
    name: "Ivy",
    gender: "Female",
    language: "English",
    accent: "American",
    tags: ["Friendly", "Youthful", "Clear"],
    categories: ["education", "games", "products"],
    sampleText: "Hello, I'm Ivy. My friendly and youthful voice is great for engaging, approachable content.",
    audioUrl: "/audio/polly/polly-ivy-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-joey-neural",
    name: "Joey",
    gender: "Male",
    language: "English",
    accent: "American",
    tags: ["Friendly", "Casual", "Warm"],
    categories: ["advertisements", "games", "video"],
    sampleText: "Hey, I'm Joey. My friendly and casual voice is perfect for relaxed, warm conversations.",
    audioUrl: "/audio/polly/polly-joey-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-amy-neural",
    name: "Amy",
    gender: "Female",
    language: "English",
    accent: "British",
    tags: ["Professional", "British", "Clear"],
    categories: ["corporate", "audiobooks", "education"],
    sampleText: "Hello, I'm Amy. My British accent brings a professional and clear tone to your content.",
    audioUrl: "/audio/polly/polly-amy-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-brian-neural",
    name: "Brian",
    gender: "Male",
    language: "English",
    accent: "British",
    tags: ["Professional", "British", "Authoritative"],
    categories: ["corporate", "audiobooks", "events"],
    sampleText: "Hello, I'm Brian. My authoritative British voice is perfect for formal communications.",
    audioUrl: "/audio/polly/polly-brian-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-emma-neural",
    name: "Emma",
    gender: "Female",
    language: "English",
    accent: "British",
    tags: ["Warm", "British", "Friendly"],
    categories: ["education", "products", "corporate"],
    sampleText: "Hi, I'm Emma. My warm and friendly British voice is great for customer interactions.",
    audioUrl: "/audio/polly/polly-emma-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-lupe-neural",
    name: "Lupe",
    gender: "Female",
    language: "Spanish",
    accent: "Bilingual",
    tags: ["Professional", "Clear", "Bilingual"],
    categories: ["corporate", "education", "advertisements"],
    sampleText: "Hola, soy Lupe. Mi voz profesional es perfecta para comunicaciones bilingües.",
    audioUrl: "/audio/polly/polly-lupe-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-pedro-neural",
    name: "Pedro",
    gender: "Male",
    language: "Spanish",
    accent: "Bilingual",
    tags: ["Professional", "Clear", "Bilingual"],
    categories: ["corporate", "education", "products"],
    sampleText: "Hola, soy Pedro. Tengo una voz clara y profesional para audiencias bilingües.",
    audioUrl: "/audio/polly/polly-pedro-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-mia-neural",
    name: "Mia",
    gender: "Female",
    language: "Spanish",
    accent: "Mexican",
    tags: ["Warm", "Mexican", "Friendly"],
    categories: ["advertisements", "education", "products"],
    sampleText: "Hola, soy Mia. Mi voz cálida y amigable es ideal para el mercado mexicano.",
    audioUrl: "/audio/polly/polly-mia-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-camila-neural",
    name: "Camila",
    gender: "Female",
    language: "Portuguese",
    accent: "Brazilian",
    tags: ["Professional", "Brazilian", "Clear"],
    categories: ["corporate", "education", "advertisements"],
    sampleText: "Olá, eu sou a Camila. Minha voz profissional e clara é perfeita para o mercado brasileiro.",
    audioUrl: "/audio/polly/polly-camila-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-thiago-neural",
    name: "Thiago",
    gender: "Male",
    language: "Portuguese",
    accent: "Brazilian",
    tags: ["Professional", "Brazilian", "Warm"],
    categories: ["corporate", "products", "video"],
    sampleText: "Olá, eu sou o Thiago. Minha voz profissional e calorosa é ideal para comunicações empresariais.",
    audioUrl: "/audio/polly/polly-thiago-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-lea-neural",
    name: "Léa",
    gender: "Female",
    language: "French",
    accent: "French",
    tags: ["Professional", "French", "Clear"],
    categories: ["corporate", "audiobooks", "education"],
    sampleText: "Bonjour, je suis Léa. Ma voix professionnelle et claire est parfaite pour vos communications.",
    audioUrl: "/audio/polly/polly-lea-neural.mp3",
    engine: "polly-neural",
  },
  {
    id: "polly-remi-neural",
    name: "Rémi",
    gender: "Male",
    language: "French",
    accent: "French",
    tags: ["Professional", "French", "Warm"],
    categories: ["corporate", "audiobooks", "video"],
    sampleText: "Bonjour, je suis Rémi. Ma voix chaleureuse et professionnelle convient à toutes vos communications.",
    audioUrl: "/audio/polly/polly-remi-neural.mp3",
    engine: "polly-neural",
  },
];

// Use-case categories
const categories = [
  { id: "advertisements", name: "Advertisements & Promos", icon: Megaphone },
  { id: "audiobooks", name: "Audio Books & Dramas", icon: BookOpen },
  { id: "corporate", name: "Branded & Corporate Content", icon: Building2 },
  { id: "education", name: "Education & eLearning", icon: GraduationCap },
  { id: "events", name: "Events & Announcers", icon: Mic },
  { id: "games", name: "Games & Interactive Media", icon: Gamepad2 },
  { id: "products", name: "Products, App & Guides", icon: Smartphone },
  { id: "video", name: "Video On Demand & Film", icon: Film },
];

// Audio visualizer bars component
function AudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full transition-all duration-150 ${
            isPlaying ? "animate-pulse" : ""
          }`}
          style={{
            height: isPlaying ? `${Math.random() * 12 + 4}px` : "4px",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated equalizer for play bar
function PlayBarVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const [heights, setHeights] = useState([4, 8, 12, 8, 4, 10, 6, 14, 8, 4]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setHeights(heights.map(() => Math.random() * 20 + 4));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex items-center gap-0.5 h-6">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-blue-400 to-purple-400 rounded-full transition-all duration-100"
          style={{ height: isPlaying ? `${h}px` : "4px" }}
        />
      ))}
    </div>
  );
}

export default function VoicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string>("Any");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Any");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentVoice, setCurrentVoice] = useState<typeof voiceTalents[0] | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter voices based on selections
  const filteredVoices = voiceTalents.filter((voice) => {
    if (selectedCategory && !voice.categories.includes(selectedCategory)) return false;
    if (selectedGender !== "Any" && voice.gender !== selectedGender) return false;
    if (selectedLanguage !== "Any" && voice.language !== selectedLanguage) return false;
    return true;
  });

  // Get unique languages
  const languages = ["Any", ...new Set(voiceTalents.map((v) => v.language))];
  const genders = ["Any", "Male", "Female"];

  const handlePlay = (voice: typeof voiceTalents[0]) => {
    if (playingId === voice.id) {
      // Pause current
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Create new audio
    const audio = new Audio(voice.audioUrl);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setProgress(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setPlayingId(null);
      setProgress(0);
    });

    audio.play().then(() => {
      setPlayingId(voice.id);
      setCurrentVoice(voice);
    }).catch(console.error);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-butterfly.png"
                alt="double.talk logo"
                width={36}
                height={36}
                className="h-9 w-9"
              />
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                double.talk
              </span>
            </Link>
            <div className="hidden items-center space-x-8 md:flex">
              <Link
                href="/ai-voice-catalog"
                className="font-medium text-indigo-600"
              >
                Voice Catalog
              </Link>
              <Link
                href="/#features"
                className="text-slate-600 transition-colors hover:text-indigo-600"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="text-slate-600 transition-colors hover:text-indigo-600"
              >
                Pricing
              </Link>
              <Link
                href="/#testimonials"
                className="text-slate-600 transition-colors hover:text-indigo-600"
              >
                Reviews
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/sign-in">
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" className="cursor-pointer">
                  Try Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-32">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            Voice{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Catalog
            </span>
          </h1>
          <p className="mt-2 text-slate-600">
            Explore our collection of professional AI voices
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
              <Mic className="h-5 w-5 text-slate-500" />
              <span className="font-medium text-slate-700">Voice-Over</span>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Speaking</span>
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang === "Any" ? "Any Language" : lang}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Gender Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Gender</span>
              <div className="relative">
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {genders.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Search Button */}
            <div className="ml-auto">
              <Button
                variant="outline"
                className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedGender("Any");
                  setSelectedLanguage("Any");
                }}
              >
                <Search className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Category Cards */}
        <div className="mb-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                  className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                  <span className={`text-xs text-center font-medium leading-tight ${isSelected ? "text-blue-700" : "text-slate-600"}`}>
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Voice Talent Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVoices.map((voice) => {
            const isPlaying = playingId === voice.id;
            return (
              <Card
                key={voice.id}
                className={`overflow-hidden border transition-all ${
                  isPlaying ? "border-blue-500 shadow-lg" : "border-slate-200 hover:shadow-md"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                      voice.gender === "Female"
                        ? "from-pink-400 to-purple-500"
                        : "from-blue-400 to-indigo-500"
                    } shadow-md`}>
                      <UserRound className="h-8 w-8 text-white/90" strokeWidth={1.5} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{voice.name}</h3>
                        {isPlaying && <AudioVisualizer isPlaying={true} />}
                      </div>
                      <p className="text-sm text-slate-500">
                        {voice.language} • {voice.accent} • {voice.gender}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {voice.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Play Button */}
                    <button
                      onClick={() => handlePlay(voice)}
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                        isPlaying
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600"
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Sample Text Preview */}
                  <p className="mt-3 text-sm text-slate-500 italic line-clamp-2">
                    &ldquo;{voice.sampleText}&rdquo;
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredVoices.length === 0 && (
          <div className="py-16 text-center">
            <User className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-700">No voices found</h3>
            <p className="mt-2 text-slate-500">Try adjusting your filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedGender("Any");
                setSelectedLanguage("Any");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Custom Script CTA */}
        <div className="mt-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Want to hear your own script?</h2>
          <p className="mt-2 text-blue-100">
            Sign up for free to generate custom voice content with any of our voices
          </p>
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="mt-6 bg-white text-blue-600 hover:bg-blue-50"
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </main>

      {/* Sticky Play Bar */}
      <div className={`fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur transition-transform duration-300 ${
        currentVoice ? "translate-y-0" : "translate-y-full"
      }`}>
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Voice Info */}
            {currentVoice && (
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                  currentVoice.gender === "Female"
                    ? "from-pink-400 to-purple-500"
                    : "from-blue-400 to-indigo-500"
                }`}>
                  <UserRound className="h-6 w-6 text-white/90" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{currentVoice.name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentVoice.language} • {currentVoice.accent}</p>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => currentVoice && handlePlay(currentVoice)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-transform hover:scale-105"
              >
                {playingId ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
            </div>

            {/* Progress */}
            <div className="flex flex-1 items-center gap-3">
              <span className="text-xs text-slate-500 w-10">{formatTime(progress)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={handleSeek}
                className="flex-1 h-1 appearance-none rounded-full bg-slate-200 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
              />
              <span className="text-xs text-slate-500 w-10">{formatTime(duration)}</span>
            </div>

            {/* Visualizer */}
            <div className="hidden sm:block">
              <PlayBarVisualizer isPlaying={!!playingId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
