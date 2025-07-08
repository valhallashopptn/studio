
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ContentSettingsState = {
  // About Page
  aboutSubtitle: string;
  setAboutSubtitle: (text: string) => void;
  aboutStoryTitle: string;
  setAboutStoryTitle: (text: string) => void;
  aboutStoryText1: string;
  setAboutStoryText1: (text: string) => void;
  aboutStoryText2: string;
  setAboutStoryText2: (text: string) => void;
  aboutMissionTitle: string;
  setAboutMissionTitle: (text: string) => void;
  aboutMissionText: string;
  setAboutMissionText: (text: string) => void;
  aboutVisionTitle: string;
  setAboutVisionTitle: (text: string) => void;
  aboutVisionText: string;
  setAboutVisionText: (text:string) => void;
  aboutValuesTitle: string;
  setAboutValuesTitle: (text: string) => void;
  aboutValuesText: string;
  setAboutValuesText: (text: string) => void;
  
  // Contact Page
  contactSubtitle: string;
  setContactSubtitle: (text: string) => void;
  contactEmail: string;
  setContactEmail: (text: string) => void;
  contactPhone: string;
  setContactPhone: (text: string) => void;
  contactAddress: string;
  setContactAddress: (text: string) => void;

  // Announcement
  announcementText: string;
  setAnnouncementText: (text: string) => void;
  announcementEnabled: boolean;
  setAnnouncementEnabled: (enabled: boolean) => void;

  // Social Media Links
  facebookUrl: string;
  setFacebookUrl: (url: string) => void;
  instagramUrl: string;
  setInstagramUrl: (url: string) => void;
  discordUrl: string;
  setDiscordUrl: (url: string) => void;
  tiktokUrl: string;
  setTiktokUrl: (url: string) => void;
  telegramUrl: string;
  setTelegramUrl: (url: string) => void;

  // Social Media Icons
  facebookIconUrl: string;
  setFacebookIconUrl: (url: string) => void;
  instagramIconUrl: string;
  setInstagramIconUrl: (url: string) => void;
  discordIconUrl: string;
  setDiscordIconUrl: (url: string) => void;
  tiktokIconUrl: string;
  setTiktokIconUrl: (url: string) => void;
  telegramIconUrl: string;
  setTelegramIconUrl: (url: string) => void;
};

const defaultAboutSubtitle = "We are dedicated to providing a seamless and secure platform for all your digital top-up needs.";
const defaultAboutStoryTitle = "Our Story";
const defaultAboutStoryText1 = "Founded in {{year}}, {{siteTitle}} started with a simple idea: to make digital purchases easier and more accessible for everyone. We saw a need for a reliable platform where users could quickly top up game credits, buy subscriptions, and purchase digital gift cards without hassle.";
const defaultAboutStoryText2 = "Today, we've grown into a trusted marketplace, serving thousands of customers worldwide. Our commitment to security, speed, and customer satisfaction remains at the core of everything we do.";
const defaultAboutMissionTitle = "Our Mission";
const defaultAboutMissionText = "To provide the fastest, most secure, and user-friendly platform for digital goods and services.";
const defaultAboutVisionTitle = "Our Vision";
const defaultAboutVisionText = "To be the world's leading digital marketplace, connecting users with the products they love, instantly.";
const defaultAboutValuesTitle = "Our Values";
const defaultAboutValuesText = "Customer-centricity, integrity, and innovation drive us forward every day.";

const defaultContactSubtitle = "Have questions or feedback? We'd love to hear from you.";
const defaultContactEmail = "support@topuphub.com";
const defaultContactPhone = "+1 (555) 123-4567";
const defaultContactAddress = "123 Digital Lane, Tech City, 12345";
const defaultAnnouncementText = "🎉 New products added! Check out our latest game top-ups and digital gift cards. Limited time offers available!";

const defaultFacebookUrl = "https://facebook.com";
const defaultInstagramUrl = "https://instagram.com";
const defaultDiscordUrl = "https://discord.com";
const defaultTiktokUrl = "https://tiktok.com";
const defaultTelegramUrl = "https://telegram.org";


export const useContentSettings = create(
  persist<ContentSettingsState>(
    (set) => ({
      aboutSubtitle: defaultAboutSubtitle,
      setAboutSubtitle: (text) => set({ aboutSubtitle: text }),
      aboutStoryTitle: defaultAboutStoryTitle,
      setAboutStoryTitle: (text) => set({ aboutStoryTitle: text }),
      aboutStoryText1: defaultAboutStoryText1,
      setAboutStoryText1: (text) => set({ aboutStoryText1: text }),
      aboutStoryText2: defaultAboutStoryText2,
      setAboutStoryText2: (text) => set({ aboutStoryText2: text }),
      aboutMissionTitle: defaultAboutMissionTitle,
      setAboutMissionTitle: (text) => set({ aboutMissionTitle: text }),
      aboutMissionText: defaultAboutMissionText,
      setAboutMissionText: (text) => set({ aboutMissionText: text }),
      aboutVisionTitle: defaultAboutVisionTitle,
      setAboutVisionTitle: (text) => set({ aboutVisionTitle: text }),
      aboutVisionText: defaultAboutVisionText,
      setAboutVisionText: (text) => set({ aboutVisionText: text }),
      aboutValuesTitle: defaultAboutValuesTitle,
      setAboutValuesTitle: (text) => set({ aboutValuesTitle: text }),
      aboutValuesText: defaultAboutValuesText,
      setAboutValuesText: (text) => set({ aboutValuesText: text }),

      contactSubtitle: defaultContactSubtitle,
      setContactSubtitle: (text) => set({ contactSubtitle: text }),
      contactEmail: defaultContactEmail,
      setContactEmail: (text) => set({ contactEmail: text }),
      contactPhone: defaultContactPhone,
      setContactPhone: (text) => set({ contactPhone: text }),
      contactAddress: defaultContactAddress,
      setContactAddress: (text) => set({ contactAddress: text }),

      announcementText: defaultAnnouncementText,
      setAnnouncementText: (text) => set({ announcementText: text }),
      announcementEnabled: true,
      setAnnouncementEnabled: (enabled) => set({ announcementEnabled: enabled }),

      // Social Media Links
      facebookUrl: defaultFacebookUrl,
      setFacebookUrl: (url) => set({ facebookUrl: url }),
      instagramUrl: defaultInstagramUrl,
      setInstagramUrl: (url) => set({ instagramUrl: url }),
      discordUrl: defaultDiscordUrl,
      setDiscordUrl: (url) => set({ discordUrl: url }),
      tiktokUrl: defaultTiktokUrl,
      setTiktokUrl: (url) => set({ tiktokUrl: url }),
      telegramUrl: defaultTelegramUrl,
      setTelegramUrl: (url) => set({ telegramUrl: url }),

      // Social Media Icons
      facebookIconUrl: '',
      setFacebookIconUrl: (url) => set({ facebookIconUrl: url }),
      instagramIconUrl: '',
      setInstagramIconUrl: (url) => set({ instagramIconUrl: url }),
      discordIconUrl: '',
      setDiscordIconUrl: (url) => set({ discordIconUrl: url }),
      tiktokIconUrl: '',
      setTiktokIconUrl: (url) => set({ tiktokIconUrl: url }),
      telegramIconUrl: '',
      setTelegramIconUrl: (url) => set({ telegramIconUrl: url }),
    }),
    {
      name: 'topup-hub-content-settings',
    }
  )
);
