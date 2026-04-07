/**
 * Simple synchronous event bus – mock of Kafka/Service Bus dispatcher.
 * In production: replace publish() with Kafka producer or Azure Service Bus send().
 * Handlers run synchronously here for demo; production handlers are async consumers.
 */

import type { DomainEvent, DomainEventType } from "./eventTypes";
import { generateId } from "@/lib/data/store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (event: DomainEvent<any>) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventLog: DomainEvent<any>[] = [];
const handlers = new Map<DomainEventType, EventHandler[]>();

export const EventBus = {
  /** Subscribe a handler to an event type (simulates a Kafka consumer group). */
  subscribe<T extends object>(eventType: DomainEventType, handler: (event: DomainEvent<T>) => void): void {
    const existing = handlers.get(eventType) ?? [];
    handlers.set(eventType, [...existing, handler as EventHandler]);
  },

  /** Publish a domain event (simulates Kafka producer publish). */
  publish<T extends object>(
    eventType: DomainEventType,
    aggregateId: string,
    aggregateType: DomainEvent<T>["aggregateType"],
    payload: T,
    raisedBy?: string
  ): DomainEvent<T> {
    const event: DomainEvent<T> = {
      eventId: generateId("evt"),
      eventType,
      aggregateId,
      aggregateType,
      occurredAt: new Date().toISOString(),
      raisedBy,
      payload,
    };
    eventLog.push(event);
    const registered = handlers.get(eventType) ?? [];
    registered.forEach((h) => h(event));
    return event;
  },

  /** Retrieve event log for an aggregate (simulates event sourcing read). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEventsForAggregate(aggregateId: string): DomainEvent<any>[] {
    return eventLog.filter((e) => e.aggregateId === aggregateId);
  },

  /** Retrieve full event log (admin / debugging). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll(): DomainEvent<any>[] {
    return [...eventLog];
  },
};
