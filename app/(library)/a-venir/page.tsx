"use client"

import { useState, useEffect, useCallback } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Church,
  Users,
  BookOpen,
  Megaphone,
  Heart,
  Star,
  Bell,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const categoryIcons: Record<string, React.ElementType> = {
  culte: Church,
  conference: Megaphone,
  seminaire: BookOpen,
  evangelisation: Heart,
  jeunesse: Users,
  autre: Star
}

const categoryLabels: Record<string, string> = {
  culte: "Culte",
  conference: "Conference",
  seminaire: "Seminaire",
  evangelisation: "Evangelisation",
  jeunesse: "Jeunesse",
  autre: "Autre"
}

const categoryColors: Record<string, { badge: string; bg: string; icon: string }> = {
  culte: { 
    badge: "bg-blue-50 text-blue-700 border-blue-100", 
    bg: "bg-blue-50", 
    icon: "text-blue-600" 
  },
  conference: { 
    badge: "bg-purple-50 text-purple-700 border-purple-100", 
    bg: "bg-purple-50", 
    icon: "text-purple-600" 
  },
  seminaire: { 
    badge: "bg-amber-50 text-amber-700 border-amber-100", 
    bg: "bg-amber-50", 
    icon: "text-amber-600" 
  },
  evangelisation: { 
    badge: "bg-rose-50 text-rose-700 border-rose-100", 
    bg: "bg-rose-50", 
    icon: "text-rose-600" 
  },
  jeunesse: { 
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100", 
    bg: "bg-emerald-50", 
    icon: "text-emerald-600" 
  },
  autre: { 
    badge: "bg-gray-50 text-gray-700 border-gray-100", 
    bg: "bg-gray-50", 
    icon: "text-gray-600" 
  }
}

