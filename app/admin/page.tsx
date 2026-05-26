"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Image as ImageIcon,
  Eye,
  EyeOff,
  GripVertical,
  Sparkles,
  X,
  HelpCircle,
  Upload,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import type { HeroSlide } from "@/lib/types"
import { cn } from "@/lib/utils"

// ─── Constante URL de base de l'API ───────────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"

// ─── Fonction d'upload d'image vers le backend ────────────────────────────────
// CORRECTION : on n'envoie plus le base64 en JSON.
// On utilise FormData + multipart/form-data vers /api/uploads/images,
// qui retourne { url: "http://..." }. Seule cette URL courte est stockée en DB.
async function uploadImageToServer(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("image", file)

  const response = await fetch(`${API_BASE_URL}/uploads/images`, {
    method: "POST",
    body: formData,
    // NE PAS mettre Content-Type ici : le navigateur le définit automatiquement
    // avec le boundary correct pour multipart/form-data.
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message ?? `Erreur upload image : ${response.status}`)
  }

  const data = await response.json()
  return data.url as string
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AdminHeroPage() {
  const { heroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide, toggleHeroSlideActive, loadApiData } = useStore()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null)

  // imageFile : fichier sélectionné mais pas encore uploadé
  const [imageFile, setImageFile] = useState<File | null>(null)
  // imagePreviewUrl : URL locale (createObjectURL) pour l'aperçu uniquement
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("")
  // isUploadingImage : indicateur pendant l'upload vers le serveur
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  // uploadError : message d'erreur spécifique à l'upload
  const [uploadError, setUploadError] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",        // ← contiendra l'URL finale retournée par le backend
    buttonText: "",
    buttonLink: "",
    isActive: true
  })

  // ─── Reset complet du formulaire ──────────────────────────────────────────
  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      image: "",
      buttonText: "",
      buttonLink: "",
      isActive: true
    })
    setEditingSlide(null)
    setImageFile(null)
    setImagePreviewUrl("")
    setUploadError("")
    setSubmitError("")
  }

  // ─── Sélection du fichier image ───────────────────────────────────────────
  // CORRECTION : on ne convertit plus en base64.
  // On stocke le File pour l'uploader au moment du submit,
  // et on crée une URL locale uniquement pour l'aperçu visuel.
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Valider la taille côté client (max 4 Mo)
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("L'image ne doit pas dépasser 4 Mo.")
      return
    }

    setUploadError("")
    setImageFile(file)

    // Libérer l'ancienne URL objet si elle existe
    if (imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl)
    }

    // Créer une URL locale pour l'aperçu (jamais envoyée en DB)
    setImagePreviewUrl(URL.createObjectURL(file))

    // Effacer l'URL manuelle si l'utilisateur choisit un fichier
    setFormData(prev => ({ ...prev, image: "" }))
  }

  // ─── Validation du formulaire ─────────────────────────────────────────────
  const isFormValid =
    formData.title.trim().length > 0 &&
    formData.description.trim().length > 0

  // ─── Soumission ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError("")
    setUploadError("")

    try {
      // Étape 1 : si un fichier a été sélectionné, l'uploader d'abord
      let finalImageUrl = formData.image.trim()

      if (imageFile) {
        setIsUploadingImage(true)
        try {
          finalImageUrl = await uploadImageToServer(imageFile)
        } catch (uploadErr) {
          const msg = uploadErr instanceof Error ? uploadErr.message : "Erreur lors de l'upload de l'image"
          setUploadError(msg)
          setIsSubmitting(false)
          setIsUploadingImage(false)
          return
        } finally {
          setIsUploadingImage(false)
        }
      }

      // Étape 2 : créer ou mettre à jour le slide avec l'URL de l'image
      const slideData = {
        title:       formData.title.trim(),
        subtitle:    formData.subtitle.trim(),
        description: formData.description.trim(),
        image:       finalImageUrl || undefined,
        buttonText:  formData.buttonText.trim() || undefined,
        buttonLink:  formData.buttonLink.trim() || undefined,
        isActive:    formData.isActive,
      }

      if (editingSlide) {
        await updateHeroSlide(editingSlide.id, slideData)
      } else {
        await addHeroSlide(slideData)
      }

      await loadApiData()
      setIsSheetOpen(false)
      resetForm()

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Impossible d'enregistrer le slide")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Édition d'un slide existant ──────────────────────────────────────────
  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setFormData({
      title:      slide.title,
      subtitle:   slide.subtitle,
      description: slide.description,
      image:      slide.image || "",
      buttonText: slide.buttonText || "",
      buttonLink: slide.buttonLink || "",
      isActive:   slide.isActive
    })
    // Pas de nouveau fichier sélectionné : on affiche l'URL existante dans le champ texte
    setImageFile(null)
    setImagePreviewUrl(slide.image || "")
    setIsSheetOpen(true)
  }

  // ─── Suppression ──────────────────────────────────────────────────────────
  const handleDeleteClick = (slide: HeroSlide) => {
    setSlideToDelete(slide)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (slideToDelete) {
      deleteHeroSlide(slideToDelete.id)
      setDeleteDialogOpen(false)
      setSlideToDelete(null)
    }
  }

  const activeSlides = heroSlides.filter(s => s.isActive).length

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hero Section</h1>
          <p className="text-muted-foreground">
            Gérez les slides de la section hero de la page d&apos;accueil
          </p>
        </div>
        <Button
          onClick={() => setIsSheetOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un slide
        </Button>
      </div>

      {/* ── Form Sheet ────────────────────────────────────────────────────── */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open)
        if (!open) resetForm()
      }}>
        <SheetContent showCloseButton={false} className="w-full sm:max-w-xl p-0 shadow-2xl rounded-3xl overflow-hidden flex flex-col">
          <div className="flex flex-col min-h-0 flex-1">

            {/* Header du panneau */}
            <div className="flex items-start justify-between p-6 border-b bg-background shrink-0">
              <div className="space-y-1 pr-8">
                <SheetTitle className="text-xl font-semibold text-foreground">
                  {editingSlide ? "Modifier le slide" : "Ajouter un nouveau slide"}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  Remplissez les informations du slide hero
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsSheetOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Contenu du formulaire */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <form id="hero-form" onSubmit={handleSubmit} className="space-y-6">

                {/* ── Textes ──────────────────────────────────────────────── */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                    Textes du slide
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Titre <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Bienvenue dans notre Librairie"
                        className="bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                        required
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="subtitle" className="text-sm font-medium">
                        Sous-titre
                      </Label>
                      <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                        placeholder="Centre Chrétien de Réveil"
                        className="bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Découvrez des enseignements et ressources pour votre édification..."
                        rows={3}
                        className="bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ── Image de fond ───────────────────────────────────────── */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                    Image de fond
                  </h3>

                  <div className="space-y-3">
                    {/* Zone de dépôt / sélection de fichier */}
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-4 text-center hover:border-primary/50 transition-colors bg-muted/30">
                      <Input
                        id="imageFile"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleImageFileChange}
                        className="hidden"
                        // Désactivé pendant l'upload ou la soumission
                        disabled={isUploadingImage || isSubmitting}
                      />
                      <label htmlFor="imageFile" className="cursor-pointer block">
                        {imageFile ? (
                          /* Aperçu du fichier sélectionné */
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-14 bg-background rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              <img
                                src={imagePreviewUrl}
                                alt="Aperçu"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-left flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{imageFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {isUploadingImage
                                  ? "Upload en cours…"
                                  : "Cliquez pour changer"}
                              </p>
                              {/* Indicateur d'upload */}
                              {isUploadingImage && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                  <span className="text-xs text-primary">Envoi de l&apos;image…</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : imagePreviewUrl && !imagePreviewUrl.startsWith("blob:") ? (
                          /* Aperçu de l'URL existante (mode édition) */
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-14 bg-background rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              <img
                                src={imagePreviewUrl}
                                alt="Image actuelle"
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                              />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                <p className="text-sm font-medium text-foreground">Image actuelle</p>
                              </div>
                              <p className="text-xs text-muted-foreground">Cliquez pour remplacer</p>
                            </div>
                          </div>
                        ) : (
                          /* Placeholder vide */
                          <div className="py-4">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground/50" />
                            <p className="text-sm mt-2 text-muted-foreground">
                              Glissez une image ou{" "}
                              <span className="text-primary font-medium">parcourir</span>
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              JPG, PNG, WebP — max 4 Mo — Recommandé : 1920×1080
                            </p>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Erreur d'upload */}
                    {uploadError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <X className="h-3 w-3" /> {uploadError}
                      </p>
                    )}

                    {/* Champ URL manuelle (alternatif au fichier) */}
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl" className="text-sm font-medium">
                        Ou entrez une URL d&apos;image
                      </Label>
                      <Input
                        id="imageUrl"
                        value={imageFile ? "" : formData.image}
                        onChange={(e) => {
                          // Si l'utilisateur tape une URL, on annule le fichier sélectionné
                          if (imageFile) {
                            setImageFile(null)
                            if (imagePreviewUrl.startsWith("blob:")) {
                              URL.revokeObjectURL(imagePreviewUrl)
                            }
                            setImagePreviewUrl("")
                          }
                          setFormData({...formData, image: e.target.value})
                        }}
                        placeholder="/images/hero-1.jpg ou https://example.com/image.jpg"
                        className="bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                        disabled={!!imageFile}
                      />
                      {imageFile && (
                        <p className="text-xs text-muted-foreground">
                          Un fichier est sélectionné — supprimez-le pour saisir une URL manuellement.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Bouton CTA ──────────────────────────────────────────── */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                    Bouton d&apos;action (optionnel)
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="buttonText" className="text-sm font-medium">
                        Texte du bouton
                      </Label>
                      <Input
                        id="buttonText"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                        placeholder="Explorer les podcasts"
                        className="bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buttonLink" className="text-sm font-medium">
                        Lien du bouton
                      </Label>
                      <Input
                        id="buttonLink"
                        value={formData.buttonLink}
                        onChange={(e) => setFormData({...formData, buttonLink: e.target.value})}
                        placeholder="/podcasts"
                        className="bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Visibilité ──────────────────────────────────────────── */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                    Visibilité
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                        Slide actif
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Le slide sera affiché dans le carrousel
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                  </div>
                </div>

                {/* Erreur de soumission */}
                {submitError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="h-4 w-4" /> {submitError}
                  </p>
                )}

              </form>
            </div>

            {/* Footer du panneau */}
            <div className="border-t p-4 bg-muted/30 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <span>Besoin d&apos;aide ?</span>
                  <button type="button" className="text-primary hover:underline">
                    Cliquez ici
                  </button>
                </div>
                <Button
                  type="submit"
                  form="hero-form"
                  disabled={!isFormValid || isSubmitting || isUploadingImage}
                  className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white px-6 gap-2"
                >
                  {(isSubmitting || isUploadingImage) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isUploadingImage
                    ? "Upload image…"
                    : isSubmitting
                    ? "Enregistrement…"
                    : editingSlide
                    ? "Enregistrer les modifications"
                    : "Ajouter le slide"}
                </Button>
              </div>
            </div>

          </div>
        </SheetContent>
      </Sheet>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{heroSlides.length}</p>
                <p className="text-sm text-muted-foreground">Total slides</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSlides}</p>
                <p className="text-sm text-muted-foreground">Slides actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">10s</p>
                <p className="text-sm text-muted-foreground">Intervalle auto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Liste des slides ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des slides</CardTitle>
          <CardDescription>
            Les slides actifs défileront automatiquement toutes les 10 secondes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {heroSlides.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Aucun slide</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par ajouter un slide pour la hero section
              </p>
              <Button onClick={() => setIsSheetOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un slide
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {heroSlides.map((slide) => (
                <div
                  key={slide.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                    slide.isActive ? "bg-card" : "bg-muted/50 opacity-60"
                  )}
                >
                  <div className="shrink-0 text-muted-foreground cursor-grab">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Miniature */}
                  <div className="w-32 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                    {slide.image ? (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{slide.title}</h3>
                      {!slide.isActive && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Masqué</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{slide.subtitle}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {slide.description}
                    </p>
                    {slide.buttonText && (
                      <p className="text-xs text-primary mt-2">
                        Bouton : {slide.buttonText} → {slide.buttonLink}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleHeroSlideActive(slide.id)}
                      title={slide.isActive ? "Masquer" : "Afficher"}
                      className="h-8 w-8"
                    >
                      {slide.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(slide)}
                      className="h-8 w-8 hover:bg-primary/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(slide)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Dialog de suppression ────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
              <rect x="18" y="26" width="44" height="46" rx="5" fill="#DBEAFE" stroke="#2563eb" strokeWidth="2.5" />
              <rect x="14" y="20" width="52" height="8" rx="4" fill="#93C5FD" stroke="#2563eb" strokeWidth="2.5" />
              <line x1="30" y1="20" x2="30" y2="17" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="40" y1="20" x2="40" y2="15" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="50" y1="20" x2="50" y2="17" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="28" y="15" width="24" height="6" rx="3" fill="#93C5FD" stroke="#2563eb" strokeWidth="2" />
              <line x1="30" y1="33" x2="30" y2="63" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="40" y1="33" x2="40" y2="63" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="50" y1="33" x2="50" y2="63" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="58" cy="22" r="10" fill="#EF4444" />
              <text x="58" y="27" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">!</text>
            </svg>
          </div>

          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-center">
              Voulez-vous supprimer le slide &quot;{slideToDelete?.title}&quot; ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Cette action est irréversible. Voulez-vous vraiment supprimer cet élément ?
              Aucune récupération ne sera possible après validation.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <hr className="my-4" />

          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="w-full border border-red-500 bg-transparent text-red-500 hover:bg-red-50"
            >
              Supprimer définitivement
            </AlertDialogAction>
            <AlertDialogCancel className="w-full border-none bg-transparent text-red-500 hover:bg-transparent hover:text-red-600 mt-0">
              Annuler la suppression
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}