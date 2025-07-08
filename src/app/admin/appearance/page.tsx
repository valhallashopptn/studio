
'use client';

import { useTheme, type ThemeName } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, Flame, Facebook, Instagram, Send } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type React from 'react';
import Image from 'next/image';
import { useContentSettings } from '@/hooks/use-content-settings';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormItem } from '@/components/ui/form';

const themes: { name: ThemeName; label: string; primary: string; accent: string; bg: string, font: string }[] = [
  { name: 'violet-fusion', label: 'Violet Fusion', primary: 'bg-[#7c3aed]', accent: 'bg-[#22d3ee]', bg: 'bg-[#0f172a]', font: 'font-sans' },
  { name: 'cyber-green', label: 'Cyber Green', primary: 'bg-[#16a34a]', accent: 'bg-[#4ade80]', bg: 'bg-[#0a0a0a]', font: 'font-mono' },
  { name: 'solar-flare', label: 'Solar Flare', primary: 'bg-[#f97316]', accent: 'bg-[#facc15]', bg: 'bg-[#1c1917]', font: 'font-sans' },
  { name: 'classic-light', label: 'Classic Light', primary: 'bg-[#1d4ed8]', accent: 'bg-[#22c55e]', bg: 'bg-white', font: 'font-sans' },
  { name: 'winter-wonderland', label: 'Winter Wonderland', primary: 'bg-[#0a749e]', accent: 'bg-[#ef4444]', bg: 'bg-[#f0f9ff]', font: 'font-sans' },
];

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-2.0441-.2733-4.2158-.2733-6.2599 0-.1636-.3847-.3973-.8742-.6082-1.2495a.0741.0741 0 00-.0785-.0371 19.7363 19.7363 0 00-4.8852 1.5152.069.069 0 00-.0321.0233C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0586c.2148.1354.4363.254.66.3615a.0751.0751 0 00.0776-.0206c.6776-.5545 1.133-1.2312 1.442-2.0022a.076.076 0 00-.0416-.1064c-.3997-.1582-.7882-.345-1.153-.56a.0726.0726 0 01.011-.0883c.311-.2411.6114-.492.896-.759a.0741.0741 0 01.0728-.011c3.9452 1.7646 8.18 1.7646 12.1252 0a.0741.0741 0 01.0727.011c.2847.267.585.5179.896.759a.0726.0726 0 01.011.0883c-.3648.214-.7533.4008-1.153.56a.076.076 0 00-.0416.1064c.309.7709.7644 1.4477 1.442 2.0022a.0751.0751 0 00.0776.0206c.2236-.1075.4451-.2261.66-.3615a.0824.0824 0 00.0312-.0586c.4182-4.4779-.4334-8.9808-2.3484-13.6647a.069.069 0 00-.032-.0233zM8.02 15.3312c-.7812 0-1.416-.6562-1.416-1.4655S7.2388 12.4 8.02 12.4s1.416.6562 1.416 1.4657-.6348 1.4655-1.416 1.4655zm7.96 0c-.7812 0-1.416-.6562-1.416-1.4655s.6348-1.4655 1.416-1.4655 1.416.6562 1.416 1.4657-.6348 1.4655-1.416 1.4655z"/>
    </svg>
);

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.84-.46-6.63-1.8-1.79-1.34-2.83-3.31-3.02-5.4-.28-3.08.38-6.19 2.13-8.81.91-1.36 2.15-2.5 3.59-3.29.13-.07.26-.15.39-.22.18-.1.36-.2.54-.29 1.1-.53 2.29-.83 3.49-1.02.01-.58-.01-1.16.01-1.74.02-1.58.01-3.16.01-4.74z"/>
    </svg>
);

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
    announcementText, setAnnouncementText,
    announcementEnabled, setAnnouncementEnabled,
    facebookUrl, setFacebookUrl,
    instagramUrl, setInstagramUrl,
    discordUrl, setDiscordUrl,
    tiktokUrl, setTiktokUrl,
    telegramUrl, setTelegramUrl,
    facebookIconUrl, setFacebookIconUrl,
    instagramIconUrl, setInstagramIconUrl,
    discordIconUrl, setDiscordIconUrl,
    tiktokIconUrl, setTiktokIconUrl,
    telegramIconUrl, setTelegramIconUrl,
  } = useContentSettings();


  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
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

  const handleSocialIconChange = (
    setter: (url: string) => void,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <CardTitle>Store Announcement</CardTitle>
              <CardDescription>Display a scrolling announcement bar at the top of your site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="announcement-enabled" 
                  checked={announcementEnabled}
                  onCheckedChange={setAnnouncementEnabled}
                />
                <Label htmlFor="announcement-enabled">Enable Announcement Bar</Label>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="announcement-text">Announcement Text</Label>
                  <Textarea 
                    id="announcement-text"
                    value={announcementText} 
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    disabled={!announcementEnabled}
                  />
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
                <p className="text-sm text-muted-foreground">{"Use `{{year}}` and `{{siteTitle}}` as placeholders."}</p>
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

      <Card>
        <CardHeader>
            <CardTitle>Social Media Links &amp; Icons</CardTitle>
            <CardDescription>Manage the links and icons that appear in your site's footer. Leave a URL blank to hide an icon.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                    {facebookIconUrl ? <Image src={facebookIconUrl} alt="Facebook" width={24} height={24} unoptimized/> : <Facebook className="h-6 w-6 text-muted-foreground" />}
                    <h4 className="font-semibold">Facebook</h4>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="facebook-url" className="text-xs">URL</Label>
                    <Input id="facebook-url" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/yourpage" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="facebook-icon-upload" className="text-xs">Custom Icon</Label>
                    <Input id="facebook-icon-upload" type="file" accept="image/*" onChange={(e) => handleSocialIconChange(setFacebookIconUrl, e)} className="file:text-primary file:font-semibold" />
                </div>
            </div>
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                    {instagramIconUrl ? <Image src={instagramIconUrl} alt="Instagram" width={24} height={24} unoptimized/> : <Instagram className="h-6 w-6 text-muted-foreground" />}
                    <h4 className="font-semibold">Instagram</h4>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="instagram-url" className="text-xs">URL</Label>
                    <Input id="instagram-url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/yourprofile" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="instagram-icon-upload" className="text-xs">Custom Icon</Label>
                    <Input id="instagram-icon-upload" type="file" accept="image/*" onChange={(e) => handleSocialIconChange(setInstagramIconUrl, e)} className="file:text-primary file:font-semibold" />
                </div>
            </div>
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                    {discordIconUrl ? <Image src={discordIconUrl} alt="Discord" width={24} height={24} unoptimized/> : <DiscordIcon className="h-6 w-6 text-muted-foreground fill-current" />}
                    <h4 className="font-semibold">Discord</h4>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="discord-url" className="text-xs">URL</Label>
                    <Input id="discord-url" value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} placeholder="https://discord.gg/yourserver" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="discord-icon-upload" className="text-xs">Custom Icon</Label>
                    <Input id="discord-icon-upload" type="file" accept="image/*" onChange={(e) => handleSocialIconChange(setDiscordIconUrl, e)} className="file:text-primary file:font-semibold" />
                </div>
            </div>
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                    {tiktokIconUrl ? <Image src={tiktokIconUrl} alt="TikTok" width={24} height={24} unoptimized/> : <TiktokIcon className="h-6 w-6 text-muted-foreground fill-current" />}
                    <h4 className="font-semibold">TikTok</h4>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="tiktok-url" className="text-xs">URL</Label>
                    <Input id="tiktok-url" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://tiktok.com/@yourusername" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="tiktok-icon-upload" className="text-xs">Custom Icon</Label>
                    <Input id="tiktok-icon-upload" type="file" accept="image/*" onChange={(e) => handleSocialIconChange(setTiktokIconUrl, e)} className="file:text-primary file:font-semibold" />
                </div>
            </div>
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                    {telegramIconUrl ? <Image src={telegramIconUrl} alt="Telegram" width={24} height={24} unoptimized/> : <Send className="h-6 w-6 text-muted-foreground" />}
                    <h4 className="font-semibold">Telegram</h4>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="telegram-url" className="text-xs">URL</Label>
                    <Input id="telegram-url" value={telegramUrl} onChange={(e) => setTelegramUrl(e.target.value)} placeholder="https://t.me/yourchannel" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="telegram-icon-upload" className="text-xs">Custom Icon</Label>
                    <Input id="telegram-icon-upload" type="file" accept="image/*" onChange={(e) => handleSocialIconChange(setTelegramIconUrl, e)} className="file:text-primary file:font-semibold" />
                </div>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
