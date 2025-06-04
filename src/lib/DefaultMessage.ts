import { ChatMessageActions, Message, MessageCopyParams, MessageEvent, MessageHeaders, MessageMetadata, MessageReactions, MessageReactionSummaryEvent } from '@ably/chat';
import * as Ably from 'ably';

export interface DefaultMessageParams {
  serial: string;
  roomId: string;
  clientId: string;
  text: string;
  metadata: MessageMetadata;
  headers: MessageHeaders;
  action: ChatMessageActions;
  version: string;
  createdAt: Date;
  timestamp: Date;
  reactions: MessageReactions;
  operation?: Ably.Operation;
}

/**
 * DefaultMessage is a custom implementation of the Ably Message interface,
 * designed to provide a fully immutable, strongly-typed message object for chat systems.
 *
 * Based on the original Ably DefaultMessage:
 * https://github.com/ably/ably-chat-js/blob/b1529bb12581df2c7b37e9e3d1c566371f65f714/src/core/message.ts#L313
 *
 *
 * This class mimics the structure and behavior of Ably's internal DefaultMessage,
 * including support for message versioning, reactions, and metadata.
 *
 * - All properties are readonly and the object is deeply frozen after construction.
 * - Includes utility methods for comparing message versions, cloning, and copying.
 * - The `copy` method allows for safe creation of modified message instances.
 * - Throws if unsupported operations (like `with`) are called.
 *
 * Use this class when you need a message object with Ably-like semantics,
 * but cannot import Ably's internal DefaultMessage directly.
 */
export class DefaultMessage implements Message {
  public readonly serial: string;
  public readonly roomId: string;
  public readonly clientId: string;
  public readonly text: string;
  public readonly metadata: MessageMetadata;
  public readonly headers: MessageHeaders;
  public readonly action: ChatMessageActions;
  public readonly version: string;
  public readonly createdAt: Date;
  public readonly timestamp: Date;
  public readonly reactions: MessageReactions;
  public readonly operation?: Ably.Operation;

  constructor({ serial, roomId, clientId, text, metadata, headers, action, version, createdAt, timestamp, reactions, operation }: DefaultMessageParams) {
    this.serial = serial;
    this.roomId = roomId;
    this.clientId = clientId;
    this.text = text;
    this.metadata = metadata;
    this.headers = headers;
    this.action = action;
    this.version = version;
    this.createdAt = createdAt;
    this.timestamp = timestamp;
    this.reactions = reactions;
    this.operation = operation;
    // The object is frozen after constructing to enforce readonly at runtime too
    Object.freeze(this.reactions);
    Object.freeze(this.reactions.multiple);
    Object.freeze(this.reactions.distinct);
    Object.freeze(this.reactions.unique);
    Object.freeze(this);
  }

  get isUpdated(): boolean {
    return this.action === ChatMessageActions.MessageUpdate;
  }

  get isDeleted(): boolean {
    return this.action === ChatMessageActions.MessageDelete;
  }

  get updatedBy(): string | undefined {
    return this.isUpdated ? this.operation?.clientId : undefined;
  }

  get deletedBy(): string | undefined {
    return this.isDeleted ? this.operation?.clientId : undefined;
  }

  get updatedAt(): Date | undefined {
    return this.isUpdated ? this.timestamp : undefined;
  }

  get deletedAt(): Date | undefined {
    return this.isDeleted ? this.timestamp : undefined;
  }

  isOlderVersionOf(message: Message): boolean {
    if (!this.equal(message)) {
      return false;
    }

    return this.version < message.version;
  }

  isNewerVersionOf(message: Message): boolean {
    if (!this.equal(message)) {
      return false;
    }

    return this.version > message.version;
  }

  isSameVersionAs(message: Message): boolean {
    if (!this.equal(message)) {
      return false;
    }

    return this.version === message.version;
  }

  before(message: Message): boolean {
    return this.serial < message.serial;
  }

  after(message: Message): boolean {
    return this.serial > message.serial;
  }

  equal(message: Message): boolean {
    return this.serial === message.serial;
  }

  isSameAs(message: Message): boolean {
    return this.equal(message);
  }

  with(_event: Message | MessageEvent | MessageReactionSummaryEvent): Message {
    throw new Ably.ErrorInfo('DefaultMessage does not support with() method' + _event, 40000, 400);
  }

  /**
   * Get the latest message version, based on the event.
   * If "this" is the latest version, return "this", otherwise clone the message and apply the reactions.
   *
   * @param message The message to get the latest version of
   * @returns The latest message version
   */
  private _getLatestMessageVersion(message: Message): Message {
    // message event (update or delete)
    if (message.serial !== this.serial) {
      throw new Ably.ErrorInfo('cannot apply event for a different message', 40000, 400);
    }

    // event is older, keep this instead
    if (this.version >= message.version) {
      return this;
    }

    // event is newer, copy reactions from this and make new message from event
    // TODO: This ignores summaries being newer on the message passed in, and is something we need to address
    return DefaultMessage._clone(message, { reactions: this.reactions });
  }

  // Clone a message, optionally replace the given fields
  private static _clone(source: Message, replace?: Partial<Message>): DefaultMessage {
    return new DefaultMessage({
      serial: replace?.serial ?? source.serial,
      roomId: replace?.roomId ?? source.roomId,
      clientId: replace?.clientId ?? source.clientId,
      text: replace?.text ?? source.text,
      metadata: replace?.metadata ?? structuredClone(source.metadata),
      headers: replace?.headers ?? structuredClone(source.headers),
      action: replace?.action ?? source.action,
      version: replace?.version ?? source.version,
      createdAt: replace?.createdAt ?? source.createdAt,
      timestamp: replace?.timestamp ?? source.timestamp,
      reactions: replace?.reactions ?? structuredClone(source.reactions),
      operation: replace?.operation ?? structuredClone(source.operation),
    });
  }

  copy(params: MessageCopyParams = {}): Message {
    return DefaultMessage._clone(this, params);
  }
}
