import type { EventStore } from 'applesauce-core';
import type { NostrEvent } from '../types/nostr';
import type { ProfileMetadata, FollowEntry } from '../types/nostr';
import type { RelayServiceConfig } from '../types/auth';

/**
 * Service for communicating with Nostr relays using applesauce-core
 */
export class RelayService {
  private eventStore: EventStore | null = null;
  private relayUrls: string[];
  private defaultRelays = ['wss://relay.damus.io'];

  constructor(config: RelayServiceConfig = {}) {
    this.relayUrls = config.relayUrls || this.defaultRelays;
  }

  /**
   * Initialize with applesauce EventStore
   */
  initialize(eventStore: EventStore): void {
    this.eventStore = eventStore;
    // Set default relays if EventStore has a method for it
    if (eventStore && 'setRelays' in eventStore && typeof eventStore.setRelays === 'function') {
      (eventStore as any).setRelays(this.relayUrls);
    }
  }

  /**
   * Set relay URLs
   */
  setRelays(urls: string[]): void {
    this.relayUrls = urls;
    if (this.eventStore && 'setRelays' in this.eventStore && typeof this.eventStore.setRelays === 'function') {
      (this.eventStore as any).setRelays(urls);
    }
  }

  /**
   * Publish an event to relays
   */
  async publishEvent(event: NostrEvent, timeoutMs = 1000): Promise<boolean> {
    if (!this.eventStore) {
      throw new Error('RelayService not initialized. Call initialize() with an EventStore instance.');
    }

    return new Promise((resolve, reject) => {
      if (this.relayUrls.length === 0) {
        reject(new Error('No relays configured'));
        return;
      }

      // Use EventStore's publish method
      // Note: This is a simplified implementation - actual applesauce API may differ
      const eventStore = this.eventStore as any;
      if (!eventStore || typeof eventStore.publish !== 'function') {
        reject(new Error('EventStore does not support publish method'));
        return;
      }
      const subscription = eventStore.publish(event).subscribe({
        next: (response: any) => {
          if (response?.type === 'OK') {
            subscription.unsubscribe();
            resolve(true);
          }
        },
        error: (error: Error) => {
          subscription.unsubscribe();
          reject(error);
        },
      });

      // Timeout fallback
      setTimeout(() => {
        subscription.unsubscribe();
        resolve(false);
      }, timeoutMs);
    });
  }

  /**
   * Fetch a profile (Kind 0 event)
   */
  async fetchProfile(pubkey: string): Promise<ProfileMetadata | null> {
    if (!this.eventStore) {
      throw new Error('RelayService not initialized. Call initialize() with an EventStore instance.');
    }

    return new Promise((resolve) => {
      const filter = {
        kinds: [0],
        authors: [pubkey],
        limit: 1,
      };

      const eventStore = this.eventStore as any;
      if (!eventStore || typeof eventStore.query !== 'function') {
        resolve(null);
        return;
      }
      const subscription = eventStore.query(filter).subscribe({
        next: (packet: any) => {
          if (packet?.event && packet.event.kind === 0) {
            try {
              const metadata = JSON.parse(packet.event.content) as ProfileMetadata;
              subscription.unsubscribe();
              resolve(metadata);
            } catch (error) {
              console.error('Failed to parse profile metadata:', error);
            }
          }
        },
        complete: () => {
          subscription.unsubscribe();
          resolve(null);
        },
        error: (error: Error) => {
          console.error('Error fetching profile:', error);
          subscription.unsubscribe();
          resolve(null);
        },
      });

      // Timeout
      setTimeout(() => {
        subscription.unsubscribe();
        resolve(null);
      }, 5000);
    });
  }

  /**
   * Fetch role tag from profile event (Kind 0)
   */
  async fetchProfileRoleTag(pubkey: string): Promise<string | null> {
    if (!this.eventStore) {
      throw new Error('RelayService not initialized. Call initialize() with an EventStore instance.');
    }

    return new Promise((resolve) => {
      const filter = {
        kinds: [0],
        authors: [pubkey],
        limit: 1,
      };

      const eventStore = this.eventStore as any;
      if (!eventStore || typeof eventStore.query !== 'function') {
        resolve(null);
        return;
      }
      const subscription = eventStore.query(filter).subscribe({
        next: (packet: any) => {
          if (packet?.event && packet.event.kind === 0) {
            const tags = packet.event.tags || [];
            for (const tag of tags) {
              if (tag[0] === 'role' && tag[1]) {
                subscription.unsubscribe();
                resolve(tag[1]);
                return;
              }
            }
            subscription.unsubscribe();
            resolve(null);
          }
        },
        complete: () => {
          subscription.unsubscribe();
          resolve(null);
        },
        error: (error: Error) => {
          console.error('Error fetching profile role tag:', error);
          subscription.unsubscribe();
          resolve(null);
        },
      });

      setTimeout(() => {
        subscription.unsubscribe();
        resolve(null);
      }, 5000);
    });
  }

