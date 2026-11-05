import mongoose, { Document, Schema } from 'mongoose';

export interface IRSVP extends Document {
  eventId: mongoose.Types.ObjectId;
  eventTitle: string;
  eventThumbnail: string;
  eventLocation: string;
  eventType: string;
  eventDate: Date;
  userEmail: string;
  userName: string;
  userPhoto?: string;
  joinedAt: Date;
}

const RSVPSchema: Schema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    eventTitle: {
      type: String,
      required: true,
    },
    eventThumbnail: {
      type: String,
      required: true,
    },
    eventLocation: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userPhoto: {
      type: String,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate RSVP for the same event by the same user
RSVPSchema.index({ eventId: 1, userEmail: 1 }, { unique: true });

export default mongoose.model<IRSVP>('RSVP', RSVPSchema);
