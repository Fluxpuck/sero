import { ClientEvents } from 'discord.js';

export type Event = {
    name: keyof ClientEvents;
    once: boolean;
    execute: (...args: any[]) => void | Promise<void>;
}