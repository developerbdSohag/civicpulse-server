import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  eventType: string;
  thumbnail: string;
  location: string;
  eventDate: Date;
  targetVolunteers: number;
  creatorEmail: string;
  creatorName: string;
  creatorPhoto?: string;
  attendeesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['Cleanup', 'Plantation', 'Donation', 'Healthcare', 'Education', 'Relief Aid', 'Winter Drive', 'Food Aid', 'Other'],
      default: 'Donation',
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail image URL is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    targetVolunteers: {
      type: Number,
      default: 50,
      min: [1, 'Target volunteers must be at least 1'],
    },
    creatorEmail: {
      type: String,
      required: [true, 'Creator email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    creatorName: {
      type: String,
      required: [true, 'Creator name is required'],
      trim: true,
    },
    creatorPhoto: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    },
    attendeesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly query upcoming events sorted by date
EventSchema.index({ eventDate: 1 });

export default mongoose.model<IEvent>('Event', EventSchema);