export default function UpcomingProgramsPage() {
  const { upcomingPrograms } = useStore()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  // Sort programs by date
  const sortedPrograms = [...upcomingPrograms].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % sortedPrograms.length)
  }, [sortedPrograms.length])
  
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + sortedPrograms.length) % sortedPrograms.length)
  }, [sortedPrograms.length])
  
  // Auto-slide every 8 seconds
  useEffect(() => {
    if (!isAutoPlaying || sortedPrograms.length <= 1) return
    
    const interval = setInterval(() => {
      nextSlide()
    }, 8000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide, sortedPrograms.length])
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
    }
  }
  
  if (sortedPrograms.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Calendar className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-3">Aucun programme a venir</h1>
          <p className="text-muted-foreground leading-relaxed">
            Revenez bientot pour decouvrir nos prochains evenements spirituels et temps de communion.
          </p>
        </div>
      </div>
    )
  }
  
  const currentProgram = sortedPrograms[currentSlide]
  const CategoryIcon = categoryIcons[currentProgram.category]
  const colors = categoryColors[currentProgram.category]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-8 pt-6 lg:pt-10 lg:pb-12">
        {/* Soft gradient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-bl from-secondary/10 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          {/* Header */}
          <div className="text-center mb-10 lg:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary mb-5">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">Programmes a Venir</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
              Rejoignez-nous pour nos
              <br />
              <span className="text-primary">prochains evenements</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Cultes, conferences, seminaires et moments de communion fraternelle vous attendent.
            </p>
          </div>
          
          {/* Featured Event Card */}
          <div 
            className="relative max-w-5xl mx-auto"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <Card className="overflow-hidden border-0 shadow-xl shadow-primary/5 bg-card">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-5">
                  {/* Image Side - 3 columns */}
                  <div className="relative h-[280px] lg:h-[420px] lg:col-span-3 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out scale-105"
                      style={{ 
                        backgroundImage: `url(${currentProgram.image || '/images/placeholder-event.jpg'})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent lg:bg-gradient-to-t lg:from-black/60 lg:via-black/20 lg:to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-5 left-5">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium bg-white/95 backdrop-blur-sm border-0 shadow-sm",
                          colors.badge
                        )}
                      >
                        <CategoryIcon className="h-3.5 w-3.5 mr-1.5" />
                        {categoryLabels[currentProgram.category]}
                      </Badge>
                    </div>
                    
                    {/* Date Badge - Mobile */}
                    <div className="absolute bottom-5 left-5 lg:hidden">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm text-center">
                        <p className="text-2xl font-bold text-foreground leading-none">{formatShortDate(currentProgram.date).day}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">{formatShortDate(currentProgram.date).month}</p>
                      </div>
                    </div>

                    {/* Navigation Arrows - Desktop */}
                    {sortedPrograms.length > 1 && (
                      <div className="hidden lg:flex absolute bottom-5 right-5 gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm border-0 shadow-sm hover:bg-white"
                          onClick={prevSlide}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm border-0 shadow-sm hover:bg-white"
                          onClick={nextSlide}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Content Side - 2 columns */}
                  <div className="p-6 lg:p-8 lg:col-span-2 flex flex-col justify-center">
                    {/* Date Badge - Desktop */}
                    <div className="hidden lg:flex items-center gap-4 mb-5">
                      <div className={cn("rounded-xl px-4 py-3 text-center", colors.bg)}>
                        <p className="text-2xl font-bold text-foreground leading-none">{formatShortDate(currentProgram.date).day}</p>
                        <p className={cn("text-xs font-medium mt-0.5", colors.icon)}>{formatShortDate(currentProgram.date).month}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Evenement a venir</p>
                        <p className="text-sm font-medium text-foreground capitalize">{formatDate(currentProgram.date).split(',')[0]}</p>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-tight mb-3 text-balance">
                      {currentProgram.title}
                    </h2>
                    
                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">
                      {currentProgram.description}
                    </p>
                    
                    {/* Meta Information */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg)}>
                          <Clock className={cn("h-4 w-4", colors.icon)} />
                        </div>
                        <span className="text-foreground font-medium">{currentProgram.time}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg)}>
                          <MapPin className={cn("h-4 w-4", colors.icon)} />
                        </div>
                        <span className="text-foreground font-medium line-clamp-1">{currentProgram.location}</span>
                      </div>
                      
                      {currentProgram.speaker && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg)}>
                            <User className={cn("h-4 w-4", colors.icon)} />
                          </div>
                          <span className="text-foreground font-medium">{currentProgram.speaker}</span>
                        </div>
                      )}
                    </div>

                    {/* Slide Indicators */}
                    {sortedPrograms.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        {sortedPrograms.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300",
                              index === currentSlide 
                                ? "w-6 bg-primary" 
                                : "w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Navigation */}
            {sortedPrograms.length > 1 && (
              <div className="flex lg:hidden justify-center gap-3 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* All Programs Section */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-foreground">Tous les evenements</h2>
              <p className="text-sm text-muted-foreground mt-1">Decouvrez notre calendrier complet</p>
            </div>
            <Badge variant="secondary" className="hidden sm:flex">
              {sortedPrograms.length} evenement{sortedPrograms.length > 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedPrograms.map((program, index) => {
              const ProgramIcon = categoryIcons[program.category]
              const programColors = categoryColors[program.category]
              const dateInfo = formatShortDate(program.date)
              
              return (
                <Card 
                  key={program.id}
                  className={cn(
                    "overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-0 shadow-sm",
                    index === currentSlide && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => setCurrentSlide(index)}
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ 
                        backgroundImage: `url(${program.image || '/images/placeholder-event.jpg'})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Category Badge */}
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "absolute top-3 left-3 text-[10px] font-medium bg-white/95 backdrop-blur-sm border-0",
                        programColors.badge
                      )}
                    >
                      <ProgramIcon className="h-3 w-3 mr-1" />
                      {categoryLabels[program.category]}
                    </Badge>

                    {/* Date Badge */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center shadow-sm">
                      <p className="text-lg font-bold text-foreground leading-none">{dateInfo.day}</p>
                      <p className="text-[10px] font-medium text-muted-foreground">{dateInfo.month}</p>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {program.title}
                    </h3>
                    
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{program.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{program.location}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/50">
                      <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        Voir les details
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <Card className="border-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent overflow-hidden">
            <CardContent className="p-8 lg:p-12">
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Church className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 text-balance">
                  Restez informe de nos activites
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Rejoignez notre communaute et ne manquez aucun evenement. 
                  Nous serons ravis de vous accueillir.
                </p>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  <Bell className="h-4 w-4 mr-2" />
                  Nous contacter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
