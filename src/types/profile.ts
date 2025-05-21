export interface ProfileData {
  displayName: string;
  alias: string;
  uid: string;
  bio?: string;
  location?: string;
  embeds?: Embed[]
  website?: string;
  phoneNumber?: string;
}

export interface Embed {
  url: string;
  title: string;
  description: string;
  image?: string;
  type: "link" | "spotify" | "youtube";
}

export interface ChatProfileData extends ProfileData {
  photoURL?: string;
  verified?: boolean;
  followers?: string[];
  following?: string[];
}

export interface ServerProfileData extends ProfileData {
  __lastAliasChanged?: number;
}

export interface ServerChatProfileData
  extends ServerProfileData,
    ChatProfileData {}
