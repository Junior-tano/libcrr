"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  Church,
  MessageSquare,
  CheckCircle,
  Facebook,
  Youtube
} from "lucide-react"
import { cn } from "@/lib/utils"

const contactSubjects = [
  { value: "priere", label: "Demande de priere" },
  { value: "counseling", label: "Counseling pastoral" },
  { value: "information", label: "Informations generales" },
  { value: "temoignage", label: "Partager un temoignage" },
  { value: "don", label: "Faire un don" },
  { value: "autre", label: "Autre" },
]

export default function ContactPage() {
  const { siteSettings, addContactMessage } = useStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    addContactMessage({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      subject: formData.subject,
      message: formData.message
    })
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after delay
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
      setIsSubmitted(false)
    }, 5000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 blur-[180px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[150px] rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-background/60 border border-border shadow-sm backdrop-blur-md text-muted-foreground mb-6">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium tracking-wide">Contactez-nous</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Nous sommes la pour <span className="text-primary">vous accompagner</span>
            </h1>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Que vous ayez besoin de priere, de conseils pastoraux ou simplement d&apos;informations, 
              n&apos;hesitez pas a nous contacter. Notre equipe est disponible pour vous ecouter et vous aider.
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Info & Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Cards */}
              <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
                <CardContent className="p-6 space-y-6">
                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Telephone</h3>
                      <a 
                        href={`tel:${siteSettings.contactPhone}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {siteSettings.contactPhone}
                      </a>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a 
                        href={`mailto:${siteSettings.contactEmail}`}
                        className="text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        {siteSettings.contactEmail}
                      </a>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Adresse</h3>
                      <p className="text-muted-foreground">
                        Temple Principal CCR<br />
                        Quartier Zongo<br />
                        Cotonou, Benin
                      </p>
                    </div>
                  </div>
                  
                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Horaires d&apos;accueil</h3>
                      <p className="text-muted-foreground">
                        Lundi - Vendredi: 8h - 17h<br />
                        Samedi: 9h - 12h
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Service Hours */}
              <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Church className="h-5 w-5 text-primary" />
                    Horaires des cultes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Dimanche</span>
                    <span className="font-medium">9h00 & 11h00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Mercredi</span>
                    <span className="font-medium">18h00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Vendredi (Jeunes)</span>
                    <span className="font-medium">18h00</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Social Links */}
              <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Suivez-nous</CardTitle>
                  <CardDescription>
                    Restez connectes avec notre communaute
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <a 
                      href="#" 
                      className="w-12 h-12 rounded-xl bg-[#1877f2]/10 flex items-center justify-center hover:bg-[#1877f2]/20 transition-colors"
                    >
                      <Facebook className="h-5 w-5 text-[#1877f2]" />
                    </a>
                    <a 
                      href="#" 
                      className="w-12 h-12 rounded-xl bg-[#ff0000]/10 flex items-center justify-center hover:bg-[#ff0000]/20 transition-colors"
                    >
                      <Youtube className="h-5 w-5 text-[#ff0000]" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et nous vous repondrons dans les plus brefs delais.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Message envoye avec succes !</h3>
                      <p className="text-muted-foreground">
                        Merci de nous avoir contactes. Notre equipe vous repondra tres bientot.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom complet *</Label>
                          <Input
                            id="name"
                            placeholder="Votre nom"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            className="h-12"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="votre@email.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                            className="h-12"
                          />
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telephone (optionnel)</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+229 00 00 00 00"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="h-12"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="subject">Sujet *</Label>
                          <Select 
                            value={formData.subject} 
                            onValueChange={(value) => handleChange('subject', value)}
                            required
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Selectionnez un sujet" />
                            </SelectTrigger>
                            <SelectContent>
                              {contactSubjects.map((subject) => (
                                <SelectItem key={subject.value} value={subject.value}>
                                  {subject.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Decrivez votre demande ou votre besoin..."
                          value={formData.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          required
                          rows={6}
                          className="resize-none"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full sm:w-auto px-8"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin mr-2">
                              <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            </span>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Notre emplacement</h2>
            <p className="text-muted-foreground">Retrouvez-nous au Temple Principal CCR</p>
          </div>
          
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="h-[400px] bg-muted flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Temple Principal CCR</h3>
                <p className="text-muted-foreground mb-4">
                  Quartier Zongo, Cotonou, Benin
                </p>
                <Button variant="outline" asChild>
                  <a 
                    href="https://maps.google.com/?q=Cotonou+Benin" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Ouvrir dans Google Maps
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