  /**
   * Fetch a follow list (Kind 3 event)
   */
  async fetchFollowList(pubkey: string): Promise<FollowEntry[]> {
    if (!this.eventStore) {
      throw new Error('RelayService not initialized. Call initialize() with an EventStore instance.');
    }

    return new Promise((resolve) => {
      const filter = {
        kinds: [3],
        authors: [pubkey],
        limit: 1,
      };

      const eventStore = this.eventStore as any;
      if (!eventStore || typeof eventStore.query !== 'function') {
        resolve([]);
        return;
      }
      const subscription = eventStore.query(filter).subscribe({
        next: (packet: any) => {
          if (packet?.event && packet.event.kind === 3) {
            const followList: FollowEntry[] = [];
            const tags = packet.event.tags || [];

            for (const tag of tags) {
              if (tag[0] === 'p' && tag[1]) {
                followList.push({
                  pubkey: tag[1],
                  relay: tag[2] || undefined,
                  petname: tag[3] || undefined,
                });
              }
            }

            subscription.unsubscribe();
            resolve(followList);
          }
        },
        complete: () => {
          subscription.unsubscribe();
          resolve([]);
        },
        error: (error: Error) => {
          console.error('Error fetching follow list:', error);
          subscription.unsubscribe();
          resolve([]);
        },
      });

      setTimeout(() => {
        subscription.unsubscribe();
        resolve([]);
      }, 10000);
    });
  }

  /**
   * Fetch multiple profiles in batch
   */
  async fetchMultipleProfiles(pubkeys: string[]): Promise<Map<string, ProfileMetadata>> {
    if (!this.eventStore) {
      throw new Error('RelayService not initialized. Call initialize() with an EventStore instance.');
    }

    if (pubkeys.length === 0) {
      return new Map();
    }

    return new Promise((resolve) => {
      const profiles = new Map<string, ProfileMetadata>();
      const filter = {
        kinds: [0],
        authors: pubkeys,
      };

      const eventStore = this.eventStore as any;
      if (!eventStore || typeof eventStore.query !== 'function') {
        resolve(new Map());
        return;
      }
      const subscription = eventStore.query(filter).subscribe({
        next: (packet: any) => {
          if (packet?.event && packet.event.kind === 0 && packet.event.pubkey) {
            try {
              const metadata = JSON.parse(packet.event.content) as ProfileMetadata;
              profiles.set(packet.event.pubkey, metadata);
            } catch (error) {
              console.error('Failed to parse profile metadata:', error);
            }
          }
        },
        complete: () => {
          subscription.unsubscribe();
          resolve(profiles);
        },
        error: (error: Error) => {
          console.error('Error fetching profiles:', error);
          subscription.unsubscribe();
          resolve(profiles);
        },
      });

      setTimeout(() => {
        subscription.unsubscribe();
        resolve(profiles);
      }, 1000);
    });
  }

  /**
   * Query kind 0 events (profiles) by pubkey
   * If pubkeys array is empty, fetches recent kind 0 events
   */
  async queryProfiles(pubkeys: string[] = [], limit = 100): Promise<Map<string, ProfileMetadata>> {
    if (!this.eventStore) {
      throw new Error('RelayService not initialized. Call initialize() with an EventStore instance.');
    }

    return new Promise((resolve) => {
      const profiles = new Map<string, { metadata: ProfileMetadata; timestamp: number }>();
      const filter: any = {
        kinds: [0],
        limit,
      };

      if (pubkeys.length > 0) {
        filter.authors = pubkeys;
      }

      const eventStore = this.eventStore as any;
      if (!eventStore || typeof eventStore.query !== 'function') {
        resolve(new Map());
        return;
      }
      const subscription = eventStore.query(filter).subscribe({
        next: (packet: any) => {
          if (packet?.event && packet.event.kind === 0 && packet.event.pubkey) {
            try {
              const metadata = JSON.parse(packet.event.content) as ProfileMetadata;
              const timestamp = packet.event.created_at || 0;
              const existing = profiles.get(packet.event.pubkey);
              if (!existing || timestamp > existing.timestamp) {
                profiles.set(packet.event.pubkey, { metadata, timestamp });
              }
            } catch (error) {
              console.error('Failed to parse profile metadata:', error);
            }
          }
        },
        complete: () => {
          subscription.unsubscribe();
          const result = new Map<string, ProfileMetadata>();
          profiles.forEach((value, pubkey) => {
            result.set(pubkey, value.metadata);
          });
          resolve(result);
        },
        error: (error: Error) => {
          console.error('Error querying profiles:', error);
          subscription.unsubscribe();
          const result = new Map<string, ProfileMetadata>();
          profiles.forEach((value, pubkey) => {
            result.set(pubkey, value.metadata);
          });
          resolve(result);
        },
      });

      setTimeout(() => {
        subscription.unsubscribe();
        const result = new Map<string, ProfileMetadata>();
        profiles.forEach((value, pubkey) => {
          result.set(pubkey, value.metadata);
        });
        resolve(result);
      }, 10000);
    });
  }

  /**
   * Publish or update a kind 3 event (follow list/contacts)
   */
  async publishFollowList(
    pubkey: string,
    followList: FollowEntry[],
    signEvent: (event: NostrEvent) => Promise<NostrEvent>
  ): Promise<boolean> {
    const tags: string[][] = followList.map((entry) => {
      const tag: string[] = ['p', entry.pubkey];
      if (entry.relay) {
        tag.push(entry.relay);
      }
      if (entry.petname) {
        tag.push(entry.petname);
      }
      return tag;
    });

    const event: NostrEvent = {
      kind: 3,
      content: '',
      created_at: Math.floor(Date.now() / 1000),
      tags,
    };

    const signedEvent = await signEvent(event);
    return await this.publishEvent(signedEvent);
  }
}

