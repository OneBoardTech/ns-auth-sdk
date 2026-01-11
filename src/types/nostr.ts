/**
 * Nostr event types
 */
export interface NostrEvent {
  id?: string;
  pubkey?: string;
  created_at?: number;
  kind: number;
  tags?: string[][];
  content: string;
  sig?: string;
}

/**
 * Profile metadata (Kind 0)
 */
export interface ProfileMetadata {
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  website?: string;
  [key: string]: unknown;
}

/**
 * Follow list entry (from Kind 3 tags)
 */
export interface FollowEntry {
  pubkey: string;
  relay?: string;
  petname?: string;
}

