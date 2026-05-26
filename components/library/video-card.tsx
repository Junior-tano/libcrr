"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Video } from "@/lib/types"
import { Play, Share2, Video as VideoIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthModal } from "@/components/library/auth-modal"

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const { requireAuth } = useAuthModal()

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        })
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Lien copie",
        description: "Le lien a ete copie dans le presse-papier",
      })
    }
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    requireAuth(() => {
      setIsOpen(true)
    })
  }

  const handleCardClick = () => {
    requireAuth(() => {
      setIsOpen(true)
    })
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="aspect-square bg-gradient-to-br from-secondary/20 to-secondary/5 relative group cursor-pointer" onClick={handleCardClick}>
          {video.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnail}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoIcon className="h-12 w-12 text-secondary/30" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
            </div>
          </div>
        </div>
        <CardContent className="p-3 space-y-2">
          <div>
            <h3 className="font-medium text-sm leading-tight line-clamp-1">{video.title}</h3>
            <p className="text-xs text-primary">{video.speaker}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Button 
              variant="default"
              size="sm"
              className="w-full h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleShare}
            >
              <Share2 className="h-3 w-3 mr-1.5" />
              Partager
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-7 text-xs"
              onClick={handlePlay}
            >
              <Play className="h-3 w-3 mr-1.5" />
              Regarder
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{video.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-foreground/5 rounded-lg overflow-hidden">
              {video.youtubeUrl ? (
                <iframe
                  src={video.youtubeUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Video non disponible</p>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">{video.description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
