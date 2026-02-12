import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User &
  Document & {
    // _id: Types.ObjectId;
    createdBy: Types.ObjectId;
  };

@Schema({ timestamps: true, collection: 'users', autoIndex: true })
export class User extends Document {
  @Prop({ required: true, index: true })
  firstName: string;

  @Prop({ required: true, index: true })
  lastName: string;

  @Prop({ required: false, index: true })
  image?: string;

  @Prop({
    sparse: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({
    required: function () {
      return !this.isOAuth;
    },
    minlength: 6,
  })
  password: string;

  @Prop({ required: false, select: false })
  plainPassword: string;

  @Prop({ default: false })
  isOAuth: boolean;

  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop()
  phoneNumber: number;

  @Prop({ required: false })
  region?: string;

  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  sector?: string;

  @Prop({ required: false })
  organisation?: string;

  @Prop({ required: false })
  gender?: string;

  @Prop({ required: false })
  ageRange?: string;

  @Prop({ default: false })
  receiveCommunications: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
