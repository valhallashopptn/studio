
'use client';

import { useTheme, type ThemeName } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, Flame } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type React from 'react';
import Image from 'next/image';
import { useContentSettings } from '@/hooks/use-content-settings';
import { Textarea } from '@/components/ui/textarea';

const themes: { name: ThemeName; label: string; primary: string; accent: string; bg: string, font: string }[] = [
  { name: 'violet-fusion', label: 'Violet Fusion', primary: 'bg-[#7c3aed]', accent: 'bg-[#22d3ee]', bg: 'bg-[#0f172a]', font: 'font-sans' },
  { name: 'cyber-green', label: 'Cyber Green', primary: 'bg-[#16a34a]', accent: 'bg-[#4ade80]', bg: 'bg-[#0a0a0a]', font: 'font-mono' },
  { name: 'solar-flare', label: 'Solar Flare', primary: 'bg-[#f97316]', accent: 'bg-[#facc15]', bg: 'bg-[#1c1917]', font: 'font-sans' },
  { name: 'classic-light', label: 'Classic Light', primary: 'bg-[#1d4ed8]', accent: 'bg-[#22c55e]', bg: 'bg-white', font: 'font-sans' },
];

export default function AdminAppearancePage() {
  const { theme, setTheme } = useTheme();
  const { heroImageUrl, setHeroImageUrl, logoUrl, setLogoUrl, siteTitle, setSiteTitle } = useSiteSettings();
  const {
    aboutSubtitle, setAboutSubtitle,
    aboutStoryTitle, setAboutStoryTitle,
    aboutStoryText1, setAboutStoryText1,
    aboutStoryText2, setAboutStoryText2,
    aboutMissionTitle, setAboutMissionTitle,
    aboutMissionText, setAboutMissionText,
    aboutVisionTitle, setAboutVisionTitle,
    aboutVisionText, setAboutVisionText,
    aboutValuesTitle, setAboutValuesTitle,
    aboutValuesText, setAboutValuesText,
    contactSubtitle, setContactSubtitle,
    contactEmail, setContactEmail,
    contactPhone, setContactPhone,
    contactAddress, setContactAddress,
  } = useContentSettings();


  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result will be a Data URL string
        if (typeof reader.result === 'string') {
          setHeroImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Appearance</h1>
        <p className="text-muted-foreground">Customize the look and feel of your application.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Theme</CardTitle>
          <CardDescription>
            Select a theme to change the color palette and typography across the entire application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {themes.map((t) => (
              <div key={t.name}>
                <button
                  onClick={() => setTheme(t.name)}
                  className={cn(
                    "w-full rounded-lg border-2 p-4 text-left transition-all",
                    theme === t.name ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">{t.label}</h3>
                    {theme === t.name && <CheckCircle className="h-6 w-6 text-accent" />}
                  </div>
                  <div className="flex items-center gap-2 p-4 rounded-md bg-muted/30">
                     <div className="w-10 h-10 rounded-full" style={{ backgroundColor: t.primary.replace('bg-', '') }}></div>
                     <div className="w-8 h-8 rounded-full" style={{ backgroundColor: t.accent.replace('bg-', '') }}></div>
                     <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.bg.replace('bg-', '') }}></div>
                     <div className="flex-grow text-right">
                        <p className={cn("text-lg", t.font)}>Aa</p>
                     </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Customize your application's logo and site title. This appears in the header and browser tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-2 p-4 rounded-md border bg-muted/30 w-fit">
              {logoUrl ? (
                 <Image src={logoUrl} alt="Logo preview" width={40} height={40} className="rounded-sm" unoptimized={logoUrl.startsWith('data:image')} />
              ) : (
                <Flame className="h-10 w-10 text-primary" />
              )}
               <h1 className="text-xl font-bold font-headline">{siteTitle}</h1>
            </div>
          </div>
           <div className="space-y-2">
                <Label htmlFor="site-title">Site Title</Label>
                <Input
                id="site-title"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="Your App Name"
                />
            </div>

          <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Logo</span></div></div>
          
          <div className="space-y-2">
            <Label htmlFor="logo-image-url">Logo Image URL (Recommended size: 40x40px)</Label>
            <Input
              id="logo-image-url"
              value={logoUrl.startsWith('data:image') ? '' : logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/your-logo.png"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo-image-upload">Upload Logo</Label>
            <Input id="logo-image-upload" type="file" accept="image/*" onChange={handleLogoFileChange} className="file:text-primary file:font-semibold" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Hero</CardTitle>
          <CardDescription>
            Change the background image for the hero section on your homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hero-image-url">Background Image URL (Recommended)</Label>
            <Input
              id="hero-image-url"
              value={heroImageUrl.startsWith('data:image') ? '' : heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://example.com/your-image.png"
            />
            <p className="text-sm text-muted-foreground">
              For best performance, upload your image to a hosting service and paste the URL here.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                Or
                </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero-image-upload">Upload an Image</Label>
            <Input
              id="hero-image-upload"
              type="file"
              accept="image/*"
              onChange={handleHeroFileChange}
              className="file:text-primary file:font-semibold"
            />
            <p className="text-sm text-muted-foreground">
              Images are stored in your browser which can impact performance.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>About Page Content</CardTitle>
            <CardDescription>Customize the text on your "About Us" page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input value={aboutSubtitle} onChange={(e) => setAboutSubtitle(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>Story Title</Label>
                <Input value={aboutStoryTitle} onChange={(e) => setAboutStoryTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>Story Text 1</Label>
                <Textarea value={aboutStoryText1} onChange={(e) => setAboutStoryText1(e.target.value)} rows={4} />
                <p className="text-sm text-muted-foreground">Use `{{year}}` and `{{siteTitle}}` as placeholders.</p>
            </div>
            <div className="space-y-2">
                <Label>Story Text 2</Label>
                <Textarea value={aboutStoryText2} onChange={(e) => setAboutStoryText2(e.target.value)} rows={3} />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Mission Title</Label>
                    <Input value={aboutMissionTitle} onChange={(e) => setAboutMissionTitle(e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label>Mission Text</Label>
                    <Input value={aboutMissionText} onChange={(e) => setAboutMissionText(e.target.value)} />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Vision Title</Label>
                    <Input value={aboutVisionTitle} onChange={(e) => setAboutVisionTitle(e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label>Vision Text</Label>
                    <Input value={aboutVisionText} onChange={(e) => setAboutVisionText(e.target.value)} />
                </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Values Title</Label>
                    <Input value={aboutValuesTitle} onChange={(e) => setAboutValuesTitle(e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label>Values Text</Label>
                    <Input value={aboutValuesText} onChange={(e) => setAboutValuesText(e.target.value)} />
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Contact Page Content</CardTitle>
              <CardDescription>Customize the text and contact details on your "Contact Us" page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input value={contactSubtitle} onChange={(e) => setContactSubtitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label>Contact Address</Label>
                  <Input value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} />
              </div>
          </CardContent>
      </Card>


    </div>
  );
}
