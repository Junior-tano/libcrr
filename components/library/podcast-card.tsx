"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { Podcast } from "@/lib/types"
import { Download, Share2, Mic, Play, Pause, Volume2, VolumeX, X, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useAuthModal } from "@/components/library/auth-modal"
import { getAudioBlobUrl, isLocalAudio } from "@/lib/audio-storage"

interface PodcastCardProps {
  podcast: Podcast
}

export function PodcastCard({ podcast }: PodcastCardProps) {
  const { toast } = useToast()
  const { requireAuth } = useAuthModal()
  const [showPlayer, setShowPlayer] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // URL résolue : http(s) directe ou blob:// converti depuis IndexedDB
  const [resolvedUrl, setResolvedUrl] = useState<string>("")
  const [isResolvingUrl, setIsResolvingUrl] = useState(false)

  // Résoudre l'URL audio dès que le player s'ouvre
  useEffect(() => {
    if (!showPlayer || !podcast.audioUrl) return

    if (isLocalAudio(podcast.audioUrl)) {
      // Fichier stocké localement dans IndexedDB → convertir en blob://
      setIsResolvingUrl(true)
      getAudioBlobUrl(podcast.audioUrl)
        .then((blobUrl) => setResolvedUrl(blobUrl))
        .catch(() => {
          toast({
            title: "Fichier audio introuvable",
            description: "Le fichier audio local n'a pas pu être chargé.",
            variant: "destructive",
          })
          setResolvedUrl("")
        })
        .finally(() => setIsResolvingUrl(false))
    } else {
      // URL http(s) normale → utiliser directement
      setResolvedUrl(podcast.audioUrl)
    }
  }, [showPlayer, podcast.audioUrl, toast])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleError = () => {
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire ce fichier audio. Vérifiez que le backend est démarré.",
        variant: "destructive",
      })
      setIsPlaying(false)
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [showPlayer, toast])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: podcast.title,
          text: podcast.description,
          url: window.location.href,
        })
      } catch {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papier",
      })
    }
  }

  const togglePlay = () => {
    if (!audioRef.current || !resolvedUrl) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire l'audio. Vérifiez que le serveur backend est démarré.",
          variant: "destructive",
        })
      })
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return
    const newVolume = value[0]
    audioRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    if (isMuted) {
      audioRef.current.volume = volume || 0.7
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleListenClick = () => {
    requireAuth(() => {
      setShowPlayer(true)
    })
  }

  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const savedUser = localStorage.getItem("user")
    if (!savedUser) {
      e.preventDefault()
      requireAuth(() => {
        const link = document.createElement("a")
        link.href = resolvedUrl || podcast.audioUrl
        link.download = `${podcast.title}.mp3`
        link.click()
      })
    }
  }

  const handleClosePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
    setShowPlayer(false)
    setResolvedUrl("")
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 relative">
        {podcast.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={podcast.coverImage}
            alt={podcast.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Mic className="h-12 w-12 text-primary/30" />
          </div>
        )}
      </div>
      <CardContent className="p-3 space-y-2">
        <div>
          <h3 className="font-medium text-sm leading-tight line-clamp-1">{podcast.title}</h3>
          <p className="text-xs text-primary">{podcast.speaker}</p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" />
            {podcast.duration}
          </p>
        </div>

        {/* Audio Player Section */}
        {showPlayer && (
          <div className="bg-muted/60 rounded-lg p-3 space-y-2">
            {isResolvingUrl ? (
              <p className="text-xs text-muted-foreground text-center py-2">Chargement de l&apos;audio...</p>
            ) : resolvedUrl ? (
              <>
                <audio ref={audioRef} src={resolvedUrl} preload="metadata" />

                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="icon"
                    onClick={togglePlay}
                    className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>

                  <div className="flex-1 space-y-1 min-w-0">
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={1}
                      onValueChange={handleSeek}
                      className="cursor-pointer [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-7 w-7 shrink-0"
                  >
                    {isMuted ? (
                      <VolumeX className="h-3.5 w-3.5" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClosePlayer}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xs text-destructive">Fichier audio non disponible</p>
                <Button variant="ghost" size="icon" onClick={handleClosePlayer} className="h-7 w-7">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}

        <div className={cn("flex flex-col gap-1.5", showPlayer && "pt-1")}>
          {!showPlayer && (
            <Button
              variant="default"
              size="sm"
              className="w-full h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleListenClick}
              disabled={!podcast.audioUrl}
            >
              <Play className="h-3 w-3 mr-1.5" />
              {podcast.audioUrl ? "Ecouter" : "Aucun audio"}
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            className={cn(
              "w-full h-7 text-xs",
              showPlayer
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            onClick={handleShare}
          >
            <Share2 className="h-3 w-3 mr-1.5" />
            Partager
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs"
            asChild
          >
            <a href={resolvedUrl || podcast.audioUrl} download onClick={handleDownloadClick}>
              <Download className="h-3 w-3 mr-1.5" />
              Telecharger
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}